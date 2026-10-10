namespace E_Commerce_API.Endpoints
{
    using E_Commerce_API.Models;
    using EcommerceApi.Models;
    using Microsoft.EntityFrameworkCore;
    using E_Commerce_API.Services;
    using E_Commerce_API.Validators;

    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/auth");
            group.MapPost("/register", HandleRegister)
                .AddEndpointFilter<ValidatorFilter<RegisterDto>>();
            group.MapPost("/login", HandleLogin)
                .AddEndpointFilter<ValidatorFilter<LoginDto>>();
        }

        private static async Task<IResult> HandleRegister(RegisterDto dto, ECommerceDb db)
        {

            if (await db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                if (await db.Users.AnyAsync(u => u.Name == dto.Name))
                    return Results.BadRequest("User already exists.");

                return Results.Conflict("email already exists.");
            }

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = dto.Password,
                Role = dto.Role
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Created($"/api/users/{user.Id}", user);
        }
        private static async Task<IResult> HandleLogin(LoginDto dto, ECommerceDb db, TokenService tokenservice)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Password == dto.Password);
            if (user == null) return Results.Problem("Invalid email or password.", statusCode: 401);

            var token = tokenservice.GenerateToken(user);
            var userDto = new UserDto(user.Id, user.Name, user.Email, user.Role);

            return Results.Ok(new AuthResponseDto(token, userDto));
        }
    }
}
