/**
 * Documents the client signs AFTER the order, on the order status page
 * („Documente de semnat"): the OCPI archive request (Anexa 1) and the
 * convention with the topograph, written for one specific job.
 *
 * One request carries ONE flat map of fields shared by every document it
 * contains (the applicant's name and ID appear in both), prefilled from the
 * order and editable by whoever asks. The client may complete the identity
 * fields before signing when the request asks for the ID card.
 *
 * Templates: src/templates/shared/{cerere-arhiva-ocpi,conventie-semnare}.docx,
 * generated from src/templates/sources/*.html with LibreOffice (edit the HTML,
 * then regenerate — see docs/technical/specs/documente-de-semnat.md).
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { insertSignatureImages } from '@/lib/documents/signature-inserter';
import { formatPersonName } from '@/lib/format/person-name';
import { identifiableName } from '@/lib/orders/abandoned-progress';

export const SIGNABLE_KINDS = ['cerere-arhiva-ocpi', 'conventie'] as const;
export type SignableKind = (typeof SIGNABLE_KINDS)[number];

export function isSignableKind(v: unknown): v is SignableKind {
  return typeof v === 'string' && (SIGNABLE_KINDS as readonly string[]).includes(v);
}

export type FieldGroup = 'identitate' | 'contact' | 'imobil' | 'cerere' | 'conventie';

export interface SignableField {
  key: string;
  label: string;
  group: FieldGroup;
  hint?: string;
  multiline?: boolean;
  /** Fixed choices (rendered as a select). */
  options?: { value: string; label: string }[];
}

export const FIELD_GROUP_LABELS: Record<FieldGroup, string> = {
  identitate: 'Solicitant (din actul de identitate)',
  contact: 'Unde primește OCPI răspunsul',
  imobil: 'Imobilul',
  cerere: 'Cererea către OCPI',
  conventie: 'Convenția cu executantul',
};

const IDENTITY_FIELDS: SignableField[] = [
  { key: 'nume', label: 'Nume și prenume', group: 'identitate' },
  { key: 'cnp', label: 'CNP', group: 'identitate' },
  { key: 'ci_serie', label: 'Seria actului de identitate', group: 'identitate' },
  { key: 'ci_numar', label: 'Numărul actului de identitate', group: 'identitate' },
  { key: 'dom_localitate', label: 'Domiciliu — localitatea', group: 'identitate' },
  { key: 'dom_adresa', label: 'Domiciliu — stradă, nr., bloc, ap.', group: 'identitate' },
  { key: 'dom_judet', label: 'Domiciliu — județ / sector', group: 'identitate' },
];

/** The identity keys the client may complete when the request asks for the ID card. */
export const IDENTITY_KEYS = IDENTITY_FIELDS.map((f) => f.key);

const IMOBIL_FIELDS: SignableField[] = [
  { key: 'imobil_localitate', label: 'Localitatea / UAT imobilului', group: 'imobil' },
  { key: 'imobil_adresa', label: 'Adresa imobilului (stradă, nr.)', group: 'imobil' },
  { key: 'cf_numar', label: 'Nr. carte funciară', group: 'imobil' },
  { key: 'nr_cadastral', label: 'Nr. cadastral', group: 'imobil' },
];

export const SIGNABLE_DOCUMENTS: Record<
  SignableKind,
  { label: string; description: string; docType: string; template: string; fields: SignableField[] }
> = {
  'cerere-arhiva-ocpi': {
    label: 'Cerere copii din arhiva OCPI (Anexa 1)',
    description: 'Cererea pentru eliberarea copiilor după documentele din arhiva biroului de cadastru.',
    docType: 'cerere_arhiva_ocpi',
    template: 'cerere-arhiva-ocpi',
    fields: [
      ...IDENTITY_FIELDS,
      { key: 'telefon', label: 'Telefon', group: 'contact' },
      { key: 'email', label: 'E-mail', group: 'contact', hint: 'Adresa la care OCPI trimite copiile.' },
      { key: 'comunicare', label: 'Comunicarea copiilor', group: 'contact', options: [
        { value: 'email', label: 'e-mail' },
        { value: 'posta', label: 'prin poștă' },
        { value: 'sediu', label: 'la sediul BCPI' },
        { value: 'fax', label: 'fax' },
      ] },
      ...IMOBIL_FIELDS,
      { key: 'cf_localitate', label: 'Localitatea cărții funciare', group: 'imobil' },
      { key: 'ocpi', label: 'Oficiul (OCPI)', group: 'cerere', hint: 'Ex: BUCUREȘTI, CLUJ' },
      { key: 'bcpi', label: 'Biroul (BCPI)', group: 'cerere', hint: 'Ex: SECTORUL 4, TURDA' },
      {
        key: 'documente_solicitate',
        label: 'Documentele cerute',
        group: 'cerere',
        multiline: true,
        hint: 'Ex: Act notarial nr. 123 din 01.02.2024 emis de …',
      },
      { key: 'scop', label: 'Necesar la', group: 'cerere', hint: 'Ex: informare, succesiune' },
    ],
  },
  conventie: {
    label: 'Convenție cu executantul (angajament de execuție)',
    description: 'Mandatul prin care topograful cere date din arhiva BCPI, depune și ridică documentele.',
    docType: 'conventie',
    template: 'conventie-semnare',
    fields: [
      ...IDENTITY_FIELDS,
      ...IMOBIL_FIELDS,
      { key: 'obiect_lucrare', label: 'Obiectul lucrării', group: 'conventie', multiline: true },
      { key: 'onorariu', label: 'Onorariu', group: 'conventie', hint: 'Ex: 198,00 lei, TVA inclus' },
      { key: 'data_termen', label: 'Termenul curge de la', group: 'conventie' },
      { key: 'data_contract', label: 'Data contractului de prestări', group: 'conventie' },
      { key: 'executant_nume', label: 'Executant', group: 'conventie' },
      { key: 'executant_autorizare', label: 'Autorizația executantului', group: 'conventie' },
    ],
  },
};

/** Union of the fields of the chosen kinds, in display order, without duplicates. */
export function fieldsForKinds(kinds: SignableKind[]): SignableField[] {
  const seen = new Set<string>();
  const out: SignableField[] = [];
  for (const kind of SIGNABLE_KINDS) {
    if (!kinds.includes(kind)) continue;
    for (const f of SIGNABLE_DOCUMENTS[kind].fields) {
      if (seen.has(f.key)) continue;
      seen.add(f.key);
      out.push(f);
    }
  }
  return out;
}

/** Keeps only known keys of the chosen kinds, as trimmed strings (≤ 600 chars). */
export function sanitizeFields(kinds: SignableKind[], raw: unknown): Record<string, string> {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const out: Record<string, string> = {};
  for (const f of fieldsForKinds(kinds)) {
    const v = src[f.key];
    if (typeof v === 'string' || typeof v === 'number') {
      const s = String(v).trim().slice(0, 600);
      if (f.options && s && !f.options.some((o) => o.value === s)) continue;
      out[f.key] = s;
    }
  }
  return out;
}

// ──────────────────────────────────────────────────────────────
// Prefill from the order
// ──────────────────────────────────────────────────────────────

/** Default executant when the service carries no `verification_config.conventie`. */
export const DEFAULT_EXECUTANT = {
  name: 'Dumitrean Mircea Adrian',
  authorization: 'Seria RO-SM-F nr. 0092/2013',
};

const roDate = (d: Date) =>
  d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Bucharest' });

const upper = (s: string) => s.toLocaleUpperCase('ro-RO');

/** „București Sectorul 4" → „SECTORUL 4"; other localities → the locality. */
function bcpiFrom(locality: string, county: string): string {
  const sector = /sector(?:ul)?\s*(\d)/i.exec(locality);
  if (sector) return `SECTORUL ${sector[1]}`;
  return upper(locality || county);
}

export interface PrefillOrder {
  friendly_order_id?: string | null;
  order_number?: string | null;
  created_at: string;
  total_price?: number | null;
  customer_data?: Record<string, unknown> | null;
  services?: { name?: string | null; verification_config?: { conventie?: { executantName?: string; executantAuthorization?: string } } | null } | null;
}

/**
 * Best-effort values from the order. Everything stays editable: the order
 * rarely holds an ID card (the property services do not ask for one), so
 * the identity fields are often empty — that is what `ask_identity` is for.
 */
export function prefillFields(
  order: PrefillOrder,
  /**
   * The topograph when he asks: the OCPI answer goes to HIS phone / email, and
   * the client's contact is never handed to him (privacy — the portal only
   * shows the client's name). Absent when the team asks: client contact.
   */
  requester?: { email?: string | null; phone?: string | null } | null,
  now: Date = new Date()
): Record<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cd = (order.customer_data ?? {}) as Record<string, any>;
  const billing = cd.billing ?? {};
  const personal = cd.personal ?? {};
  const contact = cd.contact ?? {};
  const property = cd.property ?? {};
  const identified = cd.identified_property ?? {};

  const nameParts = identifiableName(cd);
  const nume =
    (nameParts ? formatPersonName(nameParts.lastName, nameParts.firstName) : '') ||
    String(property.beneficiaryName ?? '').trim();

  const county = String(identified.county || property.county || '').trim();
  const locality = String(identified.locality || property.imobilLocality || property.locality || '').trim();
  const cf = String(identified.carteFunciara || property.carteFunciara || '').trim();
  const cad = String(identified.cadastral || property.cadastral || property.topografic || '').trim();

  const executant = order.services?.verification_config?.conventie;
  const serviceName = String(order.services?.name ?? '').trim();
  const price = Number(order.total_price ?? 0);

  return {
    nume,
    cnp: String(property.beneficiaryCnp || personal.cnp || billing.cnp || '').trim(),
    ci_serie: String(property.beneficiaryIdSeries || personal.documentSeries || personal.ciSeries || '').trim(),
    ci_numar: String(property.beneficiaryIdNumber || personal.documentNumber || personal.ciNumber || '').trim(),
    dom_localitate: String(billing.city || '').trim(),
    dom_adresa: String(property.beneficiaryAddress || billing.address || '').trim(),
    dom_judet: String(billing.county || '').trim(),
    telefon: String((requester ? requester.phone : contact.phone) || '').trim(),
    email: String((requester ? requester.email : contact.email) || '').trim(),
    comunicare: 'email',
    imobil_localitate: locality,
    imobil_adresa: String(property.imobilStreet || '').trim(),
    cf_numar: cf,
    cf_localitate: locality,
    nr_cadastral: cad,
    ocpi: upper(county),
    bcpi: bcpiFrom(locality, county),
    documente_solicitate: '',
    scop: 'informare',
    obiect_lucrare: serviceName ? `Obținerea ${serviceName}` : '',
    onorariu: price > 0 ? `${price.toFixed(2).replace('.', ',')} lei, TVA inclus` : '',
    data_termen: roDate(now),
    data_contract: roDate(new Date(order.created_at)),
    executant_nume: executant?.executantName || DEFAULT_EXECUTANT.name,
    executant_autorizare: executant?.executantAuthorization || DEFAULT_EXECUTANT.authorization,
  };
}

/** Identity fields still empty — the client must fill them before signing. */
export function missingIdentityFields(fields: Record<string, string>): string[] {
  return IDENTITY_FIELDS.filter((f) => f.key !== 'dom_judet' && !fields[f.key]?.trim()).map((f) => f.key);
}

// ──────────────────────────────────────────────────────────────
// Rendering
// ──────────────────────────────────────────────────────────────

const BLANK = '……………';

export interface RenderOptions {
  orderNumber: string;
  /** PNG data URL / base64 of the client's signature. Absent = unsigned preview. */
  signatureBase64?: string;
  signedAt?: Date;
  ip?: string;
  brandName?: string;
}

/** Placeholder values for a template, with dotted blanks for empty fields. */
export function placeholderData(fields: Record<string, string>, opts: RenderOptions): Record<string, string> {
  const v = (k: string) => fields[k]?.trim() || BLANK;
  const join = (...parts: (string | undefined)[]) => parts.map((p) => p?.trim()).filter(Boolean).join(', ');
  const when = opts.signedAt ?? new Date();
  const com = fields.comunicare || 'email';

  return {
    NUME: v('nume'),
    CNP: v('cnp'),
    CI_SERIE: v('ci_serie'),
    CI_NUMAR: v('ci_numar'),
    DOM_LOCALITATE: v('dom_localitate'),
    DOM_ADRESA: v('dom_adresa'),
    DOM_JUDET: v('dom_judet'),
    DOMICILIU: join(fields.dom_adresa, fields.dom_localitate, fields.dom_judet) || BLANK,
    TELEFON: v('telefon'),
    EMAIL: v('email'),
    COM_EMAIL: com === 'email' ? 'x' : ' ',
    COM_POSTA: com === 'posta' ? 'x' : ' ',
    COM_SEDIU: com === 'sediu' ? 'x' : ' ',
    COM_FAX: com === 'fax' ? 'x' : ' ',
    IMOBIL_LOCALITATE: v('imobil_localitate'),
    IMOBIL_ADRESA: v('imobil_adresa'),
    CF_NUMAR: v('cf_numar'),
    CF_LOCALITATE: v('cf_localitate'),
    NR_CADASTRAL: v('nr_cadastral'),
    OCPI: v('ocpi'),
    BCPI: v('bcpi'),
    DOCUMENTE_SOLICITATE: v('documente_solicitate'),
    SCOP: v('scop'),
    OBIECT_LUCRARE: v('obiect_lucrare'),
    ONORARIU: v('onorariu'),
    DATA_TERMEN: v('data_termen'),
    DATA_CONTRACT: v('data_contract'),
    EXECUTANT_NUME: v('executant_nume'),
    EXECUTANT_AUTORIZARE: v('executant_autorizare'),
    NRCOMANDA: opts.orderNumber,
    DATA: roDate(when),
    SEMNATURA_CLIENT: opts.signatureBase64 ? 'SIG_CLIENT' : '',
    // The signed copy is filed at OCPI as is: no platform / IP line on it. The
    // audit trail (IP, time, hashes, consent) lives in signature_metadata.
    NOTA_SEMNARE: opts.signatureBase64 ? '' : 'Previzualizare — documentul nu este încă semnat.',
  };
}

function loadTemplate(name: string): Buffer {
  return readFileSync(join(process.cwd(), 'src', 'templates', 'shared', `${name}.docx`));
}

/** Renders one document as DOCX, with the client's signature when given. */
export function renderSignableDocx(kind: SignableKind, fields: Record<string, string>, opts: RenderOptions): Buffer {
  const zip = new PizZip(loadTemplate(SIGNABLE_DOCUMENTS[kind].template));
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    nullGetter: () => '',
  });
  doc.render(placeholderData(fields, opts));
  let buffer: Buffer = Buffer.from(doc.getZip().generate({ type: 'nodebuffer' }));
  if (opts.signatureBase64) {
    buffer = insertSignatureImages(buffer, [
      {
        marker: 'SIG_CLIENT',
        // The canvas sends a data URL; the inserter wants the bare base64.
        base64: opts.signatureBase64.replace(/^data:[^;]+;base64,/, ''),
        name: 'signature_client',
        widthPt: 120,
        heightPt: 40,
      },
    ]);
  }
  return buffer;
}
