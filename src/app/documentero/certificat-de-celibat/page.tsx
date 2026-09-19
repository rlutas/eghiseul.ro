import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { ServiceHero } from '@/components/documentero/service-hero';
import { Card, Eyebrow, FaqList, H2, Prose, Section, SeoBlock } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroServiceGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const PATH = '/certificat-de-celibat/';
const TITLE = 'Certificat de Celibat Online (Anexa 9), pentru Străinătate';
const DESCRIPTION =
  'Certificat de celibat (dovada de celibat, Anexa 9) obținut de un avocat de la starea civilă, fără să vii în țară. Pentru căsătorie, ședere sau notar în străinătate. Apostilă și traducere opționale.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-09-19';

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

const FAQ = [
  { q: 'Certificat de celibat sau adeverință de stare civilă?', a: 'Același document. Denumirea legală este „dovada de celibat”, Anexa 9 la Metodologia de stare civilă. Instituțiile străine îi spun „certificat de celibat” sau „certificate of no impediment”.' },
  { q: 'Îl pot cere de la consulat?', a: 'Da, dar consulatul îl solicită tot de la primăria din România, cu termene de 30–60 de zile. Noi mergem direct la primărie.' },
  { q: 'Am fost căsătorit și am divorțat. Îl pot obține?', a: 'Da. Documentul arată starea civilă actuală, cu mențiunea divorțului. Pentru unele state ai nevoie și de certificatul de căsătorie cu mențiunea de divorț.' },
  { q: 'Cum știu ce cere statul unde mă căsătoresc?', a: 'Spune-ne țara în formular. Îți spunem dacă e nevoie de apostilă, de traducere sau de extras multilingv în locul certificatului.' },
  { q: 'Cât costă certificatul de celibat la primărie?', a: 'Nimic, sau o taxă locală de câțiva lei. La noi costă mai mult fiindcă plătești avocatul, dosarul, urmărirea și livrarea, nu documentul.' },
  { q: 'Pot cere certificatul de celibat pentru logodnicul meu?', a: 'Nu. Împuternicirea o semnează doar titularul, chiar dacă plata o faci tu. Îi trimitem linkul comenzii și semnează de pe telefonul lui.' },
];

export default async function CelibatPage() {
  const p = await getServicePricing('certificat-celibat');
  const apostila = optionPrice(p, 'apostila_haga', 198);
  const traducere = optionPrice(p, 'traducere', 178.5);
  const legalizare = optionPrice(p, 'legalizare', 99);
  const apostilaNotari = optionPrice(p, 'apostila_notari', 83.3);

  const graph = documenteroServiceGraph({
    path: PATH,
    name: 'Certificat de celibat (Anexa 9)',
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
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero active="Celibat" />
      <main id="main-content">
        <ServiceHero
          crumb="Certificat de celibat"
          eyebrow="Anexa 9 · dovada stării civile"
          title="Certificat de celibat pentru căsătoria în străinătate, fără să vii în țară."
          intro="Documentul se numește oficial „dovada de celibat” (Anexa 9) și confirmă că nu ești căsătorit în România. Îl cere primăria, notarul sau consulatul din țara unde te căsătorești. Avocatul nostru îl obține de la starea civilă și ți-l trimite oriunde ești."
          orderSlug="certificat-celibat"
          cta="Comandă certificatul"
          secondary={{ label: 'Cât e valabil', href: '#valabilitate' }}
          facts={[['6 luni', 'valabil în România'], ['90 de zile', 'cerut de majoritatea statelor UE'], ['≤ 30 de zile', 'termen legal de eliberare']]}
          media={<Image src="/images/documentero/avocat-ghiseu-stare-civila.webp" alt="Avocata depune cererea la ghișeul de stare civilă" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 760px, 100vw" />}
          priceLabel="Certificat de celibat (Anexa 9)"
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

        <Section className="mt-20 grid gap-8 lg:mt-[88px] lg:grid-cols-12">
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

        <Section id="valabilitate" className="mt-20 grid gap-8 lg:mt-[88px] lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <Eyebrow>Valabilitate</Eyebrow>
            <H2 className="sm:text-[36px]">6 luni în România, 90 de zile în afară. Amândouă sunt adevărate.</H2>
            <Prose
              paras={[
                'Legea română dă Anexei 9 o valabilitate de 6 luni de la eliberare. Autoritățile străine însă aplică propria regulă: cele mai multe state UE acceptă documente de stare civilă mai noi de 90 de zile. Comandă-l când ai deja data depunerii dosarului, nu „ca să-l ai”.',
                'Dacă statul cere apostilă, ea se aplică de Instituția Prefectului pe originalul certificatului. Traducerea se face după apostilare, de un traducător autorizat. Le poți alege pe amândouă în comandă, ca să primești documentul gata de folosit.',
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

        <Section className="mt-20 flex flex-col gap-7 lg:mt-[88px]">
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
            'Certificatul de celibat nu există sub acest nume în legea română. Ce primești este „dovada de celibat”, formularul Anexa 9 din metodologia de stare civilă, eliberat de primăria care păstrează actul tău de naștere. Confirmă că în registrele din România nu figurezi căsătorit. Ambasadele și primăriile din alte țări îi spun certificat de celibat, „certificate of no impediment” sau „nulla osta”, și îl cer înainte de a oficia o căsătorie cu un cetățean român.',
            'Legea 119/1996, articolul 10, permite ca cererea să fie depusă și de un avocat cu împuternicire avocațială. Asta facem: tu semnezi împuternicirea pe telefon, avocatul nostru depune cererea la starea civilă competentă, ridică documentul și îl trimitem la tine. Nu trebuie să vii în țară și nu trebuie să treci pe la consulat, unde termenele ajung la 30–60 de zile fiindcă cererea se întoarce tot la primăria din România.',
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
            'În Italia, comuna cere „nulla osta” sau certificatul de celibat cu apostilă și traducere. În Spania, „certificado de soltería” intră în dosarul de „expediente matrimonial”, tot apostilat. Germania cere „Ehefähigkeitszeugnis”: aici starea civilă din România nu emite echivalentul exact, iar oficiul german acceptă de regulă dovada de celibat cu apostilă plus certificatul de naștere. Regatul Unit lucrează cu „certificate of no impediment” și, după Brexit, cere apostilă și traducere autorizată.',
            'Spune-ne țara în formular. Pentru fiecare, alegem împreună dacă ai nevoie de apostilă, de traducere sau de extras multilingv în locul certificatului de naștere. Termenul de 90 de zile pe care îl aplică multe state curge de la data eliberării, deci comandă când știi data depunerii dosarului.',
          ]}
          guides={[
            { title: 'Valabilitatea certificatului de celibat: 6 luni sau 90 de zile?', desc: 'Amândouă sunt corecte, în contexte diferite.', href: '/ghiduri/' },
            { title: 'Acte pentru căsătoria în străinătate, pe țări', desc: 'Ce cer Italia, Spania, Germania, Franța, UK.', href: '/ghiduri/' },
            { title: 'Certificat de naștere pentru căsătoria în străinătate', desc: 'Duplicat nou sau extras multilingv?', href: '/extras-multilingv/' },
          ]}
        />

        <Section className="mt-20 grid gap-8 lg:mt-[88px] lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Despre certificatul de celibat</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>

        <Section className="mt-20 flex flex-col gap-5 lg:mt-[88px]">
          <H2 className="sm:text-[28px]">Ai nevoie și de</H2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ['Certificat de naștere, duplicat', 'Îl cer împreună cu celibatul aproape toate statele.', '/'],
              ['Extras multilingv de naștere', 'În UE înlocuiește traducerea și apostila.', '/extras-multilingv/'],
              ['Ghid: certificat de naștere pierdut', 'Pașii, actele, termenul real.', '/ghiduri/certificat-de-nastere-pierdut/'],
            ].map(([t, d, h]) => (
              <Link key={t} href={h} className="flex flex-col gap-2 rounded-2xl border border-d-line bg-d-card p-6 hover:border-d-acc">
                <span className="text-[17px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.5] text-d-muted">{d}</span>
                <span className="text-[15px] font-bold text-d-acc">Vezi →</span>
              </Link>
            ))}
          </div>
        </Section>
      </main>
    </>
  );
}
