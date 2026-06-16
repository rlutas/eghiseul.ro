import { REVIEWS, type Review } from '@/config/reviews';
import { GOOGLE_REVIEWS_URL, GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from '@/config/contact';
import { ExternalLink } from 'lucide-react';

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

function Stars({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`${className} text-[#FBBC04] fill-[#FBBC04]`} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-green-600', 'bg-rose-500', 'bg-amber-500', 'bg-purple-500', 'bg-teal-600', 'bg-indigo-500'];

function ReviewCard({ r, i }: { r: Review; i: number }) {
  return (
    <figure className="flex w-[300px] sm:w-[340px] flex-shrink-0 flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Stars />
        <GoogleG className="h-5 w-5" />
      </div>
      <blockquote className="text-sm text-neutral-700 leading-relaxed flex-1 line-clamp-6">“{r.text}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3 pt-4 border-t border-neutral-100">
        <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
          {r.name.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-secondary-900 truncate">{r.name}</span>
          <span className="block text-xs text-neutral-500">{r.when}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Real Google reviews — auto-scrolling marquee (pauses on hover, manual scroll on
 * reduced-motion). The track duplicates the list for a seamless loop.
 */
export function ReviewsSection() {
  const fmtRating = GOOGLE_RATING.toString().replace('.', ',');
  const track = [...REVIEWS, ...REVIEWS];
  return (
    <section className="py-12 lg:py-20 bg-neutral-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            <GoogleG className="h-4 w-4" /> Recenzii Google
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Ce spun clienții despre eGhișeul</h2>
          <div className="inline-flex items-center gap-2 text-secondary-700">
            <span className="text-2xl font-black text-secondary-900">{fmtRating}</span>
            <Stars className="w-5 h-5" />
            <span className="text-sm text-neutral-500">· {GOOGLE_REVIEW_COUNT} de recenzii</span>
          </div>
        </div>
      </div>

      {/* Marquee — full-bleed, fades on the edges */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-neutral-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-neutral-50 to-transparent" />
        <div className="group flex overflow-x-auto motion-reduce:overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-5 w-max animate-[marquee_70s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none px-4">
            {track.map((r, i) => (
              <ReviewCard key={i} r={r} i={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="mt-10 text-center">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-secondary-800 hover:border-primary-400 hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <GoogleG className="h-4 w-4" />
            Vezi toate cele {GOOGLE_REVIEW_COUNT} de recenzii pe Google
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
