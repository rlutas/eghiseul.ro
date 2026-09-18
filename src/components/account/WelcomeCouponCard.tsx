'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Gift } from 'lucide-react';
import type { WelcomeCoupon } from '@/lib/coupons/welcome';

/**
 * The welcome coupon, shown in the account while it can still be used.
 *
 * The code is there to be read and copied, but the customer does not need it:
 * every service link inside the account already carries it, and the order
 * form applies it on the last step. The card says both things, in that order.
 */
export function WelcomeCouponCard({ coupon }: { coupon: WelcomeCoupon }) {
  const [copied, setCopied] = useState(false);
  const validUntil = new Date(coupon.validUntil).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Bucharest',
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard (older WebView): the code is on screen anyway.
    }
  };

  return (
    <section
      aria-labelledby="cupon-bun-venit-titlu"
      className="flex flex-col gap-3 rounded-2xl border border-primary-200 bg-primary-50/60 px-4 py-4 sm:flex-row sm:items-center sm:px-5"
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500 text-secondary-900"
      >
        <Gift className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <h2 id="cupon-bun-venit-titlu" className="text-sm font-bold text-secondary-900">
          {coupon.discountPercent}% reducere la prima comandă din cont
        </h2>
        <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
          Se aplică singur când comanzi din{' '}
          <Link href="/account/?tab=services" className="font-semibold text-secondary-900 underline">
            Ce pot comanda
          </Link>
          . Valabil până pe {validUntil}, o singură dată, doar pe contul tău.
        </p>
      </div>

      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary-300 bg-white px-4 font-mono text-sm font-bold tracking-wide text-secondary-900 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={`Copiază codul ${coupon.code}`}
      >
        {coupon.code}
        {copied ? (
          <Check className="h-4 w-4 text-green-700" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4 text-neutral-500" aria-hidden="true" />
        )}
        <span role="status" className="sr-only">
          {copied ? 'Cod copiat' : ''}
        </span>
      </button>
    </section>
  );
}
