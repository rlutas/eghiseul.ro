import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ValabilitateCalculator } from '@/components/calculators/valabilitate-calculator';

const SLUG = 'valabilitate-documente';
const TITLE = 'Mai E Valabil Documentul Meu? Verificare Valabilitate Cazier, Extras CF, Constatator';
const DESCRIPTION =
  'Verifică pe loc dacă documentul tău mai e valabil: cazier judiciar (6 luni), cazier fiscal (30 zile), extras CF, certificat constatator, certificat de integritate. Alegi documentul, pui data eliberării, afli până când e bun.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Mai e valabil documentul meu?')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Mai e valabil documentul meu?"
      description="Alege documentul și data eliberării de pe el — afli pe loc dacă mai e valabil, până când, și ce faci dacă a expirat."
      tldr="Cazierul judiciar e valabil 6 luni (Legea 290/2004). Cazierul fiscal — doar 30 de zile (OG 39/2015). Certificatul de integritate comportamentală — 6 luni. Extrasul CF de informare și certificatul constatator nu au termen legal, dar băncile și instituțiile cer de regulă documente de maximum 30 de zile. Extrasul CF pentru autentificare (notar) — 10 zile lucrătoare."
      widget={<ValabilitateCalculator />}
      faqs={[
        {
          q: 'Cât e valabil cazierul judiciar?',
          a: '6 luni de la data eliberării (Legea 290/2004). Termenul e același indiferent cum l-ai obținut — la ghișeu sau online. După 6 luni, instituțiile îl refuză și trebuie unul nou.',
        },
        {
          q: 'Cât e valabil cazierul fiscal?',
          a: '30 de zile de la eliberare (OG 39/2015). E cel mai scurt termen dintre documentele uzuale — dacă îl scoți prea devreme față de momentul depunerii dosarului, riști să expire.',
        },
        {
          q: 'Cât e valabil extrasul de carte funciară?',
          a: 'Extrasul de informare nu are termen legal de valabilitate — el reflectă situația CF-ului la momentul eliberării. Băncile și instituțiile cer de regulă un extras de maximum 30 de zile. Extrasul pentru AUTENTIFICARE, folosit de notar la semnarea actului, e valabil 10 zile lucrătoare și îl poate cere doar notarul.',
        },
        {
          q: 'Cât e valabil certificatul constatator?',
          a: 'Legea nu îi dă un termen de valabilitate, dar practica e strictă: băncile, licitațiile publice și notarii cer de regulă un certificat de maximum 30 de zile de la eliberare. Verifică cerința exactă a instituției unde îl depui.',
        },
        {
          q: 'Cât e valabil certificatul de integritate comportamentală?',
          a: '6 luni de la eliberare (Legea 118/2019), la fel ca al cazierului judiciar.',
        },
        {
          q: 'Documentul expiră fix la termen sau la sfârșitul lunii?',
          a: 'La termen: un cazier judiciar eliberat pe 10 ianuarie expiră pe 10 iulie, nu la sfârșitul lui iulie. Calculatorul de mai sus îți dă data exactă.',
        },
        {
          q: 'Pot prelungi un document expirat?',
          a: 'Nu. Documentele de acest tip nu se prelungesc și nu se vizează — se emite unul nou. Vestea bună: online, fără drumuri, cazierul se obține în câteva zile, iar extrasul CF și constatatorul în câteva minute.',
        },
        {
          q: 'Instituția mi-a cerut document „nu mai vechi de 30 de zile”, dar al meu e legal valabil 6 luni. Cine are dreptate?',
          a: 'Instituția poate impune un termen mai strict decât cel legal — e dreptul ei să ceară o situație recentă. Termenul legal e plafonul maxim, nu o garanție de acceptare. Dacă cerința e „max 30 de zile”, ai nevoie de document nou.',
        },
      ]}
    >
      <h2>Valabilitatea documentelor oficiale, pe scurt</h2>
      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>Valabilitate</th>
            <th>Baza</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cazier judiciar</td>
            <td>6 luni</td>
            <td>Legea 290/2004</td>
          </tr>
          <tr>
            <td>Cazier fiscal</td>
            <td>30 de zile</td>
            <td>OG 39/2015</td>
          </tr>
          <tr>
            <td>Certificat de integritate comportamentală</td>
            <td>6 luni</td>
            <td>Legea 118/2019</td>
          </tr>
          <tr>
            <td>Extras CF de informare</td>
            <td>~30 de zile</td>
            <td>practica instituțiilor (fără termen legal)</td>
          </tr>
          <tr>
            <td>Extras CF pentru autentificare</td>
            <td>10 zile lucrătoare</td>
            <td>Legea 7/1996 (doar prin notar)</td>
          </tr>
          <tr>
            <td>Certificat constatator ONRC</td>
            <td>~30 de zile</td>
            <td>practica băncilor/licitațiilor (fără termen legal)</td>
          </tr>
          <tr>
            <td>Cazier auto</td>
            <td>~30 de zile</td>
            <td>practica instituțiilor (fără termen legal)</td>
          </tr>
        </tbody>
      </table>

      <h2>De ce contează data exactă</h2>
      <p>
        Cele mai multe dosare respinse pe motiv de documente nu pică din lipsa lor, ci din expirare:
        cazierul fiscal scos cu o lună înainte de depunere, constatatorul de acum două luni, extrasul CF
        de anul trecut. Termenul curge de la <strong>data eliberării</strong> tipărită pe document, nu de
        la data la care l-ai primit sau descărcat.
      </p>
      <p>
        Regulă practică: documentele cu valabilitate scurtă (cazier fiscal, extras CF, constatator) se
        scot <strong>ultimele</strong>, cât mai aproape de depunerea dosarului. Cele cu 6 luni (cazier
        judiciar, integritate) pot fi scoase din timp.
      </p>

      <h2>A expirat? Rezolvi online, fără drumuri</h2>
      <p>
        Toate documentele din calculator se obțin prin eGhișeul, fără deplasare:{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extrasul CF</Link> și{' '}
        <Link href="/servicii/certificat-constatator-online/">certificatul constatator</Link> se
        eliberează automat, în câteva minute, 24/7;{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazierul judiciar</Link>,{' '}
        <Link href="/servicii/cazier-fiscal-online/">cel fiscal</Link>,{' '}
        <Link href="/servicii/cazier-auto-online/">cel auto</Link> și{' '}
        <Link href="/servicii/certificat-de-integritate-comportamentala/">certificatul de integritate</Link>{' '}
        în câteva zile lucrătoare, cu livrare pe email și opțional în original, prin curier.
      </p>
    </CalculatorLayout>
  );
}
