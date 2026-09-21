import { BRANDS } from '@/lib/brand/brands';
import { DOCUMENTERO_SERVICES_MENU } from '@/config/documentero-nav';
import { publishedGuides } from '@/lib/documentero/content';

/**
 * llms.txt for documentero.ro (llmstxt.org). Ignored by Google; read by some
 * AI agents. One line per public page, nothing that is not on the site.
 */
export function GET(): Response {
  const base = BRANDS.documentero.baseUrl;
  const services = DOCUMENTERO_SERVICES_MENU.filter((s) => !s.href.includes('#')).map((s) => `- [${s.label}](${base}${s.href}): ${s.hint}`);
  const guides = publishedGuides().map((g) => `- [${g.title}](${base}/ghiduri/${g.slug}/): ${g.desc}`);
  const lines = [
    '# documentero.ro',
    '',
    '> Serviciu privat din România (eDigitalizare SRL, Satu Mare) care obține acte de stare civilă prin avocat: duplicat certificat de naștere, duplicat certificat de căsătorie, adeverință privind statutul civil (certificat de celibat) și extrase multilingve UE. Clientul semnează împuternicirea avocațială pe telefon; avocatul depune cererea la primărie; originalul ajunge prin curier, în România sau în străinătate. Nu suntem instituție publică; actele le eliberează oficiile de stare civilă.',
    '',
    '## Servicii',
    ...services,
    '',
    '## Ghiduri',
    ...guides,
    '',
    '## Despre',
    `- [Despre noi](${base}/despre/): firma, avocatul care depune cererile, cum lucrăm`,
    `- [Contact](${base}/contact/)`,
    `- [Termeni și condiții](${base}/termeni-si-conditii/)`,
    `- [Politica de anulare](${base}/politica-de-anulare/)`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
