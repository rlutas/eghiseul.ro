'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { ReactNode } from 'react';

// Initialize Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  clientSecret: string;
  children: ReactNode;
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#F5A623', // primary-500
        colorBackground: '#ffffff',
        colorText: '#1a1a1a',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        borderRadius: '8px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          border: '1px solid #e5e5e5',
          boxShadow: 'none',
          padding: '12px',
        },
        '.Input:focus': {
          border: '1px solid #F5A623',
          boxShadow: '0 0 0 1px #F5A623',
        },
        '.Input--invalid': {
          border: '1px solid #dc2626',
        },
        '.Label': {
          fontWeight: '500',
          fontSize: '14px',
          marginBottom: '8px',
        },
        '.Tab': {
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
        },
        '.Tab:hover': {
          border: '1px solid #d4d4d4',
        },
        '.Tab--selected': {
          border: '1px solid #F5A623',
          backgroundColor: '#FEF7E8',
        },
      },
    },
    locale: 'ro',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
