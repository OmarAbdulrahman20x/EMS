// @ts-nocheck
import type {
  AuthUser,
  Category,
  Customer,
  DashboardCharts,
  InventorySummary,
  InventoryTransaction,
  KpiData,
  Order,
  OrderItem,
  PaginatedResponse,
  Product,
  QueryParams,
  Role,
  Supplier,
  User,
} from '@/types';
import {
  mockAuthUsers,
  mockCategories,
  mockCustomers,
  mockDashboardCharts,
  mockInventorySummary,
  mockInventoryTransactions,
  mockKpis,
  mockOrderItems,
  mockOrders,
  mockProducts,
  mockRoles,
  mockSuppliers,
  mockUsers,
} from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function paginate<T>(items: T[], params: QueryParams): PaginatedResponse<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return {
    data,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

function applySearch<T extends Record<string, unknown>>(
  items: T[],
  search: string,
  fields: (keyof T)[],
): T[] {
  if (!search) return items;
  const lower = search.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const val = item[field];
      return val != null && String(val).toLowerCase().includes(lower);
    }),
  );
}

function applySort<T>(items: T[], params: QueryParams): T[] {
  if (!params.sortBy) return items;
  const sorted = [...items].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[params.sortBy as string];
    const bVal = (b as Record<string, unknown>)[params.sortBy as string];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') return aVal - bVal;
    return String(aVal).localeCompare(String(bVal));
  });
  return params.sortOrder === 'desc' ? sorted.reverse() : sorted;
}

// --- Auth API ---
export const authApi = {
  async login(username: string, password: string): Promise<AuthUser> {
    await delay(600);
    const record = mockAuthUsers[username.toLowerCase()];
    if (!record || record.password !== password) {
      throw new Error('Invalid username or password');
    }
    return record.user;
  },
};

// --- Users API ---
export const usersApi = {
  async list(params: QueryParams = {}): Promise<PaginatedResponse<User>> {
    await delay(300);
    let items = [...mockUsers];
    items = applySearch(items, params.search ?? '', ['fullName', 'username', 'email']);
    if (params.roleId) items = items.filter((u) => u.roleId === Number(params.roleId));
    if (params.status) items = items.filter((u) => u.status === params.status);
    items = applySort(items, params);
    return paginate(items, params);
  },
  async getById(id: number): Promise<User> {
    await delay(200);
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },
  async create(data: Partial<User>): Promise<User> {
    await delay(400);
    const role = mockRoles.find((r) => r.id === data.roleId);
    const newUser: User = {
      id: Math.max(...mockUsers.map((u) => u.id)) + 1,
      fullName: data.fullName ?? '',
      username: data.username ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      roleId: data.roleId ?? 0,
      roleName: role?.name ?? '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  },
  async update(id: number, data: Partial<User>): Promise<User> {
    await delay(400);
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    const role = data.roleId ? mockRoles.find((r) => r.id === data.roleId) : undefined;
    mockUsers[idx] = {
      ...mockUsers[idx],
      ...data,
      roleName: role?.name ?? mockUsers[idx].roleName,
    };
    return mockUsers[idx];
  },
  async updateStatus(id: number, status: 'active' | 'inactive'): Promise<User> {
    await delay(300);
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    mockUsers[idx].status = status;
    return mockUsers[idx];
  },
};

// --- Roles API ---
export const rolesApi = {
  async list(): Promise<Role[]> {
    await delay(300);
    return [...mockRoles];
  },
  async getById(id: number): Promise<Role> {
    await delay(200);
    const role = mockRoles.find((r) => r.id === id);
    if (!role) throw new Error('Role not found');
    return role;
  },
  async create(data: Partial<Role>): Promise<Role> {
    await delay(400);
    const newRole: Role = {
      id: Math.max(...mockRoles.map((r) => r.id)) + 1,
      name: data.name ?? '',
      description: data.description ?? '',
      permissions: data.permissions ?? [],
      userCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockRoles.push(newRole);
    return newRole;
  },
  async update(id: number, data: Partial<Role>): Promise<Role> {
    await delay(400);
    const idx = mockRoles.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Role not found');
    mockRoles[idx] = { ...mockRoles[idx], ...data };
    return mockRoles[idx];
  },
  async delete(id: number): Promise<void> {
    await delay(300);
    const idx = mockRoles.findIndex((r) => r.id === id);
    if (idx !== -1) mockRoles.splice(idx, 1);
  },
};

// --- Customers API ---
export const customersApi = {
  async list(params: QueryParams = {}): Promise<PaginatedResponse<Customer>> {
    await delay(300);
    let items = [...mockCustomers];
    items = applySearch(items, params.search ?? '', ['name', 'phone', 'email']);
    if (params.type) items = items.filter((c) => c.type === params.type);
    if (params.status) items = items.filter((c) => c.status === params.status);
    if (params.city) items = items.filter((c) => c.city === params.city);
    items = applySort(items, params);
    return paginate(items, params);
  },
  async getById(id: number): Promise<Customer> {
    await delay(200);
    const customer = mockCustomers.find((c) => c.id === id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },
  async create(data: Partial<Customer>): Promise<Customer> {
    await delay(400);
    const newCustomer: Customer = {
      id: Math.max(...mockCustomers.map((c) => c.id)) + 1,
      name: data.name ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      type: data.type ?? 'individual',
      city: data.city ?? '',
      address: data.address ?? '',
      status: 'active',
      createdAt: new Date().toISOString(),
      orderCount: 0,
      totalPurchases: 0,
      lastOrderDate: null,
    };
    mockCustomers.push(newCustomer);
    return newCustomer;
  },
  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    await delay(400);
    const idx = mockCustomers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    mockCustomers[idx] = { ...mockCustomers[idx], ...data };
    return mockCustomers[idx];
  },
  async updateStatus(id: number, status: 'active' | 'inactive'): Promise<Customer> {
    await delay(300);
    const idx = mockCustomers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    mockCustomers[idx].status = status;
    return mockCustomers[idx];
  },
  async getOrders(id: number): Promise<Order[]> {
    await delay(200);
    return mockOrders.filter((o) => o.customerId === id);
  },
};

// --- Suppliers API ---
export const suppliersApi = {
  async list(params: QueryParams = {}): Promise<PaginatedResponse<Supplier>> {
    await delay(300);
    let items = [...mockSuppliers];
    items = applySearch(items, params.search ?? '', ['name', 'contactPerson', 'phone', 'email']);
    if (params.status) items = items.filter((s) => s.status === params.status);
    if (params.city) items = items.filter((s) => s.city === params.city);
    items = applySort(items, params);
    return paginate(items, params);
  },
  async getById(id: number): Promise<Supplier> {
    await delay(200);
    const supplier = mockSuppliers.find((s) => s.id === id);
    if (!supplier) throw new Error('Supplier not found');
    return supplier;
  },
  async create(data: Partial<Supplier>): Promise<Supplier> {
    await delay(400);
    const newSupplier: Supplier = {
      id: Math.max(...mockSuppliers.map((s) => s.id)) + 1,
      name: data.name ?? '',
      contactPerson: data.contactPerson ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      city: data.city ?? '',
      address: data.address ?? '',
      status: 'active',
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockSuppliers.push(newSupplier);
    return newSupplier;
  },
  async update(id: number, data: Partial<Supplier>): Promise<Supplier> {
    await delay(400);
    const idx = mockSuppliers.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Supplier not found');
    mockSuppliers[idx] = { ...mockSuppliers[idx], ...data };
    return mockSuppliers[idx];
  },
  async updateStatus(id: number, status: 'active' | 'inactive'): Promise<Supplier> {
    await delay(300);
    const idx = mockSuppliers.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Supplier not found');
    mockSuppliers[idx].status = status;
    return mockSuppliers[idx];
  },
  async getProducts(id: number): Promise<Product[]> {
    await delay(200);
    return mockProducts.filter((p) => p.supplierId === id);
  },
};

// --- Categories API ---
export const categoriesApi = {
  async list(params: QueryParams = {}): Promise<PaginatedResponse<Category>> {
    await delay(300);
    let items = [...mockCategories];
    items = applySearch(items, params.search ?? '', ['name', 'description']);
    if (params.status) items = items.filter((c) => c.status === params.status);
    items = applySort(items, params);
    return paginate(items, params);
  },
  async listAll(): Promise<Category[]> {
    await delay(200);
    return [...mockCategories];
  },
  async getById(id: number): Promise<Category> {
    await delay(200);
    const category = mockCategories.find((c) => c.id === id);
    if (!category) throw new Error('Category not found');
    return category;
  },
  async create(data: Partial<Category>): Promise<Category> {
    await delay(400);
    const newCategory: Category = {
      id: Math.max(...mockCategories.map((c) => c.id)) + 1,
      name: data.name ?? '',
      description: data.description ?? '',
      productCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    mockCategories.push(newCategory);
    return newCategory;
  },
  async update(id: number, data: Partial<Category>): Promise<Category> {
    await delay(400);
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    mockCategories[idx] = { ...mockCategories[idx], ...data };
    return mockCategories[idx];
  },
  async updateStatus(id: number, status: 'active' | 'inactive'): Promise<Category> {
    await delay(300);
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    mockCategories[idx].status = status;
    return mockCategories[idx];
  },
  async getProducts(id: number): Promise<Product[]> {
    await delay(200);
    return mockProducts.filter((p) => p.categoryId === id);
  },
};

// --- Products API ---
export const productsApi = {
  async list(params: QueryParams = {}): Promise<PaginatedResponse<Product>> {
    await delay(300);
    let items = [...mockProducts];
    items = applySearch(items, params.search ?? '', ['name', 'sku']);
    if (params.categoryId) items = items.filter((p) => p.categoryId === Number(params.categoryId));
    if (params.supplierId) items = items.filter((p) => p.supplierId === Number(params.supplierId));
    if (params.status) items = items.filter((p) => p.status === params.status);
    items = applySort(items, params);
    return paginate(items, params);
  },
  async listAll(): Promise<Product[]> {
    await delay(200);
    return [...mockProducts];
  },
  async getById(id: number): Promise<Product> {
    await delay(200);
    const product = mockProducts.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },
  async create(data: Partial<Product>): Promise<Product> {
    await delay(400);
    const category = mockCategories.find((c) => c.id === data.categoryId);
    const supplier = mockSuppliers.find((s) => s.id === data.supplierId);
    const newProduct: Product = {
      id: Math.max(...mockProducts.map((p) => p.id)) + 1,
      name: data.name ?? '',
      sku: data.sku ?? '',
      categoryId: data.categoryId ?? 0,
      categoryName: category?.name ?? '',
      supplierId: data.supplierId ?? 0,
      supplierName: supplier?.name ?? '',
      purchasePrice: data.purchasePrice ?? 0,
      sellingPrice: data.sellingPrice ?? 0,
      currentStock: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },
  async update(id: number, data: Partial<Product>): Promise<Product> {
    await delay(400);
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    const category = data.categoryId ? mockCategories.find((c) => c.id === data.categoryId) : undefined;
    const supplier = data.supplierId ? mockSuppliers.find((s) => s.id === data.supplierId) : undefined;
    mockProducts[idx] = {
      ...mockProducts[idx],
      ...data,
      categoryName: category?.name ?? mockProducts[idx].categoryName,
      supplierName: supplier?.name ?? mockProducts[idx].supplierName,
    };
    return mockProducts[idx];
  },
  async updateStatus(id: number, status: 'active' | 'inactive'): Promise<Product> {
    await delay(300);
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    mockProducts[idx].status = status;
    return mockProducts[idx];
  },
};

// --- Orders API ---
export const ordersApi = {
  async list(params: QueryParams = {}): Promise<PaginatedResponse<Order>> {
    await delay(300);
    let items = [...mockOrders];
    items = applySearch(items, params.search ?? '', ['orderNumber', 'customerName', 'employeeName']);
    if (params.customerId) items = items.filter((o) => o.customerId === Number(params.customerId));
    if (params.employeeId) items = items.filter((o) => o.employeeId === Number(params.employeeId));
    if (params.status) items = items.filter((o) => o.status === params.status);
    items = applySort(items, params);
    return paginate(items, params);
  },
  async getById(id: number): Promise<Order> {
    await delay(200);
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  },
  async create(data: Partial<Order>, items: Partial<OrderItem>[]): Promise<Order> {
    await delay(500);
    const customer = mockCustomers.find((c) => c.id === data.customerId);
    const newId = Math.max(...mockOrders.map((o) => o.id), 0) + 1;
    const orderItems: OrderItem[] = items.map((item, idx) => ({
      id: Math.max(...mockOrderItems.map((i) => i.id), 0) + idx + 1,
      orderId: newId,
      productId: item.productId ?? 0,
      productName: item.productName ?? '',
      productSku: item.productSku ?? '',
      quantity: item.quantity ?? 0,
      unitPrice: item.unitPrice ?? 0,
      subtotal: (item.quantity ?? 0) * (item.unitPrice ?? 0),
    }));
    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newOrder: Order = {
      id: newId,
      orderNumber: `ORD-2024-${String(newId).padStart(4, '0')}`,
      customerId: data.customerId ?? 0,
      customerName: customer?.name ?? '',
      employeeId: data.employeeId ?? 0,
      employeeName: data.employeeName ?? '',
      orderDate: data.orderDate ?? new Date().toISOString(),
      total,
      status: data.status ?? 'draft',
      notes: data.notes ?? '',
      items: orderItems,
    };
    mockOrders.push(newOrder);
    mockOrderItems.push(...orderItems);
    return newOrder;
  },
  async update(id: number, data: Partial<Order>): Promise<Order> {
    await delay(400);
    const idx = mockOrders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    mockOrders[idx] = { ...mockOrders[idx], ...data };
    return mockOrders[idx];
  },
  async confirm(id: number): Promise<Order> {
    await delay(400);
    const idx = mockOrders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    mockOrders[idx].status = 'confirmed';
    for (const item of mockOrders[idx].items) {
      const product = mockProducts.find((p) => p.id === item.productId);
      if (product) {
        product.currentStock = Math.max(0, product.currentStock - item.quantity);
        mockInventoryTransactions.push({
          id: Math.max(...mockInventoryTransactions.map((t) => t.id), 0) + 1,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          type: 'sale',
          quantity: item.quantity,
          reference: mockOrders[idx].orderNumber,
          notes: '',
          createdAt: new Date().toISOString(),
          createdBy: 'System',
        });
      }
    }
    return mockOrders[idx];
  },
  async cancel(id: number): Promise<Order> {
    await delay(400);
    const idx = mockOrders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    mockOrders[idx].status = 'cancelled';
    return mockOrders[idx];
  },
};

// --- Inventory API ---
export const inventoryApi = {
  async list(params: QueryParams = {}): Promise<PaginatedResponse<InventorySummary>> {
    await delay(300);
    let items = [...mockInventorySummary];
    items = applySearch(items, params.search ?? '', ['productName', 'productSku']);
    if (params.stockStatus) items = items.filter((i) => i.stockStatus === params.stockStatus);
    return paginate(items, params);
  },
  async getTransactions(params: QueryParams = {}): Promise<PaginatedResponse<InventoryTransaction>> {
    await delay(300);
    let items = [...mockInventoryTransactions];
    items = applySearch(items, params.search ?? '', ['productName', 'productSku', 'reference']);
    if (params.productId) items = items.filter((t) => t.productId === Number(params.productId));
    if (params.type) items = items.filter((t) => t.type === params.type);
    items = applySort(items, params);
    return paginate(items, params);
  },
  async createTransaction(data: Partial<InventoryTransaction>): Promise<InventoryTransaction> {
    await delay(400);
    const product = mockProducts.find((p) => p.id === data.productId);
    const newTransaction: InventoryTransaction = {
      id: Math.max(...mockInventoryTransactions.map((t) => t.id), 0) + 1,
      productId: data.productId ?? 0,
      productName: product?.name ?? '',
      productSku: product?.sku ?? '',
      type: data.type ?? 'in',
      quantity: data.quantity ?? 0,
      reference: data.reference ?? '',
      notes: data.notes ?? '',
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy ?? 'System',
    };
    mockInventoryTransactions.push(newTransaction);
    if (product) {
      const delta = data.type === 'in' || data.type === 'return'
        ? (data.quantity ?? 0)
        : -(data.quantity ?? 0);
      product.currentStock = Math.max(0, product.currentStock + delta);
      const summary = mockInventorySummary.find((s) => s.productId === product.id);
      if (summary) {
        summary.currentQuantity = product.currentStock;
        summary.lastTransactionType = newTransaction.type;
        summary.lastTransactionDate = newTransaction.createdAt;
        summary.stockStatus =
          product.currentStock === 0 ? 'out_of_stock' : product.currentStock < 10 ? 'low_stock' : 'in_stock';
      }
    }
    return newTransaction;
  },
};

// --- Dashboard API ---
export const dashboardApi = {
  async getKpis(): Promise<KpiData> {
    await delay(400);
    return { ...mockKpis };
  },
  async getCharts(): Promise<DashboardCharts> {
    await delay(500);
    return { ...mockDashboardCharts };
  },
};

// --- Reports API ---
export const reportsApi = {
  async salesReport(params: QueryParams = {}): Promise<PaginatedResponse<Order>> {
    await delay(400);
    let items = [...mockOrders].filter((o) => o.status !== 'draft');
    items = applySearch(items, params.search ?? '', ['orderNumber', 'customerName', 'employeeName']);
    if (params.status) items = items.filter((o) => o.status === params.status);
    if (params.customerId) items = items.filter((o) => o.customerId === Number(params.customerId));
    items = applySort(items, params);
    return paginate(items, params);
  },
  async productsReport(params: QueryParams = {}): Promise<PaginatedResponse<Product>> {
    await delay(400);
    let items = [...mockProducts];
    items = applySearch(items, params.search ?? '', ['name', 'sku']);
    if (params.categoryId) items = items.filter((p) => p.categoryId === Number(params.categoryId));
    items = applySort(items, params);
    return paginate(items, params);
  },
  async inventoryReport(params: QueryParams = {}): Promise<PaginatedResponse<InventorySummary>> {
    await delay(400);
    let items = [...mockInventorySummary];
    items = applySearch(items, params.search ?? '', ['productName', 'productSku']);
    if (params.stockStatus) items = items.filter((i) => i.stockStatus === params.stockStatus);
    return paginate(items, params);
  },
  async customersReport(params: QueryParams = {}): Promise<PaginatedResponse<Customer>> {
    await delay(400);
    let items = [...mockCustomers];
    items = applySearch(items, params.search ?? '', ['name', 'phone', 'email']);
    items = applySort(items, params);
    return paginate(items, params);
  },
};
