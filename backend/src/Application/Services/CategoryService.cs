using Microsoft.EntityFrameworkCore;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Entities;
using TechERP.Infrastructure.Data;

namespace TechERP.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context) => _context = context;

    public async Task<PaginatedResponse<CategoryDto>> GetCategoriesAsync(QueryParams qp, string? status = null)
    {
        var query = _context.Categories.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(qp.Search))
        {
            var lower = qp.Search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(lower) || c.Description.ToLower().Contains(lower));
        }
        if (!string.IsNullOrEmpty(status) && status != "all") query = query.Where(c => c.IsActive == (status == "active"));

        var total = await query.CountAsync();
        var categories = await query.OrderByDescending(c => c.CreatedAt).Skip((qp.Page - 1) * qp.PageSize).Take(qp.PageSize).ToListAsync();
        var dtos = categories.Select(MapToDto).ToList();

        foreach (var dto in dtos)
            dto.ProductCount = await _context.Products.CountAsync(p => p.CategoryId == dto.Id);

        return new PaginatedResponse<CategoryDto> { Data = dtos, Total = total, Page = qp.Page, PageSize = qp.PageSize, TotalPages = (int)Math.Ceiling((double)total / qp.PageSize) };
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _context.Categories.AsNoTracking().ToListAsync();
        return categories.Select(MapToDto).ToList();
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        return category == null ? null : MapToDto(category);
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
    {
        var category = new Category { Name = dto.Name, Description = dto.Description, IsActive = true, CreatedAt = DateTime.UtcNow };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return MapToDto(category);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id) ?? throw new KeyNotFoundException("Category not found");
        category.Name = dto.Name; category.Description = dto.Description; category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapToDto(category);
    }

    public async Task<CategoryDto> UpdateCategoryStatusAsync(int id, string status)
    {
        var category = await _context.Categories.FindAsync(id) ?? throw new KeyNotFoundException("Category not found");
        category.IsActive = status == "active"; category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapToDto(category);
    }

    internal static CategoryDto MapToDto(Category c) => new()
    {
        Id = c.Id, Name = c.Name, Description = c.Description,
        Status = c.IsActive ? "active" : "inactive", CreatedAt = c.CreatedAt,
    };
}
