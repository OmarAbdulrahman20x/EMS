using TechERP.Domain.Entities;

namespace TechERP.Domain.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<IReadOnlyList<Product>> GetFilteredAsync(
        string? search = null,
        int? categoryId = null,
        int? supplierId = null,
        string? status = null,
        string? sortBy = null,
        string? sortOrder = "asc",
        int page = 1,
        int pageSize = 10);

    Task<int> GetFilteredCountAsync(
        string? search = null,
        int? categoryId = null,
        int? supplierId = null,
        string? status = null);

    Task<int> GetCurrentStockAsync(int productId);
}
