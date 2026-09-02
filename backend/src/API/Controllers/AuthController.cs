using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;

namespace TechERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var result = await _authService.LoginAsync(loginDto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser([FromServices] ICurrentUserService currentUser)
    {
        var user = await _authService.GetUserByIdAsync(currentUser.UserId);
        return user == null ? NotFound() : Ok(user);
    }
}

public interface ICurrentUserService
{
    int UserId { get; }
    string Username { get; }
    string Role { get; }
    IReadOnlyList<string> Permissions { get; }
}
