using Microsoft.EntityFrameworkCore;
using TechERP.Domain.Entities;

namespace TechERP.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("Users");
            e.Ignore(x => x.Id);
            e.Ignore(x => x.Username);
            e.Ignore(x => x.RoleId);
            e.HasKey(x => x.UserID);
            e.Property(x => x.FullName).IsRequired().HasMaxLength(100);
            e.Property(x => x.UserName).IsRequired().HasMaxLength(100);
            e.Property(x => x.Email).HasMaxLength(100).IsRequired(false);
            e.Property(x => x.Phone).HasMaxLength(20).IsRequired(false);
            e.Property(x => x.PasswordHash).IsRequired().HasMaxLength(255);
            e.HasIndex(x => x.UserName).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();

            e.HasOne(x => x.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(x => x.RoleID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Role>(e =>
        {
            e.ToTable("Roles");
            e.Ignore(x => x.Id);
            e.Ignore(x => x.Name);
            e.HasKey(x => x.RoleID);
            e.Property(x => x.RoleName).IsRequired().HasMaxLength(100);
            e.Property(x => x.Description).HasMaxLength(300).IsRequired(false);
            e.HasIndex(x => x.RoleName).IsUnique();
        });

        modelBuilder.Entity<Permission>(e =>
        {
            e.ToTable("Permissions");
            e.Ignore(x => x.Id);
            e.Ignore(x => x.Name);
            e.HasKey(x => x.PermissionID);
            e.Property(x => x.PermissionName).IsRequired().HasMaxLength(100);
            e.Property(x => x.Description).HasMaxLength(300).IsRequired(false);
            e.HasIndex(x => x.PermissionName).IsUnique();
        });

        modelBuilder.Entity<RolePermission>(e =>
        {
            e.ToTable("RolePermissions");
            e.HasKey(x => new { x.RoleID, x.PermissionID });

            e.HasOne(x => x.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(x => x.RoleID)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(x => x.PermissionID)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Customer>(e =>
        {
            e.ToTable("Customers");
            e.Ignore(x => x.Id);
            e.Ignore(x => x.Name);
            e.HasKey(x => x.CustomerID);
            e.Property(x => x.CustomerName).IsRequired().HasMaxLength(100);
            e.Property(x => x.Phone).IsRequired().HasMaxLength(20);
            e.Property(x => x.Email).HasMaxLength(100).IsRequired(false);
            e.Property(x => x.Address).HasMaxLength(255).IsRequired(false);
            e.Property(x => x.City).IsRequired().HasMaxLength(50);
            e.Property(x => x.CustomerType).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<Supplier>(e =>
        {
            e.ToTable("Suppliers");
            e.Ignore(x => x.Id);
            e.Ignore(x => x.Name);
            e.HasKey(x => x.SupplierID);
            e.Property(x => x.SupplierName).IsRequired().HasMaxLength(100);
            e.Property(x => x.ContactPerson).IsRequired().HasMaxLength(100);
            e.Property(x => x.Phone).IsRequired().HasMaxLength(20);
            e.Property(x => x.Email).HasMaxLength(100).IsRequired(false);
            e.Property(x => x.Address).IsRequired().HasMaxLength(255);
            e.Property(x => x.City).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.ToTable("Categories");
            e.Ignore(x => x.Id);
            e.Ignore(x => x.Name);
            e.HasKey(x => x.CategoryID);
            e.Property(x => x.CategoryName).IsRequired().HasMaxLength(100);
            e.Property(x => x.Description).HasMaxLength(300).IsRequired(false);
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("Products");
            e.Ignore(x => x.Id);
            e.Ignore(x => x.Name);
            e.Ignore(x => x.Sku);
            e.Ignore(x => x.CategoryId);
            e.Ignore(x => x.SupplierId);
            e.HasKey(x => x.ProductID);
            e.Property(x => x.ProductName).IsRequired().HasMaxLength(100);
            e.Property(x => x.SKU).IsRequired().HasMaxLength(20);
            e.HasIndex(x => x.SKU).IsUnique();
            e.Property(x => x.PurchasePrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.SellingPrice).HasColumnType("decimal(18,2)");

            e.HasOne(x => x.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(x => x.CategoryID)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Supplier)
                .WithMany(s => s.Products)
                .HasForeignKey(x => x.SupplierID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("Orders");
            e.Ignore(x => x.Id);
            e.Ignore(x => x.CustomerId);
            e.Ignore(x => x.UserId);
            e.Ignore(x => x.Total);
            e.Ignore(x => x.Employee);
            e.HasKey(x => x.OrderID);
            e.Property(x => x.OrderNumber)
                .IsRequired()
                .HasMaxLength(20);

            e.HasIndex(x => x.OrderNumber)
                .IsUnique();
            e.Property(x => x.Status).IsRequired().HasMaxLength(20);
            e.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
            e.Property(x => x.Notes).HasMaxLength(500).IsRequired(false);

            e.HasOne(x => x.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(x => x.CustomerID)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(x => x.UserID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.ToTable("OrderItems");
            e.Ignore(x => x.Id);
            e.Ignore(x => x.OrderId);
            e.Ignore(x => x.ProductId);
            e.HasKey(x => x.OrderItemID);
            e.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");

            e.Property(x => x.SubTotal)
                .HasColumnType("decimal(18,2)")
                .HasComputedColumnSql("Quantity * UnitPrice", stored: true);

            e.HasOne(x => x.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(x => x.OrderID)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(x => x.ProductID)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<InventoryTransaction>(e =>
        {
            e.ToTable("InventoryTransactions");
            e.Ignore(x => x.Id);
            e.Ignore(x => x.ProductId);
            e.Ignore(x => x.UserId);
            e.Ignore(x => x.Reference);
            e.Ignore(x => x.CreatedByUserId);
            e.Ignore(x => x.CreatedByUser);
            e.HasKey(x => x.TransactionID);
            e.Property(x => x.TransactionType).IsRequired().HasMaxLength(20);
            e.Property(x => x.ReferenceType).HasMaxLength(20).IsRequired(false);
            e.Property(x => x.ReferenceID).IsRequired(false);
            e.Property(x => x.Notes).HasMaxLength(500).IsRequired(false);

            e.HasOne(x => x.Product)
                .WithMany(p => p.InventoryTransactions)
                .HasForeignKey(x => x.ProductID)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.User)
                .WithMany(u => u.InventoryTransactions)
                .HasForeignKey(x => x.UserID)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
