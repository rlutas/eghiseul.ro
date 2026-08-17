'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Toaster } from '@/components/ui/sonner';
import { ClipboardList, Coins, Eye, Layers, LogOut, Menu, Wallet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePreviewAs, withPreview } from '@/lib/collaborator/preview';

interface CollabUser {
  email: string;
  name: string;
}

const ADMIN_ROLES = ['super_admin', 'manager', 'operator', 'contabil', 'avocat', 'employee'];

/**
 * Portal for collaborators (e.g. authorized topographs). Strictly gated to
 * role === 'collaborator'. Collaborators do NOT have access to /admin; this is
 * their separate, minimal workspace for the orders of their assigned services.
 *
 * Excepție: `?as=<collaboratorId>` = PREVIEW pentru admin — vede portalul cu
 * ochii colaboratorului, read-only (API-ul cere `users.manage`, iar acțiunile
 * de lucru sunt ascunse).
 */
export default function CollaboratorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const previewAs = usePreviewAs();
  const [user, setUser] = useState<CollabUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Așteaptă citirea query-ului (usePreviewAs rulează într-un effect).
    if (typeof window !== 'undefined' && !previewAs && window.location.search.includes('as=')) return;

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

        const isPreview = !!previewAs && ADMIN_ROLES.includes(profile?.role ?? '');

        if (!profile || (profile.role !== 'collaborator' && !isPreview)) {
          // Admins who land here (stale link) belong in /admin, not on the homepage.
          router.replace(ADMIN_ROLES.includes(profile?.role ?? '') ? '/admin' : '/');
          return;
        }

        if (isPreview) {
          // Numele colaboratorului previzualizat (endpoint de admin).
          let name = 'Colaborator';
          try {
            const res = await fetch('/api/admin/collaborators');
            const json = await res.json();
            if (json.success) {
              const target = (json.data as { id: string; name: string }[]).find((c) => c.id === previewAs);
              if (target?.name) name = target.name;
            }
          } catch { /* banner-ul merge și fără nume */ }
          setPreview(true);
          setUser({ email: '', name });
        } else {
          setUser({
            email: profile.email || authUser.email || '',
            name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email || '',
          });
        }
      } catch {
        router.replace('/auth/login?redirect=/colaborator');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router, previewAs]);

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
          <Link href={withPreview("/colaborator/orders", previewAs)} className="flex items-center gap-2">
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
            href={withPreview("/colaborator/orders", previewAs)}
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
            href={withPreview("/colaborator/decont", previewAs)}
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
            href={withPreview("/colaborator/servicii", previewAs)}
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
            href={withPreview("/colaborator/tarife", previewAs)}
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
              <p className="text-xs text-slate-400">{preview ? 'Previzualizare' : 'Colaborator'}</p>
            </div>
          </div>
          {preview ? (
            <Link
              href="/admin/colaboratori"
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              Înapoi în admin
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              Deconectare
            </button>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {preview && (
          <div className="flex flex-wrap items-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-900">
            <Eye className="h-4 w-4 shrink-0" />
            <span>
              Previzualizare: vezi portalul lui <strong>{user.name}</strong> exact cum îl vede el.
              Doar citire — nu poți încărca documente sau trimite comanda în locul lui.
            </span>
            <Link href="/admin/colaboratori" className="ml-auto font-medium underline underline-offset-2">
              Ieși din previzualizare
            </Link>
          </div>
        )}
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
