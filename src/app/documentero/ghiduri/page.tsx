import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroBreadcrumb, documenteroOrganizationNode, documenteroWebsiteNode } from '@/lib/seo/documentero-schema';
import { GUIDES, guideHref } from '@/lib/documentero/content';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

const PATH = '/ghiduri/';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: 'Ghiduri de stare civilă: naștere, căsătorie, celibat, diaspora',
  description: 'Ce se întâmplă de fapt la ghișeul de stare civilă: duplicat, certificat pierdut, model vechi, apostilă, extras multilingv. Scrise de cei care depun dosarele.',
  path: PATH,
  noindex: !DOCUMENTERO_INDEXABLE,
});

export default function GhiduriPage() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [documenteroOrganizationNode(), documenteroWebsiteNode(), documenteroBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: PATH }], PATH)],
  };
  const published = GUIDES.filter((g) => g.published);
  const queue = GUIDES.filter((g) => !g.published);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero active="/ghiduri/" />
      <main id="main-content">
        <Section className="mt-12 flex flex-col gap-5">
          <nav aria-label="breadcrumb" className="flex gap-2 text-[13px] text-d-muted">
            <Link href="/" className="hover:text-d-ink">Acasă</Link><span>/</span><span className="text-d-ink">Ghiduri</span>
          </nav>
          <h1 className="m-0 max-w-[900px] text-[36px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-[56px]">
            Ghiduri de stare civilă, scrise de oamenii care depun dosarele.
          </h1>
          <p className="m-0 max-w-[680px] text-[17px] leading-[1.55] text-d-muted sm:text-[18px]">
            Fără copy-paste din legi. Ce se întâmplă de fapt la ghișeu, cât durează, ce te împiedică. Actualizate când se schimbă procedura.
          </p>
        </Section>

        <Section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((g) => (
            <Link key={g.slug} href={guideHref(g)} className="flex flex-col gap-2.5 rounded-2xl border border-d-line bg-d-card p-6 hover:border-d-acc">
              <div className="flex justify-between text-[12px] font-bold uppercase tracking-[0.06em] text-d-acc">
                <span>{g.category}</span><span className="text-d-muted">{g.minutes} min</span>
              </div>
              <span className="text-[20px] font-bold leading-[1.2] tracking-[-0.02em]">{g.title}</span>
              <span className="text-[14px] leading-[1.55] text-d-muted">{g.desc}</span>
            </Link>
          ))}
          {queue.map((g) => (
            <div key={g.slug} className="flex flex-col gap-2.5 rounded-2xl border border-dashed border-d-line p-6 opacity-80">
              <div className="flex justify-between text-[12px] font-bold uppercase tracking-[0.06em] text-d-muted">
                <span>{g.category}</span><span>în lucru</span>
              </div>
              <span className="text-[20px] font-bold leading-[1.2] tracking-[-0.02em]">{g.title}</span>
              <span className="text-[14px] leading-[1.55] text-d-muted">{g.desc}</span>
            </div>
          ))}
        </Section>

        <Section className="mt-16">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-d-ink p-8 text-d-bg sm:p-10">
            <div className="flex flex-col gap-2">
              <span className="text-[26px] font-bold tracking-[-0.03em] sm:text-[28px]">Nu găsești cazul tău?</span>
              <span className="text-[16px] text-d-dark-muted">Scrie-ne pe WhatsApp cu ce ți se cere și de unde. Răspundem în orele de program.</span>
            </div>
            <Link href="/contact/" className="inline-flex h-[52px] shrink-0 items-center rounded-xl bg-d-acc px-6 text-[16px] font-bold text-d-ink hover:opacity-90">Întreabă-ne</Link>
          </div>
        </Section>
      </main>
    </>
  );
}
