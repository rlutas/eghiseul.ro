import Image from 'next/image';
import Link from 'next/link';
import { HeaderCazierFiscal } from '@/components/cazierfiscal/header';
import { Card, Eyebrow, H2, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalBreadcrumb, cazierFiscalOrganizationNode, cazierFiscalWebsiteNode } from '@/lib/seo/cazierfiscal-schema';
import { BRANDS } from '@/lib/brand/brands';
import { SUPPORT_HOURS_SHORT } from '@/config/contact';
import { CAZIERFISCAL_INDEXABLE, CAZIERFISCAL_ORDER_HREF } from '@/config/cazierfiscal-nav';
import { LAWYER } from '@/lib/documentero/content';

const PATH = '/despre/';
const brand = BRANDS.cazierfiscal;

export const metadata = buildPageMetadata({
  brand: 'cazierfiscal',
  title: 'Despre noi: cine obține cazierul fiscal pentru tine',
  description:
    'cazierfiscal.com obține certificatul de cazier fiscal pentru persoane fizice, fără cont SPV. Cererea la ANAF o depune avocat Tarța Ana Gabriela, Baroul Satu Mare.',
  path: PATH,
  noindex: !CAZIERFISCAL_INDEXABLE,
});

export default function DesprePage() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      cazierFiscalOrganizationNode(),
      cazierFiscalWebsiteNode(),
      cazierFiscalBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Despre noi', path: PATH }], PATH),
      {
        '@type': 'Person',
        '@id': `${brand.baseUrl}${PATH}#avocat`,
        name: LAWYER.name,
        jobTitle: 'Avocat',
        affiliation: { '@type': 'Organization', name: 'Baroul Satu Mare' },
        url: LAWYER.site,
        image: `${brand.baseUrl}${LAWYER.photo}`,
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderCazierFiscal active={PATH} />
      <main id="main-content">
        <Section reveal={false} className="mt-12 flex flex-col gap-5 lg:mt-20">
          <Eyebrow>Despre noi</Eyebrow>
          <h1 className="m-0 max-w-[880px] text-[36px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[52px]">
            Un singur document, făcut bine: cazierul fiscal.
          </h1>
          <p className="m-0 max-w-[760px] text-[17px] leading-[1.6] text-d-muted sm:text-[18px]">
            cazierfiscal.com e un serviciu privat din Satu Mare. Din 2023 obținem
            documente de la instituțiile din România pentru oameni care nu au timp de ghișeu sau nu au cont SPV. Aici
            facem un singur lucru: cazierul fiscal pentru persoane fizice.
          </p>
        </Section>

        <Section className="mt-20 grid gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Eyebrow>Cine depune cererea</Eyebrow>
            <H2 className="sm:text-[34px]">Un avocat, cu împuternicire, nu un formular trimis în gol.</H2>
            <p className="m-0 text-[16px] leading-[1.65] text-d-body">
              Cererea de eliberare a certificatului de cazier fiscal o depune la ANAF avocatul nostru partener, pe baza
              împuternicirii avocațiale pe care o semnezi pe telefon, în formularul de comandă. Fiecare împuternicire și
              fiecare contract de asistență primesc un număr din registrul cabinetului.
            </p>
          </div>
          <Card className="flex flex-col gap-5 p-6 sm:flex-row lg:col-span-7">
            <Image src={LAWYER.photo} alt={`${LAWYER.name}, avocat`} width={1200} height={1800} className="h-[300px] w-full rounded-2xl object-cover object-top sm:w-[220px]" sizes="220px" />
            <div className="flex flex-col gap-2">
              <span className="text-[22px] font-bold tracking-[-0.02em]">{LAWYER.name}</span>
              <span className="text-[14px] text-d-muted">{LAWYER.title} · {LAWYER.experience}</span>
              <p className="m-0 text-[15px] leading-[1.6] text-d-body">
                Cabinet individual în Satu Mare ({LAWYER.office}). Depune cererile clienților cazierfiscal.com pe bază
                de împuternicire avocațială.
              </p>
              <a href={LAWYER.site} target="_blank" rel="noopener" className="mt-1 text-[14px] font-semibold text-d-ink underline decoration-d-acc underline-offset-2">avocat-tarta.ro</a>
            </div>
          </Card>
        </Section>

        <Section className="mt-20 grid gap-5 md:grid-cols-3">
          {[
            ['Ce nu suntem', 'Nu suntem ANAF și nu lucrăm pentru ANAF. Certificatul îl eliberează doar ANAF, iar tu îl poți cere și singur, gratuit.'],
            ['Ce facem', 'Ne ocupăm de cerere, de drum și de ridicare. Îți trimitem certificatul scanat pe email, iar originalul prin curier, dacă îl vrei.'],
            ['Cum ne găsești', `Prin formularul de contact; răspundem pe email. ${SUPPORT_HOURS_SHORT}.`],
          ].map(([t, d]) => (
            <Card key={t} className="flex flex-col gap-2.5 rounded-2xl p-6">
              <span className="text-[18px] font-bold">{t}</span>
              <span className="text-[15px] leading-[1.55] text-d-muted">{d}</span>
            </Card>
          ))}
        </Section>

        <Section className="mt-20 flex flex-col items-start gap-4">
          <H2 className="sm:text-[32px]">Ai nevoie de cazierul fiscal?</H2>
          <div className="flex flex-wrap gap-3">
            <Link href={CAZIERFISCAL_ORDER_HREF} className="inline-flex h-14 items-center rounded-xl bg-d-acc px-6 text-[17px] font-bold text-d-ink hover:opacity-90">Comandă cazierul fiscal</Link>
            <Link href="/contact/" className="inline-flex h-14 items-center rounded-xl border-[1.5px] border-d-line bg-d-card px-6 text-[17px] font-semibold text-d-ink">Întreabă-ne întâi</Link>
          </div>
        </Section>
      </main>
    </>
  );
}
