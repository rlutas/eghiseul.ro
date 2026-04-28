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
} from 'lucide-react';
import TrackingTimeline from '@/components/orders/tracking-timeline';

// Order status mapping - complete workflow
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  // Order lifecycle
  order_created: { label: 'Comandă plasată', color: 'bg-blue-100 text-blue-800', icon: FileText },
  draft: { label: 'Ciornă', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending: { label: 'În așteptarea plății', color: 'bg-yellow-100 text-yellow-800', icon: CreditCard },
  pending_payment: { label: 'În așteptarea plății', color: 'bg-yellow-100 text-yellow-800', icon: CreditCard },

  // Payment statuses
  payment_confirmed: { label: 'Plată confirmată', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  payment_received: { label: 'Plată primită', color: 'bg-green-100 text-green-800', icon: CheckCircle },

  // Processing workflow
  processing: { label: 'În procesare', color: 'bg-blue-100 text-blue-800', icon: Package },
  pending_documents: { label: 'Așteptăm documente', color: 'bg-orange-100 text-orange-800', icon: FileText },
  documents_prepared: { label: 'Documente pregătite', color: 'bg-indigo-100 text-indigo-800', icon: FileText },
  submitted_to_authority: { label: 'Depus la autorități', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  at_authority: { label: 'La autorități', color: 'bg-purple-100 text-purple-800', icon: Clock },
  released: { label: 'Eliberat de autorități', color: 'bg-teal-100 text-teal-800', icon: CheckCircle },
  at_translation: { label: 'La traducere', color: 'bg-cyan-100 text-cyan-800', icon: FileText },
  translation_complete: { label: 'Traducere finalizată', color: 'bg-cyan-100 text-cyan-800', icon: CheckCircle },
  ready_for_delivery: { label: 'Pregătit pentru livrare', color: 'bg-emerald-100 text-emerald-800', icon: Package },
  shipped: { label: 'Expediat', color: 'bg-blue-100 text-blue-800', icon: Truck },
  delivered: { label: 'Livrat', color: 'bg-green-100 text-green-800', icon: CheckCircle },

  // Final statuses
  completed: { label: 'Finalizat', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Anulat', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  refunded: { label: 'Rambursat', color: 'bg-gray-100 text-gray-800', icon: CreditCard },

  // Document events
  document_generated: { label: 'Documente generate', color: 'bg-blue-100 text-blue-800', icon: FileText },

  // Legacy/fallback
  submitted: { label: 'Trimis la autorități', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  status_changed: { label: 'Status actualizat', color: 'bg-gray-100 text-gray-800', icon: Clock },
};

interface OrderDocument {
  id: string;
  type: string;
  label: string;
  fileName: string;
  fileSize: number | null;
  documentNumber: string | null;
  createdAt: string;
}

interface SelectedOption {
  optionName?: string;
  option_name?: string;
  priceModifier?: number;
  quantity?: number;
}

interface OrderData {
  id: string;
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
    estimated_days?: number | null;
    urgent_days?: number | null;
  };
  selectedOptions?: SelectedOption[];
  processingDays?: number | null;
  hasUrgent?: boolean;
  estimatedCompletionDate?: string | null;
  delivery: {
    method: string | null;
    methodName: string | null;
    estimatedDays: number | null;
    trackingNumber: string | null;
  };
  pricing: {
    basePrice: number;
    optionsPrice: number;
    deliveryPrice: number;
    subtotalWithoutVat?: number;
    vatAmount?: number;
    vatRate?: number;
    totalPrice: number;
  };
  timeline: Array<{
    status: string;
    event: string;
    note: string | null;
    createdAt: string;
  }>;
  documents?: OrderDocument[];
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
                  placeholder="E-260112-XXXXX"
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
                <div className="flex flex-col items-end gap-2">
                  {/* Payment Status Badge */}
                  {orderData.paymentStatus === 'paid' ? (
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Plată confirmată
                    </div>
                  ) : orderData.paymentStatus === 'awaiting_verification' ? (
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Verificare plată
                    </div>
                  ) : orderData.paymentStatus !== 'paid' && (
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Neplătit
                    </div>
                  )}
                  {/* Order Status Badge */}
                  <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusConfig(orderData.status).color}`}>
                    {getStatusConfig(orderData.status).label}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{orderData.service?.name || 'Serviciu'}</p>
                  {/* Selected options */}
                  {orderData.selectedOptions && orderData.selectedOptions.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {orderData.selectedOptions.map((opt, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          + {opt.optionName || opt.option_name || 'Opțiune'}
                          {(opt.quantity || 1) > 1 && ` x${opt.quantity}`}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Comandat pe {formatDate(orderData.createdAt)}
                  </p>
                  {/* Processing time */}
                  {orderData.estimatedCompletionDate ? (
                    <p className="text-sm text-muted-foreground">
                      Estimat: {new Intl.DateTimeFormat('ro-RO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date(orderData.estimatedCompletionDate))}
                      {orderData.hasUrgent && (
                        <span className="ml-1 text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          urgent
                        </span>
                      )}
                    </p>
                  ) : orderData.processingDays && (
                    <p className="text-sm text-muted-foreground">
                      Timp estimat procesare: {orderData.processingDays} zile lucrătoare
                      {orderData.hasUrgent && (
                        <span className="ml-1 text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          urgent
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              {orderData.delivery.methodName && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{orderData.delivery.methodName}</p>
                    {!orderData.estimatedCompletionDate && orderData.delivery.estimatedDays && (
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
                  <span>{Number(orderData.pricing.basePrice).toFixed(2)} RON</span>
                </div>
                {orderData.pricing.optionsPrice > 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Opțiuni</span>
                    <span>+{Number(orderData.pricing.optionsPrice).toFixed(2)} RON</span>
                  </div>
                )}
                {orderData.pricing.deliveryPrice > 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Livrare</span>
                    <span>+{Number(orderData.pricing.deliveryPrice).toFixed(2)} RON</span>
                  </div>
                )}
                {/* VAT breakdown */}
                {orderData.pricing.subtotalWithoutVat != null && orderData.pricing.vatAmount != null && (
                  <>
                    <div className="flex justify-between text-sm mb-1 text-muted-foreground border-t pt-2 mt-2">
                      <span>Subtotal fără TVA</span>
                      <span>{Number(orderData.pricing.subtotalWithoutVat).toFixed(2)} RON</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                      <span>TVA 21%</span>
                      <span>{Number(orderData.pricing.vatAmount).toFixed(2)} RON</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{Number(orderData.pricing.totalPrice).toFixed(2)} RON</span>
                </div>
                {/* Show VAT included note if no breakdown */}
                {orderData.pricing.subtotalWithoutVat == null && (
                  <p className="text-xs text-muted-foreground mt-1">(TVA 21% inclus)</p>
                )}
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

          {/* Courier Tracking */}
          {orderData.delivery.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Urmarire Colet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TrackingTimeline
                  orderId={orderData.id}
                  email={email}
                  autoRefresh={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {orderData.documents && orderData.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orderData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.documentNumber && `Nr. ${doc.documentNumber} · `}
                          {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.open(
                            `/api/orders/${orderData.id}/documents/${doc.id}/preview?email=${encodeURIComponent(email)}`,
                            '_blank'
                          );
                        }}
                      >
                        Vizualizează
                      </Button>
                    </div>
                  ))}
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
