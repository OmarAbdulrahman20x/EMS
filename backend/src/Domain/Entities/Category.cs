namespace TechERP.Domain.Entities;

public class Category
{
    public int CategoryID { get; set; }
    public int Id { get => CategoryID; set => CategoryID = value; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get => CategoryName; set => CategoryName = value; }
    public string Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
