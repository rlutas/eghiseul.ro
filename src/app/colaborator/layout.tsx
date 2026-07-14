'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Toaster } from '@/components/ui/sonner';
import { ClipboardList, Coins, Layers, LogOut, Menu, Wallet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CollabUser {
  email: string;
  name: string;
}

/**
 * Portal for collaborators (e.g. authorized topographs). Strictly gated to
 * role === 'collaborator'. Collaborators do NOT have access to /admin; this is
 * their separate, minimal workspace for the orders of their assigned services.
 */
export default function CollaboratorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CollabUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.replace('/auth/login?redirect=/colaborator');
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, first_name, last_name, email')
          .eq('id', authUser.id)
          .single();

        if (!profile || profile.role !== 'collaborator') {
          router.replace('/');
          return;
        }
        setUser({
          email: profile.email || authUser.email || '',
          name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email || '',
        });
      } catch {
        router.replace('/auth/login?redirect=/colaborator');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <Link href="/colaborator/orders" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold text-secondary-900">
              eG
            </div>
            <span className="text-sm font-semibold">Colaborator</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white" aria-label="Închide meniul">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <Link
            href="/colaborator/orders"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith('/colaborator/orders')
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            )}
          >
            <ClipboardList className="h-5 w-5 shrink-0" />
            Comenzi
          </Link>
          <Link
            href="/colaborator/decont"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith('/colaborator/decont')
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            )}
          >
            <Wallet className="h-5 w-5 shrink-0" />
            Decont lunar
          </Link>
          <Link
            href="/colaborator/servicii"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith('/colaborator/servicii')
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            )}
          >
            <Layers className="h-5 w-5 shrink-0" />
            Serviciile mele
          </Link>
          <Link
            href="/colaborator/tarife"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith('/colaborator/tarife')
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            )}
          >
            <Coins className="h-5 w-5 shrink-0" />
            Tarife ANCPI
          </Link>
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-slate-100">
              <span className="text-xs font-medium">{user.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-100">{user.name}</p>
              <p className="text-xs text-slate-400">Colaborator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Deconectare
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b bg-white px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-3 text-sm font-semibold">Colaborator</span>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
