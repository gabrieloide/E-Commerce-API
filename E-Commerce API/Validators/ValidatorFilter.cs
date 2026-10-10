using FluentValidation;

namespace E_Commerce_API.Validators
{
    public class ValidatorFilter<T> : IEndpointFilter
    {
        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var validator = context.HttpContext.RequestServices.GetService<IValidator<T>>();
            if (validator is not null)
            {
                var entity = context.Arguments.OfType<T>().FirstOrDefault();
                if (entity is not null)
                {
                    var validationResult = await validator.ValidateAsync(entity);
                    if (!validationResult.IsValid)
                    { 
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }
                }
            }
            return await next(context);
        }
    }
}