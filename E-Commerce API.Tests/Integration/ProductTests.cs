using System.Net;
using System.Net.Http.Json;
using E_Commerce_API.Models;
using E_Commerce_API.Tests.Infrastructure;
using EcommerceApi.Models;

namespace E_Commerce_API.Tests.Integration;

public class ProductTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ProductTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.InitializeDatabase();
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllProducts_ReturnsOkWithProducts()
    {
        var response = await _client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var products = await response.Content.ReadFromJsonAsync<List<Product>>();
        Assert.NotNull(products);
        Assert.NotEmpty(products);
    }

    [Fact]
    public async Task GetProductById_WhenProductExists_ReturnsOk()
    {
        var allProducts = await _client.GetFromJsonAsync<List<Product>>("/api/products");
        Assert.NotNull(allProducts);
        Assert.NotEmpty(allProducts);
        var targetProduct = allProducts.First();

        var response = await _client.GetAsync($"/api/products/{targetProduct.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var product = await response.Content.ReadFromJsonAsync<Product>();
        Assert.NotNull(product);
        Assert.Equal(targetProduct.Id, product.Id);
    }

    [Fact]
    public async Task GetProductById_WhenProductDoesNotExist_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/products/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateProduct_WithoutAuthorization_ReturnsUnauthorized()
    {
        var newProduct = new CreateProductDto(
            "Unauthorized Item",
            "Should fail",
            10.0m,
            5,
            "Technology",
            "https://example.com/unauth.png"
        );

        var response = await _client.PostAsJsonAsync("/api/products", newProduct);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateProduct_WithCustomerRole_ReturnsForbidden()
    {
        await TestAuthHelper.AuthenticateAsync(_client, "customer@ecommerce.com", "customerpassword123");

        var newProduct = new CreateProductDto(
            "Forbidden Item",
            "Customer cannot create",
            10.0m,
            5,
            "Technology",
            "https://example.com/forbidden.png"
        );

        var response = await _client.PostAsJsonAsync("/api/products", newProduct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task CreateProduct_WithAdminRole_ReturnsCreated()
    {
        await TestAuthHelper.AuthenticateAsync(_client, "admin@ecommerce.com", "adminpassword123");

        var newProduct = new CreateProductDto(
            "Wireless Headphones",
            "Noise cancelling Bluetooth headphones",
            150.0m,
            25,
            "Technology",
            "https://example.com/headphones.png"
        );

        var response = await _client.PostAsJsonAsync("/api/products", newProduct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<Product>();
        Assert.NotNull(created);
        Assert.Equal("Wireless Headphones", created.Name);
    }

    [Fact]
    public async Task DeleteProduct_WithAdminRole_ReturnsNoContent()
    {
        await TestAuthHelper.AuthenticateAsync(_client, "admin@ecommerce.com", "adminpassword123");

        // Create a temporary product to ensure an item exists specifically for deletion
        var tempProduct = new CreateProductDto(
            "Item to delete",
            "Temporary item",
            19.99m,
            5,
            "Technology",
            "https://example.com/temp.png"
        );
        var createResponse = await _client.PostAsJsonAsync("/api/products", tempProduct);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<Product>();
        Assert.NotNull(created);

        var response = await _client.DeleteAsync($"/api/products/{created.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
