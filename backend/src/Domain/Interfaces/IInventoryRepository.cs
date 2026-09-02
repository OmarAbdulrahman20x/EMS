using TechERP.Domain.Entities;

namespace TechERP.Domain.Interfaces;

public interface IInventoryRepository
{
    Task<IReadOnlyList<InventoryTransaction>> GetTransactionsAsync(
        int? productId = null,
        string? type = null,
        string? search = null,
        string? sortBy = null,
        string? sortOrder = "asc",
        int page = 1,
        int pageSize = 10);

    Task<int> GetTransactionsCountAsync(
        int? productId = null,
        string? type = null,
        string? search = null);

    Task<IReadOnlyList<InventoryTransaction>> GetTransactionsByProductAsync(int productId);

    Task<InventoryTransaction> AddTransactionAsync(InventoryTransaction transaction);

    Task<int> GetCurrentStockAsync(int productId);

    Task<IReadOnlyList<ProductInventorySummary>> GetInventorySummaryAsync(
        string? search = null,
        string? stockStatus = null,
        int page = 1,
        int pageSize = 10);

    Task<int> GetInventorySummaryCountAsync(string? search = null, string? stockStatus = null);
}

public class ProductInventorySummary
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSku { get; set; } = string.Empty;
    public int CurrentQuantity { get; set; }
    public string StockStatus { get; set; } = "in_stock";
    public string LastTransactionType { get; set; } = string.Empty;
    public DateTime LastTransactionDate { get; set; }
}
