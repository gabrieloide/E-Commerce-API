using E_Commerce_API.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }      // A qué pedido pertenece
    public int ProductId { get; set; }    // Qué producto compró
    public int Quantity { get; set; }     // Cuántas unidades compró (ej. 2)
    public decimal UnitPrice { get; set; }// Precio al que lo compró en ESE momento (ej. $50)

    public Product Product { get; set; }
}