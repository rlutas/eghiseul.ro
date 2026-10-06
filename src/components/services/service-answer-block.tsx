import type { ReactNode } from 'react';

/**
 * „Pe scurt" block at the top of a service page: a direct answer in plain
 * text (who issues the document, what we do, price, term), right under the
 * hero. Written per service, never shared copy: AI assistants and Google's
 * AI features quote short, specific answers, and identical text across
 * sibling pages is what the August 2026 spam update punished.
 *
 * `updated` is the real date of the last content change on the page; the
 * same constant feeds `dateModified` in the page's JSON-LD.
 */
export interface AnswerFact {
  label: string;
  value: ReactNode;
}

function formatDateRo(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function ServiceAnswerBlock({
  children,
  facts,
  updated,
}: {
  children: ReactNode;
  facts: AnswerFact[];
  updated: string;
}) {
  return (
    <section aria-label="Pe scurt" className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4 max-w-[1100px] py-6 lg:py-8">
        <div className="rounded-2xl border border-neutral-200 border-l-4 border-l-primary-500 bg-neutral-50 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Pe scurt</p>
          <p className="text-base sm:text-lg leading-relaxed text-secondary-900">{children}</p>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl bg-white border border-neutral-200 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{f.label}</dt>
                <dd className="mt-1 text-sm font-semibold text-secondary-900">{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-neutral-500">
            Actualizat la <time dateTime={updated}>{formatDateRo(updated)}</time>
          </p>
        </div>
      </div>
    </section>
  );
}
