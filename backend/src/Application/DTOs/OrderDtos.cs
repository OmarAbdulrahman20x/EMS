namespace TechERP.Application.DTOs;

public class OrderDto
{
    public int OrderID { get; set; }
    public int Id { get => OrderID; set => OrderID = value; }
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerID { get; set; }
    public int CustomerId { get => CustomerID; set => CustomerID = value; }
    public string CustomerName { get; set; } = string.Empty;
    public int UserID { get; set; }
    public int UserId { get => UserID; set => UserID = value; }
    public int EmployeeId { get => UserID; set => UserID = value; }
    public string UserName { get; set; } = string.Empty;
    public string EmployeeName { get => UserName; set => UserName = value; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = "Pending";
    public decimal TotalAmount { get; set; }
    public decimal Total { get => TotalAmount; set => TotalAmount = value; }
    public string? Notes { get; set; }
    public IReadOnlyList<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
}

public class OrderItemDto
{
    public int OrderItemID { get; set; }
    public int Id { get => OrderItemID; set => OrderItemID = value; }
    public int OrderID { get; set; }
    public int OrderId { get => OrderID; set => OrderID = value; }
    public int ProductID { get; set; }
    public int ProductId { get => ProductID; set => ProductID = value; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string ProductSku { get => SKU; set => SKU = value; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }
    public decimal Subtotal { get => SubTotal; set => SubTotal = value; }
}

public class CreateOrderDto
{
    public int CustomerID { get; set; }
    public int CustomerId { get => CustomerID; set => CustomerID = value; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending";
    public string? Notes { get; set; }
    public IReadOnlyList<CreateOrderItemDto> Items { get; set; } = new List<CreateOrderItemDto>();
}

public class CreateOrderItemDto
{
    public int ProductID { get; set; }
    public int ProductId { get => ProductID; set => ProductID = value; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class UpdateOrderDto
{
    public string Status { get; set; } = "Pending";
    public string? Notes { get; set; }
    public IReadOnlyList<CreateOrderItemDto> Items { get; set; } = new List<CreateOrderItemDto>();
}
