using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Interfaces;

namespace TechERP.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repo;

    public DashboardService(IDashboardRepository repo) => _repo = repo;

    public async Task<KpiDto> GetKpisAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        return new KpiDto
        {
            TotalSales = await _repo.GetTotalSalesAsync(fromDate, toDate),
            TotalProfit = await _repo.GetTotalProfitAsync(fromDate, toDate),
            CustomerCount = await _repo.GetCustomerCountAsync(),
            OrderCount = await _repo.GetOrderCountAsync(fromDate, toDate),
            BestSellingProduct = await _repo.GetBestSellingProductAsync(fromDate, toDate),
            LeastSellingProduct = await _repo.GetLeastSellingProductAsync(fromDate, toDate),
            TopCustomer = await _repo.GetTopCustomerAsync(fromDate, toDate),
        };
    }

    public async Task<DashboardChartsDto> GetChartsAsync(
    DateTime? fromDate = null,
    DateTime? toDate = null)
    {
        return new DashboardChartsDto
        {
            MonthlySales = await _repo.GetMonthlySalesAsync(fromDate, toDate),
            SalesComparison = await _repo.GetSalesComparisonAsync(fromDate, toDate),
            TopProducts = await _repo.GetTopProductsAsync(fromDate, toDate),
            TopCustomers = await _repo.GetTopCustomersAsync(fromDate, toDate),
            CategoryDistribution = await _repo.GetCategoryDistributionAsync(fromDate, toDate),
        };
    }
}
