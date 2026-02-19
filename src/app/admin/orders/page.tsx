'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
} from 'lucide-react';

// Order status configuration
const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  draft: { label: 'Ciorna', variant: 'secondary' },
  pending: { label: 'In asteptare', variant: 'outline' },
  paid: { label: 'Platita', variant: 'default', className: 'bg-green-600' },
  processing: { label: 'In procesare', variant: 'default', className: 'bg-blue-600' },
  kyc_pending: { label: 'KYC Pending', variant: 'outline' },
  kyc_approved: { label: 'KYC Aprobat', variant: 'default', className: 'bg-green-600' },
  kyc_rejected: { label: 'KYC Respins', variant: 'destructive' },
  document_ready: { label: 'Document gata', variant: 'default', className: 'bg-indigo-600' },
  shipped: { label: 'Expediata', variant: 'default', className: 'bg-purple-600' },
  in_progress: { label: 'In lucru', variant: 'default', className: 'bg-blue-600' },
  completed: { label: 'Finalizata', variant: 'default', className: 'bg-green-700' },
  cancelled: { label: 'Anulata', variant: 'destructive' },
  refunded: { label: 'Rambursata', variant: 'destructive' },
};

const ALL_STATUSES = [
  'all',
  'pending',
  'paid',
  'processing',
  'document_ready',
  'shipped',
  'completed',
  'cancelled',
  'draft',
];

interface OrderRow {
  id: string;
  friendly_order_id: string | null;
  order_number: string;
  status: string | null;
  total_price: number;
  payment_status: string | null;
  payment_method: string | null;
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
    };
    personal?: {
      firstName?: string;
      lastName?: string;
    };
    companyData?: {
      companyName?: string;
    };
    company?: {
      companyName?: string;
    };
    billing?: {
      type?: string;
      companyName?: string;
    };
  } | null;
  created_at: string | null;
  services: {
    name: string;
    slug: string;
  } | null;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 25;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));

      const res = await fetch(`/api/admin/orders/list?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        console.error('Error fetching orders:', json.error);
        return;
      }

      // Cast properly - Supabase returns the join as an array or object
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
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle search - filter client-side for simplicity
  const filteredOrders = searchQuery
    ? orders.filter((o) => {
        const q = searchQuery.toLowerCase();
        const orderNum = (o.friendly_order_id || o.order_number || '').toLowerCase();
        const email = (o.customer_data?.contact?.email || '').toLowerCase();
        const name = getCustomerName(o).toLowerCase();
        const awb = (o.delivery_tracking_number || '').toLowerCase();
        return orderNum.includes(q) || email.includes(q) || name.includes(q) || awb.includes(q);
      })
    : orders;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comenzi</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} comenzi in total
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Reincarca
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cauta dupa nr. comanda, email, nume, AWB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(0);
            // Update URL params
            const params = new URLSearchParams(searchParams.toString());
            if (val === 'all') {
              params.delete('status');
            } else {
              params.set('status', val);
            }
            router.replace(`/admin/orders?${params.toString()}`);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtreaza status" />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'all' ? 'Toate statusurile' : STATUS_CONFIG[s]?.label || s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nr. Comanda</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Serviciu</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plata</TableHead>
              <TableHead>Curier</TableHead>
              <TableHead>AWB</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'Nicio comanda gasita pentru cautarea ta.'
                    : 'Nicio comanda in aceasta categorie.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <TableCell className="font-mono text-sm font-medium">
                    {order.friendly_order_id || order.order_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{getCustomerName(order)}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.customer_data?.contact?.email || '-'}
                      </span>
                    </div>
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
                  <TableCell>
                    <CourierBadge provider={order.courier_provider} />
                  </TableCell>
                  <TableCell>
                    {order.delivery_tracking_number ? (
                      <span className="font-mono text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                        {order.delivery_tracking_number}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {order.total_price.toFixed(2)} RON
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString('ro-RO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '-'}
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
            Pagina {page + 1} din {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Inapoi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Inainte
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components

function getCustomerName(order: OrderRow): string {
  const cd = order.customer_data;
  const contact = cd?.contact;
  const personal = cd?.personalData || cd?.personal;
  const company = cd?.companyData || cd?.company;
  const billing = cd?.billing;
  const isPJ = billing?.type === 'persoana_juridica' || !!company?.companyName;

  if (isPJ) return company?.companyName || billing?.companyName || 'N/A';
  if (contact?.name) return contact.name;
  const firstName = contact?.firstName || personal?.firstName || '';
  const lastName = contact?.lastName || personal?.lastName || '';
  if (firstName || lastName) return `${firstName} ${lastName}`.trim();
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
    return <span className="text-xs text-muted-foreground">Neplatita</span>;
  }
  if (status === 'paid' || status === 'succeeded') {
    return (
      <Badge variant="default" className="bg-green-600">
        {method === 'bank_transfer' ? 'Transfer' : 'Card'}
      </Badge>
    );
  }
  if (status === 'failed') {
    return <Badge variant="destructive">Esuata</Badge>;
  }
  return <span className="text-xs text-muted-foreground">{status}</span>;
}

function CourierBadge({ provider }: { provider: string | null }) {
  if (!provider) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  if (provider === 'fancourier') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
        <Truck className="h-3 w-3" />
        Fan Courier
      </span>
    );
  }
  if (provider === 'sameday') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
        <Package className="h-3 w-3" />
        Sameday
      </span>
    );
  }
  return <span className="text-xs">{provider}</span>;
}
