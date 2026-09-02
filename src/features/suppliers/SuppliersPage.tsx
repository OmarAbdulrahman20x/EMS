import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Eye, Pencil, Power, Building2 } from 'lucide-react';
import { suppliersApi, productsApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Pagination } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import type { Supplier, Product, QueryParams } from '@/types';

export function SuppliersPage() {
  const { t, locale } = useLanguage();
  const queryClient = useQueryClient();
  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 10, search: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);
  const [viewingItem, setViewingItem] = useState<Supplier | null>(null);
  const [deactivateItem, setDeactivateItem] = useState<Supplier | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['suppliers', params], queryFn: () => suppliersApi.list(params) });

  const { data: supplierProducts } = useQuery({
    queryKey: ['supplier-products', viewingItem?.id],
    queryFn: () => productsApi.listAll(),
    enabled: !!viewingItem,
    select: (products: Product[]) => products.filter((p) => p.supplierId === viewingItem?.id),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Supplier>) => suppliersApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); showToast('success', t('common.created')); setShowForm(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Supplier> }) => suppliersApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); showToast('success', t('common.updated')); setShowForm(false); setEditingItem(null); },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) => suppliersApi.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); showToast('success', t('common.updated')); },
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns = [
    { key: 'name', header: t('common.name'), sortable: true, render: (s: Supplier) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"><Building2 size={16} /></div>
        <span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
      </div>
    )},
    { key: 'contactPerson', header: t('suppliers.contactPerson') },
    { key: 'phone', header: t('common.phone') },
    { key: 'email', header: t('common.email') },
    { key: 'city', header: t('common.city') },
    { key: 'status', header: t('common.status'), render: (s: Supplier) => <StatusBadge status={s.status} /> },
    { key: 'createdAt', header: t('common.createdAt'), render: (s: Supplier) => formatDate(s.createdAt) },
    { key: 'actions', header: t('common.actions'), width: '80px', render: (s: Supplier) => (
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === s.id ? null : s.id); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical size={16} /></button>
        {menuOpen === s.id && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
            <div className="absolute end-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-card-hover dark:border-gray-700 dark:bg-gray-800 animate-scale-in">
              <button onClick={() => { setViewingItem(s); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"><Eye size={14} /> {t('common.view')}</button>
              <button onClick={() => { setEditingItem(s); setShowForm(true); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"><Pencil size={14} /> {t('common.edit')}</button>
              <button onClick={() => { setDeactivateItem(s); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"><Power size={14} /> {s.status === 'active' ? t('suppliers.deactivate') : t('suppliers.activate')}</button>
            </div>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title={t('suppliers.title')} subtitle={t('suppliers.subtitle')}
        actions={<button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary"><Plus size={18} /> {t('suppliers.addSupplier')}</button>} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={params.search as string} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} className="input ps-10" placeholder={t('common.search')} />
        </div>
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
        <SupplierFormModal open={showForm} onClose={() => { setShowForm(false); setEditingItem(null); }} editingItem={editingItem}
          onSubmit={(data) => { if (editingItem) updateMutation.mutate({ id: editingItem.id, data }); else createMutation.mutate(data); }}
          loading={createMutation.isPending || updateMutation.isPending} />
      )}

      {viewingItem && (
        <Modal open={!!viewingItem} onClose={() => setViewingItem(null)} title={t('suppliers.supplierDetails')} size="lg">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"><Building2 size={28} /></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{viewingItem.name}</h3>
                <div className="mt-1"><StatusBadge status={viewingItem.status} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('suppliers.contactPerson')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingItem.contactPerson}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('common.phone')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingItem.phone}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('common.email')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingItem.email}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('common.city')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingItem.city}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('common.address')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingItem.address}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('common.createdAt')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(viewingItem.createdAt)}</p></div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('suppliers.suppliedProducts')} ({supplierProducts?.length ?? 0})</h4>
              <div className="space-y-2">
                {(supplierProducts ?? []).map((p: Product) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5 dark:border-gray-700">
                    <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{p.sku}</p></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{p.categoryName}</span>
                  </div>
                ))}
                {(supplierProducts ?? []).length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.noData')}</p>}
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!deactivateItem} onClose={() => setDeactivateItem(null)}
        onConfirm={() => { if (deactivateItem) statusMutation.mutate({ id: deactivateItem.id, status: deactivateItem.status === 'active' ? 'inactive' : 'active' }); }}
        title={deactivateItem?.status === 'active' ? t('suppliers.deactivate') : t('suppliers.activate')}
        message={t('common.confirmDeactivate')} confirmLabel={deactivateItem?.status === 'active' ? t('suppliers.deactivate') : t('suppliers.activate')} cancelLabel={t('common.cancel')} />
    </div>
  );
}

function SupplierFormModal({ open, onClose, editingItem, onSubmit, loading }: {
  open: boolean; onClose: () => void; editingItem: Supplier | null; onSubmit: (data: Partial<Supplier>) => void; loading: boolean;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: editingItem?.name ?? '', contactPerson: editingItem?.contactPerson ?? '', phone: editingItem?.phone ?? '',
    email: editingItem?.email ?? '', city: editingItem?.city ?? '', address: editingItem?.address ?? '',
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
    <Modal open={open} onClose={onClose} title={editingItem ? t('suppliers.editSupplier') : t('suppliers.addSupplier')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label">{t('common.name')} *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}</div>
          <div><label className="label">{t('suppliers.contactPerson')}</label><input className="input" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
          <div><label className="label">{t('common.phone')} *</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />{errors.phone && <p className="mt-1 text-xs text-error-600">{errors.phone}</p>}</div>
          <div><label className="label">{t('common.email')}</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">{t('common.city')}</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div><label className="label">{t('common.address')}</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="btn-primary">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
}
