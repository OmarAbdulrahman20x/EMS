import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Eye, Pencil, Trash2, ShieldCheck, Check, X } from 'lucide-react';
import { rolesApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import type { Role } from '@/types';

const ALL_PERMISSIONS: { key: string; group: string }[] = [
  { key: 'dashboard.view', group: 'dashboard' },
  { key: 'users.manage', group: 'users' },
  { key: 'roles.manage', group: 'roles' },
  { key: 'customers.view', group: 'customers' },
  { key: 'customers.manage', group: 'customers' },
  { key: 'suppliers.view', group: 'suppliers' },
  { key: 'suppliers.manage', group: 'suppliers' },
  { key: 'categories.view', group: 'categories' },
  { key: 'categories.manage', group: 'categories' },
  { key: 'products.view', group: 'products' },
  { key: 'products.manage', group: 'products' },
  { key: 'orders.view', group: 'orders' },
  { key: 'orders.manage', group: 'orders' },
  { key: 'orders.create', group: 'orders' },
  { key: 'inventory.view', group: 'inventory' },
  { key: 'inventory.manage', group: 'inventory' },
  { key: 'reports.sales', group: 'reports' },
  { key: 'reports.inventory', group: 'reports' },
  { key: 'reports.products', group: 'reports' },
  { key: 'reports.customers', group: 'reports' },
  { key: 'settings.manage', group: 'settings' },
];

const PERMISSION_GROUPS = ['dashboard', 'users', 'roles', 'customers', 'suppliers', 'categories', 'products', 'orders', 'inventory', 'reports', 'settings'];

export function RolesPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Role>) => rolesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showToast('success', t('common.created'));
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Role> }) => rolesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showToast('success', t('common.updated'));
      setShowForm(false);
      setEditingRole(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showToast('success', t('common.deleted'));
    },
  });

  const filteredRoles = roles?.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <div>
      <PageHeader
        title={t('roles.title')}
        subtitle={t('roles.subtitle')}
        actions={
          <button onClick={() => { setEditingRole(null); setShowForm(true); }} className="btn-primary">
            <Plus size={18} /> {t('roles.addRole')}
          </button>
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-10" placeholder={t('common.search')} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <div key={role.id} className="card p-5 transition-shadow hover:shadow-card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{role.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{role.userCount} {t('roles.userCount')}</p>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === role.id ? null : role.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <MoreVertical size={16} />
                  </button>
                  {menuOpen === role.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute end-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-card-hover dark:border-gray-700 dark:bg-gray-800 animate-scale-in">
                        <button onClick={() => { setViewingRole(role); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                          <Eye size={14} /> {t('common.view')}
                        </button>
                        <button onClick={() => { setEditingRole(role); setShowForm(true); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50">
                          <Pencil size={14} /> {t('common.edit')}
                        </button>
                        {role.name !== 'Admin' && (
                          <button onClick={() => { setDeleteRole(role); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20">
                            <Trash2 size={14} /> {t('common.delete')}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{role.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-1">
                  {Array.from({ length: Math.min(role.userCount, 3) }).map((_, i) => (
                    <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary-100 text-[10px] font-semibold text-primary-700 dark:border-gray-800 dark:bg-primary-900/30 dark:text-primary-400">
                      U{i + 1}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{role.permissions.length} {t('roles.permissions')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <RoleFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setEditingRole(null); }}
          editingRole={editingRole}
          onSubmit={(data) => {
            if (editingRole) updateMutation.mutate({ id: editingRole.id, data });
            else createMutation.mutate(data);
          }}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* View Modal */}
      {viewingRole && (
        <Modal open={!!viewingRole} onClose={() => setViewingRole(null)} title={t('roles.roleDetails')} size="lg">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{viewingRole.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{viewingRole.description}</p>
            </div>
            <div className="space-y-3">
              {PERMISSION_GROUPS.map((group) => {
                const groupPerms = ALL_PERMISSIONS.filter((p) => p.group === group);
                const groupLabel = t(`roles.permissionGroups.${group}`);
                return (
                  <div key={group} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{groupLabel}</p>
                    <div className="flex flex-wrap gap-2">
                      {groupPerms.map((perm) => {
                        const has = viewingRole.permissions.includes(perm.key);
                        return (
                          <span key={perm.key} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${has ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
                            {has ? <Check size={12} /> : <X size={12} />}
                            {t(`roles.permissionActions.${perm.key.split('.')[1] === 'view' ? 'view' : perm.key.split('.')[1] === 'manage' ? 'manage' : 'create'}`)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteRole}
        onClose={() => setDeleteRole(null)}
        onConfirm={() => { if (deleteRole) deleteMutation.mutate(deleteRole.id); }}
        title={t('common.delete')}
        message={t('common.confirmDelete')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
      />
    </div>
  );
}

function RoleFormModal({
  open, onClose, editingRole, onSubmit, loading,
}: {
  open: boolean;
  onClose: () => void;
  editingRole: Role | null;
  onSubmit: (data: Partial<Role>) => void;
  loading: boolean;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(editingRole?.name ?? '');
  const [description, setDescription] = useState(editingRole?.description ?? '');
  const [permissions, setPermissions] = useState<string[]>(editingRole?.permissions ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const togglePermission = (key: string) => {
    setPermissions((prev) => prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]);
  };

  const toggleGroup = (group: string) => {
    const groupPerms = ALL_PERMISSIONS.filter((p) => p.group === group).map((p) => p.key);
    const allSelected = groupPerms.every((p) => permissions.includes(p));
    if (allSelected) {
      setPermissions((prev) => prev.filter((p) => !groupPerms.includes(p)));
    } else {
      setPermissions((prev) => [...new Set([...prev, ...groupPerms])]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('common.required');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({ name, description, permissions });
  };

  return (
    <Modal open={open} onClose={onClose} title={editingRole ? t('roles.editRole') : t('roles.addRole')} size="xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t('common.name')} *</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}
          </div>
          <div>
            <label className="label">{t('common.description')}</label>
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('roles.assignPermissions')}</p>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {PERMISSION_GROUPS.map((group) => {
              const groupPerms = ALL_PERMISSIONS.filter((p) => p.group === group);
              const allSelected = groupPerms.every((p) => permissions.includes(p.key));
              return (
                <div key={group} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t(`roles.permissionGroups.${group}`)}</p>
                    <button type="button" onClick={() => toggleGroup(group)} className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      {allSelected ? t('common.clearAll') : t('common.selectAll')}
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {groupPerms.map((perm) => {
                      const has = permissions.includes(perm.key);
                      const actionLabel = perm.key.split('.')[1] === 'view' ? t('roles.permissionActions.view') : perm.key.split('.')[1] === 'manage' ? t('roles.permissionActions.manage') : t('roles.permissionActions.create');
                      return (
                        <button
                          key={perm.key}
                          type="button"
                          onClick={() => togglePermission(perm.key)}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${has ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'}`}
                        >
                          {has ? <Check size={12} /> : <X size={12} />}
                          {actionLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
