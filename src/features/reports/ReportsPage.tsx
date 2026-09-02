import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer, FileText, Package, Warehouse, Users } from 'lucide-react';
import { reportsApi, categoriesApi, customersApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Pagination } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import type { PaginatedResponse, QueryParams } from '@/types';

type ReportType = 'sales' | 'products' | 'inventory' | 'customers';

export function ReportsPage() {
  const { t, locale } = useLanguage();
  const { hasPermission } = useAuth();
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 10, search: '' });

  const { data: categories } = useQuery({ queryKey: ['categories-all'], queryFn: () => categoriesApi.listAll() });
  const { data: customers } = useQuery({ queryKey: ['customers-all'], queryFn: () => customersApi.list({ pageSize: 100 }) });

  const reportTabs: { key: ReportType; label: string; icon: typeof FileText; permission: string }[] = [
    { key: 'sales', label: t('reports.salesReport'), icon: FileText, permission: 'reports.sales' },
    { key: 'products', label: t('reports.productsReport'), icon: Package, permission: 'reports.products' },
    { key: 'inventory', label: t('reports.inventoryReport'), icon: Warehouse, permission: 'reports.inventory' },
    { key: 'customers', label: t('reports.customersReport'), icon: Users, permission: 'reports.customers' },
  ];

  const visibleTabs = reportTabs.filter((tab) => hasPermission(tab.permission));

  const { data, isLoading } = useQuery<PaginatedResponse<Record<string, unknown>>>({
    queryKey: ['report', reportType, params],
    queryFn: async () => {
      switch (reportType) {
        case 'sales': return reportsApi.salesReport(params) as unknown as Promise<PaginatedResponse<Record<string, unknown>>>;
        case 'products': return reportsApi.productsReport(params) as unknown as Promise<PaginatedResponse<Record<string, unknown>>>;
        case 'inventory': return reportsApi.inventoryReport(params) as unknown as Promise<PaginatedResponse<Record<string, unknown>>>;
        case 'customers': return reportsApi.customersReport(params) as unknown as Promise<PaginatedResponse<Record<string, unknown>>>;
      }
    },
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  const handlePrint = () => window.print();

  const salesColumns = [
    { key: 'orderNumber', header: t('reports.orderNumber'), render: (o: Record<string, unknown>) => <span className="font-mono text-sm text-primary-600 dark:text-primary-400">{String(o.orderNumber)}</span> },
    { key: 'customerName', header: t('reports.customer') },
    { key: 'employeeName', header: t('reports.employee') },
    { key: 'orderDate', header: t('reports.date'), render: (o: Record<string, unknown>) => formatDate(String(o.orderDate)) },
    { key: 'total', header: t('reports.total'), render: (o: Record<string, unknown>) => <span className="font-semibold">{formatCurrency(Number(o.total))}</span> },
    { key: 'status', header: t('reports.status'), render: (o: Record<string, unknown>) => <StatusBadge status={String(o.status)} /> },
  ];

  const productsColumns = [
    { key: 'name', header: t('reports.product'), render: (p: Record<string, unknown>) => <span className="font-medium">{String(p.name)}</span> },
    { key: 'categoryName', header: t('reports.category') },
    { key: 'purchasePrice', header: t('reports.purchasePrice'), render: (p: Record<string, unknown>) => formatCurrency(Number(p.purchasePrice)) },
    { key: 'sellingPrice', header: t('reports.sellingPrice'), render: (p: Record<string, unknown>) => <span className="font-semibold">{formatCurrency(Number(p.sellingPrice))}</span> },
    { key: 'currentStock', header: t('reports.quantitySold'), render: (p: Record<string, unknown>) => <span className="badge bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">{String(p.currentStock)}</span> },
  ];

  const inventoryColumns = [
    { key: 'productName', header: t('reports.product'), render: (i: Record<string, unknown>) => <span className="font-medium">{String(i.productName)}</span> },
    { key: 'productSku', header: 'SKU', render: (i: Record<string, unknown>) => <span className="font-mono text-xs">{String(i.productSku)}</span> },
    { key: 'currentQuantity', header: t('reports.currentQuantity'), render: (i: Record<string, unknown>) => <span className="font-semibold">{String(i.currentQuantity)}</span> },
    { key: 'stockStatus', header: t('reports.status'), render: (i: Record<string, unknown>) => <StatusBadge status={String(i.stockStatus)} /> },
    { key: 'lastTransactionType', header: t('reports.lastTransaction'), render: (i: Record<string, unknown>) => String(t(`inventory.${String(i.lastTransactionType)}`)) },
  ];

  const customersColumns = [
    { key: 'name', header: t('reports.customer'), render: (c: Record<string, unknown>) => <span className="font-medium">{String(c.name)}</span> },
    { key: 'orderCount', header: t('reports.numberOfOrders'), render: (c: Record<string, unknown>) => String(c.orderCount) },
    { key: 'totalPurchases', header: t('reports.totalPurchases'), render: (c: Record<string, unknown>) => <span className="font-semibold">{formatCurrency(Number(c.totalPurchases))}</span> },
    { key: 'lastOrderDate', header: t('reports.lastOrder'), render: (c: Record<string, unknown>) => c.lastOrderDate ? formatDate(String(c.lastOrderDate)) : '—' },
    { key: 'status', header: t('reports.status'), render: (c: Record<string, unknown>) => <StatusBadge status={String(c.status)} /> },
  ];

  const columns = reportType === 'sales' ? salesColumns : reportType === 'products' ? productsColumns : reportType === 'inventory' ? inventoryColumns : customersColumns;

  return (
    <div>
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')}
        actions={<button onClick={handlePrint} className="btn-secondary"><Printer size={18} /> {t('reports.print')}</button>} />

      {/* Report Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => { setReportType(tab.key); setParams({ page: 1, pageSize: 10, search: '' }); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${reportType === tab.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center print:hidden">
        <input type="text" value={params.search as string} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} className="input flex-1" placeholder={t('common.search')} />
        {reportType === 'sales' && (
          <>
            <select value={(params.status as string) ?? ''} onChange={(e) => setParams({ ...params, status: e.target.value || undefined, page: 1 })} className="input sm:w-40">
              <option value="">{t('common.all')} {t('orders.status')}</option>
              <option value="confirmed">{t('orders.confirmed')}</option>
              <option value="shipped">{t('orders.shipped')}</option>
              <option value="delivered">{t('orders.delivered')}</option>
              <option value="cancelled">{t('orders.cancelled')}</option>
            </select>
            <select value={(params.customerId as string) ?? ''} onChange={(e) => setParams({ ...params, customerId: e.target.value || undefined, page: 1 })} className="input sm:w-40">
              <option value="">{t('common.all')} {t('orders.customer')}</option>
              {customers?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </>
        )}
        {reportType === 'products' && (
          <select value={(params.categoryId as string) ?? ''} onChange={(e) => setParams({ ...params, categoryId: e.target.value || undefined, page: 1 })} className="input sm:w-40">
            <option value="">{t('common.all')} {t('products.category')}</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {reportType === 'inventory' && (
          <select value={(params.stockStatus as string) ?? ''} onChange={(e) => setParams({ ...params, stockStatus: e.target.value || undefined, page: 1 })} className="input sm:w-40">
            <option value="">{t('common.all')} {t('inventory.stockStatus')}</option>
            <option value="in_stock">{t('inventory.inStock')}</option>
            <option value="low_stock">{t('inventory.lowStock')}</option>
            <option value="out_of_stock">{t('inventory.outOfStock')}</option>
          </select>
        )}
      </div>

      {/* Report Table */}
      <div className="print-area">
        <div className="mb-4 hidden print:block">
          <h1 className="text-2xl font-bold">{t('reports.title')}</h1>
          <p className="text-sm text-gray-600">{visibleTabs.find((tab) => tab.key === reportType)?.label}</p>
          <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
        </div>
        <DataTable data={(data?.data as Record<string, unknown>[]) ?? []} columns={columns} loading={isLoading} />
      </div>

      {data && <div className="mt-4 print:hidden"><Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(page) => setParams({ ...params, page })} /></div>}
    </div>
  );
}
