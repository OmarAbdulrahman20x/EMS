using Microsoft.EntityFrameworkCore;
using TechERP.Domain.Entities;
using TechERP.Domain.Interfaces;
using TechERP.Infrastructure.Data;

namespace TechERP.Infrastructure.Repositories;

public class OrderRepository : Repository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context) { }

    public async Task<Order?> GetOrderWithDetailsAsync(int id)
    {
        return await Context.Orders
            .Include(o => o.Customer)
            .Include(o => o.User)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.OrderID == id);
    }

    public async Task<IReadOnlyList<Order>> GetFilteredAsync(
        string? search = null,
        int? customerId = null,
        int? employeeId = null,
        string? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? sortBy = null,
        string? sortOrder = "asc",
        int page = 1,
        int pageSize = 10)
    {
        var query = Context.Orders
            .Include(o => o.Customer)
            .Include(o => o.User)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();

            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(lower) ||
                o.Customer.CustomerName.ToLower().Contains(lower) ||
                o.User.FullName.ToLower().Contains(lower));
        }

        if (customerId.HasValue)
            query = query.Where(o => o.CustomerID == customerId.Value);

        if (employeeId.HasValue)
            query = query.Where(o => o.UserID == employeeId.Value);

        if (!string.IsNullOrEmpty(status) && status != "all")
            query = query.Where(o => o.Status == status);

        if (fromDate.HasValue)
            query = query.Where(o => o.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.OrderDate <= toDate.Value);

        var descending = sortOrder?.ToLower() == "desc";

        query = sortBy?.ToLower() switch
        {
            "ordernumber" => descending
                ? query.OrderByDescending(o => o.OrderNumber)
                : query.OrderBy(o => o.OrderNumber),

            "customername" => descending
                ? query.OrderByDescending(o => o.Customer.CustomerName)
                : query.OrderBy(o => o.Customer.CustomerName),

            "orderdate" => descending
                ? query.OrderByDescending(o => o.OrderDate)
                : query.OrderBy(o => o.OrderDate),

            "total" => descending
                ? query.OrderByDescending(o => o.TotalAmount)
                : query.OrderBy(o => o.TotalAmount),

            "status" => descending
                ? query.OrderByDescending(o => o.Status)
                : query.OrderBy(o => o.Status),

            _ => descending
                ? query.OrderByDescending(o => o.OrderDate)
                : query.OrderBy(o => o.OrderDate),
        };

        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetFilteredCountAsync(
        string? search = null,
        int? customerId = null,
        int? employeeId = null,
        string? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = Context.Orders
            .Include(o => o.Customer)
            .Include(o => o.User)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLower();

            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(lower) ||
                o.Customer.CustomerName.ToLower().Contains(lower) ||
                o.User.FullName.ToLower().Contains(lower));
        }

        if (customerId.HasValue)
            query = query.Where(o => o.CustomerID == customerId.Value);

        if (employeeId.HasValue)
            query = query.Where(o => o.UserID == employeeId.Value);

        if (!string.IsNullOrEmpty(status) && status != "all")
            query = query.Where(o => o.Status == status);

        if (fromDate.HasValue)
            query = query.Where(o => o.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.OrderDate <= toDate.Value);

        return await query.CountAsync();
    }
}