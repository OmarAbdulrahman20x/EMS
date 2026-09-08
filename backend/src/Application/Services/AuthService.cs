using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Entities;
using TechERP.Infrastructure.Data;

namespace TechERP.Application.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
                .ThenInclude(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.UserName == loginDto.UserName || u.Email == loginDto.UserName);
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("Invalid username or password");

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, loginDto.Password);
        if (result == PasswordVerificationResult.Failed)
            throw new UnauthorizedAccessException("Invalid username or password");

        var permissions = user.Role?.RolePermissions
            .Select(rp => NormalizePermission(rp.Permission.PermissionName))
            .Distinct()
            .ToList() ?? new List<string>();
        var token = GenerateJwtToken(user, user.Role?.RoleName ?? "User", permissions);

        return new AuthResponseDto
        {
                UserID = user.UserID,
                FullName = user.FullName,
                UserName = user.UserName,
                Email = user.Email,
                Phone = user.Phone,
                RoleName = user.Role?.RoleName ?? "",
                Permissions = permissions,
                Token = token,
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users.Include(u => u.Role).AsNoTracking().FirstOrDefaultAsync(u => u.UserID == id);
        if (user == null) return null;
        return MapToDto(user);
    }

    public async Task<IReadOnlyList<string>> GetUserPermissionsAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
                .ThenInclude(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.UserID == userId);

        return user?.Role?.RolePermissions
            .Select(rp => NormalizePermission(rp.Permission.PermissionName))
            .Distinct()
            .ToList() ?? new List<string>();
    }

    private string GenerateJwtToken(User user, string role, IReadOnlyList<string> permissions)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new(ClaimTypes.Name, user.UserName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, role),
        };

        foreach (var perm in permissions)
            claims.Add(new Claim("permission", perm));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    internal static UserDto MapToDto(User user) => new()
{
    UserID = user.UserID,
    FullName = user.FullName,
    UserName = user.UserName,
    Email = user.Email,
    Phone = user.Phone,
    RoleID = user.RoleID,
    RoleName = user.Role?.RoleName ?? "",
    IsActive = user.IsActive,
    Status = user.IsActive ? "active" : "inactive",
    CreatedAt = user.CreatedAt,
};

    private static string NormalizePermission(string permission) => permission switch
    {
        "View Dashboard" => "dashboard.view",
        "View Users" => "users.manage",
        "Manage Users" => "users.manage",
        "Manage Roles" => "roles.manage",
        "View Customers" => "customers.view",
        "Manage Customers" => "customers.manage",
        "View Suppliers" => "suppliers.view",
        "Manage Suppliers" => "suppliers.manage",
        "View Categories" => "categories.view",
        "Manage Categories" => "categories.manage",
        "View Products" => "products.view",
        "Manage Products" => "products.manage",
        "View Orders" => "orders.view",
        "Manage Orders" => "orders.manage",
        "Create Orders" => "orders.create",
        "View Inventory" => "inventory.view",
        "Manage Inventory" => "inventory.manage",
        "View Sales Reports" => "reports.sales",
        "View Inventory Reports" => "reports.inventory",
        "View Product Reports" => "reports.products",
        "View Customer Reports" => "reports.customers",
        "Manage Settings" => "settings.manage",
        _ => permission,
    };
}
