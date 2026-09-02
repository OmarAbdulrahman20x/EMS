import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Eye, Pencil, Power, UserPlus } from 'lucide-react';
import { usersApi, rolesApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Pagination } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import type { User, QueryParams } from '@/types';

export function UsersPage() {
  const { t, locale } = useLanguage();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 10, search: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.list(params),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles-all'],
    queryFn: () => rolesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<User>) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('success', t('common.created'));
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('success', t('common.updated'));
      setShowForm(false);
      setEditingUser(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) =>
      usersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('success', t('common.updated'));
    },
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns = [
    { key: 'fullName', header: t('users.fullName'), sortable: true, render: (u: User) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
          {u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <span className="font-medium text-gray-900 dark:text-gray-100">{u.fullName}</span>
      </div>
    )},
    { key: 'username', header: t('users.username') },
    { key: 'email', header: t('common.email') },
    { key: 'phone', header: t('common.phone') },
    { key: 'roleName', header: t('users.role'), render: (u: User) => (
      <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">{u.roleName}</span>
    )},
    { key: 'status', header: t('common.status'), render: (u: User) => <StatusBadge status={u.status} /> },
    { key: 'createdAt', header: t('common.createdAt'), render: (u: User) => formatDate(u.createdAt) },
    {
      key: 'actions', header: t('common.actions'), width: '80px', render: (u: User) => (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === u.id ? null : u.id); }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen === u.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
              <div className="absolute end-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-card-hover dark:border-gray-700 dark:bg-gray-800 animate-scale-in">
                <button onClick={() => { setViewingUser(u); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                  <Eye size={14} /> {t('common.view')}
                </button>
                <button onClick={() => { setEditingUser(u); setShowForm(true); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                  <Pencil size={14} /> {t('common.edit')}
                </button>
                {u.id !== currentUser?.id && (
                  <button onClick={() => { setDeactivateUser(u); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20">
                    <Power size={14} /> {u.status === 'active' ? t('users.deactivate') : t('users.activate')}
                  </button>
                )}
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
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        actions={
          <button onClick={() => { setEditingUser(null); setShowForm(true); }} className="btn-primary">
            <UserPlus size={18} /> {t('users.addUser')}
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={params.search as string}
            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
            className="input ps-10"
            placeholder={t('common.search')}
          />
        </div>
        <select
          value={(params.status as string) ?? ''}
          onChange={(e) => setParams({ ...params, status: e.target.value || undefined, page: 1 })}
          className="input sm:w-40"
        >
          <option value="">{t('common.all')} {t('common.status')}</option>
          <option value="active">{t('common.active')}</option>
          <option value="inactive">{t('common.inactive')}</option>
        </select>
        <select
          value={(params.roleId as string) ?? ''}
          onChange={(e) => setParams({ ...params, roleId: e.target.value || undefined, page: 1 })}
          className="input sm:w-40"
        >
          <option value="">{t('common.all')} {t('users.role')}</option>
          {roles?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        sortBy={params.sortBy as string}
        sortOrder={params.sortOrder as 'asc' | 'desc'}
        onSort={(key) => setParams({ ...params, sortBy: key, sortOrder: params.sortBy === key && params.sortOrder === 'asc' ? 'desc' : 'asc' })}
      />

      {data && (
        <div className="mt-4">
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={data.pageSize}
            onPageChange={(page) => setParams({ ...params, page })}
          />
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <UserFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setEditingUser(null); }}
          editingUser={editingUser}
          roles={roles ?? []}
          onSubmit={(data) => {
            if (editingUser) {
              updateMutation.mutate({ id: editingUser.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* View Modal */}
      {viewingUser && (
        <Modal open={!!viewingUser} onClose={() => setViewingUser(null)} title={t('users.userDetails')} size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                {viewingUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{viewingUser.fullName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{viewingUser.username}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DetailField label={t('common.email')} value={viewingUser.email} />
              <DetailField label={t('common.phone')} value={viewingUser.phone} />
              <DetailField label={t('users.role')} value={viewingUser.roleName} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('common.status')}</p>
                <div className="mt-1"><StatusBadge status={viewingUser.status} /></div>
              </div>
              <DetailField label={t('common.createdAt')} value={formatDate(viewingUser.createdAt)} />
            </div>
          </div>
        </Modal>
      )}

      {/* Deactivate Confirm */}
      <ConfirmDialog
        open={!!deactivateUser}
        onClose={() => setDeactivateUser(null)}
        onConfirm={() => {
          if (deactivateUser) {
            statusMutation.mutate({
              id: deactivateUser.id,
              status: deactivateUser.status === 'active' ? 'inactive' : 'active',
            });
          }
        }}
        title={deactivateUser?.status === 'active' ? t('users.deactivate') : t('users.activate')}
        message={t('common.confirmDeactivate')}
        confirmLabel={deactivateUser?.status === 'active' ? t('users.deactivate') : t('users.activate')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

function UserFormModal({
  open, onClose, editingUser, roles, onSubmit, loading,
}: {
  open: boolean;
  onClose: () => void;
  editingUser: User | null;
  roles: { id: number; name: string }[];
  onSubmit: (data: Partial<User>) => void;
  loading: boolean;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    fullName: editingUser?.fullName ?? '',
    username: editingUser?.username ?? '',
    email: editingUser?.email ?? '',
    phone: editingUser?.phone ?? '',
    roleId: editingUser?.roleId ?? 1,
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = t('common.required');
    if (!form.username.trim()) newErrors.username = t('common.required');
    if (!form.email.trim()) newErrors.email = t('common.required');
    if (!editingUser && !form.password) newErrors.password = t('common.required');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({
      fullName: form.fullName,
      username: form.username,
      email: form.email,
      phone: form.phone,
      roleId: form.roleId,
      ...(form.password ? { password: form.password } : {}),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editingUser ? t('users.editUser') : t('users.addUser')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t('users.fullName')} *</label>
            <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            {errors.fullName && <p className="mt-1 text-xs text-error-600">{errors.fullName}</p>}
          </div>
          <div>
            <label className="label">{t('users.username')} *</label>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            {errors.username && <p className="mt-1 text-xs text-error-600">{errors.username}</p>}
          </div>
          <div>
            <label className="label">{t('common.email')} *</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="mt-1 text-xs text-error-600">{errors.email}</p>}
          </div>
          <div>
            <label className="label">{t('common.phone')}</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('users.role')} *</label>
            <select className="input" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('users.password')}{!editingUser && ' *'}</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingUser ? t('users.passwordHint') : ''} />
            {errors.password && <p className="mt-1 text-xs text-error-600">{errors.password}</p>}
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
