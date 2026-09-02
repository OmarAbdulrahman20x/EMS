namespace TechERP.Domain.Entities;

public class Customer
{
    public int CustomerID { get; set; }
    public int Id { get => CustomerID; set => CustomerID = value; }
    public string CustomerName { get; set; } = string.Empty;
    public string Name { get => CustomerName; set => CustomerName = value; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public string CustomerType { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
