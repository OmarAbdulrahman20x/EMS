export type UserRole = 'Admin' | 'Sales Employee' | 'Inventory Employee';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  roleId: number;
  roleName: string;
  status: UserStatus;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

export type PermissionKey =
  | 'dashboard.view'
  | 'users.manage'
  | 'roles.manage'
  | 'customers.view'
  | 'customers.manage'
  | 'suppliers.view'
  | 'suppliers.manage'
  | 'categories.view'
  | 'categories.manage'
  | 'products.view'
  | 'products.manage'
  | 'orders.view'
  | 'orders.manage'
  | 'orders.create'
  | 'inventory.view'
  | 'inventory.manage'
  | 'reports.sales'
  | 'reports.inventory'
  | 'reports.products'
  | 'reports.customers'
  | 'settings.manage';

export interface Permission {
  key: string;
  group: string;
}

export type CustomerType = 'individual' | 'business';
export type CustomerStatus = 'active' | 'inactive';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  type: CustomerType;
  city: string;
  address: string;
  status: CustomerStatus;
  createdAt: string;
  orderCount: number;
  totalPurchases: number;
  lastOrderDate: string | null;
}

export type SupplierStatus = 'active' | 'inactive';

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  status: SupplierStatus;
  productCount: number;
  createdAt: string;
}

export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
  status: CategoryStatus;
  createdAt: string;
}

export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  categoryName: string;
  supplierId: number;
  supplierName: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  status: ProductStatus;
  createdAt: string;
}

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  employeeId: number;
  employeeName: string;
  orderDate: string;
  total: number;
  status: OrderStatus;
  notes: string;
  items: OrderItem[];
}

export type InventoryTransactionType = 'in' | 'out' | 'sale' | 'return' | 'adjustment';

export interface InventoryTransaction {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  type: InventoryTransactionType;
  quantity: number;
  reference: string;
  notes: string;
  createdAt: string;
  createdBy: string;
}

export interface InventorySummary {
  productId: number;
  productName: string;
  productSku: string;
  currentQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastTransactionType: InventoryTransactionType;
  lastTransactionDate: string;
}

export interface KpiData {
  totalSales: number;
  totalProfit: number;
  customerCount: number;
  orderCount: number;
  bestSellingProduct: { name: string; unitsSold: number } | null;
  leastSellingProduct: { name: string; unitsSold: number } | null;
  topCustomer: { name: string; totalPurchases: number } | null;
}

export interface DashboardCharts {
  monthlySales: { month: string; sales: number; profit: number }[];
  salesComparison: { period: string; current: number; previous: number }[];
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  topCustomers: { name: string; totalPurchases: number }[];
  categoryDistribution: { category: string; sales: number; percentage: number }[];
}

export type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface AuthUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}
