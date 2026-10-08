namespace EcommerceApi.Models;

public record UserDto(
    int Id,
    string Name,
    string Email,
    string Role
);
