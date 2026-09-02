import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Cpu, Eye, EyeOff, Moon, Sun, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError(t('auth.loginError'));
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary-100/50 blur-3xl dark:bg-primary-900/20" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-100/50 blur-3xl dark:bg-accent-900/20" />
      </div>

      {/* Top controls */}
      <div className="absolute end-4 top-4 flex items-center gap-1.5">
        <button
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur transition-colors hover:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Globe size={16} />
          {locale === 'ar' ? 'English' : 'العربية'}
        </button>
        <button
          onClick={toggleTheme}
          className="rounded-lg bg-white/80 p-2 text-gray-600 shadow-sm backdrop-blur transition-colors hover:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-card-hover backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/90 animate-fade-in-up">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
              <Cpu size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('common.appName')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('auth.loginSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400 animate-fade-in">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="username">
                {t('auth.usernameOrEmail')}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder={t('auth.usernameOrEmail')}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pe-10"
                  placeholder={t('auth.password')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700" />
                {t('auth.rememberMe')}
              </label>
              <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                {t('auth.forgotPassword')}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('auth.signingIn')}
                </>
              ) : (
                t('auth.login')
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
            <p className="mb-1.5 font-semibold text-gray-600 dark:text-gray-300">Demo Accounts:</p>
            <p>Admin: <span className="font-mono">admin / admin123</span></p>
            <p>Sales: <span className="font-mono">sara.sales / sales123</span></p>
            <p>Inventory: <span className="font-mono">khalid.inv / inv123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
