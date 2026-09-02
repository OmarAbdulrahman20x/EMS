using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service) => _service = service;

    [HttpGet]
    [Authorize(Policy = "dashboard.view")]
    public async Task<ActionResult<object>> Get([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
    {
        var kpis = await _service.GetKpisAsync(fromDate, toDate);
        var charts = await _service.GetChartsAsync(fromDate, toDate);
        return Ok(new { kpis, charts });
    }

    [HttpGet("kpis")]
    [Authorize(Policy = "dashboard.view")]
    public async Task<ActionResult<KpiDto>> GetKpis([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
    {
        return Ok(await _service.GetKpisAsync(fromDate, toDate));
    }

    [HttpGet("charts")]
    [Authorize(Policy = "dashboard.view")]
    public async Task<ActionResult<DashboardChartsDto>> GetCharts([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
    {
        return Ok(await _service.GetChartsAsync(fromDate, toDate));
    }
}
