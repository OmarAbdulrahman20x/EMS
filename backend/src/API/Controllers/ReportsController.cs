using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportsService _service;

    public ReportsController(IReportsService service) => _service = service;

    [HttpGet("sales")]
    [Authorize(Policy = "reports.sales")]
    public async Task<ActionResult<PaginatedResponse<OrderDto>>> Sales(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] int? customerId = null, [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null, [FromQuery] string? sortOrder = "asc")
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search, SortBy = sortBy, SortOrder = sortOrder };
        return Ok(await _service.GetSalesReportAsync(qp, customerId, status, fromDate, toDate));
    }

    [HttpGet("products")]
    [Authorize(Policy = "reports.products")]
    public async Task<ActionResult<PaginatedResponse<ProductDto>>> Products(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null, [FromQuery] string? sortBy = null, [FromQuery] string? sortOrder = "asc")
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search, SortBy = sortBy, SortOrder = sortOrder };
        return Ok(await _service.GetProductsReportAsync(qp, categoryId));
    }

    [HttpGet("inventory")]
    [Authorize(Policy = "reports.inventory")]
    public async Task<ActionResult<PaginatedResponse<InventorySummaryDto>>> Inventory(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] string? stockStatus = null)
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search };
        return Ok(await _service.GetInventoryReportAsync(qp, stockStatus));
    }

    [HttpGet("customers")]
    [Authorize(Policy = "reports.customers")]
    public async Task<ActionResult<PaginatedResponse<CustomerDto>>> Customers(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null, [FromQuery] string? sortOrder = "asc")
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search, SortBy = sortBy, SortOrder = sortOrder };
        return Ok(await _service.GetCustomersReportAsync(qp));
    }
}
