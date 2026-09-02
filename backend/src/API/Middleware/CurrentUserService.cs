using System.Security.Claims;
using TechERP.Domain.Interfaces;

namespace TechERP.API.Middleware;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public int UserId => int.Parse(User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    public string Username => User?.FindFirst(ClaimTypes.Name)?.Value ?? "";
    public string Role => User?.FindFirst(ClaimTypes.Role)?.Value ?? "";
    public IReadOnlyList<string> Permissions =>
        User?.FindAll("permission").Select(c => c.Value).ToList() ?? new List<string>();
}