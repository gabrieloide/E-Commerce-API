using EcommerceApi.Models;
using FluentValidation;

namespace E_Commerce_API.Validators
{
    public class CheckoutRequestDtoValidator : AbstractValidator<CheckoutRequestDto>
    {
        public CheckoutRequestDtoValidator()
        {
            RuleFor(x => x.Items)
                .NotEmpty().WithMessage("Cart items are required.")
                .Must(cartItems => cartItems.All(item => item.Quantity > 0)).WithMessage("All cart items must have a quantity greater than zero.");

            RuleForEach(x => x.Items).ChildRules(cartItem =>
            {
                cartItem.RuleFor(item => item.ProductId)
                    .GreaterThan(0).WithMessage("Product ID must be greater than zero.");
                cartItem.RuleFor(item => item.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");
            });

            RuleFor(x => x.ShippingAddress).NotNull();
            RuleFor(x => x.ShippingAddress.AddressLine1).NotEmpty().WithMessage("The address is required.");
            RuleFor(x => x.ShippingAddress.City).NotEmpty().WithMessage("The city is required.");
            RuleFor(x => x.ShippingAddress.PostalCode).NotEmpty().WithMessage("The postal code is required.");
        }
    }

}

