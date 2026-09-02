using Microsoft.EntityFrameworkCore;
using TechERP.Application.DTOs;
using TechERP.Application.Interfaces;
using TechERP.Domain.Interfaces;
using TechERP.Infrastructure.Data;

namespace TechERP.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;
    private readonly IInventoryRepository _repo;

    public InventoryService(AppDbContext context, IInventoryRepository repo)
    {
        _context = context;
        _repo = repo;
    }

    public async Task<PaginatedResponse<InventorySummaryDto>> GetInventorySummaryAsync(QueryParams qp, string? stockStatus = null)
    {
        var summaries = await _repo.GetInventorySummaryAsync(qp.Search, stockStatus, qp.Page, qp.PageSize);
        var total = await _repo.GetInventorySummaryCountAsync(qp.Search, stockStatus);

        var dtos = summaries.Select(s => new InventorySummaryDto
        {
            ProductId = s.ProductId, ProductName = s.ProductName, ProductSku = s.ProductSku,
            CurrentQuantity = s.CurrentQuantity, StockStatus = s.StockStatus,
            LastTransactionType = s.LastTransactionType, LastTransactionDate = s.LastTransactionDate,
        }).ToList();

        return new PaginatedResponse<InventorySummaryDto> { Data = dtos, Total = total, Page = qp.Page, PageSize = qp.PageSize, TotalPages = (int)Math.Ceiling((double)total / qp.PageSize) };
    }

    public async Task<PaginatedResponse<InventoryTransactionDto>> GetTransactionsAsync(QueryParams qp, int? productId = null, string? type = null)
    {
        var transactions = await _repo.GetTransactionsAsync(productId, type, qp.Search, qp.SortBy, qp.SortOrder, qp.Page, qp.PageSize);
        var total = await _repo.GetTransactionsCountAsync(productId, type, qp.Search);

        var dtos = transactions.Select(MapToDto).ToList();

        return new PaginatedResponse<InventoryTransactionDto> { Data = dtos, Total = total, Page = qp.Page, PageSize = qp.PageSize, TotalPages = (int)Math.Ceiling((double)total / qp.PageSize) };
    }

    public async Task<IReadOnlyList<InventoryTransactionDto>> GetTransactionsByProductAsync(int productId)
    {
        var transactions = await _repo.GetTransactionsByProductAsync(productId);
        return transactions.Select(MapToDto).ToList();
    }

    public async Task<InventoryTransactionDto> CreateTransactionAsync(CreateInventoryTransactionDto dto, int userId)
    {
        var product = await _context.Products.FindAsync(dto.ProductId) ?? throw new KeyNotFoundException("Product not found");

        var transaction = new Domain.Entities.InventoryTransaction
        {
            ProductId = dto.ProductId, TransactionType = dto.Type,
            Quantity = dto.Quantity, Reference = dto.Reference,
            Notes = dto.Notes, CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
        };

        await _repo.AddTransactionAsync(transaction);
        return MapToDto(transaction);
    }

    private static InventoryTransactionDto MapToDto(Domain.Entities.InventoryTransaction t) => new()
    {
        Id = t.Id, ProductId = t.ProductId, ProductName = t.Product?.Name ?? "",
        ProductSku = t.Product?.Sku ?? "", Type = t.TransactionType,
        Quantity = t.Quantity, Reference = t.Reference, Notes = t.Notes,
        CreatedAt = t.CreatedAt, CreatedBy = t.CreatedByUser?.FullName ?? "",
    };
}
