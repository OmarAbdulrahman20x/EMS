import { useState } from 'react';
import { User, Mail, Phone, Shield, Lock, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { showToast } from '@/components/ui/Toast';

export function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ fullName: user?.fullName ?? '', email: user?.email ?? '', phone: user?.phone ?? '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', t('common.updated'));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!pwForm.currentPassword) errors.currentPassword = t('common.required');
    if (!pwForm.newPassword) errors.newPassword = t('common.required');
    if (pwForm.newPassword !== pwForm.confirmPassword) errors.confirmPassword = t('profile.passwordMismatch');
    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;
    showToast('success', t('profile.passwordChanged'));
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white">{initials}</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.fullName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              <Shield size={12} /> {user?.role}
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{t('profile.cannotChangeRole')}</p>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="card p-5">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('profile.personalInfo')}</h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="label">{t('users.fullName')}</label><div className="relative"><User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input ps-10" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div></div>
                <div><label className="label">{t('common.email')}</label><div className="relative"><Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" className="input ps-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></div>
                <div><label className="label">{t('common.phone')}</label><div className="relative"><Phone size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input ps-10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div></div>
                <div><label className="label">{t('profile.role')}</label><div className="relative"><Shield size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input ps-10 bg-gray-50 dark:bg-gray-700/50" value={user?.role ?? ''} disabled /></div></div>
              </div>
              <div className="flex justify-end"><button type="submit" className="btn-primary"><Save size={18} /> {t('common.save')}</button></div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card p-5">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('profile.changePassword')}</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className="label">{t('profile.currentPassword')}</label><div className="relative"><Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" className="input ps-10" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} /></div>{pwErrors.currentPassword && <p className="mt-1 text-xs text-error-600">{pwErrors.currentPassword}</p>}</div>
                <div><label className="label">{t('profile.newPassword')}</label><div className="relative"><Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" className="input ps-10" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} /></div>{pwErrors.newPassword && <p className="mt-1 text-xs text-error-600">{pwErrors.newPassword}</p>}</div>
                <div><label className="label">{t('profile.confirmPassword')}</label><div className="relative"><Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" className="input ps-10" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} /></div>{pwErrors.confirmPassword && <p className="mt-1 text-xs text-error-600">{pwErrors.confirmPassword}</p>}</div>
              </div>
              <div className="flex justify-end"><button type="submit" className="btn-primary"><Lock size={18} /> {t('profile.changePassword')}</button></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
