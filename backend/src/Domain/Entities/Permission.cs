namespace TechERP.Domain.Entities;

public class Permission
{
    public int PermissionID { get; set; }
    public int Id { get => PermissionID; set => PermissionID = value; }
    public string PermissionName { get; set; } = string.Empty;
    public string Name { get => PermissionName; set => PermissionName = value; }
    public string? Description  { get; set; }
    public DateTime CreatedAt {get; set;}
    public DateTime UpdatedAt {get; set;}

    // Navigation
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
