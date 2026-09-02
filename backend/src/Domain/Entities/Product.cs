namespace TechERP.Domain.Entities;

public class Product
{
    public int ProductID { get; set; }
    public int Id { get => ProductID; set => ProductID = value; }
    public string ProductName { get; set; } = string.Empty;
    public string Name { get => ProductName; set => ProductName = value; }
    public string SKU { get; set; } = string.Empty;
    public string Sku { get => SKU; set => SKU = value; }
    public int CategoryID { get; set; }
    public int CategoryId { get => CategoryID; set => CategoryID = value; }
    public int SupplierID { get; set; }
    public int SupplierId { get => SupplierID; set => SupplierID = value; }
    public decimal PurchasePrice { get; set; }
    public decimal SellingPrice { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Category? Category { get; set; }
    public Supplier? Supplier { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
}
