using System.Net;
using System.Net.Http.Json;
using EcommerceApi.Models;
using E_Commerce_API.Tests.Infrastructure;

namespace E_Commerce_API.Tests.Integration;

public class AuthTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AuthTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.InitializeDatabase();
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsCreated()
    {
        var registerDto = new RegisterDto(
            "New User",
            "unique.newuser@ecommerce.com",
            "password123",
            "customer"
        );

        var response = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithExistingEmail_ReturnsConflict()
    {
        var registerDto = new RegisterDto(
            "Customer Clone",
            "customer@ecommerce.com",
            "password123",
            "customer"
        );

        var response = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithMissingFields_ReturnsBadRequest()
    {
        var registerDto = new RegisterDto(
            "",
            "",
            "",
            "customer"
        );

        var response = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokenAndUser()
    {
        var loginDto = new LoginDto("customer@ecommerce.com", "customerpassword123");

        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var authData = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(authData);
        Assert.False(string.IsNullOrEmpty(authData.Token));
        Assert.Equal("customer@ecommerce.com", authData.User.Email);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        var loginDto = new LoginDto("customer@ecommerce.com", "wrongpassword");

        var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
