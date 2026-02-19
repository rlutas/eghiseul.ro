'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Toaster } from '@/components/ui/sonner';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AdminPermissionProvider,
  type AdminUser,
} from '@/hooks/use-admin-permissions';
import type { Permission } from '@/lib/admin/permissions';

// ──────────────────────────────────────────────────────────────
// Navigation items with permission requirements
// ──────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Permission required to see this item. undefined = always visible. */
  permission?: Permission;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Comenzi', icon: ClipboardList, permission: 'orders.view' },
  { href: '/admin/registru', label: 'Registru', icon: BookOpen, permission: 'settings.manage' },
  { href: '/admin/users', label: 'Utilizatori', icon: Users, permission: 'users.manage' },
  { href: '/admin/settings', label: 'Setari', icon: Settings, permission: 'settings.manage' },
];

// ──────────────────────────────────────────────────────────────
// Implied permissions (client-side mirror for nav filtering)
// ──────────────────────────────────────────────────────────────

const IMPLIED_PERMISSIONS: Record<string, string[]> = {
  'orders.view': [],
  'orders.manage': ['orders.view'],
  'payments.verify': ['orders.view'],
  'users.manage': [],
  'settings.manage': [],
};

function hasPermissionClient(
  role: string,
  permissions: Record<string, boolean>,
  required: Permission
): boolean {
  if (role === 'super_admin') return true;

  // Check direct permission
  if (permissions[required] === true) return true;

  // Check if any held permission implies the required one
  for (const [key, value] of Object.entries(permissions)) {
    if (value === true) {
      const implied = IMPLIED_PERMISSIONS[key];
      if (implied && implied.includes(required)) return true;
    }
  }

  return false;
}

// ──────────────────────────────────────────────────────────────
// Layout component
// ──────────────────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Public sub-routes (no admin auth / sidebar) ──────────────
  const isPublicRoute = pathname.startsWith('/admin/invite');

  useEffect(() => {
    // Skip admin auth check for public routes (e.g. invite accept page)
    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.replace('/login?redirect=/admin');
          return;
        }

        // Check if user has super_admin or employee role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, first_name, last_name, email, permissions')
          .eq('id', authUser.id)
          .single();

        if (!profile || !['super_admin', 'manager', 'operator', 'contabil', 'avocat', 'employee'].includes(profile.role || '')) {
          router.replace('/');
          return;
        }

        setUser({
          email: profile.email || authUser.email || '',
          role: profile.role || 'employee',
          permissions: (profile.permissions as Record<string, boolean>) || {},
        });
      } catch {
        router.replace('/login?redirect=/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, isPublicRoute]);

  // Filter nav items based on user permissions
  const visibleNavItems = useMemo(() => {
    if (!user) return [];
    return NAV_ITEMS.filter((item) => {
      if (!item.permission) return true; // Dashboard is always visible
      return hasPermissionClient(user.role, user.permissions, item.permission);
    });
  }, [user]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Se incarca...</p>
        </div>
      </div>
    );
  }

  // Public sub-routes render without admin chrome
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return (
    <AdminPermissionProvider user={user}>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-200 lg:static lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Logo */}
          <div className="flex h-14 items-center justify-between border-b px-4">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">eGhiseul Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info & logout */}
          <div className="border-t p-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xs font-medium text-primary">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 mt-1 text-gray-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Deconectare
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <span className="text-sm text-muted-foreground">
              Panou administrare
            </span>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>

        <Toaster position="top-right" richColors />
      </div>
    </AdminPermissionProvider>
  );
}
