import Link from 'next/link';
import { HeaderCazierFiscal } from '@/components/cazierfiscal/header';
import { Card, Eyebrow, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalBreadcrumb, cazierFiscalOrganizationNode, cazierFiscalWebsiteNode } from '@/lib/seo/cazierfiscal-schema';
import { CAZIERFISCAL_GUIDES, CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

const PATH = '/ghiduri/';

export const metadata = buildPageMetadata({
  brand: 'cazierfiscal',
  title: 'Ghiduri despre cazierul fiscal',
  description: 'Răspunsuri scurte și verificate despre cazierul fiscal: ce arată, cât e valabil, cum îl obții din SPV, de la ghișeu sau prin avocat.',
  path: PATH,
  noindex: !CAZIERFISCAL_INDEXABLE || CAZIERFISCAL_GUIDES.length === 0,
});

/** Guide index. One guide per week at most (content rules §2); empty at launch. */
export default function GhiduriPage() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [cazierFiscalOrganizationNode(), cazierFiscalWebsiteNode(), cazierFiscalBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: PATH }], PATH)],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderCazierFiscal active={PATH} />
      <main id="main-content">
        <Section reveal={false} className="mt-12 flex flex-col gap-4 lg:mt-20">
          <Eyebrow>Ghiduri</Eyebrow>
          <h1 className="m-0 text-[36px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[52px]">Despre cazierul fiscal, pe scurt.</h1>
        </Section>
        <Section className="mt-10 grid gap-5 md:grid-cols-2">
          {CAZIERFISCAL_GUIDES.length === 0 ? (
            <Card className="flex flex-col gap-2 p-6 md:col-span-2">
              <span className="text-[18px] font-bold">Primul ghid apare în curând.</span>
              <span className="text-[15px] text-d-muted">
                Până atunci, răspunsurile la cele mai frecvente întrebări sunt pe <Link href="/#intrebari" className="font-semibold text-d-ink underline decoration-d-acc underline-offset-2">pagina principală</Link>.
              </span>
            </Card>
          ) : (
            CAZIERFISCAL_GUIDES.map((g) => (
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
