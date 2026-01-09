'use client';

/**
 * OrdersTab Component
 *
 * Displays user's order history.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  friendlyOrderId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  serviceName?: string;
}

interface OrdersTabProps {
  initialOrders?: Order[];
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'În așteptare', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  pending_payment: { label: 'Așteaptă plata', color: 'text-orange-600 bg-orange-100', icon: Clock },
  processing: { label: 'În procesare', color: 'text-blue-600 bg-blue-100', icon: RefreshCw },
  completed: { label: 'Finalizată', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  cancelled: { label: 'Anulată', color: 'text-red-600 bg-red-100', icon: XCircle },
  draft: { label: 'Ciornă', color: 'text-neutral-600 bg-neutral-100', icon: FileText },
};

export default function OrdersTab({ initialOrders, className }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [isLoading, setIsLoading] = useState(!initialOrders);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders if not provided
  useEffect(() => {
    if (!initialOrders) {
      fetchOrders();
    }
  }, [initialOrders]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/orders');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch orders');
      }

      // Transform data - API returns { data: { orders: [...] } }
      const ordersData = result.data?.orders || result.data || [];
      const transformedOrders = ordersData.map((order: {
        id: string;
        friendly_order_id?: string;
        orderNumber?: string;
        status: string;
        total_price?: number;
        totalAmount?: number;
        created_at?: string;
        createdAt?: string;
        service?: { name?: string };
        services?: { name?: string };
      }) => ({
        id: order.id,
        friendlyOrderId: order.friendly_order_id || order.orderNumber || `#${order.id.slice(0, 8)}`,
        status: order.status,
        totalPrice: order.total_price || order.totalAmount || 0,
        createdAt: order.created_at || order.createdAt || new Date().toISOString(),
        serviceName: order.service?.name || order.services?.name,
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Comenzile Mele</h3>
          <p className="text-sm text-neutral-500">
            Istoricul comenzilor și statusul lor
          </p>
        </div>
        <Button
          asChild
          className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
        >
          <Link href="/servicii">
            <Plus className="w-4 h-4 mr-2" />
            Comandă nouă
          </Link>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      statusConfig.color.split(' ')[1]
                    )}>
                      <StatusIcon className={cn('w-5 h-5', statusConfig.color.split(' ')[0])} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-semibold text-secondary-900">
                          {order.friendlyOrderId}
                        </p>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          statusConfig.color
                        )}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        {order.serviceName && `${order.serviceName} • `}
                        {new Date(order.createdAt).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-secondary-900">
                      {order.totalPrice.toFixed(2)} RON
                    </p>
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-neutral-400" />
          </div>
          <h4 className="font-semibold text-secondary-900 mb-2">
            Nu ai comenzi încă
          </h4>
          <p className="text-neutral-500 mb-4">
            Plasează prima comandă pentru a obține documentele de care ai nevoie
          </p>
          <Button
            asChild
            className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
          >
            <Link href="/servicii">
              <Plus className="w-4 h-4 mr-2" />
              Explorează serviciile
            </Link>
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Despre comenzi</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Comenzile în așteptare sunt procesate în ordinea primirii</li>
              <li>Vei primi notificări pe email la fiecare schimbare de status</li>
              <li>Documentele finalizate sunt disponibile pentru descărcare</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
