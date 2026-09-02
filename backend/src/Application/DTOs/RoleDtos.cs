namespace TechERP.Application.DTOs;

public class RoleDto
{
    public int RoleID { get; set; }
    public int Id { get => RoleID; set => RoleID = value; }
    public string RoleName { get; set; } = string.Empty;
    public string Name { get => RoleName; set => RoleName = value; }
    public string? Description { get; set; }
    public IReadOnlyList<string> Permissions { get; set; } = new List<string>();
    public int UserCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRoleDto
{
    public string RoleName { get; set; } = string.Empty;
    public string Name { get => RoleName; set => RoleName = value; }
    public string? Description { get; set; }
    public IReadOnlyList<string> Permissions { get; set; } = new List<string>();
}

public class UpdateRoleDto
{
    public string RoleName { get; set; } = string.Empty;
    public string Name { get => RoleName; set => RoleName = value; }
    public string? Description { get; set; }
    public IReadOnlyList<string> Permissions { get; set; } = new List<string>();
}
