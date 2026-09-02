using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Entities;
using TechERP.Infrastructure.Data;

namespace TechERP.Application.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly PasswordHasher<User> _hasher = new();

    public UserService(AppDbContext context) => _context = context;

    public async Task<PaginatedResponse<UserDto>> GetUsersAsync(QueryParams qp, int? roleId = null, string? status = null)
    {
        var query = _context.Users.Include(u => u.Role).AsNoTracking();

        if (!string.IsNullOrWhiteSpace(qp.Search))
        {
            var lower = qp.Search.ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(lower) ||
                                    u.Username.ToLower().Contains(lower) ||
                                    u.Email.ToLower().Contains(lower));
        }
        if (roleId.HasValue) query = query.Where(u => u.RoleId == roleId.Value);
        if (!string.IsNullOrEmpty(status) && status != "all")
            query = query.Where(u => u.IsActive == (status == "active"));

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((qp.Page - 1) * qp.PageSize)
            .Take(qp.PageSize)
            .Select(u => AuthService.MapToDto(u))
            .ToListAsync();

        return new PaginatedResponse<UserDto>
        {
            Data = items, Total = total, Page = qp.Page, PageSize = qp.PageSize,
            TotalPages = (int)Math.Ceiling((double)total / qp.PageSize),
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
        return user == null ? null : AuthService.MapToDto(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        var user = new User
        {
            FullName = dto.FullName,
            Username = dto.Username,
            Email = dto.Email,
            Phone = dto.Phone,
            RoleId = dto.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };
        user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return AuthService.MapToDto(user);
    }

    public async Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto)
    {
        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id)
            ?? throw new KeyNotFoundException("User not found");

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.Phone = dto.Phone;
        user.RoleId = dto.RoleId;
        user.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(dto.Password))
            user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        await _context.SaveChangesAsync();
        return AuthService.MapToDto(user);
    }

    public async Task<UserDto> UpdateUserStatusAsync(int id, bool isActive)
    {
    var user = await _context.Users
        .Include(u => u.Role)
        .FirstOrDefaultAsync(u => u.Id == id)
        ?? throw new KeyNotFoundException("User not found");

    user.IsActive = isActive;
    user.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return AuthService.MapToDto(user);
    }  
}
