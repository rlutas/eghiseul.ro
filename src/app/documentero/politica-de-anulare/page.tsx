import Link from 'next/link';
import { LegalLayoutDocumentero } from '@/components/documentero/legal-layout';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroBreadcrumb, documenteroOrganizationNode, documenteroWebsiteNode } from '@/lib/seo/documentero-schema';
import { BRANDS, DOCUMENTERO_SERVICE_SLUGS } from '@/lib/brand/brands';
import { DOCUMENTERO_INDEXABLE, DOCUMENTERO_TRACK_HREF } from '@/config/documentero-nav';
import { createPublicClient } from '@/lib/supabase/public';

const PATH = '/politica-de-anulare/';
const brand = BRANDS.documentero;

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: 'Politica de anulare și rambursare',
  description:
    'Poți anula comanda în primele 30 de minute de la plată, direct din pagina de status, cu rambursare de 70%. Excepții, pași și termene, explicate clar.',
  path: PATH,
  noindex: !DOCUMENTERO_INDEXABLE,
});

export const revalidate = 86400;

/**
 * Same rules as eghiseul.ro/politica-de-anulare/ (src/app/(eghiseul)/politica-de-anulare/page.tsx):
 * the lists come from the DB (`processing_config.allow_self_cancel`), limited to
 * the services documentero sells, so the page can never drift from what the
 * cancel endpoint enforces. Revalidated daily with the page.
 */
async function getCancellationLists(): Promise<{ cancellable: string[]; excluded: string[] }> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('services')
    .select('slug, name, processing_config')
    .eq('is_active', true)
    .in('slug', [...DOCUMENTERO_SERVICE_SLUGS])
    .order('name');
  const cancellable: string[] = [];
  const excluded: string[] = [];
  for (const s of data ?? []) {
    const pc = s.processing_config as { allow_self_cancel?: boolean } | null;
    if (pc?.allow_self_cancel === false) excluded.push(s.name);
    else cancellable.push(s.name);
  }
  return { cancellable, excluded };
}

export default async function Page() {
  const { cancellable, excluded } = await getCancellationLists();
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      documenteroOrganizationNode(),
      documenteroWebsiteNode(),
      documenteroBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Politica de anulare', path: PATH }], PATH),
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <LegalLayoutDocumentero title="Politica de anulare și rambursare" path={PATH}>
        <p>
          Pe scurt: <strong>ai 30 de minute de la confirmarea plății</strong> în care poți anula
          comanda singur, online, fără să ne contactezi, și primești înapoi <strong>70% din suma
          plătită</strong>. Mai jos găsești exact cum funcționează, care sunt excepțiile și ce se
          întâmplă după expirarea ferestrei.
        </p>

        <h2>Fereastra de anulare: 30 de minute</h2>
        <ul>
          <li>
            Fereastra începe la <strong>confirmarea plății</strong> (momentul în care primești
            emailul de confirmare a comenzii). La plata prin transfer bancar, confirmarea plății este
            momentul în care confirmăm încasarea, nu momentul în care ai plasat comanda.
          </li>
          <li>
            Dreptul de anulare în această fereastră se păstrează <strong>chiar dacă noi am început
            deja procesarea internă</strong> a comenzii.
          </li>
          <li>
            Primești înapoi <strong>70%</strong> din suma plătită; 30% acoperă costurile
            administrative și de procesare deja angajate (verificări, generare documente, comisioane
            de plată).
          </li>
        </ul>

        <h2>Cum anulezi, pas cu pas</h2>
        <ol>
          <li>
            Deschide pagina <Link href={DOCUMENTERO_TRACK_HREF}>Urmărește comanda</Link>.
          </li>
          <li>Introdu numărul comenzii (din emailul de confirmare) și adresa de email folosită la comandă.</li>
          <li>
            Dacă ești în fereastra de 30 de minute, vezi cardul <strong>„Anulare comandă”</strong> cu
            un cronometru live: apasă butonul și confirmă.
          </li>
          <li>
            Primești imediat un email de confirmare a cererii. Rambursarea de 70% se procesează pe
            <strong> aceeași metodă de plată</strong> (cardul folosit sau, la transfer bancar, contul din care
            ai plătit), în <strong>5–10 zile lucrătoare</strong>.
          </li>
        </ol>

        <h2>Ce servicii pot fi anulate</h2>
        <p>
          Fereastra de 30 de minute se aplică pentru <strong>toate serviciile de mai jos</strong>{' '}
          (lista se actualizează automat pe măsură ce adăugăm servicii):
        </p>
        <ul>
          {cancellable.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p>
          Fereastra acoperă toate variantele actelor de mai sus, indiferent de opțiunile alese în comandă
          (procesare prioritară, traducere, apostilă, livrare internațională).
        </p>

        <h2>Excepții: servicii care NU pot fi anulate</h2>
        {excluded.length > 0 ? (
          <>
            <p>
              Serviciile de mai jos intră în procesare în secundele de după plată; anularea nu mai este
              posibilă după plasarea comenzii, iar opțiunea de anulare nu apare pentru ele:
            </p>
            <ul>
              {excluded.map((name) => (
                <li key={name}>
                  <strong>{name}</strong>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>
            În prezent, toate actele de stare civilă comandate pe documentero.ro pot fi anulate în fereastra de 30
            de minute. Niciunul nu se eliberează automat, instantaneu.
          </p>
        )}
        <p>
          Comanda nu mai poate fi anulată online dacă a fost deja{' '}
          <strong>expediată</strong> sau <strong>finalizată</strong>, indiferent de momentul cererii.
        </p>

        <h2>După expirarea celor 30 de minute</h2>
        <p>
          Anularea online nu mai este posibilă: cererea ta este deja în curs de procesare la
          autorități, iar serviciul este personalizat pe datele tale. Conform OUG 34/2014 art. 16
          lit. m), dreptul legal de retragere nu se aplică după începerea efectivă a prestării
          serviciului. Dacă ai o situație specială, scrie-ne la{' '}
          <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a> sau pe WhatsApp; analizăm
          fiecare caz.
        </p>

        <h2>Rambursare integrală (100%)</h2>
        <p>
          Dacă serviciul <strong>nu poate fi prestat din culpa noastră</strong> (de exemplu,
          oficiul de stare civilă respinge cererea dintr-o eroare a noastră sau nu putem livra actul
          comandat), primești <strong>rambursare integrală</strong>, fără să fie nevoie să soliciți
          anularea în vreo fereastră de timp.
        </p>
        <p>
          Atenție: dacă actul nu poate fi eliberat din cauza <strong>datelor greșite furnizate
          de client</strong> sau a unei situații obiective la instituție (de exemplu, solicitantul nu
          este persoană îndreptățită să primească duplicatul, sau actul nu este înregistrat în
          registrele de stare civilă din România), rambursarea nu se acordă. Verifică datele cu atenție
          înainte de trimitere.
        </p>

        <h2>Întrebări frecvente</h2>
        <h3>Nu găsesc butonul de anulare. De ce?</h3>
        <p>
          Fie au trecut cele 30 de minute, fie comanda nu are încă plata confirmată (la transfer bancar,
          până confirmăm încasarea). Butonul apare doar când anularea este efectiv posibilă.
        </p>
        <h3>În cât timp primesc banii?</h3>
        <p>
          În 5–10 zile lucrătoare de la înregistrarea cererii, pe cardul folosit la plată sau în contul din care
          ai făcut transferul. Te anunțăm pe email când rambursarea a fost procesată.
        </p>
        <h3>Pot anula prin telefon sau email?</h3>
        <p>
          Fereastra de 30 de minute funcționează exclusiv prin pagina de{' '}
          <Link href={DOCUMENTERO_TRACK_HREF}>urmărire a comenzii</Link>: este cea mai rapidă cale și lasă o
          urmă clară. Pentru orice altă situație ne poți contacta normal.
        </p>

        <p>
          Politica completă, împreună cu restul condițiilor contractuale, este parte din{' '}
          <Link href="/termeni-si-conditii/#anulare">Termenii și condițiile</Link> documentero.ro
          (secțiunea 8).
        </p>
      </LegalLayoutDocumentero>
    </>
  );
}
