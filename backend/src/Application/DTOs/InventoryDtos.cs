namespace TechERP.Application.DTOs;

public class InventorySummaryDto
{
    public int ProductID { get; set; }
    public int ProductId { get => ProductID; set => ProductID = value; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string ProductSku { get => SKU; set => SKU = value; }
    public int CurrentQuantity { get; set; }
    public string StockStatus { get; set; } = "in_stock";
    public string LastTransactionType { get; set; } = string.Empty;
    public DateTime? LastTransactionDate { get; set; }
}

public class InventoryTransactionDto
{
    public int TransactionID { get; set; }
    public int Id { get => TransactionID; set => TransactionID = value; }
    public int ProductID { get; set; }
    public int ProductId { get => ProductID; set => ProductID = value; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string ProductSku { get => SKU; set => SKU = value; }
    public string TransactionType { get; set; } = "IN";
    public string Type { get => TransactionType.ToLowerInvariant(); set => TransactionType = value.ToUpperInvariant(); }
    public int Quantity { get; set; }
    public string? ReferenceType { get; set; }
    public string? Reference { get => ReferenceType; set => ReferenceType = value; }
    public int? ReferenceID { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

public class CreateInventoryTransactionDto
{
    public int ProductID { get; set; }
    public int ProductId { get => ProductID; set => ProductID = value; }
    public string TransactionType { get; set; } = "IN";
    public string Type { get => TransactionType.ToLowerInvariant(); set => TransactionType = value.ToUpperInvariant(); }
    public int Quantity { get; set; }
    public string? ReferenceType { get; set; }
    public string? Reference { get => ReferenceType; set => ReferenceType = value; }
    public int? ReferenceID { get; set; }
    public string? Notes { get; set; }
}
