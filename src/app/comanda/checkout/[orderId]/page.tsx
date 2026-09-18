'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { whatsappUrl } from '@/config/contact';
import { estimateFromSelectedOptions } from '@/lib/delivery-calculator';
import { cn } from '@/lib/utils';
import { OrderFlowDisclosure } from '@/components/legal/order-flow-disclosure';

interface OrderData {
  id: string;
  order_number: string;
  friendly_order_id: string;
  service_name: string;
  /** Slug-ul serviciului — decide dacă arătăm badge-ul de stare ANCPI/ONRC. */
  service_slug?: string | null;
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
  /** Interval de procesare care ÎNLOCUIEȘTE zilele standard (cazier auto cu
   *  permis emis în străinătate: 7-10 zile la autoritatea emitentă). */
  service_days_range?: { minDays: number; maxDays: number } | null;
  delivery_method?: string;
  delivery_price?: number;
  subtotal_without_vat?: number;
  vat_amount?: number;
  coupon_code?: string | null;
  discount_amount?: number;
  /** Presign-only bearer for the proof upload (guests have no session here). */
  proof_token?: string | null;
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
      // Sufixul PF/PJ doar la serviciile care oferă alegerea (cazier judiciar).
      // Înainte se deducea „PF" din simpla prezență a unui CNP, deci comenzile
      // de cazier auto — serviciu exclusiv pentru persoane fizice — apăreau ca
      // „Cazier Auto PF", un sufix fără niciun sens: nu există varianta PJ de
      // care să-l deosebești. Flagul vine din verification_config (API).
      const offersClientType = apiOrder.service?.offersClientType === true;
      const inferredClientType = offersClientType
        ? cd.client_type ||
          (cd.company?.cui ? 'PJ' : cd.personal?.cnp ? 'PF' : null)
        : null;

      const orderData: OrderData = {
        id: apiOrder.id,
        order_number: apiOrder.orderNumber,
        friendly_order_id: apiOrder.orderNumber,
        service_name: apiOrder.service?.name || 'Serviciu',
        service_slug: apiOrder.service?.slug ?? null,
        client_type: inferredClientType,
        service_estimated_days: apiOrder.service?.estimatedDays ?? apiOrder.service?.estimated_days,
        service_days_range: (() => {
          const fl = apiOrder.service?.foreignLicense;
          const abroad =
            (apiOrder.customerData as { vehicle?: { licenseIssuedAbroad?: boolean } } | null)
              ?.vehicle?.licenseIssuedAbroad === true;
          return fl?.enabled && abroad && fl.maxDays
            ? { minDays: fl.minDays ?? fl.maxDays, maxDays: fl.maxDays }
            : null;
        })(),
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
        proof_token: apiOrder.proofToken ?? null,
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

  // Recovery emails link here with ?coupon=RECOVERY-XXX — apply it once the
  // order is loaded (and only if no coupon is applied yet), then re-fetch so
  // the discounted total shows. A failed apply (expired/used code) is silent
  // here; the CouponInput stays available for manual entry.
  const autoCouponTriedRef = useRef(false);
  useEffect(() => {
    const code = searchParams.get('coupon')?.trim().toUpperCase();
    if (!code || !order || order.coupon_code || autoCouponTriedRef.current) return;
    autoCouponTriedRef.current = true;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/coupon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        if (res.ok) await fetchOrder();
      } catch {
        // manual input remains as fallback
      }
    })();
  }, [order, orderId, searchParams, fetchOrder]);

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

  // Handle bank transfer submission.
  //
  // Dovada de plată e OPȚIONALĂ (10.09.2026). Înainte butonul era blocat până
  // la încărcarea unui ordin de plată, deci clientul care pleca să plătească
  // din aplicația băncii nu înregistra nimic: comanda rămânea `pending`, cronul
  // auto-abandon o îngropa în 30 de minute și nu pleca niciun email
  // (E-260905-DMUZA — bani încasați pe o comandă marcată „abandonată").
  const handleBankTransferSubmit = async () => {
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
        {/* Pagina de plată redusă la esențial (Raul, 14.09.2026, capturi de pe
            telefon): 1) metoda de plată + cuponul, 2) rezumatul comenzii.
            Atât. Au dispărut: caseta de stare a portalului ANCPI/ONRC (clientul
            a decis deja — pe wizard rămâne), cardul „Detalii Card" (text
            despre Stripe + un al doilea buton, când bara lipită de jos are
            deja „Plătește cu cardul") și butonul plutitor WhatsApp (stătea
            peste bară). Pe desktop nu există bară lipită, deci butonul de
            plată apare inline, sub metoda de plată. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 order-1">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Coupon BEFORE the payment method: with bank transfer the card
                below grows (IBAN, upload, button) and the coupon fell under
                the fold — the customer saw the amount to transfer before any
                chance to reduce it (Raul, 18.09.2026). */}
            <CouponInput
              orderId={order.id}
              appliedCode={order.coupon_code}
              appliedDiscount={order.discount_amount}
              onChange={handleCouponChange}
            />

            {/* Payment method + (desktop) pay button in the SAME card */}
            <Card id="payment-form-anchor" className="scroll-mt-4">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <PaymentMethodSelector
                  selected={paymentMethod}
                  onChange={(method) => {
                    setPaymentMethod(method);
                    setError(null);
                  }}
                />

                {paymentMethod === 'card' ? (
                  // Hosted Stripe Checkout — on click, we create a session
                  // server-side and redirect the customer to checkout.stripe.com.
                  // On mobile the sticky bar owns the button; here it's desktop-only.
                  <div className="space-y-2">
                    <Button
                      onClick={handleCardCheckout}
                      disabled={isRedirecting}
                      className="hidden lg:flex w-full h-12 bg-primary-500 hover:bg-primary-600 text-secondary-900 text-base font-semibold"
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
                      <a href="/termeni-si-conditii/" className="underline hover:text-neutral-700">
                        termenii și condițiile
                      </a>
                      . Plata se face pe pagina securizată Stripe; nu vedem și nu
                      păstrăm datele cardului.
                    </p>
                  </div>
                ) : (
                  // Bank Transfer — details + confirm button (there's no
                  // sticky action for this method; the bar just scrolls here).
                  <div className="space-y-4">
                    <BankTransferDetails
                      orderNumber={orderNumber}
                      amount={order.total_price}
                    />

                    {bankTransferProofKey ? (
                      <div className="rounded-lg border border-green-200 bg-green-50/70 p-4 text-sm text-green-900">
                        <p className="font-medium leading-tight">Am primit dovada plății</p>
                        <p className="mt-1 text-xs leading-snug text-green-800">
                          Apasă „Plasează comanda&quot; și o verificăm; pornim lucrul de
                          îndată ce e confirmată, fără să așteptăm banii în cont.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
                        <p className="font-medium leading-tight">
                          Nu trebuie să plătești acum
                        </p>
                        <p className="mt-1 text-xs leading-snug text-amber-800">
                          Apasă butonul de mai jos ca să îți rezervăm comanda. Îți
                          trimitem pe email datele contului și numărul comenzii,
                          iar tu faci transferul când vrei, din aplicația băncii.
                          Punem comanda în lucru imediat ce banii intră în cont.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {!bankTransferProofKey && (
                        <p className="text-xs text-neutral-500 leading-snug">
                          Ai deja ordinul de plată? Încarcă-l aici și confirmăm mai
                          repede. Pasul e opțional.
                        </p>
                      )}
                      <PaymentProofUpload
                        orderId={orderId}
                        proofToken={order.proof_token}
                        onUploadComplete={(key) => setBankTransferProofKey(key)}
                        onUploadError={(err) => setError(err)}
                      />
                    </div>

                    <Button
                      onClick={handleBankTransferSubmit}
                      disabled={isSubmittingBankTransfer}
                      className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-secondary-900"
                    >
                      {isSubmittingBankTransfer ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Se trimite...
                        </>
                      ) : bankTransferProofKey ? (
                        'Plasează comanda'
                      ) : (
                        'Plasează comanda — plătesc prin transfer'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Order Summary — same <OrderSidebar> as the wizard. Mobile: after
              payment + coupon. Desktop: sticky right column. */}
          <div className="space-y-4 order-2 lg:sticky lg:top-4 lg:self-start">
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
                // Permis străin → intervalul autorității emitente bate zilele
                // standard ale serviciului (și urgența, care oricum e ascunsă
                // în wizard pentru acest caz).
                baseRange: order.service_days_range ?? undefined,
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

            {/* Inline help — replaces the floating WhatsApp button, which sat
                on top of the sticky pay bar on phones. */}
            <p className="text-xs text-neutral-500 text-center leading-snug">
              Ai nevoie de ajutor?{' '}
              <a
                href={whatsappUrl(`Bună! Am nevoie de ajutor cu plata comenzii ${orderNumber} (eghiseul.ro).`)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#128C7E] underline"
              >
                Scrie-ne pe WhatsApp
              </a>
            </p>
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
            disabled={(paymentMethod === 'card' && isRedirecting) || (paymentMethod !== 'card' && isSubmittingBankTransfer)}
            onClick={() => {
              // Card: pay directly. Bank transfer: the first tap brings the
              // IBAN into view; once the details are on screen (or the proof
              // is uploaded) the bar places the order — „Vezi detalii" on a
              // customer who already uploaded the proof read as a dead end.
              if (paymentMethod === 'card') {
                handleCardCheckout();
                return;
              }
              const anchor = document.querySelector<HTMLElement>('#payment-form-anchor');
              const rect = anchor?.getBoundingClientRect();
              const detailsOnScreen = !!rect && rect.top < window.innerHeight * 0.6 && rect.bottom > 0;
              if (bankTransferProofKey || detailsOnScreen) {
                handleBankTransferSubmit();
              } else {
                anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            ) : isSubmittingBankTransfer ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Se trimite...
              </>
            ) : bankTransferProofKey ? (
              'Plasează comanda'
            ) : (
              'Plasează comanda'
            )}
          </Button>
        </div>
      </div>
      <OrderFlowDisclosure />
    </div>
  );
}
