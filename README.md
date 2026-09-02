# TechERP — Enterprise Management System

A professional internal business management platform for a technology/electronics company. Employees use it to manage customers, suppliers, products, orders, inventory, users, roles, permissions, dashboards, and reports.

## Technology Stack

**Frontend:**
- React + TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Context (Auth, Theme, Language)
- Internationalization (Arabic / English) with RTL/LTR support
- Light / Dark mode
- Recharts for professional charts
- Vite

**Backend:**
- ASP.NET Core Web API (C#)
- REST API with JSON
- JWT Authentication
- Role-Based Authorization
- Entity Framework Core
- Pomelo MySQL Provider
- Swagger / OpenAPI

**Database:**
- MySQL (11 tables — see below)

## Project Structure

```
project/
├── src/                          # Frontend (React + TypeScript + Vite)
│   ├── features/                 # Feature-based modules
│   ├── components/               # Shared UI, layout, tables
│   ├── contexts/                 # Auth, Theme, Language
│   ├── services/                 # Mock API layer (swap for real API)
│   ├── types/                    # Shared TypeScript types
│   └── locales/                  # Arabic / English translations
│
└── backend/                      # Backend (ASP.NET Core)
    └── src/
        ├── API/                  # Controllers, Middleware, Configuration
        ├── Application/          # DTOs, Services, Interfaces
        ├── Domain/               # Entities, Enums, Interfaces
        └── Infrastructure/       # DbContext, Repositories
```

## Database Structure (MySQL)

The database contains exactly 11 tables, created manually in MySQL:

1. **Users** — employees who use the system
2. **Roles** — Admin, Sales Employee, Inventory Employee
3. **Permissions** — individual permission keys
4. **RolePermissions** — many-to-many between Roles and Permissions
5. **Customers** — customer records
6. **Suppliers** — supplier records
7. **Categories** — product categories
8. **Products** — product catalog
9. **Orders** — sales orders
10. **OrderItems** — line items within orders
11. **InventoryTransactions** — stock movements (in, out, sale, return, adjustment)

Dashboard and Reports do NOT have their own tables — they are computed from the tables above.

### Creating the Database

Create the MySQL database and tables manually. The EF Core `AppDbContext` maps to these table names exactly (case-sensitive on Linux). Example:

```sql
CREATE DATABASE TechERP CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE TechERP;

-- Create tables matching the entity configurations in:
-- backend/src/Infrastructure/Data/AppDbContext.cs
```

See `AppDbContext.OnModelCreating` for column types, constraints, and indexes.

## Frontend Setup

### Prerequisites
- Node.js 18+
- npm

### Installation & Running

```bash
npm install
npm run dev
```

The dev server starts automatically. The app runs at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Environment Variables

No environment variables are required for the frontend during mock-data mode. When connecting to the real backend, set:

```
VITE_API_URL=http://localhost:5000/api
```

### Switching from Mock API to Real API

The frontend uses a mock service layer (`src/services/mockApi.ts`). To connect to the real ASP.NET Core backend:
1. Set `VITE_API_URL` in `.env`
2. Replace mock API calls with real `fetch`/`axios` calls using the same DTO shapes
3. The TypeScript types in `src/types/index.ts` already match the backend DTOs

## Backend Setup

### Prerequisites
- .NET 8 SDK
- MySQL 8+

### Configuration

Edit `backend/src/API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=TechERP;User=root;Password=your_password;"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!!",
    "Issuer": "TechERP.API",
    "Audience": "TechERP.Client",
    "ExpireDays": 7
  }
}
```

### Running the Backend

```bash
cd backend
dotnet restore
dotnet build
cd src/API
dotnet run
```

The API runs at `http://localhost:5000` (or the port configured in `launchSettings.json`).

### Swagger

When running in Development mode, Swagger UI is available at:

```
http://localhost:5000/swagger
```

Use it to explore and test all API endpoints.

## Roles & Permissions

### Three Default Roles

| Role | Access |
|------|--------|
| **Admin** | Full access to all features |
| **Sales Employee** | Customers (view/add/edit), Products (view/search), Orders (create/view/edit/cancel), Sales dashboard & reports |
| **Inventory Employee** | Products (view/add/edit), Categories (view/add/edit), Suppliers (view/add/edit), Inventory (view/record), Inventory reports |

### Permission Keys

The backend enforces these permission claims via JWT:

- `dashboard.view`
- `users.manage`, `roles.manage`
- `customers.view`, `customers.manage`
- `suppliers.view`, `suppliers.manage`
- `categories.view`, `categories.manage`
- `products.view`, `products.manage`
- `orders.view`, `orders.manage`, `orders.create`
- `inventory.view`, `inventory.manage`
- `reports.sales`, `reports.inventory`, `reports.products`, `reports.customers`
- `settings.manage`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate and receive JWT |
| GET | `/api/auth/me` | Get current authenticated user |
| GET/POST/PUT/PATCH | `/api/users` | User management |
| GET/POST/PUT/DELETE | `/api/roles` | Role & permission management |
| GET/POST/PUT/PATCH | `/api/customers` | Customer management |
| GET/POST/PUT/PATCH | `/api/suppliers` | Supplier management |
| GET/POST/PUT/PATCH | `/api/categories` | Category management |
| GET/POST/PUT/PATCH | `/api/products` | Product management |
| GET/POST/PUT | `/api/orders` | Order management |
| POST | `/api/orders/{id}/confirm` | Confirm an order |
| POST | `/api/orders/{id}/cancel` | Cancel an order |
| GET/POST | `/api/inventory/transactions` | Inventory transactions |
| GET | `/api/inventory` | Inventory summary |
| GET | `/api/dashboard` | Dashboard KPIs + charts |
| GET | `/api/reports/sales` | Sales report |
| GET | `/api/reports/products` | Products report |
| GET | `/api/reports/inventory` | Inventory report |
| GET | `/api/reports/customers` | Customers report |

## Assumptions

1. The MySQL database is created manually; EF Core maps to existing tables (code-first configuration, no auto-migrations).
2. Password hashing uses ASP.NET Core's `PasswordHasher<T>`.
3. JWT tokens expire after 7 days by default (configurable via `Jwt:ExpireDays`).
4. Stock is always derived from `InventoryTransactions` — the `Products` table does not store a quantity column.
5. Soft-delete (deactivation) is preferred over hard-delete for records with relationships.
6. The frontend ships with mock data that matches the exact API response shapes, so swapping to the real backend requires minimal changes.
7. CORS is open (`AllowAnyOrigin`) for development — restrict in production.
