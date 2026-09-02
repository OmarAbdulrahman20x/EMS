using Microsoft.EntityFrameworkCore;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Entities;
using TechERP.Domain.Interfaces;
using TechERP.Infrastructure.Data;

namespace TechERP.Application.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;
    private readonly IProductRepository _repo;

    public ProductService(AppDbContext context, IProductRepository repo)
    {
        _context = context;
        _repo = repo;
    }

    public async Task<PaginatedResponse<ProductDto>> GetProductsAsync(QueryParams qp, int? categoryId = null, int? supplierId = null, string? status = null)
    {
        var products = await _repo.GetFilteredAsync(qp.Search, categoryId, supplierId, status, qp.SortBy, qp.SortOrder, qp.Page, qp.PageSize);
        var total = await _repo.GetFilteredCountAsync(qp.Search, categoryId, supplierId, status);

        var dtos = new List<ProductDto>();
        foreach (var p in products)
            dtos.Add(await MapToDtoAsync(p));

        return new PaginatedResponse<ProductDto> { Data = dtos, Total = total, Page = qp.Page, PageSize = qp.PageSize, TotalPages = (int)Math.Ceiling((double)total / qp.PageSize) };
    }

    public async Task<IReadOnlyList<ProductDto>> GetAllProductsAsync()
    {
        var products = await _context.Products.Include(p => p.Category).Include(p => p.Supplier).AsNoTracking().ToListAsync();
        var dtos = new List<ProductDto>();
        foreach (var p in products) dtos.Add(await MapToDtoAsync(p));
        return dtos;
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _context.Products.Include(p => p.Category).Include(p => p.Supplier).FirstOrDefaultAsync(p => p.Id == id);
        return product == null ? null : await MapToDtoAsync(product);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name, Sku = dto.Sku, CategoryId = dto.CategoryId, SupplierId = dto.SupplierId,
            PurchasePrice = dto.PurchasePrice, SellingPrice = dto.SellingPrice,
            IsActive = true, CreatedAt = DateTime.UtcNow,
        };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return await MapToDtoAsync(product);
    }

    public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto dto)
    {
        var product = await _context.Products.Include(p => p.Category).Include(p => p.Supplier).FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Product not found");
        product.Name = dto.Name; product.Sku = dto.Sku; product.CategoryId = dto.CategoryId;
        product.SupplierId = dto.SupplierId; product.PurchasePrice = dto.PurchasePrice;
        product.SellingPrice = dto.SellingPrice; product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return await MapToDtoAsync(product);
    }

    public async Task<ProductDto> UpdateProductStatusAsync(int id, string status)
    {
        var product = await _context.Products.FindAsync(id) ?? throw new KeyNotFoundException("Product not found");
        product.IsActive = status == "active"; product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return await MapToDtoAsync(product);
    }

    private async Task<ProductDto> MapToDtoAsync(Product p)
    {
        var stock = await _repo.GetCurrentStockAsync(p.Id);
        return new ProductDto
        {
            Id = p.Id, Name = p.Name, Sku = p.Sku, CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? "", SupplierId = p.SupplierId,
            SupplierName = p.Supplier?.Name ?? "", PurchasePrice = p.PurchasePrice,
            SellingPrice = p.SellingPrice, CurrentStock = stock,
            Status = p.IsActive ? "active" : "inactive", CreatedAt = p.CreatedAt,
        };
    }
}
