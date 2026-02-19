'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  CreditCard,
  Truck,
  FileText,
  RefreshCw,
  XCircle,
  FileCheck,
  CheckCircle,
  Building,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface DashboardStats {
  ordersToday: number;
  ordersYesterday: number;
  revenueMonth: number;
  revenuePrevMonth: number;
  pendingShipments: number;
  pendingPayments: number;
  totalOrders: number;
  totalCustomers: number;
}

interface ActivityItem {
  id: string;
  orderId: string;
  orderNumber: string;
  event: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface RecentOrder {
  friendly_order_id: string | null;
  order_number: string;
  status: string | null;
  total_price: number;
  created_at: string | null;
  customer_data: {
    contact?: {
      email?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
    };
    personalData?: {
      firstName?: string;
      lastName?: string;
    };
  } | null;
  services: { name: string; slug: string } | null;
}

// ──────────────────────────────────────────────────────────────
// Status badge config (reused from orders page)
// ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  draft: { label: 'Ciorna', variant: 'secondary' },
  pending: { label: 'In asteptare', variant: 'outline' },
  paid: { label: 'Platita', variant: 'default', className: 'bg-green-600' },
  processing: { label: 'In procesare', variant: 'default', className: 'bg-blue-600' },
  document_ready: { label: 'Document gata', variant: 'default', className: 'bg-indigo-600' },
  shipped: { label: 'Expediata', variant: 'default', className: 'bg-purple-600' },
  completed: { label: 'Finalizata', variant: 'default', className: 'bg-green-700' },
  cancelled: { label: 'Anulata', variant: 'destructive' },
};

// ──────────────────────────────────────────────────────────────
// Activity event config
// ──────────────────────────────────────────────────────────────

const EVENT_CONFIG: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  draft_created: { icon: FileText, label: 'Draft creat', color: 'text-gray-400' },
  order_created: { icon: ShoppingCart, label: 'Comanda noua', color: 'text-blue-500' },
  payment_confirmed: { icon: CreditCard, label: 'Plata confirmata', color: 'text-green-500' },
  payment_failed: { icon: XCircle, label: 'Plata esuata', color: 'text-red-500' },
  awb_created: { icon: Truck, label: 'AWB generat', color: 'text-indigo-500' },
  awb_cancelled: { icon: XCircle, label: 'AWB anulat', color: 'text-red-500' },
  status_changed: { icon: RefreshCw, label: 'Status schimbat', color: 'text-amber-500' },
  document_ready: { icon: FileCheck, label: 'Document pregatit', color: 'text-emerald-500' },
  shipped: { icon: Package, label: 'Expediat', color: 'text-blue-500' },
  delivered: { icon: CheckCircle, label: 'Livrat', color: 'text-green-600' },
  bank_transfer_submitted: { icon: Building, label: 'Transfer bancar', color: 'text-amber-500' },
};

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'acum';
  if (seconds < 3600) return `acum ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `acum ${Math.floor(seconds / 3600)} ore`;
  return `acum ${Math.floor(seconds / 86400)} zile`;
}

function formatRON(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCustomerName(order: RecentOrder): string {
  const contact = order.customer_data?.contact;
  const personalData = order.customer_data?.personalData;
  if (contact?.name) return contact.name;
  const firstName = contact?.firstName || personalData?.firstName || '';
  const lastName = contact?.lastName || personalData?.lastName || '';
  if (firstName || lastName) return `${firstName} ${lastName}`.trim();
  return 'N/A';
}

// ──────────────────────────────────────────────────────────────
// Dashboard Page
// ──────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard/activity');
      const json = await res.json();
      if (json.success) {
        setActivity(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders/list?limit=10');
      const json = await res.json();

      if (!res.ok || !json.success) {
        console.error('Failed to fetch recent orders:', json.error);
        return;
      }

      const typedOrders = (json.data || []).map((row: Record<string, unknown>) => ({
        ...row,
        services: Array.isArray(row.services)
          ? (row.services[0] as { name: string; slug: string } | null) || null
          : (row.services as { name: string; slug: string } | null),
      })) as RecentOrder[];

      setRecentOrders(typedOrders);
    } catch (err) {
      console.error('Failed to fetch recent orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    setStatsLoading(true);
    setActivityLoading(true);
    setOrdersLoading(true);
    await Promise.all([fetchStats(), fetchActivity(), fetchRecentOrders()]);
    setRefreshing(false);
  }, [fetchStats, fetchActivity, fetchRecentOrders]);

  useEffect(() => {
    fetchStats();
    fetchActivity();
    fetchRecentOrders();
  }, [fetchStats, fetchActivity, fetchRecentOrders]);

  // ── Computed values ──
  const ordersDiff = stats ? stats.ordersToday - stats.ordersYesterday : 0;
  const revenueChange = stats && stats.revenuePrevMonth > 0
    ? Math.round(((stats.revenueMonth - stats.revenuePrevMonth) / stats.revenuePrevMonth) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bine ai venit in panoul de administrare eGhiseul.ro
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Actualizeaza
        </Button>
      </div>

      {/* Row 1: Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Comenzi azi */}
        <Card className="py-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comenzi azi
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-3xl font-bold">{stats?.ordersToday ?? 0}</p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {ordersDiff > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">+{ordersDiff} fata de ieri</span>
                    </>
                  ) : ordersDiff < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">{ordersDiff} fata de ieri</span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">la fel ca ieri</span>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Venituri luna */}
        <Card className="py-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Venituri luna
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <>
                <p className="text-3xl font-bold">
                  {formatRON(stats?.revenueMonth ?? 0)} <span className="text-lg font-normal text-muted-foreground">RON</span>
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {revenueChange > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">+{revenueChange}% fata de luna trecuta</span>
                    </>
                  ) : revenueChange < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">{revenueChange}% fata de luna trecuta</span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {stats?.revenuePrevMonth === 0 ? 'prima luna' : 'la fel ca luna trecuta'}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 3: De expediat */}
        <Link href="/admin/orders?status=document_ready">
          <Card className="py-4 hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  De expediat
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <>
                  <p className="text-3xl font-bold">{stats?.pendingShipments ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    documente gata, AWB de generat
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Card 4: Plati de verificat */}
        <Link href="/admin/orders?status=pending">
          <Card className="py-4 hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Plati de verificat
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <>
                  <p className="text-3xl font-bold">{stats?.pendingPayments ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    transfer bancar in asteptare
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Row 2: Recent Orders + Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: Recent Orders Table */}
        <Card className="py-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Comenzi recente</CardTitle>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Vezi toate comenzile
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Nr. Comanda</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Serviciu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="pr-6">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j} className={j === 0 ? 'pl-6' : j === 5 ? 'pr-6' : ''}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nicio comanda inca.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => {
                    const statusCfg = STATUS_CONFIG[order.status || 'draft'] || {
                      label: order.status || 'N/A',
                      variant: 'outline' as const,
                    };
                    return (
                      <TableRow key={order.order_number}>
                        <TableCell className="pl-6 font-mono text-sm font-medium">
                          {order.friendly_order_id || order.order_number}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getCustomerName(order)}</span>
                        </TableCell>
                        <TableCell className="max-w-[160px] truncate text-sm">
                          {order.services?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusCfg.variant} className={statusCfg.className}>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">
                          {order.total_price?.toFixed(2)} RON
                        </TableCell>
                        <TableCell className="pr-6 text-sm text-muted-foreground">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString('ro-RO', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right: Activity Feed */}
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activitate recenta</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground">
                Nicio activitate recenta.
              </p>
            ) : (
              <div className="relative space-y-0">
                {/* Timeline line */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

                {activity.map((item, idx) => {
                  const config = EVENT_CONFIG[item.event] || {
                    icon: FileText,
                    label: item.event,
                    color: 'text-gray-400',
                  };
                  const Icon = config.icon;

                  return (
                    <div
                      key={item.id}
                      className={`relative flex items-start gap-3 py-2.5 ${
                        idx === 0 ? 'pt-0' : ''
                      }`}
                    >
                      {/* Icon circle */}
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-border">
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-medium leading-tight">
                          {config.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          <span className="font-mono">{item.orderNumber}</span>
                          {item.details && (item.details as Record<string, string>).new_status && (
                            <span className="ml-1">
                              &rarr; {(item.details as Record<string, string>).new_status}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {timeAgo(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary row */}
      {!statsLoading && stats && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>Total comenzi: <strong className="text-foreground">{stats.totalOrders}</strong></span>
          <span>Total clienti: <strong className="text-foreground">{stats.totalCustomers}</strong></span>
        </div>
      )}
    </div>
  );
}
