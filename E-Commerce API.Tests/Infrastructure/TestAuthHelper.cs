using System.Net.Http.Headers;
using System.Net.Http.Json;
using EcommerceApi.Models;

namespace E_Commerce_API.Tests.Infrastructure;

public static class TestAuthHelper
{
    public static async Task<string> AuthenticateAsync(HttpClient client, string email, string password)
    {
        var loginDto = new LoginDto(email, password);
        var response = await client.PostAsJsonAsync("/api/auth/login", loginDto);
        response.EnsureSuccessStatusCode();

        var authResult = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        if (authResult == null || string.IsNullOrEmpty(authResult.Token))
        {
            throw new InvalidOperationException("Failed to obtain authentication token in test.");
        }

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authResult.Token);
        return authResult.Token;
    }
}
