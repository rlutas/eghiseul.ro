'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Search,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  CreditCard,
  ArrowLeft,
  FileText,
  Home,
} from 'lucide-react';

// Order status mapping
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Ciornă', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending_payment: { label: 'În așteptarea plății', color: 'bg-yellow-100 text-yellow-800', icon: CreditCard },
  payment_received: { label: 'Plată primită', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  processing: { label: 'În procesare', color: 'bg-blue-100 text-blue-800', icon: Package },
  pending_documents: { label: 'Așteptăm documente', color: 'bg-orange-100 text-orange-800', icon: FileText },
  submitted: { label: 'Trimis la autorități', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  completed: { label: 'Finalizat', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Anulat', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  refunded: { label: 'Rambursat', color: 'bg-gray-100 text-gray-800', icon: CreditCard },
};

interface OrderData {
  orderCode: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  delivery: {
    method: string | null;
    methodName: string | null;
    estimatedDays: number | null;
  };
  pricing: {
    basePrice: number;
    optionsPrice: number;
    deliveryPrice: number;
    totalPrice: number;
  };
  timeline: Array<{
    status: string;
    note: string | null;
    createdAt: string;
  }>;
}

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const [orderCode, setOrderCode] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  // Auto-search if params are provided
  useEffect(() => {
    const order = searchParams.get('order');
    const emailParam = searchParams.get('email');

    if (order && emailParam) {
      setOrderCode(order);
      setEmail(emailParam);
      handleSearch(order, emailParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (code?: string, emailAddr?: string) => {
    const searchCode = code || orderCode;
    const searchEmail = emailAddr || email;

    if (!searchCode.trim()) {
      setError('Te rugăm să introduci codul comenzii');
      return;
    }

    if (!searchEmail.trim()) {
      setError('Te rugăm să introduci adresa de email');
      return;
    }

    setIsLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await fetch(
        `/api/orders/status?order_code=${encodeURIComponent(searchCode.trim())}&email=${encodeURIComponent(searchEmail.trim())}`
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Nu am găsit comanda');
        return;
      }

      setOrderData(result.data);
    } catch (err) {
      console.error('Search error:', err);
      setError('A apărut o eroare. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Înapoi la pagina principală
        </Link>
        <h1 className="text-2xl font-bold text-secondary-900">
          Verifică Statusul Comenzii
        </h1>
        <p className="text-muted-foreground mt-1">
          Introdu codul comenzii și emailul pentru a vedea statusul
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderCode">Codul comenzii</Label>
                <Input
                  id="orderCode"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                  placeholder="ORD-20260107-XXXXX"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplu.ro"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Se caută...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Caută Comanda
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Order Details */}
      {orderData && (
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>Comanda</CardDescription>
                  <CardTitle className="text-xl font-mono">
                    {orderData.orderCode}
                  </CardTitle>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusConfig(orderData.status).color}`}>
                  {getStatusConfig(orderData.status).label}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{orderData.service?.name || 'Serviciu'}</p>
                  <p className="text-sm text-muted-foreground">
                    Comandat pe {formatDate(orderData.createdAt)}
                  </p>
                </div>
              </div>

              {/* Delivery Info */}
              {orderData.delivery.methodName && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{orderData.delivery.methodName}</p>
                    {orderData.delivery.estimatedDays && (
                      <p className="text-sm text-muted-foreground">
                        Timp estimat: {orderData.delivery.estimatedDays} zile lucrătoare
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Serviciu</span>
                  <span>{orderData.pricing.basePrice} RON</span>
                </div>
                {orderData.pricing.optionsPrice > 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Opțiuni</span>
                    <span>+{orderData.pricing.optionsPrice} RON</span>
                  </div>
                )}
                {orderData.pricing.deliveryPrice > 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Livrare</span>
                    <span>+{orderData.pricing.deliveryPrice} RON</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{orderData.pricing.totalPrice} RON</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {orderData.timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Istoricul comenzii
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.timeline.map((event, index) => {
                    const config = getStatusConfig(event.status);
                    const Icon = config.icon;
                    return (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`p-1.5 rounded-full ${config.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {index < orderData.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-border flex-1 mt-1" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="font-medium">{config.label}</p>
                          {event.note && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {event.note}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(event.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-800">
                <strong>Ai nevoie de ajutor?</strong> Contactează-ne la{' '}
                <a
                  href="mailto:suport@eghiseul.ro"
                  className="underline hover:no-underline"
                >
                  suport@eghiseul.ro
                </a>{' '}
                sau la telefon{' '}
                <a href="tel:+40311234567" className="underline hover:no-underline">
                  031 123 4567
                </a>{' '}
                menționând codul comenzii tale.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No order searched yet */}
      {!orderData && !isLoading && !error && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Introdu codul comenzii și emailul pentru a vedea statusul
          </p>
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense
export default function OrderStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-2xl flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <OrderStatusContent />
    </Suspense>
  );
}
