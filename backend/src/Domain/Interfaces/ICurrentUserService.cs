namespace TechERP.Domain.Interfaces;

public interface ICurrentUserService
{
    int UserId { get; }
    string Username { get; }
    string Role { get; }
    IReadOnlyList<string> Permissions { get; }
}