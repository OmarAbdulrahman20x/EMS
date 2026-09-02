import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  UserCircle,
  Building2,
  FolderTree,
  Package,
  ShoppingCart,
  Warehouse,
  FileBarChart,
  Settings,
  Cpu,
  X,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavItem {
  path: string;
  labelKey: string;
  icon: LucideIcon;
  permission?: string;
  group?: string;
}

const navItems: NavItem[] = [
  {
    path: "/dashboard",
    labelKey: "nav.dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
    group: "main",
  },
  {
    path: "/customers",
    labelKey: "nav.customers",
    icon: UserCircle,
    permission: "customers.view",
    group: "operations",
  },
  {
    path: "/orders",
    labelKey: "nav.orders",
    icon: ShoppingCart,
    permission: "orders.view",
    group: "operations",
  },
  {
    path: "/products",
    labelKey: "nav.products",
    icon: Package,
    permission: "products.view",
    group: "operations",
  },
  {
    path: "/inventory",
    labelKey: "nav.inventory",
    icon: Warehouse,
    permission: "inventory.view",
    group: "operations",
  },
  {
    path: "/suppliers",
    labelKey: "nav.suppliers",
    icon: Building2,
    permission: "suppliers.view",
    group: "management",
  },
  {
    path: "/categories",
    labelKey: "nav.categories",
    icon: FolderTree,
    permission: "categories.view",
    group: "management",
  },
  {
    path: "/users",
    labelKey: "nav.users",
    icon: Users,
    permission: "users.manage",
    group: "system",
  },
  {
    path: "/roles",
    labelKey: "nav.roles",
    icon: ShieldCheck,
    permission: "roles.manage",
    group: "system",
  },
  {
    path: "/reports",
    labelKey: "nav.reports",
    icon: FileBarChart,
    permission: "reports.sales",
    group: "analytics",
  },
  {
    path: "/settings",
    labelKey: "nav.settings",
    icon: Settings,
    permission: "settings.manage",
    group: "system",
  },
];

const groupLabels: Record<string, string> = {
  main: "",
  operations: "nav.operations",
  management: "nav.management",
  system: "nav.system",
  analytics: "nav.analytics",
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { hasPermission } = useAuth();
  const { t } = useLanguage();

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const groups = [
    "main",
    "operations",
    "management",
    "system",
    "analytics",
  ].filter((g) => visibleItems.some((item) => item.group === g));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 z-40 flex flex-col overflow-hidden border-e border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
          collapsed ? "w-20" : "w-64"
        } ${
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        } lg:!translate-x-0`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-gray-200 dark:border-gray-700 ${
            collapsed ? "justify-center px-3" : "justify-between px-6"
          }`}
        >
          <div
            className={`flex items-center gap-2.5 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Cpu size={20} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-gray-900 dark:text-gray-100">
                  {t("common.appName")}
                </p>
                <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                  {t("common.appTagline")}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed((value) => !value)}
            className="hidden rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:block dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={20} />
          </button>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group} className="mb-4">
              {!collapsed && group !== "main" && groupLabels[group] && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {t(groupLabels[group])}
                </p>
              )}

              {visibleItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      title={collapsed ? t(item.labelKey) : undefined}
                      className={({ isActive }) =>
                        `mb-1 flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
                          collapsed ? "justify-center px-2" : "gap-3 px-3"
                        } ${
                          isActive
                            ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-100"
                        }`
                      }
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && (
                        <span className="truncate">{t(item.labelKey)}</span>
                      )}
                    </NavLink>
                  );
                })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
