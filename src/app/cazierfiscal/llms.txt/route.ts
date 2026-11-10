import { BRANDS } from '@/lib/brand/brands';
import { CAZIERFISCAL_GUIDES } from '@/config/cazierfiscal-nav';

/** llms.txt for cazier-fiscal.ro (llmstxt.org). Only what is on the site. */
export function GET(): Response {
  const base = BRANDS.cazierfiscal.baseUrl;
  const lines = [
    '# cazier-fiscal.ro',
    '',
    '> Serviciu privat din România (eDigitalizare SRL, Satu Mare) care obține certificatul de cazier fiscal pentru persoane fizice prin avocat, fără cont SPV și fără drum la ANAF. Clientul semnează împuternicirea avocațială pe telefon; avocatul depune cererea; certificatul vine scanat pe email, iar originalul prin curier, la cerere. Nu suntem instituție publică și nu suntem afiliați ANAF; certificatul îl eliberează ANAF și se poate obține și gratuit, la ghișeu sau din SPV.',
    '',
    '## Serviciu',
    `- [Cazier fiscal online, prin avocat](${base}/): preț, termen, cum funcționează, variantele gratuite`,
    ...(CAZIERFISCAL_GUIDES.length ? ['', '## Ghiduri', ...CAZIERFISCAL_GUIDES.map((g) => `- [${g.label}](${base}${g.href}): ${g.hint}`)] : []),
    '',
    '## Despre',
    `- [Despre noi](${base}/despre/)`,
    `- [Contact](${base}/contact/)`,
    `- [Termeni și condiții](${base}/termeni-si-conditii/)`,
    `- [Politica de anulare](${base}/politica-de-anulare/)`,
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
