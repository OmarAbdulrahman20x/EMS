using Microsoft.EntityFrameworkCore;
using TechERP.Domain.Entities;
using TechERP.Domain.Interfaces;
using TechERP.Infrastructure.Data;

namespace TechERP.Infrastructure.Repositories;

public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context) { }

    public async Task<IReadOnlyList<Product>> GetFilteredAsync(
        string? search = null,
        int? categoryId = null,
        int? supplierId = null,
        string? status = null,
        string? sortBy = null,
        string? sortOrder = "asc",
        int page = 1,
        int pageSize = 10)
    {
        var query = Context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(p =>
                p.ProductName.ToLower().Contains(lower) ||
                p.SKU.ToLower().Contains(lower));
        }

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryID == categoryId.Value);

        if (supplierId.HasValue)
            query = query.Where(p => p.SupplierID == supplierId.Value);

        if (!string.IsNullOrEmpty(status) && status != "all")
            query = query.Where(p => p.IsActive == (status == "active"));

        query = ApplySort(query, sortBy, sortOrder);

        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetFilteredCountAsync(
        string? search = null,
        int? categoryId = null,
        int? supplierId = null,
        string? status = null)
    {
        var query = Context.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            query = query.Where(p =>
                p.ProductName.ToLower().Contains(lower) ||
                p.SKU.ToLower().Contains(lower));
        }

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryID == categoryId.Value);

        if (supplierId.HasValue)
            query = query.Where(p => p.SupplierID == supplierId.Value);

        if (!string.IsNullOrEmpty(status) && status != "all")
            query = query.Where(p => p.IsActive == (status == "active"));

        return await query.CountAsync();
    }

    public async Task<int> GetCurrentStockAsync(int productId)
    {
        var transactions = await Context.InventoryTransactions
            .Where(t => t.ProductID == productId)
            .ToListAsync();

        return transactions.Sum(t => t.TransactionType switch
        {
            "IN" => t.Quantity,
            "OUT" => -t.Quantity,
            "ADJUSTMENT" => t.Quantity,
            _ => 0,
        });
    }

    private static IQueryable<Product> ApplySort(
        IQueryable<Product> query,
        string? sortBy,
        string? sortOrder)
    {
        var descending = sortOrder?.ToLower() == "desc";

        return sortBy?.ToLower() switch
        {
            "name" => descending
                ? query.OrderByDescending(p => p.ProductName)
                : query.OrderBy(p => p.ProductName),

            "sku" => descending
                ? query.OrderByDescending(p => p.SKU)
                : query.OrderBy(p => p.SKU),

            "purchaseprice" => descending
                ? query.OrderByDescending(p => p.PurchasePrice)
                : query.OrderBy(p => p.PurchasePrice),

            "sellingprice" => descending
                ? query.OrderByDescending(p => p.SellingPrice)
                : query.OrderBy(p => p.SellingPrice),

            "createdat" => descending
                ? query.OrderByDescending(p => p.CreatedAt)
                : query.OrderBy(p => p.CreatedAt),

            _ => descending
                ? query.OrderByDescending(p => p.CreatedAt)
                : query.OrderBy(p => p.CreatedAt),
        };
    }
}