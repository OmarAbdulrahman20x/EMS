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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
const STORAGE_KEY = 'techerp-auth';

function authToken() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return (JSON.parse(stored) as AuthUser).token;
  } catch {
    return null;
  }
}

function queryString(params: QueryParams = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = authToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `API request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function statusFromActive(isActive: boolean | undefined) {
  return isActive === false ? 'inactive' : 'active';
}

function orderStatus(status: string | undefined) {
  return (status ?? 'pending').toLowerCase() as Order['status'];
}

function apiOrderStatus(status: string | undefined) {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function txType(type: string | undefined) {
  return (type ?? 'in').toLowerCase() as InventoryTransaction['type'];
}

function apiTxType(type: string | undefined) {
  const normalized = (type ?? 'in').toLowerCase();
  if (normalized === 'sale') return 'OUT';
  if (normalized === 'return') return 'IN';
  if (normalized === 'adjustment') return 'ADJUSTMENT';
  return normalized.toUpperCase();
}

function page<TIn, TOut>(input: PaginatedResponse<TIn>, map: (item: TIn) => TOut): PaginatedResponse<TOut> {
  return {
    data: input.data.map(map),
    total: input.total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: input.totalPages,
  };
}

type ApiUser = User & { userID?: number; userName?: string; roleID?: number; isActive?: boolean };
type ApiRole = Role & { roleID?: number; roleName?: string };
type ApiCustomer = Customer & { customerID?: number; customerName?: string; customerType?: Customer['type']; isActive?: boolean };
type ApiSupplier = Supplier & { supplierID?: number; supplierName?: string; isActive?: boolean };
type ApiCategory = Category & { categoryID?: number; categoryName?: string; isActive?: boolean };
type ApiProduct = Product & { productID?: number; productName?: string; sKU?: string; categoryID?: number; supplierID?: number; isActive?: boolean };
type ApiOrderItem = OrderItem & { orderItemID?: number; orderID?: number; productID?: number; sKU?: string; subTotal?: number };
type ApiOrder = Order & { orderID?: number; customerID?: number; userID?: number; userName?: string; totalAmount?: number };
type ApiInventorySummary = InventorySummary & { productID?: number; sKU?: string };
type ApiInventoryTransaction = InventoryTransaction & {
  transactionID?: number;
  productID?: number;
  sKU?: string;
  transactionType?: string;
  referenceType?: string;
};

const mapUser = (u: ApiUser): User => ({
  id: u.id ?? u.userID ?? 0,
  fullName: u.fullName,
  username: u.username ?? u.userName ?? '',
  email: u.email ?? '',
  phone: u.phone ?? '',
  roleId: u.roleId ?? u.roleID ?? 0,
  roleName: u.roleName,
  status: u.status ?? statusFromActive(u.isActive),
  createdAt: u.createdAt,
});

const mapRole = (r: ApiRole): Role => ({
  id: r.id ?? r.roleID ?? 0,
  name: r.name ?? r.roleName ?? '',
  description: r.description ?? '',
  permissions: r.permissions,
  userCount: r.userCount,
  createdAt: r.createdAt,
});

const mapCustomer = (c: ApiCustomer): Customer => ({
  id: c.id ?? c.customerID ?? 0,
  name: c.name ?? c.customerName ?? '',
  phone: c.phone,
  email: c.email ?? '',
  type: c.type ?? c.customerType ?? 'individual',
  city: c.city,
  address: c.address ?? '',
  status: c.status ?? statusFromActive(c.isActive),
  createdAt: c.createdAt,
  orderCount: c.orderCount,
  totalPurchases: c.totalPurchases,
  lastOrderDate: c.lastOrderDate,
});

const mapSupplier = (s: ApiSupplier): Supplier => ({
  id: s.id ?? s.supplierID ?? 0,
  name: s.name ?? s.supplierName ?? '',
  contactPerson: s.contactPerson,
  phone: s.phone,
  email: s.email ?? '',
  city: s.city,
  address: s.address,
  status: s.status ?? statusFromActive(s.isActive),
  productCount: s.productCount,
  createdAt: s.createdAt,
});

const mapCategory = (c: ApiCategory): Category => ({
  id: c.id ?? c.categoryID ?? 0,
  name: c.name ?? c.categoryName ?? '',
  description: c.description ?? '',
  productCount: c.productCount,
  status: c.status ?? statusFromActive(c.isActive),
  createdAt: c.createdAt,
});

const mapProduct = (p: ApiProduct): Product => ({
  id: p.id ?? p.productID ?? 0,
  name: p.name ?? p.productName ?? '',
  sku: p.sku ?? p.sKU ?? '',
  categoryId: p.categoryId ?? p.categoryID ?? 0,
  categoryName: p.categoryName,
  supplierId: p.supplierId ?? p.supplierID ?? 0,
  supplierName: p.supplierName,
  purchasePrice: Number(p.purchasePrice),
  sellingPrice: Number(p.sellingPrice),
  currentStock: p.currentStock,
  status: p.status ?? statusFromActive(p.isActive),
  createdAt: p.createdAt,
});

const mapOrderItem = (i: ApiOrderItem): OrderItem => ({
  id: i.id ?? i.orderItemID ?? 0,
  orderId: i.orderId ?? i.orderID ?? 0,
  productId: i.productId ?? i.productID ?? 0,
  productName: i.productName,
  productSku: i.productSku ?? i.sKU ?? '',
  quantity: i.quantity,
  unitPrice: Number(i.unitPrice),
  subtotal: Number(i.subtotal ?? i.subTotal ?? 0),
});

const mapOrder = (o: ApiOrder): Order => ({
  id: o.id ?? o.orderID ?? 0,
  orderNumber: o.orderNumber,
  customerId: o.customerId ?? o.customerID ?? 0,
  customerName: o.customerName,
  employeeId: o.employeeId ?? o.userID ?? 0,
  employeeName: o.employeeName ?? o.userName ?? '',
  orderDate: o.orderDate,
  total: Number(o.total ?? o.totalAmount ?? 0),
  status: orderStatus(o.status),
  notes: o.notes ?? '',
  items: (o.items ?? []).map(mapOrderItem),
});

const mapInventorySummary = (i: ApiInventorySummary): InventorySummary => ({
  productId: i.productId ?? i.productID ?? 0,
  productName: i.productName,
  productSku: i.productSku ?? i.sKU ?? '',
  currentQuantity: i.currentQuantity,
  stockStatus: i.stockStatus,
  lastTransactionType: txType(i.lastTransactionType),
  lastTransactionDate: i.lastTransactionDate,
});

const mapInventoryTransaction = (t: ApiInventoryTransaction): InventoryTransaction => ({
  id: t.id ?? t.transactionID ?? 0,
  productId: t.productId ?? t.productID ?? 0,
  productName: t.productName,
  productSku: t.productSku ?? t.sKU ?? '',
  type: txType(t.type ?? t.transactionType),
  quantity: t.quantity,
  reference: t.reference ?? t.referenceType ?? '',
  notes: t.notes ?? '',
  createdAt: t.createdAt,
  createdBy: t.createdBy ?? '',
});

export const authApi = {
  async login(username: string, password: string): Promise<AuthUser> {
    const result = await request<ApiUser & { token: string; role?: string; roleName?: string; permissions: string[] }>(
      '/Auth/login',
      { method: 'POST', body: JSON.stringify({ userName: username, username, password }) },
    );
    return {
      id: result.id ?? result.userID ?? 0,
      fullName: result.fullName,
      username: result.username ?? result.userName ?? '',
      email: result.email ?? '',
      phone: result.phone ?? '',
      role: result.role ?? result.roleName ?? '',
      permissions: result.permissions,
      token: result.token,
    };
  },
};

export const usersApi = {
  list: (params: QueryParams = {}) => request<PaginatedResponse<ApiUser>>(`/Users${queryString(params)}`).then((r) => page(r, mapUser)),
  getById: (id: number) => request<ApiUser>(`/Users/${id}`).then(mapUser),
  create: (data: Partial<User>) => request<ApiUser>('/Users', { method: 'POST', body: JSON.stringify(data) }).then(mapUser),
  update: (id: number, data: Partial<User>) => request<ApiUser>(`/Users/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapUser),
  updateStatus: (id: number, status: User['status']) =>
    request<ApiUser>(`/Users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(mapUser),
};

export const rolesApi = {
  list: () => request<ApiRole[]>('/Roles').then((items) => items.map(mapRole)),
  getById: (id: number) => request<ApiRole>(`/Roles/${id}`).then(mapRole),
  create: (data: Partial<Role>) => request<ApiRole>('/Roles', { method: 'POST', body: JSON.stringify(data) }).then(mapRole),
  update: (id: number, data: Partial<Role>) => request<ApiRole>(`/Roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapRole),
  delete: (id: number) => request<void>(`/Roles/${id}`, { method: 'DELETE' }),
};

export const customersApi = {
  list: (params: QueryParams = {}) => request<PaginatedResponse<ApiCustomer>>(`/Customers${queryString(params)}`).then((r) => page(r, mapCustomer)),
  getById: (id: number) => request<ApiCustomer>(`/Customers/${id}`).then(mapCustomer),
  create: (data: Partial<Customer>) => request<ApiCustomer>('/Customers', { method: 'POST', body: JSON.stringify(data) }).then(mapCustomer),
  update: (id: number, data: Partial<Customer>) => request<ApiCustomer>(`/Customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapCustomer),
  updateStatus: (id: number, status: Customer['status']) =>
    request<ApiCustomer>(`/Customers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(mapCustomer),
  getOrders: (id: number) => request<ApiOrder[]>(`/Customers/${id}/orders`).then((items) => items.map(mapOrder)),
};

export const suppliersApi = {
  list: (params: QueryParams = {}) => request<PaginatedResponse<ApiSupplier>>(`/Suppliers${queryString(params)}`).then((r) => page(r, mapSupplier)),
  getById: (id: number) => request<ApiSupplier>(`/Suppliers/${id}`).then(mapSupplier),
  create: (data: Partial<Supplier>) => request<ApiSupplier>('/Suppliers', { method: 'POST', body: JSON.stringify(data) }).then(mapSupplier),
  update: (id: number, data: Partial<Supplier>) => request<ApiSupplier>(`/Suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapSupplier),
  updateStatus: (id: number, status: Supplier['status']) =>
    request<ApiSupplier>(`/Suppliers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(mapSupplier),
  getProducts: (id: number) => request<ApiProduct[]>(`/Suppliers/${id}/products`).then((items) => items.map(mapProduct)),
};

export const categoriesApi = {
  list: (params: QueryParams = {}) => request<PaginatedResponse<ApiCategory>>(`/Categories${queryString(params)}`).then((r) => page(r, mapCategory)),
  listAll: () => request<ApiCategory[]>('/Categories/all').then((items) => items.map(mapCategory)),
  getById: (id: number) => request<ApiCategory>(`/Categories/${id}`).then(mapCategory),
  create: (data: Partial<Category>) => request<ApiCategory>('/Categories', { method: 'POST', body: JSON.stringify(data) }).then(mapCategory),
  update: (id: number, data: Partial<Category>) => request<ApiCategory>(`/Categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapCategory),
  updateStatus: (id: number, status: Category['status']) =>
    request<ApiCategory>(`/Categories/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(mapCategory),
  getProducts: (id: number) => request<ApiProduct[]>(`/Categories/${id}/products`).then((items) => items.map(mapProduct)),
};

export const productsApi = {
  list: (params: QueryParams = {}) => request<PaginatedResponse<ApiProduct>>(`/Products${queryString(params)}`).then((r) => page(r, mapProduct)),
  listAll: () => request<ApiProduct[]>('/Products/all').then((items) => items.map(mapProduct)),
  getById: (id: number) => request<ApiProduct>(`/Products/${id}`).then(mapProduct),
  create: (data: Partial<Product>) => request<ApiProduct>('/Products', { method: 'POST', body: JSON.stringify(data) }).then(mapProduct),
  update: (id: number, data: Partial<Product>) => request<ApiProduct>(`/Products/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapProduct),
  updateStatus: (id: number, status: Product['status']) =>
    request<ApiProduct>(`/Products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(mapProduct),
};

export const ordersApi = {
  list: (params: QueryParams = {}) => request<PaginatedResponse<ApiOrder>>(`/Orders${queryString(params)}`).then((r) => page(r, mapOrder)),
  getById: (id: number) => request<ApiOrder>(`/Orders/${id}`).then(mapOrder),
  create: (data: Partial<Order>, items: Partial<OrderItem>[]) =>
    request<ApiOrder>('/Orders', {
      method: 'POST',
      body: JSON.stringify({
        customerId: data.customerId,
        orderDate: data.orderDate,
        status: apiOrderStatus(data.status),
        notes: data.notes,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }),
    }).then(mapOrder),
  update: (id: number, data: Partial<Order>) =>
    request<ApiOrder>(`/Orders/${id}`, { method: 'PUT', body: JSON.stringify({ ...data, status: apiOrderStatus(data.status) }) }).then(mapOrder),
  confirm: (id: number) => request<ApiOrder>(`/Orders/${id}/confirm`, { method: 'POST' }).then(mapOrder),
  cancel: (id: number) => request<ApiOrder>(`/Orders/${id}/cancel`, { method: 'POST' }).then(mapOrder),
};

export const inventoryApi = {
  list: (params: QueryParams = {}) => request<PaginatedResponse<ApiInventorySummary>>(`/Inventory${queryString(params)}`).then((r) => page(r, mapInventorySummary)),
  getTransactions: (params: QueryParams = {}) =>
    request<PaginatedResponse<ApiInventoryTransaction>>(`/Inventory/transactions${queryString(params)}`).then((r) => page(r, mapInventoryTransaction)),
  createTransaction: (data: Partial<InventoryTransaction>) =>
    request<ApiInventoryTransaction>('/Inventory/transactions', {
      method: 'POST',
      body: JSON.stringify({
        productId: data.productId,
        transactionType: apiTxType(data.type),
        quantity: data.quantity,
        referenceType: data.reference,
        notes: data.notes,
      }),
    }).then(mapInventoryTransaction),
};

export const dashboardApi = {
  getKpis: () => request<KpiData>('/Dashboard/kpis'),
  getCharts: () => request<DashboardCharts>('/Dashboard/charts'),
};

export const reportsApi = {
  salesReport: (params: QueryParams = {}) => request<PaginatedResponse<ApiOrder>>(`/Reports/sales${queryString(params)}`).then((r) => page(r, mapOrder)),
  productsReport: (params: QueryParams = {}) => request<PaginatedResponse<ApiProduct>>(`/Reports/products${queryString(params)}`).then((r) => page(r, mapProduct)),
  inventoryReport: (params: QueryParams = {}) =>
    request<PaginatedResponse<ApiInventorySummary>>(`/Reports/inventory${queryString(params)}`).then((r) => page(r, mapInventorySummary)),
  customersReport: (params: QueryParams = {}) =>
    request<PaginatedResponse<ApiCustomer>>(`/Reports/customers${queryString(params)}`).then((r) => page(r, mapCustomer)),
};
