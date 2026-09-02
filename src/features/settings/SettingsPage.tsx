import { useState } from 'react';
import { Building2, Save, Upload, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { showToast } from '@/components/ui/Toast';

export function SettingsPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    companyName: 'TechElectronics Co.',
    email: 'info@techelectronics.com',
    phone: '+966 11 234 5678',
    address: 'King Fahd Road, Riyadh, Saudi Arabia',
    currency: 'USD',
    dateFormat: 'YYYY-MM-DD',
    language: 'ar',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', t('common.saved'));
  };

  return (
    <div>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')}
        actions={<button onClick={handleSave} className="btn-primary"><Save size={18} /> {t('common.save')}</button>} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Company Info */}
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <Building2 size={18} /> {t('settings.companyName')}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="label">{t('settings.companyName')}</label><input className="input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
            <div>
              <label className="label">{t('settings.companyLogo')}</label>
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"><Building2 size={24} /></div>
                <button type="button" className="btn-secondary"><Upload size={16} /> {t('settings.companyLogo')}</button>
              </div>
            </div>
          </form>
        </div>

        {/* Contact Info */}
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <Mail size={18} /> {t('settings.contactInfo')}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="label">{t('common.email')}</label><div className="relative"><Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" className="input ps-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></div>
            <div><label className="label">{t('common.phone')}</label><div className="relative"><Phone size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input ps-10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div></div>
            <div><label className="label">{t('common.address')}</label><div className="relative"><MapPin size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" /><input className="input ps-10" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div></div>
          </form>
        </div>

        {/* General Settings */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">{t('settings.generalSettings')}</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div><label className="label">{t('settings.currency')}</label><select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}><option value="USD">USD ($)</option><option value="SAR">SAR (ر.س)</option><option value="EUR">EUR (€)</option><option value="AED">AED (د.إ)</option></select></div>
            <div><label className="label">{t('settings.dateFormat')}</label><select className="input" value={form.dateFormat} onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}><option value="YYYY-MM-DD">YYYY-MM-DD</option><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option></select></div>
            <div><label className="label">{t('settings.language')}</label><select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}><option value="ar">العربية</option><option value="en">English</option></select></div>
          </form>
        </div>
      </div>
    </div>
  );
}
