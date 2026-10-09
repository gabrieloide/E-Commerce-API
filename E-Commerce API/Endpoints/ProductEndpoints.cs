using E_Commerce_API.Models;
using EcommerceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace E_Commerce_API.Endpoints
{
    public static class ProductEndpoints
    {
        public static void MapProductsEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/products");
            group.MapGet("/", GetAllProducts);
            group.MapGet("/{id:int}", GetProductById);

            //Admin-only endpoints
            group.MapPost("/", CreateProduct)
                .RequireAuthorization(policy => policy.RequireRole("admin"));

            group.MapPut("/{id:int}", UpdateProduct)
                .RequireAuthorization(policy => policy.RequireRole("admin"));
            group.MapDelete("/{id:int}", DeleteProduct)
                .RequireAuthorization(policy => policy.RequireRole("admin"));

        }

        public static async Task<IResult> GetAllProducts(
            ECommerceDb db,
            string? category,
            string? search)
        {
            var query = db.Products
                .AsNoTracking()
                .Include(p => p.CategoryNavigation)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(p => p.CategoryNavigation.Name.ToLower() == category.ToLower());
            }
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(term) || 
                                         p.Description.ToLower().Contains(term));
            }

            var products = await query.ToListAsync();
            return Results.Ok(products);
        }

        public static async Task<IResult> GetProductById(int id, ECommerceDb db)
        {
            var product = await db.Products.AsNoTracking().Include(p => p.CategoryNavigation).FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return Results.NotFound();
            return Results.Ok(product);
        }

        public static async Task<IResult> CreateProduct(CreateProductDto product, ECommerceDb db)
        {
            if (product == null) return Results.BadRequest();

            var category = await db.Categories.FirstOrDefaultAsync(c => c.Name == product.Category);

            var p = new Product
            {
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Stock = product.Stock,
                ImageUrl = product.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            if (category==null)
            {
                var newCategory = new Category { Name = product.Category };
                db.Categories.Add(newCategory);
                await db.SaveChangesAsync();
                p.CategoryId = newCategory.Id;

            }
            else
            {
                p.CategoryId = category.Id;

            }
                db.Products.Add(p);
            await db.SaveChangesAsync();
            return Results.Created($"/api/products/{p.Id}", p);
        }

        public static async Task<IResult> UpdateProduct(int id, Product updatedProduct, ECommerceDb db)
        {
            var product = await db.Products.FindAsync(id);
            if (product == null) return Results.NotFound();
            product.Name = updatedProduct.Name;
            product.Description = updatedProduct.Description;
            product.Price = updatedProduct.Price;
            product.Stock = updatedProduct.Stock;
            product.ImageUrl = updatedProduct.ImageUrl;
            product.CategoryId = updatedProduct.CategoryId;
            product.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok(product);
        }
        public static async Task<IResult> DeleteProduct(int id, ECommerceDb db)
        {
            var product = await db.Products.FindAsync(id);
            if (product == null) return Results.NotFound();
            db.Products.Remove(product);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }
    }
}
