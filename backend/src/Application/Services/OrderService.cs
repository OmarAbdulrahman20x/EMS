using Microsoft.EntityFrameworkCore;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Entities;
using TechERP.Infrastructure.Data;

namespace TechERP.Application.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context) => _context = context;

    public async Task<PaginatedResponse<OrderDto>> GetOrdersAsync(
        QueryParams qp,
        int? customerId = null,
        int? userId = null,
        string? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.User)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(qp.Search))
        {
            var lower = qp.Search.ToLower();

            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(lower) ||
                o.Customer.CustomerName.ToLower().Contains(lower) ||
                o.User.FullName.ToLower().Contains(lower));
        }

        if (customerId.HasValue)
            query = query.Where(o => o.CustomerID == customerId.Value);

        if (userId.HasValue)
            query = query.Where(o => o.UserID == userId.Value);

        if (!string.IsNullOrEmpty(status) && status != "all")
            query = query.Where(o => o.Status == status);

        if (fromDate.HasValue)
            query = query.Where(o => o.OrderDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.OrderDate <= toDate.Value);

        var total = await query.CountAsync();

        var orders = await query
            .OrderByDescending(o => o.OrderDate)
            .Skip((qp.Page - 1) * qp.PageSize)
            .Take(qp.PageSize)
            .ToListAsync();

        var dtos = orders.Select(MapToDto).ToList();

        return new PaginatedResponse<OrderDto>
        {
            Data = dtos,
            Total = total,
            Page = qp.Page,
            PageSize = qp.PageSize,
            TotalPages = (int)Math.Ceiling((double)total / qp.PageSize)
        };
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.User)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.OrderID == id);

        return order == null ? null : MapToDto(order);
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, int userId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var order = new Order
            {
                OrderNumber = $"ORD-{DateTime.UtcNow.Year}-{new Random().Next(1000, 9999)}",
                CustomerID = dto.CustomerID,
                UserID = userId,
                OrderDate = dto.OrderDate,
                Status = dto.Status,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var item in dto.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductID)
                    ?? throw new KeyNotFoundException(
                        $"Product {item.ProductID} not found");

                if (dto.Status == "Completed" || dto.Status == "Pending")
                {
                    var currentStock = await GetCurrentStockAsync(item.ProductID);

                    if (item.Quantity > currentStock)
                    {
                        throw new InvalidOperationException(
                            $"Insufficient stock for {product.ProductName}. Available: {currentStock}");
                    }
                }

                var orderItem = new OrderItem
                {
                    ProductID = item.ProductID,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                };

                order.OrderItems.Add(orderItem);
                order.TotalAmount += item.Quantity * item.UnitPrice;
            }

            _context.Orders.Add(order);

            await _context.SaveChangesAsync();

            if (dto.Status == "Completed")
                await CreateSaleTransactionsAsync(order);

            await transaction.CommitAsync();

            return MapToDto(order);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    public async Task<OrderDto> UpdateOrderAsync(
        int id,
        UpdateOrderDto dto)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderID == id)
            ?? throw new KeyNotFoundException("Order not found");

        if (order.Status == "Completed" || order.Status == "Cancelled")
            throw new InvalidOperationException(
                "Completed or cancelled orders cannot be edited");

        order.Status = dto.Status;
        order.Notes = dto.Notes;

        order.OrderItems.Clear();
        order.TotalAmount = 0;

        foreach (var item in dto.Items)
        {
            var productExists = await _context.Products
                .AnyAsync(p => p.ProductID == item.ProductID);

            if (!productExists)
            {
                throw new KeyNotFoundException(
                    $"Product {item.ProductID} not found");
            }

            var orderItem = new OrderItem
            {
                ProductID = item.ProductID,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            };

            order.OrderItems.Add(orderItem);
            order.TotalAmount += item.Quantity * item.UnitPrice;
        }

        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        if (dto.Status == "Completed")
            await CreateSaleTransactionsAsync(order);

        return MapToDto(order);
    }

    public async Task<OrderDto> ConfirmOrderAsync(int id)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderID == id)
                ?? throw new KeyNotFoundException("Order not found");

            if (order.Status == "Completed")
                throw new InvalidOperationException(
                    "Order is already completed");

            if (order.Status == "Cancelled")
                throw new InvalidOperationException(
                    "Cancelled orders cannot be completed");

            foreach (var item in order.OrderItems)
            {
                var currentStock = await GetCurrentStockAsync(item.ProductID);

                if (item.Quantity > currentStock)
                {
                    var product = await _context.Products
                        .FindAsync(item.ProductID);

                    throw new InvalidOperationException(
                        $"Insufficient stock for {product?.ProductName}. Available: {currentStock}");
                }
            }

            order.Status = "Completed";
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await CreateSaleTransactionsAsync(order);

            await transaction.CommitAsync();

            return MapToDto(order);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderDto> CancelOrderAsync(int id)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.OrderID == id)
            ?? throw new KeyNotFoundException("Order not found");

        if (order.Status == "Completed")
            throw new InvalidOperationException(
                "Completed orders cannot be cancelled");

        if (order.Status == "Cancelled")
            throw new InvalidOperationException(
                "Order is already cancelled");

        order.Status = "Cancelled";
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(order);
    }

    private async Task CreateSaleTransactionsAsync(Order order)
    {
        foreach (var item in order.OrderItems)
        {
            _context.InventoryTransactions.Add(
                new InventoryTransaction
                {
                    ProductID = item.ProductID,
                    UserID = order.UserID,
                    TransactionType = "OUT",
                    Quantity = item.Quantity,
                    ReferenceType = "SALE",
                    ReferenceID = order.OrderID,
                    CreatedAt = DateTime.UtcNow
                });
        }

        await _context.SaveChangesAsync();
    }

    private async Task<int> GetCurrentStockAsync(int productId)
    {
        var transactions = await _context.InventoryTransactions
            .Where(t => t.ProductID == productId)
            .AsNoTracking()
            .ToListAsync();

        return transactions.Sum(t =>
            t.TransactionType switch
            {
                "IN" => t.Quantity,
                "OUT" => -t.Quantity,
                "ADJUSTMENT" => t.Quantity,
                _ => 0
            });
    }

    internal static OrderDto MapToDto(Order order) => new()
    {
        OrderID = order.OrderID,
        OrderNumber = order.OrderNumber,
        CustomerID = order.CustomerID,
        CustomerName = order.Customer?.CustomerName ?? string.Empty,
        UserID = order.UserID,
        UserName = order.User?.FullName ?? string.Empty,
        OrderDate = order.OrderDate,
        TotalAmount = order.TotalAmount,
        Status = order.Status,
        Notes = order.Notes,

        Items = order.OrderItems
            .Select(oi => new OrderItemDto
            {
                OrderItemID = oi.OrderItemID,
                OrderID = oi.OrderID,
                ProductID = oi.ProductID,
                ProductName = oi.Product?.ProductName ?? string.Empty,
                SKU = oi.Product?.SKU ?? string.Empty,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                SubTotal = oi.SubTotal
            })
            .ToList()
    };
}