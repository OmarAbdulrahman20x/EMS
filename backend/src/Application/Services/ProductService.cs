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

    public async Task<PaginatedResponse<ProductDto>> GetProductsAsync(
        QueryParams qp,
        int? categoryId = null,
        int? supplierId = null,
        string? status = null)
    {
        var products = await _repo.GetFilteredAsync(
            qp.Search,
            categoryId,
            supplierId,
            status,
            qp.SortBy,
            qp.SortOrder,
            qp.Page,
            qp.PageSize);

        var total = await _repo.GetFilteredCountAsync(
            qp.Search,
            categoryId,
            supplierId,
            status);

        var dtos = new List<ProductDto>();

        foreach (var product in products)
        {
            dtos.Add(await MapToDtoAsync(product));
        }

        return new PaginatedResponse<ProductDto>
        {
            Data = dtos,
            Total = total,
            Page = qp.Page,
            PageSize = qp.PageSize,
            TotalPages = (int)Math.Ceiling((double)total / qp.PageSize)
        };
    }

    public async Task<IReadOnlyList<ProductDto>> GetAllProductsAsync()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .AsNoTracking()
            .ToListAsync();

        var dtos = new List<ProductDto>();

        foreach (var product in products)
        {
            dtos.Add(await MapToDtoAsync(product));
        }

        return dtos;
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .FirstOrDefaultAsync(p => p.Id == id);

        return product == null
            ? null
            : await MapToDtoAsync(product);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.ProductName,
            Sku = dto.SKU,
            CategoryId = dto.CategoryID,
            SupplierId = dto.SupplierID,
            PurchasePrice = dto.PurchasePrice,
            SellingPrice = dto.SellingPrice,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);

        await _context.SaveChangesAsync();

        return await MapToDtoAsync(product);
    }

    public async Task<ProductDto> UpdateProductAsync(
        int id,
        UpdateProductDto dto)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Product not found");

        product.Name = dto.ProductName;
        product.Sku = dto.SKU;
        product.CategoryId = dto.CategoryID;
        product.SupplierId = dto.SupplierID;
        product.PurchasePrice = dto.PurchasePrice;
        product.SellingPrice = dto.SellingPrice;
        product.IsActive = dto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await MapToDtoAsync(product);
    }

    public async Task<ProductDto> UpdateProductStatusAsync(
        int id,
        string status)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Product not found");

        product.IsActive = status == "active";
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await MapToDtoAsync(product);
    }

    private async Task<ProductDto> MapToDtoAsync(Product product)
    {
        var stock = await _repo.GetCurrentStockAsync(product.Id);

        return new ProductDto
        {
            ProductID = product.Id,
            ProductName = product.Name,
            SKU = product.Sku,

            CategoryID = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,

            SupplierID = product.SupplierId,
            SupplierName = product.Supplier?.Name ?? string.Empty,

            PurchasePrice = product.PurchasePrice,
            SellingPrice = product.SellingPrice,

            CurrentStock = stock,

            IsActive = product.IsActive,
            Status = product.IsActive ? "active" : "inactive",

            CreatedAt = product.CreatedAt
        };
    }
}