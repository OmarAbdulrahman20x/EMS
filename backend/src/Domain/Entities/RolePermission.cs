namespace TechERP.Domain.Entities;

public class RolePermission
{
    public int RoleID { get; set; }
    public int PermissionID { get; set; }

    // Navigation
    public Role? Role { get; set; }
    public Permission? Permission { get; set; }
}
