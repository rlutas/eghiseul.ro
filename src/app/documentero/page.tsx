import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Arrow, Btn, Card, Check, Eyebrow, FaqList, H2, Section } from '@/components/documentero/ui';
import { ReviewersStack, ReviewsDocumentero } from '@/components/documentero/reviews';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroHomeGraph } from '@/lib/seo/documentero-schema';
import { getAllPricing, lei } from '@/lib/documentero/services';
import { HOME_FAQ, LAWYER } from '@/lib/documentero/content';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const TITLE = 'Acte de Stare Civilă Online, prin Avocat — documentero.ro';
const DESCRIPTION =
  'Certificat de naștere, de căsătorie, certificat de celibat și extrase multilingve, obținute de un avocat de la starea civilă și livrate prin curier, în România sau în străinătate. Semnezi pe telefon, fără programare, fără notar.';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: '/',
  ogImage: '/images/documentero/clienta-usa-certificat.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const WHY = [
  ['Un avocat depune, nu tu', 'Legea 119/1996 permite avocaților să ceară acte de stare civilă cu împuternicire avocațială. Semnezi pe telefon, fără notar, fără programare.'],
  ['Un preț, cu tot inclus', 'Onorariu, împuternicire, depunere, ridicare, scan pe email. Curierul îl alegi la final. Nicio taxă de stat, fiindcă nu există.'],
  ['Spunem ce e realist', 'Termenul legal e 30 de zile. Te anunțăm la fiecare schimbare de stare, nu promitem „3 zile” ca să vindem.'],
  ['Oriunde ai fi', 'Curier în România și internațional. Pentru UE, extrasul multilingv înlocuiește traducerea și apostila.'],
] as const;

export default async function DocumenteroHome() {
  const p = await getAllPricing();
  const nastere = p['certificat-nastere'];
  const casatorie = p['certificat-casatorie'];
  const celibat = p['certificat-celibat'];
  const mlN = p['extras-multilingv-certificat-nastere'];
  const mlC = p['extras-multilingv-certificat-casatorie'];

  const acte = [
    { k: 'Naștere', t: 'Certificat de naștere', d: 'Duplicat: pierdut, deteriorat, model vechi, pentru străinătate.', pr: nastere.basePrice, h: '/certificat-de-nastere/', img: '/images/documentero/clienta-usa-certificat.webp', alt: 'Clientă în ușa apartamentului, cu certificatul de naștere scos din plic' },
    { k: 'Căsătorie', t: 'Certificat de căsătorie', d: 'Duplicat, inclusiv cu mențiunea de divorț sau pentru schimbarea numelui.', pr: casatorie.basePrice, h: '/certificat-de-casatorie/', img: '/images/documentero/curier-livrare-plic.webp', alt: 'Curierul predă plicul' },
    { k: 'Celibat', t: 'Certificat de celibat (Anexa 18)', d: 'Pentru căsătorie, ședere sau notar în străinătate. Apostilă și traducere opționale.', pr: celibat.basePrice, h: '/certificat-de-celibat/', img: '/images/documentero/avocat-ghiseu-stare-civila.webp', alt: 'Avocata la ghișeul de stare civilă' },
    { k: 'UE', t: 'Extras multilingv de naștere', d: 'Formularul standard UE: acceptat fără traducere și fără apostilă în toată Uniunea.', pr: mlN.basePrice, h: '/extras-multilingv/', img: null, alt: '' },
    { k: 'UE', t: 'Extras multilingv de căsătorie', d: 'Aceeași procedură, pentru actul de căsătorie.', pr: mlC.basePrice, h: '/extras-multilingv/#casatorie', img: null, alt: '' },
  ];

  const steps = [
    { media: <Image src="/images/documentero/semnatura-pe-telefon.webp" alt="Semnătura desenată cu degetul pe telefon, la masa din bucătărie" width={1370} height={1148} className="h-[200px] w-full object-cover" sizes="(min-width: 1024px) 400px, 100vw" />, e: 'Pasul 1', t: 'Completezi și semnezi pe telefon', d: 'Date, poză a actului de identitate, semnătură. Împuternicirea avocațială se generează automat, fără notar.' },
    { media: <Image src="/images/documentero/avocat-ghiseu-stare-civila.webp" alt="Avocata predă dosarul la ghișeul de stare civilă" width={1264} height={848} className="h-[200px] w-full object-cover" sizes="(min-width: 1024px) 400px, 100vw" />, e: 'Pasul 2', t: 'Avocatul depune cererea', d: 'La starea civilă care păstrează actul tău. Urmărim dosarul și te anunțăm la fiecare schimbare.' },
    { media: <Image src="/images/documentero/curier-livrare-plic.webp" alt="Curierul predă plicul la ușa blocului" width={1264} height={848} className="h-[200px] w-full object-cover" sizes="(min-width: 1024px) 400px, 100vw" />, e: 'Pasul 3', t: 'Primești originalul acasă', d: 'Scan pe email imediat ce îl ridicăm. Originalul prin curier, în România sau în străinătate.' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(documenteroHomeGraph(HOME_FAQ)) }} />
      <HeaderDocumentero />
      <main id="main-content">
        {/* Hero: the brand promise, then the document picker right under it */}
        <Section reveal={false} className="mt-12 grid items-center gap-10 lg:mt-20 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div className="d-rise inline-flex items-center gap-2.5 self-start rounded-full bg-d-soft px-3.5 py-2 text-[13px] font-bold">
              <span className="h-2 w-2 rounded-full bg-d-acc" />
              Acte de stare civilă · depuse de avocat · livrate prin curier
            </div>
            <h1 className="d-rise m-0 text-[40px] font-bold leading-[1] tracking-[-0.035em] sm:text-[56px] lg:text-[64px]" style={{ animationDelay: '80ms' }}>
              Actele de stare civilă, obținute de un avocat și aduse la ușa ta.
            </h1>
            <p className="d-rise m-0 max-w-[560px] text-[17px] leading-[1.55] text-d-muted sm:text-[19px]" style={{ animationDelay: '160ms' }}>
              Certificat de naștere, de căsătorie, certificat de celibat sau extras multilingv pentru UE. Completezi în 5
              minute, semnezi pe telefon, avocatul nostru depune cererea la starea civilă. Originalul vine prin curier,
              oriunde în România sau în lume.
            </p>
            <div className="d-rise flex flex-wrap items-center gap-3.5" style={{ animationDelay: '240ms' }}>
              <Btn href="#acte">Alege actul</Btn>
              <Btn href="#cum" primary={false}>Cum funcționează</Btn>
            </div>
            <div className="d-rise" style={{ animationDelay: '320ms' }}><ReviewersStack /></div>
          </div>
          <div className="d-rise relative lg:col-span-6" style={{ animationDelay: '200ms' }}>
            <Image
              src="/images/documentero/clienta-usa-certificat.webp"
              alt="Clientă în ușa apartamentului, cu certificatul scos din plicul primit prin curier"
              width={1370}
              height={1148}
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

        {/* Document picker: the real navigation of the site */}
        <Section id="acte" className="mt-20 flex flex-col gap-6 lg:mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <H2 className="sm:text-[40px]">Ce act ai nevoie?</H2>
            <span className="max-w-[420px] text-[15px] text-d-muted">Toate se obțin de la starea civilă, prin avocat, cu împuternicire semnată pe telefon. Fiecare are pagina ei, cu prețul, actele și termenul.</span>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {acte.slice(0, 3).map((a) => (
              <Link key={a.t} href={a.h} className="group flex flex-col overflow-hidden rounded-[20px] border border-d-line bg-d-card transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-d-acc hover:shadow-[0_24px_48px_rgba(15,42,34,0.10)]">
                <div className="h-[180px] overflow-hidden">
                  <Image src={a.img!} alt={a.alt} width={1264} height={848} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" sizes="(min-width: 768px) 420px, 100vw" />
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-6">
                  <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-d-acc">{a.k}</span>
                  <span className="text-[20px] font-bold leading-[1.2] tracking-[-0.02em]">{a.t}</span>
                  <span className="text-[14px] leading-[1.5] text-d-muted">{a.d}</span>
                  <span className="mt-auto flex items-center justify-between pt-2 text-[16px] font-bold">
                    <span>{lei(a.pr)} lei</span>
                    <span className="text-d-acc"><Arrow /></span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {acte.slice(3).map((a) => (
              <Link key={a.t} href={a.h} className="flex items-center justify-between gap-6 rounded-[20px] border border-d-line bg-d-card p-6 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-d-acc hover:shadow-[0_24px_48px_rgba(15,42,34,0.10)]">
                <span className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-d-acc">{a.k}</span>
                  <span className="text-[18px] font-bold leading-[1.2] tracking-[-0.02em]">{a.t}</span>
                  <span className="text-[14px] leading-[1.5] text-d-muted">{a.d}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1 text-[16px] font-bold">
                  <span>{lei(a.pr)} lei</span>
                  <span className="text-d-acc"><Arrow /></span>
                </span>
              </Link>
            ))}
          </div>
        </Section>

        {/* Trust strip */}
        <Section className="mt-10">
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
        <Section id="cum" className="mt-24 flex flex-col gap-8 lg:mt-32">
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

        {/* Dark band: prices at a glance */}
        <Section className="mt-24 lg:mt-32">
          <div className="grid items-center gap-8 rounded-[28px] bg-d-ink p-7 text-d-bg sm:p-10 lg:grid-cols-12 lg:p-14">
            <div className="flex flex-col gap-5 lg:col-span-6">
              <Eyebrow>Ce primești</Eyebrow>
              <h2 className="m-0 text-[32px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[40px]">Un singur preț, cu tot inclus. Fără surprize la final.</h2>
              <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[16px]">
                {['Onorariul avocatului și împuternicirea avocațială', 'Depunerea și ridicarea de la starea civilă', 'Scan pe email + originalul pe hârtie securizată', 'Factură, status pe email și pe pagina de urmărire, TVA inclus'].map((t) => (
                  <li key={t} className="flex items-center gap-2.5"><Check className="shrink-0 text-d-acc" /> {t}</li>
                ))}
              </ul>
              <p className="m-0 text-[14px] text-d-dark-muted">Curierul se alege la ultimul pas. Apostila, traducerea și extrasul multilingv sunt opționale, cu prețul afișat pe fiecare pagină.</p>
            </div>
            <div className="flex flex-col gap-3 rounded-[20px] bg-d-card p-7 text-d-ink lg:col-span-5 lg:col-start-8">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Prețuri, TVA inclus</span>
              {[
                ['Certificat de naștere, duplicat', nastere.basePrice, '/certificat-de-nastere/'],
                ['Certificat de căsătorie, duplicat', casatorie.basePrice, '/certificat-de-casatorie/'],
                ['Certificat de celibat (Anexa 18)', celibat.basePrice, '/certificat-de-celibat/'],
                ['Extras multilingv de naștere', mlN.basePrice, '/extras-multilingv/'],
                ['Extras multilingv de căsătorie', mlC.basePrice, '/extras-multilingv/#casatorie'],
              ].map(([t, pr, h]) => (
                <Link key={String(t)} href={String(h)} className="flex items-center justify-between border-t border-d-line py-3 text-[15px] hover:text-d-acc">
                  <span className="font-semibold">{t}</span>
                  <span className="font-bold">{lei(Number(pr))} lei</span>
                </Link>
              ))}
              <Link href="#acte" className="mt-1 inline-flex h-[52px] items-center justify-center rounded-xl bg-d-acc text-[16px] font-bold text-d-ink hover:opacity-90">Alege actul</Link>
            </div>
          </div>
        </Section>

        {/* Why through a lawyer */}
        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>De ce documentero</Eyebrow>
            <H2 className="sm:text-[36px]">Serviciu privat, cu un avocat în spate și fără promisiuni goale.</H2>
            <p className="m-0 text-[15px] leading-[1.6] text-d-muted">Nu suntem instituție. Actele le poți cere și singur, gratuit, la ghișeu. Noi vindem drumul și dosarul făcute corect, de cineva care le face în fiecare zi.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            {WHY.map(([t, d]) => (
              <Card key={t} className="flex flex-col gap-2.5 rounded-2xl p-6">
                <span className="text-[19px] font-bold">{t}</span>
                <span className="text-[15px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        {/* Plain text with real links: what the site is, for people and crawlers alike */}
        <Section className="mt-24 lg:mt-32">
          <Card className="flex flex-col gap-4 p-7 lg:p-10">
            <Eyebrow>Pe scurt</Eyebrow>
            <H2 className="sm:text-[32px]">Ce facem, în trei propoziții</H2>
            <p className="m-0 max-w-[900px] text-[17px] leading-[1.7] text-d-body">
              Obținem de la oficiile de stare civilă din România{' '}
              <Link href="/certificat-de-nastere/" className="font-semibold underline underline-offset-2 hover:text-d-acc">duplicatul certificatului de naștere</Link>,{' '}
              <Link href="/certificat-de-casatorie/" className="font-semibold underline underline-offset-2 hover:text-d-acc">duplicatul certificatului de căsătorie</Link>{' '}
              (inclusiv cu mențiunea de divorț),{' '}
              <Link href="/certificat-de-celibat/" className="font-semibold underline underline-offset-2 hover:text-d-acc">certificatul de celibat</Link>{' '}
              (adeverința privind statutul civil, Anexa 18) și{' '}
              <Link href="/extras-multilingv/" className="font-semibold underline underline-offset-2 hover:text-d-acc">extrasele multilingve</Link>{' '}
              pentru Uniunea Europeană. Cererile le depune{' '}
              <Link href="/despre/" className="font-semibold underline underline-offset-2 hover:text-d-acc">av. {LAWYER.name}, Baroul Satu Mare</Link>, cu împuternicirea avocațială pe care o semnezi pe telefon, în temeiul Legii 119/1996 și al Legii 51/1995. Dacă ai pierdut certificatul, citește întâi{' '}
              <Link href="/ghiduri/certificat-de-nastere-pierdut/" className="font-semibold underline underline-offset-2 hover:text-d-acc">ce faci când ai pierdut certificatul de naștere</Link>; dacă ai nevoie de el în afara UE,{' '}
              <Link href="/ghiduri/apostila-acte-stare-civila/" className="font-semibold underline underline-offset-2 hover:text-d-acc">când e nevoie de apostilă și când nu</Link>. Toate ghidurile sunt la{' '}
              <Link href="/ghiduri/" className="font-semibold underline underline-offset-2 hover:text-d-acc">Ghiduri</Link>.
            </p>
          </Card>
        </Section>

        <ReviewsDocumentero />

        {/* FAQ */}
        <Section id="faq" className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
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
