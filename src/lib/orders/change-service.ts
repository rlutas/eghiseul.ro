/**
 * „Schimbă serviciul" pe o comandă PLĂTITĂ — logica pură (fără DB).
 *
 * Cazul real (E-261007-K59HB): clientul a plătit Cazier Judiciar PF și voia
 * Cazier Fiscal / Cazier Auto, toate la 198 lei. Echipa mută comanda pe
 * serviciul corect fără bani: dacă prețul diferă, NU e treaba acestei rute
 * (anulare / comandă nouă / „Modifică" pentru opțiuni).
 *
 * Reguli (decise 02.11.2026):
 *  - doar comenzi plătite, ne-anulate, ne-rambursate, ne-finalizate;
 *  - doar între serviciile prin avocat (LAWYER_SERVICE_SLUGS): au același
 *    flux de documente (contract asistență + împuternicire cu nr. Barou),
 *    fără colaborator și fără joburi ONRC/ANCPI. Serviciile automate și cele
 *    imobiliare sunt refuzate;
 *  - serviciul țintă e activ, se vinde pe brandul comenzii și nu e pagina-hub
 *    (`cazier-judiciar`, care are doar variantele PF/PJ);
 *  - prețul de bază al țintei = prețul de bază PLĂTIT (`orders.base_price`).
 *    Comparăm baza, nu totalul, ca un cupon de reducere să nu blocheze fals
 *    o schimbare la același preț; opțiunile și livrarea rămân cum au fost
 *    plătite;
 *  - fiecare opțiune din catalog de pe comandă trebuie să existe activă și
 *    la țintă (urgența nu există la Cazier Fiscal, „cetățean străin" nu
 *    există la Cazier Auto etc.);
 *  - forma datelor: firmă ↔ persoană fizică e refuzată (cazierul s-ar emite
 *    pe alt subiect); stare civilă cere datele actului; cazier auto cere
 *    confirmarea că permisul e românesc (cel străin are alt preț și termen).
 *  - ce se poate completa DUPĂ schimbare (semnătură, poza permisului,
 *    prenumele părinților) apare ca „de făcut", nu blochează.
 */

import { isLawyerService } from '@/lib/documents/no-lawyer-services';
import { SERVICES_WITHOUT_CERERE } from '@/lib/documents/cerere-items';
import { instantPlatformProvider } from '@/lib/services/platform-services';
import { reuploadDocLabel } from '@/lib/reupload/doc-types';

/** Statusuri pe care schimbarea nu mai are sens. */
export const CHANGE_SERVICE_LOCKED_STATUSES: ReadonlySet<string> = new Set([
  'cancelled',
  'refunded',
  'completed',
  'shipped',
  'delivered',
]);

/** Statusuri la care actul pentru serviciul vechi poate fi deja depus. */
export const CHANGE_SERVICE_LATE_STATUSES: ReadonlySet<string> = new Set([
  'submitted_to_institution',
  'document_received',
  'extras_in_progress',
  'document_ready',
]);

/** Serviciile-hub (doar alegere PF/PJ), niciodată ținta unei comenzi. */
export const HUB_SERVICE_SLUGS: ReadonlySet<string> = new Set(['cazier-judiciar']);

/** Documentele GENERATE de noi care poartă numele/datele serviciului. */
export const REGENERABLE_DOC_LABELS: Readonly<Record<string, string>> = {
  contract_prestari: 'Contract de prestări servicii',
  contract_asistenta: 'Contract de asistență juridică',
  imputernicire: 'Împuternicire avocațială',
  cerere_eliberare_pf: 'Cerere de eliberare (PF)',
  cerere_eliberare_pj: 'Cerere de eliberare (PJ)',
};

export interface ServiceForSwitch {
  id: string;
  slug: string;
  name: string;
  base_price: number | string;
  is_active: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verification_config?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
}

export interface SelectedOptionForSwitch {
  code?: string;
  option_id?: string;
  optionId?: string;
  option_name?: string;
  optionName?: string;
  bundled_for?: unknown;
  bundledFor?: unknown;
  [key: string]: unknown;
}

export interface OrderForSwitch {
  status: string;
  payment_status: string | null;
  base_price: number | string | null;
  selected_options?: SelectedOptionForSwitch[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer_data?: any;
}

export interface TargetOptionForSwitch {
  id: string;
  code: string;
  is_active: boolean;
}

export interface SwitchEvaluationInput {
  order: OrderForSwitch;
  source: ServiceForSwitch;
  target: ServiceForSwitch;
  /** Opțiunile din catalog ale serviciului țintă. */
  targetOptions: TargetOptionForSwitch[];
  /** Brandul comenzii vinde serviciul țintă? */
  brandSellsTarget: boolean;
  /** Echipa a confirmat cu clientul că permisul e emis în România. */
  licenseConfirmedRomanian?: boolean;
}

export interface SwitchEvaluation {
  eligible: boolean;
  /** Motive care opresc schimbarea (româna, pentru echipă). */
  blockers: string[];
  /** Ce trebuie făcut după schimbare (nu blochează). */
  todo: string[];
  /** Avertismente (nu blochează). */
  warnings: string[];
  /** Ținta cere confirmarea permisului românesc (afișează bifa). */
  needsLicenseConfirmation: boolean;
  /** Diferența de preț pe serviciu (țintă − plătit), RON. */
  basePriceDelta: number;
}

const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

const lei = (n: number): string => `${n.toFixed(2).replace(/\.00$/, '')} lei`;

function optionLabel(o: SelectedOptionForSwitch): string {
  return (o.option_name as string) || (o.optionName as string) || o.code || 'opțiune';
}

function isBundled(o: SelectedOptionForSwitch): boolean {
  return !!(o.bundled_for || o.bundledFor);
}

/** Opțiunile din catalog pe care le verificăm la țintă (fără extra libere). */
function catalogOptions(options: SelectedOptionForSwitch[] | null | undefined): SelectedOptionForSwitch[] {
  return (Array.isArray(options) ? options : []).filter(
    (o) => !!o?.code && o.code !== 'custom_extra' && !isBundled(o)
  );
}

function uploadedDocTypes(cd: Record<string, unknown> | null | undefined): Set<string> {
  const out = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = (cd ?? {}) as any;
  for (const list of [c.personal?.uploadedDocuments, c.personalKyc?.uploadedDocuments, c.kyc?.documents]) {
    if (!Array.isArray(list)) continue;
    for (const d of list) if (d && typeof d.type === 'string') out.add(d.type);
  }
  return out;
}

export function isCompanyService(svc: ServiceForSwitch): boolean {
  return svc.verification_config?.companyKyc?.enabled === true;
}

export function isHubService(svc: ServiceForSwitch): boolean {
  return HUB_SERVICE_SLUGS.has(svc.slug) || svc.config?.is_hub_page === true;
}

function needsLicenseConfirmation(target: ServiceForSwitch): boolean {
  const vv = target.verification_config?.vehicleVerification;
  return vv?.enabled === true && vv?.foreignLicense?.enabled === true;
}

export function evaluateServiceSwitch(input: SwitchEvaluationInput): SwitchEvaluation {
  const { order, source, target } = input;
  const blockers: string[] = [];
  const todo: string[] = [];
  const warnings: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cd = (order.customer_data ?? {}) as any;

  const paidBase = toNum(order.base_price);
  const targetBase = toNum(target.base_price);
  const basePriceDelta = Math.round((targetBase - paidBase) * 100) / 100;

  // ── Comanda ────────────────────────────────────────────────────────────
  if (order.payment_status !== 'paid') {
    blockers.push('Comanda nu e plătită: serviciul se schimbă doar pe comenzi plătite (înainte de plată îl alege clientul).');
  }
  if (CHANGE_SERVICE_LOCKED_STATUSES.has(order.status)) {
    blockers.push(`Comanda e închisă sau deja trimisă (status: ${order.status}); serviciul nu se mai schimbă.`);
  }

  // ── Serviciul țintă ───────────────────────────────────────────────────
  if (target.slug === source.slug) {
    blockers.push(`Comanda este deja pe ${target.name}.`);
  }
  if (!target.is_active) blockers.push(`${target.name} nu este activ.`);
  if (isHubService(target)) {
    blockers.push(`${target.name} e doar pagina de alegere: alege varianta pentru persoană fizică sau juridică.`);
  }
  if (!input.brandSellsTarget) {
    blockers.push(`${target.name} nu se vinde pe site-ul pe care a fost plasată comanda.`);
  }
  if (instantPlatformProvider(source.slug) || instantPlatformProvider(target.slug)) {
    blockers.push('Serviciile emise automat (extras CF, plan cadastral, certificat constatator) nu se schimbă: documentul pleacă pe loc.');
  } else if (!isLawyerService(source.slug) || !isLawyerService(target.slug)) {
    blockers.push('Schimbarea serviciului merge doar între serviciile prin avocat (caziere, certificat de integritate, stare civilă). Pentru restul: anulare și comandă nouă.');
  }

  // ── Bani ──────────────────────────────────────────────────────────────
  if (basePriceDelta !== 0) {
    blockers.push(
      `Prețul diferă: clientul a plătit ${lei(paidBase)} pe serviciu, ${target.name} costă ${lei(targetBase)}. ` +
        'Aici se schimbă doar la același preț; diferențele de bani se fac din „Modifică" (sau anulare și comandă nouă).'
    );
  }

  const targetActiveCodes = new Set(input.targetOptions.filter((o) => o.is_active).map((o) => o.code));
  for (const o of catalogOptions(order.selected_options)) {
    if (!targetActiveCodes.has(o.code as string)) {
      blockers.push(
        `Opțiunea „${optionLabel(o)}" nu există la ${target.name}. Scoate-o întâi din „Modifică" (cu rambursare) sau alege alt serviciu.`
      );
    }
  }

  // ── Forma datelor ─────────────────────────────────────────────────────
  const tvc = target.verification_config ?? {};
  const srcCompany = isCompanyService(source);
  const tgtCompany = isCompanyService(target);
  if (srcCompany && !tgtCompany) {
    blockers.push(`Comanda e pe firmă, iar ${target.name} e pentru persoană fizică: cazierul s-ar emite pe alt titular. Anulare și comandă nouă.`);
  }
  if (tgtCompany && !srcCompany) {
    blockers.push(`${target.name} e pentru firmă: comanda nu are datele firmei (CUI, certificat de înregistrare). Anulare și comandă nouă.`);
  }
  if (tvc.civilStatus?.enabled === true && !(cd.civil_status || cd.civilStatus)) {
    blockers.push(`Lipsesc datele actului de stare civilă cerute de ${target.name} (locul înregistrării, datele actului).`);
  }
  if (tvc.personalKyc?.enabled === true && !cd.personal?.cnp) {
    blockers.push(`Lipsesc datele de identitate ale clientului (CNP) cerute de ${target.name}.`);
  }

  const licenseConfirm = needsLicenseConfirmation(target);
  if (licenseConfirm) {
    const abroad = cd.vehicle?.licenseIssuedAbroad;
    if (abroad === true) {
      blockers.push(`Permisul clientului e emis în străinătate: la ${target.name} are alt preț și alt termen. Anulare și comandă nouă.`);
    } else if (abroad !== false && !input.licenseConfirmedRomanian) {
      blockers.push(`Lipsesc datele permisului pentru ${target.name}: confirmă cu clientul că permisul e emis în România (bifa de mai jos).`);
    }
  }

  // ── De făcut după schimbare ───────────────────────────────────────────
  if (tvc.signature?.required === true && !cd.signature_s3_key) {
    todo.push('Lipsește semnătura clientului pe contract: trimite-i „Cere completare" după schimbare.');
  }
  const docs = uploadedDocTypes(cd);
  const extraDocs: unknown[] = Array.isArray(tvc.personalKyc?.extraDocuments) ? tvc.personalKyc.extraDocuments : [];
  for (const t of extraDocs) {
    if (typeof t === 'string' && !docs.has(t)) {
      todo.push(`Lipsește „${reuploadDocLabel(t)}" pentru ${target.name}: cere-o clientului cu „Solicită documente".`);
    }
  }
  if (tvc.personalKyc?.parentDataRequired === true && (!cd.personal?.fatherName || !cd.personal?.motherName)) {
    todo.push(`${target.name} cere prenumele părinților: completează-le din „Corectează datele clientului".`);
  }

  if (CHANGE_SERVICE_LATE_STATUSES.has(order.status)) {
    warnings.push(`Comanda e deja la instituție sau după (status: ${order.status}): verifică ce s-a depus pentru ${source.name} înainte să schimbi.`);
  }

  return {
    eligible: blockers.length === 0,
    blockers,
    todo,
    warnings,
    needsLicenseConfirmation: licenseConfirm && cd.vehicle?.licenseIssuedAbroad !== false,
    basePriceDelta,
  };
}

/**
 * Opțiunile comenzii, legate de catalogul serviciului țintă: același cod,
 * același preț plătit, doar id-ul opțiunii se schimbă (altfel „Modifică" nu
 * le mai recunoaște). Extra libere și copiii de pachet rămân neatinși.
 */
export function remapSelectedOptions(
  options: SelectedOptionForSwitch[] | null | undefined,
  targetOptions: TargetOptionForSwitch[]
): SelectedOptionForSwitch[] {
  const idByCode = new Map(targetOptions.filter((o) => o.is_active).map((o) => [o.code, o.id]));
  return (Array.isArray(options) ? options : []).map((o) => {
    if (!o?.code || o.code === 'custom_extra' || isBundled(o)) return o;
    const id = idByCode.get(o.code);
    if (!id) return o;
    const next = { ...o };
    if ('option_id' in next || !('optionId' in next)) next.option_id = id;
    if ('optionId' in next) next.optionId = id;
    return next;
  });
}

export interface DocumentImpact {
  /** Documente deja generate care poartă serviciul vechi (de regenerat). */
  toRegenerate: Array<{ type: string; label: string }>;
  /** Mesaje despre fluxul de documente / numerele de Barou. */
  notes: string[];
  sourceHasCerere: boolean;
  targetHasCerere: boolean;
}

export function describeDocumentImpact(
  source: Pick<ServiceForSwitch, 'slug' | 'name'>,
  target: Pick<ServiceForSwitch, 'slug' | 'name'>,
  existingDocTypes: string[]
): DocumentImpact {
  const seen = new Set<string>();
  const toRegenerate: DocumentImpact['toRegenerate'] = [];
  for (const t of existingDocTypes) {
    if (seen.has(t) || !REGENERABLE_DOC_LABELS[t]) continue;
    seen.add(t);
    toRegenerate.push({ type: t, label: REGENERABLE_DOC_LABELS[t] });
  }
  const sourceHasCerere = !SERVICES_WITHOUT_CERERE.has(source.slug);
  const targetHasCerere = !SERVICES_WITHOUT_CERERE.has(target.slug);
  const hadCerere = existingDocTypes.some((t) => t.startsWith('cerere_eliberare'));

  const notes: string[] = [];
  if (toRegenerate.length) {
    notes.push('Documentele generate au numele serviciului vechi: regenerează-le din „Procesare comandă". Cele vechi nu se șterg singure.');
  }
  notes.push('Numerele de Barou (contract și împuternicire) rămân aceleași: se mută pe serviciul nou în registru.');
  if (sourceHasCerere && !targetHasCerere) {
    notes.push(
      `${target.name} nu are cerere de eliberare (doar împuternicire)` +
        (hadCerere ? `: cererea generată pentru ${source.name} nu se mai folosește.` : '.')
    );
  } else if (!sourceHasCerere && targetHasCerere) {
    notes.push(`${target.name} are nevoie de cerere de eliberare: genereaz-o din „Procesare comandă".`);
  }
  return { toRegenerate, notes, sourceHasCerere, targetHasCerere };
}

/** Nota de factură, aceeași în previzualizare, răspuns și istoric. */
export function invoiceNote(invoiceNumber: string | null | undefined, sourceName: string): string {
  if (!invoiceNumber) {
    return 'Comanda nu are încă factură: se va emite cu serviciul nou.';
  }
  return `Factura ${invoiceNumber} rămâne cu denumirea serviciului vechi (${sourceName}); dacă trebuie refăcută, o face Raul / contabila.`;
}
