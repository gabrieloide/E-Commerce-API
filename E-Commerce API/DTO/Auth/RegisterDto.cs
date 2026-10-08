namespace EcommerceApi.Models;

public record RegisterDto(
    string Name,
    string Email,
    string Password,
    string Role = "customer"
);
