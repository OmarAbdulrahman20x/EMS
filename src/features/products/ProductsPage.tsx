import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Eye, Pencil, Power, Package } from 'lucide-react';
import { productsApi, categoriesApi, suppliersApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Pagination } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import type { Product, QueryParams } from '@/types';

export function ProductsPage() {
  const { t, locale } = useLanguage();
  const queryClient = useQueryClient();
  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 10, search: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [viewingItem, setViewingItem] = useState<Product | null>(null);
  const [deactivateItem, setDeactivateItem] = useState<Product | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['products', params], queryFn: () => productsApi.list(params) });
  const { data: categories } = useQuery({ queryKey: ['categories-all'], queryFn: () => categoriesApi.listAll() });
  const { data: suppliers } = useQuery({ queryKey: ['suppliers-all'], queryFn: () => suppliersApi.list({ pageSize: 100 }) });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Product>) => productsApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); queryClient.invalidateQueries({ queryKey: ['categories'] }); showToast('success', t('common.created')); setShowForm(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => productsApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); showToast('success', t('common.updated')); setShowForm(false); setEditingItem(null); },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) => productsApi.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); showToast('success', t('common.updated')); },
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;

  const columns = [
    { key: 'name', header: t('common.name'), sortable: true, render: (p: Product) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"><Package size={16} /></div>
        <div><p className="font-medium text-gray-900 dark:text-gray-100">{p.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{p.sku}</p></div>
      </div>
    )},
    { key: 'categoryName', header: t('products.category') },
    { key: 'supplierName', header: t('products.supplier') },
    { key: 'purchasePrice', header: t('products.purchasePrice'), sortable: true, render: (p: Product) => <span className="text-gray-600 dark:text-gray-300">{formatCurrency(p.purchasePrice)}</span> },
    { key: 'sellingPrice', header: t('products.sellingPrice'), sortable: true, render: (p: Product) => <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(p.sellingPrice)}</span> },
    { key: 'currentStock', header: t('products.currentStock'), sortable: true, render: (p: Product) => (
      <span className={`badge ${p.currentStock === 0 ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400' : p.currentStock < 10 ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' : 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'}`}>{p.currentStock}</span>
    )},
    { key: 'status', header: t('common.status'), render: (p: Product) => <StatusBadge status={p.status} /> },
    { key: 'createdAt', header: t('common.createdAt'), render: (p: Product) => formatDate(p.createdAt) },
    { key: 'actions', header: t('common.actions'), width: '80px', render: (p: Product) => (
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical size={16} /></button>
        {menuOpen === p.id && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
            <div className="absolute end-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-card-hover dark:border-gray-700 dark:bg-gray-800 animate-scale-in">
              <button onClick={() => { setViewingItem(p); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"><Eye size={14} /> {t('common.view')}</button>
              <button onClick={() => { setEditingItem(p); setShowForm(true); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"><Pencil size={14} /> {t('common.edit')}</button>
              <button onClick={() => { setDeactivateItem(p); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"><Power size={14} /> {p.status === 'active' ? t('products.deactivate') : t('products.activate')}</button>
            </div>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title={t('products.title')} subtitle={t('products.subtitle')}
        actions={<button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary"><Plus size={18} /> {t('products.addProduct')}</button>} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={params.search as string} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} className="input ps-10" placeholder={t('common.search')} />
        </div>
        <select value={(params.categoryId as string) ?? ''} onChange={(e) => setParams({ ...params, categoryId: e.target.value || undefined, page: 1 })} className="input sm:w-40">
          <option value="">{t('common.all')} {t('products.category')}</option>
          {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={(params.supplierId as string) ?? ''} onChange={(e) => setParams({ ...params, supplierId: e.target.value || undefined, page: 1 })} className="input sm:w-40">
          <option value="">{t('common.all')} {t('products.supplier')}</option>
          {suppliers?.data.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
        <ProductFormModal open={showForm} onClose={() => { setShowForm(false); setEditingItem(null); }} editingItem={editingItem}
          categories={categories ?? []} suppliers={suppliers?.data ?? []}
          onSubmit={(data) => { if (editingItem) updateMutation.mutate({ id: editingItem.id, data }); else createMutation.mutate(data); }}
          loading={createMutation.isPending || updateMutation.isPending} />
      )}

      {viewingItem && (
        <Modal open={!!viewingItem} onClose={() => setViewingItem(null)} title={t('products.productDetails')} size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"><Package size={28} /></div>
              <div><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{viewingItem.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{viewingItem.sku}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('products.category')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingItem.categoryName}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('products.supplier')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingItem.supplierName}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('products.purchasePrice')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(viewingItem.purchasePrice)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('products.sellingPrice')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(viewingItem.sellingPrice)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('products.currentStock')}</p><p className="mt-1"><StatusBadge status={viewingItem.currentStock === 0 ? 'out_of_stock' : viewingItem.currentStock < 10 ? 'low_stock' : 'in_stock'} /></p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('products.margin')}</p><p className="mt-1 text-sm font-medium text-success-600 dark:text-success-400">{formatCurrency(viewingItem.sellingPrice - viewingItem.purchasePrice)}</p></div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!deactivateItem} onClose={() => setDeactivateItem(null)}
        onConfirm={() => { if (deactivateItem) statusMutation.mutate({ id: deactivateItem.id, status: deactivateItem.status === 'active' ? 'inactive' : 'active' }); }}
        title={deactivateItem?.status === 'active' ? t('products.deactivate') : t('products.activate')}
        message={t('common.confirmDeactivate')} confirmLabel={deactivateItem?.status === 'active' ? t('products.deactivate') : t('products.activate')} cancelLabel={t('common.cancel')} />
    </div>
  );
}

function ProductFormModal({ open, onClose, editingItem, categories, suppliers, onSubmit, loading }: {
  open: boolean; onClose: () => void; editingItem: Product | null; categories: { id: number; name: string }[]; suppliers: { id: number; name: string }[]; onSubmit: (data: Partial<Product>) => void; loading: boolean;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: editingItem?.name ?? '', sku: editingItem?.sku ?? '', categoryId: editingItem?.categoryId ?? 1,
    supplierId: editingItem?.supplierId ?? 1, purchasePrice: editingItem?.purchasePrice ?? 0, sellingPrice: editingItem?.sellingPrice ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = t('common.required');
    if (!form.sku.trim()) newErrors.sku = t('common.required');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={editingItem ? t('products.editProduct') : t('products.addProduct')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label">{t('common.name')} *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}</div>
          <div><label className="label">{t('products.sku')} *</label><input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />{errors.sku && <p className="mt-1 text-xs text-error-600">{errors.sku}</p>}</div>
          <div><label className="label">{t('products.category')}</label><select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label">{t('products.supplier')}</label><select className="input" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: Number(e.target.value) })}>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label className="label">{t('products.purchasePrice')}</label><input type="number" step="0.01" className="input" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })} /></div>
          <div><label className="label">{t('products.sellingPrice')}</label><input type="number" step="0.01" className="input" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} /></div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="btn-primary">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
}
