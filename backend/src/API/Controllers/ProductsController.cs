using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "products.view")]
    public async Task<ActionResult<PaginatedResponse<ProductDto>>> Get(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? supplierId = null,
        [FromQuery] string? status = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "asc")
    {
        var qp = new QueryParams
        {
            Page = page,
            PageSize = pageSize,
            Search = search,
            SortBy = sortBy,
            SortOrder = sortOrder
        };

        var products = await _service.GetProductsAsync(
            qp,
            categoryId,
            supplierId,
            status);

        return Ok(products);
    }

    [HttpGet("all")]
    [Authorize(Policy = "products.view")]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetAll()
    {
        var products = await _service.GetAllProductsAsync();

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = "products.view")]
    public async Task<ActionResult<ProductDto>> Get(int id)
    {
        var product = await _service.GetProductByIdAsync(id);

        if (product == null)
            return NotFound();

        return Ok(product);
    }

    [HttpPost]
    [Authorize(Policy = "products.manage")]
    public async Task<ActionResult<ProductDto>> Post(
        [FromBody] CreateProductDto dto)
    {
        var product = await _service.CreateProductAsync(dto);

        return CreatedAtAction(
            nameof(Get),
            new { id = product.ProductID },
            product);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "products.manage")]
    public async Task<ActionResult<ProductDto>> Put(
        int id,
        [FromBody] UpdateProductDto dto)
    {
        var product = await _service.UpdateProductAsync(id, dto);

        return Ok(product);
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Policy = "products.manage")]
    public async Task<ActionResult<ProductDto>> PatchStatus(
        int id,
        [FromBody] UpdateProductStatusDto dto)
    {
        var product = await _service.UpdateProductStatusAsync(
            id,
            dto.Status);

        return Ok(product);
    }
}

public class UpdateProductStatusDto
{
    public string Status { get; set; } = "active";
}