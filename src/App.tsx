import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ToastContainer } from '@/components/ui/Toast';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { UsersPage } from '@/features/users/UsersPage';
import { RolesPage } from '@/features/roles/RolesPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { SuppliersPage } from '@/features/suppliers/SuppliersPage';
import { CategoriesPage } from '@/features/categories/CategoriesPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { CreateOrderPage } from '@/features/orders/CreateOrderPage';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { SettingsPage } from '@/features/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<ProtectedRoute permission="dashboard.view"><DashboardPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute permission="users.manage"><UsersPage /></ProtectedRoute>} />
                <Route path="/roles" element={<ProtectedRoute permission="roles.manage"><RolesPage /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute permission="customers.view"><CustomersPage /></ProtectedRoute>} />
                <Route path="/suppliers" element={<ProtectedRoute permission="suppliers.view"><SuppliersPage /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute permission="categories.view"><CategoriesPage /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute permission="products.view"><ProductsPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute permission="orders.view"><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/new" element={<ProtectedRoute permission="orders.create"><CreateOrderPage /></ProtectedRoute>} />
                <Route path="/orders/:id/edit" element={<ProtectedRoute permission="orders.manage"><CreateOrderPage /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute permission="inventory.view"><InventoryPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute permission="reports.sales"><ReportsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute permission="settings.manage"><SettingsPage /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
            <ToastContainer />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
