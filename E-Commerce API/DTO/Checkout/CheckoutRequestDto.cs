namespace EcommerceApi.Models;

public record CheckoutRequestDto(
    List<CheckoutItemDto> Items,
    ShippingAddressDto ShippingAddress
);
