using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _service;

    public CategoriesController(ICategoryService service) => _service = service;

    [HttpGet]
    [Authorize(Policy = "categories.view")]
    public async Task<ActionResult<PaginatedResponse<CategoryDto>>> Get(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null,
        [FromQuery] string? status = null, [FromQuery] string? sortBy = null, [FromQuery] string? sortOrder = "asc")
    {
        var qp = new QueryParams { Page = page, PageSize = pageSize, Search = search, SortBy = sortBy, SortOrder = sortOrder };
        return Ok(await _service.GetCategoriesAsync(qp, status));
    }

    [HttpGet("all")]
    [Authorize(Policy = "categories.view")]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll() => Ok(await _service.GetAllCategoriesAsync());

    [HttpGet("{id}")]
    [Authorize(Policy = "categories.view")]
    public async Task<ActionResult<CategoryDto>> Get(int id)
    {
        var category = await _service.GetCategoryByIdAsync(id);
        return category == null ? NotFound() : Ok(category);
    }

    [HttpPost]
    [Authorize(Policy = "categories.manage")]
    public async Task<ActionResult<CategoryDto>> Post([FromBody] CreateCategoryDto dto)
    {
        var category = await _service.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "categories.manage")]
    public async Task<ActionResult<CategoryDto>> Put(int id, [FromBody] UpdateCategoryDto dto)
    {
        return Ok(await _service.UpdateCategoryAsync(id, dto));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "categories.manage")]
    public async Task<ActionResult<CategoryDto>> PatchStatus(int id, [FromBody] UpdateCategoryStatusDto dto)
    {
        return Ok(await _service.UpdateCategoryStatusAsync(id, dto.Status));
    }
}

public class UpdateCategoryStatusDto { public string Status { get; set; } = "active"; }
