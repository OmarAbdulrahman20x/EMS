namespace TechERP.Domain.Entities;

public class Role
{
    public int RoleID { get; set; }
    public int Id { get => RoleID; set => RoleID = value; }
    public string RoleName { get; set; } = string.Empty;
    public string Name { get => RoleName; set => RoleName = value; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
