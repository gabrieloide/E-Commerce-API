namespace E_Commerce_API
{
    using E_Commerce_API.Models;
    using EcommerceApi.Models;
    using Microsoft.EntityFrameworkCore;

    public class ECommerceDb : DbContext
    {
        public ECommerceDb(DbContextOptions<ECommerceDb> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Checkouts { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

        }
    }
}
