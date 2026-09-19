import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Arrow, Btn, Card, CertificateMock, Check, Eyebrow, FaqList, H2, Initials, PhoneSignatureMock, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroHomeGraph } from '@/lib/seo/documentero-schema';
import { getAllPricing, lei, optionPrice } from '@/lib/documentero/services';
import { HOME_FAQ } from '@/lib/documentero/content';
import { SOCIAL_PROOF } from '@/lib/seo/constants';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const TITLE = 'Certificat de Naștere Online, Duplicat prin Avocat — documentero.ro';
const DESCRIPTION =
  'Duplicat certificat de naștere, căsătorie, celibat sau extras multilingv, obținut de un avocat de la starea civilă și livrat prin curier, în România sau în străinătate. Fără programare, fără notar.';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: '/',
  ogImage: '/images/documentero/client-acasa-certificat.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const SITUATIONS = [
  ['L-am pierdut sau mi-a fost furat', 'Fără declarație la poliție. Se cere direct duplicatul.'],
  ['E deteriorat sau plastifiat', 'Plastifierea îl face nevalabil. Vechiul se predă la eliberare.'],
  ['Am modelul vechi', 'Pentru pașaport sau străinătate vrei modelul nou, cu CNP.'],
  ['Locuiesc în străinătate', 'Semnezi de acolo. Livrăm oriunde, opțional cu apostilă.'],
  ['Pentru copilul meu', 'Părintele cere duplicatul minorului.'],
  ['Pentru un părinte decedat', 'Pentru succesiune. Îți spunem ce document ai nevoie.'],
] as const;

export default async function DocumenteroHome() {
  const p = await getAllPricing();
  const nastere = p['certificat-nastere'];
  const casatorie = p['certificat-casatorie'];
  const celibat = p['certificat-celibat'];
  const mlN = p['extras-multilingv-certificat-nastere'];
  const mlC = p['extras-multilingv-certificat-casatorie'];
  const apostila = optionPrice(nastere, 'apostila_haga', 198);
  const traducere = optionPrice(nastere, 'traducere', 178.5);
  const extras = optionPrice(nastere, 'extras_multilingv', 398);

  const acte = [
    { k: 'Naștere', t: 'Certificat de naștere', d: 'Duplicat: pierdut, deteriorat, model vechi.', pr: nastere.basePrice, h: '/comanda/certificat-nastere/', first: true },
    { k: 'Căsătorie', t: 'Certificat de căsătorie', d: 'Duplicat, inclusiv cu mențiunea de divorț.', pr: casatorie.basePrice, h: '/certificat-de-casatorie/' },
    { k: 'Celibat', t: 'Dovadă de celibat (Anexa 9)', d: 'Pentru căsătorie sau ședere în străinătate.', pr: celibat.basePrice, h: '/certificat-de-celibat/' },
    { k: 'UE', t: 'Extras multilingv naștere', d: 'Acceptat în UE fără traducere sau apostilă.', pr: mlN.basePrice, h: '/extras-multilingv/' },
    { k: 'UE', t: 'Extras multilingv căsătorie', d: 'Formularul standard UE, Reg. 2016/1191.', pr: mlC.basePrice, h: '/extras-multilingv/#casatorie' },
  ];

  const steps = [
    { media: <PhoneSignatureMock />, e: 'Pasul 1', t: 'Completezi și semnezi pe telefon', d: 'Date, poză a actului de identitate, semnătură. Împuternicirea avocațială se generează automat, fără notar.' },
    { media: <Image src="/images/documentero/avocat-ghiseu-stare-civila.webp" alt="Avocata predă dosarul la ghișeul de stare civilă" width={1264} height={848} className="h-[200px] w-full object-cover" sizes="(min-width: 1024px) 400px, 100vw" />, e: 'Pasul 2', t: 'Avocatul depune cererea', d: 'La starea civilă care păstrează actul tău. Urmărim dosarul și te anunțăm la fiecare schimbare.' },
    { media: <Image src="/images/documentero/curier-livrare-plic.webp" alt="Curierul predă plicul la ușa blocului" width={1264} height={848} className="h-[200px] w-full object-cover" sizes="(min-width: 1024px) 400px, 100vw" />, e: 'Pasul 3', t: 'Primești originalul acasă', d: 'Scan pe email imediat ce îl ridicăm. Originalul prin curier, în România sau în străinătate.' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(documenteroHomeGraph(HOME_FAQ)) }} />
      <HeaderDocumentero active="Certificat de naștere" />
      <main id="main-content">
        {/* Hero */}
        <Section className="mt-12 grid items-center gap-10 lg:mt-[72px] lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2.5 self-start rounded-full bg-d-soft px-3.5 py-2 text-[13px] font-bold">
              <span className="h-2 w-2 rounded-full bg-d-acc" />
              Acte de stare civilă · depuse de avocat · livrate prin curier
            </div>
            <h1 className="m-0 text-[40px] font-bold leading-[1] tracking-[-0.035em] sm:text-[56px] lg:text-[64px]">
              Certificatul de naștere, de căsătorie sau de celibat, fără drum la starea civilă.
            </h1>
            <p className="m-0 max-w-[560px] text-[17px] leading-[1.55] text-d-muted sm:text-[19px]">
              Completezi în 5 minute și semnezi pe telefon. Avocatul nostru depune cererea la primăria care păstrează
              actul, iar originalul ajunge la tine prin curier, oriunde în România sau în lume. Duplicat, extras
              multilingv pentru UE sau dovadă de celibat: aceeași procedură.
            </p>
            <div className="flex flex-wrap items-center gap-3.5">
              <Btn href="#acte">Alege actul</Btn>
              <Btn href="#cum" primary={false}>Cum funcționează</Btn>
            </div>
            <div className="flex items-center gap-3.5 pt-1.5">
              <div className="flex">
                <Initials text="A" size={40} />
                <span className="-ml-3 inline-flex"><Initials text="M" tone={1} size={40} /></span>
                <span className="-ml-3 inline-flex"><Initials text="D" tone={2} size={40} /></span>
              </div>
              <span className="text-[14px] text-d-muted">
                <strong className="text-d-ink">{SOCIAL_PROOF.ratingValue.toString().replace('.', ',')} din 5</strong> · peste{' '}
                {SOCIAL_PROOF.roundedDown} de recenzii Google · eDigitalizare SRL, din 2023
              </span>
            </div>
          </div>
          <div className="relative lg:col-span-6">
            <Image
              src="/images/documentero/client-acasa-certificat.webp"
              alt="Clientă acasă, cu certificatul de naștere primit prin curier"
              width={1152}
              height={928}
              priority
              sizes="(min-width: 1024px) 640px, 100vw"
              className="h-[360px] w-full rounded-3xl object-cover sm:h-[480px] lg:h-[560px]"
            />
            <div className="absolute bottom-6 left-3 flex w-[280px] flex-col gap-2.5 rounded-2xl border border-d-line bg-d-card p-4 shadow-[0_24px_48px_rgba(0,0,0,0.12)] sm:-left-6 sm:bottom-9 sm:w-[300px] sm:p-5">
              <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.06em] text-d-muted">
                <span>Comanda E-260919</span>
                <span className="text-d-acc">livrată</span>
              </div>
              <div className="flex flex-col gap-1.5 text-[14px]">
                {['Cerere depusă de avocat', 'Certificat ridicat de la primărie', 'Predat curierului · AWB pe email'].map((t) => (
                  <div key={t} className="flex items-center gap-2"><Check className="text-d-acc" /> {t}</div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Document picker */}
        <Section id="acte" className="mt-14 flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <H2 className="sm:text-[36px]">Ce act ai nevoie?</H2>
            <span className="text-[15px] text-d-muted">Toate se obțin de la starea civilă, prin avocat, cu împuternicire semnată pe telefon.</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {acte.map((a) => (
              <Link
                key={a.t}
                href={a.h}
                className={`flex min-h-[190px] flex-col gap-2.5 rounded-2xl border-[1.5px] bg-d-card p-5 hover:border-d-acc ${a.first ? 'border-d-acc' : 'border-d-line'}`}
              >
                <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-d-acc">{a.k}</span>
                <span className="text-[18px] font-bold leading-[1.2] tracking-[-0.02em]">{a.t}</span>
                <span className="text-[13px] leading-[1.5] text-d-muted">{a.d}</span>
                <span className="mt-auto flex items-center justify-between text-[15px] font-bold">
                  <span>{lei(a.pr)} lei</span>
                  <span className="text-d-acc"><Arrow /></span>
                </span>
              </Link>
            ))}
          </div>
        </Section>

        {/* Trust strip */}
        <Section className="mt-14">
          <Card className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-7">
            {[
              ['≤ 30 zile', 'termen legal de eliberare'],
              ['Avocat în Barou', 'Legea 119/1996, art. 10'],
              ['0 lei taxă de stat', 'plătești doar serviciul'],
              ['RO + diaspora', 'curier oriunde, plată prin Stripe'],
            ].map(([a, b]) => (
              <div key={a} className="flex flex-col gap-0.5">
                <span className="text-[24px] font-bold tracking-[-0.03em] sm:text-[26px]">{a}</span>
                <span className="text-[13px] text-d-muted">{b}</span>
              </div>
            ))}
          </Card>
        </Section>

        {/* Steps */}
        <Section id="cum" className="mt-20 flex flex-col gap-8 lg:mt-[88px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <H2 className="max-w-[640px] sm:text-[44px]">Trei pași. Tu faci primul, noi restul.</H2>
            <p className="m-0 max-w-[380px] text-[16px] leading-[1.55] text-d-muted">Comanda se salvează pe măsură ce o completezi. Poți reveni oricând, de pe alt dispozitiv.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <Card key={s.t} className="flex flex-col overflow-hidden">
                <div className="h-[200px] overflow-hidden">{s.media}</div>
                <div className="flex flex-col gap-2.5 p-6">
                  <span className="text-[13px] font-bold uppercase text-d-acc">{s.e}</span>
                  <span className="text-[20px] font-bold tracking-[-0.02em]">{s.t}</span>
                  <span className="text-[15px] leading-[1.55] text-d-muted">{s.d}</span>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Dark band: what you get + price */}
        <Section className="mt-20 lg:mt-[88px]">
          <div className="grid items-center gap-8 rounded-[28px] bg-d-ink p-7 text-d-bg sm:p-10 lg:grid-cols-12 lg:p-14">
            <div className="flex flex-col gap-5 lg:col-span-6">
              <Eyebrow>Ce primești</Eyebrow>
              <h2 className="m-0 text-[32px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[40px]">Un singur preț, cu tot inclus. Fără surprize la final.</h2>
              <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[16px]">
                {['Onorariul avocatului și împuternicirea avocațială', 'Depunerea și ridicarea de la starea civilă', 'Scan pe email + originalul pe hârtie securizată', 'Factură, status în cont, TVA inclus'].map((t) => (
                  <li key={t} className="flex items-center gap-2.5"><Check className="shrink-0 text-d-acc" /> {t}</li>
                ))}
              </ul>
              <p className="m-0 text-[14px] text-d-dark-muted">
                Curierul se alege la ultimul pas. Apostila ({lei(apostila)} lei), traducerea ({lei(traducere)} lei) și extrasul multilingv ({lei(extras)} lei) sunt opționale.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-[20px] bg-d-card p-7 text-d-ink lg:col-span-5 lg:col-start-8">
              <span className="text-[14px] font-semibold text-d-muted">Duplicat certificat de naștere</span>
              <div className="flex items-baseline gap-2"><span className="text-[56px] font-extrabold leading-none tracking-[-0.05em] sm:text-[64px]">{lei(nastere.basePrice)}</span><span className="text-[20px] font-bold">lei</span></div>
              <div className="h-px bg-d-line" />
              <div className="grid grid-cols-2 gap-2.5 text-[14px]">
                {[
                  ['Căsătorie', `${lei(casatorie.basePrice)} lei`],
                  ['Celibat (Anexa 9)', `${lei(celibat.basePrice)} lei`],
                  ['Extras multilingv naștere', `${lei(mlN.basePrice)} lei`],
                  ['Extras multilingv căsătorie', `${lei(mlC.basePrice)} lei`],
                ].map(([a, b]) => (
                  <div key={a} className="flex flex-col"><span className="text-d-muted">{a}</span><span className="font-bold">{b}</span></div>
                ))}
              </div>
              <Link href="/comanda/certificat-nastere/" className="inline-flex h-[54px] items-center justify-center rounded-xl bg-d-acc text-[16px] font-bold text-d-ink hover:opacity-90">Începe comanda</Link>
            </div>
          </div>
        </Section>

        {/* Reviews — real Google reviews go here; initials, no invented faces. */}
        <Section className="mt-20 flex flex-col gap-7 lg:mt-[88px]">
          <H2>Ce spun clienții</H2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ['[Recenzie Google reală 1, cu acordul clientului]', 'A.', 'Torino, Italia · certificat de naștere', 0],
              ['[Recenzie Google reală 2]', 'M.', 'Cluj · certificat de celibat', 1],
              ['[Recenzie Google reală 3]', 'D.', 'Madrid, Spania · extras multilingv', 2],
            ].map(([t, i, s, tone]) => (
              <Card key={String(i)} className="flex flex-col gap-4 p-6">
                <div className="flex gap-0.5 text-d-acc" aria-label="5 din 5 stele">★★★★★</div>
                <blockquote className="m-0 text-[17px] leading-[1.55]">„{t}”</blockquote>
                <figcaption className="flex items-center gap-3">
                  <Initials text={String(i)} tone={tone as 0 | 1 | 2} />
                  <div className="flex flex-col"><span className="text-[14px] font-bold">[Prenume {i}]</span><span className="text-[12px] text-d-muted">{s}</span></div>
                </figcaption>
              </Card>
            ))}
          </div>
        </Section>

        {/* Situations */}
        <Section className="mt-20 grid gap-8 lg:mt-[88px] lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <H2>Oricare ar fi motivul, procedura e aceeași.</H2>
            <p className="m-0 text-[16px] leading-[1.55] text-d-muted">Din 2023, duplicatul se poate cere de la orice primărie. Noi mergem oricum acolo unde e actul.</p>
            <CertificateMock />
          </div>
          <div className="grid content-start gap-4 sm:grid-cols-2 lg:col-span-7">
            {SITUATIONS.map(([t, d]) => (
              <Link key={t} href="/ghiduri/certificat-de-nastere-pierdut/" className="flex flex-col gap-1.5 rounded-2xl border border-d-line bg-d-card p-5 hover:border-d-acc">
                <span className="text-[17px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.5] text-d-muted">{d}</span>
              </Link>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" className="mt-20 grid gap-8 lg:mt-[88px] lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Ce ne întreabă clienții înainte să comande</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={HOME_FAQ} /></div>
        </Section>
      </main>
    </>
  );
}
