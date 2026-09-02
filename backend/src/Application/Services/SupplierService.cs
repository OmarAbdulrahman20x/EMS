using Microsoft.EntityFrameworkCore;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Entities;
using TechERP.Infrastructure.Data;

namespace TechERP.Application.Services;

public class SupplierService : ISupplierService
{
    private readonly AppDbContext _context;

    public SupplierService(AppDbContext context) => _context = context;

    public async Task<PaginatedResponse<SupplierDto>> GetSuppliersAsync(QueryParams qp, string? status = null, string? city = null)
    {
        var query = _context.Suppliers.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(qp.Search))
        {
            var lower = qp.Search.ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(lower) || s.ContactPerson.ToLower().Contains(lower) || s.Phone.Contains(lower) || s.Email.ToLower().Contains(lower));
        }
        if (!string.IsNullOrEmpty(status) && status != "all") query = query.Where(s => s.IsActive == (status == "active"));
        if (!string.IsNullOrEmpty(city) && city != "all") query = query.Where(s => s.City == city);

        var total = await query.CountAsync();
        var suppliers = await query.OrderByDescending(s => s.CreatedAt).Skip((qp.Page - 1) * qp.PageSize).Take(qp.PageSize).ToListAsync();
        var dtos = suppliers.Select(MapToDto).ToList();

        foreach (var dto in dtos)
            dto.ProductCount = await _context.Products.CountAsync(p => p.SupplierId == dto.Id);

        return new PaginatedResponse<SupplierDto> { Data = dtos, Total = total, Page = qp.Page, PageSize = qp.PageSize, TotalPages = (int)Math.Ceiling((double)total / qp.PageSize) };
    }

    public async Task<SupplierDto?> GetSupplierByIdAsync(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        return supplier == null ? null : MapToDto(supplier);
    }

    public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto)
    {
        var supplier = new Supplier
        {
            Name = dto.Name, ContactPerson = dto.ContactPerson, Phone = dto.Phone,
            Email = dto.Email, City = dto.City, Address = dto.Address,
            IsActive = true, CreatedAt = DateTime.UtcNow,
        };
        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();
        return MapToDto(supplier);
    }

    public async Task<SupplierDto> UpdateSupplierAsync(int id, UpdateSupplierDto dto)
    {
        var supplier = await _context.Suppliers.FindAsync(id) ?? throw new KeyNotFoundException("Supplier not found");
        supplier.Name = dto.Name; supplier.ContactPerson = dto.ContactPerson; supplier.Phone = dto.Phone;
        supplier.Email = dto.Email; supplier.City = dto.City; supplier.Address = dto.Address;
        supplier.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapToDto(supplier);
    }

    public async Task<SupplierDto> UpdateSupplierStatusAsync(int id, string status)
    {
        var supplier = await _context.Suppliers.FindAsync(id) ?? throw new KeyNotFoundException("Supplier not found");
        supplier.IsActive = status == "active";
        supplier.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapToDto(supplier);
    }

    internal static SupplierDto MapToDto(Supplier s) => new()
    {
        Id = s.Id, Name = s.Name, ContactPerson = s.ContactPerson, Phone = s.Phone,
        Email = s.Email, City = s.City, Address = s.Address,
        Status = s.IsActive ? "active" : "inactive", CreatedAt = s.CreatedAt,
    };
}
