using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _service;

    public CustomersController(ICustomerService service) => _service = service;

    [HttpGet]
    [Authorize(Policy = "customers.view")]
    public async Task<ActionResult<PaginatedResponse<CustomerDto>>> Get(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] string? type = null, [FromQuery] string? status = null, [FromQuery] string? city = null,
        [FromQuery] string? sortBy = null, [FromQuery] string? sortOrder = "asc")
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search, SortBy = sortBy, SortOrder = sortOrder };
        return Ok(await _service.GetCustomersAsync(qp, type, status, city));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "customers.view")]
    public async Task<ActionResult<CustomerDto>> Get(int id)
    {
        var customer = await _service.GetCustomerByIdAsync(id);
        return customer == null ? NotFound() : Ok(customer);
    }

    [HttpGet("{id}/orders")]
    [Authorize(Policy = "customers.view")]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders(int id) => Ok(await _service.GetCustomerOrdersAsync(id));

    [HttpPost]
    [Authorize(Policy = "customers.manage")]
    public async Task<ActionResult<CustomerDto>> Post([FromBody] CreateCustomerDto dto)
    {
        var customer = await _service.CreateCustomerAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = customer.Id }, customer);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "customers.manage")]
    public async Task<ActionResult<CustomerDto>> Put(int id, [FromBody] UpdateCustomerDto dto)
    {
        return Ok(await _service.UpdateCustomerAsync(id, dto));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "customers.manage")]
    public async Task<ActionResult<CustomerDto>> PatchStatus(int id, [FromBody] UpdateCustomerStatusDto dto)
    {
        return Ok(await _service.UpdateCustomerStatusAsync(id, dto.Status));
    }
}

public class UpdateCustomerStatusDto { public string Status { get; set; } = "active"; }
