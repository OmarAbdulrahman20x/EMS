import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Search, ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { ordersApi, customersApi, productsApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { showToast } from '@/components/ui/Toast';
import type { Product, OrderItem } from '@/types';

interface CartItem {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  availableStock: number;
}

export function CreateOrderPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: customers } = useQuery({ queryKey: ['customers-all'], queryFn: () => customersApi.list({ pageSize: 100 }) });
  const { data: products } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.listAll() });

  const { data: editingOrder } = useQuery({
    queryKey: ['order', editId],
    queryFn: () => ordersApi.getById(editId!),
    enabled: !!editId,
  });

  // Load editing order data
  useMemo(() => {
    if (editingOrder) {
      setCustomerId(String(editingOrder.customerId));
      setOrderDate(editingOrder.orderDate.split('T')[0]);
      setNotes(editingOrder.notes);
      setCart(editingOrder.items.map((item: OrderItem) => ({
        productId: item.productId, productName: item.productName, productSku: item.productSku,
        quantity: item.quantity, unitPrice: item.unitPrice, availableStock: 999,
      })));
    }
  }, [editingOrder]);

  const createMutation = useMutation({
    mutationFn: ({ data, items, confirm }: { data: Partial<import('@/types').Order>; items: Partial<OrderItem>[]; confirm: boolean }) =>
      ordersApi.create(data, items).then((order) => confirm ? ordersApi.confirm(order.id) : order),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      showToast('success', variables.confirm ? t('orders.orderConfirmed') : t('orders.orderSaved'));
      navigate('/orders');
    },
  });

  const filteredProducts = (products ?? []).filter((p: Product) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const grandTotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const addToCart = (product: Product) => {
    if (cart.some((item) => item.productId === product.id)) {
      showToast('warning', 'Already added');
      return;
    }
    setCart([...cart, {
      productId: product.id, productName: product.name, productSku: product.sku,
      quantity: 1, unitPrice: product.sellingPrice, availableStock: product.currentStock,
    }]);
    setProductSearch('');
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCart(cart.map((item) => item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  const updatePrice = (productId: number, price: number) => {
    setCart(cart.map((item) => item.productId === productId ? { ...item, unitPrice: Math.max(0, price) } : item));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const handleSubmit = (confirm: boolean) => {
    const newErrors: Record<string, string> = {};
    if (!customerId) newErrors.customer = t('orders.selectCustomer');
    if (cart.length === 0) newErrors.cart = t('orders.noItems');
    if (confirm) {
      for (const item of cart) {
        if (item.quantity > item.availableStock) {
          newErrors.cart = t('orders.insufficientStock', { product: item.productName, available: item.availableStock });
          break;
        }
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const customer = customers?.data.find((c) => c.id === Number(customerId));
    createMutation.mutate({
      data: {
        customerId: Number(customerId), customerName: customer?.name,
        employeeId: user?.id, employeeName: user?.fullName,
        orderDate: new Date(orderDate).toISOString(), notes, status: confirm ? 'pending' : 'draft',
      },
      items: cart.map((item) => ({
        productId: item.productId, productName: item.productName, productSku: item.productSku,
        quantity: item.quantity, unitPrice: item.unitPrice,
      })),
      confirm,
    });
  };

  return (
    <div>
      <PageHeader title={editId ? t('orders.editOrder') : t('orders.createOrder')} subtitle=""
        actions={<button onClick={() => navigate('/orders')} className="btn-secondary"><ArrowLeft size={18} /> {t('common.cancel')}</button>} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Order Info + Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="card p-5">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('orders.createOrder')}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t('orders.customer')} *</label>
                <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">{t('orders.selectCustomer')}</option>
                  {customers?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.customer && <p className="mt-1 text-xs text-error-600">{errors.customer}</p>}
              </div>
              <div>
                <label className="label">{t('orders.orderDate')}</label>
                <input type="date" className="input" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">{t('common.notes')}</label>
                <textarea className="input min-h-[60px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="card p-5">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('products.title')}</h3>
            <div className="relative mb-4">
              <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="input ps-10" placeholder={t('common.search')} />
            </div>
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {filteredProducts.map((p: Product) => (
                <button key={p.id} onClick={() => addToCart(p)} disabled={p.currentStock === 0}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-start transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
                  <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{p.sku} · {p.categoryName}</p></div>
                  <div className="flex items-center gap-3"><span className="text-sm text-gray-600 dark:text-gray-300">${p.sellingPrice}</span><span className={`badge ${p.currentStock === 0 ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{p.currentStock}</span><Plus size={16} className="text-primary-600 dark:text-primary-400" /></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20 p-5">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('orders.createOrder')} ({cart.length})</h3>
            {cart.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">{t('orders.noItems')}</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.productId} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.productName}</p><p className="text-xs text-gray-500 dark:text-gray-400">{item.productSku}</p></div>
                      <button onClick={() => removeFromCart(item.productId)} className="text-error-500 hover:text-error-600"><Trash2 size={16} /></button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500 dark:text-gray-400">{t('common.quantity')}</label>
                        <input type="number" min={1} max={item.availableStock} className="input py-1" value={item.quantity} onChange={(e) => updateQuantity(item.productId, Number(e.target.value))} />
                        {item.quantity > item.availableStock && <p className="mt-0.5 text-[10px] text-error-600">{t('orders.insufficientStock', { product: '', available: item.availableStock })}</p>}
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500 dark:text-gray-400">{t('orders.unitPrice')}</label>
                        <input type="number" step="0.01" className="input py-1" value={item.unitPrice} onChange={(e) => updatePrice(item.productId, Number(e.target.value))} />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">{t('orders.subtotal')}</span><span className="text-sm font-semibold text-gray-900 dark:text-gray-100">${(item.quantity * item.unitPrice).toFixed(2)}</span></div>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div className="flex justify-between"><span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('orders.grandTotal')}</span><span className="text-xl font-bold text-gray-900 dark:text-gray-100">${grandTotal.toFixed(2)}</span></div>
                </div>
                {errors.cart && <p className="text-xs text-error-600">{errors.cart}</p>}
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleSubmit(true)} disabled={createMutation.isPending} className="btn-primary"><CheckCircle size={18} /> {t('orders.confirmOrder')}</button>
                  <button onClick={() => handleSubmit(false)} disabled={createMutation.isPending} className="btn-secondary"><Save size={18} /> {t('orders.saveDraft')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
