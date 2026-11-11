import { BRANDS } from '@/lib/brand/brands';
import { CONSTATATOR_GUIDES } from '@/config/constatator-nav';

/** llms.txt for certificat-constatator-express.ro (llmstxt.org). Only what is on the site. */
export function GET(): Response {
  const base = BRANDS.constatator.baseUrl;
  const lines = [
    '# certificat-constatator-express.ro',
    '',
    '> Serviciu privat din România (eDigitalizare SRL, Satu Mare) care obține certificatul constatator de la Oficiul Național al Registrului Comerțului (ONRC) pentru firme, PFA și persoane fizice. Clientul scrie CUI-ul și plătește; cererea pleacă automat la ONRC, iar PDF-ul semnat electronic de ONRC vine pe email, de obicei în câteva minute. Prețul include taxa ONRC și TVA-ul. Nu suntem instituție publică și nu suntem afiliați ONRC; certificatul se poate cere și direct de la ONRC, plătind doar taxa.',
    '',
    '## Serviciu',
    `- [Certificat constatator online](${base}/): tipuri, prețuri, ce conține, valabilitate, PFA și puncte de lucru, întrebări frecvente`,
    ...(CONSTATATOR_GUIDES.length ? ['', '## Ghiduri', ...CONSTATATOR_GUIDES.map((g) => `- [${g.label}](${base}${g.href}): ${g.hint}`)] : []),
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
