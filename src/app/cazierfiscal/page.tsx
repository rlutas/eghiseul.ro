import Link from 'next/link';
import { HeaderCazierFiscal } from '@/components/cazierfiscal/header';
import { Arrow, Card, Check, Eyebrow, FaqList, H2, InfoTable, Section, UpdatedLine } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalServiceGraph } from '@/lib/seo/cazierfiscal-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

export const revalidate = 3600;

const PATH = '/';
const ORDER = '/comanda/cazier-fiscal/';
const PUBLISHED = '2026-11-10';
const UPDATED = '2026-11-10';
/** Short, exact-match title (Raul, 10.11.2026): the query is „cazier fiscal online”. */
const TITLE = 'Cazier fiscal online – certificat de cazier fiscal fără SPV';
const DESCRIPTION =
  'Cazier fiscal online pentru persoane fizice: completezi formularul pe telefon, avocatul depune cererea la ANAF, iar certificatul de cazier fiscal îl primești pe email. Fără cont SPV.';

export const metadata = buildPageMetadata({
  brand: 'cazierfiscal',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  noindex: !CAZIERFISCAL_INDEXABLE,
});

/** Read and checked on 10.11.2026. */
const SOURCES = [
  ['OG nr. 39/2015 privind cazierul fiscal, text consolidat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/303156'],
  ['OPANAF nr. 2594/2015: procedura și formularul de cerere (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/171984'],
  ['ANAF: înregistrarea în Spațiul Privat Virtual', 'https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inregistrare_utilizatori'],
] as const;

const ANAF_SPV = 'https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inregistrare_utilizatori';

/** Visible on the page. No FAQPage schema: Google retired FAQ rich results on 07.05.2026. */
const FAQ = [
  {
    q: 'Cum obțin cazierul fiscal online?',
    a: 'Ai două căi. Dacă ai cont în Spațiul Privat Virtual (SPV), îl ceri singur din Solicitări → Eliberare documente și îl primești gratuit, ca PDF semnat electronic. Dacă nu ai cont SPV, comanzi aici: completezi formularul pe telefon, semnezi împuternicirea, avocatul depune cererea la ANAF și primești certificatul pe email.',
  },
  {
    q: 'Sunteți ANAF?',
    a: 'Nu. cazierfiscal.com este un serviciu privat al eDigitalizare SRL. Certificatul de cazier fiscal îl eliberează numai ANAF; noi depunem cererea în numele tău, prin avocat, și ți-l trimitem.',
  },
  {
    q: 'Pot să-l iau gratuit?',
    a: 'Da. La ghișeul ANAF sau din SPV, dacă ai cont, certificatul nu costă nimic. La noi plătești avocatul, depunerea și livrarea, nu documentul.',
  },
  {
    q: 'Apar datoriile mele în cazierul fiscal?',
    a: 'Nu. Certificatul spune doar dacă ai sau nu fapte înscrise în cazierul fiscal. Datoriile la buget apar în certificatul de atestare fiscală, care este alt document.',
  },
  {
    q: 'Cât timp e valabil certificatul de cazier fiscal?',
    a: '30 de zile de la emitere și doar pentru scopul trecut în cerere (OG 39/2015, art. 9 alin. 7). Dacă îți trebuie pentru două dosare diferite, ceri două certificate.',
  },
  {
    q: 'Poate cere altcineva cazierul fiscal pentru mine?',
    a: 'Da, un împuternicit sau un avocat (OG 39/2015, art. 9 alin. 1). La noi, cererea o depune avocatul, pe baza împuternicirii avocațiale pe care o semnezi în formular.',
  },
  {
    q: 'Sunt cetățean străin. Am nevoie de el?',
    a: 'Dacă nu ești înregistrat fiscal în România, legea nu îți cere certificatul: ajunge o declarație autentică pe propria răspundere (OG 39/2015, art. 8 alin. 4). Întreabă instituția care ți-l cere înainte să comanzi.',
  },
  {
    q: 'Merge și pentru o firmă?',
    a: 'Nu. Obținem cazierul fiscal doar pentru persoane fizice. Dacă dosarul firmei cere cazierul asociatului sau al administratorului, îl comanzi pe numele lui, ca persoană fizică.',
  },
  {
    q: 'Sunt în străinătate. Se poate?',
    a: 'Da. Semnezi împuternicirea pe telefon, de oriunde, și primești certificatul scanat pe email. Originalul îl trimitem prin curier și în străinătate, cu tariful afișat înainte de plată.',
  },
];

const STEPS: Array<[string, string]> = [
  ['Completezi formularul', 'Datele tale, actul de identitate, scopul și semnătura. Câteva minute, de pe telefon.'],
  ['Plătești online', 'Cu cardul sau prin transfer bancar. Factura vine pe email.'],
  ['Avocatul depune cererea', 'La ANAF, pe baza împuternicirii avocațiale semnate în formular.'],
  ['Primești certificatul', 'Scanat pe email, în ziua în care îl ridicăm. Originalul prin curier, dacă l-ai ales.'],
];

export default async function CazierFiscalHome() {
  const p = await getServicePricing('cazier-fiscal');
  const traducere = optionPrice(p, 'traducere', 178.5);
  const apostila = optionPrice(p, 'apostila_haga', 198);
  /** ANAF issues it within 1–3 working days; there is no urgent option (inactive in DB, Raul 10.11.2026). */
  const term = '1–3 zile lucrătoare';

  const graph = cazierFiscalServiceGraph({
    path: PATH,
    name: 'Cazier fiscal online pentru persoane fizice, obținut prin avocat',
    description: DESCRIPTION,
    serviceType: 'Obținere certificat de cazier fiscal prin avocat',
    offers: [{ name: 'Cazier fiscal', price: p.basePrice }],
    datePublished: PUBLISHED,
    dateModified: UPDATED,
    breadcrumb: [{ name: 'Acasă', path: '/' }],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderCazierFiscal active={PATH} />
      <main id="main-content">
        {/* Hero: dark band, H1 = the query. CTA and price in the first mobile screen. */}
        <section className="relative overflow-hidden bg-d-ink text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-d-acc/25 blur-[120px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 h-[420px] w-[420px] rounded-full bg-[#7B3F8C]/40 blur-[120px]" />
          <div className="relative mx-auto grid max-w-[1312px] items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="flex flex-col gap-6 lg:col-span-7">
              <span className="d-rise inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-semibold text-white/80">
                <span className="h-2 w-2 rounded-full bg-d-acc" />
                Persoane fizice · serviciu privat, nu suntem ANAF
              </span>
              <h1 style={{ animationDelay: '80ms' }} className="d-rise m-0 text-[42px] font-bold leading-[1] tracking-[-0.04em] sm:text-[60px] lg:text-[72px]">
                Cazier fiscal <span className="text-d-acc">online</span>
              </h1>
              <p style={{ animationDelay: '160ms' }} className="d-rise m-0 max-w-[600px] text-[18px] leading-[1.55] text-white/75 sm:text-[20px]">
                Fără cont SPV și fără drum la ghișeu. Completezi formularul pe telefon, avocatul depune cererea la ANAF,
                iar certificatul de cazier fiscal îl primești pe email.
              </p>
              <div style={{ animationDelay: '240ms' }} className="d-rise flex flex-wrap items-center gap-3">
                <Link
                  href={ORDER}
                  className="inline-flex h-14 items-center gap-2.5 rounded-xl bg-d-acc px-7 text-[17px] font-bold text-d-ink shadow-[0_12px_32px_rgba(255,138,91,0.35)] transition-transform hover:-translate-y-0.5"
                >
                  Comandă cazierul fiscal <Arrow />
                </Link>
                <span className="text-[15px] text-white/70">
                  <strong className="text-[22px] font-extrabold text-white">{lei(p.basePrice)} lei</strong> · {term}
                </span>
              </div>
              <ul className="m-0 grid list-none gap-3 p-0 pt-2 text-[15px] text-white/80 sm:grid-cols-3">
                {['Depunere prin avocat', 'Certificatul pe email', 'Originalul prin curier'].map((t) => (
                  <li key={t} className="flex items-center gap-2"><Check className="shrink-0 text-d-acc" />{t}</li>
                ))}
              </ul>
            </div>

            <aside style={{ animationDelay: '200ms' }} className="d-rise flex flex-col gap-4 rounded-3xl bg-d-card p-6 text-d-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-7 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-semibold text-d-muted">Certificat de cazier fiscal</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[52px] font-extrabold leading-none tracking-[-0.05em]">{lei(p.basePrice)}</span>
                    <span className="text-[18px] font-bold">lei</span>
                  </div>
                </div>
                <span className="rounded-full bg-d-soft px-3 py-1 text-[12px] font-bold text-d-ink">1–3 zile</span>
              </div>
              <span className="text-[14px] text-d-muted">Onorariu avocat și TVA incluse. Vezi totalul înainte de plată.</span>
              <div className="h-px bg-d-line" />
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Opțional</span>
              {[
                ['Traducere autorizată', 'pentru un dosar în străinătate', traducere],
                ['Apostila de la Haga', 'pentru state din afara UE', apostila],
              ].map(([n, d, v]) => (
                <div key={n as string} className="flex items-center justify-between gap-3 rounded-xl border border-d-line px-3.5 py-3 text-[15px]">
                  <span className="flex flex-col">
                    <span className="font-semibold">{n}</span>
                    <span className="text-[12px] text-d-muted">{d}</span>
                  </span>
                  <span className="whitespace-nowrap font-bold">+ {lei(v as number)} lei</span>
                </div>
              ))}
              <Link href={ORDER} className="inline-flex h-[54px] items-center justify-center gap-2 rounded-xl bg-d-ink text-[16px] font-bold text-white hover:opacity-90">
                Începe comanda <Arrow />
              </Link>
            </aside>
          </div>
        </section>

        <Section className="mt-14 lg:mt-20">
          <Card className="flex flex-col gap-3 border-l-4 border-l-d-acc p-6 sm:p-8">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Pe scurt</span>
            <p className="m-0 text-[17px] leading-[1.65] text-d-body sm:text-[19px]">
              Certificatul de cazier fiscal îl eliberează ANAF, gratuit, la ghișeu sau din SPV. Arată faptele fiscale
              sancționate, nu datoriile, și e valabil 30 de zile, doar pentru scopul din cerere. Dacă nu ai cont SPV și
              nu ajungi la ghișeu, îl obținem noi online: un avocat cu împuternicire depune cererea pentru tine. Costă{' '}
              {lei(p.basePrice)} lei și durează {term}.
            </p>
            <UpdatedLine date={UPDATED} />
          </Card>
        </Section>

        <Section id="cum-functioneaza" className="mt-24 flex scroll-mt-24 flex-col gap-8 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Cum funcționează</Eyebrow>
            <H2>Cum obții cazierul fiscal online, în patru pași</H2>
          </div>
          <ol className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="relative flex flex-col gap-3 rounded-[20px] border border-d-line bg-d-card p-6">
                <span className="text-[44px] font-extrabold leading-none tracking-[-0.05em] text-d-acc">0{i + 1}</span>
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-[15px] leading-[1.55] text-d-muted">{d}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="pret" className="mt-24 grid scroll-mt-24 gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <Eyebrow>Preț</Eyebrow>
            <H2>Cât costă cazierul fiscal online</H2>
            <p className="m-0 text-[17px] leading-[1.7] text-d-body">
              Certificatul în sine e gratuit la ANAF. La noi plătești {lei(p.basePrice)} lei pentru drumul și dosarul:
              onorariul avocatului, depunerea cererii și trimiterea certificatului. Termenul e de {term}.
            </p>
            <p className="m-0 text-[17px] leading-[1.7] text-d-body">
              Dacă îți trebuie pentru un dosar în străinătate, adaugi în formular traducerea autorizată sau apostila de
              la Haga. Vezi totalul înainte să plătești.
            </p>
          </div>
          <Card className="flex flex-col gap-4 self-start p-6 sm:p-7 lg:col-span-5 lg:col-start-8">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Ce intră în preț</span>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[15px]">
              {[
                'Onorariul avocatului și împuternicirea avocațială',
                'Depunerea cererii la ANAF și ridicarea certificatului',
                'Certificatul scanat pe email; originalul prin curier, la cerere',
                'Banii înapoi dacă cererea nu se poate rezolva din vina noastră',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 shrink-0 text-d-acc" /><span>{t}</span></li>
              ))}
            </ul>
            <Link href={ORDER} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-d-acc text-[15px] font-bold text-d-ink hover:opacity-90">
              Comandă · {lei(p.basePrice)} lei <Arrow />
            </Link>
          </Card>
        </Section>

        <Section id="variante" className="mt-24 flex scroll-mt-24 flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Ai trei variante</Eyebrow>
            <H2>De unde iei cazierul fiscal: SPV, ghișeu sau prin avocat</H2>
            <p className="m-0 max-w-[760px] text-[17px] leading-[1.65] text-d-muted">Două sunt gratuite. Ți le spunem pe toate, alegi ce ți se potrivește.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Card className="flex flex-col gap-3 p-6">
              <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-d-muted">Gratuit</span>
              <h3 className="m-0 text-[20px] font-bold">Din SPV, singur</h3>
              <p className="m-0 text-[15px] leading-[1.6] text-d-muted">
                Dacă ai cont în{' '}
                <a href={ANAF_SPV} target="_blank" rel="nofollow noopener" className="underline underline-offset-2">Spațiul Privat Virtual</a>,
                ceri din Solicitări → Eliberare documente. Primești certificatul în SPV, ca PDF cu semnătura electronică a
                Ministerului Finanțelor.
              </p>
            </Card>
            <Card className="flex flex-col gap-3 p-6">
              <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-d-muted">Gratuit</span>
              <h3 className="m-0 text-[20px] font-bold">La ghișeul ANAF</h3>
              <p className="m-0 text-[15px] leading-[1.6] text-d-muted">
                La orice unitate ANAF, indiferent de domiciliu. Mergi cu actul de identitate în programul ghișeului, iar
                certificatul se eliberează pe loc.
              </p>
            </Card>
            <div className="flex flex-col gap-3 rounded-[20px] bg-d-ink p-6 text-white">
              <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-d-acc">{lei(p.basePrice)} lei</span>
              <h3 className="m-0 text-[20px] font-bold">Online, prin noi</h3>
              <p className="m-0 text-[15px] leading-[1.6] text-white/75">
                Când nu ai cont SPV, nu ai timp de ghișeu sau ești în altă țară. Semnezi pe telefon, avocatul depune
                cererea, tu primești certificatul pe email.
              </p>
              <Link href={ORDER} className="mt-auto inline-flex items-center gap-2 pt-2 text-[15px] font-bold text-d-acc hover:underline">
                Comandă online <Arrow />
              </Link>
            </div>
          </div>
        </Section>

        <Section className="mt-24 grid gap-10 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <Eyebrow>Ce arată</Eyebrow>
            <H2>Ce scrie în certificatul de cazier fiscal</H2>
            <p className="m-0 text-[17px] leading-[1.7] text-d-body">
              În cazierul fiscal se înscriu faptele sancționate contravențional sau penal prevăzute de lege, plus
              situații precum inactivitatea fiscală. Faptele sancționate doar cu avertisment nu se înscriu. Certificatul
              spune scurt dacă ai sau nu fapte înscrise.
            </p>
            <p className="m-0 text-[17px] leading-[1.7] text-d-body">
              Mulți îl confundă cu certificatul de atestare fiscală. Datoriile la buget apar în acela, nu în cazierul
              fiscal, iar certificatul de atestare fiscală nu îl obținem noi.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5 lg:col-start-8">
            <Eyebrow>Valabilitate</Eyebrow>
            <H2>Cazierul fiscal e valabil 30 de zile</H2>
            <p className="m-0 text-[17px] leading-[1.7] text-d-body">
              Certificatul e valabil 30 de zile de la emitere și doar pentru scopul pe care îl treci în cerere: angajare,
              licitație, credit sau alt dosar. Dacă îl ceri prea devreme, poate expira înainte de depunere, așa că
              comandă-l când știi data.
            </p>
          </div>
        </Section>

        <Section className="mt-24 flex flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Nu le confunda</Eyebrow>
            <H2>Cazier fiscal, atestare fiscală, cazier judiciar</H2>
          </div>
          <InfoTable
            head={['Document', 'Ce arată', 'Cine îl eliberează']}
            rows={[
              ['Certificat de cazier fiscal', 'Fapte fiscale sancționate contravențional sau penal, inactivitate fiscală', 'ANAF'],
              ['Certificat de atestare fiscală', 'Datoriile la bugetul de stat', 'ANAF'],
              ['Certificat de cazier judiciar', 'Condamnări penale', 'Poliția Română'],
            ]}
          />
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <Eyebrow>Ce îți trebuie</Eyebrow>
            <H2>Ce trimiți pentru cazierul fiscal</H2>
            <p className="m-0 text-[17px] leading-[1.7] text-d-body">
              Nu ai nevoie de cont SPV, de programare sau de cerere tipărită. Formularul îl completezi de pe telefon, în
              câteva minute, și semnezi pe ecran.
            </p>
          </div>
          <Card className="flex flex-col gap-3 p-6 sm:p-7 lg:col-span-5 lg:col-start-8">
            <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[16px]">
              {[
                'Actul de identitate, fotografiat cu telefonul',
                'Scopul pentru care îți trebuie certificatul',
                'Semnătura pe împuternicirea avocațială, direct în formular',
                'Adresa de livrare, dacă vrei și originalul',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 shrink-0 text-d-acc" /><span>{t}</span></li>
              ))}
            </ul>
          </Card>
        </Section>

        <Section id="intrebari" className="mt-24 grid scroll-mt-24 gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2>Întrebări despre cazierul fiscal</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>

        <Section className="mt-24 lg:mt-32">
          <div className="relative overflow-hidden rounded-[28px] bg-d-ink px-6 py-12 text-white sm:px-12 sm:py-14">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-d-acc/30 blur-[100px]" />
            <div className="relative flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <p className="m-0 text-[28px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[36px]">Îți trebuie cazierul fiscal?</p>
                <p className="m-0 text-[17px] text-white/75">{lei(p.basePrice)} lei, {term}, fără SPV și fără ghișeu.</p>
              </div>
              <Link href={ORDER} className="inline-flex h-14 shrink-0 items-center gap-2.5 rounded-xl bg-d-acc px-7 text-[17px] font-bold text-d-ink hover:opacity-90">
                Comandă cazierul fiscal <Arrow />
              </Link>
            </div>
          </div>
        </Section>

        <Section className="mt-16">
          <div className="flex flex-col gap-3 border-t border-d-line pt-6">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Surse oficiale</span>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px] text-d-body">
              {SOURCES.map(([label, href]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="nofollow noopener" className="underline decoration-d-acc underline-offset-2">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </main>
    </>
  );
}
