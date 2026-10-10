using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using E_Commerce_API.Models;
using E_Commerce_API.Tests.Infrastructure;
using EcommerceApi.Models;

namespace E_Commerce_API.Tests.Integration;

public class CheckoutTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public CheckoutTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.InitializeDatabase();
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Checkout_WithoutAuthentication_ReturnsUnauthorized()
    {
        var products = await _client.GetFromJsonAsync<List<Product>>("/api/products");
        Assert.NotNull(products);
        var targetProduct = products.First();

        var request = new CheckoutRequestDto(
            new List<CheckoutItemDto> { new(targetProduct.Id, 1) },
            new ShippingAddressDto("John Doe", "123 Main St", "City", "10001", "US", "NY")
        );

        var response = await _client.PostAsJsonAsync("/api/checkout", request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Checkout_WithEmptyItems_ReturnsBadRequest()
    {
        await TestAuthHelper.AuthenticateAsync(_client, "customer@ecommerce.com", "customerpassword123");

        var request = new CheckoutRequestDto(
            new List<CheckoutItemDto>(),
            new ShippingAddressDto("John Doe", "123 Main St", "City", "10001", "US", "NY")
        );

        var response = await _client.PostAsJsonAsync("/api/checkout", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Checkout_WithInsufficientStock_ReturnsBadRequest()
    {
        await TestAuthHelper.AuthenticateAsync(_client, "customer@ecommerce.com", "customerpassword123");

        var products = await _client.GetFromJsonAsync<List<Product>>("/api/products");
        Assert.NotNull(products);
        var targetProduct = products.First();

        // Requesting more units than currently in stock
        var request = new CheckoutRequestDto(
            new List<CheckoutItemDto> { new(targetProduct.Id, targetProduct.Stock + 999) },
            new ShippingAddressDto("John Doe", "123 Main St", "City", "10001", "US", "NY")
        );

        var response = await _client.PostAsJsonAsync("/api/checkout", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Checkout_WithValidItems_ReturnsOkAndDeductsStock()
    {
        await TestAuthHelper.AuthenticateAsync(_client, "customer@ecommerce.com", "customerpassword123");

        var products = await _client.GetFromJsonAsync<List<Product>>("/api/products");
        Assert.NotNull(products);
        var targetProduct = products.First(p => p.Stock >= 2);
        var originalStock = targetProduct.Stock;

        var request = new CheckoutRequestDto(
            new List<CheckoutItemDto> { new(targetProduct.Id, 2) },
            new ShippingAddressDto("Jane Doe", "456 Elm St", "Metropolis", "10002", "US", "NY")
        );

        var response = await _client.PostAsJsonAsync("/api/checkout", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(json.TryGetProperty("checkoutUrl", out var checkoutUrl));
        Assert.Contains("stripe.com", checkoutUrl.GetString());

        // Verify stock deduction in database
        var productResponse = await _client.GetAsync($"/api/products/{targetProduct.Id}");
        var updatedProduct = await productResponse.Content.ReadFromJsonAsync<Product>();
        Assert.NotNull(updatedProduct);
        Assert.Equal(originalStock - 2, updatedProduct.Stock);
    }

    [Fact]
    public async Task GetOrders_WhenAuthenticated_ReturnsOkWithOrderList()
    {
        await TestAuthHelper.AuthenticateAsync(_client, "customer@ecommerce.com", "customerpassword123");

        var products = await _client.GetFromJsonAsync<List<Product>>("/api/products");
        Assert.NotNull(products);
        var targetProduct = products.First(p => p.Stock >= 1);

        // Execute checkout first to guarantee order history exists
        var checkoutRequest = new CheckoutRequestDto(
            new List<CheckoutItemDto> { new(targetProduct.Id, 1) },
            new ShippingAddressDto("Jane Doe", "456 Elm St", "Metropolis", "10002", "US", "NY")
        );
        var checkoutResponse = await _client.PostAsJsonAsync("/api/checkout", checkoutRequest);
        Assert.Equal(HttpStatusCode.OK, checkoutResponse.StatusCode);

        // Fetch authenticated user's order history
        var ordersResponse = await _client.GetAsync("/api/checkout/orders");

        Assert.Equal(HttpStatusCode.OK, ordersResponse.StatusCode);
        var orders = await ordersResponse.Content.ReadFromJsonAsync<List<Order>>();
        Assert.NotNull(orders);
        Assert.NotEmpty(orders);
    }
}
