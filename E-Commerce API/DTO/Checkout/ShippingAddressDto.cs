namespace EcommerceApi.Models;

public record ShippingAddressDto(
    string FullName,
    string AddressLine1,
    string City,
    string PostalCode,
    string Country
);
