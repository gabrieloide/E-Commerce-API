using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using E_Commerce_API.Models;
using E_Commerce_API.Options;
using E_Commerce_API.Services;

namespace E_Commerce_API.Tests.Unit;

public class TokenServiceTests
{
    [Fact]
    public void GenerateToken_WithValidUser_CreatesValidJwtWithClaims()
    {
        var jwtOptions = new JwtOptions
        {
            key = "super_secret_testing_key_1234567890_abcdef",
            issuer = "test-issuer",
            audience = "test-audience"
        };
        var tokenService = new TokenService(jwtOptions);

        var testUser = new User
        {
            Id = 42,
            Name = "John Tester",
            Email = "tester@domain.com",
            Role = "admin"
        };

        var tokenString = tokenService.GenerateToken(testUser);

        Assert.False(string.IsNullOrWhiteSpace(tokenString));

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(tokenString);

        Assert.Equal("test-issuer", jwtToken.Issuer);
        Assert.Contains(jwtToken.Audiences, a => a == "test-audience");

        var idClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid");
        var roleClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");
        var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email || c.Type == "email");

        Assert.NotNull(idClaim);
        Assert.Equal("42", idClaim.Value);
        Assert.NotNull(roleClaim);
        Assert.Equal("admin", roleClaim.Value);
        Assert.NotNull(emailClaim);
        Assert.Equal("tester@domain.com", emailClaim.Value);
    }
}
