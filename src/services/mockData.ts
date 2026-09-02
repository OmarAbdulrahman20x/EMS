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
  Product,
  Role,
  Supplier,
  User,
} from '@/types';

export const mockUsers: User[] = [
  { id: 1, fullName: 'Ahmed Mohammed', username: 'admin', email: 'admin@techerp.com', phone: '+966501234567', roleId: 1, roleName: 'Admin', status: 'active', createdAt: '2024-01-15T08:00:00Z' },
  { id: 2, fullName: 'Sara Ali', username: 'sara.sales', email: 'sara@techerp.com', phone: '+966502345678', roleId: 2, roleName: 'Sales Employee', status: 'active', createdAt: '2024-02-20T08:00:00Z' },
  { id: 3, fullName: 'Khalid Hassan', username: 'khalid.inv', email: 'khalid@techerp.com', phone: '+966503456789', roleId: 3, roleName: 'Inventory Employee', status: 'active', createdAt: '2024-03-10T08:00:00Z' },
  { id: 4, fullName: 'Fatima Zahra', username: 'fatima.sales', email: 'fatima@techerp.com', phone: '+966504567890', roleId: 2, roleName: 'Sales Employee', status: 'active', createdAt: '2024-04-05T08:00:00Z' },
  { id: 5, fullName: 'Omar Saeed', username: 'omar.inv', email: 'omar@techerp.com', phone: '+966505678901', roleId: 3, roleName: 'Inventory Employee', status: 'inactive', createdAt: '2024-05-12T08:00:00Z' },
  { id: 6, fullName: 'Layla Ibrahim', username: 'layla.sales', email: 'layla@techerp.com', phone: '+966506789012', roleId: 2, roleName: 'Sales Employee', status: 'active', createdAt: '2024-06-18T08:00:00Z' },
];

export const mockRoles: Role[] = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access with all permissions',
    permissions: [
      'dashboard.view', 'users.manage', 'roles.manage',
      'customers.view', 'customers.manage', 'suppliers.view', 'suppliers.manage',
      'categories.view', 'categories.manage', 'products.view', 'products.manage',
      'orders.view', 'orders.manage', 'orders.create', 'inventory.view', 'inventory.manage',
      'reports.sales', 'reports.inventory', 'reports.products', 'reports.customers',
      'settings.manage',
    ],
    userCount: 1,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 2,
    name: 'Sales Employee',
    description: 'Manage customers, products, and sales orders',
    permissions: [
      'dashboard.view', 'customers.view', 'customers.manage',
      'products.view', 'orders.view', 'orders.manage', 'orders.create',
      'reports.sales', 'reports.customers',
    ],
    userCount: 3,
    createdAt: '2024-02-20T08:00:00Z',
  },
  {
    id: 3,
    name: 'Inventory Employee',
    description: 'Manage products, categories, suppliers, and inventory',
    permissions: [
      'dashboard.view', 'products.view', 'products.manage',
      'categories.view', 'categories.manage', 'suppliers.view', 'suppliers.manage',
      'inventory.view', 'inventory.manage',
      'reports.inventory', 'reports.products',
    ],
    userCount: 2,
    createdAt: '2024-03-10T08:00:00Z',
  },
];

export const mockCustomers: Customer[] = [
  { id: 1, name: 'ElectroMax Store', phone: '+966551112233', email: 'info@electromax.com', type: 'business', city: 'Riyadh', address: 'King Fahd Road, Riyadh', status: 'active', createdAt: '2024-01-20T10:00:00Z', orderCount: 12, totalPurchases: 24500, lastOrderDate: '2024-08-15T14:30:00Z' },
  { id: 2, name: 'Ahmed Mohammed', phone: '+966552223344', email: 'ahmed.m@gmail.com', type: 'individual', city: 'Jeddah', address: 'Al-Balad, Jeddah', status: 'active', createdAt: '2024-02-15T10:00:00Z', orderCount: 8, totalPurchases: 12450, lastOrderDate: '2024-08-10T11:00:00Z' },
  { id: 3, name: 'TechWorld LLC', phone: '+966553334455', email: 'sales@techworld.com', type: 'business', city: 'Dammam', address: 'Industrial Area, Dammam', status: 'active', createdAt: '2024-03-05T10:00:00Z', orderCount: 15, totalPurchases: 38200, lastOrderDate: '2024-08-20T09:15:00Z' },
  { id: 4, name: 'Nora Abdullah', phone: '+966554445566', email: 'nora.abd@gmail.com', type: 'individual', city: 'Mecca', address: 'Aziziyah, Mecca', status: 'active', createdAt: '2024-04-10T10:00:00Z', orderCount: 3, totalPurchases: 3200, lastOrderDate: '2024-07-28T16:00:00Z' },
  { id: 5, name: 'GadgetHub', phone: '+966555556677', email: 'orders@gadgethub.com', type: 'business', city: 'Riyadh', address: 'Olaya Street, Riyadh', status: 'active', createdAt: '2024-05-22T10:00:00Z', orderCount: 20, totalPurchases: 51000, lastOrderDate: '2024-08-22T13:45:00Z' },
  { id: 6, name: 'Mohammed Saleh', phone: '+966556667788', email: 'm.saleh@gmail.com', type: 'individual', city: 'Medina', address: 'Central Area, Medina', status: 'inactive', createdAt: '2024-06-01T10:00:00Z', orderCount: 1, totalPurchases: 850, lastOrderDate: '2024-06-15T10:00:00Z' },
  { id: 7, name: 'SmartTech Solutions', phone: '+966557778899', email: 'contact@smarttech.com', type: 'business', city: 'Khobar', address: 'Corniche Road, Khobar', status: 'active', createdAt: '2024-06-15T10:00:00Z', orderCount: 7, totalPurchases: 18750, lastOrderDate: '2024-08-18T15:20:00Z' },
  { id: 8, name: 'Huda Khalil', phone: '+966558889900', email: 'huda.k@gmail.com', type: 'individual', city: 'Riyadh', address: 'Nakheel, Riyadh', status: 'active', createdAt: '2024-07-01T10:00:00Z', orderCount: 5, totalPurchases: 6400, lastOrderDate: '2024-08-05T12:00:00Z' },
];

export const mockSuppliers: Supplier[] = [
  { id: 1, name: 'HP Middle East', contactPerson: 'John Carter', phone: '+97141234567', email: 'contact@hp-me.com', city: 'Dubai', address: 'Dubai Internet City', status: 'active', productCount: 8, createdAt: '2024-01-10T08:00:00Z' },
  { id: 2, name: 'Dell Distributor', contactPerson: 'Michael Brooks', phone: '+97142345678', email: 'sales@delldist.com', city: 'Dubai', address: 'Jebel Ali Free Zone', status: 'active', productCount: 6, createdAt: '2024-01-25T08:00:00Z' },
  { id: 3, name: 'Logitech Gulf', contactPerson: 'Sarah Williams', phone: '+97143456789', email: 'gulf@logitech.com', city: 'Abu Dhabi', address: 'Khalifa Industrial Zone', status: 'active', productCount: 5, createdAt: '2024-02-05T08:00:00Z' },
  { id: 4, name: 'Samsung Tech', contactPerson: 'Park Min-ho', phone: '+966114567890', email: 'b2b@samsung.com', city: 'Riyadh', address: 'King Abdullah Financial District', status: 'active', productCount: 7, createdAt: '2024-02-20T08:00:00Z' },
  { id: 5, name: 'Apple Reseller ME', contactPerson: 'David Chen', phone: '+97145678901', email: 'reseller@apple-me.com', city: 'Dubai', address: 'Business Bay', status: 'active', productCount: 4, createdAt: '2024-03-15T08:00:00Z' },
  { id: 6, name: 'Canon Arabia', contactPerson: 'Yuki Tanaka', phone: '+966117890123', email: 'b2b@canon-arabia.com', city: 'Jeddah', address: 'Al-Balad District', status: 'inactive', productCount: 3, createdAt: '2024-04-10T08:00:00Z' },
];

export const mockCategories: Category[] = [
  { id: 1, name: 'Laptops', description: 'Portable and desktop computers', productCount: 8, status: 'active', createdAt: '2024-01-10T08:00:00Z' },
  { id: 2, name: 'Smartphones', description: 'Mobile phones and accessories', productCount: 6, status: 'active', createdAt: '2024-01-10T08:00:00Z' },
  { id: 3, name: 'Peripherals', description: 'Keyboards, mice, and other peripherals', productCount: 5, status: 'active', createdAt: '2024-01-12T08:00:00Z' },
  { id: 4, name: 'Monitors', description: 'Display screens and monitors', productCount: 4, status: 'active', createdAt: '2024-01-15T08:00:00Z' },
  { id: 5, name: 'Printers', description: 'Printers and scanning devices', productCount: 3, status: 'active', createdAt: '2024-01-18T08:00:00Z' },
  { id: 6, name: 'Storage', description: 'Hard drives, SSDs, and storage devices', productCount: 4, status: 'inactive', createdAt: '2024-02-01T08:00:00Z' },
];

export const mockProducts: Product[] = [
  { id: 1, name: 'HP 15 Laptop', sku: 'HP-15-I5-8GB', categoryId: 1, categoryName: 'Laptops', supplierId: 1, supplierName: 'HP Middle East', purchasePrice: 450, sellingPrice: 620, currentStock: 25, status: 'active', createdAt: '2024-01-15T08:00:00Z' },
  { id: 2, name: 'Dell XPS 13', sku: 'DELL-XPS13-I7', categoryId: 1, categoryName: 'Laptops', supplierId: 2, supplierName: 'Dell Distributor', purchasePrice: 890, sellingPrice: 1250, currentStock: 12, status: 'active', createdAt: '2024-01-20T08:00:00Z' },
  { id: 3, name: 'Samsung Galaxy S24', sku: 'SAM-S24-256', categoryId: 2, categoryName: 'Smartphones', supplierId: 4, supplierName: 'Samsung Tech', purchasePrice: 520, sellingPrice: 780, currentStock: 30, status: 'active', createdAt: '2024-02-01T08:00:00Z' },
  { id: 4, name: 'iPhone 15 Pro', sku: 'APL-15P-256', categoryId: 2, categoryName: 'Smartphones', supplierId: 5, supplierName: 'Apple Reseller ME', purchasePrice: 850, sellingPrice: 1199, currentStock: 18, status: 'active', createdAt: '2024-02-10T08:00:00Z' },
  { id: 5, name: 'Logitech MX Keys', sku: 'LOG-MXK-WL', categoryId: 3, categoryName: 'Peripherals', supplierId: 3, supplierName: 'Logitech Gulf', purchasePrice: 65, sellingPrice: 110, currentStock: 50, status: 'active', createdAt: '2024-02-15T08:00:00Z' },
  { id: 6, name: 'Logitech G Pro Mouse', sku: 'LOG-GPRO-WL', categoryId: 3, categoryName: 'Peripherals', supplierId: 3, supplierName: 'Logitech Gulf', purchasePrice: 45, sellingPrice: 85, currentStock: 8, status: 'active', createdAt: '2024-02-18T08:00:00Z' },
  { id: 7, name: 'Dell 27" 4K Monitor', sku: 'DELL-27-4K', categoryId: 4, categoryName: 'Monitors', supplierId: 2, supplierName: 'Dell Distributor', purchasePrice: 320, sellingPrice: 480, currentStock: 15, status: 'active', createdAt: '2024-03-01T08:00:00Z' },
  { id: 8, name: 'Samsung 32" Curved', sku: 'SAM-32-CRV', categoryId: 4, categoryName: 'Monitors', supplierId: 4, supplierName: 'Samsung Tech', purchasePrice: 280, sellingPrice: 420, currentStock: 0, status: 'active', createdAt: '2024-03-05T08:00:00Z' },
  { id: 9, name: 'HP LaserJet Pro', sku: 'HP-LJPRO-MFP', categoryId: 5, categoryName: 'Printers', supplierId: 1, supplierName: 'HP Middle East', purchasePrice: 180, sellingPrice: 290, currentStock: 10, status: 'active', createdAt: '2024-03-10T08:00:00Z' },
  { id: 10, name: 'Canon PIXMA', sku: 'CAN-PIX-G2010', categoryId: 5, categoryName: 'Printers', supplierId: 6, supplierName: 'Canon Arabia', purchasePrice: 120, sellingPrice: 195, currentStock: 5, status: 'active', createdAt: '2024-03-15T08:00:00Z' },
  { id: 11, name: 'Samsung T7 SSD 1TB', sku: 'SAM-T7-1TB', categoryId: 6, categoryName: 'Storage', supplierId: 4, supplierName: 'Samsung Tech', purchasePrice: 85, sellingPrice: 140, currentStock: 40, status: 'active', createdAt: '2024-04-01T08:00:00Z' },
  { id: 12, name: 'WD Blue HDD 2TB', sku: 'WD-BLUE-2TB', categoryId: 6, categoryName: 'Storage', supplierId: 2, supplierName: 'Dell Distributor', purchasePrice: 55, sellingPrice: 95, currentStock: 3, status: 'active', createdAt: '2024-04-05T08:00:00Z' },
  { id: 13, name: 'HP Pavilion Desktop', sku: 'HP-PAV-I5', categoryId: 1, categoryName: 'Laptops', supplierId: 1, supplierName: 'HP Middle East', purchasePrice: 380, sellingPrice: 550, currentStock: 20, status: 'active', createdAt: '2024-04-10T08:00:00Z' },
  { id: 14, name: 'MacBook Air M2', sku: 'APL-MBA-M2', categoryId: 1, categoryName: 'Laptops', supplierId: 5, supplierName: 'Apple Reseller ME', purchasePrice: 750, sellingPrice: 1099, currentStock: 14, status: 'active', createdAt: '2024-04-15T08:00:00Z' },
  { id: 15, name: 'Samsung Galaxy Tab S9', sku: 'SAM-TABS9-128', categoryId: 2, categoryName: 'Smartphones', supplierId: 4, supplierName: 'Samsung Tech', purchasePrice: 380, sellingPrice: 580, currentStock: 22, status: 'active', createdAt: '2024-05-01T08:00:00Z' },
];

export const mockOrderItems: OrderItem[] = [
  { id: 1, orderId: 1, productId: 1, productName: 'HP 15 Laptop', productSku: 'HP-15-I5-8GB', quantity: 2, unitPrice: 620, subtotal: 1240 },
  { id: 2, orderId: 1, productId: 5, productName: 'Logitech MX Keys', productSku: 'LOG-MXK-WL', quantity: 3, unitPrice: 110, subtotal: 330 },
  { id: 3, orderId: 2, productId: 4, productName: 'iPhone 15 Pro', productSku: 'APL-15P-256', quantity: 5, unitPrice: 1199, subtotal: 5995 },
  { id: 4, orderId: 3, productId: 2, productName: 'Dell XPS 13', productSku: 'DELL-XPS13-I7', quantity: 3, unitPrice: 1250, subtotal: 3750 },
  { id: 5, orderId: 3, productId: 7, productName: 'Dell 27" 4K Monitor', productSku: 'DELL-27-4K', quantity: 3, unitPrice: 480, subtotal: 1440 },
  { id: 6, orderId: 4, productId: 3, productName: 'Samsung Galaxy S24', productSku: 'SAM-S24-256', quantity: 10, unitPrice: 780, subtotal: 7800 },
  { id: 7, orderId: 5, productId: 14, productName: 'MacBook Air M2', productSku: 'APL-MBA-M2', quantity: 4, unitPrice: 1099, subtotal: 4396 },
  { id: 8, orderId: 6, productId: 1, productName: 'HP 15 Laptop', productSku: 'HP-15-I5-8GB', quantity: 5, unitPrice: 620, subtotal: 3100 },
  { id: 9, orderId: 6, productId: 9, productName: 'HP LaserJet Pro', productSku: 'HP-LJPRO-MFP', quantity: 2, unitPrice: 290, subtotal: 580 },
];

export const mockOrders: Order[] = [
  { id: 1, orderNumber: 'ORD-2024-0001', customerId: 1, customerName: 'ElectroMax Store', employeeId: 2, employeeName: 'Sara Ali', orderDate: '2024-07-15T10:00:00Z', total: 1570, status: 'delivered', notes: 'Regular order', items: [mockOrderItems[0], mockOrderItems[1]] },
  { id: 2, orderNumber: 'ORD-2024-0002', customerId: 2, customerName: 'Ahmed Mohammed', employeeId: 4, employeeName: 'Fatima Zahra', orderDate: '2024-07-20T11:00:00Z', total: 5995, status: 'delivered', notes: '', items: [mockOrderItems[2]] },
  { id: 3, orderNumber: 'ORD-2024-0003', customerId: 3, customerName: 'TechWorld LLC', employeeId: 2, employeeName: 'Sara Ali', orderDate: '2024-07-28T09:00:00Z', total: 5190, status: 'shipped', notes: 'Urgent delivery', items: [mockOrderItems[3], mockOrderItems[4]] },
  { id: 4, orderNumber: 'ORD-2024-0004', customerId: 5, customerName: 'GadgetHub', employeeId: 6, employeeName: 'Layla Ibrahim', orderDate: '2024-08-05T14:00:00Z', total: 7800, status: 'confirmed', notes: '', items: [mockOrderItems[5]] },
  { id: 5, orderNumber: 'ORD-2024-0005', customerId: 5, customerName: 'GadgetHub', employeeId: 4, employeeName: 'Fatima Zahra', orderDate: '2024-08-10T13:00:00Z', total: 4396, status: 'confirmed', notes: 'Bulk order', items: [mockOrderItems[6]] },
  { id: 6, orderNumber: 'ORD-2024-0006', customerId: 1, customerName: 'ElectroMax Store', employeeId: 2, employeeName: 'Sara Ali', orderDate: '2024-08-15T14:30:00Z', total: 3680, status: 'pending', notes: '', items: [mockOrderItems[7], mockOrderItems[8]] },
  { id: 7, orderNumber: 'ORD-2024-0007', customerId: 7, customerName: 'SmartTech Solutions', employeeId: 6, employeeName: 'Layla Ibrahim', orderDate: '2024-08-18T15:20:00Z', total: 2200, status: 'pending', notes: 'Net 30 terms', items: [] },
  { id: 8, orderNumber: 'ORD-2024-0008', customerId: 8, customerName: 'Huda Khalil', employeeId: 4, employeeName: 'Fatima Zahra', orderDate: '2024-08-22T16:00:00Z', total: 1850, status: 'draft', notes: '', items: [] },
];

export const mockInventoryTransactions: InventoryTransaction[] = [
  { id: 1, productId: 1, productName: 'HP 15 Laptop', productSku: 'HP-15-I5-8GB', type: 'in', quantity: 50, reference: 'PO-2024-0001', notes: 'Initial stock', createdAt: '2024-01-15T08:00:00Z', createdBy: 'Khalid Hassan' },
  { id: 2, productId: 1, productName: 'HP 15 Laptop', productSku: 'HP-15-I5-8GB', type: 'sale', quantity: 2, reference: 'ORD-2024-0001', notes: '', createdAt: '2024-07-15T10:00:00Z', createdBy: 'System' },
  { id: 3, productId: 1, productName: 'HP 15 Laptop', productSku: 'HP-15-I5-8GB', type: 'sale', quantity: 5, reference: 'ORD-2024-0006', notes: '', createdAt: '2024-08-15T14:30:00Z', createdBy: 'System' },
  { id: 4, productId: 1, productName: 'HP 15 Laptop', productSku: 'HP-15-I5-8GB', type: 'adjustment', quantity: -3, reference: 'ADJ-001', notes: 'Damaged units', createdAt: '2024-06-10T09:00:00Z', createdBy: 'Khalid Hassan' },
  { id: 5, productId: 4, productName: 'iPhone 15 Pro', productSku: 'APL-15P-256', type: 'in', quantity: 30, reference: 'PO-2024-0005', notes: 'Restock', createdAt: '2024-02-10T08:00:00Z', createdBy: 'Omar Saeed' },
  { id: 6, productId: 4, productName: 'iPhone 15 Pro', productSku: 'APL-15P-256', type: 'sale', quantity: 5, reference: 'ORD-2024-0002', notes: '', createdAt: '2024-07-20T11:00:00Z', createdBy: 'System' },
  { id: 7, productId: 4, productName: 'iPhone 15 Pro', productSku: 'APL-15P-256', type: 'return', quantity: 1, reference: 'RET-001', notes: 'Customer return - defective', createdAt: '2024-08-01T10:00:00Z', createdBy: 'Sara Ali' },
  { id: 8, productId: 8, productName: 'Samsung 32" Curved', productSku: 'SAM-32-CRV', type: 'in', quantity: 15, reference: 'PO-2024-0008', notes: 'Initial stock', createdAt: '2024-03-05T08:00:00Z', createdBy: 'Khalid Hassan' },
  { id: 9, productId: 8, productName: 'Samsung 32" Curved', productSku: 'SAM-32-CRV', type: 'out', quantity: 15, reference: 'W/O-001', notes: 'Write-off - display models', createdAt: '2024-07-01T09:00:00Z', createdBy: 'Khalid Hassan' },
  { id: 10, productId: 6, productName: 'Logitech G Pro Mouse', productSku: 'LOG-GPRO-WL', type: 'in', quantity: 60, reference: 'PO-2024-0010', notes: 'Bulk purchase', createdAt: '2024-02-18T08:00:00Z', createdBy: 'Omar Saeed' },
  { id: 11, productId: 6, productName: 'Logitech G Pro Mouse', productSku: 'LOG-GPRO-WL', type: 'sale', quantity: 52, reference: 'ORD-2024-0003', notes: '', createdAt: '2024-07-28T09:00:00Z', createdBy: 'System' },
];

export const mockInventorySummary: InventorySummary[] = [
  { productId: 1, productName: 'HP 15 Laptop', productSku: 'HP-15-I5-8GB', currentQuantity: 25, stockStatus: 'in_stock', lastTransactionType: 'sale', lastTransactionDate: '2024-08-15T14:30:00Z' },
  { productId: 2, productName: 'Dell XPS 13', productSku: 'DELL-XPS13-I7', currentQuantity: 12, stockStatus: 'in_stock', lastTransactionType: 'in', lastTransactionDate: '2024-01-20T08:00:00Z' },
  { productId: 3, productName: 'Samsung Galaxy S24', productSku: 'SAM-S24-256', currentQuantity: 30, stockStatus: 'in_stock', lastTransactionType: 'in', lastTransactionDate: '2024-02-01T08:00:00Z' },
  { productId: 4, productName: 'iPhone 15 Pro', productSku: 'APL-15P-256', currentQuantity: 18, stockStatus: 'in_stock', lastTransactionType: 'return', lastTransactionDate: '2024-08-01T10:00:00Z' },
  { productId: 5, productName: 'Logitech MX Keys', productSku: 'LOG-MXK-WL', currentQuantity: 50, stockStatus: 'in_stock', lastTransactionType: 'in', lastTransactionDate: '2024-02-15T08:00:00Z' },
  { productId: 6, productName: 'Logitech G Pro Mouse', productSku: 'LOG-GPRO-WL', currentQuantity: 8, stockStatus: 'low_stock', lastTransactionType: 'sale', lastTransactionDate: '2024-07-28T09:00:00Z' },
  { productId: 7, productName: 'Dell 27" 4K Monitor', productSku: 'DELL-27-4K', currentQuantity: 15, stockStatus: 'in_stock', lastTransactionType: 'in', lastTransactionDate: '2024-03-01T08:00:00Z' },
  { productId: 8, productName: 'Samsung 32" Curved', productSku: 'SAM-32-CRV', currentQuantity: 0, stockStatus: 'out_of_stock', lastTransactionType: 'out', lastTransactionDate: '2024-07-01T09:00:00Z' },
  { productId: 9, productName: 'HP LaserJet Pro', productSku: 'HP-LJPRO-MFP', currentQuantity: 10, stockStatus: 'in_stock', lastTransactionType: 'in', lastTransactionDate: '2024-03-10T08:00:00Z' },
  { productId: 10, productName: 'Canon PIXMA', productSku: 'CAN-PIX-G2010', currentQuantity: 5, stockStatus: 'low_stock', lastTransactionType: 'in', lastTransactionDate: '2024-03-15T08:00:00Z' },
  { productId: 11, productName: 'Samsung T7 SSD 1TB', productSku: 'SAM-T7-1TB', currentQuantity: 40, stockStatus: 'in_stock', lastTransactionType: 'in', lastTransactionDate: '2024-04-01T08:00:00Z' },
  { productId: 12, productName: 'WD Blue HDD 2TB', productSku: 'WD-BLUE-2TB', currentQuantity: 3, stockStatus: 'low_stock', lastTransactionType: 'in', lastTransactionDate: '2024-04-05T08:00:00Z' },
];

export const mockKpis: KpiData = {
  totalSales: 32681,
  totalProfit: 9845,
  customerCount: 8,
  orderCount: 8,
  bestSellingProduct: { name: 'iPhone 15 Pro', unitsSold: 5 },
  leastSellingProduct: { name: 'Logitech G Pro Mouse', unitsSold: 52 },
  topCustomer: { name: 'GadgetHub', totalPurchases: 51000 },
};

export const mockDashboardCharts: DashboardCharts = {
  monthlySales: [
    { month: 'Jan', sales: 4200, profit: 1200 },
    { month: 'Feb', sales: 5800, profit: 1700 },
    { month: 'Mar', sales: 4900, profit: 1400 },
    { month: 'Apr', sales: 7200, profit: 2100 },
    { month: 'May', sales: 6100, profit: 1800 },
    { month: 'Jun', sales: 8400, profit: 2500 },
    { month: 'Jul', sales: 15560, profit: 4700 },
    { month: 'Aug', sales: 17421, profit: 5245 },
  ],
  salesComparison: [
    { period: 'Jan', current: 4200, previous: 3800 },
    { period: 'Feb', current: 5800, previous: 5100 },
    { period: 'Mar', current: 4900, previous: 4500 },
    { period: 'Apr', current: 7200, previous: 6300 },
    { period: 'May', current: 6100, previous: 5800 },
    { period: 'Jun', current: 8400, previous: 7200 },
    { period: 'Jul', current: 15560, previous: 12100 },
    { period: 'Aug', current: 17421, previous: 13500 },
  ],
  topProducts: [
    { name: 'iPhone 15 Pro', unitsSold: 5, revenue: 5995 },
    { name: 'Dell XPS 13', unitsSold: 3, revenue: 3750 },
    { name: 'HP 15 Laptop', unitsSold: 7, revenue: 4340 },
    { name: 'MacBook Air M2', unitsSold: 4, revenue: 4396 },
    { name: 'Samsung Galaxy S24', unitsSold: 10, revenue: 7800 },
  ],
  topCustomers: [
    { name: 'GadgetHub', totalPurchases: 51000 },
    { name: 'TechWorld LLC', totalPurchases: 38200 },
    { name: 'ElectroMax Store', totalPurchases: 24500 },
    { name: 'Ahmed Mohammed', totalPurchases: 12450 },
    { name: 'SmartTech Solutions', totalPurchases: 18750 },
  ],
  categoryDistribution: [
    { category: 'Laptops', sales: 13680, percentage: 35 },
    { category: 'Smartphones', sales: 13795, percentage: 35 },
    { category: 'Peripherals', sales: 4130, percentage: 11 },
    { category: 'Monitors', sales: 1440, percentage: 4 },
    { category: 'Printers', sales: 580, percentage: 1 },
    { category: 'Storage', sales: 5800, percentage: 15 },
  ],
};

export const mockAuthUsers: Record<string, { password: string; user: AuthUser }> = {
  admin: {
    password: 'admin123',
    user: {
      id: 1, fullName: 'Ahmed Mohammed', username: 'admin', email: 'admin@techerp.com',
      phone: '+966501234567', role: 'Admin', permissions: [],
      token: 'mock-jwt-token-admin',
    },
  },
  'sara.sales': {
    password: 'sales123',
    user: {
      id: 2, fullName: 'Sara Ali', username: 'sara.sales', email: 'sara@techerp.com',
      phone: '+966502345678', role: 'Sales Employee',
      permissions: ['dashboard.view', 'customers.view', 'customers.manage', 'products.view', 'orders.view', 'orders.manage', 'orders.create', 'reports.sales', 'reports.customers'],
      token: 'mock-jwt-token-sales',
    },
  },
  'khalid.inv': {
    password: 'inv123',
    user: {
      id: 3, fullName: 'Khalid Hassan', username: 'khalid.inv', email: 'khalid@techerp.com',
      phone: '+966503456789', role: 'Inventory Employee',
      permissions: ['dashboard.view', 'products.view', 'products.manage', 'categories.view', 'categories.manage', 'suppliers.view', 'suppliers.manage', 'inventory.view', 'inventory.manage', 'reports.inventory', 'reports.products'],
      token: 'mock-jwt-token-inventory',
    },
  },
};
