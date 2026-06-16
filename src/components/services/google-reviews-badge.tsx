import { GOOGLE_REVIEWS_URL, GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from '@/config/contact';
import { cn } from '@/lib/utils';

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

/**
 * Google Reviews social-proof badge, linked to the public reviews page.
 * `variant="pill"` = standalone white pill (hero); `variant="bar"` = full-width
 * row for the bottom of the price card.
 */
export function GoogleReviewsBadge({
  className,
  variant = 'pill',
}: {
  className?: string;
  variant?: 'pill' | 'bar';
}) {
  const fmtRating = GOOGLE_RATING.toString().replace('.', ',');
  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Recenzii Google — ${fmtRating} din 5 din ${GOOGLE_REVIEW_COUNT}+ recenzii`}
      className={cn(
        'inline-flex items-center gap-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        variant === 'pill'
          ? 'rounded-full bg-white px-4 py-2.5 shadow-lg hover:shadow-xl'
          : 'w-full justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2.5 hover:border-neutral-300',
        className,
      )}
    >
      <GoogleG className="h-4 w-4 flex-shrink-0" />
      <span className="text-xs sm:text-sm font-semibold text-secondary-900">Google</span>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-3.5 h-3.5 text-[#FBBC04] fill-[#FBBC04]" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>
      <span className="text-xs sm:text-sm font-bold text-secondary-900">{fmtRating}</span>
      <span className="text-[10px] sm:text-xs text-neutral-500">• {GOOGLE_REVIEW_COUNT}+ recenzii</span>
    </a>
  );
}
