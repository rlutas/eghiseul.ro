/**
 * "Imobilul nu apare în e-Terra — am cerut certificatul oficial la OCPI".
 *
 * Sent when the topograph reports that an identificare-imobil order could not
 * be resolved online and files the ANCPI service 2.7.8 (by address) / 2.7.6
 * (by owner) at OCPI. The client learns three things: what we searched, what
 * we filed instead, and that the answer is a document either way — the CF
 * number (then the extract) or the official negative certificate. No credit
 * and no free extract are promised: the certificate IS the complete service
 * (decizie Raul, 21.09.2026).
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
    'Certificatul conține numărul de carte funciară: obținem extrasul de carte funciară și ți-l trimitem imediat.',
    'Certificatul confirmă că imobilul nu figurează înscris: primești certificatul oficial de la OCPI, documentul cu care poți merge la notar sau la OCPI pentru înscrierea imobilului.',
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
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Nu trebuie să faci nimic acum. Te anunțăm pe email imediat ce vine răspunsul; documentul apare în pagina comenzii.</p>
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
