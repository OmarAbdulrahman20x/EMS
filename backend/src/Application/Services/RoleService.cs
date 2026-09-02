using Microsoft.EntityFrameworkCore;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Entities;
using TechERP.Infrastructure.Data;

namespace TechERP.Application.Services;

public class RoleService : IRoleService
{
    private readonly AppDbContext _context;

    public RoleService(AppDbContext context) => _context = context;

    public async Task<IReadOnlyList<RoleDto>> GetRolesAsync()
    {
        var roles = await _context.Roles
            .Include(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .Include(r => r.Users)
            .AsNoTracking()
            .ToListAsync();

        return roles.Select(MapToDto).ToList();
    }

    public async Task<RoleDto?> GetRoleByIdAsync(int id)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .Include(r => r.Users)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.RoleID == id);

        return role == null ? null : MapToDto(role);
    }

    public async Task<RoleDto> CreateRoleAsync(CreateRoleDto dto)
    {
        var role = new Role
        {
            RoleName = dto.RoleName,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var permissionName in dto.Permissions)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.PermissionName == permissionName);

            if (permission != null)
            {
                role.RolePermissions.Add(new RolePermission
                {
                    Permission = permission
                });
            }
        }

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        return MapToDto(role);
    }

    public async Task<RoleDto> UpdateRoleAsync(int id, UpdateRoleDto dto)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.RoleID == id)
            ?? throw new KeyNotFoundException("Role not found");

        role.RoleName = dto.RoleName;
        role.Description = dto.Description;
        role.UpdatedAt = DateTime.UtcNow;

        role.RolePermissions.Clear();

        foreach (var permissionName in dto.Permissions)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.PermissionName == permissionName);

            if (permission != null)
            {
                role.RolePermissions.Add(new RolePermission
                {
                    RoleID = role.RoleID,
                    PermissionID = permission.PermissionID
                });
            }
        }

        await _context.SaveChangesAsync();

        return MapToDto(role);
    }

    public async Task DeleteRoleAsync(int id)
    {
        var role = await _context.Roles.FindAsync(id)
            ?? throw new KeyNotFoundException("Role not found");

        if (role.RoleName == "Admin")
            throw new InvalidOperationException("The Admin role cannot be deleted");

        var hasUsers = await _context.Users.AnyAsync(u => u.RoleID == id);

        if (hasUsers)
            throw new InvalidOperationException("Cannot delete a role with assigned users");

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
    }

    private static RoleDto MapToDto(Role role) => new()
    {
        RoleID = role.RoleID,
        RoleName = role.RoleName,
        Description = role.Description,
        Permissions = role.RolePermissions
            .Select(rp => rp.Permission!.PermissionName)
            .ToList(),
        UserCount = role.Users.Count,
        CreatedAt = role.CreatedAt
    };
}