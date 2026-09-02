using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IRoleService _service;

    public RolesController(IRoleService service) => _service = service;

    [HttpGet]
    [Authorize(Policy = "roles.manage")]
    public async Task<ActionResult<IReadOnlyList<RoleDto>>> Get() => Ok(await _service.GetRolesAsync());

    [HttpGet("{id}")]
    [Authorize(Policy = "roles.manage")]
    public async Task<ActionResult<RoleDto>> Get(int id)
    {
        var role = await _service.GetRoleByIdAsync(id);
        return role == null ? NotFound() : Ok(role);
    }

    [HttpPost]
    [Authorize(Policy = "roles.manage")]
    public async Task<ActionResult<RoleDto>> Post([FromBody] CreateRoleDto dto)
    {
        var role = await _service.CreateRoleAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = role.Id }, role);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "roles.manage")]
    public async Task<ActionResult<RoleDto>> Put(int id, [FromBody] UpdateRoleDto dto)
    {
        return Ok(await _service.UpdateRoleAsync(id, dto));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "roles.manage")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteRoleAsync(id);
        return NoContent();
    }
}
