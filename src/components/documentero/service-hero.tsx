import Link from 'next/link';
import type { ReactNode } from 'react';
import { Arrow, Btn, Eyebrow } from './ui';
import { lei } from '@/lib/documentero/services';

export interface HeroOption {
  name: string;
  desc: string;
  price: number;
  /** Highlighted (pre-selected look) — e.g. the certificate bundle on the extract page. */
  featured?: boolean;
}

/**
 * The top of a documentero service page: breadcrumb, headline, two buttons,
 * three facts, an image, and the sticky price card with the optional add-ons.
 * Prices come from the DB (getServicePricing) so the card never drifts from
 * the wizard.
 */
export function ServiceHero({
  crumb,
  eyebrow,
  title,
  intro,
  orderSlug,
  cta,
  secondary,
  facts,
  media,
  priceLabel,
  price,
  options,
  optionsTitle = 'Opțional',
  note,
  anchorId,
}: {
  crumb: string;
  eyebrow: string;
  title: string;
  intro: string;
  orderSlug: string;
  cta: string;
  secondary: { label: string; href: string };
  facts: Array<[string, string]>;
  media?: ReactNode;
  priceLabel: string;
  price: number;
  options: HeroOption[];
  optionsTitle?: string;
  note: string;
  anchorId?: string;
}) {
  const orderHref = `/comanda/${orderSlug}/`;
  return (
    <section id={anchorId} className="mx-auto mt-9 flex w-full max-w-[1312px] flex-col gap-9 px-4 sm:px-6 lg:px-8">
      <nav aria-label="breadcrumb" className="flex gap-2 text-[13px] text-d-muted">
        <Link href="/" className="text-d-muted hover:text-d-ink">Acasă</Link>
        <span>/</span>
        <span className="text-d-ink">{crumb}</span>
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-7">
          <div className="d-rise"><Eyebrow>{eyebrow}</Eyebrow></div>
          <h1 style={{ animationDelay: '80ms' }} className="d-rise m-0 text-[36px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-[48px] lg:text-[56px]">{title}</h1>
          <p style={{ animationDelay: '160ms' }} className="d-rise m-0 max-w-[640px] text-[17px] leading-[1.55] text-d-muted sm:text-[19px]">{intro}</p>
          <div style={{ animationDelay: '240ms' }} className="d-rise flex flex-wrap items-center gap-3.5">
            <Btn href={orderHref}>{cta} · {lei(price)} lei</Btn>
            <Btn href={secondary.href} primary={false}>{secondary.label}</Btn>
          </div>
          <div className="grid gap-4 pt-2 sm:grid-cols-3">
            {facts.map(([a, b]) => (
              <div key={a} className="flex flex-col gap-1">
                <span className="text-[26px] font-bold tracking-[-0.03em] sm:text-[28px]">{a}</span>
                <span className="text-[13px] text-d-muted">{b}</span>
              </div>
            ))}
          </div>
          {media && <div className="mt-2 h-[240px] overflow-hidden rounded-[20px] sm:h-[300px]">{media}</div>}
        </div>
        <aside style={{ animationDelay: '200ms' }} className="d-rise flex flex-col gap-4 rounded-3xl border border-d-line bg-d-card p-7 shadow-[0_20px_50px_rgba(15,42,34,0.08)] lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9">
          <div className="flex flex-col gap-1.5">
            <span className="text-[14px] font-semibold text-d-muted">{priceLabel}</span>
            <div className="flex items-baseline gap-2"><span className="text-[52px] font-extrabold leading-none tracking-[-0.05em]">{lei(price)}</span><span className="text-[18px] font-bold">lei</span></div>
            <span className="text-[14px] text-d-muted">Onorariu avocat, taxe și TVA incluse.</span>
          </div>
          <div className="h-px bg-d-line" />
          {options.length > 0 && <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">{optionsTitle}</span>}
          {options.map((o) => (
            <div
              key={o.name}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-[15px] ${o.featured ? 'border-[1.5px] border-d-acc bg-d-soft' : 'border-d-line'}`}
            >
              <span className="flex flex-col">
                <span className="font-semibold">{o.name}</span>
                <span className="text-[12px] text-d-muted">{o.desc}</span>
              </span>
              <span className="whitespace-nowrap font-bold">+ {lei(o.price)} lei</span>
            </div>
          ))}
          <Link href={orderHref} className="inline-flex h-[54px] items-center justify-center gap-2 rounded-xl bg-d-acc text-[16px] font-bold text-d-ink hover:opacity-90">
            Începe comanda <Arrow />
          </Link>
          <p className="m-0 text-[12px] leading-[1.5] text-d-muted">{note}</p>
        </aside>
      </div>
    </section>
  );
}
