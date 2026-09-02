using Microsoft.EntityFrameworkCore;
using TechERP.Domain.Interfaces;
using TechERP.Infrastructure.Data;

namespace TechERP.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly AppDbContext _context;

    public DashboardRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<decimal> GetTotalSalesAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.Orders
            .Where(o => o.Status != "Cancelled");

        if (fromDate.HasValue)
            query = query.Where(o => o.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.OrderDate <= toDate.Value);

        return await query.SumAsync(o => o.TotalAmount);
    }

    public async Task<decimal> GetTotalProfitAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.OrderItems
            .Where(oi => oi.Order.Status != "Cancelled");

        if (fromDate.HasValue)
            query = query.Where(oi => oi.Order.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(oi => oi.Order.OrderDate <= toDate.Value);

        return await query.SumAsync(
            oi => (oi.UnitPrice - oi.Product.PurchasePrice) * oi.Quantity);
    }

    public async Task<int> GetCustomerCountAsync()
    {
        return await _context.Customers.CountAsync();
    }

    public async Task<int> GetOrderCountAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.Orders
            .Where(o => o.Status != "Cancelled");

        if (fromDate.HasValue)
            query = query.Where(o => o.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.OrderDate <= toDate.Value);

        return await query.CountAsync();
    }

    public async Task<BestSellingProductDto?> GetBestSellingProductAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.OrderItems
            .Where(oi => oi.Order.Status != "Cancelled");

        if (fromDate.HasValue)
            query = query.Where(oi => oi.Order.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(oi => oi.Order.OrderDate <= toDate.Value);

        return await query
            .GroupBy(oi => oi.Product.ProductName)
            .Select(g => new BestSellingProductDto
            {
                Name = g.Key,
                UnitsSold = g.Sum(oi => oi.Quantity)
            })
            .OrderByDescending(x => x.UnitsSold)
            .FirstOrDefaultAsync();
    }

    public async Task<BestSellingProductDto?> GetLeastSellingProductAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.OrderItems
            .Where(oi => oi.Order.Status != "Cancelled");

        if (fromDate.HasValue)
            query = query.Where(oi => oi.Order.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(oi => oi.Order.OrderDate <= toDate.Value);

        return await query
            .GroupBy(oi => oi.Product.ProductName)
            .Select(g => new BestSellingProductDto
            {
                Name = g.Key,
                UnitsSold = g.Sum(oi => oi.Quantity)
            })
            .OrderBy(x => x.UnitsSold)
            .FirstOrDefaultAsync();
    }

    public async Task<TopCustomerDto?> GetTopCustomerAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.Orders
            .Where(o => o.Status != "Cancelled");

        if (fromDate.HasValue)
            query = query.Where(o => o.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.OrderDate <= toDate.Value);

        return await query
            .GroupBy(o => o.Customer.CustomerName)
            .Select(g => new TopCustomerDto
            {
                Name = g.Key,
                TotalPurchases = g.Sum(o => o.TotalAmount)
            })
            .OrderByDescending(x => x.TotalPurchases)
            .FirstOrDefaultAsync();
    }

    public async Task<IReadOnlyList<MonthlySalesDto>> GetMonthlySalesAsync(
        int year)
    {
        var monthly = await _context.Orders
            .Where(o =>
                o.OrderDate.Year == year &&
                o.Status != "Cancelled")
            .GroupBy(o => o.OrderDate.Month)
            .Select(g => new
            {
                Month = g.Key,
                Sales = g.Sum(o => o.TotalAmount)
            })
            .ToListAsync();

        var monthlyProfit = await _context.OrderItems
            .Where(oi =>
                oi.Order.OrderDate.Year == year &&
                oi.Order.Status != "Cancelled")
            .GroupBy(oi => oi.Order.OrderDate.Month)
            .Select(g => new
            {
                Month = g.Key,
                Profit = g.Sum(oi =>
                    (oi.UnitPrice - oi.Product.PurchasePrice) *
                    oi.Quantity)
            })
            .ToListAsync();

        var monthNames = new[]
        {
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"
        };

        return Enumerable.Range(1, 12)
            .Select(m => new MonthlySalesDto
            {
                Month = monthNames[m - 1],
                Sales = monthly
                    .FirstOrDefault(x => x.Month == m)?.Sales ?? 0,
                Profit = monthlyProfit
                    .FirstOrDefault(x => x.Month == m)?.Profit ?? 0
            })
            .ToList();
    }

    public async Task<IReadOnlyList<SalesComparisonDto>> GetSalesComparisonAsync(
        int year)
    {
        var current = await _context.Orders
            .Where(o =>
                o.OrderDate.Year == year &&
                o.Status != "Cancelled")
            .GroupBy(o => o.OrderDate.Month)
            .Select(g => new
            {
                Month = g.Key,
                Sales = g.Sum(o => o.TotalAmount)
            })
            .ToListAsync();

        var previous = await _context.Orders
            .Where(o =>
                o.OrderDate.Year == year - 1 &&
                o.Status != "Cancelled")
            .GroupBy(o => o.OrderDate.Month)
            .Select(g => new
            {
                Month = g.Key,
                Sales = g.Sum(o => o.TotalAmount)
            })
            .ToListAsync();

        var monthNames = new[]
        {
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"
        };

        return Enumerable.Range(1, 12)
            .Select(m => new SalesComparisonDto
            {
                Period = monthNames[m - 1],
                Current = current
                    .FirstOrDefault(x => x.Month == m)?.Sales ?? 0,
                Previous = previous
                    .FirstOrDefault(x => x.Month == m)?.Sales ?? 0
            })
            .ToList();
    }

    public async Task<IReadOnlyList<TopProductDto>> GetTopProductsAsync(
        DateTime? fromDate,
        DateTime? toDate,
        int limit = 5)
    {
        var query = _context.OrderItems
            .Where(oi => oi.Order.Status != "Cancelled");

        if (fromDate.HasValue)
            query = query.Where(oi => oi.Order.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(oi => oi.Order.OrderDate <= toDate.Value);

        return await query
            .GroupBy(oi => oi.Product.ProductName)
            .Select(g => new TopProductDto
            {
                Name = g.Key,
                UnitsSold = g.Sum(oi => oi.Quantity),
                Revenue = g.Sum(oi => oi.SubTotal)
            })
            .OrderByDescending(x => x.UnitsSold)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<TopCustomerDto>> GetTopCustomersAsync(
        DateTime? fromDate,
        DateTime? toDate,
        int limit = 5)
    {
        var query = _context.Orders
            .Where(o => o.Status != "Cancelled");

        if (fromDate.HasValue)
            query = query.Where(o => o.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.OrderDate <= toDate.Value);

        return await query
            .GroupBy(o => o.Customer.CustomerName)
            .Select(g => new TopCustomerDto
            {
                Name = g.Key,
                TotalPurchases = g.Sum(o => o.TotalAmount)
            })
            .OrderByDescending(x => x.TotalPurchases)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<CategoryDistributionDto>>
        GetCategoryDistributionAsync(
            DateTime? fromDate,
            DateTime? toDate)
    {
        var query = _context.OrderItems
            .Where(oi => oi.Order.Status != "Cancelled");

        if (fromDate.HasValue)
            query = query.Where(oi => oi.Order.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(oi => oi.Order.OrderDate <= toDate.Value);

        var grouped = await query
            .GroupBy(oi => oi.Product.Category.CategoryName)
            .Select(g => new CategoryDistributionDto
            {
                Category = g.Key,
                Sales = g.Sum(oi => oi.SubTotal)
            })
            .ToListAsync();

        var total = grouped.Sum(x => x.Sales);

        if (total > 0)
        {
            foreach (var item in grouped)
            {
                item.Percentage = Math.Round(
                    (item.Sales / total) * 100,
                    1);
            }
        }

        return grouped
            .OrderByDescending(x => x.Sales)
            .ToList();
    }
}