'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  PaymentMethodSelector,
  PaymentMethod,
  StripeProvider,
  StripeCheckoutForm,
  BankTransferDetails,
  PaymentProofUpload,
  OrderSummaryCard,
  CouponInput,
} from '@/components/payment';
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
  selected_options?: Array<{ name: string; price: number }>;
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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
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

      const canonical = (apiOrder.options || []) as Array<{
        name: string;
        total: number;
        quantity: number;
      }>;
      const transformedOptions = canonical.map((opt) => ({
        name: opt.quantity > 1 ? `${opt.name} × ${opt.quantity}` : opt.name,
        price: opt.total,
      }));

      const orderData: OrderData = {
        id: apiOrder.id,
        order_number: apiOrder.orderNumber,
        friendly_order_id: apiOrder.orderNumber,
        service_name: apiOrder.service?.name || 'Serviciu',
        base_price: apiOrder.breakdown?.basePrice || apiOrder.totalAmount,
        total_price: apiOrder.totalAmount,
        payment_status: apiOrder.paymentStatus || 'unpaid',
        status: apiOrder.status || 'draft',
        selected_options: transformedOptions,
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

  // Called after a coupon is applied/removed: order total changed, so the
  // existing PaymentIntent (cancelled server-side) must be regenerated.
  // Setting clientSecret to null triggers the create-intent useEffect.
  const handleCouponChange = useCallback(async () => {
    setClientSecret(null);
    await fetchOrder();
  }, [fetchOrder]);

  // Create payment intent when card is selected
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (paymentMethod !== 'card' || !order || clientSecret) return;

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
        if (data.success && data.data?.clientSecret) {
          setClientSecret(data.data.clientSecret);
        }
      } catch (err) {
        console.error('Payment intent error:', err);
        setError(err instanceof Error ? err.message : 'Eroare la inițializarea plății');
      }
    };

    createPaymentIntent();
  }, [paymentMethod, order, orderId, clientSecret]);

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
          {/* Payment Section */}
          <div className="lg:col-span-2 space-y-6">
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
                  }}
                />
              </CardContent>
            </Card>

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
                  // Stripe Payment Form
                  clientSecret ? (
                    <StripeProvider clientSecret={clientSecret}>
                      <StripeCheckoutForm
                        orderId={orderId}
                        orderNumber={orderNumber}
                        amount={order.total_price}
                        onError={(err) => setError(err)}
                      />
                    </StripeProvider>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                      <span className="ml-3 text-neutral-600">
                        Se inițializează plata...
                      </span>
                    </div>
                  )
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

          {/* Order Summary Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <OrderSummaryCard
              orderNumber={orderNumber}
              serviceName={order.service_name}
              basePrice={order.base_price}
              options={order.selected_options}
              deliveryMethod={order.delivery_method}
              deliveryPrice={order.delivery_price}
              totalPrice={order.total_price}
              subtotalWithoutVat={order.subtotal_without_vat}
              vatAmount={order.vat_amount}
              couponCode={order.coupon_code}
              discountAmount={order.discount_amount}
            />

            {/* Coupon input — apply/remove discount before payment */}
            <CouponInput
              orderId={order.id}
              appliedCode={order.coupon_code}
              appliedDiscount={order.discount_amount}
              onChange={handleCouponChange}
            />

            {/* Security Badges */}
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-7 w-7 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">
                      Plată Securizată
                    </p>
                    <p className="text-xs text-emerald-700">
                      Datele tale sunt protejate prin criptare SSL
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
        <div className="container mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">
              Total de plată
            </p>
            <p className="text-lg font-bold text-primary-600 tabular-nums leading-tight">
              {order.total_price.toFixed(2)} RON
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              const form =
                document.querySelector<HTMLElement>('#payment-form-anchor');
              form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="h-11 px-5 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold"
          >
            {paymentMethod === 'card' ? 'Completează plata' : 'Vezi detalii'}
          </Button>
        </div>
      </div>
    </div>
  );
}
