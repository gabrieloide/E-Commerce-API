using E_Commerce_API.Models;
using Stripe.Checkout;

namespace E_Commerce_API.Services
{
    public class PaymentService
    {
        public async Task<string> CreateCheckoutSessionAsync(Order order)
        {
            var lineItems = new List<SessionLineItemOptions>();

            foreach(var item in order.Items)
            {
                lineItems.Add(new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = (long)(item.UnitPrice * 100),
                        Currency = "usd",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = item.Product?.Name ?? $"Product #{item.ProductId}"
                        }
                    },
                    Quantity = item.Quantity
                });
            }
            var options = new SessionCreateOptions
            {
                LineItems = lineItems,
                Mode = "payment",
                SuccessUrl = $"http://localhost:5173/?success=true&orderId={order.Id}",
                CancelUrl = "http://localhost:5173/?canceled=true"
            };
            var service = new SessionService();
            Session session = await service.CreateAsync(options);
            return session.Url;
              
        }
    }
}
