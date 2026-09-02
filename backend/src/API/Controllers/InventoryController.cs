using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _service;
    private readonly ICurrentUserService _currentUser;

    public InventoryController(IInventoryService service, ICurrentUserService currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    [Authorize(Policy = "inventory.view")]
    public async Task<ActionResult<PaginatedResponse<InventorySummaryDto>>> Get(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] string? stockStatus = null)
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search };
        return Ok(await _service.GetInventorySummaryAsync(qp, stockStatus));
    }

    [HttpGet("transactions")]
    [Authorize(Policy = "inventory.view")]
    public async Task<ActionResult<PaginatedResponse<InventoryTransactionDto>>> GetTransactions(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] int? productId = null, [FromQuery] string? type = null,
        [FromQuery] string? sortBy = null, [FromQuery] string? sortOrder = "asc")
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search, SortBy = sortBy, SortOrder = sortOrder };
        return Ok(await _service.GetTransactionsAsync(qp, productId, type));
    }

    [HttpPost("transactions")]
    [Authorize(Policy = "inventory.manage")]
    public async Task<ActionResult<InventoryTransactionDto>> PostTransaction([FromBody] CreateInventoryTransactionDto dto)
    {
        var transaction = await _service.CreateTransactionAsync(dto, _currentUser.UserId);
        return CreatedAtAction(nameof(GetTransactions), new { id = transaction.Id }, transaction);
    }
}
