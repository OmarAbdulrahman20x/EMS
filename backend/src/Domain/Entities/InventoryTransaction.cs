namespace TechERP.Domain.Entities;

public class InventoryTransaction
{
    public int TransactionID { get; set; }
    public int Id { get => TransactionID; set => TransactionID = value; }

    public int ProductID { get; set; }
    public int ProductId { get => ProductID; set => ProductID = value; }

    public int? UserID { get; set; }
    public int? UserId { get => UserID; set => UserID = value; }

    public string TransactionType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTime TransactionDate { get; set; }
    public string? ReferenceType { get; set; }
    public string? Reference { get => ReferenceType; set => ReferenceType = value; }
    public int? ReferenceID { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Product? Product { get; set; }
    public User? User { get; set; }

    public int? CreatedByUserId { get => UserID; set => UserID = value; }
    public User? CreatedByUser { get => User; set => User = value; }
}