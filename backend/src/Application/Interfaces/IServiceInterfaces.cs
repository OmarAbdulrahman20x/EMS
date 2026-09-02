using TechERP.Application.DTOs;

namespace TechERP.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<IReadOnlyList<string>> GetUserPermissionsAsync(int userId);
}

public interface IUserService
{
    Task<PaginatedResponse<UserDto>> GetUsersAsync(QueryParams queryParams, int? roleId = null, string? status = null);
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto);
    Task<UserDto> UpdateUserStatusAsync(int id, bool isActive);

}

public interface IRoleService
{
    Task<IReadOnlyList<RoleDto>> GetRolesAsync();
    Task<RoleDto?> GetRoleByIdAsync(int id);
    Task<RoleDto> CreateRoleAsync(CreateRoleDto dto);
    Task<RoleDto> UpdateRoleAsync(int id, UpdateRoleDto dto);
    Task DeleteRoleAsync(int id);
}

public interface ICustomerService
{
    Task<PaginatedResponse<CustomerDto>> GetCustomersAsync(QueryParams queryParams, string? type = null, string? status = null, string? city = null);
    Task<CustomerDto?> GetCustomerByIdAsync(int id);
    Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto);
    Task<CustomerDto> UpdateCustomerAsync(int id, UpdateCustomerDto dto);
    Task<CustomerDto> UpdateCustomerStatusAsync(int id, string status);
    Task<IReadOnlyList<OrderDto>> GetCustomerOrdersAsync(int customerId);
}

public interface ISupplierService
{
    Task<PaginatedResponse<SupplierDto>> GetSuppliersAsync(QueryParams queryParams, string? status = null, string? city = null);
    Task<SupplierDto?> GetSupplierByIdAsync(int id);
    Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto);
    Task<SupplierDto> UpdateSupplierAsync(int id, UpdateSupplierDto dto);
    Task<SupplierDto> UpdateSupplierStatusAsync(int id, string status);
}

public interface ICategoryService
{
    Task<PaginatedResponse<CategoryDto>> GetCategoriesAsync(QueryParams queryParams, string? status = null);
    Task<IReadOnlyList<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto?> GetCategoryByIdAsync(int id);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto);
    Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryDto dto);
    Task<CategoryDto> UpdateCategoryStatusAsync(int id, string status);
}

public interface IProductService
{
    Task<PaginatedResponse<ProductDto>> GetProductsAsync(QueryParams queryParams, int? categoryId = null, int? supplierId = null, string? status = null);
    Task<IReadOnlyList<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto dto);
    Task<ProductDto> UpdateProductStatusAsync(int id, string status);
}

public interface IOrderService
{
    Task<PaginatedResponse<OrderDto>> GetOrdersAsync(QueryParams queryParams, int? customerId = null, int? employeeId = null, string? status = null, DateTime? fromDate = null, DateTime? toDate = null);
    Task<OrderDto?> GetOrderByIdAsync(int id);
    Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, int employeeId);
    Task<OrderDto> UpdateOrderAsync(int id, UpdateOrderDto dto);
    Task<OrderDto> ConfirmOrderAsync(int id);
    Task<OrderDto> CancelOrderAsync(int id);
}

public interface IInventoryService
{
    Task<PaginatedResponse<InventorySummaryDto>> GetInventorySummaryAsync(QueryParams queryParams, string? stockStatus = null);
    Task<PaginatedResponse<InventoryTransactionDto>> GetTransactionsAsync(QueryParams queryParams, int? productId = null, string? type = null);
    Task<IReadOnlyList<InventoryTransactionDto>> GetTransactionsByProductAsync(int productId);
    Task<InventoryTransactionDto> CreateTransactionAsync(CreateInventoryTransactionDto dto, int userId);
}

public interface IDashboardService
{
    Task<KpiDto> GetKpisAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<DashboardChartsDto> GetChartsAsync(DateTime? fromDate = null, DateTime? toDate = null);
}

public interface IReportsService
{
    Task<PaginatedResponse<OrderDto>> GetSalesReportAsync(QueryParams queryParams, int? customerId = null, string? status = null, DateTime? fromDate = null, DateTime? toDate = null);
    Task<PaginatedResponse<ProductDto>> GetProductsReportAsync(QueryParams queryParams, int? categoryId = null);
    Task<PaginatedResponse<InventorySummaryDto>> GetInventoryReportAsync(QueryParams queryParams, string? stockStatus = null);
    Task<PaginatedResponse<CustomerDto>> GetCustomersReportAsync(QueryParams queryParams);
}
