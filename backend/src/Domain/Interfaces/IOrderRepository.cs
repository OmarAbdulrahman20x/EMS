using TechERP.Domain.Entities;

namespace TechERP.Domain.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<Order?> GetOrderWithDetailsAsync(int id);
    Task<IReadOnlyList<Order>> GetFilteredAsync(
        string? search = null,
        int? customerId = null,
        int? employeeId = null,
        string? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? sortBy = null,
        string? sortOrder = "asc",
        int page = 1,
        int pageSize = 10);

    Task<int> GetFilteredCountAsync(
        string? search = null,
        int? customerId = null,
        int? employeeId = null,
        string? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null);
}
