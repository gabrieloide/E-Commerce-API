namespace EcommerceApi.Models;

public record UpdateProductDto(
    string? Name,
    string? Description,
    decimal? Price,
    int? Stock,
    string? Category,
    string? ImageUrl
);
