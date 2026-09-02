using Microsoft.EntityFrameworkCore;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Interfaces;
using TechERP.Infrastructure.Data;

namespace TechERP.Application.Services;

public class ReportsService : IReportsService
{
    private readonly AppDbContext _context;
    private readonly IInventoryRepository _inventoryRepo;

    public ReportsService(AppDbContext context, IInventoryRepository inventoryRepo)
    {
        _context = context;
        _inventoryRepo = inventoryRepo;
    }

    public async Task<PaginatedResponse<OrderDto>> GetSalesReportAsync(QueryParams qp, int? customerId = null, string? status = null, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var query = _context.Orders.Include(o => o.Customer).Include(o => o.User).Where(o => o.Status != "draft").AsNoTracking();

        if (!string.IsNullOrWhiteSpace(qp.Search))
        {
            var lower = qp.Search.ToLower();
            query = query.Where(o => o.OrderNumber.ToLower().Contains(lower) || o.Customer.Name.ToLower().Contains(lower));
        }
        if (customerId.HasValue) query = query.Where(o => o.CustomerId == customerId.Value);
        if (!string.IsNullOrEmpty(status) && status != "all") query = query.Where(o => o.Status == status);
        if (fromDate.HasValue) query = query.Where(o => o.OrderDate >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(o => o.OrderDate <= toDate.Value);

        var total = await query.CountAsync();
        var orders = await query.OrderByDescending(o => o.OrderDate).Skip((qp.Page - 1) * qp.PageSize).Take(qp.PageSize).ToListAsync();

        return new PaginatedResponse<OrderDto> { Data = orders.Select(OrderService.MapToDto).ToList(), Total = total, Page = qp.Page, PageSize = qp.PageSize, TotalPages = (int)Math.Ceiling((double)total / qp.PageSize) };
    }

    public async Task<PaginatedResponse<ProductDto>> GetProductsReportAsync(QueryParams qp, int? categoryId = null)
    {
        var query = _context.Products.Include(p => p.Category).Include(p => p.Supplier).AsNoTracking();

        if (!string.IsNullOrWhiteSpace(qp.Search))
        {
            var lower = qp.Search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(lower) || p.Sku.ToLower().Contains(lower));
        }
        if (categoryId.HasValue) query = query.Where(p => p.CategoryId == categoryId.Value);

        var total = await query.CountAsync();
        var products = await query.OrderByDescending(p => p.CreatedAt).Skip((qp.Page - 1) * qp.PageSize).Take(qp.PageSize).ToListAsync();

        var dtos = new List<ProductDto>();
        foreach (var p in products)
        {
            var stock = await _inventoryRepo.GetCurrentStockAsync(p.Id);
            dtos.Add(new ProductDto
            {
                Id = p.Id, Name = p.Name, Sku = p.Sku, CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name ?? "", SupplierId = p.SupplierId,
                SupplierName = p.Supplier?.Name ?? "", PurchasePrice = p.PurchasePrice,
                SellingPrice = p.SellingPrice, CurrentStock = stock,
                Status = p.IsActive ? "active" : "inactive", CreatedAt = p.CreatedAt,
            });
        }

        return new PaginatedResponse<ProductDto> { Data = dtos, Total = total, Page = qp.Page, PageSize = qp.PageSize, TotalPages = (int)Math.Ceiling((double)total / qp.PageSize) };
    }

    public async Task<PaginatedResponse<InventorySummaryDto>> GetInventoryReportAsync(QueryParams qp, string? stockStatus = null)
    {
        var summaries = await _inventoryRepo.GetInventorySummaryAsync(qp.Search, stockStatus, qp.Page, qp.PageSize);
        var total = await _inventoryRepo.GetInventorySummaryCountAsync(qp.Search, stockStatus);

        var dtos = summaries.Select(s => new InventorySummaryDto
        {
            ProductId = s.ProductId, ProductName = s.ProductName, ProductSku = s.ProductSku,
            CurrentQuantity = s.CurrentQuantity, StockStatus = s.StockStatus,
            LastTransactionType = s.LastTransactionType, LastTransactionDate = s.LastTransactionDate,
        }).ToList();

        return new PaginatedResponse<InventorySummaryDto> { Data = dtos, Total = total, Page = qp.Page, PageSize = qp.PageSize, TotalPages = (int)Math.Ceiling((double)total / qp.PageSize) };
    }

    public async Task<PaginatedResponse<CustomerDto>> GetCustomersReportAsync(QueryParams qp)
    {
        var query = _context.Customers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(qp.Search))
        {
            var lower = qp.Search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(lower) || c.Phone.Contains(lower) || c.Email.ToLower().Contains(lower));
        }

        var total = await query.CountAsync();
        var customers = await query.OrderByDescending(c => c.CreatedAt).Skip((qp.Page - 1) * qp.PageSize).Take(qp.PageSize).ToListAsync();

        var dtos = new List<CustomerDto>();
        foreach (var c in customers)
        {
            var dto = CustomerService.MapToDto(c);
            dto.OrderCount = await _context.Orders.CountAsync(o => o.CustomerId == c.Id && o.Status != "cancelled");
            dto.TotalPurchases = await _context.Orders.Where(o => o.CustomerId == c.Id && o.Status != "draft" && o.Status != "cancelled").SumAsync(o => o.Total);
            var lastOrder = await _context.Orders.Where(o => o.CustomerId == c.Id).OrderByDescending(o => o.OrderDate).FirstOrDefaultAsync();
            dto.LastOrderDate = lastOrder?.OrderDate;
            dtos.Add(dto);
        }

        return new PaginatedResponse<CustomerDto> { Data = dtos, Total = total, Page = qp.Page, PageSize = qp.PageSize, TotalPages = (int)Math.Ceiling((double)total / qp.PageSize) };
    }
}
