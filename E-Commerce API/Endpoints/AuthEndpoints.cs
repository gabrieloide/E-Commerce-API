namespace E_Commerce_API.Endpoints
{
    using E_Commerce_API.Models;
    using EcommerceApi.Models;
    using Microsoft.EntityFrameworkCore;

    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/auth");
            group.MapPost("/register", HandleRegister);
            group.MapPost("/login", HandleLogin);
        }


        private static async Task<IResult> HandleRegister(RegisterDto dto, ECommerceDb db)
        {
            if (string.IsNullOrEmpty(dto.Name) || string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
            {
                return Results.BadRequest("Name, Email, and Password are required.");
            }

            if (await db.Users.AnyAsync(u => u.Email.Equals(dto.Email, StringComparison.CurrentCultureIgnoreCase)))
            {
                if(await db.Users.AnyAsync(u => u.Name == dto.Name)) 
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
        private static async Task<IResult> HandleLogin(LoginDto dto, ECommerceDb db)
        {
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
            {
                return Results.BadRequest("Email and Password are required.");
            }
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Password == dto.Password);
            if (user == null)
            {
                return Results.Problem("Invalid email or password.", statusCode: 401);
            }

            var userDto = new UserDto(user.Id, user.Name, user.Email, user.Role);

            return Results.Ok(userDto);
        }
    }
}
