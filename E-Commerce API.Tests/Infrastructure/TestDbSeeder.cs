using E_Commerce_API;
using E_Commerce_API.Models;

namespace E_Commerce_API.Tests.Infrastructure;

public static class TestDbSeeder
{
    public static void Seed(ECommerceDb db)
    {
        // Clean existing records if any
        db.OrderItems.RemoveRange(db.OrderItems);
        db.Orders.RemoveRange(db.Orders);
        db.Products.RemoveRange(db.Products);
        db.Categories.RemoveRange(db.Categories);
        db.Users.RemoveRange(db.Users);
        db.SaveChanges();

        // 1. Seed Categories
        var techCategory = new Category { Name = "Technology" };
        var fashionCategory = new Category { Name = "Fashion" };
        db.Categories.AddRange(techCategory, fashionCategory);
        db.SaveChanges();

        // 2. Seed Products
        var laptop = new Product
        {
            Name = "Gaming Laptop",
            Description = "High performance laptop",
            Price = 1200.00m,
            Stock = 10,
            ImageUrl = "https://example.com/laptop.png",
            CategoryId = techCategory.Id,
            CreatedAt = DateTime.UtcNow
        };
        var shirt = new Product
        {
            Name = "Cotton T-Shirt",
            Description = "Comfortable plain t-shirt",
            Price = 25.00m,
            Stock = 50,
            ImageUrl = "https://example.com/shirt.png",
            CategoryId = fashionCategory.Id,
            CreatedAt = DateTime.UtcNow
        };
        db.Products.AddRange(laptop, shirt);

        // 3. Seed Users
        var adminUser = new User
        {
            Name = "Admin User",
            Email = "admin@ecommerce.com",
            Password = "adminpassword123",
            Role = "admin"
        };
        var customerUser = new User
        {
            Name = "Regular Customer",
            Email = "customer@ecommerce.com",
            Password = "customerpassword123",
            Role = "customer"
        };
        db.Users.AddRange(adminUser, customerUser);

        db.SaveChanges();
    }
}
