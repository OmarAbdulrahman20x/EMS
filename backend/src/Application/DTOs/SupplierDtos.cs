namespace TechERP.Application.DTOs;

public class SupplierDto
{
    public int SupplierID { get; set; }
    public int Id { get => SupplierID; set => SupplierID = value; }
    public string SupplierName { get; set; } = string.Empty;
    public string Name { get => SupplierName; set => SupplierName = value; }
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string Status { get => IsActive ? "active" : "inactive"; set => IsActive = value == "active"; }
    public int ProductCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSupplierDto
{
    public string SupplierName { get; set; } = string.Empty;
    public string Name { get => SupplierName; set => SupplierName = value; }
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public class UpdateSupplierDto
{
    public string SupplierName { get; set; } = string.Empty;
    public string Name { get => SupplierName; set => SupplierName = value; }
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
