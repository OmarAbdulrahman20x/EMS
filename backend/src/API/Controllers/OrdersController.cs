using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;
    private readonly ICurrentUserService _currentUser;

    public OrdersController(IOrderService service, ICurrentUserService currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    [Authorize(Policy = "orders.view")]
    public async Task<ActionResult<PaginatedResponse<OrderDto>>> Get(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] int? customerId = null, [FromQuery] int? employeeId = null, [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null, [FromQuery] string? sortOrder = "asc")
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search, SortBy = sortBy, SortOrder = sortOrder };
        return Ok(await _service.GetOrdersAsync(qp, customerId, employeeId, status, fromDate, toDate));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "orders.view")]
    public async Task<ActionResult<OrderDto>> Get(int id)
    {
        var order = await _service.GetOrderByIdAsync(id);
        return order == null ? NotFound() : Ok(order);
    }

    [HttpPost]
    [Authorize(Policy = "orders.create")]
    public async Task<ActionResult<OrderDto>> Post([FromBody] CreateOrderDto dto)
    {
        var order = await _service.CreateOrderAsync(dto, _currentUser.UserId);
        return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "orders.manage")]
    public async Task<ActionResult<OrderDto>> Put(int id, [FromBody] UpdateOrderDto dto)
    {
        return Ok(await _service.UpdateOrderAsync(id, dto));
    }

    [HttpPost("{id}/confirm")]
    [Authorize(Policy = "orders.manage")]
    public async Task<ActionResult<OrderDto>> Confirm(int id)
    {
        return Ok(await _service.ConfirmOrderAsync(id));
    }

    [HttpPost("{id}/cancel")]
    [Authorize(Policy = "orders.manage")]
    public async Task<ActionResult<OrderDto>> Cancel(int id)
    {
        return Ok(await _service.CancelOrderAsync(id));
    }
}
