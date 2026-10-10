using System.Data.Common;
using E_Commerce_API;
using E_Commerce_API.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace E_Commerce_API.Tests.Infrastructure;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private DbConnection? _connection;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var dbDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ECommerceDb>));
            if (dbDescriptor != null)
            {
                services.Remove(dbDescriptor);
            }

            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            services.AddDbContext<ECommerceDb>(options =>
            {
                options.UseSqlite(_connection);
            });

            services.RemoveAll<PaymentService>();
            services.AddScoped<PaymentService, FakePaymentService>();
        });
    }

    public void InitializeDatabase()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ECommerceDb>();
        db.Database.EnsureCreated();
        TestDbSeeder.Seed(db);
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        _connection?.Dispose();
    }
}
