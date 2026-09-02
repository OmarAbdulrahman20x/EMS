namespace TechERP.Application.DTOs;

public class CustomerDto
{
    public int CustomerID { get; set; }
    public int Id { get => CustomerID; set => CustomerID = value; }
    public string CustomerName { get; set; } = string.Empty;
    public string Name { get => CustomerName; set => CustomerName = value; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string CustomerType { get; set; } = "individual";
    public string Type { get => CustomerType; set => CustomerType = value; }
    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
    public bool IsActive { get; set; }
    public string Status { get => IsActive ? "active" : "inactive"; set => IsActive = value == "active"; }
    public DateTime CreatedAt { get; set; }
    public int OrderCount { get; set; }
    public decimal TotalPurchases { get; set; }
    public DateTime? LastOrderDate { get; set; }
}

public class CreateCustomerDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string Name { get => CustomerName; set => CustomerName = value; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string CustomerType { get; set; } = "individual";
    public string Type { get => CustomerType; set => CustomerType = value; }
    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
}

public class UpdateCustomerDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string Name { get => CustomerName; set => CustomerName = value; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string CustomerType { get; set; } = "individual";
    public string Type { get => CustomerType; set => CustomerType = value; }
    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
}
