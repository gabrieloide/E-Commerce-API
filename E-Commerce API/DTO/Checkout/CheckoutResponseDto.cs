namespace EcommerceApi.Models;

public record CheckoutResponseDto(
    string OrderId,
    string? CheckoutUrl,
    string Message
);
