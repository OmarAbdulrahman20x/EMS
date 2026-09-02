namespace TechERP.Application.DTOs;

public class ProductDto
{
    public int ProductID { get; set; }
    public int Id { get => ProductID; set => ProductID = value; }
    public string ProductName { get; set; } = string.Empty;
    public string Name { get => ProductName; set => ProductName = value; }
    public string SKU { get; set; } = string.Empty;
    public string Sku { get => SKU; set => SKU = value; }
    public int CategoryID { get; set; }
    public int CategoryId { get => CategoryID; set => CategoryID = value; }
    public string CategoryName { get; set; } = string.Empty;
    public int SupplierID { get; set; }
    public int SupplierId { get => SupplierID; set => SupplierID = value; }
    public string SupplierName { get; set; } = string.Empty;
    public decimal PurchasePrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int CurrentStock { get; set; }
    public bool IsActive { get; set; }
    public string Status { get => IsActive ? "active" : "inactive"; set => IsActive = value == "active"; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProductDto
{
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
}

public class UpdateProductDto
{
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
}
