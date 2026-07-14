import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { UnitatiTerenCalculator } from '@/components/calculators/unitati-teren-calculator';
import { LAND_UNITS } from '@/components/calculators/unitati-teren-data';

const SLUG = 'jugar-stanjen-in-mp';
const TITLE = 'Convertor Jugăr și Stânjen în Metri Pătrați — Unități Vechi de Teren';
const DESCRIPTION =
  'Convertor online: jugăr, stânjen, falce, prăjină și pogon în metri pătrați, ari și hectare. Valorile exacte ale unităților vechi de teren din Transilvania, Moldova și Muntenia.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent(TITLE)}`,
});

const fmtMp = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 4 });

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Convertor Jugăr și Stânjen în Metri Pătrați"
      description="Transformă unitățile vechi de teren — jugăr, stânjen, falce, prăjină, pogon — în metri pătrați, ari și hectare, cu valorile exacte folosite în cărțile funciare și actele vechi."
      tldr="Un jugăr cadastral (Transilvania) = 5.754,64 m² ≈ 0,58 ha. Un stânjen pătrat vienez = 3,5957 m². O falce (Moldova) = 14.321,9 m² ≈ 1,43 ha, iar un pogon (Muntenia) = 5.011,79 m² ≈ 0,5 ha. Introdu cantitatea în calculator pentru conversia exactă."
      widget={<UnitatiTerenCalculator />}
      faqs={[
        { q: 'Cât e un jugăr în metri pătrați?', a: 'Jugărul cadastral folosit în Transilvania în sistemul austro-ungar are 5.754,64 m², adică aproximativ 0,58 hectare. Există și variante mai mici: jugărul unguresc de arabil (4.316 m², 1.200 stânjeni pătrați) și jugărul mic din Secuime (3.596 m², 1.000 stânjeni pătrați). Când nu se precizează altfel, în cărțile funciare vechi din Transilvania se folosește jugărul cadastral.' },
        { q: 'Câți stânjeni are un jugăr?', a: 'Jugărul cadastral are 1.600 de stânjeni pătrați vienezi. Jugărul unguresc de arabil are 1.200 de stânjeni pătrați, iar jugărul mic din Secuime are 1.000. În CF-urile vechi din Transilvania suprafața este notată frecvent ca „jugăre și stânjeni" — de exemplu „2 jug. 340 st." înseamnă 2 × 5.754,64 + 340 × 3,5957 ≈ 12.732 m².' },
        { q: 'Cât e o falce în metri pătrați?', a: 'Falcea, unitatea tradițională a Moldovei, are 14.321,9 m², adică aproximativ 1,43 hectare. O falce se împarte în 2.880 de stânjeni pătrați moldovenești sau în 80 de prăjini fălcești (o prăjină = 179,02 m²).' },
        { q: 'Cât e un pogon în metri pătrați?', a: 'Pogonul, unitatea tradițională a Munteniei, are 5.011,79 m², adică aproximativ o jumătate de hectar. Un pogon = 1.296 de stânjeni pătrați Șerban Vodă. Legea metrică din 1875 a fixat conversia oficială: pogoane × 5.012 / 10.000 = hectare.' },
        { q: 'Care e diferența dintre jugărul cadastral și jugărul unguresc?', a: 'Jugărul cadastral (5.754,64 m² = 1.600 stânjeni pătrați vienezi) este unitatea oficială a sistemului cadastral austro-ungar, folosită în cărțile funciare. Jugărul unguresc de arabil este mai mic (4.316 m² = 1.200 stânjeni pătrați) și apărea mai ales în practica agricolă. Dacă ai un CF vechi din Transilvania, aproape sigur suprafața este în jugăre cadastrale.' },
        { q: 'Cum transform stânjenii dintr-un CF vechi în metri pătrați?', a: 'Depinde de regiune, pentru că stânjenul liniar diferă: în Transilvania stânjenul vienez are 1,896 m, deci un stânjen pătrat = 3,5957 m²; în Muntenia stânjenul Șerban Vodă are ~1,9665 m, deci un stânjen pătrat = 3,867 m²; în Moldova stânjenul are 2,23 m, deci un stânjen pătrat = 4,9729 m². Înmulțești numărul de stânjeni pătrați cu valoarea corespunzătoare regiunii.' },
        { q: 'De ce cărțile funciare vechi folosesc jugăre și stânjeni?', a: 'Cărțile funciare din Transilvania, Banat și Bucovina au fost întocmite în sistemul cadastral austro-ungar, care măsura suprafețele în jugăre și stânjeni pătrați vienezi. Sistemul a fost menținut prin Decretul-lege 115/1938, iar multe CF-uri vechi neconvertite în sistemul electronic păstrează și azi aceste unități.' },
        { q: 'Un hectar câte jugăre are?', a: 'Un hectar (10.000 m²) = 10.000 / 5.754,64 ≈ 1,7377 jugăre cadastrale. Invers, un jugăr cadastral ≈ 0,5755 hectare.' },
        { q: 'Există jugăr moldovenesc?', a: 'Nu. Jugărul este specific Transilvaniei și sistemului austro-ungar. În Moldova unitatea echivalentă (de aceeași mărime aproximativă cu o suprafață de arat) este falcea, de 14.321,9 m², împărțită în prăjini fălcești și stânjeni pătrați moldovenești.' },
        { q: 'Cât e un stânjen?', a: 'Stânjenul liniar diferă pe regiuni: cel vienez (Transilvania) are 1,896 m, cel Șerban Vodă (Muntenia) are ~1,9665 m, iar cel moldovenesc are 2,23 m. La suprafețe se folosește stânjenul pătrat: 3,5957 m² (vienez), 3,867 m² (Șerban Vodă) și 4,9729 m² (moldovenesc).' },
      ]}
    >
      <h2>Cum funcționează conversia unităților vechi de teren</h2>
      <p>
        Fiecare unitate veche are o valoare fixă în metri pătrați, stabilită istoric și — pentru
        Muntenia — chiar prin lege (legea metrică din 1875). Conversia este o simplă înmulțire:{' '}
        <strong>suprafața în m² = cantitate × valoarea unității</strong>. De exemplu, 2 jugăre
        cadastrale = 2 × 5.754,64 = <strong>11.509,28 m²</strong>, adică 1,150928 hectare. Pentru
        drumul invers împarți: 10.000 m² / 5.754,64 ≈ 1,7377 jugăre.
      </p>
      <p>
        Singura capcană reală este că <strong>aceeași denumire acoperă valori diferite</strong> în
        funcție de regiune și de context: „stânjen” înseamnă altceva în Transilvania, Muntenia și
        Moldova, iar „jugăr” are trei variante. De aceea calculatorul de mai sus îți cere să alegi
        exact unitatea, cu regiunea ei.
      </p>

      <h2>De ce diferă unitățile pe regiuni</h2>
      <p>
        Provinciile istorice românești au folosit sisteme de măsură diferite până la adoptarea
        sistemului metric (1866, aplicat efectiv din 1875), iar în Transilvania sistemul vechi a
        supraviețuit în cărțile funciare până azi.
      </p>
      <h3>Transilvania — sistemul austro-ungar</h3>
      <p>
        Cadastrul austro-ungar măsura terenurile în <strong>jugăre cadastrale</strong> (5.754,64 m²)
        și <strong>stânjeni pătrați vienezi</strong> (3,5957 m², de la stânjenul liniar de 1,896 m).
        Un jugăr cadastral = 1.600 stânjeni pătrați. Pe lângă jugărul cadastral au circulat și
        jugărul unguresc de arabil (4.316 m² = 1.200 stânjeni pătrați) și jugărul mic din Secuime
        (3.596 m² = 1.000 stânjeni pătrați).
      </p>
      <h3>Moldova — falcea, prăjina și stânjenul de 2,23 m</h3>
      <p>
        Moldova nu a folosit jugărul — <strong>nu există „jugăr moldovenesc”</strong>; echivalentul
        Moldovei este <strong>falcea</strong>, de 14.321,9 m² (≈ 1,43 ha). Falcea se împarte în 80
        de <strong>prăjini fălcești</strong> (179,02 m² fiecare) sau în 2.880 de stânjeni pătrați
        moldovenești (4,9729 m², de la stânjenul liniar de 2,23 m).
      </p>
      <h3>Muntenia — pogonul și stânjenul Șerban Vodă</h3>
      <p>
        Muntenia a măsurat terenul în <strong>pogoane</strong> (5.011,79 m² ≈ 0,5 ha) și{' '}
        <strong>stânjeni pătrați Șerban Vodă</strong> (3,867 m², de la stânjenul liniar de
        ~1,9665 m). Un pogon = 1.296 stânjeni pătrați. Legea metrică din 1875 a fixat conversia
        oficială: <strong>pogoane × 5.012 / 10.000 = hectare</strong>.
      </p>

      <h2>Tabel complet de conversie</h2>
      <p>
        Valorile de mai jos sunt cele folosite de calculator. Pentru referință rapidă: 1 ar =
        100 m², 1 hectar = 10.000 m².
      </p>
      <table>
        <thead>
          <tr>
            <th>Unitate</th>
            <th>Regiune</th>
            <th>Metri pătrați</th>
            <th>Observații</th>
          </tr>
        </thead>
        <tbody>
          {LAND_UNITS.map((u) => (
            <tr key={u.id}>
              <td><strong>{u.label}</strong></td>
              <td>{u.region}</td>
              <td>{fmtMp.format(u.mp)} m²</td>
              <td>{u.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="not-prose my-8 rounded-2xl border-l-4 border-primary-500 bg-primary-50/60 px-6 py-5">
        <p className="font-bold text-secondary-900 mb-2">
          Ai găsit jugăre sau stânjeni într-o carte funciară veche sau într-un act de moștenire?
        </p>
        <p className="text-[15px] leading-relaxed text-secondary-800 mb-3">
          Multe CF-uri vechi nu sunt convertite în sistemul electronic. Obții online, fără drumuri
          la ghișeu:
        </p>
        <ul className="space-y-1.5 text-[15px]">
          <li>
            <Link href="/servicii/extras-de-carte-funciara/" className="font-semibold text-primary-700 underline hover:text-primary-800">
              Extras de carte funciară
            </Link>{' '}
            <span className="text-neutral-600">— situația actuală a imobilului, în câteva minute.</span>
          </li>
          <li>
            <Link href="/servicii/identificare-imobil/" className="font-semibold text-primary-700 underline hover:text-primary-800">
              Identificare imobil
            </Link>{' '}
            <span className="text-neutral-600">— afli numărul de CF și cadastral când ai doar date vechi.</span>
          </li>
          <li>
            <Link href="/servicii/copie-carte-funciara/" className="font-semibold text-primary-700 underline hover:text-primary-800">
              Copie carte funciară
            </Link>{' '}
            <span className="text-neutral-600">— copia CF-ului vechi, cu istoricul înscrierilor.</span>
          </li>
        </ul>
      </div>

      <h2>Unde mai întâlnești azi aceste unități</h2>
      <ul>
        <li>
          <strong>Cărți funciare vechi din Transilvania, Banat și Bucovina</strong> — întocmite în
          sistemul austro-ungar și menținute prin Decretul-lege 115/1938, multe notează și azi
          suprafețele în jugăre și stânjeni pătrați. La conversia în sistemul electronic ANCPI
          suprafața se exprimă în m², dar CF-urile neconvertite păstrează unitățile vechi.
        </li>
        <li>
          <strong>Acte de moștenire și partaje succesorale</strong> — când terenul provine dintr-o
          succesiune veche, actele de proprietate ale antecesorilor descriu loturile în falce,
          pogoane sau jugăre, iar notarul sau instanța au nevoie de echivalentul în m².
        </li>
        <li>
          <strong>Contracte interbelice de vânzare-cumpărare</strong> — tranzacțiile de dinainte de
          generalizarea sistemului metric în acte descriu suprafețele în unitățile regionale.
        </li>
        <li>
          <strong>Titluri de proprietate și reconstituiri (legile fondului funciar)</strong> — la
          reconstituirea dreptului de proprietate s-au folosit actele vechi, deci echivalarea
          corectă a unităților a decis suprafețele retrocedate.
        </li>
      </ul>
      <p>
        Dacă lucrezi cu un CF vechi și vrei să verifici situația actuală a imobilului, cel mai
        rapid drum este un{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară online</Link>.
        Pentru taxele unei tranzacții cu terenul respectiv poți folosi{' '}
        <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>.
      </p>
    </CalculatorLayout>
  );
}
