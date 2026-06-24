'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  Download,
  Mail,
  FileText,
  ArrowRight,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderSummaryCard } from '@/components/payment';
import { estimateFromSelectedOptions } from '@/lib/delivery-calculator';

interface SelectedOption {
  optionName?: string;
  option_name?: string;
  optionDescription?: string;
  priceModifier?: number;
  quantity?: number;
  /** Stable code (urgenta, apostila_haga, etc.) — feeds the delivery
   *  calculator + lets the summary group bundled rows. */
  code?: string;
  optionId?: string;
  option_id?: string;
  bundledFor?: { parentOptionId?: string } | null;
  bundled_for?: { parent_option_id?: string } | null;
}

/** Shape matching the API's normalized `options` array — same as the wizard
 *  sidebar + checkout page use to render the unified summary. */
interface NormalizedOption {
  optionId?: string;
  name: string;
  total: number;
  quantity: number;
  bundledForParentId?: string;
}

interface OrderData {
  id: string;
  order_number: string;
  friendly_order_id: string;
  service_name: string;
  service_id?: string;
  service_category?: string;
  total_price: number;
  payment_status: string;
  payment_method?: string;
  status: string;
  invoice_number?: string;
  invoice_url?: string;
  processing_days?: number | null;
  selected_options?: SelectedOption[];
  /** Normalized options (with optionId + bundledForParentId) — feeds the
   *  shared OrderSummaryCard so the success page matches wizard + checkout
   *  visually (nested secondary services, stripped marketing suffixes). */
  options_normalized?: NormalizedOption[];
  /** Service's base processing days from the catalog — feeds the delivery
   *  calculator on top of selected add-ons. */
  service_estimated_days?: number;
  client_type?: string | null;
  delivery_method?: string;
  delivery_price?: number;
  coupon_code?: string | null;
  discount_amount?: number;
  breakdown?: {
    basePrice: number;
    optionsPrice: number;
    deliveryPrice: number;
    subtotalWithoutVat: number;
    vatAmount: number;
    vatRate: number;
    total: number;
  };
  customer_data?: {
    contact?: {
      email?: string;
    };
    personal?: { cnp?: string };
    company?: { cui?: string };
  };
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;

  // Stripe redirects with these params
  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');
  const paymentMethodFromUrl = searchParams.get('method');
  // Hosted Checkout (post-2026-05-28) appends ?session_id=cs_...
  // When this is present and the order is still unpaid, the webhook
  // hasn't landed yet — kick off a synchronous Stripe verification.
  const sessionIdFromUrl = searchParams.get('session_id');

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseTracked, setPurchaseTracked] = useState(false);

  // Determine payment status
  const isBankTransfer = paymentMethodFromUrl === 'bank_transfer' || order?.payment_method === 'bank_transfer';
  const isPending = isBankTransfer && order?.payment_status === 'awaiting_verification';
  const isPaid = order?.payment_status === 'paid' || redirectStatus === 'succeeded';

  // Fetch order data and confirm payment if needed
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Small delay to allow webhook to process. We wait if EITHER signal
        // says Stripe just completed payment:
        //   - paymentIntent param (legacy Embedded/PI flow)
        //   - session_id param (post-2026-05-28 Hosted Checkout flow)
        if (paymentIntent || sessionIdFromUrl) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Comanda nu a fost găsită');
        }
        const data = await response.json();

        if (!data.success || !data.data?.order) {
          throw new Error('Date invalide');
        }

        const apiOrder = data.data.order;

        // Two signals that Stripe completed payment but our DB hasn't
        // caught up (webhook didn't land — common on localhost dev
        // without `stripe listen --forward-to ...`):
        //   - redirect_status=succeeded (legacy PaymentIntent flow)
        //   - session_id=cs_... (Hosted Checkout — added 2026-05-28)
        // In either case, call /confirm-payment which now retrieves
        // the session from Stripe and flips status if Stripe says paid.
        const stripeSignalsPaid = redirectStatus === 'succeeded' || !!sessionIdFromUrl;
        if (stripeSignalsPaid && apiOrder.paymentStatus !== 'paid') {
          console.log('Stripe signals paid but order not marked, confirming...');
          // Up to 2 attempts so a slow Stripe API call doesn't leave the
          // customer staring at an "unpaid" screen after they paid.
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const confirmResponse = await fetch(`/api/orders/${orderId}/confirm-payment`, {
                method: 'POST',
              });
              if (confirmResponse.ok) {
                const confirmData = await confirmResponse.json();
                if (confirmData.success) {
                  apiOrder.paymentStatus = 'paid';
                  apiOrder.status = 'processing';
                  console.log('Payment confirmed via fallback (attempt', attempt + 1, ')');
                  break;
                }
              }
            } catch (confirmError) {
              console.error('Failed to confirm payment (attempt', attempt + 1, '):', confirmError);
            }
            if (attempt === 0) {
              // Brief retry — Stripe sometimes takes a moment for
              // checkout.sessions.retrieve to reflect the latest state.
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
        }

        // Transform API response to expected format
        const cd = (apiOrder.customerData ?? {}) as {
          personal?: { cnp?: string };
          company?: { cui?: string };
          client_type?: string;
        };
        const inferredClientType =
          cd.client_type ||
          (cd.company?.cui ? 'PJ' : cd.personal?.cnp ? 'PF' : null);

        const orderData: OrderData = {
          id: apiOrder.id,
          order_number: apiOrder.orderNumber,
          friendly_order_id: apiOrder.orderNumber,
          service_name: apiOrder.service?.name || 'Serviciu',
          service_id: apiOrder.service?.id,
          service_category: apiOrder.service?.category,
          service_estimated_days:
            apiOrder.service?.estimatedDays ?? apiOrder.service?.estimated_days,
          client_type: inferredClientType,
          total_price: apiOrder.totalAmount,
          payment_status: apiOrder.paymentStatus || 'unpaid',
          payment_method: apiOrder.paymentMethod,
          status: apiOrder.status || 'draft',
          invoice_number: apiOrder.invoiceNumber,
          invoice_url: apiOrder.invoiceUrl,
          processing_days: apiOrder.processingDays || null,
          selected_options: apiOrder.selectedOptions || [],
          options_normalized: apiOrder.options || [],
          delivery_method:
            typeof apiOrder.deliveryMethod === 'object'
              ? apiOrder.deliveryMethod?.name
              : apiOrder.deliveryMethod,
          delivery_price:
            typeof apiOrder.deliveryMethod === 'object'
              ? apiOrder.deliveryMethod?.price || 0
              : apiOrder.breakdown?.deliveryPrice || 0,
          coupon_code: apiOrder.breakdown?.couponCode || null,
          discount_amount: apiOrder.breakdown?.discountAmount || 0,
          breakdown: apiOrder.breakdown || null,
          customer_data: apiOrder.customerData,
        };

        setOrder(orderData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea comenzii');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, paymentIntent, sessionIdFromUrl, redirectStatus]);

  // GA4 Purchase Tracking
  useEffect(() => {
    // Only track if payment is confirmed and not already tracked
    if (!order || purchaseTracked || !isPaid) return;

    // Check if gtag is available
    if (typeof window !== 'undefined' && window.gtag) {
      // Build items array: main service + options
      const gaItems = [
        {
          item_id: order.service_id || order.id,
          item_name: order.service_name,
          item_category: order.service_category || 'Documente',
          price: order.breakdown?.basePrice || order.total_price,
          quantity: 1,
        },
        ...(order.selected_options || []).map((opt, idx) => ({
          item_id: `option-${idx}`,
          item_name: opt.optionName || opt.option_name || 'Opțiune',
          item_category: 'Opțiuni',
          price: (opt.priceModifier || 0) * (opt.quantity || 1),
          quantity: opt.quantity || 1,
        })),
      ];

      window.gtag('event', 'purchase', {
        transaction_id: order.friendly_order_id || order.id,
        value: order.total_price,
        currency: 'RON',
        items: gaItems,
      });

      setPurchaseTracked(true);
      console.log('GA4 Purchase tracked:', order.friendly_order_id);
    }
  }, [order, isPaid, purchaseTracked]);

  // Clear localStorage draft after successful order
  useEffect(() => {
    if (!order) return;

    // Clear the draft from localStorage so wizard starts fresh next time
    const friendlyOrderId = order.friendly_order_id || order.order_number;
    if (friendlyOrderId && typeof window !== 'undefined') {
      const cacheKey = `order_draft_${friendlyOrderId}`;
      try {
        localStorage.removeItem(cacheKey);
        console.log('Cleared draft from localStorage:', cacheKey);
      } catch (error) {
        console.warn('Failed to clear draft from localStorage:', error);
      }
    }
  }, [order]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
          <p className="mt-4 text-neutral-600">Se verifică plata...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-secondary-900 mb-2">
              Eroare
            </h1>
            <p className="text-neutral-600 mb-6">{error || 'Comanda nu a fost găsită'}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              Înapoi la pagina principală
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderNumber = order.friendly_order_id || `ORD-${order.order_number}`;
  const email = order.customer_data?.contact?.email || '';

  // Bank transfer pending state
  if (isPending) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              {/* Icon */}
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-amber-600" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                Plată în așteptare
              </h1>
              <p className="text-neutral-600 mb-6">
                Comanda ta a fost înregistrată și așteaptă verificarea plății.
              </p>

              {/* Order Number */}
              <div className="bg-neutral-100 p-4 rounded-lg inline-block mb-6">
                <p className="text-sm text-neutral-600 mb-1">Codul comenzii:</p>
                <p className="text-xl font-mono font-bold text-secondary-900">
                  {orderNumber}
                </p>
              </div>

              <Separator className="my-6" />

              {/* What's next */}
              <div className="text-left space-y-4 mb-8">
                <h2 className="font-semibold text-secondary-900">Ce urmează?</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium text-amber-700">1</span>
                    </div>
                    <p className="text-neutral-600">
                      Verificăm dovada de plată încărcată (1-3 zile lucrătoare)
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium text-neutral-600">2</span>
                    </div>
                    <p className="text-neutral-600">
                      Vei primi un email de confirmare când plata este verificată
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium text-neutral-600">3</span>
                    </div>
                    <p className="text-neutral-600">
                      Începem procesarea documentului imediat după confirmare
                    </p>
                  </div>
                </div>
              </div>

              {/* Email notification */}
              {email && (
                <div className="flex items-center gap-2 justify-center text-sm text-neutral-500 mb-6">
                  <Mail className="h-4 w-4" />
                  <span>Notificări trimise la: {email}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push(`/comanda/status?order=${orderNumber}&email=${encodeURIComponent(email)}`)}
                  className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
                >
                  Verifică Statusul
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Pagina Principală
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Build the real processing window by summing the per-step business days
  // for everything the customer ordered — same calculator the wizard
  // sidebar + checkout sidebar use. Was previously hardcoded to
  // `service.estimated_days` which ignored apostila/traducere/legalizare
  // and showed e.g. "în 2 zile" for an order that actually takes 5-7.
  const rawSelectedOptions = (order.selected_options ?? []) as SelectedOption[];
  const deliveryEstimate = estimateFromSelectedOptions({
    selectedOptions: rawSelectedOptions.map((o) => ({
      code: o.code ?? null,
      optionName: o.optionName || o.option_name,
      bundledFor:
        o.bundledFor ??
        (o.bundled_for
          ? { parentOptionId: o.bundled_for.parent_option_id }
          : null),
    })),
    baseDays: order.service_estimated_days,
    courier: order.delivery_method ?? null,
    includeCourierLeg: !!order.delivery_method,
  });
  const processingTimeText =
    deliveryEstimate.minDays === deliveryEstimate.maxDays
      ? `Primești documentul în ${deliveryEstimate.minDays} zile lucrătoare`
      : `Primești documentul în ${deliveryEstimate.minDays}-${deliveryEstimate.maxDays} zile lucrătoare`;

  // Normalized options for the shared OrderSummaryCard — names already
  // stripped of the "(adaugă în aceeași comandă)" marketing suffix, and
  // optionId + bundledForParentId carried through for parent/child nesting.
  const summaryOptions = (order.options_normalized ?? []).map((opt) => ({
    name: opt.quantity > 1 ? `${opt.name} × ${opt.quantity}` : opt.name,
    price: opt.total,
    optionId: opt.optionId,
    bundledForParentId: opt.bundledForParentId,
  }));
  const serviceNameWithType = order.client_type
    ? `${order.service_name} ${order.client_type}`
    : order.service_name;

  // Payment successful state
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-green-200">
          <CardContent className="p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Plată confirmată!
            </h1>
            <p className="text-neutral-600 mb-6">
              Îți mulțumim pentru comandă. Am început procesarea documentului.
            </p>

            {/* Order code is shown inside OrderSummaryCard below — the separate
                green badge here was redundant and ate vertical space on mobile. */}

            {/* Ordered Services Summary — same OrderSummaryCard used on
                /comanda + /comanda/checkout so the customer sees the
                identical itemized breakdown all the way through the funnel. */}
            <div className="text-left mb-6">
              <h3 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                Servicii comandate
              </h3>
              <OrderSummaryCard
                orderNumber={orderNumber}
                serviceName={serviceNameWithType}
                basePrice={order.breakdown?.basePrice ?? 0}
                options={summaryOptions}
                deliveryMethod={order.delivery_method}
                deliveryPrice={order.delivery_price}
                totalPrice={order.breakdown?.total ?? order.total_price}
                subtotalWithoutVat={order.breakdown?.subtotalWithoutVat}
                vatAmount={order.breakdown?.vatAmount}
                couponCode={order.coupon_code}
                discountAmount={order.discount_amount}
              />
            </div>

            {/* Invoice Download */}
            {order.invoice_url && (
              <div className="mb-6">
                <Button
                  onClick={() => window.open(order.invoice_url, '_blank')}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descarcă Factura
                </Button>
                {order.invoice_number && (
                  <p className="text-sm text-neutral-500 mt-2">
                    Factură: {order.invoice_number}
                  </p>
                )}
              </div>
            )}

            <Separator className="my-6" />

            {/* What's next */}
            <div className="text-left space-y-4 mb-8">
              <h2 className="font-semibold text-secondary-900">Ce urmează?</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-neutral-600">
                    Plata a fost confirmată și factura generată
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  <p className="text-neutral-600">
                    {processingTimeText}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="h-4 w-4 text-neutral-600" />
                  </div>
                  <p className="text-neutral-600">
                    Te notificăm pe email când documentul este gata
                  </p>
                </div>
              </div>
            </div>

            {/* Email notification */}
            {email && (
              <div className="flex items-center gap-2 justify-center text-sm text-neutral-500 mb-6">
                <Mail className="h-4 w-4" />
                <span>Confirmare trimisă la: {email}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push(`/comanda/status?order=${orderNumber}&email=${encodeURIComponent(email)}`)}
                className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
              >
                Verifică Statusul
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
              >
                <Home className="mr-2 h-4 w-4" />
                Pagina Principală
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
