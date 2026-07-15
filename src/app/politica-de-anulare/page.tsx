import Link from 'next/link';
import { buildPageMetadata, BASE_URL } from '@/lib/seo';
import { LegalLayout } from '@/components/legal/legal-layout';
import { createPublicClient } from '@/lib/supabase/public';

export const metadata = buildPageMetadata({
  title: 'Politica de Anulare și Rambursare',
  description:
    'Poți anula comanda în primele 30 de minute de la plată, direct din pagina de status, cu rambursare de 70%. Excepții, pași și termene — totul explicat clar.',
  path: '/politica-de-anulare/',
});

export const revalidate = 86400;

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Acasă', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Politica de Anulare', item: `${BASE_URL}/politica-de-anulare/` },
  ],
};

// Live lists from DB (processing_config.allow_self_cancel) — the policy page
// can never drift from what the cancel endpoint actually enforces. Revalidated
// daily together with the page.
// Detail per excluded service — spells out the variants so the client knows
// the exception covers ALL of them (e.g. constatator cu istoric).
const EXCLUDED_DETAILS: Record<string, string> = {
  'certificat-constatator':
    'toate variantele — de bază, IMM, insolvență, persoană fizică și cu istoric',
  'extras-carte-funciara': 'inclusiv extrasul de informare eliberat automat 24/7',
  'extras-plan-cadastral': 'intră imediat în procesare la ANCPI',
  rovinieta: 'odată emisă, valabilitatea pornește imediat și CNAIR nu o rambursează',
};

async function getCancellationLists(): Promise<{
  cancellable: string[];
  excluded: { name: string; detail?: string }[];
}> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('services')
    .select('slug, name, processing_config')
    .eq('is_active', true)
    .order('name');
  const cancellable: string[] = [];
  const excluded: { name: string; detail?: string }[] = [];
  for (const s of data ?? []) {
    const pc = s.processing_config as { allow_self_cancel?: boolean } | null;
    if (pc?.allow_self_cancel === false) {
      excluded.push({ name: s.name, detail: EXCLUDED_DETAILS[s.slug] });
    } else {
      cancellable.push(s.name);
    }
  }
  return { cancellable, excluded };
}

export default async function Page() {
  const { cancellable, excluded } = await getCancellationLists();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LegalLayout title="Politica de Anulare și Rambursare" updated="15 iulie 2026">
        <p>
          Pe scurt: <strong>ai 30 de minute de la confirmarea plății</strong> în care poți anula
          comanda singur, online, fără să ne contactezi — și primești înapoi <strong>70% din suma
          plătită</strong>. Mai jos găsești exact cum funcționează, care sunt excepțiile și ce se
          întâmplă după expirarea ferestrei.
        </p>

        <h2>Fereastra de anulare: 30 de minute</h2>
        <ul>
          <li>
            Fereastra începe la <strong>confirmarea plății</strong> (momentul în care primești
            emailul de confirmare a comenzii).
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
            Deschide pagina <Link href="/comanda/status/">Verificare status comandă</Link>.
          </li>
          <li>Introdu numărul comenzii (din emailul de confirmare) și adresa de email folosită la comandă.</li>
          <li>
            Dacă ești în fereastra de 30 de minute, vezi cardul <strong>„Anulare comandă”</strong> cu
            un cronometru live — apasă butonul și confirmă.
          </li>
          <li>
            Primești imediat un email de confirmare a cererii. Rambursarea de 70% se procesează pe
            <strong> aceeași metodă de plată</strong> (cardul folosit), în <strong>5–10 zile
            lucrătoare</strong>.
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

        <h2>Excepții — servicii care NU pot fi anulate</h2>
        <p>
          Serviciile cu <strong>eliberare automată instantanee</strong> intră în procesare în
          secundele de după plată, iar documentul se emite în câteva minute — anularea nu mai este
          posibilă după plasarea comenzii, iar opțiunea de anulare nu apare pentru ele:
        </p>
        <ul>
          {excluded.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong>
              {s.detail ? <> ({s.detail})</> : null}
            </li>
          ))}
        </ul>
        <p>
          Excepția acoperă <strong>toate variantele</strong> serviciilor de mai sus, indiferent de
          opțiunile alese în comandă.
        </p>
        <p>
          De asemenea, comanda nu mai poate fi anulată online dacă a fost deja{' '}
          <strong>expediată</strong> sau <strong>finalizată</strong>, indiferent de momentul cererii.
        </p>

        <h2>După expirarea celor 30 de minute</h2>
        <p>
          Anularea online nu mai este posibilă — cererea ta este deja în curs de procesare la
          autorități, iar serviciul este personalizat pe datele tale. Conform OUG 34/2014 art. 16
          lit. m), dreptul legal de retragere nu se aplică după începerea efectivă a prestării
          serviciului. Dacă ai o situație specială, scrie-ne la{' '}
          <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a> sau pe WhatsApp — analizăm
          fiecare caz.
        </p>

        <h2>Rambursare integrală (100%)</h2>
        <p>
          Dacă serviciul <strong>nu poate fi prestat din culpa noastră</strong> (de exemplu,
          instituția respinge cererea dintr-o eroare a noastră sau nu putem livra documentul
          comandat), primești <strong>rambursare integrală</strong>, fără să fie nevoie să soliciți
          anularea în vreo fereastră de timp.
        </p>
        <p>
          Atenție: dacă documentul nu poate fi eliberat din cauza <strong>datelor greșite furnizate
          de client</strong> sau a unei situații obiective la instituție (de exemplu, imobil
          neînscris în cartea funciară la serviciul de identificare imobil — caz în care se livrează
          documentul de respingere), rambursarea nu se acordă. Verifică datele cu atenție înainte de
          trimitere.
        </p>

        <h2>Întrebări frecvente</h2>
        <h3>Nu găsesc butonul de anulare. De ce?</h3>
        <p>
          Fie au trecut cele 30 de minute, fie serviciul comandat este unul cu eliberare instantanee
          (extras CF, constatator), fie comanda nu are încă plata confirmată. Butonul apare doar când
          anularea este efectiv posibilă.
        </p>
        <h3>În cât timp primesc banii?</h3>
        <p>
          În 5–10 zile lucrătoare de la înregistrarea cererii, pe cardul folosit la plată. Te
          anunțăm pe email când refundul a fost procesat.
        </p>
        <h3>Pot anula prin telefon sau email?</h3>
        <p>
          Fereastra de 30 de minute funcționează exclusiv prin pagina de{' '}
          <Link href="/comanda/status/">status comandă</Link> — este cea mai rapidă cale și lasă o
          urmă clară. Pentru orice altă situație ne poți contacta normal.
        </p>

        <p>
          Politica completă, împreună cu restul condițiilor contractuale, este parte din{' '}
          <Link href="/termeni-si-conditii/#anulare">Termenii și condițiile</Link> eGhișeul.ro
          (secțiunea 8).
        </p>
      </LegalLayout>
    </>
  );
}
