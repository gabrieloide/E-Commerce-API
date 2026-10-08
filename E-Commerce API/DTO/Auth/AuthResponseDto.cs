namespace EcommerceApi.Models;

public record AuthResponseDto(
    string Token,
    UserDto User
);
