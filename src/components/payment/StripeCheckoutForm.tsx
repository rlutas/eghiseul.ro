'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StripeCheckoutFormProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function StripeCheckoutForm({
  orderId,
  orderNumber,
  amount,
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/comanda/success/${orderId}`,
        },
      });

      // This point is only reached if there's an immediate error
      // (e.g., card declined). Otherwise, the customer is redirected.
      if (error) {
        const message = getErrorMessage(error);
        setErrorMessage(message);
        onError?.(message);
      }
    } catch (err) {
      const message = 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.';
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element - handles card, Apple Pay, Google Pay */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            defaultValues: {
              billingDetails: {
                // Will be populated from order data if available
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-lg bg-primary-500 hover:bg-primary-600 text-secondary-900"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Se procesează...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Plătește {amount.toFixed(2)} RON
          </>
        )}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
        <Lock className="h-3 w-3" />
        <span>Plată securizată prin Stripe · SSL 256-bit</span>
      </div>
    </form>
  );
}

// Helper to get user-friendly error messages
function getErrorMessage(error: { type: string; message?: string; code?: string }): string {
  // Handle specific Stripe error types
  switch (error.type) {
    case 'card_error':
      return getCardErrorMessage(error.code, error.message);
    case 'validation_error':
      return error.message || 'Datele introduse nu sunt valide. Verifică și încearcă din nou.';
    case 'api_error':
      return 'Serviciul de plăți nu este disponibil momentan. Te rugăm să încerci mai târziu.';
    case 'authentication_error':
    case 'rate_limit_error':
      return 'A apărut o eroare. Te rugăm să încerci din nou.';
    default:
      return error.message || 'A apărut o eroare la procesarea plății.';
  }
}

function getCardErrorMessage(code?: string, fallback?: string): string {
  const messages: Record<string, string> = {
    card_declined: 'Cardul a fost refuzat. Te rugăm să folosești alt card.',
    insufficient_funds: 'Fonduri insuficiente. Te rugăm să folosești alt card.',
    expired_card: 'Cardul a expirat. Te rugăm să folosești alt card.',
    incorrect_cvc: 'Codul CVC este incorect. Verifică și încearcă din nou.',
    incorrect_number: 'Numărul cardului este incorect. Verifică și încearcă din nou.',
    processing_error: 'A apărut o eroare la procesare. Te rugăm să încerci din nou.',
    invalid_expiry_year: 'Anul de expirare este invalid.',
    invalid_expiry_month: 'Luna de expirare este invalidă.',
  };

  return messages[code || ''] || fallback || 'Plata nu a putut fi procesată. Te rugăm să încerci din nou.';
}
