import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  DollarSign, TrendingUp, Users, ShoppingCart, ArrowUp, ArrowDown, Award, Package,
} from 'lucide-react';
import { dashboardApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PageHeader } from '@/components/ui/PageHeader';
import type { DateRange } from '@/types';

const chartColors = ['#2563eb', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export function DashboardPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<DateRange>('month');

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis', dateRange],
    queryFn: () => dashboardApi.getKpis(),
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-charts', dateRange],
    queryFn: () => dashboardApi.getCharts(),
  });

  const axisColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const tooltipBg = theme === 'dark' ? '#1f2937' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#374151' : '#e5e7eb';

  const rangeOptions: { value: DateRange; label: string }[] = [
    { value: 'today', label: t('dashboard.dateRange.today') },
    { value: 'week', label: t('dashboard.dateRange.thisWeek') },
    { value: 'month', label: t('dashboard.dateRange.thisMonth') },
    { value: 'year', label: t('dashboard.dateRange.thisYear') },
  ];

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
            {rangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  dateRange === opt.value
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <KpiCard
          label={t('dashboard.kpis.totalSales')}
          value={kpis ? formatCurrency(kpis.totalSales) : '—'}
          icon={<DollarSign size={20} />}
          iconBg="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
          trend="+12.5%"
          trendUp
          loading={kpisLoading}
        />
        {/* Total Profit */}
        <KpiCard
          label={t('dashboard.kpis.totalProfit')}
          value={kpis ? formatCurrency(kpis.totalProfit) : '—'}
          icon={<TrendingUp size={20} />}
          iconBg="bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400"
          trend="+8.2%"
          trendUp
          loading={kpisLoading}
        />
        {/* Customers */}
        <KpiCard
          label={t('dashboard.kpis.customers')}
          value={kpis ? String(kpis.customerCount) : '—'}
          icon={<Users size={20} />}
          iconBg="bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400"
          trend="+3"
          trendUp
          loading={kpisLoading}
        />
        {/* Orders */}
        <KpiCard
          label={t('dashboard.kpis.orders')}
          value={kpis ? String(kpis.orderCount) : '—'}
          icon={<ShoppingCart size={20} />}
          iconBg="bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400"
          trend="+5"
          trendUp
          loading={kpisLoading}
        />
      </div>

      {/* Product/Customer KPIs */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoKpiCard
          label={t('dashboard.kpis.bestSellingProduct')}
          icon={<Award size={18} />}
          iconBg="bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400"
          name={kpis?.bestSellingProduct?.name ?? '—'}
          value={kpis ? `${kpis.bestSellingProduct?.unitsSold} ${t('dashboard.kpis.unitsSold')}` : '—'}
          loading={kpisLoading}
        />
        <InfoKpiCard
          label={t('dashboard.kpis.leastSellingProduct')}
          icon={<Package size={18} />}
          iconBg="bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400"
          name={kpis?.leastSellingProduct?.name ?? '—'}
          value={kpis ? `${kpis.leastSellingProduct?.unitsSold} ${t('dashboard.kpis.unitsSold')}` : '—'}
          loading={kpisLoading}
        />
        <InfoKpiCard
          label={t('dashboard.kpis.topCustomer')}
          icon={<Users size={18} />}
          iconBg="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
          name={kpis?.topCustomer?.name ?? '—'}
          value={kpis ? formatCurrency(kpis.topCustomer?.totalPurchases ?? 0) : '—'}
          loading={kpisLoading}
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Monthly Sales */}
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('dashboard.charts.monthlySales')}
          </h3>
          {chartsLoading ? (
            <div className="skeleton h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={charts?.monthlySales ?? []}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} fontSize={12} />
                <YAxis stroke={axisColor} fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="sales" name={t('dashboard.charts.revenue')} stroke="#2563eb" fill="url(#salesGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name={t('dashboard.charts.profit')} stroke="#22c55e" fill="url(#profitGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sales Comparison */}
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('dashboard.charts.salesComparison')}
          </h3>
          {chartsLoading ? (
            <div className="skeleton h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts?.salesComparison ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="period" stroke={axisColor} fontSize={12} />
                <YAxis stroke={axisColor} fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="current" name={t('dashboard.charts.current')} fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="previous" name={t('dashboard.charts.previous')} fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products */}
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('dashboard.charts.topProducts')}
          </h3>
          {chartsLoading ? (
            <div className="skeleton h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts?.topProducts ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" stroke={axisColor} fontSize={12} />
                <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="unitsSold" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Distribution */}
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('dashboard.charts.categoryDistribution')}
          </h3>
          {chartsLoading ? (
            <div className="skeleton h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={charts?.categoryDistribution ?? []}
                  dataKey="sales"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {(charts?.categoryDistribution ?? []).map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Customers - full width */}
      <div className="mt-4 card p-5">
        <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
          {t('dashboard.charts.topCustomers')}
        </h3>
        {chartsLoading ? (
          <div className="skeleton h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts?.topCustomers ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} fontSize={11} />
              <YAxis stroke={axisColor} fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="totalPurchases" name={t('dashboard.kpis.totalPurchases')} fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
}

function KpiCard({ label, value, icon, iconBg, trend, trendUp, loading }: KpiCardProps) {
  return (
    <div className="card p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          {loading ? (
            <div className="skeleton mt-2 h-7 w-24" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={`flex items-center gap-0.5 font-medium ${trendUp ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
            {trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trend}
          </span>
          <span className="text-gray-400 dark:text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}

interface InfoKpiCardProps {
  label: string;
  name: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  loading?: boolean;
}

function InfoKpiCard({ label, name, value, icon, iconBg, loading }: InfoKpiCardProps) {
  return (
    <div className="card p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-4 w-20" />
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</p>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{value}</p>
        </div>
      )}
    </div>
  );
}
