using Microsoft.EntityFrameworkCore;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Entities;
using TechERP.Infrastructure.Data;

namespace TechERP.Application.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _context;

    public CustomerService(AppDbContext context) => _context = context;

    public async Task<PaginatedResponse<CustomerDto>> GetCustomersAsync(QueryParams qp, string? type = null, string? status = null, string? city = null)
    {
        var query = _context.Customers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(qp.Search))
        {
            var lower = qp.Search.ToLower();
            query = query.Where(c => c.CustomerName.ToLower().Contains(lower) || c.Phone.Contains(lower) || c.Email.ToLower().Contains(lower));
        }
        if (!string.IsNullOrEmpty(type) && type != "all") query = query.Where(c => c.CustomerType == type);
        if (!string.IsNullOrEmpty(status) && status != "all") query = query.Where(c => c.IsActive == (status == "active"));
        if (!string.IsNullOrEmpty(city) && city != "all") query = query.Where(c => c.City == city);

        var total = await query.CountAsync();
        var customers = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((qp.Page - 1) * qp.PageSize)
            .Take(qp.PageSize)
            .ToListAsync();

        var dtos = new List<CustomerDto>();
        foreach (var c in customers)
        {
            var dto = MapToDto(c);
            dto.OrderCount = await _context.Orders.CountAsync(o => o.CustomerID == c.CustomerID && o.Status != "cancelled");
            dto.TotalPurchases = await _context.Orders.Where(o => o.CustomerID == c.CustomerID && o.Status != "draft" && o.Status != "cancelled").SumAsync(o => o.TotalAmount);
            var lastOrder = await _context.Orders.Where(o => o.CustomerID == c.CustomerID).OrderByDescending(o => o.OrderDate).FirstOrDefaultAsync();
            dto.LastOrderDate = lastOrder?.OrderDate;
            dtos.Add(dto);
        }

        return new PaginatedResponse<CustomerDto> { Data = dtos, Total = total, Page = qp.Page, PageSize = qp.PageSize, TotalPages = (int)Math.Ceiling((double)total / qp.PageSize) };
    }

    public async Task<CustomerDto?> GetCustomerByIdAsync(int id)
    {
        var customer = await _context.Customers.FindAsync(id);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto)
    {
        var customer = new Customer
        {
            CustomerName = dto.Name, Phone = dto.Phone, Email = dto.Email,
            CustomerType = dto.Type, City = dto.City, Address = dto.Address,
            IsActive = true, CreatedAt = DateTime.UtcNow,
        };
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return MapToDto(customer);
    }

    public async Task<CustomerDto> UpdateCustomerAsync(int id, UpdateCustomerDto dto)
    {
        var customer = await _context.Customers.FindAsync(id) ?? throw new KeyNotFoundException("Customer not found");
        customer.CustomerName = dto.Name; customer.Phone = dto.Phone; customer.Email = dto.Email;
        customer.CustomerType = dto.Type; customer.City = dto.City; customer.Address = dto.Address;
        customer.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapToDto(customer);
    }

    public async Task<CustomerDto> UpdateCustomerStatusAsync(int id, string status)
    {
        var customer = await _context.Customers.FindAsync(id) ?? throw new KeyNotFoundException("Customer not found");
        customer.IsActive = status == "active";
        customer.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapToDto(customer);
    }

    public async Task<IReadOnlyList<OrderDto>> GetCustomerOrdersAsync(int customerId)
    {
        var orders = await _context.Orders
            .Include(o => o.Customer).Include(o => o.User).Include(o => o.OrderItems)
            .Where(o => o.CustomerID == customerId)
            .OrderByDescending(o => o.OrderDate)
            .AsNoTracking()
            .Select(o => OrderService.MapToDto(o))
            .ToListAsync();
        return orders;
    }

    internal static CustomerDto MapToDto(Customer c) => new()
    {
        Id = c.CustomerID, Name = c.CustomerName, Phone = c.Phone, Email = c.Email,
        Type = c.CustomerType, City = c.City, Address = c.Address,
        Status = c.IsActive ? "active" : "inactive", CreatedAt = c.CreatedAt,
    };
}