using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace TechERP.API.Configuration;

public static class AuthorizationSetup
{
    public static IServiceCollection AddPermissionAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            var permissions = new[]
            {
                "dashboard.view", "users.manage", "roles.manage",
                "customers.view", "customers.manage",
                "suppliers.view", "suppliers.manage",
                "categories.view", "categories.manage",
                "products.view", "products.manage",
                "orders.view", "orders.manage", "orders.create",
                "inventory.view", "inventory.manage",
                "reports.sales", "reports.inventory", "reports.products", "reports.customers",
                "settings.manage",
            };

            foreach (var permission in permissions)
            {
                options.AddPolicy(permission, policy => policy.RequireAssertion(context =>
                    context.User.IsInRole("Admin") ||
                    context.User.HasClaim("permission", permission)));
            }
        });

        return services;
    }
}
