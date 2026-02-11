'use client';

import { useEffect, useState } from 'react';
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
} from '@/components/payment';

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

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
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

        // Check if already paid
        if (apiOrder.paymentStatus === 'paid') {
          router.push(`/comanda/success/${orderId}`);
          return;
        }

        // Transform selected options to expected format
        const transformedOptions = (apiOrder.selectedOptions || []).map((opt: { name?: string; option_name?: string; price?: number; option_price?: number }) => ({
          name: opt.name || opt.option_name || 'Opțiune',
          price: typeof opt.price === 'number' ? opt.price : (typeof opt.option_price === 'number' ? opt.option_price : 0),
        })).filter((opt: { name: string; price: number }) => opt.price > 0);

        // Transform API response to expected format
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
            : (apiOrder.deliveryAddress?.price || 0),
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
  }, [orderId, router]);

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
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-neutral-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold text-secondary-900">
              Finalizare Comandă
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <Card>
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
          <div className="space-y-6">
            <OrderSummaryCard
              orderNumber={orderNumber}
              serviceName={order.service_name}
              basePrice={order.base_price}
              options={order.selected_options}
              deliveryMethod={order.delivery_method}
              deliveryPrice={order.delivery_price}
              totalPrice={order.total_price}
            />

            {/* Security Badges */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Plată Securizată</p>
                    <p className="text-sm text-green-700">
                      Datele tale sunt protejate prin criptare SSL
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
