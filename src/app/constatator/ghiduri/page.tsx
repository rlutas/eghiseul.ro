import Link from 'next/link';
import { HeaderConstatator } from '@/components/constatator/header';
import { Card, Eyebrow, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorBreadcrumb, constatatorOrganizationNode, constatatorWebsiteNode } from '@/lib/seo/constatator-schema';
import { CONSTATATOR_GUIDES, CONSTATATOR_INDEXABLE } from '@/config/constatator-nav';

const PATH = '/ghiduri/';

export const metadata = buildPageMetadata({
  brand: 'constatator',
  title: 'Ghiduri despre certificatul constatator',
  description: 'Răspunsuri scurte și verificate despre certificatul constatator: tipuri, ce conține, cât e valabil, pentru PFA, licitații și fonduri.',
  path: PATH,
  noindex: !CONSTATATOR_INDEXABLE || CONSTATATOR_GUIDES.length === 0,
});

/** Guide index. One guide per week at most (content rules §2); empty at launch. */
export default function GhiduriPage() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [constatatorOrganizationNode(), constatatorWebsiteNode(), constatatorBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: PATH }], PATH)],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderConstatator active={PATH} />
      <main id="main-content">
        <Section reveal={false} className="mt-12 flex flex-col gap-4 lg:mt-20">
          <Eyebrow>Ghiduri</Eyebrow>
          <h1 className="m-0 text-[36px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[52px]">Ghiduri despre certificatul constatator</h1>
        </Section>
        <Section className="mt-10 grid gap-5 md:grid-cols-2">
          {CONSTATATOR_GUIDES.length === 0 ? (
            <Card className="flex flex-col gap-2 p-6 md:col-span-2">
              <span className="text-[18px] font-bold">Primul ghid apare în curând.</span>
              <span className="text-[15px] text-d-muted">
                Până atunci, răspunsurile la cele mai frecvente întrebări sunt pe <Link href="/#intrebari" className="font-semibold text-d-ink underline decoration-d-acc underline-offset-2">pagina principală</Link>.
              </span>
            </Card>
          ) : (
            CONSTATATOR_GUIDES.map((g) => (
              <Link key={g.href} href={g.href} className="block">
                <Card className="flex h-full flex-col gap-2 p-6 hover:border-d-acc">
                  <span className="text-[18px] font-bold">{g.label}</span>
                  <span className="text-[15px] text-d-muted">{g.hint}</span>
                </Card>
              </Link>
            ))
          )}
        </Section>
      </main>
    </>
  );
}
