import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
    sortable?: boolean;
    width?: string;
  }>;
  loading?: boolean;
  sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (item: T) => void;
  emptyState?: ReactNode;
}

export function DataTable<T extends object>({
  data,
  columns,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  emptyState,
}: DataTableProps<T>) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <div className="skeleton h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="skeleton h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
        {emptyState ?? (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.noResults')}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3.5 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable && onSort ? (
                    <button
                      onClick={() => onSort(col.key)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {col.header}
                      <span className="text-[10px]">
                        {sortBy === col.key ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                className={`border-b border-gray-100 transition-colors last:border-0 dark:border-gray-700/50 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/20'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {col.render ? col.render(item) : ((item as Record<string, unknown>)[col.key] as ReactNode) ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('common.showing')} {start}–{end} {t('common.of')} {total} {t('common.results')}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="btn-ghost px-2 py-1.5 disabled:opacity-30"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn-ghost px-2 py-1.5 disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            (pageNum >= page - 1 && pageNum <= page + 1)
          ) {
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                  page === pageNum
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          }
          if (pageNum === page - 2 || pageNum === page + 2) {
            return (
              <span key={pageNum} className="px-1 text-gray-400">
                ...
              </span>
            );
          }
          return null;
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="btn-ghost px-2 py-1.5 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="btn-ghost px-2 py-1.5 disabled:opacity-30"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
