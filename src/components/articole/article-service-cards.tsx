import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, FileText } from 'lucide-react';
import type { GuideLink, ServiceCard } from '@/lib/articles/service-cards';
import { fmtPrice } from '@/lib/articles/service-cards';
import { TrackedLink } from './tracked-link';

/**
 * The whole document, never cropped: specimens are A4 portrait, so the frame
 * keeps the A4 ratio and the image is contained, not covered.
 */
export function DocumentThumb({
  card,
  sizes,
  className = '',
}: {
  card: Pick<ServiceCard, 'image' | 'label'>;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[1/1.414] w-full overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm ${className}`}
    >
      {card.image ? (
        <Image src={card.image.src} alt={card.image.alt} fill sizes={sizes} className="object-contain" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-primary-50 p-2 text-center">
          <FileText className="h-6 w-6 text-primary-700" aria-hidden="true" />
          <span className="text-[10px] font-semibold leading-tight text-primary-900">{card.label}</span>
        </div>
      )}
    </div>
  );
}

export function PriceLine({ card, dark = false }: { card: ServiceCard; dark?: boolean }) {
  return (
    <span className="flex flex-col leading-tight">
      <span className={`text-lg font-black ${dark ? 'text-white' : 'text-secondary-900'}`}>
        {fmtPrice(card.priceExVat)}{' '}
        <span className={`text-xs font-semibold ${dark ? 'text-white/60' : 'text-neutral-500'}`}>lei + TVA</span>
      </span>
      <span className={`text-[11px] ${dark ? 'text-white/60' : 'text-neutral-500'}`}>
        {fmtPrice(card.priceWithVat)} lei cu TVA
      </span>
    </span>
  );
}

/**
 * Bottom band on articles: services as products (document, price, term,
 * order button) on a navy band, so it no longer blends into the FAQ below.
 * Non-service links (guides, calculators) follow as a short "Citește și" list.
 */
export function ArticleServiceCards({ cards, guides }: { cards: ServiceCard[]; guides: GuideLink[] }) {
  if (cards.length === 0 && guides.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-secondary-900 to-[#0C1A2F] py-12 lg:py-16" aria-labelledby="servicii-legate">
      <div className="container mx-auto max-w-[1000px] px-4">
        {cards.length > 0 && (
          <>
            <h2 id="servicii-legate" className="text-balance text-center text-2xl font-extrabold text-white sm:text-3xl">
              Documentele de care ai nevoie
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-white/70">
              Le obținem noi de la instituție și ți le trimitem pe email, fără drumuri la ghișeu.
            </p>
            <div className={`mt-8 grid gap-4 ${cards.length > 1 ? 'md:grid-cols-2' : 'mx-auto max-w-lg'}`}>
              {cards.map((card) => (
                <div
                  key={card.slug}
                  className="grid grid-cols-[96px_1fr] gap-4 rounded-2xl bg-white p-4 shadow-lg sm:grid-cols-[112px_1fr]"
                >
                  <DocumentThumb card={card} sizes="112px" />
                  <div className="flex min-w-0 flex-col">
                    <h3 className="text-base font-bold leading-snug text-secondary-900">{card.label}</h3>
                    <p className="mt-1 text-sm leading-snug text-neutral-600">{card.desc}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-500">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {card.term}
                    </p>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                      <PriceLine card={card} />
                      <TrackedLink
                        href={card.href}
                        placement="band"
                        service={card.slug}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-bold text-secondary-900 transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
                      >
                        Comandă
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </TrackedLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {guides.length > 0 && (
          <div className={cards.length > 0 ? 'mt-10' : ''}>
            <h2
              id={cards.length > 0 ? undefined : 'servicii-legate'}
              className="text-sm font-semibold uppercase tracking-wider text-primary-500"
            >
              Citește și
            </h2>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {guides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-primary-500/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold text-white group-hover:text-primary-500">{g.label}</span>
                      <span className="block text-sm text-white/65">{g.desc}</span>
                    </span>
                    <ArrowRight className="ml-auto mt-1 h-4 w-4 flex-shrink-0 text-white/50" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/** Desktop rail (xl+): stays in view while the article is read. */
export function ArticleRailCard({ card }: { card: ServiceCard }) {
  return (
    <div className="sticky top-28 rounded-2xl border border-primary-200 bg-primary-50 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-800">Ai nevoie de document?</p>
      <div className="mx-auto mt-3 w-40">
        <DocumentThumb card={card} sizes="160px" />
      </div>
      <h2 className="mt-3 text-base font-bold leading-snug text-secondary-900">{card.label}</h2>
      <p className="mt-1 text-sm leading-snug text-neutral-600">{card.desc}</p>
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-500">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {card.term}
      </p>
      <div className="mt-3">
        <PriceLine card={card} />
      </div>
      <TrackedLink
        href={card.href}
        placement="rail"
        service={card.slug}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-bold text-secondary-900 transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
      >
        Comandă
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </TrackedLink>
    </div>
  );
}

/** In-text box, placed by hand where the article names the need. */
export function ArticleInlineCta({ card, title, text }: { card: ServiceCard; title: string; text: string }) {
  return (
    <aside className="not-prose my-8 grid grid-cols-[72px_1fr] items-center gap-4 rounded-2xl border border-primary-200 bg-primary-50 p-4 sm:grid-cols-[72px_1fr_auto]">
      <DocumentThumb card={card} sizes="72px" />
      <div className="min-w-0">
        <p className="font-bold leading-snug text-secondary-900">{title}</p>
        <p className="mt-1 text-sm leading-snug text-neutral-600">{text}</p>
        <p className="mt-1 text-xs text-neutral-500">
          {fmtPrice(card.priceExVat)} lei + TVA · {card.term}
        </p>
      </div>
      <TrackedLink
        href={card.href}
        placement="inline"
        service={card.slug}
        className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-bold text-secondary-900 transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 sm:col-span-1"
      >
        Comandă
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </TrackedLink>
    </aside>
  );
}
