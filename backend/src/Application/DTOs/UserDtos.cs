namespace TechERP.Application.DTOs;

public class UserDto
{
    public int UserID { get; set; }
    public int Id { get => UserID; set => UserID = value; }
    public string FullName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Username { get => UserName; set => UserName = value; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int RoleID { get; set; }
    public int RoleId { get => RoleID; set => RoleID = value; }
    public string RoleName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string Status { get => IsActive ? "active" : "inactive"; set => IsActive = value == "active"; }
    public DateTime CreatedAt { get; set; }
}

public class CreateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Username { get => UserName; set => UserName = value; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int RoleID { get; set; }
    public int RoleId { get => RoleID; set => RoleID = value; }
    public string Password { get; set; } = string.Empty;
}

public class UpdateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int RoleID { get; set; }
    public int RoleId { get => RoleID; set => RoleID = value; }
    public string? Password { get; set; }
}

public class UpdateUserStatusDto
{
    public bool IsActive { get; set; }
}
