using E_Commerce_API.Models;
using E_Commerce_API.Services;

namespace E_Commerce_API.Tests.Infrastructure;

public class FakePaymentService : PaymentService
{
    public override Task<string> CreateCheckoutSessionAsync(Order order)
    {
        return Task.FromResult($"https://checkout.stripe.com/c/pay/cs_test_mock_{order.Id}");
    }
}
