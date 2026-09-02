namespace TechERP.Application.DTOs;

public class CategoryDto
{
    public int CategoryID { get; set; }
    public int Id { get => CategoryID; set => CategoryID = value; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get => CategoryName; set => CategoryName = value; }
    public string? Description { get; set; }
    public int ProductCount { get; set; }
    public bool IsActive { get; set; }
    public string Status { get => IsActive ? "active" : "inactive"; set => IsActive = value == "active"; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCategoryDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get => CategoryName; set => CategoryName = value; }
    public string? Description { get; set; }
}

public class UpdateCategoryDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get => CategoryName; set => CategoryName = value; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
