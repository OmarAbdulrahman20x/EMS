namespace TechERP.Domain.Entities;

public class OrderItem
{
    public int OrderItemID  { get; set; }
    public int Id { get => OrderItemID; set => OrderItemID = value; }
    public int OrderID  { get; set; }
    public int OrderId { get => OrderID; set => OrderID = value; }
    public int ProductID { get; set; }
    public int ProductId { get => ProductID; set => ProductID = value; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }

    // Navigation
    public Order? Order { get; set; }
    public Product? Product { get; set; }
}
