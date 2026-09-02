namespace TechERP.Domain.Entities;

public class Supplier
{
    public int SupplierID { get; set; }
    public int Id { get => SupplierID; set => SupplierID = value; }
    public string SupplierName { get; set; } = string.Empty;
    public string Name { get => SupplierName; set => SupplierName = value; }
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
