using TechERP.Domain.Interfaces;

namespace TechERP.Application.DTOs;

public class KpiDto
{
    public decimal TotalSales { get; set; }
    public decimal TotalProfit { get; set; }
    public int CustomerCount { get; set; }
    public int OrderCount { get; set; }
    public BestSellingProductDto? BestSellingProduct { get; set; }
    public BestSellingProductDto? LeastSellingProduct { get; set; }
    public TopCustomerDto? TopCustomer { get; set; }
}

public class DashboardChartsDto
{
    public IReadOnlyList<MonthlySalesDto> MonthlySales { get; set; } = new List<MonthlySalesDto>();
    public IReadOnlyList<SalesComparisonDto> SalesComparison { get; set; } = new List<SalesComparisonDto>();
    public IReadOnlyList<TopProductDto> TopProducts { get; set; } = new List<TopProductDto>();
    public IReadOnlyList<TopCustomerDto> TopCustomers { get; set; } = new List<TopCustomerDto>();
    public IReadOnlyList<CategoryDistributionDto> CategoryDistribution { get; set; } = new List<CategoryDistributionDto>();
}
