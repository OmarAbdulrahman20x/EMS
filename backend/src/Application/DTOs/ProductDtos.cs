namespace TechERP.Application.DTOs;

public class ProductDto
{
    public int ProductID { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public string SKU { get; set; } = string.Empty;

    public int CategoryID { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public int SupplierID { get; set; }

    public string SupplierName { get; set; } = string.Empty;

    public decimal PurchasePrice { get; set; }

    public decimal SellingPrice { get; set; }

    public int CurrentStock { get; set; }

    public bool IsActive { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}

public class CreateProductDto
{
    public string ProductName { get; set; } = string.Empty;

    public string SKU { get; set; } = string.Empty;

    public int CategoryID { get; set; }

    public int SupplierID { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal SellingPrice { get; set; }
}

public class UpdateProductDto
{
    public string ProductName { get; set; } = string.Empty;

    public string SKU { get; set; } = string.Empty;

    public int CategoryID { get; set; }

    public int SupplierID { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal SellingPrice { get; set; }

    public bool IsActive { get; set; } = true;

    public string Status { get; set; } = "active";
}