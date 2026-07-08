'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  X as XIcon,
  Receipt,
  AlertTriangle,
  Ticket,
  StickyNote,
  Eye,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { STATUS_TABS, type OrdersCounts } from '@/lib/admin/orders-tabs';

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
  draft: { label: 'Ciornă', variant: 'secondary' },
  pending: { label: 'În așteptare', variant: 'outline' },
  abandoned: { label: 'Abandonată', variant: 'secondary', className: 'bg-neutral-200 text-neutral-700' },
  paid: { label: 'Plătită', variant: 'default', className: 'bg-green-600 text-white' },
  processing: { label: 'În procesare', variant: 'default', className: 'bg-blue-600 text-white' },
  documents_generated: { label: 'Documente generate', variant: 'default', className: 'bg-cyan-600 text-white' },
  submitted_to_institution: { label: 'Depus la instituție', variant: 'default', className: 'bg-indigo-500 text-white' },
  document_received: { label: 'Document primit', variant: 'default', className: 'bg-teal-600 text-white' },
  extras_in_progress: { label: 'Extras în lucru', variant: 'default', className: 'bg-orange-500 text-white' },
  la_tradus: { label: 'La traducere', variant: 'default', className: 'bg-sky-500 text-white' },
  la_legalizat: { label: 'La legalizare', variant: 'default', className: 'bg-fuchsia-500 text-white' },
  la_apostila_notari: { label: 'Apostilă Notari', variant: 'default', className: 'bg-pink-500 text-white' },
  eliberat_apostila_haga: { label: 'Apostilă Haga', variant: 'default', className: 'bg-purple-500 text-white' },
  delivered: { label: 'Livrată', variant: 'default', className: 'bg-green-600 text-white' },
  standby: { label: 'Așteptare client', variant: 'outline', className: 'border-amber-400 text-amber-800' },
  cancellation_requested: { label: 'Anulare solicitată', variant: 'destructive' },
  kyc_pending: { label: 'KYC Pending', variant: 'outline' },
  kyc_approved: { label: 'KYC Aprobat', variant: 'default', className: 'bg-green-600 text-white' },
  kyc_rejected: { label: 'KYC Respins', variant: 'destructive' },
  document_ready: { label: 'Document gata', variant: 'default', className: 'bg-indigo-600 text-white' },
  shipped: { label: 'Expediată', variant: 'default', className: 'bg-purple-600 text-white' },
  in_progress: { label: 'În lucru', variant: 'default', className: 'bg-blue-600 text-white' },
  completed: { label: 'Finalizată', variant: 'default', className: 'bg-green-700 text-white' },
  cancelled: { label: 'Anulată', variant: 'destructive' },
  refunded: { label: 'Rambursată', variant: 'destructive' },
};

interface OrderRow {
  id: string;
  friendly_order_id: string | null;
  order_number: string;
  status: string | null;
  total_price: number;
  payment_status: string | null;
  payment_method: string | null;
  is_test: boolean | null;
  courier_provider: string | null;
  courier_service: string | null;
  delivery_tracking_number: string | null;
  delivery_method: string | null;
  customer_data: {
    contact?: {
      email?: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
    };
    personalData?: {
      firstName?: string;
      lastName?: string;
      // KYC-related fields used for the 📎 column
      idDocumentType?: 'ci_vechi' | 'ci_nou' | 'passport' | null;
      uploadedDocuments?: Array<{ type?: string }>;
      adminVerifiedAt?: string;
    };
    personal?: {
      firstName?: string;
      lastName?: string;
      idDocumentType?: 'ci_vechi' | 'ci_nou' | 'passport' | null;
      uploadedDocuments?: Array<{ type?: string }>;
      adminVerifiedAt?: string;
    };
    companyData?: { companyName?: string };
    company?: { companyName?: string };
    billing?: { type?: string; companyName?: string };
  } | null;
  created_at: string | null;
  estimated_completion_date: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
  coupon_code: string | null;
  admin_notes: string | null;
  note_count?: number;
  services: { name: string; slug: string } | null;
}

interface ServiceOption {
  id: string;
  slug: string;
  name: string;
}

const PAGE_SIZE = 25;

export default function AdminOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlStatus = searchParams.get('status') || 'all';
  const urlTest = (searchParams.get('test') as 'hide' | 'only' | 'all' | null) || 'hide';
  const urlService = searchParams.get('service') || 'all';
  const urlSearch = searchParams.get('search') || '';
  const urlQuick = searchParams.get('quick') || '';
  const urlPage = Math.max(0, parseInt(searchParams.get('page') || '0', 10));

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState<OrdersCounts | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  // Local-only search input — debounced into the URL on Enter or blur.
  const [searchInput, setSearchInput] = useState(urlSearch);
  // Order previewed in the quick-view "Detalii" dialog (parity with sister).
  const [detailOrder, setDetailOrder] = useState<OrderRow | null>(null);

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '' || v === 'all' || (k === 'test' && v === 'hide')) {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
      // Any filter change resets pagination.
      if (Object.keys(patch).some((k) => k !== 'page')) params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const hasActiveFilters =
    urlStatus !== 'all' ||
    urlService !== 'all' ||
    urlSearch !== '' ||
    urlQuick !== '' ||
    urlTest !== 'hide';

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (urlStatus !== 'all') params.set('status', urlStatus);
    if (urlService !== 'all') params.set('service', urlService);
    if (urlSearch) params.set('search', urlSearch);
    if (urlQuick) params.set('quick', urlQuick);
    if (urlTest !== 'hide') params.set('test', urlTest);
    params.set('page', String(urlPage));
    params.set('limit', String(PAGE_SIZE));
    return params.toString();
  }, [urlStatus, urlService, urlSearch, urlQuick, urlTest, urlPage]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/list?${buildQuery()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        console.error('Error fetching orders:', json.error);
        return;
      }
      const typedOrders = (json.data || []).map((row: Record<string, unknown>) => ({
        ...row,
        services: Array.isArray(row.services)
          ? (row.services[0] as { name: string; slug: string } | null) || null
          : (row.services as { name: string; slug: string } | null),
      })) as OrderRow[];
      setOrders(typedOrders);
      setTotalCount(json.total || 0);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Counts depend on test/service/search — but NOT on status (because the
  // count is per-tab, so the active tab shouldn't constrain it).
  useEffect(() => {
    const p = new URLSearchParams();
    if (urlTest !== 'hide') p.set('test', urlTest);
    if (urlService !== 'all') p.set('service', urlService);
    if (urlSearch) p.set('search', urlSearch);
    const qs = p.toString();
    fetch(qs ? `/api/admin/orders/counts?${qs}` : '/api/admin/orders/counts')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCounts(d.data as OrdersCounts);
      })
      .catch(() => {});
  }, [urlTest, urlService, urlSearch]);

  // Load service options once for the dropdown.
  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((d) => {
        // /api/services wraps the list: { success, data: { services: [...] } }.
        // Reading d.data directly returned an object → .map produced an empty
        // dropdown (team report 2026-07-08).
        const list = (d.data?.services || []) as Array<{ id: string; slug: string; name: string }>;
        setServices(list.map((s) => ({ id: s.id, slug: s.slug, name: s.name })));
      })
      .catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const resetFilters = () => {
    setSearchInput('');
    router.replace(pathname, { scroll: false });
  };

  const activeTabLabel = useMemo(() => {
    const tab = STATUS_TABS.find((t) => t.value === urlStatus);
    return tab?.label || (urlStatus !== 'all' ? urlStatus : 'Toate');
  }, [urlStatus]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comenzi</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {totalCount === 0 ? 'Niciun rezultat' : `${totalCount} ${totalCount === 1 ? 'rezultat' : 'rezultate'}`}
            {hasActiveFilters && <span className="ml-1">pentru „{activeTabLabel}”{urlSearch ? ` · „${urlSearch}”` : ''}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reuses current filter state from URL — same logic as fetchOrders.
              const params = new URLSearchParams();
              if (urlStatus !== 'all') params.set('status', urlStatus);
              if (urlService !== 'all') params.set('service', urlService);
              if (urlSearch) params.set('search', urlSearch);
              if (urlTest !== 'hide') params.set('test', urlTest);
              const qs = params.toString();
              const url = qs ? `/api/admin/orders/export?${qs}` : '/api/admin/orders/export';
              // Hard navigation → triggers download via Content-Disposition.
              window.location.href = url;
            }}
            disabled={loading || totalCount === 0}
            title="Descarcă comenzile filtrate ca TSV (Google Sheets / Excel)"
          >
            <Receipt className="mr-1 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Reîncarcă
          </Button>
        </div>
      </div>

      {/* Tabs + Service dropdown + Search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={urlStatus}
          onValueChange={(v) => {
            if (typeof v === 'string') updateParams({ status: v });
          }}
        >
          <TabsList>
            {STATUS_TABS.map((tab) => {
              const count = counts ? counts[tab.countKey] : null;
              return (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                  {count !== null && count !== undefined && (
                    <span className="ml-1.5 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 tabular-nums">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="flex flex-1 gap-2 lg:justify-end">
          <select
            aria-label="Filtrare după serviciu"
            value={urlService}
            onChange={(e) => updateParams({ service: e.target.value })}
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
          >
            <option value="all">Toate serviciile</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="relative w-full max-w-xs lg:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Caută nr. comandă, email, AWB…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateParams({ search: searchInput });
              }}
              onBlur={() => {
                if (searchInput !== urlSearch) updateParams({ search: searchInput });
              }}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Filtre rapide + Stadiu chips (parity cazierjudiciaronline.com) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Filtre rapide:</span>
        <SandboxChip active={urlQuick === ''} label="Fără" onClick={() => updateParams({ quick: null })} />
        <SandboxChip
          active={urlQuick === 'overdue'}
          label="Expirate"
          count={counts?.overdue}
          tone="danger"
          onClick={() => updateParams({ quick: urlQuick === 'overdue' ? null : 'overdue' })}
        />
        <SandboxChip
          active={urlQuick === 'deadline_soon'}
          label="Deadline < 48h"
          count={counts?.deadline_soon}
          tone="warn"
          onClick={() => updateParams({ quick: urlQuick === 'deadline_soon' ? null : 'deadline_soon' })}
        />
        <SandboxChip
          active={urlQuick === 'with_coupon'}
          label="Cu cupon"
          count={counts?.with_coupon}
          onClick={() => updateParams({ quick: urlQuick === 'with_coupon' ? null : 'with_coupon' })}
        />

        <span className="ml-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Stadiu:</span>
        <SandboxChip
          active={urlQuick === 'documents_generated'}
          label="Documente generate"
          count={counts?.stage_documents_generated}
          onClick={() => updateParams({ quick: urlQuick === 'documents_generated' ? null : 'documents_generated' })}
        />
        <SandboxChip
          active={urlQuick === 'submitted'}
          label="Depus la instituție"
          count={counts?.stage_submitted}
          onClick={() => updateParams({ quick: urlQuick === 'submitted' ? null : 'submitted' })}
        />
        <SandboxChip
          active={urlQuick === 'received'}
          label="Document primit"
          count={counts?.stage_received}
          onClick={() => updateParams({ quick: urlQuick === 'received' ? null : 'received' })}
        />
        <SandboxChip
          active={urlQuick === 'la_tradus'}
          label="La traducere"
          count={counts?.stage_la_tradus}
          onClick={() => updateParams({ quick: urlQuick === 'la_tradus' ? null : 'la_tradus' })}
        />
        <SandboxChip
          active={urlQuick === 'la_legalizat'}
          label="La legalizare"
          count={counts?.stage_la_legalizat}
          onClick={() => updateParams({ quick: urlQuick === 'la_legalizat' ? null : 'la_legalizat' })}
        />
        <SandboxChip
          active={urlQuick === 'la_apostila_notari'}
          label="Apostilă Notari"
          count={counts?.stage_la_apostila_notari}
          onClick={() => updateParams({ quick: urlQuick === 'la_apostila_notari' ? null : 'la_apostila_notari' })}
        />
        <SandboxChip
          active={urlQuick === 'apostila_haga'}
          label="Apostilă Haga"
          count={counts?.stage_apostila_haga}
          onClick={() => updateParams({ quick: urlQuick === 'apostila_haga' ? null : 'apostila_haga' })}
        />
        <SandboxChip
          active={urlQuick === 'ready'}
          label="Gata de livrare"
          count={counts?.stage_ready}
          onClick={() => updateParams({ quick: urlQuick === 'ready' ? null : 'ready' })}
        />
      </div>

      {/* Quick chips row: Sandbox + Reset */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Test:</span>
        <SandboxChip active={urlTest === 'hide'} label="Ascunse" onClick={() => updateParams({ test: 'hide' })} />
        <SandboxChip
          active={urlTest === 'only'}
          label="Doar test"
          count={counts?.test_only}
          tone="warn"
          onClick={() => updateParams({ test: urlTest === 'only' ? 'hide' : 'only' })}
        />
        <SandboxChip
          active={urlTest === 'all'}
          label="Toate"
          onClick={() => updateParams({ test: urlTest === 'all' ? 'hide' : 'all' })}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <XIcon className="h-3 w-3" />
            Reset filtre
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nr. Comandă</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="w-8 px-1" title="Note echipă" />
              <TableHead>Serviciu</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plată</TableHead>
              <TableHead className="text-center" title="Documente KYC încărcate / așteptate">📎</TableHead>
              <TableHead>Curier</TableHead>
              <TableHead>AWB</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Termen</TableHead>
              <TableHead>Dată</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 13 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="py-8 text-center text-muted-foreground">
                  {hasActiveFilters ? 'Niciun rezultat pentru filtrele active.' : 'Nicio comandă în această categorie.'}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <TableCell className="font-mono text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                      {order.friendly_order_id || order.order_number}
                      {order.is_test && (
                        <span className="inline-flex items-center rounded border border-amber-300 bg-amber-50 px-1 py-0 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                          Test
                        </span>
                      )}
                      {order.payment_status === 'paid' && !order.invoice_number && (
                        <span
                          title="Comandă plătită fără factură emisă"
                          className="inline-flex items-center gap-0.5 rounded border border-red-300 bg-red-50 px-1 py-0 text-[9px] font-semibold uppercase tracking-wide text-red-700"
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Fără factură
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{getCustomerName(order)}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.customer_data?.contact?.email || '-'}
                      </span>
                    </div>
                  </TableCell>
                  {/* Note echipă — sister-style icon + count, jumps to the notes card */}
                  <TableCell className="w-8 px-1">
                    {(order.note_count ?? 0) > 0 ? (
                      <button
                        type="button"
                        title={`${order.note_count} note echipă — deschide`}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/orders/${order.id}#notes-echipa`);
                        }}
                        className="relative inline-flex items-center justify-center rounded p-1 text-amber-500 hover:bg-amber-50"
                      >
                        <StickyNote className="h-4 w-4" />
                        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[9px] font-bold text-white">
                          {order.note_count}
                        </span>
                      </button>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-sm">
                    {order.services?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status || 'draft'} />
                  </TableCell>
                  <TableCell>
                    <PaymentBadge status={order.payment_status} method={order.payment_method} />
                  </TableCell>
                  <TableCell className="text-center">
                    <DocsBadge customerData={order.customer_data} />
                  </TableCell>
                  <TableCell>
                    <CourierBadge provider={order.courier_provider} />
                  </TableCell>
                  <TableCell>
                    {order.delivery_tracking_number ? (
                      <span className="rounded bg-green-50 px-1.5 py-0.5 font-mono text-xs text-green-700">
                        {order.delivery_tracking_number}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <div className="flex items-center justify-end gap-1">
                      {order.coupon_code && (
                        <Ticket className="h-3.5 w-3.5 text-emerald-600" aria-label={`Cupon ${order.coupon_code}`} />
                      )}
                      {order.total_price.toFixed(2)} RON
                    </div>
                  </TableCell>
                  <TableCell>
                    <DeadlineCell iso={order.estimated_completion_date} status={order.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString('ro-RO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          timeZone: 'Europe/Bucharest',
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailOrder(order);
                      }}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Detalii
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {urlPage + 1} din {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: String(Math.max(0, urlPage - 1)) })}
              disabled={urlPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Înapoi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: String(Math.min(totalPages - 1, urlPage + 1)) })}
              disabled={urlPage >= totalPages - 1}
            >
              Înainte
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick-view "Detalii" dialog — parity with cazierjudiciaronline.com */}
      <Dialog open={!!detailOrder} onOpenChange={(o) => !o && setDetailOrder(null)}>
        <DialogContent className="max-w-lg">
          {detailOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-mono text-base">
                  {detailOrder.friendly_order_id || detailOrder.order_number}
                  {detailOrder.is_test && (
                    <span className="rounded border border-amber-300 bg-amber-50 px-1 text-[9px] font-semibold uppercase text-amber-700">
                      Test
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-1.5 text-sm">
                <DetailRow label="Client" value={getCustomerName(detailOrder)} />
                <DetailRow label="Email" value={detailOrder.customer_data?.contact?.email || '—'} />
                <DetailRow label="Telefon" value={detailOrder.customer_data?.contact?.phone || '—'} />
                <DetailRow label="Serviciu" value={detailOrder.services?.name || '—'} />
                <DetailRow label="Status" value={<StatusBadge status={detailOrder.status || 'draft'} />} />
                <DetailRow
                  label="Plată"
                  value={<PaymentBadge status={detailOrder.payment_status} method={detailOrder.payment_method} />}
                />
                <DetailRow label="Sumă" value={`${detailOrder.total_price.toFixed(2)} RON`} />
                <DetailRow
                  label="Termen"
                  value={<DeadlineCell iso={detailOrder.estimated_completion_date} status={detailOrder.status} />}
                />
                <DetailRow
                  label="Factură"
                  value={
                    detailOrder.invoice_number ? (
                      detailOrder.invoice_url ? (
                        <a
                          href={detailOrder.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {detailOrder.invoice_number}
                        </a>
                      ) : (
                        detailOrder.invoice_number
                      )
                    ) : (
                      <span className="text-red-600">Fără factură</span>
                    )
                  }
                />
                <DetailRow label="Cupon" value={detailOrder.coupon_code || '—'} />
                {detailOrder.admin_notes?.trim() && (
                  <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 p-2">
                    <p className="flex items-center gap-1 text-xs font-semibold text-amber-800">
                      <StickyNote className="h-3 w-3" />
                      Note echipă
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-xs text-amber-900">{detailOrder.admin_notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setDetailOrder(null)}>
                  Închide
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const id = detailOrder.id;
                    setDetailOrder(null);
                    router.push(`/admin/orders/${id}#notes-echipa`);
                  }}
                >
                  Deschide comanda
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-1 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-right text-sm text-slate-800">{value}</span>
    </div>
  );
}

// Helper components

function DeadlineCell({ iso, status }: { iso: string | null; status: string | null }) {
  if (!iso) return <span className="text-xs text-muted-foreground">—</span>;
  const d = new Date(iso);
  const now = new Date();
  const inactive = [
    'completed', 'refunded', 'cancelled', 'abandoned', 'cancellation_requested', 'standby', 'draft', 'pending',
  ].includes(status || '');
  const ms = d.getTime() - now.getTime();
  const days = Math.round(ms / 86_400_000);
  const dateStr = d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Bucharest' });
  let cls = 'text-slate-600';
  let hint = '';
  if (!inactive) {
    if (ms < 0) {
      cls = 'text-red-600 font-semibold';
      hint = `expirat de ${Math.abs(days)}z`;
    } else if (ms < 48 * 3_600_000) {
      cls = 'text-amber-600 font-semibold';
      hint = days <= 0 ? 'azi' : `în ${days}z`;
    } else {
      hint = `în ${days}z`;
    }
  }
  return (
    <div className={`text-xs ${cls}`}>
      {dateStr}
      {hint && <span className="ml-1 opacity-70">· {hint}</span>}
    </div>
  );
}

function SandboxChip({
  active,
  label,
  count,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  tone?: 'warn' | 'danger';
  onClick: () => void;
}) {
  const base =
    'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors';
  const activeCls = tone === 'danger'
    ? 'border-red-300 bg-red-50 text-red-900'
    : tone === 'warn'
    ? 'border-amber-300 bg-amber-50 text-amber-900'
    : 'border-slate-400 bg-slate-100 text-slate-900';
  const idleCls = 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50';
  return (
    <button type="button" onClick={onClick} className={`${base} ${active ? activeCls : idleCls}`}>
      {label}
      {count !== undefined && count !== null && (
        <span className="rounded bg-slate-200 px-1 py-0 text-[10px] font-semibold tabular-nums text-slate-700">
          {count}
        </span>
      )}
    </button>
  );
}

function getCustomerName(order: OrderRow): string {
  const cd = order.customer_data;
  const contact = cd?.contact;
  const personal = cd?.personalData || cd?.personal;
  const company = cd?.companyData || cd?.company;
  const billing = cd?.billing;
  const isPJ = billing?.type === 'persoana_juridica' || !!company?.companyName;

  if (isPJ) return company?.companyName || billing?.companyName || 'N/A';
  if (contact?.name) return contact.name;
  // Billing name as a final fallback — services without a personal-KYC step
  // (e.g. identificare imobil) only collect the name at billing.
  const b = billing as { firstName?: string; lastName?: string; name?: string } | undefined;
  const firstName = contact?.firstName || personal?.firstName || b?.firstName || '';
  const lastName = contact?.lastName || personal?.lastName || b?.lastName || '';
  if (firstName || lastName) return `${firstName} ${lastName}`.trim();
  if (b?.name) return b.name;
  return 'N/A';
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'outline' as const };
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

function PaymentBadge({ status, method }: { status: string | null; method: string | null }) {
  if (!status || status === 'pending') {
    return <span className="text-xs text-muted-foreground">Neplătită</span>;
  }
  if (status === 'paid' || status === 'succeeded') {
    return (
      <Badge variant="default" className="bg-green-600 text-white">
        {method === 'bank_transfer' ? 'Transfer' : 'Card'}
      </Badge>
    );
  }
  if (status === 'failed') {
    return <Badge variant="destructive" className="text-white">Eșuată</Badge>;
  }
  return <span className="text-xs text-muted-foreground">{status}</span>;
}

function CourierBadge({ provider }: { provider: string | null }) {
  if (!provider) return <span className="text-xs text-muted-foreground">-</span>;
  if (provider === 'fancourier') {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-xs font-medium text-orange-700">
        <Truck className="h-3 w-3" />
        Fan Courier
      </span>
    );
  }
  if (provider === 'sameday') {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
        <Package className="h-3 w-3" />
        Sameday
      </span>
    );
  }
  return <span className="text-xs">{provider}</span>;
}

/**
 * DocsBadge — KYC document completion indicator for the orders list.
 *
 * Shows N/M (uploaded / expected) based on idDocumentType:
 *   - ci_vechi  → 1 expected (front)
 *   - ci_nou    → 3 expected (front + back + RO CEI Reader PDF)
 *   - passport  → 1 expected (opened spread)
 *   - null/etc. → expected = uploaded count, no fraction shown
 *
 * Plus visual state:
 *   - Green check if adminVerifiedAt set
 *   - Green text if N=M and not verified yet
 *   - Amber if 0<N<M (partial)
 *   - Muted dash if no docs and no idDocumentType (e.g., draft/PJ orders)
 */
function DocsBadge({
  customerData,
}: {
  customerData: OrderRow['customer_data'];
}) {
  const personal = customerData?.personalData || customerData?.personal;
  const idDocumentType = personal?.idDocumentType;
  const uploadedDocs = personal?.uploadedDocuments || [];
  const verified = !!personal?.adminVerifiedAt;

  // Count only ID-document scan types (not selfie or company docs)
  const ID_DOC_TYPES = new Set([
    'ci_front', 'ci_back', 'ci_vechi', 'ci_nou_front', 'ci_nou_back',
    'passport', 'passport_opened', 'ro_cei_reader_pdf',
  ]);
  const uploaded = uploadedDocs.filter((d) => d.type && ID_DOC_TYPES.has(d.type)).length;

  const expected =
    idDocumentType === 'ci_vechi' ? 1 :
    idDocumentType === 'ci_nou' ? 3 :
    idDocumentType === 'passport' ? 1 :
    null;

  if (uploaded === 0 && expected === null) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  // Verified state — green checkmark wins regardless of count
  if (verified) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700"
        title="Documente marcate verificate manual de admin"
      >
        ✓ {expected ? `${uploaded}/${expected}` : uploaded}
      </span>
    );
  }

  const label = expected ? `${uploaded}/${expected}` : `${uploaded}`;
  if (expected !== null && uploaded === expected) {
    return (
      <span
        className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700"
        title="Documente complete, neverificate manual încă"
      >
        {label}
      </span>
    );
  }
  if (expected !== null && uploaded > 0 && uploaded < expected) {
    return (
      <span
        className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700"
        title="Documente parțiale — așteptăm completare"
      >
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
      {label}
    </span>
  );
}
