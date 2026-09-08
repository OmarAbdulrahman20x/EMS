namespace TechERP.Application.DTOs;

public class LoginDto
{
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public int UserID { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public IReadOnlyList<string> Permissions { get; set; } = new List<string>();
    public string Token { get; set; } = string.Empty;
}
