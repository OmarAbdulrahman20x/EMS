import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, MoreVertical, Eye, Warehouse, ArrowDownCircle, ArrowUpCircle, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { inventoryApi, productsApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Pagination } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import type { InventorySummary, InventoryTransaction, InventoryTransactionType, QueryParams } from '@/types';

const typeIcons: Record<InventoryTransactionType, { icon: typeof ArrowDownCircle; color: string; sign: string }> = {
  in: { icon: ArrowDownCircle, color: 'text-success-600 dark:text-success-400', sign: '+' },
  out: { icon: ArrowUpCircle, color: 'text-error-600 dark:text-error-400', sign: '-' },
  sale: { icon: ArrowUpCircle, color: 'text-error-600 dark:text-error-400', sign: '-' },
  return: { icon: RotateCcw, color: 'text-accent-600 dark:text-accent-400', sign: '+' },
  adjustment: { icon: SlidersHorizontal, color: 'text-warning-600 dark:text-warning-400', sign: '±' },
};

export function InventoryPage() {
  const { t, locale } = useLanguage();
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 10, search: '' });
  const [showForm, setShowForm] = useState(false);
  const [viewingHistory, setViewingHistory] = useState<InventorySummary | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<InventoryTransaction | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [tab, setTab] = useState<'summary' | 'history'>('summary');

  const { data, isLoading } = useQuery({ queryKey: ['inventory', params], queryFn: () => inventoryApi.list(params) });
  const { data: transactionsData, isLoading: txLoading } = useQuery({
    queryKey: ['inventory-transactions', params],
    queryFn: () => inventoryApi.getTransactions(params),
  });
  const { data: products } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.listAll() });

  const { data: productHistory } = useQuery({
    queryKey: ['product-transactions', viewingHistory?.productId],
    queryFn: () => inventoryApi.getTransactions({ productId: viewingHistory?.productId, pageSize: 100 }),
    enabled: !!viewingHistory,
  });

  const createTxMutation = useMutation({
    mutationFn: (data: Partial<InventoryTransaction>) => inventoryApi.createTransaction({ ...data, createdBy: 'Current User' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      showToast('success', t('common.created'));
      setShowForm(false);
    },
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatDateTime = (date: string) => new Date(date).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const summaryColumns = [
    { key: 'productName', header: t('inventory.product'), sortable: true, render: (i: InventorySummary) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"><Warehouse size={16} /></div>
        <div><p className="font-medium text-gray-900 dark:text-gray-100">{i.productName}</p><p className="text-xs text-gray-500 dark:text-gray-400">{i.productSku}</p></div>
      </div>
    )},
    { key: 'currentQuantity', header: t('inventory.currentQuantity'), sortable: true, render: (i: InventorySummary) => <span className="font-semibold text-gray-900 dark:text-gray-100">{i.currentQuantity}</span> },
    { key: 'stockStatus', header: t('inventory.stockStatus'), render: (i: InventorySummary) => <StatusBadge status={i.stockStatus} /> },
    { key: 'lastTransactionType', header: t('inventory.lastTransaction'), render: (i: InventorySummary) => {
      const cfg = typeIcons[i.lastTransactionType];
      const Icon = cfg.icon;
      return <span className={`inline-flex items-center gap-1 text-sm ${cfg.color}`}><Icon size={14} /> {t(`inventory.${i.lastTransactionType}`)}</span>;
    }},
    { key: 'lastTransactionDate', header: t('inventory.lastTransactionDate'), render: (i: InventorySummary) => formatDate(i.lastTransactionDate) },
    { key: 'actions', header: t('common.actions'), width: '80px', render: (i: InventorySummary) => (
      <div className="relative">
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === i.productId ? null : i.productId); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical size={16} /></button>
        {menuOpen === i.productId && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
            <div className="absolute end-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-card-hover dark:border-gray-700 dark:bg-gray-800 animate-scale-in">
              <button onClick={() => { setViewingHistory(i); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"><Eye size={14} /> {t('inventory.transactionHistory')}</button>
            </div>
          </>
        )}
      </div>
    )},
  ];

  const txColumns = [
    { key: 'productName', header: t('inventory.product'), render: (tx: InventoryTransaction) => (
      <div><p className="font-medium text-gray-900 dark:text-gray-100">{tx.productName}</p><p className="text-xs text-gray-500 dark:text-gray-400">{tx.productSku}</p></div>
    )},
    { key: 'type', header: t('inventory.transactionType'), render: (tx: InventoryTransaction) => {
      const cfg = typeIcons[tx.type];
      const Icon = cfg.icon;
      return <span className={`inline-flex items-center gap-1 text-sm font-medium ${cfg.color}`}><Icon size={14} /> {t(`inventory.${tx.type}`)}</span>;
    }},
    { key: 'quantity', header: t('common.quantity'), render: (tx: InventoryTransaction) => {
      const cfg = typeIcons[tx.type];
      return <span className={`font-semibold ${cfg.color}`}>{cfg.sign}{tx.quantity}</span>;
    }},
    { key: 'reference', header: t('inventory.reference'), render: (tx: InventoryTransaction) => <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{tx.reference}</span> },
    { key: 'createdBy', header: t('inventory.createdBy') },
    { key: 'createdAt', header: t('common.date'), render: (tx: InventoryTransaction) => formatDateTime(tx.createdAt) },
    { key: 'actions', header: t('common.actions'), width: '60px', render: (tx: InventoryTransaction) => (
      <button onClick={() => setViewingTransaction(tx)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><Eye size={16} /></button>
    )},
  ];

  return (
    <div>
      <PageHeader title={t('inventory.title')} subtitle={t('inventory.subtitle')}
        actions={hasPermission('inventory.manage') && <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={18} /> {t('inventory.recordTransaction')}</button>} />

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setTab('summary')} className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === 'summary' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>{t('inventory.title')}</button>
        <button onClick={() => setTab('history')} className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === 'history' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>{t('inventory.transactionHistory')}</button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={params.search as string} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} className="input ps-10" placeholder={t('common.search')} />
        </div>
        {tab === 'summary' ? (
          <select value={(params.stockStatus as string) ?? ''} onChange={(e) => setParams({ ...params, stockStatus: e.target.value || undefined, page: 1 })} className="input sm:w-40">
            <option value="">{t('common.all')} {t('inventory.stockStatus')}</option>
            <option value="in_stock">{t('inventory.inStock')}</option>
            <option value="low_stock">{t('inventory.lowStock')}</option>
            <option value="out_of_stock">{t('inventory.outOfStock')}</option>
          </select>
        ) : (
          <select value={(params.type as string) ?? ''} onChange={(e) => setParams({ ...params, type: e.target.value || undefined, page: 1 })} className="input sm:w-40">
            <option value="">{t('common.all')} {t('inventory.transactionType')}</option>
            <option value="in">{t('inventory.stockIn')}</option>
            <option value="out">{t('inventory.stockOut')}</option>
            <option value="sale">{t('inventory.sale')}</option>
            <option value="return">{t('inventory.return')}</option>
            <option value="adjustment">{t('inventory.adjustment')}</option>
          </select>
        )}
      </div>

      {tab === 'summary' ? (
        <>
          <DataTable data={data?.data ?? []} columns={summaryColumns} loading={isLoading} sortBy={params.sortBy as string} sortOrder={params.sortOrder as 'asc' | 'desc'} onSort={(key) => setParams({ ...params, sortBy: key, sortOrder: params.sortBy === key && params.sortOrder === 'asc' ? 'desc' : 'asc' })} />
          {data && <div className="mt-4"><Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} onPageChange={(page) => setParams({ ...params, page })} /></div>}
        </>
      ) : (
        <>
          <DataTable data={transactionsData?.data ?? []} columns={txColumns} loading={txLoading} />
          {transactionsData && <div className="mt-4"><Pagination page={transactionsData.page} totalPages={transactionsData.totalPages} total={transactionsData.total} pageSize={transactionsData.pageSize} onPageChange={(page) => setParams({ ...params, page })} /></div>}
        </>
      )}

      {/* Transaction Form */}
      {showForm && (
        <TransactionFormModal open={showForm} onClose={() => setShowForm(false)} products={products ?? []}
          onSubmit={(data) => createTxMutation.mutate(data)} loading={createTxMutation.isPending} />
      )}

      {/* Product History Modal */}
      {viewingHistory && (
        <Modal open={!!viewingHistory} onClose={() => setViewingHistory(null)} title={t('inventory.transactionHistory')} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"><Warehouse size={20} /></div>
              <div><h3 className="font-semibold text-gray-900 dark:text-gray-100">{viewingHistory.productName}</h3><p className="text-xs text-gray-500 dark:text-gray-400">{viewingHistory.productSku}</p></div>
              <div className="ms-auto text-end"><p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.currentStock')}</p><p className="text-lg font-bold text-gray-900 dark:text-gray-100">{viewingHistory.currentQuantity}</p></div>
            </div>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {(productHistory?.data ?? []).map((tx: InventoryTransaction) => {
                const cfg = typeIcons[tx.type];
                const Icon = cfg.icon;
                return (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={cfg.color} />
                      <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t(`inventory.${tx.type}`)}</p><p className="text-xs text-gray-500 dark:text-gray-400">{tx.reference} · {formatDateTime(tx.createdAt)}</p></div>
                    </div>
                    <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.sign}{tx.quantity}</span>
                  </div>
                );
              })}
              {(productHistory?.data ?? []).length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.noData')}</p>}
            </div>
          </div>
        </Modal>
      )}

      {/* Transaction Details Modal */}
      {viewingTransaction && (
        <Modal open={!!viewingTransaction} onClose={() => setViewingTransaction(null)} title={t('inventory.transactionDetails')} size="md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.product')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingTransaction.productName}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.transactionType')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{t(`inventory.${viewingTransaction.type}`)}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('common.quantity')}</p><p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{typeIcons[viewingTransaction.type].sign}{viewingTransaction.quantity}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.reference')}</p><p className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">{viewingTransaction.reference}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('inventory.createdBy')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{viewingTransaction.createdBy}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">{t('common.date')}</p><p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(viewingTransaction.createdAt)}</p></div>
              {viewingTransaction.notes && <div className="col-span-2"><p className="text-xs text-gray-500 dark:text-gray-400">{t('common.notes')}</p><p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{viewingTransaction.notes}</p></div>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TransactionFormModal({ open, onClose, products, onSubmit, loading }: {
  open: boolean; onClose: () => void; products: { id: number; name: string; sku: string }[]; onSubmit: (data: Partial<InventoryTransaction>) => void; loading: boolean;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    productId: products[0]?.id ?? 0, type: 'in' as InventoryTransactionType, quantity: 1, reference: '', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.productId) newErrors.productId = t('common.required');
    if (form.quantity <= 0) newErrors.quantity = t('common.required');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={t('inventory.recordTransaction')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="label">{t('inventory.product')} *</label><select className="input" value={form.productId} onChange={(e) => setForm({ ...form, productId: Number(e.target.value) })}>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select>{errors.productId && <p className="mt-1 text-xs text-error-600">{errors.productId}</p>}</div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">{t('inventory.transactionType')} *</label><select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as InventoryTransactionType })}><option value="in">{t('inventory.stockIn')}</option><option value="out">{t('inventory.stockOut')}</option><option value="return">{t('inventory.return')}</option><option value="adjustment">{t('inventory.adjustment')}</option></select></div>
          <div><label className="label">{t('common.quantity')} *</label><input type="number" min={1} className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />{errors.quantity && <p className="mt-1 text-xs text-error-600">{errors.quantity}</p>}</div>
        </div>
        <div><label className="label">{t('inventory.reference')}</label><input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="PO-2024-XXXX" /></div>
        <div><label className="label">{t('common.notes')}</label><textarea className="input min-h-[60px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button><button type="submit" disabled={loading} className="btn-primary">{t('common.save')}</button></div>
      </form>
    </Modal>
  );
}
