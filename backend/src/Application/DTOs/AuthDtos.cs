namespace TechERP.Application.DTOs;

public class LoginDto
{
    public string UserName { get; set; } = string.Empty;
    public string Username { get => UserName; set => UserName = value; }
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public int UserID { get; set; }
    public int Id { get => UserID; set => UserID = value; }
    public string FullName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Username { get => UserName; set => UserName = value; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public string Role { get => RoleName; set => RoleName = value; }
    public IReadOnlyList<string> Permissions { get; set; } = new List<string>();
    public string Token { get; set; } = string.Empty;
}
