using E_Commerce_API.Models;
using E_Commerce_API.Services;
using EcommerceApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
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
                .RequireAuthorization();

            group.MapGet("/orders", GetOrders)
                .RequireAuthorization();
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
            if (request == null || request.Items == null || !request.Items.Any())
            {
                return Results.BadRequest("Invalid checkout request.");
            }
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

                product.Stock -= item.Quantity;
                totalAmount += product.Price * item.Quantity;

                order.Items.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });

            }

            var stripeUrl = await paymentServices.CreateCheckoutSessionAsync(order);


            order.UserId = userId;
            order.TotalAmount = totalAmount;

            db.Orders.Add(order);
            await db.SaveChangesAsync();
            return Results.Ok(new {
                OrderId = order.Id,
                CheckoutUrl = stripeUrl,
                Message = "Checkout successful."
            });
        }

    }
}
