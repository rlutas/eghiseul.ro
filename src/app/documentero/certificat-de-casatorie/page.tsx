import Image from 'next/image';
import { HeaderDocumentero } from '@/components/documentero/header';
import { ServiceHero } from '@/components/documentero/service-hero';
import { Card, Eyebrow, FaqList, H2, Section, SeoBlock } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroServiceGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const PATH = '/certificat-de-casatorie/';
const TITLE = 'Certificat de Căsătorie Online: Duplicat, cu Mențiune de Divorț';
const DESCRIPTION =
  'Duplicat certificat de căsătorie obținut de un avocat de la starea civilă: pierdut, deteriorat, cu mențiunea de divorț sau pentru străinătate. Semnezi pe telefon, primești originalul prin curier.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-09-19';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/curier-livrare-plic.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const CASES = [
  ['L-ai pierdut sau s-a deteriorat', 'Se eliberează un duplicat de la primăria unde s-a încheiat căsătoria. Cel vechi, dacă îl mai ai, se predă.'],
  ['Ai divorțat și îți trebuie cu mențiunea de divorț', 'Duplicatul nou poartă mențiunea, dacă divorțul a fost înregistrat în România. Sentința singură nu ține loc de certificat.'],
  ['Ai nevoie de el în străinătate', 'Pentru UE, extrasul multilingv de căsătorie merge fără traducere. În afara UE: duplicat plus apostilă plus traducere.'],
  ['Schimbi numele după căsătorie sau divorț', 'Banca, angajatorul sau evidența persoanelor cer certificatul actual, nu o copie veche.'],
] as const;

const FAQ = [
  { q: 'Poate cere duplicatul doar unul dintre soți?', a: 'Da. Oricare dintre soți poate cere duplicatul și poate semna împuternicirea avocațială. Nu e nevoie de acordul celuilalt.' },
  { q: 'Am divorțat. Îmi mai trebuie certificatul de căsătorie?', a: 'Pentru schimbarea numelui, pentru pensie sau pentru o nouă căsătorie în străinătate, da: duplicatul cu mențiunea de divorț dovedește și căsătoria, și desfacerea ei.' },
  { q: 'Divorțul a fost pronunțat în străinătate. Apare pe duplicat?', a: 'Doar după recunoașterea lui în România (înscrierea mențiunii). Până atunci duplicatul iese fără mențiune. Îți spunem dinainte.' },
  { q: 'Ce se întâmplă cu certificatul vechi, dacă îl găsesc?', a: 'La eliberarea duplicatului, cel vechi își pierde valabilitatea. Dacă îl mai ai, se predă primăriei; dacă apare mai târziu, nu îl mai folosești.' },
  { q: 'Cât costă la primărie?', a: 'Nimic sau o taxă locală mică. La noi plătești avocatul, dosarul, urmărirea și livrarea.' },
  { q: 'Pot comanda și certificatul de naștere în aceeași comandă?', a: 'Sunt două acte, două cereri, deci două comenzi. Le poți face una după alta, cu aceleași date; a doua durează un minut.' },
];

export default async function CasatoriePage() {
  const p = await getServicePricing('certificat-casatorie');
  const ml = await getServicePricing('extras-multilingv-certificat-casatorie');
  const extrasOpt = optionPrice(p, 'extras_multilingv', 398);
  const apostila = optionPrice(p, 'apostila_haga', 198);
  const traducere = optionPrice(p, 'traducere', 178.5);
  const legalizare = optionPrice(p, 'legalizare', 99);

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
          media={<Image src="/images/documentero/curier-livrare-plic.webp" alt="Curierul aduce plicul cu certificatul" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 760px, 100vw" />}
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

        <SeoBlock
          title="Duplicat certificat de căsătorie online: cum funcționează prin avocat"
          intro={[
            'Duplicatul certificatului de căsătorie se eliberează pe baza actului de căsătorie din registrul primăriei unde s-a oficiat căsătoria. Din 2023 cererea se poate depune la orice primărie din țară, iar sistemul informatic de stare civilă o trimite la cea competentă. Poate cere oricare dintre soți, personal sau prin avocat cu împuternicire avocațială, conform articolului 10 din Legea 119/1996. Pe duplicat apar mențiunile ulterioare: divorțul, dacă a fost înregistrat în România, sau decesul unuia dintre soți.',
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
            { title: 'Duplicat certificat de căsătorie cu mențiunea de divorț', desc: 'Când ai nevoie de el și ce nu înlocuiește.', href: '/ghiduri/' },
            { title: 'Extras multilingv sau certificat cu apostilă?', desc: 'Depinde de țară.', href: '/extras-multilingv/' },
            { title: 'Certificat de naștere pierdut: ce faci în 2026', desc: 'Pașii, actele, termenul real.', href: '/ghiduri/certificat-de-nastere-pierdut/' },
          ]}
        />

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Despre duplicatul certificatului de căsătorie</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>
      </main>
    </>
  );
}
