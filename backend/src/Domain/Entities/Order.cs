namespace TechERP.Domain.Entities;

public class Order
{
    public int OrderID { get; set; }
    public int Id { get => OrderID; set => OrderID = value; }
    public string OrderNumber {get; set;} = string.Empty;
    public int CustomerID { get; set; }
    public int CustomerId { get => CustomerID; set => CustomerID = value; }
    public int UserID { get; set; }
    public int UserId { get => UserID; set => UserID = value; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = "Pending";
    public decimal TotalAmount { get; set; }
    public decimal Total { get => TotalAmount; set => TotalAmount = value; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Customer? Customer { get; set; }
    public User? User { get; set; }
    public User? Employee { get => User; set => User = value; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
