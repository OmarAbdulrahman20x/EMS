import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ps-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-7xl p-4 lg:p-6">
          <div className="animate-fade-in-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
