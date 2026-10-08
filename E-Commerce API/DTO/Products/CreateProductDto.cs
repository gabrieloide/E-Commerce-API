namespace EcommerceApi.Models;

public record CreateProductDto(
    string Name,
    string Description,
    decimal Price,
    int Stock,
    string Category,
    string ImageUrl
);
