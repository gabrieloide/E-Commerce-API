namespace E_Commerce_API.Endpoints
{
    using E_Commerce_API.Models;
    using EcommerceApi.Models;
    using Microsoft.EntityFrameworkCore;

    public static class AuthEndpoints
    {
        private const string CREATE_USER = "CreateUser";

        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/auth");
            group.MapPost("/register", HandleRegister);
            group.MapPost("/login", HandleLogin);
        }


        private static async Task<IResult> HandleRegister(RegisterDto dto, ECommerceDb db)
        {
            if (dto == null)
            {
                return Results.BadRequest();
            }
            if (string.IsNullOrEmpty(dto.Name) || string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Role))
            {
                return Results.BadRequest("Name, Email, and Role are required.");
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
            if (dto == null)
            {
                return Results.BadRequest();
            }
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
            {
                return Results.BadRequest("Email and Password are required.");
            }
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Password == dto.Password);
            if (user == null)
            {
                return Results.Problem("Invalid email or password.", statusCode: 401);
            }

            var userDTO = new UserDto(user.Id, user.Name, user.Email, user.Role);

            return Results.Ok(userDTO);
        }
    }
}
