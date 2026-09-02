import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Eye, Pencil, XCircle, ShoppingCart } from 'lucide-react';
import { ordersApi, customersApi, usersApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Pagination } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import type { Order, QueryParams } from '@/types';

const statusOrder: Record<string, string> = {
  draft: 'draft', pending: 'pending', confirmed: 'confirmed', shipped: 'shipped', delivered: 'delivered', cancelled: 'cancelled',
};

export function OrdersPage() {
  const { t, locale } = useLanguage();
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 10, search: '', sortBy: 'orderDate', sortOrder: 'desc' });
  const [viewingItem, setViewingItem] = useState<Order | null>(null);
  const [cancelItem, setCancelItem] = useState<Order | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['orders', params], queryFn: () => ordersApi.list(params) });
  const { data: customers } = useQuery({ queryKey: ['customers-all'], queryFn: () => customersApi.list({ pageSize: 100 }) });
  const { data: users } = useQuery({ queryKey: ['users-all'], queryFn: () => usersApi.list({ pageSize: 100 }) });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => ordersApi.cancel(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); showToast('success', t('orders.orderCancelled')); },
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  const canEdit = (order: Order) => order.status === 'draft' || order.status === 'pending';
  const canCancel = (order: Order) => order.status !== 'delivered' && order.status !== 'cancelled';

  const columns = [
    { key: 'orderNumber', header: t('orders.orderNumber'), sortable: true, render: (o: Order) => <span className="font-mono text-sm font-medium text-primary-600 dark:text-primary-400">{o.orderNumber}</span> },
    { key: 'customerName', header: t('orders.customer'), sortable: true },
    { key: 'employeeName', header: t('orders.employee') },
    { key: 'orderDate', header: t('orders.orderDate'), sortable: true, render: (o: Order) => formatDate(o.orderDate) },
    { key: 'total', header: t('orders.grandTotal'), sortable: true, render: (o: Order) => <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(o.total)}</span> },
    { key: 'status', header: t('orders.status'), render: (o: Order) => <StatusBadge status={statusOrder[o.status] ?? o.status} /> },
    { key: 'actions', header: t('common.actions'), width: '80px', render: (o: Order) => (
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === o.id ? null : o.id); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical size={16} /></button>
        {menuOpen === o.id && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
            <div className="absolute end-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-card-hover dark:border-gray-700 dark:bg-gray-800 animate-scale-in">
              <button onClick={() => { setViewingItem(o); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"><Eye size={14} /> {t('common.view')}</button>
              {canEdit(o) && hasPermission('orders.manage') && (
                <button onClick={() => { navigate(`/orders/${o.id}/edit`); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"><Pencil size={14} /> {t('common.edit')}</button>
              )}
              {canCancel(o) && hasPermission('orders.manage') && (
                <button onClick={() => { setCancelItem(o); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"><XCircle size={14} /> {t('orders.cancelOrder')}</button>
              )}
            </div>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')}
        actions={hasPermission('orders.create') && <button onClick={() => navigate('/orders/new')} className="btn-primary"><Plus size={18} /> {t('orders.createOrder')}</button>} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={params.search as string} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} className="input ps-10" placeholder={t('common.search')} />
        </div>
        <select value={(params.status as string) ?? ''} onChange={(e) => setParams({ ...params, status: e.target.value || undefined, page: 1 })} className="input sm:w-40">
          <option value="">{t('common.all')} {t('orders.status')}</option>
          <option value="draft">{t('orders.draft')}</option>
          <option value="pending">{t('orders.pending')}</option>
          <option value="confirmed">{t('orders.confirmed')}</option>
          <option value="shipped">{t('orders.shipped')}</option>
          <option value="delivered">{t('orders.delivered')}</option>
          <option value="cancelled">{t('orders.cancelled')}</option>
        </select>
        <select value={(params.customerId as string) ?? ''} onChange={(e) => setParams({ ...params, customerId: e.target.value || undefined, page: 1 })} className="input sm:w-40">
          <option value="">{t('common.all')} {t('orders.customer')}</option>
          {customers?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <DataTable data={data?.data ?? []} columns={columns} loading={isLoading}
        sortBy={params.sortBy as string} sortOrder={params.sortOrder as 'asc' | 'desc'}
        onSort={(key) => setParams({ ...params, sortBy: key, sortOrder: params.sortBy === key && params.sortOrder === 'asc' ? 'desc' : 'asc' })} />

      {data && <div className="mt-4"><Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(page) => setParams({ ...params, page })} /></div>}

      {viewingItem && (
        <Modal open={!!viewingItem} onClose={() => setViewingItem(null)} title={t('orders.orderDetails')} size="lg">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono text-lg font-semibold text-gray-900 dark:text-gray-100">{viewingItem.orderNumber}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(viewingItem.orderDate)}</p>
              </div>
              <StatusBadge status={statusOrder[viewingItem.status] ?? viewingItem.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('orders.customer')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingItem.customerName}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('orders.employee')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingItem.employeeName}</p></div>
            </div>
            {viewingItem.notes && <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('common.notes')}</p><p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{viewingItem.notes}</p></div>}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('orders.addProduct')}</h4>
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="px-3 py-2 text-start text-xs font-semibold text-gray-500 dark:text-gray-400">{t('products.title')}</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">{t('common.quantity')}</th>
                    <th className="px-3 py-2 text-end text-xs font-semibold text-gray-500 dark:text-gray-400">{t('orders.unitPrice')}</th>
                    <th className="px-3 py-2 text-end text-xs font-semibold text-gray-500 dark:text-gray-400">{t('orders.subtotal')}</th>
                  </tr></thead>
                  <tbody>
                    {viewingItem.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700/50">
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{item.productName}</td>
                        <td className="px-3 py-2 text-center text-sm text-gray-700 dark:text-gray-300">{item.quantity}</td>
                        <td className="px-3 py-2 text-end text-sm text-gray-700 dark:text-gray-300">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-end text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                    {viewingItem.items.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{t('orders.noItems')}</td></tr>}
                  </tbody>
                  <tfoot><tr className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <td colSpan={3} className="px-3 py-2 text-end text-sm font-semibold text-gray-700 dark:text-gray-300">{t('orders.grandTotal')}</td>
                    <td className="px-3 py-2 text-end text-base font-bold text-gray-900 dark:text-gray-100">{formatCurrency(viewingItem.total)}</td>
                  </tr></tfoot>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!cancelItem} onClose={() => setCancelItem(null)}
        onConfirm={() => { if (cancelItem) cancelMutation.mutate(cancelItem.id); }}
        title={t('orders.cancelOrder')} message={t('common.confirmDelete')}
        confirmLabel={t('orders.cancelOrder')} cancelLabel={t('common.cancel')} variant="danger" />
    </div>
  );
}
