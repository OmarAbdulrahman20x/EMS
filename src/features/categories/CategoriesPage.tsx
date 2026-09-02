import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Eye, Pencil, Power, FolderTree, Package } from 'lucide-react';
import { categoriesApi, productsApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Pagination } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import type { Category, Product, QueryParams } from '@/types';

export function CategoriesPage() {
  const { t, locale } = useLanguage();
  const queryClient = useQueryClient();
  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 10, search: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [viewingItem, setViewingItem] = useState<Category | null>(null);
  const [deactivateItem, setDeactivateItem] = useState<Category | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['categories', params], queryFn: () => categoriesApi.list(params) });

  const { data: categoryProducts } = useQuery({
    queryKey: ['category-products', viewingItem?.id],
    queryFn: () => productsApi.listAll(),
    enabled: !!viewingItem,
    select: (products: Product[]) => products.filter((p) => p.categoryId === viewingItem?.id),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Category>) => categoriesApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); showToast('success', t('common.created')); setShowForm(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) => categoriesApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); showToast('success', t('common.updated')); setShowForm(false); setEditingItem(null); },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) => categoriesApi.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); showToast('success', t('common.updated')); },
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns = [
    { key: 'name', header: t('common.name'), sortable: true, render: (c: Category) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"><FolderTree size={16} /></div>
        <span className="font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
      </div>
    )},
    { key: 'description', header: t('common.description'), render: (c: Category) => <span className="text-gray-500 dark:text-gray-400 line-clamp-1">{c.description}</span> },
    { key: 'productCount', header: t('categories.productCount'), render: (c: Category) => <span className="badge bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">{c.productCount}</span> },
    { key: 'status', header: t('common.status'), render: (c: Category) => <StatusBadge status={c.status} /> },
    { key: 'createdAt', header: t('common.createdAt'), render: (c: Category) => formatDate(c.createdAt) },
    { key: 'actions', header: t('common.actions'), width: '80px', render: (c: Category) => (
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === c.id ? null : c.id); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical size={16} /></button>
        {menuOpen === c.id && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
            <div className="absolute end-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-card-hover dark:border-gray-700 dark:bg-gray-800 animate-scale-in">
              <button onClick={() => { setViewingItem(c); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"><Eye size={14} /> {t('categories.viewProducts')}</button>
              <button onClick={() => { setEditingItem(c); setShowForm(true); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"><Pencil size={14} /> {t('common.edit')}</button>
              <button onClick={() => { setDeactivateItem(c); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"><Power size={14} /> {c.status === 'active' ? t('categories.deactivate') : t('categories.activate')}</button>
            </div>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title={t('categories.title')} subtitle={t('categories.subtitle')}
        actions={<button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary"><Plus size={18} /> {t('categories.addCategory')}</button>} />

      <div className="mb-4 relative max-w-sm">
        <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={params.search as string} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} className="input ps-10" placeholder={t('common.search')} />
      </div>

      <DataTable data={data?.data ?? []} columns={columns} loading={isLoading}
        sortBy={params.sortBy as string} sortOrder={params.sortOrder as 'asc' | 'desc'}
        onSort={(key) => setParams({ ...params, sortBy: key, sortOrder: params.sortBy === key && params.sortOrder === 'asc' ? 'desc' : 'asc' })} />

      {data && <div className="mt-4"><Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(page) => setParams({ ...params, page })} /></div>}

      {showForm && (
        <CategoryFormModal open={showForm} onClose={() => { setShowForm(false); setEditingItem(null); }} editingItem={editingItem}
          onSubmit={(data) => { if (editingItem) updateMutation.mutate({ id: editingItem.id, data }); else createMutation.mutate(data); }}
          loading={createMutation.isPending || updateMutation.isPending} />
      )}

      {viewingItem && (
        <Modal open={!!viewingItem} onClose={() => setViewingItem(null)} title={t('categories.categoryDetails')} size="lg">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"><FolderTree size={28} /></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{viewingItem.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{viewingItem.description}</p>
                <div className="mt-1"><StatusBadge status={viewingItem.status} /></div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('categories.viewProducts')} ({categoryProducts?.length ?? 0})</h4>
              <div className="space-y-2">
                {(categoryProducts ?? []).map((p: Product) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Package size={16} className="text-gray-400" />
                      <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{p.sku}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">${p.sellingPrice}</span>
                      <StatusBadge status={p.currentStock > 0 ? 'in_stock' : 'out_of_stock'} />
                    </div>
                  </div>
                ))}
                {(categoryProducts ?? []).length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.noData')}</p>}
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!deactivateItem} onClose={() => setDeactivateItem(null)}
        onConfirm={() => { if (deactivateItem) statusMutation.mutate({ id: deactivateItem.id, status: deactivateItem.status === 'active' ? 'inactive' : 'active' }); }}
        title={deactivateItem?.status === 'active' ? t('categories.deactivate') : t('categories.activate')}
        message={t('common.confirmDeactivate')} confirmLabel={deactivateItem?.status === 'active' ? t('categories.deactivate') : t('categories.activate')} cancelLabel={t('common.cancel')} />
    </div>
  );
}

function CategoryFormModal({ open, onClose, editingItem, onSubmit, loading }: {
  open: boolean; onClose: () => void; editingItem: Category | null; onSubmit: (data: Partial<Category>) => void; loading: boolean;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: editingItem?.name ?? '', description: editingItem?.description ?? '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = t('common.required');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={editingItem ? t('categories.editCategory') : t('categories.addCategory')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="label">{t('common.name')} *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}</div>
        <div><label className="label">{t('common.description')}</label><textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="btn-primary">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
}
