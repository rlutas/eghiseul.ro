import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Card, Eyebrow, H2, PhotoSlot, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroBreadcrumb, documenteroOrganizationNode, documenteroWebsiteNode } from '@/lib/seo/documentero-schema';
import { ORGANIZATION, SOCIAL_PROOF } from '@/lib/seo/constants';
import { SITE_AUTHOR } from '@/lib/seo/author';
import { BRANDS } from '@/lib/brand/brands';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';
import { LAWYER } from '@/lib/documentero/content';

const PATH = '/despre/';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: 'Despre noi: firma, avocatul și cum lucrăm',
  description: 'documentero.ro este brandul de stare civilă al eDigitalizare SRL (eghiseul.ro), Satu Mare. Cererile sunt depuse de avocat Tarța Ana Gabriela, Baroul Satu Mare.',
  path: PATH,
  noindex: !DOCUMENTERO_INDEXABLE,
});

export default function DesprePage() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      documenteroOrganizationNode(),
      documenteroWebsiteNode(),
      documenteroBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Despre noi', path: PATH }], PATH),
      {
        '@type': 'Person',
        '@id': `${BRANDS.documentero.baseUrl}${PATH}#avocat`,
        name: LAWYER.name,
        jobTitle: 'Avocat',
        affiliation: { '@type': 'Organization', name: 'Baroul Satu Mare' },
        url: LAWYER.site,
        image: `${BRANDS.documentero.baseUrl}${LAWYER.photo}`,
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero />
      <main id="main-content">
        <Section className="mt-12 grid items-center gap-10 lg:mt-20 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-6">
            <Eyebrow>Despre noi</Eyebrow>
            <h1 className="m-0 text-[36px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-[56px]">O firmă din Satu Mare, un avocat, și drumurile pe care nu le mai faci tu.</h1>
            <p className="m-0 text-[17px] leading-[1.6] text-d-muted sm:text-[18px]">
              documentero.ro este brandul de stare civilă al {ORGANIZATION.legalName}, echipa din spatele{' '}
              <a href={BRANDS.eghiseul.baseUrl} className="underline underline-offset-2">eghiseul.ro</a>. Din 2023 obținem acte de la instituțiile din România pentru oameni care nu pot sau nu vor să stea la ghișeu: peste {SOCIAL_PROOF.roundedDown} de recenzii pe Google, {SOCIAL_PROOF.ratingValue.toString().replace('.', ',')} din 5.
            </p>
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                ['2023', 'anul de la care lucrăm'],
                [`${SOCIAL_PROOF.ratingValue.toString().replace('.', ',')} / 5`, `peste ${SOCIAL_PROOF.roundedDown} de recenzii Google`],
                // Real figure: paid civil-status orders on the new platform, DB count 20.09.2026 (44 since 07.07.2026). Update by hand.
                ['40+', 'acte de stare civilă din iulie 2026'],
              ].map(([a, b]) => (
                <div key={a} className="flex flex-col gap-0.5"><span className="text-[30px] font-bold tracking-[-0.03em]">{a}</span><span className="text-[13px] text-d-muted">{b}</span></div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6">
            <PhotoSlot label="echipa eDigitalizare, la birou, Satu Mare" className="h-[320px] rounded-3xl sm:h-[460px]" />
          </div>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Cine depune</Eyebrow>
            <H2 className="sm:text-[36px]">Avocatul care semnează fiecare cerere</H2>
            <p className="m-0 text-[15px] leading-[1.6] text-d-muted">Legea 119/1996 permite avocaților să obțină acte de stare civilă pentru clienți, cu împuternicire avocațială. Fiecare cerere depusă prin documentero.ro poartă numărul ei din registrul Baroului.</p>
          </div>
          <Card className="grid gap-7 rounded-3xl p-7 sm:grid-cols-[260px_1fr] lg:col-span-8">
            <Image src={LAWYER.photo} alt={`${LAWYER.name}, avocat`} width={1200} height={1800} className="h-[340px] w-full rounded-2xl object-cover object-top sm:w-[260px]" sizes="260px" />
            <div className="flex flex-col gap-3">
              <span className="text-[24px] font-bold tracking-[-0.02em]">{LAWYER.name}</span>
              <span className="text-[14px] text-d-muted">{LAWYER.title} · {LAWYER.experience}</span>
              <p className="m-0 mt-2 text-[16px] leading-[1.6] text-d-body">
                Cabinet individual în Satu Mare ({LAWYER.office}). Depune și ridică actele de stare civilă pentru clienții documentero.ro și eghiseul.ro pe baza împuternicirii avocațiale semnate în comandă. Fiecare împuternicire și fiecare contract de asistență primesc un număr din registrul Baroului Satu Mare.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-2">
                {LAWYER.areas.map((t) => <span key={t} className="rounded-full bg-d-soft px-3 py-2 text-[13px] font-semibold">{t}</span>)}
              </div>
              <a href={LAWYER.site} target="_blank" rel="noopener" className="mt-1 text-[14px] font-semibold text-d-acc hover:underline">avocat-tarta.ro →</a>
            </div>
          </Card>
        </Section>

        <Section className="mt-24 flex flex-col gap-7 lg:mt-32">
          <H2 className="sm:text-[36px]">Cum lucrăm</H2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ['Spunem ce e realist', 'Termenul legal e 30 de zile. Nu promitem „3 zile” ca să vindem; te anunțăm la fiecare schimbare de stare.'],
              ['Nu suntem instituție', 'Certificatul îl eliberează starea civilă. Îl poți cere și singur, gratuit, la ghișeu. Noi vindem drumul și dosarul făcute corect.'],
              ['Datele tale stau la noi', 'Actul de identitate și semnătura se folosesc doar pentru cererea ta, se păstrează criptat și se șterg conform politicii de confidențialitate.'],
            ].map(([t, d]) => (
              <Card key={t} className="flex flex-col gap-2.5 rounded-2xl p-6">
                <span className="text-[19px] font-bold">{t}</span>
                <span className="text-[15px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
          <p className="m-0 max-w-[900px] text-[16px] leading-[1.7] text-d-body">
            Ce obținem: <Link href="/certificat-de-nastere/" className="font-semibold underline underline-offset-2 hover:text-d-acc">duplicatul certificatului de naștere</Link>,{' '}
            <Link href="/certificat-de-casatorie/" className="font-semibold underline underline-offset-2 hover:text-d-acc">duplicatul certificatului de căsătorie</Link>,{' '}
            <Link href="/certificat-de-celibat/" className="font-semibold underline underline-offset-2 hover:text-d-acc">certificatul de celibat</Link> și{' '}
            <Link href="/extras-multilingv/" className="font-semibold underline underline-offset-2 hover:text-d-acc">extrasele multilingve</Link> pentru UE. Procedurile, explicate pe înțeles, sunt în{' '}
            <Link href="/ghiduri/" className="font-semibold underline underline-offset-2 hover:text-d-acc">ghiduri</Link>.
          </p>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Cine scrie ghidurile</Eyebrow>
            <H2 className="sm:text-[36px]">Autorul</H2>
          </div>
          <Card className="flex flex-col gap-4 rounded-3xl p-7 sm:flex-row sm:items-center lg:col-span-8">
            <Image src={SITE_AUTHOR.photo} alt={SITE_AUTHOR.name} width={96} height={96} className="h-24 w-24 rounded-full object-cover" />
            <div className="flex flex-col gap-1.5">
              <span className="text-[22px] font-bold tracking-[-0.02em]">{SITE_AUTHOR.name}</span>
              <span className="text-[14px] text-d-muted">fondator eghiseul.ro și documentero.ro · {SITE_AUTHOR.credential}</span>
              <div className="flex gap-4 pt-1 text-[14px] font-semibold text-d-acc">
                <a href={SITE_AUTHOR.url} className="hover:underline">pagina de autor</a>
                {SITE_AUTHOR.linkedin && <a href={SITE_AUTHOR.linkedin} target="_blank" rel="noopener" className="hover:underline">LinkedIn</a>}
              </div>
            </div>
          </Card>
        </Section>

        <Section className="mt-24 grid gap-5 lg:mt-32 md:grid-cols-2">
          <Card className="flex flex-col gap-2.5 rounded-2xl p-7">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Firma</span>
            <span className="text-[20px] font-bold">{ORGANIZATION.legalName}</span>
            <span className="text-[15px] leading-[1.6] text-d-muted">CUI {ORGANIZATION.cui} · Reg. Com. {ORGANIZATION.regCom}<br />Sediul social: {ORGANIZATION.address.street}, {ORGANIZATION.address.locality}, {ORGANIZATION.address.region}</span>
          </Card>
          <Card className="flex flex-col gap-2.5 rounded-2xl p-7">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Biroul</span>
            <span className="text-[20px] font-bold">{ORGANIZATION.office.locality}</span>
            <span className="text-[15px] leading-[1.6] text-d-muted">{ORGANIZATION.office.street}, {ORGANIZATION.office.locality}<br />L–V 9–18 · {BRANDS.documentero.phoneDisplay} · <Link href="/contact/" className="underline">{BRANDS.documentero.contactEmail}</Link></span>
          </Card>
        </Section>
      </main>
    </>
  );
}
