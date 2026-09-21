import Image from 'next/image';
import { HeaderDocumentero } from '@/components/documentero/header';
import { ServiceHero } from '@/components/documentero/service-hero';
import { ReviewsDocumentero } from '@/components/documentero/reviews';
import { Card, Check, Eyebrow, FaqList, H2, InfoTable, Prose, QuickAnswer, RelatedServices, Section, SeoBlock } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroServiceGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { LEGAL_BASIS, PROCESSING_STATS } from '@/lib/documentero/content';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const PATH = '/certificat-de-celibat/';
const TITLE = 'Certificat de Celibat Online (Anexa 18), Obținut prin Avocat';
const DESCRIPTION =
  'Certificat de celibat (adeverința privind statutul civil, Anexa 18, fosta Anexa 9) obținut de un avocat de la starea civilă, fără să vii în țară. Pentru căsătorie, ședere sau notar în străinătate. Apostilă și traducere opționale.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-09-21';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/avocat-ghiseu-stare-civila.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const WHO = [
  ['Căsătorie în străinătate', 'Italia, Spania, Germania, Franța, Marea Britanie cer dovada că nu ești căsătorit în România. Unele cer și apostilă.'],
  ['Permis de ședere sau cetățenie', 'Dosarele de reîntregire a familiei și de naturalizare cer, în multe state, starea civilă actuală.'],
  ['Notar sau bancă', 'La cumpărarea unui imobil sau la un credit în străinătate, notarul verifică regimul matrimonial.'],
  ['După divorț sau văduvie', 'Documentul atestă starea civilă actuală: „divorțat” sau „văduv” apar ca mențiuni, nu te împiedică.'],
] as const;

const NAMES = [
  ['Adeverință privind statutul civil', 'Numele oficial, din H.G. 255/2024: Anexa 18 la Normele metodologice. Așa scrie pe hârtia pe care o primești.'],
  ['Anexa 9', 'Numele vechi, din metodologia de dinainte de 2024. Multe primării și multe ghiduri încă îl folosesc; e același document.'],
  ['Dovadă de celibat', 'Cum îi spun oamenii și cum apare pe unele site-uri de primărie. Tot el.'],
  ['Certificate of no impediment, nulla osta, certificado de soltería', 'Cum îl cer autoritățile străine. Îi dai adeverința, cu apostilă și traducere dacă statul le cere.'],
] as const;

const ROUTES = [
  ['Procură la notar, în străinătate', 'Notarul din țara unde stai face procura, apoi apostilă pe ea, apoi traducere în România. Cineva din familie merge cu ea la primărie. Trei drumuri, două taxe, și tot depinzi de un om din țară.'],
  ['Procură la consulat', 'Programarea la consulat durează săptămâni în orașele mari. Procura e gratuită sau ieftină, dar tot trebuie cineva în România care să depună și să ridice.'],
  ['Împuternicire avocațială (noi)', `Semnezi pe telefon, fără notar și fără drum. Avocatul depune, ridică și trimite. Temeiul: ${LEGAL_BASIS.short}. Nu ai nevoie de nimeni în țară.`],
] as const;

const FAQ = [
  { q: 'Certificat de celibat, Anexa 9 sau adeverință privind statutul civil?', a: 'Același document. Numele legal actual este „adeverință privind statutul civil”, Anexa 18 la Normele metodologice aprobate prin H.G. 255/2024; înainte de 2024 era Anexa 9. Instituțiile străine îi spun „certificat de celibat”, „certificate of no impediment” sau „nulla osta”.' },
  { q: 'Îl pot cere de la consulat?', a: 'Da, dar consulatul îl solicită tot de la primăria din România, cu termene de 30–60 de zile. Noi mergem direct la primărie.' },
  { q: 'Am fost căsătorit și am divorțat. Îl pot obține?', a: 'Da. Documentul arată starea civilă actuală, cu mențiunea divorțului. Pentru unele state ai nevoie și de certificatul de căsătorie cu mențiunea de divorț.' },
  { q: 'Cât e valabil certificatul de celibat?', a: 'În România, 6 luni de la eliberare. Cele mai multe state UE aplică însă propria regulă și cer un document mai nou de 90 de zile la data depunerii dosarului. Comandă-l când știi data depunerii, nu „ca să-l ai”.' },
  { q: 'Cum știu ce cere statul unde mă căsătoresc?', a: 'Spune-ne țara în formular. Îți spunem dacă e nevoie de apostilă, de traducere sau de extras multilingv în locul certificatului de naștere.' },
  { q: 'Cât costă certificatul de celibat la primărie?', a: 'Nimic, sau o taxă locală de câțiva lei. La noi costă mai mult fiindcă plătești avocatul, dosarul, urmărirea și livrarea, nu documentul.' },
  { q: 'Pot cere certificatul de celibat pentru logodnicul meu?', a: 'Nu. Împuternicirea o semnează doar titularul, chiar dacă plata o faci tu. Îi trimitem linkul comenzii și semnează de pe telefonul lui.' },
  { q: 'Cât durează?', a: `Termenul legal e de cel mult 30 de zile de la depunere. La comenzile noastre din vara lui 2026, jumătate au ajuns la client în cel mult ${PROCESSING_STATS.byService['certificat-celibat'].medianDays} zile de la plată, cu curier cu tot. Apostila și traducerea, dacă le alegi, adaugă câteva zile.` },
];

export default async function CelibatPage() {
  const p = await getServicePricing('certificat-celibat');
  const apostila = optionPrice(p, 'apostila_haga', 198);
  const traducere = optionPrice(p, 'traducere', 178.5);
  const legalizare = optionPrice(p, 'legalizare', 99);
  const apostilaNotari = optionPrice(p, 'apostila_notari', 83.3);
  const stats = PROCESSING_STATS.byService['certificat-celibat'];

  const graph = documenteroServiceGraph({
    path: PATH,
    name: 'Certificat de celibat (adeverință privind statutul civil, Anexa 18)',
    description: DESCRIPTION,
    serviceType: 'Obținere acte de stare civilă prin avocat',
    offers: [
      { name: 'Certificat de celibat', price: p.basePrice },
      { name: 'Apostilă de la Haga', price: p.basePrice + apostila },
      { name: 'Apostilă + traducere autorizată', price: p.basePrice + apostila + traducere },
    ],
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Certificat de celibat', path: PATH }],
    faq: FAQ,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero active="/certificat-de-celibat/" />
      <main id="main-content">
        <ServiceHero
          crumb="Certificat de celibat"
          eyebrow="Adeverință privind statutul civil · Anexa 18 (fosta Anexa 9)"
          title="Certificat de celibat pentru căsătoria în străinătate, fără să vii în țară."
          intro="Documentul se numește oficial „adeverință privind statutul civil” (Anexa 18, până în 2024 Anexa 9) și confirmă că nu ești căsătorit în România. Îl cere primăria, notarul sau consulatul din țara unde te căsătorești. Avocatul nostru îl obține de la starea civilă și ți-l trimite oriunde ești."
          orderSlug="certificat-celibat"
          cta="Comandă certificatul"
          secondary={{ label: 'Cât e valabil', href: '#valabilitate' }}
          facts={[['6 luni', 'valabil în România'], ['90 de zile', 'cerut de majoritatea statelor UE'], ['≤ 30 de zile', 'termen legal de eliberare']]}
          media={<Image src="/images/documentero/avocat-ghiseu-stare-civila.webp" alt="Avocata depune cererea la ghișeul de stare civilă" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 760px, 100vw" />}
          priceLabel="Certificat de celibat (Anexa 18)"
          price={p.basePrice}
          optionsTitle="Opțional, pentru străinătate"
          options={[
            { name: 'Apostilă de la Haga', desc: 'Instituția Prefectului, pe original', price: apostila },
            { name: 'Traducere autorizată', desc: 'după apostilare, traducător autorizat', price: traducere },
            { name: 'Legalizare notarială', desc: 'când statul cere copie legalizată', price: legalizare },
            { name: 'Apostilă Notari', desc: 'Camera Notarilor, pentru traducere', price: apostilaNotari },
          ]}
          note="Opțiunile se aleg în formular; prețul final se vede înainte de plată. Curierul se adaugă la final."
        />

        <QuickAnswer updated={DATE_MODIFIED}>
          Certificatul de celibat este, în legea română, adeverința privind statutul civil (Anexa 18 la H.G. 255/2024, fosta Anexa 9). O eliberează oficiul de stare civilă care păstrează actul tău de naștere și confirmă că în registrele din România nu figurezi căsătorit. Cererea o poate depune titularul sau un avocat cu împuternicire avocațială ({LEGAL_BASIS.short}); nu e nevoie să vii în țară. Valabilă 6 luni în România; majoritatea statelor UE o cer mai nouă de 90 de zile. Termen legal: cel mult 30 de zile. Taxa de stat: 0 lei sau o taxă locală.
        </QuickAnswer>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Cine îl cere</Eyebrow>
            <H2 className="sm:text-[36px]">Patru situații în care ai nevoie de el</H2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            {WHO.map(([t, d]) => (
              <Card key={t} className="flex flex-col gap-2 rounded-2xl p-6">
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Un document, patru nume</Eyebrow>
            <H2 className="sm:text-[36px]">Anexa 18, Anexa 9, dovadă de celibat: e același act</H2>
            <p className="m-0 text-[15px] leading-[1.6] text-d-muted">Din 2024, metodologia de stare civilă e alta și numărul anexei s-a schimbat. Primăriile folosesc ambele nume. Pe pagina asta spunem „certificat de celibat” fiindcă așa îl cauți, dar pe hârtie scrie „adeverință privind statutul civil”.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            {NAMES.map(([t, d]) => (
              <Card key={t} className="flex flex-col gap-2 rounded-2xl p-6">
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="valabilitate" className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <Eyebrow>Valabilitate</Eyebrow>
            <H2 className="sm:text-[36px]">6 luni în România, 90 de zile în afară. Amândouă sunt adevărate.</H2>
            <Prose
              paras={[
                'Legea română dă adeverinței o valabilitate de 6 luni de la eliberare. Autoritățile străine însă aplică propria regulă: cele mai multe state UE acceptă documente de stare civilă mai noi de 90 de zile la data depunerii dosarului. Comandă-l când ai deja data depunerii, nu „ca să-l ai”.',
                'Dacă statul cere apostilă, ea se aplică de Instituția Prefectului pe originalul adeverinței. Traducerea se face după apostilare, de un traducător autorizat. Le poți alege pe amândouă în comandă, ca să primești documentul gata de folosit.',
              ]}
            />
          </div>
          <div className="flex flex-col gap-3.5 self-start rounded-[20px] bg-d-ink p-7 text-d-bg lg:col-span-4 lg:col-start-9">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-d-acc">Ce conține documentul</span>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px] leading-[1.5]">
              {['Numele, CNP-ul, data și locul nașterii', 'Starea civilă actuală, conform actului de naștere', 'Mențiunile de căsătorie sau divorț, dacă există', 'Semnătura și ștampila ofițerului de stare civilă'].map((t) => <li key={t}>{t}</li>)}
            </ul>
            <span className="text-[13px] text-d-dark-muted">Se eliberează de primăria care păstrează actul tău de naștere.</span>
          </div>
        </Section>

        <Section className="mt-24 flex flex-col gap-5 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Pe țări</Eyebrow>
            <H2 className="sm:text-[36px]">Ce cere fiecare stat de la un cetățean român care se căsătorește acolo</H2>
            <p className="m-0 max-w-[760px] text-[15px] leading-[1.6] text-d-muted">Din dosarele clienților noștri și din cerințele publicate de primăriile și oficiile respective. Cerințele se schimbă și diferă de la o comună la alta; confirmă cu instituția care te căsătorește înainte să comanzi opțiunile.</p>
          </div>
          <InfoTable
            head={['Țara', 'Cum îi spun ei', 'Apostilă', 'Traducere', 'Cât de nou']}
            rows={[
              ['Italia', 'nulla osta / certificato di stato libero', 'da, de regulă', 'da, în italiană', '90 de zile'],
              ['Spania', 'certificado de soltería (fe de vida y estado)', 'da', 'da, în spaniolă', '90 de zile'],
              ['Germania', 'Ehefähigkeitszeugnis; România nu emite echivalentul exact, oficiul acceptă de regulă adeverința + certificatul de naștere', 'da', 'da, traducător autorizat în Germania sau în RO', '6 luni (variază pe land)'],
              ['Franța', 'certificat de célibat / de capacité à mariage', 'da', 'da, în franceză', '3–6 luni'],
              ['Regatul Unit', 'certificate of no impediment', 'da (după Brexit)', 'da, în engleză', '3–6 luni'],
              ['Olanda, Belgia', 'verklaring van ongehuwd zijn / certificat de célibat', 'da', 'da', '6 luni'],
              ['SUA, Canada', 'single status affidavit / certificate', 'da', 'da, în engleză', 'variază pe stat'],
            ]}
          />
        </Section>

        <Section className="mt-24 flex flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Din străinătate, fără drum</Eyebrow>
            <H2 className="sm:text-[36px]">Cum îl obții dacă nu ești în România: trei căi, una fără om în țară</H2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {ROUTES.map(([t, d], i) => (
              <Card key={t} className={`flex flex-col gap-2.5 rounded-2xl p-6 ${i === 2 ? 'border-[1.5px] border-d-acc bg-d-soft' : ''}`}>
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        <Section className="mt-24 flex flex-col gap-7 lg:mt-32">
          <H2 className="sm:text-[32px]">Cum îl obținem pentru tine</H2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Completezi datele', '5 minute, de pe telefon. Poză act de identitate, semnătură în formular.'],
              ['Avocatul depune cererea', 'Cu împuternicire avocațială, la starea civilă competentă.'],
              ['Apostilă și traducere', 'Doar dacă le-ai ales. Le facem noi, în ordinea corectă.'],
              ['Curier la tine', 'Scan pe email imediat, originalul prin curier, în RO sau în lume.'],
            ].map(([t, d], i) => (
              <Card key={t} className="flex flex-col gap-2.5 rounded-2xl p-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-d-ink font-bold text-d-bg">{i + 1}</span>
                <span className="text-[16px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.5] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        <SeoBlock
          title="Certificat de celibat online: cum îl obținem și de ce prin avocat"
          intro={[
            'Certificatul de celibat nu există sub acest nume în legea română. Ce primești este adeverința privind statutul civil, formularul Anexa 18 din Normele metodologice de stare civilă aprobate prin H.G. 255/2024 (fosta Anexa 9), eliberată de primăria care păstrează actul tău de naștere. Confirmă că în registrele din România nu figurezi căsătorit. Ambasadele și primăriile din alte țări îi spun certificat de celibat, „certificate of no impediment” sau „nulla osta”, și îl cer înainte de a oficia o căsătorie cu un cetățean român.',
            'Legea 119/1996, articolul 10, permite ca cererea să fie depusă și de un avocat cu împuternicire avocațială, iar Legea 51/1995 dă împuternicirii avocațiale forța unei procuri. Asta facem: tu semnezi împuternicirea pe telefon, avocatul nostru depune cererea la starea civilă competentă, ridică documentul și îl trimitem la tine. Nu trebuie să vii în țară și nu trebuie să treci pe la consulat, unde termenele ajung la 30–60 de zile fiindcă cererea se întoarce tot la primăria din România.',
            'Motivul cel mai des de refuz în străinătate nu e documentul, ci datele: data nașterii sau numele scrise altfel în pașaportul străin decât în actul de naștere românesc. Adeverința reproduce actul de naștere. Dacă știi de o diferență, spune-ne în formular; uneori soluția e un duplicat nou de naștere sau o rectificare, nu încă o adeverință.',
          ]}
          acte={['Act de identitate valabil (buletin sau pașaport), poză față-verso', 'Datele nașterii: data, localitatea, numele părinților', 'Țara și scopul: căsătorie, ședere, notar', 'Semnătura ta, în formular']}
          rows={[
            ['Unde depui', 'la primăria care are actul de naștere, cu programare', 'nicăieri; depune avocatul'],
            ['Cine merge', 'tu, personal, sau cu procură notarială', 'avocatul, cu împuternicire semnată pe telefon'],
            ['Taxă', '0 lei sau taxă locală', `${lei(p.basePrice)} lei, tot inclus`],
            ['Termen', 'legal, până la 30 de zile', 'același termen legal; te anunțăm la fiecare pas'],
            ['Din străinătate', 'consulat: 30–60 de zile', 'direct la primărie, curier internațional'],
            ['Apostilă, traducere', 'alte două instituții, alte două drumuri', 'le facem noi, în ordinea corectă'],
          ]}
          diasporaTitle="Te căsătorești în Italia, Spania, Germania sau Regatul Unit"
          diaspora={[
            'În Italia, comuna cere „nulla osta” sau certificatul de celibat cu apostilă și traducere. În Spania, „certificado de soltería” intră în dosarul de „expediente matrimonial”, tot apostilat. Germania cere „Ehefähigkeitszeugnis”: aici starea civilă din România nu emite echivalentul exact, iar oficiul german acceptă de regulă adeverința cu apostilă plus certificatul de naștere. Regatul Unit lucrează cu „certificate of no impediment” și, după Brexit, cere apostilă și traducere autorizată.',
            'Spune-ne țara în formular. Pentru fiecare, alegem împreună dacă ai nevoie de apostilă, de traducere sau de extras multilingv în locul certificatului de naștere. Termenul de 90 de zile pe care îl aplică multe state curge de la data eliberării, deci comandă când știi data depunerii dosarului.',
          ]}
          guides={[
            { title: 'Apostila pe acte de stare civilă: când e nevoie și când nu', desc: 'În UE nu; în afara UE, pe original.', href: '/ghiduri/apostila-acte-stare-civila/' },
            { title: 'Valabilitatea certificatului de celibat: 6 luni sau 90 de zile?', desc: 'Amândouă sunt corecte, în contexte diferite.' },
            { title: 'Acte pentru căsătoria în străinătate, pe țări', desc: 'Ce cer Italia, Spania, Germania, Franța, UK.' },
          ]}
        />

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <Eyebrow>Termenul real</Eyebrow>
            <H2 className="sm:text-[36px]">Cât durează, de fapt?</H2>
            <Prose
              paras={[
                'Adeverința se eliberează repede dacă actul tău de naștere e scanat: primăria verifică registrul și o semnează. Ce adaugă zile sunt apostila (Prefectura) și traducerea, fiecare cu drumul ei, pe care le facem noi în ordinea corectă.',
                `Din comenzile de certificat de celibat plătite de la ${PROCESSING_STATS.since}, ${stats.done} au fost finalizate până la ${PROCESSING_STATS.asOf.split('-').reverse().join('.')}: jumătate în cel mult ${stats.medianDays} zile de la plată, 8 din 10 în cel mult ${stats.p80Days} zile, cu apostilă, traducere și curier cu tot, acolo unde au fost alese. Eșantion mic; îl actualizăm.`,
              ]}
            />
          </div>
          <Card className="flex flex-col gap-4 self-start p-6 lg:col-span-4 lg:col-start-9">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Ce plătești, de fapt</span>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
              {[
                'Onorariul avocatului și împuternicirea avocațială, cu număr din registrul Baroului',
                'Depunerea cererii și ridicarea adeverinței de la primărie',
                'Apostila și traducerea, dacă le alegi, făcute în ordinea corectă',
                'Scanul pe email în ziua ridicării, originalul prin curier, oriunde',
                'Banii înapoi dacă primăria refuză și nu se poate rezolva',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 shrink-0 text-d-acc" /><span>{t}</span></li>
              ))}
            </ul>
            <span className="text-[13px] text-d-muted">Adeverința în sine e gratuită la ghișeu. Noi vindem drumul și dosarul.</span>
          </Card>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Despre certificatul de celibat</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>

        <ReviewsDocumentero match={/celibat/i} title="Ce spun clienții despre certificatul de celibat" />

        <RelatedServices
          items={[
            ['Certificat de naștere, duplicat', 'Îl cer împreună cu celibatul aproape toate statele.', '/certificat-de-nastere/'],
            ['Extras multilingv de naștere', 'În UE înlocuiește traducerea și apostila pentru certificatul de naștere.', '/extras-multilingv/'],
            ['Certificat de căsătorie cu mențiunea de divorț', 'Dacă ai fost căsătorit, unele state îl cer lângă certificatul de celibat.', '/certificat-de-casatorie/'],
          ]}
        />
      </main>
    </>
  );
}
