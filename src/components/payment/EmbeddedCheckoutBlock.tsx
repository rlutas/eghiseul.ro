'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Single stripePromise across the app — Stripe.js docs require this so the
// script is only loaded once.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface EmbeddedCheckoutBlockProps {
  /**
   * The client_secret returned by `stripe.checkout.sessions.create({ ui_mode: 'embedded' })`.
   * Different from a PaymentIntent's client_secret — EmbeddedCheckoutProvider
   * expects the Session variant. Server route already returns the right one.
   */
  clientSecret: string;
}

/**
 * Inline Stripe Embedded Checkout. Replaces the old Elements + PaymentElement
 * combo so the Stripe Dashboard shows individual line items (base service +
 * each addon + delivery + coupon discount) instead of one lump charge.
 *
 * UX stays inline — Stripe renders the form in an iframe on our page.
 * After payment, Stripe redirects to the `return_url` configured server-side
 * (currently `/comanda/success/[orderId]?session_id={CHECKOUT_SESSION_ID}`).
 */
export function EmbeddedCheckoutBlock({ clientSecret }: EmbeddedCheckoutBlockProps) {
  const [error, setError] = useState<string | null>(null);
  // Track readiness so we can hide the skeleton once the iframe mounts.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // EmbeddedCheckout takes a moment to instantiate; flip the loader after
    // the next tick so a momentarily-empty container doesn't flash.
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Lipsește client_secret pentru sesiunea de plată.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
        {!ready && (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Se încarcă formularul de plată…
          </div>
        )}
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            clientSecret,
            onComplete: () => {
              // Server-side `return_url` handles success navigation; the
              // hook here just clears any stale error state and keeps the
              // iframe focused.
              setError(null);
            },
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
        <Lock className="h-3 w-3" />
        <span>Plată securizată prin Stripe · SSL 256-bit</span>
      </div>

      <p className="text-[11px] leading-relaxed text-center text-neutral-500">
        Prin finalizarea plății confirmi că ai citit{' '}
        <a href="/termeni" target="_blank" rel="noopener" className="underline hover:text-primary-600">
          Termenii și Condițiile
        </a>
        {' '}și{' '}
        <a href="/confidentialitate" target="_blank" rel="noopener" className="underline hover:text-primary-600">
          Politica de Confidențialitate
        </a>
        , și soliciți executarea imediată a serviciului — renunțând la dreptul de retragere de 14 zile (OUG 34/2014, art. 16 lit. a). Semnătura electronică aplicată anterior are valoare juridică conform Legii nr. 214/2024 și Regulamentului UE 910/2014 (eIDAS).
      </p>
    </div>
  );
}
