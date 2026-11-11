import Link from 'next/link';
import { HeaderConstatator } from '@/components/constatator/header';
import { Card, Check, Eyebrow, H2, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorBreadcrumb, constatatorOrganizationNode, constatatorWebsiteNode } from '@/lib/seo/constatator-schema';
import { SUPPORT_HOURS_SHORT } from '@/config/contact';
import { CONSTATATOR_INDEXABLE, CONSTATATOR_ORDER_HREF } from '@/config/constatator-nav';

const PATH = '/despre/';

export const metadata = buildPageMetadata({
  brand: 'constatator',
  title: 'Despre noi: cine îți obține certificatul constatator',
  description:
    'Constatator Express e un serviciu privat care obține certificatul constatator de la ONRC pentru firme, PFA și persoane fizice, cu taxa inclusă și livrare pe email.',
  path: PATH,
  noindex: !CONSTATATOR_INDEXABLE,
});

export default function DesprePage() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      constatatorOrganizationNode(),
      constatatorWebsiteNode(),
      constatatorBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Despre noi', path: PATH }], PATH),
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderConstatator active={PATH} />
      <main id="main-content">
        <Section reveal={false} className="mt-12 flex flex-col gap-5 lg:mt-20">
          <Eyebrow>Despre noi</Eyebrow>
          <h1 className="m-0 max-w-[880px] text-[36px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[52px]">
            Un singur document: certificatul constatator.
          </h1>
          <p className="m-0 max-w-[760px] text-[17px] leading-[1.6] text-d-muted sm:text-[18px]">
            Constatator Express e un serviciu privat din Satu Mare. Din 2023 obținem documente de la instituțiile din
            România pentru oameni și firme care nu au timp de ghișeu sau de conturi pe portaluri. Aici facem un singur
            lucru: certificatul constatator de la Registrul Comerțului.
          </p>
        </Section>

        <Section className="mt-20 grid gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <Eyebrow>Cum lucrăm</Eyebrow>
            <H2 className="sm:text-[34px]">Cererea pleacă automat, iar noi urmărim fiecare comandă.</H2>
            <p className="m-0 text-[16px] leading-[1.65] text-d-body">
              După plată, cererea ajunge la ONRC fără intervenție manuală, cu scopul ales de tine. Certificatul emis de
              ONRC îl trimitem pe email așa cum vine, ca PDF semnat electronic. Când portalul ONRC nu răspunde sau
              cererea are nevoie de o verificare, un om din echipă preia comanda și îți scrie.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5 lg:col-start-8">
            <Eyebrow>Ce primești</Eyebrow>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[16px]">
              {[
                'Certificatul emis de ONRC, nemodificat, pe email',
                'Un preț final, cu taxa ONRC și TVA-ul incluse',
                'Factură pe firma ta, pe altă firmă sau pe persoană fizică',
                'Statusul comenzii, oricând, pe pagina comenzii',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 shrink-0 text-d-ink" /><span>{t}</span></li>
              ))}
            </ul>
          </div>
        </Section>

        <Section className="mt-20 grid gap-5 md:grid-cols-3">
          {[
            ['Ce nu suntem', 'Nu suntem ONRC și nu lucrăm pentru ONRC. Certificatul îl eliberează doar Registrul Comerțului, iar tu îl poți cere și singur, plătind doar taxa.'],
            ['Ce facem', 'Depunem cererea în locul tău, plătim taxa ONRC și îți trimitem certificatul. Fără cont, fără drum la ghișeu.'],
            ['Cum ne găsești', `Prin formularul de contact; răspundem pe email. ${SUPPORT_HOURS_SHORT}.`],
          ].map(([t, d]) => (
            <Card key={t} className="flex flex-col gap-2.5 rounded-2xl p-6">
              <span className="text-[18px] font-bold">{t}</span>
              <span className="text-[15px] leading-[1.55] text-d-muted">{d}</span>
            </Card>
          ))}
        </Section>

        <Section className="mt-20 flex flex-col items-start gap-4">
          <H2 className="sm:text-[32px]">Ai nevoie de certificatul constatator?</H2>
          <div className="flex flex-wrap gap-3">
            <Link href={CONSTATATOR_ORDER_HREF} className="inline-flex h-14 items-center rounded-xl bg-d-acc px-6 text-[17px] font-bold text-d-ink hover:opacity-90">Comandă certificatul</Link>
            <Link href="/contact/" className="inline-flex h-14 items-center rounded-xl border-[1.5px] border-d-line bg-d-card px-6 text-[17px] font-semibold text-d-ink">Întreabă-ne întâi</Link>
          </div>
        </Section>
      </main>
    </>
  );
}
