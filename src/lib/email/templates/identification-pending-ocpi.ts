/**
 * "Imobilul nu apare în e-Terra — am cerut certificatul oficial la OCPI".
 *
 * Sent when the topograph reports that an identificare-imobil order could not
 * be resolved online and files the ANCPI service 2.7.8 (by address) / 2.7.6
 * (by owner) at OCPI. The client learns three things: what we searched, what
 * we filed instead, and that the answer is a document either way — OCPI's
 * document confirming the (digitised) CF, or the official negative one. That
 * document IS the complete service: the extract after it is a new order,
 * because the fee already went to OCPI (process confirmed with the
 * topograph, 25.09.2026). No credit, no free extract.
 */

import { brandedEmailHtml, bulletList, ctaButton, escHtml, infoRows } from './branded-layout';
import { BRANDS, type Brand } from '@/lib/brand/brands';

export interface IdentificationPendingOcpiEmailInput {
  friendlyOrderId: string;
  /** What the client gave us: address (+ locality, county) or owner name. */
  searchedFor: string;
  /** e.g. "OCPI București" — where the certificate was requested. */
  ocpiLabel: string;
  /** Absolute link to the public status page (pre-filled). */
  viewUrl: string;
  /** The ORDER's brand (orders.platform). */
  brand?: Brand;
}

const TERM = '10 zile lucrătoare';

export function renderIdentificationPendingOcpiEmail(input: IdentificationPendingOcpiEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { friendlyOrderId, searchedFor, ocpiLabel, viewUrl } = input;
  const b = input.brand ?? BRANDS.eghiseul;
  const subject = `Comanda ${friendlyOrderId}: imobilul nu apare în e-Terra — am cerut certificatul oficial la OCPI`;

  const rows = [
    { label: 'Număr comandă', value: friendlyOrderId, mono: true },
    { label: 'Am căutat', value: searchedFor },
    { label: 'Certificat cerut la', value: ocpiLabel },
    { label: 'Răspunsul OCPI', value: `în circa ${TERM}` },
  ];

  const outcomes = [
    'OCPI găsește cartea funciară în arhivă: o digitalizează și ne trimite documentul care o confirmă, cu numărul ei. Îl descarci din pagina comenzii. Dacă vrei apoi extrasul de carte funciară, îl comanzi separat la noi.',
    'OCPI nu găsește imobilul: primești documentul oficial de la OCPI care confirmă asta. Cu el, un topograf din zona ta poate face demersurile pentru înscrierea imobilului în cartea funciară.',
  ];
  const reasons = [
    'imobilul nu este intabulat: nu a fost niciodată înscris în cartea funciară, deci nu există extras;',
    'imobilul este intabulat pe sistemul vechi, pe hârtie, iar coala funciară nu a fost încă convertită în format electronic.',
  ];

  const content = `        <h1 style="margin:0 0 6px;font-size:20px;color:#0f172a;">Imobilul nu apare în e-Terra</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Bună! Am căutat imobilul din comanda ta în baza de date e-Terra a ANCPI, după adresă și după proprietar, și nu figurează înregistrat electronic. Ca să ai un răspuns oficial, am depus la ${escHtml(ocpiLabel)} o cerere de <strong>certificat privind înscrierea imobilului în evidențele de cadastru și carte funciară</strong>.</p>
        ${infoRows(rows)}
        <p style="margin:18px 0 8px;color:#0f172a;font-size:14px;font-weight:600;">Ce primești, în funcție de răspuns</p>
        ${bulletList(outcomes)}
        <p style="margin:0 0 8px;color:#0f172a;font-size:14px;font-weight:600;">De ce poate lipsi un imobil din e-Terra</p>
        ${bulletList(reasons)}
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Nu trebuie să faci nimic acum. Termenul dat de OCPI apare în pagina comenzii imediat ce depunem cererea. Te anunțăm pe email când vine răspunsul; documentul îl descarci tot din pagina comenzii.</p>
        ${ctaButton('Vezi stadiul comenzii', viewUrl)}`;

  const html = brandedEmailHtml({
    brand: input.brand,
    preheader: `Imobilul nu apare în e-Terra; am cerut certificatul oficial la ${ocpiLabel}. Răspuns în circa ${TERM}.`,
    content,
  });

  const text = [
    `Comanda ${friendlyOrderId}: imobilul nu apare în e-Terra`,
    '',
    `Am căutat: ${searchedFor}`,
    `Am depus la ${ocpiLabel} o cerere de certificat privind înscrierea imobilului în evidențele de cadastru și carte funciară. Răspunsul vine în circa ${TERM}.`,
    '',
    'Ce primești, în funcție de răspuns:',
    ...outcomes.map((o) => `- ${o}`),
    '',
    'De ce poate lipsi un imobil din e-Terra:',
    ...reasons.map((r) => `- ${r}`),
    '',
    `Vezi stadiul comenzii: ${viewUrl}`,
    '',
    `Întrebări? WhatsApp ${b.phoneDisplay} · ${b.contactEmail}`,
  ].join('\n');

  return { subject, html, text };
}
