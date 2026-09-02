using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _service;

    public SuppliersController(ISupplierService service) => _service = service;

    [HttpGet]
    [Authorize(Policy = "suppliers.view")]
    public async Task<ActionResult<PaginatedResponse<SupplierDto>>> Get(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] string? status = null, [FromQuery] string? city = null,
        [FromQuery] string? sortBy = null, [FromQuery] string? sortOrder = "asc")
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search, SortBy = sortBy, SortOrder = sortOrder };
        return Ok(await _service.GetSuppliersAsync(qp, status, city));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "suppliers.view")]
    public async Task<ActionResult<SupplierDto>> Get(int id)
    {
        var supplier = await _service.GetSupplierByIdAsync(id);
        return supplier == null ? NotFound() : Ok(supplier);
    }

    [HttpPost]
    [Authorize(Policy = "suppliers.manage")]
    public async Task<ActionResult<SupplierDto>> Post([FromBody] CreateSupplierDto dto)
    {
        var supplier = await _service.CreateSupplierAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = supplier.Id }, supplier);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "suppliers.manage")]
    public async Task<ActionResult<SupplierDto>> Put(int id, [FromBody] UpdateSupplierDto dto)
    {
        return Ok(await _service.UpdateSupplierAsync(id, dto));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "suppliers.manage")]
    public async Task<ActionResult<SupplierDto>> PatchStatus(int id, [FromBody] UpdateSupplierStatusDto dto)
    {
        return Ok(await _service.UpdateSupplierStatusAsync(id, dto.Status));
    }
}

public class UpdateSupplierStatusDto { public string Status { get; set; } = "active"; }
