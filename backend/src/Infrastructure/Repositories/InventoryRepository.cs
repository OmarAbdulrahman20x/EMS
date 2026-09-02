using Microsoft.EntityFrameworkCore;
using TechERP.Domain.Entities;
using TechERP.Domain.Interfaces;
using TechERP.Infrastructure.Data;

namespace TechERP.Infrastructure.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly AppDbContext _context;

    public InventoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<InventoryTransaction>> GetTransactionsAsync(
        int? productId = null,
        string? type = null,
        string? search = null,
        string? sortBy = null,
        string? sortOrder = "asc",
        int page = 1,
        int pageSize = 10)
    {
        var query = _context.InventoryTransactions
            .Include(t => t.Product)
            .AsNoTracking();

        if (productId.HasValue)
            query = query.Where(t => t.ProductID == productId.Value);

        if (!string.IsNullOrEmpty(type) && type != "all")
            query = query.Where(t => t.TransactionType == type);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();

            query = query.Where(t =>
                t.Product.ProductName.ToLower().Contains(lower) ||
                t.Product.SKU.ToLower().Contains(lower));
        }

        var descending = sortOrder?.ToLower() == "desc";

        query = sortBy?.ToLower() switch
        {
            "productname" => descending
                ? query.OrderByDescending(t => t.Product.ProductName)
                : query.OrderBy(t => t.Product.ProductName),

            "type" => descending
                ? query.OrderByDescending(t => t.TransactionType)
                : query.OrderBy(t => t.TransactionType),

            "quantity" => descending
                ? query.OrderByDescending(t => t.Quantity)
                : query.OrderBy(t => t.Quantity),

            _ => descending
                ? query.OrderByDescending(t => t.CreatedAt)
                : query.OrderBy(t => t.CreatedAt),
        };

        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetTransactionsCountAsync(
        int? productId = null,
        string? type = null,
        string? search = null)
    {
        var query = _context.InventoryTransactions
            .Include(t => t.Product)
            .AsNoTracking();

        if (productId.HasValue)
            query = query.Where(t => t.ProductID == productId.Value);

        if (!string.IsNullOrEmpty(type) && type != "all")
            query = query.Where(t => t.TransactionType == type);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();

            query = query.Where(t =>
                t.Product.ProductName.ToLower().Contains(lower) ||
                t.Product.SKU.ToLower().Contains(lower));
        }

        return await query.CountAsync();
    }

    public async Task<IReadOnlyList<InventoryTransaction>> GetTransactionsByProductAsync(
        int productId)
    {
        return await _context.InventoryTransactions
            .Where(t => t.ProductID == productId)
            .OrderByDescending(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<InventoryTransaction> AddTransactionAsync(
        InventoryTransaction transaction)
    {
        _context.InventoryTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return transaction;
    }

    public async Task<int> GetCurrentStockAsync(int productId)
    {
        var transactions = await _context.InventoryTransactions
            .Where(t => t.ProductID == productId)
            .AsNoTracking()
            .ToListAsync();

        return transactions.Sum(t => t.TransactionType switch
        {
            "IN" => t.Quantity,
            "OUT" => -t.Quantity,
            "ADJUSTMENT" => t.Quantity,
            _ => 0,
        });
    }
    public async Task<IReadOnlyList<ProductInventorySummary>> GetInventorySummaryAsync(
        string? search = null,
        string? stockStatus = null,
        int page = 1,
        int pageSize = 10)
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .ToListAsync();
        var summaries = new List<ProductInventorySummary>();
        foreach (var product in products)
        {
            var stock = await GetCurrentStockAsync(product.ProductID);
            var lastTx = await _context.InventoryTransactions
                .Where(t => t.ProductID == product.ProductID)
                .OrderByDescending(t => t.CreatedAt)
                .AsNoTracking()
                .FirstOrDefaultAsync();
            var status = stock == 0
                ? "out_of_stock"
                : stock < 10
                    ? "low_stock"
                    : "in_stock";
            summaries.Add(new ProductInventorySummary
            {
                ProductId = product.ProductID,
                ProductName = product.ProductName,
                ProductSku = product.SKU,
                CurrentQuantity = stock,
                StockStatus = status,
                LastTransactionType = lastTx?.TransactionType ?? "IN",
                LastTransactionDate = lastTx?.CreatedAt ?? product.CreatedAt,
            });
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            summaries = summaries
                .Where(s =>
                    s.ProductName.ToLower().Contains(lower) ||
                    s.ProductSku.ToLower().Contains(lower))
                .ToList();
        }
        if (!string.IsNullOrEmpty(stockStatus) && stockStatus != "all")
            summaries = summaries
                .Where(s => s.StockStatus == stockStatus)
                .ToList();
        return summaries
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }
    public async Task<int> GetInventorySummaryCountAsync(
        string? search = null,
        string? stockStatus = null)
    {
        var count = await _context.Products.CountAsync();
        if (string.IsNullOrEmpty(search) &&
            string.IsNullOrEmpty(stockStatus))
            return count;
        var summaries = new List<ProductInventorySummary>();
        var products = await _context.Products
            .AsNoTracking()
            .ToListAsync();
        foreach (var product in products)
        {
            var stock = await GetCurrentStockAsync(product.ProductID);
            var status = stock == 0
                ? "out_of_stock"
                : stock < 10
                    ? "low_stock"
                    : "in_stock";
            summaries.Add(new ProductInventorySummary
            {
                ProductName = product.ProductName,
                ProductSku = product.SKU,
                StockStatus = status
            });
        }
        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();
            summaries = summaries
                .Where(s =>
                    s.ProductName.ToLower().Contains(lower) ||
                    s.ProductSku.ToLower().Contains(lower))
                .ToList();
        }
        if (!string.IsNullOrEmpty(stockStatus) &&
            stockStatus != "all")
        {
            summaries = summaries
                .Where(s => s.StockStatus == stockStatus)
                .ToList();
        }
        return summaries.Count;
    }
}