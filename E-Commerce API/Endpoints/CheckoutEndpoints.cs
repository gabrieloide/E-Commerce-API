using E_Commerce_API.Models;
using E_Commerce_API.Services;
using E_Commerce_API.Validators;
using EcommerceApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Stripe;
using Stripe.Checkout;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;

namespace E_Commerce_API.Endpoints
{
    public static class CheckoutEndpoints
    {
        public static void MapCheckoutEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/checkout");

            group.MapPost("/", Checkout)
                .RequireAuthorization()
                .AddEndpointFilter<ValidatorFilter<CheckoutRequestDto>>();

            group.MapGet("/orders", GetOrders)
                .RequireAuthorization();

            group.MapPost("webhook", HandleStripeWebhook);
        }

        private static async Task<IResult> HandleStripeWebhook(HttpRequest request, ECommerceDb db, IConfiguration config)
        {
            var json = await new StreamReader(request.Body).ReadToEndAsync();

            var webhookSecret = config["Stripe:WebhookSecret"] ?? "your_webhook_secret";
            Event stripeEvent;
            try
            {
                stripeEvent = EventUtility.ConstructEvent(json, request.Headers["Stripe-Signature"], webhookSecret);

            }
            catch (Exception e)
            {
                return Results.BadRequest($"Webhook error: {e.Message}");
            }

            if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Session;

                if (session != null && int.TryParse(session.ClientReferenceId, out int orderId))
                {
                    var order = await db.Orders
                        .Include(o => o.Items)
                        .FirstOrDefaultAsync(o => o.Id == orderId);

                    if (order != null && order.Status == OrderStatus.Pending)
                    {
                        using var transaction = await db.Database.BeginTransactionAsync();
                        try
                        {
                            bool hasSufficientStock = true;
                            foreach (var item in order.Items)
                            {
                                int rowsAffected = await db.Products
                                    .Where(p => p.Id == item.ProductId && p.Stock >= item.Quantity)
                                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - item.Quantity));

                                if(rowsAffected == 0)
                                {
                                    hasSufficientStock = false;
                                    break;
                                }
                            }
                            if(hasSufficientStock)
                            {
                                order.Status = OrderStatus.Completed;
                                await db.SaveChangesAsync();
                                await transaction.CommitAsync();
                            }
                            else
                            {
                                await transaction.RollbackAsync();
                                order.Status = OrderStatus.Cancelled;
                                await db.SaveChangesAsync();
                            }
                        }
                        catch
                        {
                            await transaction.RollbackAsync();
                            throw;
                        }
                    }
                }
            }
            return Results.Ok();
        }

        public static async Task<IResult> GetOrders(ECommerceDb db, ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
            {
                return Results.Unauthorized();
            }
            var userId = int.Parse(userIdClaim);
            var orders = await db.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
                .ToListAsync();
            return Results.Ok(orders);
        }

        public static async Task<IResult> Checkout(CheckoutRequestDto request, ECommerceDb db, ClaimsPrincipal user, PaymentService paymentServices)
        {
            // Validate stock availability
            foreach (var item in request.Items)
            {
                var product = await db.Products.FindAsync(item.ProductId);
                if (product == null)
                {
                    return Results.NotFound($"Product with ID {item.ProductId} not found.");
                }
                if (product.Stock < item.Quantity)
                {
                    return Results.BadRequest($"Insufficient stock for product {product.Name}. Available: {product.Stock}, Requested: {item.Quantity}");
                }
            }
            // Deduct stock and create order
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = int.Parse(userIdClaim!);

            var order = new Order
            {
                CreatedAt = DateTime.UtcNow,
                ShippingAddress = $"{request.ShippingAddress.AddressLine1}, {request.ShippingAddress.City}, {request.ShippingAddress.State}, {request.ShippingAddress.PostalCode}",
                Items = new List<OrderItem>()
            };

            decimal totalAmount = 0;

            var lineItems = new List<SessionLineItemOptions>();

            foreach (var item in request.Items)
            {
                var product = await db.Products.FindAsync(item.ProductId);

                totalAmount += product.Price * item.Quantity;

                order.Items.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });

            }


            order.UserId = userId;
            order.TotalAmount = totalAmount;
            order.Status = OrderStatus.Pending;

            db.Orders.Add(order);
            await db.SaveChangesAsync();

            var stripeUrl = await paymentServices.CreateCheckoutSessionAsync(order);
            return Results.Ok(new {
                OrderId = order.Id,
                CheckoutUrl = stripeUrl,
                Message = "Checkout successful."
            });
        }

    }
}
