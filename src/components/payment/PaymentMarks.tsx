/**
 * Accepted-payment marks for the checkout: Visa, Mastercard, Apple Pay,
 * Google Pay — the same artwork as the site footer
 * (`/images/footer/payment-methods.webp`), so the logos are the real ones and
 * identical everywhere. The strip was drawn for the dark footer; the soft
 * shadow gives its white chips an edge on a light card.
 */
import { cn } from '@/lib/utils';

export function PaymentMarks({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/footer/payment-methods.webp"
      alt="Acceptăm Visa, Mastercard, Apple Pay și Google Pay"
      width={900}
      height={172}
      className={cn('h-8 w-auto drop-shadow-[0_0_1px_rgba(15,23,42,0.35)]', className)}
    />
  );
}
