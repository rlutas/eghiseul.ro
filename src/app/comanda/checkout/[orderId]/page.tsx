'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  PaymentMethodSelector,
  PaymentMethod,
  BankTransferDetails,
  PaymentProofUpload,
  CouponInput,
} from '@/components/payment';
// EmbeddedCheckoutBlock removed 2026-05-28 — switched to hosted Stripe Checkout
// (redirect-based). Keeping the component file for now in case we ever revisit
// the embedded UX for a different flow.
import { OrderSidebar } from '@/components/orders/order-sidebar';
import { estimateFromSelectedOptions } from '@/lib/delivery-calculator';
import { cn } from '@/lib/utils';

interface OrderData {
  id: string;
  order_number: string;
  friendly_order_id: string;
  service_name: string;
  base_price: number;
  total_price: number;
  payment_status: string;
  status: string;
  selected_options?: Array<{ name: string; price: number; optionId?: string; bundledForParentId?: string; code?: string }>;
  /** Raw selected_options from DB (for delivery-calculator) — kept separate
   *  from the UI-shaped `selected_options` because the calculator needs
   *  `code` + `bundledFor` (parent ref) which aren't in the display shape. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw_selected_options?: any[];
  /** Picked client type (PF/PJ) — appended to the service name for
   *  cazier-judiciar so the checkout sidebar matches the wizard sidebar. */
  client_type?: string | null;
  /** Service's base estimated days — feeds the delivery-time calculator. */
  service_estimated_days?: number;
  delivery_method?: string;
  delivery_price?: number;
  subtotal_without_vat?: number;
  vat_amount?: number;
  coupon_code?: string | null;
  discount_amount?: number;
  customer_data?: {
    contact?: {
      email?: string;
    };
  };
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const errorFromUrl = searchParams.get('error');

  const [order, setOrder] = useState<OrderData | null>(null);
  // clientSecret removed — hosted checkout uses session.url, set on demand via handleCardCheckout
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(errorFromUrl);
  const [isSubmittingBankTransfer, setIsSubmittingBankTransfer] = useState(false);
  const [bankTransferProofKey, setBankTransferProofKey] = useState<string | null>(null);

  // Fetch order data — extracted as a callback so we can re-fetch after
  // applying / removing a coupon (which mutates total_price server-side).
  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Comanda nu a fost găsită');
      }
      const data = await response.json();

      if (!data.success || !data.data?.order) {
        throw new Error('Date invalide');
      }

      const apiOrder = data.data.order;

      if (apiOrder.paymentStatus === 'paid') {
        router.push(`/comanda/success/${orderId}`);
        return;
      }

      // The API's normalized `options` shape has bundling metadata that we
      // forward to OrderSummaryCard so bundled add-ons render nested under
      // their parent sub-service. Falling back to `selected_options` on the
      // raw row covers older orders that pre-date the normalized payload.
      const canonical = (apiOrder.options || []) as Array<{
        optionId?: string;
        option_id?: string;
        name: string;
        total: number;
        quantity: number;
        bundledForParentId?: string;
        bundled_for_parent_id?: string;
        bundledFor?: { parentOptionId?: string };
      }>;
      const transformedOptions = canonical.map((opt) => ({
        name: opt.quantity > 1 ? `${opt.name} × ${opt.quantity}` : opt.name,
        price: opt.total,
        optionId: opt.optionId || opt.option_id,
        bundledForParentId:
          opt.bundledForParentId ||
          opt.bundled_for_parent_id ||
          opt.bundledFor?.parentOptionId,
      }));

      // Detect PF/PJ from customer_data so the service name matches what the
      // wizard sidebar showed (e.g. "Cazier Judiciar PF"). Falls back to no
      // suffix when the service doesn't expose a client-type selector.
      const cd = (apiOrder.customerData ?? {}) as {
        personal?: { cnp?: string };
        company?: { cui?: string };
        billing?: { type?: string };
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
        client_type: inferredClientType,
        service_estimated_days: apiOrder.service?.estimatedDays ?? apiOrder.service?.estimated_days,
        base_price: apiOrder.breakdown?.basePrice || apiOrder.totalAmount,
        total_price: apiOrder.totalAmount,
        payment_status: apiOrder.paymentStatus || 'unpaid',
        status: apiOrder.status || 'draft',
        selected_options: transformedOptions,
        // Keep the unshaped options around so the delivery calculator can
        // read `code` + `bundledFor` — these don't appear on the UI shape.
        raw_selected_options: apiOrder.options,
        delivery_method: typeof apiOrder.deliveryMethod === 'object'
          ? apiOrder.deliveryMethod?.name
          : apiOrder.deliveryMethod,
        delivery_price: typeof apiOrder.deliveryMethod === 'object'
          ? apiOrder.deliveryMethod?.price || 0
          : (apiOrder.breakdown?.deliveryPrice || 0),
        subtotal_without_vat: apiOrder.breakdown?.subtotalWithoutVat,
        vat_amount: apiOrder.breakdown?.vatAmount,
        coupon_code: apiOrder.breakdown?.couponCode || null,
        discount_amount: apiOrder.breakdown?.discountAmount || 0,
        customer_data: apiOrder.customerData,
      };

      setOrder(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea comenzii');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  // Coupon change → re-fetch order so the total + summary update. There's
  // no PaymentIntent to invalidate any more (hosted Checkout creates a
  // session only on Pay click).
  const handleCouponChange = useCallback(async () => {
    await fetchOrder();
  }, [fetchOrder]);

  // Track whether we're currently redirecting to Stripe Checkout. Disables
  // the button and shows a spinner so the customer doesn't double-click.
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Triggered by the "Plătește cu cardul" button. Creates a hosted
  // Checkout Session on demand and redirects to checkout.stripe.com.
  // We deliberately DON'T auto-create on page mount any more — letting
  // the user review the order + apply a coupon before committing.
  const handleCardCheckout = useCallback(async () => {
    if (!order || isRedirecting) return;
    setIsRedirecting(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Eroare la inițializarea plății');
      }
      const data = await response.json();
      if (data.success && data.data?.checkoutUrl) {
        // Hard redirect — Stripe Checkout takes over the tab. After
        // payment the customer is sent to successUrl which our backend
        // configured at session creation time.
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error('Sesiunea de plată nu a putut fi creată');
      }
    } catch (err) {
      console.error('Card checkout error:', err);
      setError(err instanceof Error ? err.message : 'Eroare la inițializarea plății');
      setIsRedirecting(false);
    }
  }, [order, orderId, isRedirecting]);

  // Handle bank transfer submission
  const handleBankTransferSubmit = async () => {
    if (!bankTransferProofKey) {
      setError('Te rugăm să încarci dovada plății');
      return;
    }

    setIsSubmittingBankTransfer(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/bank-transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentProofKey: bankTransferProofKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la trimiterea plății');
      }

      // Redirect to success page with bank transfer status
      router.push(`/comanda/success/${orderId}?method=bank_transfer`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la trimiterea plății');
    } finally {
      setIsSubmittingBankTransfer(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
          <p className="mt-4 text-neutral-600">Se încarcă comanda...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-secondary-900 mb-2">
              Eroare
            </h1>
            <p className="text-neutral-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              Înapoi la pagina principală
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  const orderNumber = order.friendly_order_id || `ORD-${order.order_number}`;

  return (
    <div className="min-h-screen bg-neutral-50/40 pb-28 lg:pb-0">
      {/* Main Content — breadcrumb + grid combined, no separate sub-header bar */}
      <div className="container mx-auto px-4 pt-3 pb-8 lg:pt-6 max-w-5xl">
        <div className="mb-4 flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-neutral-600 hover:text-secondary-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Înapoi</span>
          </button>
          <span className="text-neutral-300">/</span>
          <h1 className="text-sm font-semibold text-secondary-900">
            Finalizare Comandă
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Payment Section — on mobile it comes AFTER the summary + coupon
              (order-2) so the customer sees what they pay + can apply a coupon
              before choosing how to pay. Desktop keeps it in the left columns. */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Payment Method Selection */}
            <Card>
              <CardContent className="p-6">
                <PaymentMethodSelector
                  selected={paymentMethod}
                  onChange={(method) => {
                    setPaymentMethod(method);
                    setError(null);
                    // Guide the customer to the matching details section after
                    // they pick a method (smooth scroll once it re-renders).
                    setTimeout(() => {
                      document
                        .querySelector<HTMLElement>('#payment-form-anchor')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 80);
                  }}
                />
              </CardContent>
            </Card>

            {/* Coupon — right under the payment method so the customer applies
                any discount before paying. */}
            <CouponInput
              orderId={order.id}
              appliedCode={order.coupon_code}
              appliedDiscount={order.discount_amount}
              onChange={handleCouponChange}
            />

            {/* Payment Form based on selected method */}
            <Card id="payment-form-anchor" className="scroll-mt-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  {paymentMethod === 'card'
                    ? 'Detalii Card'
                    : 'Transfer Bancar'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethod === 'card' ? (
                  // Hosted Stripe Checkout — on click, we create a session
                  // server-side and redirect the customer to
                  // checkout.stripe.com. Cleaner UX than the embedded
                  // iframe which felt cramped. Customer returns via
                  // successUrl after paying.
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-blue-700"
                          >
                            <rect x="3" y="6" width="18" height="13" rx="2" />
                            <path d="M3 10h18" />
                            <path d="M7 15h2" />
                          </svg>
                        </div>
                        <div className="text-sm text-blue-900">
                          <p className="font-medium leading-tight">
                            Plată securizată prin Stripe
                          </p>
                          <p className="text-xs text-blue-800 mt-1 leading-snug">
                            Vei fi redirecționat către pagina de plată Stripe.
                            Acceptăm Visa, Mastercard, Apple Pay, Google Pay
                            și Link. Datele cardului nu sunt salvate de noi.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleCardCheckout}
                      disabled={isRedirecting}
                      className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-secondary-900 text-base font-semibold"
                    >
                      {isRedirecting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Se redirecționează către Stripe...
                        </>
                      ) : (
                        <>
                          Plătește cu cardul · RON {Number(order.total_price).toFixed(2)}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-neutral-500 text-center leading-snug">
                      Apăsând „Plătește” accepți{' '}
                      <a href="/termeni" className="underline hover:text-neutral-700">
                        termenii și condițiile
                      </a>
                      . Plata se procesează prin Stripe (SSL 256-bit).
                    </p>
                  </div>
                ) : (
                  // Bank Transfer Form
                  <div className="space-y-6">
                    <BankTransferDetails
                      orderNumber={orderNumber}
                      amount={order.total_price}
                    />

                    <Separator />

                    <PaymentProofUpload
                      orderId={orderId}
                      onUploadComplete={(key) => setBankTransferProofKey(key)}
                      onUploadError={(err) => setError(err)}
                    />

                    <Button
                      onClick={handleBankTransferSubmit}
                      disabled={!bankTransferProofKey || isSubmittingBankTransfer}
                      className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-secondary-900"
                    >
                      {isSubmittingBankTransfer ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Se trimite...
                        </>
                      ) : (
                        'Confirmă Plata prin Transfer'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar — uses the same <OrderSidebar> as the
              wizard. On mobile it's FIRST (order-1) with the coupon, so the
              customer reviews + discounts before paying. Desktop = sticky right. */}
          <div className="space-y-4 order-1 lg:order-2 lg:sticky lg:top-4 lg:self-start">
            {(() => {
              // Compute delivery estimate from raw options (need `code` +
              // `bundledFor` which the UI-shaped list doesn't carry).
              const baseDays = order.service_estimated_days;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const rawOpts = (order.raw_selected_options ?? []) as any[];
              const hasUrgent = rawOpts.some(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (o: any) => o.code === 'urgenta' && !o.bundledForParentId && !o.bundledFor
              );
              const est = estimateFromSelectedOptions({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                selectedOptions: rawOpts.map((o: any) => ({
                  code: o.code ?? null,
                  optionName: o.name,
                  bundledFor: o.bundledForParentId
                    ? { parentOptionId: o.bundledForParentId }
                    : o.bundledFor ?? null,
                })),
                baseDays,
                courier: order.delivery_method ?? null,
                includeCourierLeg: !!order.delivery_method,
              });
              const deliveryTimeText =
                est.minDays === est.maxDays
                  ? `${est.minDays} zile lucrătoare`
                  : `${est.minDays}-${est.maxDays} zile lucrătoare`;
              const serviceName = order.client_type
                ? `${order.service_name} ${order.client_type}`
                : order.service_name;
              return (
                <OrderSidebar
                  orderNumber={orderNumber}
                  serviceName={serviceName}
                  basePrice={order.base_price}
                  options={order.selected_options}
                  deliveryMethod={order.delivery_method}
                  deliveryPrice={order.delivery_price}
                  totalPrice={order.total_price}
                  subtotalWithoutVat={order.subtotal_without_vat}
                  vatAmount={order.vat_amount}
                  couponCode={order.coupon_code}
                  discountAmount={order.discount_amount}
                  deliveryTimeText={deliveryTimeText}
                  urgencyActive={hasUrgent}
                  variant="summary"
                  timeInSummary
                />
              );
            })()}
          </div>
        </div>
      </div>

      {/* Sticky bottom bar — mobile only */}
      <div
        className={cn(
          'lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur',
          'shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)]'
        )}
      >
        <div className="container mx-auto max-w-5xl px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {/* Mini order summary so the bar shows WHAT is being paid, not just
                the amount. Full itemized breakdown is in the card above. */}
            <p className="text-xs font-semibold text-secondary-900 truncate leading-tight">
              {order.service_name}
              {order.client_type ? ` ${order.client_type}` : ''}
            </p>
            <p className="text-[11px] text-neutral-500 leading-tight">
              {(order.selected_options?.length ?? 0) > 0
                ? `${order.selected_options!.length} ${order.selected_options!.length === 1 ? 'opțiune' : 'opțiuni'} · `
                : ''}
              Total:{' '}
              <span className="font-bold text-primary-600 tabular-nums">
                {order.total_price.toFixed(2)} RON
              </span>
            </p>
          </div>
          <Button
            type="button"
            disabled={paymentMethod === 'card' && isRedirecting}
            onClick={() => {
              // Card: pay directly (don't make the user hunt for a second
              // button). Bank transfer: scroll to the details/instructions.
              if (paymentMethod === 'card') {
                handleCardCheckout();
              } else {
                document
                  .querySelector<HTMLElement>('#payment-form-anchor')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="h-11 px-5 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold"
          >
            {paymentMethod === 'card' ? (
              isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se procesează...
                </>
              ) : (
                'Plătește cu cardul'
              )
            ) : (
              'Vezi detalii'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
