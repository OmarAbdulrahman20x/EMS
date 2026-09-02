namespace TechERP.Domain.Entities;

public class User
{
    public int UserID { get; set; }
    public int Id { get => UserID; set => UserID = value; }
    public string FullName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Username { get => UserName; set => UserName = value; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public int RoleID { get; set; }
    public int RoleId { get => RoleID; set => RoleID = value; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Role? Role { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
}
