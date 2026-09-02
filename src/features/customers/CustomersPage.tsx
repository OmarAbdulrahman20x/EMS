import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Eye, Pencil, Power, UserPlus } from 'lucide-react';
import { customersApi, ordersApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Pagination } from '@/components/tables/DataTable';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import type { Customer, Order, QueryParams } from '@/types';

export function CustomersPage() {
  const { t, locale } = useLanguage();
  const queryClient = useQueryClient();
  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 10, search: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  const [viewingItem, setViewingItem] = useState<Customer | null>(null);
  const [deactivateItem, setDeactivateItem] = useState<Customer | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersApi.list(params),
  });

  const { data: customerOrders } = useQuery({
    queryKey: ['customer-orders', viewingItem?.id],
    queryFn: () => ordersApi.list({ customerId: viewingItem?.id, pageSize: 100 }),
    enabled: !!viewingItem,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Customer>) => customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast('success', t('common.created'));
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) => customersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast('success', t('common.updated'));
      setShowForm(false);
      setEditingItem(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) => customersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast('success', t('common.updated'));
    },
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  const columns = [
    { key: 'name', header: t('common.name'), sortable: true, render: (c: Customer) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-xs font-semibold text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">
          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <span className="font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
      </div>
    )},
    { key: 'phone', header: t('common.phone') },
    { key: 'email', header: t('common.email') },
    { key: 'type', header: t('customers.customerType'), render: (c: Customer) => (
      <Badge variant={c.type === 'business' ? 'primary' : 'neutral'}>
        {c.type === 'business' ? t('customers.business') : t('customers.individual')}
      </Badge>
    )},
    { key: 'city', header: t('common.city') },
    { key: 'status', header: t('common.status'), render: (c: Customer) => <StatusBadge status={c.status} /> },
    { key: 'createdAt', header: t('customers.registrationDate'), render: (c: Customer) => formatDate(c.createdAt) },
    {
      key: 'actions', header: t('common.actions'), width: '80px', render: (c: Customer) => (
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === c.id ? null : c.id); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <MoreVertical size={16} />
          </button>
          {menuOpen === c.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
              <div className="absolute end-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-card-hover dark:border-gray-700 dark:bg-gray-800 animate-scale-in">
                <button onClick={() => { setViewingItem(c); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                  <Eye size={14} /> {t('common.view')}
                </button>
                <button onClick={() => { setEditingItem(c); setShowForm(true); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                  <Pencil size={14} /> {t('common.edit')}
                </button>
                <button onClick={() => { setDeactivateItem(c); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20">
                  <Power size={14} /> {c.status === 'active' ? t('customers.deactivate') : t('customers.activate')}
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('customers.title')}
        subtitle={t('customers.subtitle')}
        actions={
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary">
            <UserPlus size={18} /> {t('customers.addCustomer')}
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={params.search as string} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} className="input ps-10" placeholder={t('common.search')} />
        </div>
        <select value={(params.type as string) ?? ''} onChange={(e) => setParams({ ...params, type: e.target.value || undefined, page: 1 })} className="input sm:w-40">
          <option value="">{t('common.all')} {t('customers.customerType')}</option>
          <option value="individual">{t('customers.individual')}</option>
          <option value="business">{t('customers.business')}</option>
        </select>
        <select value={(params.status as string) ?? ''} onChange={(e) => setParams({ ...params, status: e.target.value || undefined, page: 1 })} className="input sm:w-40">
          <option value="">{t('common.all')} {t('common.status')}</option>
          <option value="active">{t('common.active')}</option>
          <option value="inactive">{t('common.inactive')}</option>
        </select>
      </div>

      <DataTable data={data?.data ?? []} columns={columns} loading={isLoading}
        sortBy={params.sortBy as string} sortOrder={params.sortOrder as 'asc' | 'desc'}
        onSort={(key) => setParams({ ...params, sortBy: key, sortOrder: params.sortBy === key && params.sortOrder === 'asc' ? 'desc' : 'asc' })} />

      {data && <div className="mt-4"><Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(page) => setParams({ ...params, page })} /></div>}

      {showForm && (
        <CustomerFormModal open={showForm} onClose={() => { setShowForm(false); setEditingItem(null); }} editingItem={editingItem}
          onSubmit={(data) => { if (editingItem) updateMutation.mutate({ id: editingItem.id, data }); else createMutation.mutate(data); }}
          loading={createMutation.isPending || updateMutation.isPending} />
      )}

      {viewingItem && (
        <Modal open={!!viewingItem} onClose={() => setViewingItem(null)} title={t('customers.customerDetails')} size="lg">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-xl font-semibold text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">
                {viewingItem.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{viewingItem.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={viewingItem.type === 'business' ? 'primary' : 'neutral'}>
                    {viewingItem.type === 'business' ? t('customers.business') : t('customers.individual')}
                  </Badge>
                  <StatusBadge status={viewingItem.status} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DetailField label={t('common.phone')} value={viewingItem.phone} />
              <DetailField label={t('common.email')} value={viewingItem.email} />
              <DetailField label={t('common.city')} value={viewingItem.city} />
              <DetailField label={t('common.address')} value={viewingItem.address} />
              <DetailField label={t('customers.registrationDate')} value={formatDate(viewingItem.createdAt)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label={t('customers.orderCount')} value={String(viewingItem.orderCount)} />
              <StatCard label={t('customers.totalPurchases')} value={formatCurrency(viewingItem.totalPurchases)} />
              <StatCard label={t('customers.lastOrder')} value={viewingItem.lastOrderDate ? formatDate(viewingItem.lastOrderDate) : '—'} />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('customers.orderHistory')}</h4>
              {(customerOrders?.data ?? []).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('customers.noOrders')}</p>
              ) : (
                <div className="space-y-2">
                  {(customerOrders?.data ?? []).map((order: Order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.orderDate)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!deactivateItem} onClose={() => setDeactivateItem(null)}
        onConfirm={() => { if (deactivateItem) statusMutation.mutate({ id: deactivateItem.id, status: deactivateItem.status === 'active' ? 'inactive' : 'active' }); }}
        title={deactivateItem?.status === 'active' ? t('customers.deactivate') : t('customers.activate')}
        message={t('common.confirmDeactivate')} confirmLabel={deactivateItem?.status === 'active' ? t('customers.deactivate') : t('customers.activate')} cancelLabel={t('common.cancel')} />
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-gray-500 dark:text-gray-400">{label}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p></div>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"><p className="text-xs text-gray-500 dark:text-gray-400">{label}</p><p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p></div>;
}

function CustomerFormModal({ open, onClose, editingItem, onSubmit, loading }: {
  open: boolean; onClose: () => void; editingItem: Customer | null; onSubmit: (data: Partial<Customer>) => void; loading: boolean;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: editingItem?.name ?? '', phone: editingItem?.phone ?? '', email: editingItem?.email ?? '',
    type: editingItem?.type ?? 'individual', city: editingItem?.city ?? '', address: editingItem?.address ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = t('common.required');
    if (!form.phone.trim()) newErrors.phone = t('common.required');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={editingItem ? t('customers.editCustomer') : t('customers.addCustomer')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t('common.name')} *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}
          </div>
          <div>
            <label className="label">{t('common.phone')} *</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            {errors.phone && <p className="mt-1 text-xs text-error-600">{errors.phone}</p>}
          </div>
          <div>
            <label className="label">{t('common.email')}</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('customers.customerType')}</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'individual' | 'business' })}>
              <option value="individual">{t('customers.individual')}</option>
              <option value="business">{t('customers.business')}</option>
            </select>
          </div>
          <div>
            <label className="label">{t('common.city')}</label>
            <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('common.address')}</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="btn-primary">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
}
