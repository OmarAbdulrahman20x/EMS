import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
  error: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
  info: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
  neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
};

export function Badge({
  variant = 'neutral',
  children,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
}) {
  return <span className={`badge ${variantClasses[variant]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, BadgeVariant> = {
    active: 'success',
    inactive: 'neutral',
    confirmed: 'success',
    pending: 'warning',
    draft: 'neutral',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'error',
    in_stock: 'success',
    low_stock: 'warning',
    out_of_stock: 'error',
  };
  return <Badge variant={statusMap[status] ?? 'neutral'}>{status.replace(/_/g, ' ')}</Badge>;
}
