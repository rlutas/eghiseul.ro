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

const PATH = '/certificat-de-casatorie/';
const TITLE = 'Certificat de Căsătorie Online: Duplicat, cu Mențiune de Divorț';
const DESCRIPTION =
  'Duplicat certificat de căsătorie obținut de un avocat de la starea civilă: pierdut, deteriorat, cu mențiunea de divorț sau pentru străinătate. Semnezi pe telefon, primești originalul prin curier.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-09-21';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/cuplu-certificat-casatorie.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const CASES = [
  ['L-ai pierdut sau s-a deteriorat', 'Se eliberează un duplicat de la primăria unde s-a încheiat căsătoria. Cel vechi, dacă îl mai ai, se predă.'],
  ['Ai divorțat și îți trebuie cu mențiunea de divorț', 'Duplicatul nou poartă mențiunea, dacă divorțul a fost înregistrat în România. Sentința singură nu ține loc de certificat.'],
  ['Ai nevoie de el în străinătate', 'Pentru UE, extrasul multilingv de căsătorie merge fără traducere. În afara UE: duplicat plus apostilă plus traducere.'],
  ['Schimbi numele după căsătorie sau divorț', 'Banca, angajatorul sau evidența persoanelor cer certificatul actual, nu o copie veche.'],
] as const;

const NOT_A_SUBSTITUTE = [
  ['Sentința de divorț', 'Dovedește desfacerea căsătoriei, nu căsătoria. Autoritățile străine cer de regulă certificatul de căsătorie cu mențiunea de divorț înscrisă pe el.'],
  ['Certificatul de divorț de la notar sau de la primărie', 'Îl primești la divorțul prin acord. Nici el nu înlocuiește certificatul de căsătorie; mențiunea se înscrie pe actul de căsătorie și apare pe duplicat.'],
  ['O copie veche, xerox', 'Nu are mențiunile ulterioare (divorț, deces) și nu are elementele de siguranță. Băncile și consulatele o refuză.'],
  ['Extrasul multilingv', 'E același act, pe formularul UE. Bun pentru instituțiile din Uniune, dar nu poartă mențiuni la fel de detaliat și nu e acceptat automat în afara UE.'],
] as const;

const FAQ = [
  { q: 'Poate cere duplicatul doar unul dintre soți?', a: 'Da. Oricare dintre soți poate cere duplicatul și poate semna împuternicirea avocațială. Nu e nevoie de acordul celuilalt, nici după divorț.' },
  { q: 'Am divorțat. Îmi mai trebuie certificatul de căsătorie?', a: 'Pentru schimbarea numelui, pentru pensie sau pentru o nouă căsătorie în străinătate, da: duplicatul cu mențiunea de divorț dovedește și căsătoria, și desfacerea ei, pe un singur document.' },
  { q: 'Divorțul a fost pronunțat în străinătate. Apare pe duplicat?', a: 'Doar după ce hotărârea străină e recunoscută în România și mențiunea e înscrisă pe actul de căsătorie. Până atunci duplicatul iese fără mențiune. Verificăm cu tine înainte de plată ca să nu comanzi degeaba.' },
  { q: 'Cât durează?', a: `Termenul legal e de cel mult 30 de zile de la depunere. La comenzile noastre de duplicat de căsătorie din vara lui 2026, jumătate au ajuns la client în cel mult ${PROCESSING_STATS.byService['certificat-casatorie'].medianDays} zile de la plată, cu curier cu tot. Actele de căsătorie vechi, nescanate, se apropie de termenul maxim.` },
  { q: 'Ce se întâmplă cu certificatul vechi, dacă îl găsesc?', a: 'La eliberarea duplicatului, cel vechi își pierde valabilitatea. Dacă îl mai ai, se predă primăriei; dacă apare mai târziu, nu îl mai folosești.' },
  { q: 'Cât costă la primărie?', a: 'Nimic sau o taxă locală mică. La noi plătești avocatul, dosarul, urmărirea și livrarea, nu documentul.' },
  { q: 'Pot comanda și certificatul de naștere în aceeași comandă?', a: 'Sunt două acte, două cereri, deci două comenzi. Le poți face una după alta, cu aceleași date; a doua durează un minut.' },
  { q: 'Trebuie să merg la notar pentru împuternicire?', a: `Nu. Împuternicirea avocațială se semnează electronic în formular și e recunoscută de starea civilă în temeiul ${LEGAL_BASIS.shortGen}.` },
];

export default async function CasatoriePage() {
  const p = await getServicePricing('certificat-casatorie');
  const ml = await getServicePricing('extras-multilingv-certificat-casatorie');
  const extrasOpt = optionPrice(p, 'extras_multilingv', 398);
  const apostila = optionPrice(p, 'apostila_haga', 198);
  const traducere = optionPrice(p, 'traducere', 178.5);
  const legalizare = optionPrice(p, 'legalizare', 99);
  const stats = PROCESSING_STATS.byService['certificat-casatorie'];

  const graph = documenteroServiceGraph({
    path: PATH,
    name: 'Duplicat certificat de căsătorie',
    description: DESCRIPTION,
    serviceType: 'Obținere acte de stare civilă prin avocat',
    offers: [
      { name: 'Duplicat certificat de căsătorie', price: p.basePrice },
      { name: 'Cu extras multilingv', price: p.basePrice + extrasOpt },
      { name: 'Cu apostilă și traducere', price: p.basePrice + apostila + traducere },
    ],
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Certificat de căsătorie', path: PATH }],
    faq: FAQ,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero active="/certificat-de-casatorie/" />
      <main id="main-content">
        <ServiceHero
          crumb="Certificat de căsătorie"
          eyebrow="Duplicat certificat de căsătorie · depus de avocat"
          title="Certificatul de căsătorie, duplicat, fără drum la primăria unde v-ați căsătorit."
          intro="Pierdut, deteriorat, cu mențiunea de divorț sau pentru străinătate: cererea o depune avocatul nostru la starea civilă care păstrează actul de căsătorie. Tu semnezi împuternicirea pe telefon și primești originalul prin curier."
          orderSlug="certificat-casatorie"
          cta="Comandă duplicatul"
          secondary={{ label: 'Cu mențiunea de divorț', href: '#divort' }}
          facts={[['≤ 30 de zile', 'termen legal de eliberare'], ['Oriunde în RO', 'se cere de la orice primărie din 2023'], ['Oricare dintre soți', 'poate semna împuternicirea']]}
          media={<Image src="/images/documentero/cuplu-certificat-casatorie.webp" alt="Cuplu la birou, verificând certificatul de căsătorie lângă laptop și pașaport" width={1370} height={1148} className="h-full w-full object-cover" sizes="(min-width: 1024px) 760px, 100vw" />}
          priceLabel="Duplicat certificat de căsătorie"
          price={p.basePrice}
          options={[
            { name: 'Extras multilingv de căsătorie', desc: 'pentru UE, în locul traducerii', price: extrasOpt },
            { name: 'Apostilă de la Haga', desc: 'Instituția Prefectului, pe original', price: apostila },
            { name: 'Traducere autorizată', desc: 'după apostilare', price: traducere },
            { name: 'Legalizare notarială', desc: 'copie legalizată, la cerere', price: legalizare },
          ]}
          note="Prețul final se vede înainte de plată. Curierul se adaugă la ultimul pas."
        />

        <QuickAnswer updated={DATE_MODIFIED}>
          Duplicatul certificatului de căsătorie se eliberează de oficiul de stare civilă pe baza actului de căsătorie din registru și poartă mențiunile ulterioare: divorțul înregistrat în România sau decesul unuia dintre soți. Din 2023 cererea se depune la orice primărie din țară. Poate cere oricare dintre soți, personal sau printr-un avocat cu împuternicire avocațială ({LEGAL_BASIS.short}). Termen legal: cel mult 30 de zile. Taxa de stat: 0 lei sau o taxă locală.
        </QuickAnswer>

        <Section id="divort" className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Când ai nevoie de duplicat</Eyebrow>
            <H2 className="sm:text-[36px]">Patru situații, aceeași cerere</H2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            {CASES.map(([t, d]) => (
              <Card key={t} className="flex flex-col gap-2 rounded-2xl p-6">
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <Eyebrow>Divorțul și mențiunea</Eyebrow>
            <H2 className="sm:text-[36px]">Ce apare pe duplicat după divorț și ce nu</H2>
            <Prose
              paras={[
                'Certificatul de căsătorie nu se anulează la divorț. Actul de căsătorie rămâne în registru, iar pe el se înscrie o mențiune: „căsătoria a fost desfăcută prin…”, cu numărul hotărârii sau al certificatului de divorț. Orice duplicat eliberat după înscriere poartă mențiunea. De asta un duplicat proaspăt e, pentru multe instituții, dovada cea mai simplă că ai fost căsătorit și că nu mai ești.',
                'Divorțul pronunțat în România ajunge în registru de la sine: instanța, notarul sau primăria care l-a constatat trimit comunicarea la starea civilă. Divorțul pronunțat în străinătate nu ajunge singur. Hotărârea străină trebuie recunoscută în România (pentru statele UE, de regulă prin înscrierea directă a mențiunii, în temeiul Regulamentului 2019/1111; pentru restul, printr-o procedură la tribunal), iar abia după înscriere duplicatul iese cu mențiune. Dacă ești în situația asta, ne spui în formular și verificăm înainte de plată; altfel primești un duplicat corect, dar fără mențiunea de care aveai nevoie.',
                'Același lucru pentru decesul unuia dintre soți: mențiunea se înscrie pe actul de căsătorie și apare pe duplicat. Pentru pensia de urmaș sau pentru succesiune, casa de pensii și notarul cer de obicei exact acest duplicat, nu certificatul de deces singur.',
              ]}
            />
          </div>
          <div className="flex flex-col gap-3.5 self-start rounded-[20px] bg-d-ink p-7 text-d-bg lg:col-span-4 lg:col-start-9">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-d-acc">Ce conține duplicatul</span>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px] leading-[1.5]">
              {['Numele soților înainte și după căsătorie', 'Data și localitatea căsătoriei, numărul actului', 'Numele purtat de fiecare soț după căsătorie', 'Mențiunile înscrise: divorț, deces, schimbare de nume', 'Semnătura și ștampila ofițerului de stare civilă'].map((t) => <li key={t}>{t}</li>)}
            </ul>
            <span className="text-[13px] text-d-dark-muted">Formularul actual, cu elemente de siguranță, indiferent de anul căsătoriei.</span>
          </div>
        </Section>

        <Section className="mt-24 flex flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Ca să nu comanzi ce nu-ți trebuie</Eyebrow>
            <H2 className="sm:text-[36px]">Ce nu înlocuiește duplicatul certificatului de căsătorie</H2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {NOT_A_SUBSTITUTE.map(([t, d]) => (
              <Card key={t} className="flex flex-col gap-2 rounded-2xl p-6">
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        <SeoBlock
          title="Duplicat certificat de căsătorie online: cum funcționează prin avocat"
          intro={[
            'Duplicatul certificatului de căsătorie se eliberează pe baza actului de căsătorie din registrul primăriei unde s-a oficiat căsătoria. Din 2023 cererea se poate depune la orice primărie din țară, iar sistemul informatic de stare civilă o trimite la cea competentă. Poate cere oricare dintre soți, personal sau prin avocat cu împuternicire avocațială, conform articolului 10 din Legea 119/1996 și Legii 51/1995. Pe duplicat apar mențiunile ulterioare: divorțul, dacă a fost înregistrat în România, sau decesul unuia dintre soți.',
            'Noi lucrăm așa: completezi datele căsătoriei (data, localitatea, numele soțului sau soției înainte de căsătorie), încarci o poză a actului de identitate și semnezi împuternicirea pe telefon. Avocatul depune cererea, ridică duplicatul și îl trimitem prin curier, cu scanul pe email în ziua ridicării. Dacă ai divorțat în străinătate și divorțul nu e recunoscut încă în România, îți spunem înainte să plătești că duplicatul va ieși fără mențiune.',
          ]}
          acte={['Act de identitate valabil al soțului care semnează', 'Data și localitatea căsătoriei', 'Numele soțului/soției înainte de căsătorie', 'Dacă e cazul: informații despre divorț (instanța, anul)']}
          rows={[
            ['Unde depui', 'la orice primărie, cu programare', 'nicăieri; depune avocatul'],
            ['Cine cere', 'unul dintre soți, personal', 'avocatul, cu împuternicirea unuia dintre soți'],
            ['Taxă', '0 lei sau taxă locală', `${lei(p.basePrice)} lei, tot inclus`],
            ['Termen', 'legal, până la 30 de zile', 'același termen; status la fiecare pas'],
            ['Mențiune de divorț', 'apare dacă e înregistrat în RO', 'verificăm înainte de plată'],
            ['Pentru UE', 'extras multilingv, drum separat', 'îl adaugi în aceeași comandă'],
          ]}
          diasporaTitle="Căsătorie încheiată în România, viață în străinătate"
          diaspora={[
            'Cel mai frecvent caz: cuplu căsătorit în România, stabilit în Italia, Spania sau Germania, care are nevoie de certificatul de căsătorie pentru rezidența partenerului, pentru schimbarea numelui în actele străine sau pentru pensia de urmaș. Consulatul preia cererea, dar o trimite tot în țară, cu termene de 30–60 de zile. Prin avocat, cererea intră direct la primărie.',
            `Pentru instituțiile din UE, extrasul multilingv de căsătorie înlocuiește traducerea și apostila. Îl poți adăuga în aceeași comandă, ${lei(extrasOpt)} lei, și pleacă în același plic; separat costă ${lei(ml.basePrice)} lei. Pentru Regatul Unit, Elveția sau SUA rămâne duplicatul cu apostilă și traducere, pe care le facem noi în ordinea corectă.`,
          ]}
          guides={[
            { title: 'Apostila pe acte de stare civilă: când e nevoie și când nu', desc: 'În UE nu; în afara UE, pe original.', href: '/ghiduri/apostila-acte-stare-civila/' },
            { title: 'Procură din străinătate: notar, consulat sau avocat', desc: 'Cum ceri duplicatul fără să vii în țară.', href: '/ghiduri/procura-din-strainatate-notar-consulat-avocat/' },
            { title: 'Acte necesare pentru duplicat', desc: 'Lista scurtă; aceeași logică și pentru căsătorie.', href: '/ghiduri/acte-necesare-duplicat-certificat-de-nastere/' },
          ]}
        />

        <Section className="mt-24 flex flex-col gap-5 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Pentru ce îl cer instituțiile</Eyebrow>
            <H2 className="sm:text-[36px]">Duplicat, extras multilingv sau apostilă? Depinde cine ți-l cere.</H2>
          </div>
          <InfoTable
            head={['Ai nevoie de el pentru', 'Ce ți se cere de obicei', 'Ce comanzi']}
            rows={[
              ['Schimbarea numelui în buletin, la bancă, la angajator', 'certificatul de căsătorie actual', 'duplicatul'],
              ['Rezidența soțului sau soției în UE', 'act de căsătorie acceptat fără traducere', 'extrasul multilingv, singur sau cu duplicatul'],
              ['Schimbarea numelui în actele străine (UE)', 'act de căsătorie cu numele purtat după căsătorie', 'extrasul multilingv'],
              ['O nouă căsătorie, după divorț, în străinătate', 'dovada căsătoriei anterioare și a divorțului', 'duplicatul cu mențiunea de divorț, plus certificatul de celibat'],
              ['Pensie de urmaș, succesiune', 'certificatul cu mențiunea de deces', 'duplicatul'],
              ['Viză, cetățenie în afara UE', 'certificat apostilat și tradus', 'duplicatul cu apostilă și traducere'],
            ]}
          />
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <Eyebrow>Termenul real</Eyebrow>
            <H2 className="sm:text-[36px]">Cât durează, de fapt?</H2>
            <Prose
              paras={[
                'Termenul legal e „cel mult 30 de zile”. Actele de căsătorie sunt, în medie, mai vechi decât cele de naștere pentru care ni se cere duplicat, și mai des nescanate. Asta se vede în cifre.',
                `Din comenzile de duplicat de căsătorie plătite de la ${PROCESSING_STATS.since}, ${stats.done} au fost finalizate până la ${PROCESSING_STATS.asOf.split('-').reverse().join('.')}: jumătate în cel mult ${stats.medianDays} zile de la plată, 8 din 10 în cel mult ${stats.p80Days} zile, cu curier cu tot. Puține comenzi, deci luați cifrele ca ordin de mărime; le actualizăm pe măsură ce cresc.`,
              ]}
            />
          </div>
          <Card className="flex flex-col gap-4 self-start p-6 lg:col-span-4 lg:col-start-9">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Ce plătești, de fapt</span>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
              {[
                'Onorariul avocatului și împuternicirea avocațială, cu număr din registrul Baroului',
                'Depunerea cererii și ridicarea duplicatului de la primărie',
                'Verificarea, înainte de plată, dacă mențiunea de divorț va apărea',
                'Scanul pe email în ziua ridicării, originalul prin curier',
                'Banii înapoi dacă primăria refuză și nu se poate rezolva',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 shrink-0 text-d-acc" /><span>{t}</span></li>
              ))}
            </ul>
            <span className="text-[13px] text-d-muted">Certificatul în sine e gratuit la ghișeu. Noi vindem drumul și dosarul.</span>
          </Card>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Despre duplicatul certificatului de căsătorie</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>

        <ReviewsDocumentero match={/căsătorie/i} title="Ce spun clienții despre actele de căsătorie" />

        <RelatedServices
          items={[
            ['Extras multilingv de căsătorie', 'Pentru UE: același act, acceptat fără traducere și fără apostilă.', '/extras-multilingv/#casatorie'],
            ['Certificat de celibat', 'După divorț, pentru o nouă căsătorie în străinătate ți se cer amândouă.', '/certificat-de-celibat/'],
            ['Certificat de naștere, duplicat', 'Aceeași procedură, pentru actul de naștere.', '/certificat-de-nastere/'],
          ]}
        />
      </main>
    </>
  );
}
