import { Star, MessageSquare, Users, PenLine, ArrowUpRight } from 'lucide-react';
import { REVIEWS } from '@/config/reviews';
import { GOOGLE_REVIEWS_URL, GOOGLE_REVIEW_WRITE_URL, GOOGLE_RATING } from '@/config/contact';

const STATS = [
  { icon: Star, value: `${GOOGLE_RATING}/5`, label: 'Rating mediu' },
  { icon: MessageSquare, value: '400+', label: 'Recenzii Google' },
  { icon: Users, value: '150k+', label: 'Clienți mulțumiți' },
];

const FEATURED = REVIEWS.slice(0, 6);

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0a1628] py-16 lg:py-20">
      {/* dot pattern */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(236,185,95,0.04) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <div className="relative container mx-auto px-4 max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-wider text-primary-500 mb-3">Recenzii clienți</p>
          <h2 className="text-3xl lg:text-[2.25rem] font-extrabold text-white leading-tight mb-4">Ce spun clienții noștri</h2>
          <p className="text-lg text-white/70 leading-relaxed max-w-[600px] mx-auto">
            Peste 150.000 de români ne-au acordat încrederea pentru obținerea documentelor. Iată ce spun
            despre experiența lor.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 sm:gap-10 mt-8">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-4 sm:gap-10">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                  <span className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary-500/10">
                    <s.icon className="h-4 w-4 sm:h-6 sm:w-6 text-primary-500" aria-hidden="true" />
                  </span>
                  <span>
                    <strong className="block text-base sm:text-[22px] font-extrabold text-white leading-none">{s.value}</strong>
                    <span className="text-[10px] sm:text-[13px] text-white/60">{s.label}</span>
                  </span>
                </div>
                {i < STATS.length - 1 && <span className="h-9 sm:h-10 w-px bg-white/15" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED.map((r) => (
            <div
              key={r.name + r.when}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-6 hover:border-primary-500/30 hover:bg-white/[0.08] transition-all duration-300"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary-500 text-primary-500" aria-hidden="true" />
                ))}
              </div>
              <p className="flex-1 text-[15px] leading-relaxed text-white/85 mb-5">„{r.text}”</p>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-bold text-primary-400">
                  {initials(r.name)}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-sm font-semibold text-white">{r.name}</strong>
                  <span className="text-xs text-white/50">{r.when} · Google</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 border-t border-white/10 pt-10 text-center">
          <p className="text-white/70 mb-6">Vrei să vezi toate recenziile sau să lași propria părere?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={GOOGLE_REVIEW_WRITE_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-primary-500 px-8 py-4 font-bold text-secondary-900 hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(236,185,95,0.3)] transition-all"
            >
              <PenLine className="h-[18px] w-[18px]" aria-hidden="true" /> Lasă o recenzie pe Google
            </a>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl border-2 border-white/30 px-8 py-4 font-bold text-white hover:bg-white/10 hover:border-white/50 transition-all"
            >
              Vezi toate recenziile <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
