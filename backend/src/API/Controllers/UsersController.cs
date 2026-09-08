using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service) => _service = service;

    [HttpGet]
    [Authorize(Policy = "users.manage")]
    public async Task<ActionResult<PaginatedResponse<UserDto>>> Get(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] int? roleId = null, [FromQuery] string? status = null,
        [FromQuery] string? sortBy = null, [FromQuery] string? sortOrder = "asc")
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search, SortBy = sortBy, SortOrder = sortOrder };
        return Ok(await _service.GetUsersAsync(qp, roleId, status));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "users.manage")]
    public async Task<ActionResult<UserDto>> Get(int id)
    {
        var user = await _service.GetUserByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPost]
    [Authorize(Policy = "users.manage")]
    public async Task<ActionResult<UserDto>> Post([FromBody] CreateUserDto dto)
    {
        var user = await _service.CreateUserAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = user.UserID }, user);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "users.manage")]
    public async Task<ActionResult<UserDto>> Put(int id, [FromBody] UpdateUserDto dto)
    {
        return Ok(await _service.UpdateUserAsync(id, dto));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "users.manage")]
    public async Task<ActionResult<UserDto>> PatchStatus(int id, [FromBody] UpdateUserStatusDto dto)
    {
        return Ok(await _service.UpdateUserStatusAsync(id, dto.IsActive));
    }
}
