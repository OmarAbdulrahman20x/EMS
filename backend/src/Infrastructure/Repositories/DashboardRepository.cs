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
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var ordersQuery = _context.Orders
            .Where(o => o.Status != "Cancelled");

        if (fromDate.HasValue)
            ordersQuery = ordersQuery.Where(
                o => o.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            ordersQuery = ordersQuery.Where(
                o => o.OrderDate <= toDate.Value);

        var monthlySales = await ordersQuery
            .GroupBy(o => new
            {
                o.OrderDate.Year,
                o.OrderDate.Month
            })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Sales = g.Sum(o => o.TotalAmount)
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();

        var itemsQuery = _context.OrderItems
            .Where(oi => oi.Order.Status != "Cancelled");

        if (fromDate.HasValue)
            itemsQuery = itemsQuery.Where(
                oi => oi.Order.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            itemsQuery = itemsQuery.Where(
                oi => oi.Order.OrderDate <= toDate.Value);

        var monthlyProfit = await itemsQuery
            .GroupBy(oi => new
            {
                oi.Order.OrderDate.Year,
                oi.Order.OrderDate.Month
            })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Profit = g.Sum(oi =>
                    (oi.UnitPrice - oi.Product.PurchasePrice) *
                    oi.Quantity)
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();

        var result = monthlySales
            .Select(x => new MonthlySalesDto
            {
                Month = new DateTime(x.Year, x.Month, 1)
                    .ToString("MMM"),

                Sales = x.Sales,

                Profit = monthlyProfit
                    .Where(p =>
                        p.Year == x.Year &&
                        p.Month == x.Month)
                    .Select(p => p.Profit)
                    .FirstOrDefault()
            })
            .ToList();

        return result;
    }

    public async Task<IReadOnlyList<SalesComparisonDto>> GetSalesComparisonAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        if (!fromDate.HasValue || !toDate.HasValue)
            return [];

        var currentFrom = fromDate.Value;
        var currentTo = toDate.Value;

        var duration = currentTo - currentFrom;

        var previousTo = currentFrom.AddTicks(-1);
        var previousFrom = previousTo - duration;

        var currentSales = await _context.Orders
            .Where(o =>
                o.Status != "Cancelled" &&
                o.OrderDate >= currentFrom &&
                o.OrderDate <= currentTo)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        var previousSales = await _context.Orders
            .Where(o =>
                o.Status != "Cancelled" &&
                o.OrderDate >= previousFrom &&
                o.OrderDate <= previousTo)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

        return new List<SalesComparisonDto>
        {
            new SalesComparisonDto
            {
                Period = "Current Period",
                Current = currentSales,
                Previous = previousSales
            }
        };
    }

    public async Task<IReadOnlyList<TopProductDto>> GetTopProductsAsync(
        DateTime? fromDate,
        DateTime? toDate,
        int limit = 5)
    {
        var query = _context.OrderItems
            .Where(oi => oi.Order.Status != "Cancelled");

        if (fromDate.HasValue)
            query = query.Where(
                oi => oi.Order.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(
                oi => oi.Order.OrderDate <= toDate.Value);

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
            query = query.Where(
                o => o.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(
                o => o.OrderDate <= toDate.Value);

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
            query = query.Where(
                oi => oi.Order.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(
                oi => oi.Order.OrderDate <= toDate.Value);

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