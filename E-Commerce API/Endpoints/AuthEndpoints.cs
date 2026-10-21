namespace E_Commerce_API.Endpoints
{
    using E_Commerce_API.Models;
    using EcommerceApi.Models;
    using Microsoft.AspNetCore.Identity;
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

        private static async Task<IResult> HandleRegister(RegisterDto dto, ECommerceDb db, IPasswordHasher<User> passwordHasher)
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
                Role = dto.Role
            };
            user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);

            db.Users.Add(user);
            await db.SaveChangesAsync();

            var userDto = new UserDto(user.Id, user.Name, user.Email, user.Role);
            return Results.Created($"/api/users/{user.Id}", userDto);
        }
        private static async Task<IResult> HandleLogin(LoginDto dto, ECommerceDb db, TokenService tokenservice, IPasswordHasher<User> passwordHasher)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return Results.Problem("Invalid email or password.", statusCode: 401);

            var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result == PasswordVerificationResult.Failed)
                return Results.Problem("Invalid email or password.", statusCode: 401);

            // The hasher's defaults got stronger since this hash was stored; upgrade it while we have the plain password.
            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);
                await db.SaveChangesAsync();
            }

            var token = tokenservice.GenerateToken(user);
            var userDto = new UserDto(user.Id, user.Name, user.Email, user.Role);

            return Results.Ok(new AuthResponseDto(token, userDto));
        }
    }
}
