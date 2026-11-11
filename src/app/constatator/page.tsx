import Link from 'next/link';
import { HeaderConstatator } from '@/components/constatator/header';
import { Arrow, Card, Check, Eyebrow, FaqList, H2, InfoTable, Section } from '@/components/documentero/ui';
import { fmtDateRo } from '@/lib/documentero/content';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorServiceGraph } from '@/lib/seo/constatator-schema';
import { lei } from '@/lib/documentero/services';
import { getConstatatorPrices } from '@/lib/constatator/pricing';
import { getDeliveryStats } from '@/lib/services/delivery-stats';
import { CONSTATATOR_INDEXABLE, CONSTATATOR_ORDER_HREF } from '@/config/constatator-nav';

export const revalidate = 3600;

const PATH = '/';
const ORDER = CONSTATATOR_ORDER_HREF;
const PUBLISHED = '2026-11-11';
const UPDATED = '2026-11-11';
/** Exact-match title: „certificat constatator online” is the top query (87k impressions on eghiseul in 16 months). */
const TITLE = 'Certificat constatator online, pe email în câteva minute';
const DESCRIPTION =
  'Certificat constatator online pentru firmă sau PFA: introduci CUI-ul, plătești 89 lei cu taxa ONRC și TVA incluse, iar PDF-ul semnat de ONRC vine pe email.';

export const metadata = buildPageMetadata({
  brand: 'constatator',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  noindex: !CONSTATATOR_INDEXABLE,
});

const ONRC_PORTAL = 'https://myportal.onrc.ro/';

const SOURCES = [
  ['Portalul de servicii online al ONRC (myportal.onrc.ro)', 'https://myportal.onrc.ro/'],
  ['Oficiul Național al Registrului Comerțului (onrc.ro)', 'https://www.onrc.ro/'],
] as const;

/** Visible on the page. No FAQPage schema: Google retired FAQ rich results on 07.05.2026. */
function faq(p: { firma: number; istoric: number }) {
  return [
    {
      q: 'Cât costă certificatul constatator online?',
      a: `${lei(p.firma)} lei în total, pentru certificatul pe firmă sau pe persoană fizică. Suma include taxa ONRC (30 lei) și TVA-ul. Varianta cu istoric costă ${lei(p.istoric)} lei, pentru că și taxa ONRC e mai mare (250 lei). Nu există taxă de urgență.`,
    },
    {
      q: 'În cât timp îl primesc?',
      a: 'Certificatul de bază pentru firmă vine de obicei în câteva minute de la plată, și noaptea, și în weekend: cererea pleacă automat spre ONRC. Certificatul pe persoană fizică și cel cu istoric le depune echipa noastră, în programul de lucru. Dacă portalul ONRC nu răspunde, ne ocupăm noi de cerere și primești certificatul pe email când îl emite ONRC, fără să faci nimic.',
    },
    {
      q: 'Sunteți ONRC?',
      a: 'Nu. Suntem un serviciu privat; datele firmei sunt în Termeni și condiții. Certificatul îl eliberează Registrul Comerțului. Noi depunem cererea în locul tău, plătim taxa și îți trimitem documentul.',
    },
    {
      q: 'Îl pot cere și singur?',
      a: 'Da. Pe portalul ONRC, cu un cont și cardul, plătești doar taxa de 30 lei. La noi nu ai nevoie de cont: introduci CUI-ul, plătești și primești PDF-ul.',
    },
    {
      q: 'Certificatul primit pe email e original?',
      a: 'Da. Este documentul emis de ONRC, în format PDF, cu semnătura electronică a Registrului Comerțului. Îl trimiți pe email sau îl încarci într-o platformă, cum ar fi SEAP. Dacă instituția cere hârtie, îl printezi; semnătura electronică se verifică doar pe fișier.',
    },
    {
      q: 'Ce e certificatul constatator extins sau detaliat?',
      a: 'Același certificat de bază. ONRC nu emite un document separat numit „extins” sau „detaliat”: așa îi spun unele bănci și instituții certificatului complet, cu sediu, asociați, administratori și activități. Dacă îți trebuie toate modificările de la înființare, alegi varianta cu istoric.',
    },
    {
      q: 'Cât timp e valabil?',
      a: 'Legea nu îi dă un termen de valabilitate: certificatul arată situația firmei din ziua emiterii. Cine ți-l cere stabilește cât de recent să fie. De obicei se acceptă un certificat emis în ultimele 30 de zile; la unele licitații termenul e mai scurt. Verifică în documentația dosarului.',
    },
    {
      q: 'Pot cere certificatul pentru o firmă care nu e a mea?',
      a: 'Da. Datele din Registrul Comerțului sunt publice, iar certificatul se poate cere pentru orice firmă, de exemplu înainte de un contract cu un partener nou.',
    },
    {
      q: 'Am PFA. Ce certificat comand?',
      a: 'Pentru PFA, întreprindere individuală sau familială se emite certificatul pe persoană fizică, pe numele titularului. Formularul îți spune asta când introduci CUI-ul unui PFA.',
    },
    {
      q: 'Am nevoie de certificat pentru un punct de lucru.',
      a: 'Punctul de lucru nu are CUI propriu. Ceri certificatul pe CUI-ul firmei; sediile secundare și punctele de lucru apar în el.',
    },
    {
      q: 'Primesc factură?',
      a: 'Da, pe email, după plată. O poți emite pe firma din certificat, pe altă firmă sau pe persoană fizică.',
    },
    {
      q: 'Ce fac dacă nu primesc emailul?',
      a: 'Uită-te întâi în Spam sau Promoții. Statusul comenzii îl vezi oricând la „Urmărește comanda”, cu numărul comenzii și emailul. Dacă ONRC nu poate emite certificatul, îți scriem noi și îți spunem ce urmează.',
    },
  ];
}

const STEPS: Array<[string, string]> = [
  ['Scrii emailul și CUI-ul', 'Emailul pe care primești certificatul, apoi CUI-ul: denumirea și starea firmei se completează singure.'],
  ['Alegi tipul și scopul', 'Pe firmă, pe persoană fizică sau cu istoric. Scopul îl alegi dintr-o listă: bancă, licitație, fonduri.'],
  ['Plătești online', 'Cu cardul. Prețul include taxa ONRC și TVA-ul. Factura vine pe email.'],
  ['Primești PDF-ul', 'Certificatul semnat electronic de ONRC, pe email. Cel de bază pentru firmă vine de obicei în câteva minute.'],
];

export default async function ConstatatorHome() {
  const [p, speed] = await Promise.all([getConstatatorPrices(), getDeliveryStats('certificat-constatator')]);
  const FAQ = faq(p);
  const speedShort = speed ? `~${speed.medianMinutes} minute` : 'câteva minute';
  const speedSentence = speed
    ? `Pe ultimele ${speed.sample} comenzi, jumătate au fost gata în cel mult ${speed.medianMinutes} minute de la plată, iar ${speed.under10Pct}% în cel mult 10 minute.`
    : 'De obicei durează câteva minute de la plată.';

  const graph = constatatorServiceGraph({
    path: PATH,
    name: 'Certificat constatator online',
    description: DESCRIPTION,
    serviceType: 'Obținere certificat constatator de la Registrul Comerțului',
    offers: [
      { name: 'Certificat constatator pe firmă', price: p.firma },
      { name: 'Certificat constatator pe persoană fizică', price: p.pf },
      { name: 'Certificat constatator cu istoric', price: p.istoric },
    ],
    datePublished: PUBLISHED,
    dateModified: UPDATED,
    breadcrumb: [{ name: 'Acasă', path: '/' }],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderConstatator active={PATH} />
      <main id="main-content">
        {/* Hero: H1 = the query; price card and order button in the first mobile screen
            (lesson from CJO, 08.10.2026: a form below the fold cut orders by two thirds). */}
        <section className="relative overflow-hidden bg-d-ink text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-d-acc/20 blur-[120px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 h-[420px] w-[420px] rounded-full bg-[#3B4AA8]/40 blur-[120px]" />
          <div className="relative mx-auto grid max-w-[1312px] gap-8 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-6 lg:px-8 lg:pb-24 lg:pt-20">
            <h1 className="m-0 text-[42px] font-bold leading-[1] tracking-[-0.04em] sm:text-[58px] lg:col-span-7 lg:row-start-1 lg:self-end lg:text-[72px]">
              Certificat constatator <span className="text-d-acc">online</span>
            </h1>

            <aside className="flex flex-col gap-4 rounded-3xl bg-d-card p-6 text-d-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-7 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-center xl:col-span-4 xl:col-start-9">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-semibold text-d-muted">Certificat constatator pe firmă</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[52px] font-extrabold leading-none tracking-[-0.05em]">{lei(p.firma)}</span>
                    <span className="text-[18px] font-bold">lei</span>
                  </div>
                </div>
                <span className="rounded-full bg-d-soft px-3 py-1 text-[12px] font-bold text-d-ink">{speedShort}</span>
              </div>
              <span className="text-[14px] text-d-muted">Taxa ONRC și TVA incluse. Fără cont, fără taxă de urgență.</span>
              <div className="h-px bg-d-line" />
              {[
                ['Pe persoană fizică', 'pentru PFA, II, IF sau o persoană', p.pf],
                ['Cu istoric', 'toate modificările de la înființare', p.istoric],
              ].map(([n, d, v]) => (
                <div key={n as string} className="flex items-center justify-between gap-3 rounded-xl border border-d-line px-3.5 py-3 text-[15px]">
                  <span className="flex flex-col">
                    <span className="font-semibold">{n}</span>
                    <span className="text-[12px] text-d-muted">{d}</span>
                  </span>
                  <span className="whitespace-nowrap font-bold">{lei(v as number)} lei</span>
                </div>
              ))}
              <Link href={ORDER} className="inline-flex h-[54px] items-center justify-center gap-2 rounded-xl bg-d-ink text-[16px] font-bold text-white hover:opacity-90">
                Începe comanda <Arrow />
              </Link>
            </aside>

            <div className="flex flex-col gap-6 lg:col-span-7 lg:row-start-2">
              <p className="m-0 max-w-[600px] text-[18px] leading-[1.55] text-white/75 sm:text-[20px]">
                Scrii emailul și CUI-ul, alegi scopul și plătești. Cererea pleacă automat la Registrul Comerțului, iar
                certificatul semnat electronic de ONRC îl primești pe email. Fără cont pe portalul ONRC.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={ORDER}
                  className="inline-flex h-14 items-center gap-2.5 rounded-xl bg-d-acc px-7 text-[17px] font-bold text-d-ink shadow-[0_12px_32px_rgba(198,244,50,0.30)] transition-transform hover:-translate-y-0.5"
                >
                  Comandă certificatul <Arrow />
                </Link>
                <span className="text-[15px] text-white/70">
                  <strong className="text-[22px] font-extrabold text-white">{lei(p.firma)} lei</strong> · și noaptea, și în weekend
                </span>
              </div>
              <ul className="m-0 grid list-none gap-3 p-0 text-[15px] text-white/80 sm:grid-cols-3">
                {['Doar cu CUI-ul', 'PDF semnat de ONRC', 'Factură pe email'].map((t) => (
                  <li key={t} className="flex items-center gap-2"><Check className="shrink-0 text-d-acc" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Section className="mt-14 lg:mt-20">
          <Card className="flex flex-col gap-3 border-l-4 border-l-d-acc p-6 sm:p-8">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Pe scurt</span>
            <p className="m-0 text-[17px] leading-[1.65] text-d-body sm:text-[19px]">
              Certificatul constatator îl eliberează Oficiul Național al Registrului Comerțului (ONRC) și arată
              situația la zi a unei firme: denumire, sediu, asociați, administratori, activități, puncte de lucru. Îl
              cer băncile, licitațiile, programele de finanțare și partenerii de afaceri. La noi costă {lei(p.firma)} lei
              cu taxa ONRC inclusă și vine pe email ca PDF semnat electronic. {speedSentence}
            </p>
            {/* No lawyer here: ONRC requests go through the bot and the team, not through a lawyer. */}
            <p className="m-0 text-[13px] text-d-muted">
              Actualizat la <time dateTime={UPDATED}>{fmtDateRo(UPDATED)}</time> · echipa Constatator Express
            </p>
          </Card>
        </Section>

        <Section id="cum-functioneaza" className="mt-24 flex scroll-mt-24 flex-col gap-8 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Cum funcționează</Eyebrow>
            <H2>Cum obții certificatul constatator online</H2>
          </div>
          <ol className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="relative flex flex-col gap-3 rounded-[20px] border border-d-line bg-d-card p-6">
                <span className="text-[44px] font-extrabold leading-none tracking-[-0.05em] text-d-ink">0{i + 1}</span>
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-[15px] leading-[1.55] text-d-muted">{d}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="preturi" className="mt-24 flex scroll-mt-24 flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Tipuri și prețuri</Eyebrow>
            <H2>Ce certificat constatator îți trebuie</H2>
            <p className="m-0 max-w-[760px] text-[17px] leading-[1.65] text-d-muted">
              Prețurile sunt finale: includ taxa ONRC și TVA-ul. Pe certificatul pe firmă alegi și scopul, iar ONRC
              emite varianta potrivită lui: de bază, pentru fonduri IMM sau pentru insolvență.
            </p>
          </div>
          <InfoTable
            head={['Certificat', 'Ce arată', 'Preț total']}
            rows={[
              ['Pe firmă', 'Situația la zi: denumire, CUI, sediu, capital, asociați, administratori, coduri CAEN, puncte de lucru', `${lei(p.firma)} lei`],
              ['Pe persoană fizică', 'În ce firme o persoană e asociat sau administrator; se emite și pentru PFA, II și IF', `${lei(p.pf)} lei`],
              ['Cu istoric', 'Raportul istoric ONRC: mențiunile din registru, de la înființare sau pe o perioadă aleasă. ONRC îl emite în cel mult 30 de zile', `${lei(p.istoric)} lei`],
            ]}
          />
          <p className="m-0 max-w-[760px] text-[15px] leading-[1.65] text-d-muted">
            „Extins” și „detaliat” nu sunt documente separate: așa îi spun unele instituții certificatului pe firmă.
            Taxa ONRC e de 30 lei pentru certificatul pe firmă sau pe persoană și de 250 lei pentru raportul istoric (Ordinul MJ 380/C/2024).
          </p>
          <div>
            <Link href={ORDER} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-d-ink px-6 text-[15px] font-bold text-white hover:opacity-90">
              Comandă · de la {lei(p.firma)} lei <Arrow />
            </Link>
          </div>
        </Section>

        <Section className="mt-24 grid gap-10 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <Eyebrow>Ce conține</Eyebrow>
            <H2>Ce scrie în certificatul constatator</H2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {[
                ['Identificarea firmei', 'denumirea, forma juridică, CUI-ul, numărul de ordine din registru, data înmatriculării.'],
                ['Sediul', 'sediul social, plus sediile secundare și punctele de lucru declarate.'],
                ['Capitalul și asociații', 'capitalul social și cine deține părțile sociale sau acțiunile.'],
                ['Conducerea', 'administratorii și reprezentanții, cu puterile și durata mandatului.'],
                ['Activitățile', 'activitatea principală și cele secundare, cu codurile CAEN.'],
                ['Starea firmei', 'în funcțiune, suspendată, în insolvență sau dizolvată, plus mențiunile despre ea.'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3 text-[16px] leading-[1.6] text-d-body">
                  <Check className="mt-1 shrink-0 text-d-ink" />
                  <span><strong className="text-d-ink">{t}:</strong> {d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5 lg:col-start-8">
            <Eyebrow>Ce nu conține</Eyebrow>
            <H2>Ce nu găsești în el</H2>
            <p className="m-0 text-[17px] leading-[1.7] text-d-body">
              Certificatul constatator nu arată datoriile la stat, bilanțul sau beneficiarii reali. Fiecare are
              documentul lui:
            </p>
            <InfoTable
              head={['Ce cauți', 'Documentul potrivit']}
              rows={[
                ['Datorii la bugetul de stat', 'certificat de atestare fiscală (ANAF)'],
                ['Fapte fiscale sancționate', 'cazier fiscal (ANAF)'],
                ['Cifra de afaceri, profitul', 'situațiile financiare depuse la ANAF'],
                ['Cine controlează firma', 'extras din registrul beneficiarilor reali (ONRC)'],
              ]}
            />
          </div>
        </Section>

        <Section className="mt-24 flex flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Pentru ce ți se cere</Eyebrow>
            <H2>Când ai nevoie de certificat constatator</H2>
            <p className="m-0 max-w-[760px] text-[17px] leading-[1.65] text-d-muted">
              Scopul îl alegi în formular și apare pe certificat. Cele mai dese:
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Bancă, credit, leasing', 'La deschiderea contului de firmă, la credit sau la un contract de leasing.'],
              ['Licitații publice', 'În dosarul de participare din SEAP/SICAP, ca dovadă că firma există și poate desfășura activitatea cerută.'],
              ['Fonduri IMM și europene', 'Pentru programele de finanțare se emite varianta pentru fonduri IMM; o alegi prin scop.'],
              ['Insolvență', 'Pentru dosarul de insolvență se emite varianta specială, tot prin alegerea scopului.'],
              ['ANAF și TVA', 'La înregistrarea în scopuri de TVA sau în Registrul Operatorilor Intracomunitari.'],
              ['Notar, vize, autorizații', 'La notar, la ambasade, la Inspectoratul pentru Imigrări sau pentru autorizații și atestări.'],
            ].map(([t, d]) => (
              <Card key={t} className="flex flex-col gap-2 p-6">
                <h3 className="m-0 text-[19px] font-bold">{t}</h3>
                <p className="m-0 text-[15px] leading-[1.6] text-d-muted">{d}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section className="mt-24 grid gap-10 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <Eyebrow>PFA și puncte de lucru</Eyebrow>
            <H2>Certificat constatator pentru PFA, II sau punct de lucru</H2>
            <p className="m-0 text-[17px] leading-[1.7] text-d-body">
              PFA-ul, întreprinderea individuală și cea familială nu sunt societăți, așa că primesc certificatul pe
              persoană fizică, pe numele titularului. Prețul e același. Când scrii CUI-ul unui PFA, formularul îți
              spune ce să alegi.
            </p>
            <p className="m-0 text-[17px] leading-[1.7] text-d-body">
              Punctul de lucru nu are CUI propriu. Comanzi certificatul pe CUI-ul firmei, iar punctele de lucru și
              sediile secundare apar în el.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5 lg:col-start-8">
            <Eyebrow>Valabilitate</Eyebrow>
            <H2>Cât este valabil certificatul constatator</H2>
            <p className="m-0 text-[17px] leading-[1.7] text-d-body">
              Legea nu îi stabilește un termen: certificatul arată firma așa cum era în ziua emiterii. Cine ți-l cere
              hotărăște cât de recent să fie. Băncile și licitațiile cer de obicei un certificat emis în ultimele 30
              de zile, uneori mai puțin. Verifică termenul în dosar și comandă-l aproape de data depunerii.
            </p>
          </div>
        </Section>

        <Section className="mt-24 flex flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Ai două variante</Eyebrow>
            <H2>De unde se scoate certificatul constatator</H2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="flex flex-col gap-3 p-6">
              <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-d-muted">Taxa ONRC, 30 lei</span>
              <h3 className="m-0 text-[20px] font-bold">Singur, de la ONRC</h3>
              <p className="m-0 text-[15px] leading-[1.6] text-d-muted">
                Pe{' '}
                <a href={ONRC_PORTAL} target="_blank" rel="nofollow noopener" className="underline underline-offset-2">portalul ONRC</a>,
                cu un cont și plata cu cardul, sau la ghișeul unui oficiu al registrului comerțului. Plătești doar taxa.
              </p>
            </Card>
            <div className="flex flex-col gap-3 rounded-[20px] bg-d-ink p-6 text-white">
              <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-d-acc">{lei(p.firma)} lei, totul inclus</span>
              <h3 className="m-0 text-[20px] font-bold">Prin noi, fără cont</h3>
              <p className="m-0 text-[15px] leading-[1.6] text-white/75">
                Când nu vrei să-ți faci cont, ai nevoie de factură pe firmă sau îți trebuie certificatul acum, de pe
                telefon. Scrii CUI-ul, plătești și primești PDF-ul pe email.
              </p>
              <Link href={ORDER} className="mt-auto inline-flex items-center gap-2 pt-2 text-[15px] font-bold text-d-acc hover:underline">
                Comandă online <Arrow />
              </Link>
            </div>
          </div>
        </Section>

        <Section id="intrebari" className="mt-24 grid scroll-mt-24 gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2>Întrebări despre certificatul constatator</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} expanded /></div>
        </Section>

        <Section className="mt-24 lg:mt-32">
          <div className="relative overflow-hidden rounded-[28px] bg-d-ink px-6 py-12 text-white sm:px-12 sm:py-14">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-d-acc/25 blur-[100px]" />
            <div className="relative flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <p className="m-0 text-[28px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[36px]">Îți trebuie certificatul acum?</p>
                <p className="m-0 text-[17px] text-white/75">{lei(p.firma)} lei cu taxa ONRC, pe email, doar cu CUI-ul firmei.</p>
              </div>
              <Link href={ORDER} className="inline-flex h-14 shrink-0 items-center gap-2.5 rounded-xl bg-d-acc px-7 text-[17px] font-bold text-d-ink hover:opacity-90">
                Comandă certificatul <Arrow />
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
