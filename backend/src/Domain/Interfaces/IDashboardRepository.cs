namespace TechERP.Domain.Interfaces;

public interface IDashboardRepository
{
    Task<decimal> GetTotalSalesAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<decimal> GetTotalProfitAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<int> GetCustomerCountAsync();
    Task<int> GetOrderCountAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<BestSellingProductDto?> GetBestSellingProductAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<BestSellingProductDto?> GetLeastSellingProductAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<TopCustomerDto?> GetTopCustomerAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<IReadOnlyList<MonthlySalesDto>> GetMonthlySalesAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null);   
    Task<IReadOnlyList<SalesComparisonDto>> GetSalesComparisonAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null);
    Task<IReadOnlyList<TopProductDto>> GetTopProductsAsync(DateTime? fromDate, DateTime? toDate, int limit = 5);
    Task<IReadOnlyList<TopCustomerDto>> GetTopCustomersAsync(DateTime? fromDate, DateTime? toDate, int limit = 5);
    Task<IReadOnlyList<CategoryDistributionDto>> GetCategoryDistributionAsync(DateTime? fromDate, DateTime? toDate);
}

public class BestSellingProductDto
{
    public string Name { get; set; } = string.Empty;
    public int UnitsSold { get; set; }
}

public class TopCustomerDto
{
    public string Name { get; set; } = string.Empty;
    public decimal TotalPurchases { get; set; }
}

public class MonthlySalesDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public decimal Profit { get; set; }
}

public class SalesComparisonDto
{
    public string Period { get; set; } = string.Empty;
    public decimal Current { get; set; }
    public decimal Previous { get; set; }
}

public class TopProductDto
{
    public string Name { get; set; } = string.Empty;
    public int UnitsSold { get; set; }
    public decimal Revenue { get; set; }
}

public class CategoryDistributionDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public decimal Percentage { get; set; }
}
