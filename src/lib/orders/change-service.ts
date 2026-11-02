/**
 * „Schimbă serviciul" pe o comandă PLĂTITĂ — logica pură (fără DB).
 *
 * Cazul real (E-261007-K59HB): clientul a plătit Cazier Judiciar PF și voia
 * Cazier Fiscal / Cazier Auto, toate la 198 lei. Echipa mută comanda pe
 * serviciul corect fără bani: dacă prețul diferă, NU e treaba acestei rute
 * (anulare / comandă nouă / „Modifică" pentru opțiuni).
 *
 * Reguli (prima versiune 02.11.2026, extinse de Raul în aceeași zi):
 *  - doar comenzi plătite; anulate, rambursate și cu anulare cerută sunt
 *    blocate. Finalizate / expediate / livrate SE POT schimba (corectarea
 *    evidenței după fapt): avertisment clar, termenul rămâne neatins, statusul
 *    nu se schimbă niciodată din acțiunea asta;
 *  - două familii, fără treceri între ele:
 *      • serviciile prin avocat (LAWYER_SERVICE_SLUGS): același flux de
 *        documente (contract asistență + împuternicire cu nr. Barou);
 *      • serviciile imobiliare prin topograf (modulul de imobil activ, fără
 *        emitere automată): copii OCPI, certificate, identificări;
 *    serviciile emise automat (extras CF, plan cadastral, constatator) sunt
 *    refuzate: documentul pleacă pe loc;
 *  - serviciul țintă e activ, se vinde pe brandul comenzii și nu e pagina-hub;
 *  - prețul: comparăm prețurile ACTUALE din catalog (serviciul curent vs
 *    țintă), nu prețul plătit — o comandă plătită la un preț vechi se poate
 *    muta dacă azi cele două servicii costă la fel. Banii nu se mișcă,
 *    prețurile salvate pe comandă rămân cele plătite;
 *  - fiecare opțiune din catalog de pe comandă trebuie să existe activă și
 *    la țintă;
 *  - forma datelor: firmă ↔ persoană fizică e refuzată; stare civilă cere
 *    datele actului; cazier auto cere confirmarea permisului românesc;
 *    imobiliarele cer câmpurile de imobil obligatorii la țintă (CF, adresă)
 *    și datele proprietarului pentru convenția cu topograful;
 *  - imobiliare: odată ce topograful a început lucrul (depunere OCPI,
 *    identificare raportată, document încărcat, status de la depunere
 *    încolo) sau robotul ANCPI a pornit jobul → blocat. Un job ANCPI doar în
 *    coadă (PENDING, fără comandă ePay) se șterge la aplicare: serviciul nou
 *    nu se emite automat. Colaboratorul care are comanda trebuie să vadă și
 *    serviciul nou (altfel dispare din portalul lui) → altfel blocat;
 *  - ce se poate completa DUPĂ schimbare (semnătură, poza permisului,
 *    prenumele părinților) apare ca „de făcut", nu blochează.
 */

import { isLawyerService } from '@/lib/documents/no-lawyer-services';
import { SERVICES_WITHOUT_CERERE } from '@/lib/documents/cerere-items';
import { instantPlatformProvider } from '@/lib/services/platform-services';
import { reuploadDocLabel } from '@/lib/reupload/doc-types';
import { statusLabel } from '@/lib/admin/status-badges';

/** Statusuri pe care schimbarea nu are sens (banii sunt întorși / pe drum înapoi). */
export const CHANGE_SERVICE_LOCKED_STATUSES: ReadonlySet<string> = new Set([
  'cancelled',
  'refunded',
  'cancellation_requested',
]);

/** Lucrarea e încheiată: schimbarea corectează doar evidența, termenul rămâne. */
export const CHANGE_SERVICE_FINISHED_STATUSES: ReadonlySet<string> = new Set([
  'completed',
  'shipped',
  'delivered',
]);

/** Statusuri la care actul pentru serviciul vechi poate fi deja depus. */
export const CHANGE_SERVICE_LATE_STATUSES: ReadonlySet<string> = new Set([
  'submitted_to_institution',
  'identification_pending_ocpi',
  'document_received',
  'extras_in_progress',
  'la_tradus',
  'la_legalizat',
  'la_apostila_notari',
  'eliberat_apostila_haga',
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
  conventie: 'Convenția cu topograful',
};

/** Documentul încărcat de topograf în portal = lucrarea e făcută. */
export const COLLABORATOR_DOC_TYPE = 'collaborator-document';

/** Câmpurile imobilului, cu eticheta pentru echipă. */
const PROPERTY_FIELD_LABELS: Readonly<Record<string, string>> = {
  county: 'județul',
  locality: 'localitatea (UAT)',
  carteFunciara: 'numărul de carte funciară',
  cadastral: 'numărul cadastral',
  topografic: 'numărul topografic',
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
  /** Prețul de bază PLĂTIT (doar informativ: comparația e pe catalogul actual). */
  base_price: number | string | null;
  selected_options?: SelectedOptionForSwitch[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer_data?: any;
  /** Alocare manuală pe comandă (portalul colaboratorului o vede oricum). */
  assigned_collaborator_id?: string | null;
}

export interface TargetOptionForSwitch {
  id: string;
  code: string;
  is_active: boolean;
}

/** Jobul robotului ANCPI pentru comandă (ancpi_jobs, unul per comandă). */
export interface AncpiJobForSwitch {
  id: string;
  status: string;
  ancpi_order_id?: string | null;
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
  /** Tipurile documentelor deja atașate comenzii (order_documents.type). */
  existingDocTypes?: string[];
  /** Jobul ANCPI al comenzii, dacă există. */
  ancpiJob?: AncpiJobForSwitch | null;
  /** Colaboratorii alocați pe serviciul curent / pe ținta (collaborator_service_assignments). */
  sourceCollaboratorIds?: string[];
  targetCollaboratorIds?: string[];
}

export type ServiceFamily = 'lawyer' | 'property' | 'instant' | 'other';

export interface SwitchEvaluation {
  eligible: boolean;
  /** Motive care opresc schimbarea (româna, pentru echipă). */
  blockers: string[];
  /** Ce trebuie făcut după schimbare (nu blochează). */
  todo: string[];
  /** Avertismente (nu blochează). */
  warnings: string[];
  /** Ce se schimbă concret pe comandă (previzualizare). */
  changes: string[];
  /** Ținta cere confirmarea permisului românesc (afișează bifa). */
  needsLicenseConfirmation: boolean;
  /** Diferența de preț în catalogul ACTUAL (țintă − serviciul curent), RON. */
  basePriceDelta: number;
  /** Comanda e încheiată: termenul (estimated_completion_date) nu se atinge. */
  keepEstimate: boolean;
  /** La aplicare: jobul ANCPI din coadă (nepornit) se șterge. */
  deletePendingAncpiJobId: string | null;
  family: ServiceFamily;
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

const filled = (v: unknown): boolean => typeof v === 'string' ? v.trim().length > 0 : v !== null && v !== undefined && v !== false;

export function isCompanyService(svc: ServiceForSwitch): boolean {
  return svc.verification_config?.companyKyc?.enabled === true;
}

export function isHubService(svc: ServiceForSwitch): boolean {
  return HUB_SERVICE_SLUGS.has(svc.slug) || svc.config?.is_hub_page === true;
}

/**
 * Familia serviciului pentru schimbare. Imobiliarele sunt recunoscute după
 * modulul de imobil activ (date, nu listă de slug-uri: catalogul topografului
 * crește), minus cele emise automat de robot.
 */
export function serviceFamily(svc: Pick<ServiceForSwitch, 'slug' | 'verification_config'>): ServiceFamily {
  if (instantPlatformProvider(svc.slug)) return 'instant';
  if (isLawyerService(svc.slug)) return 'lawyer';
  if (svc.verification_config?.propertyVerification?.enabled === true) return 'property';
  return 'other';
}

function needsLicenseConfirmation(target: ServiceForSwitch): boolean {
  const vv = target.verification_config?.vehicleVerification;
  return vv?.enabled === true && vv?.foreignLicense?.enabled === true;
}

/** Semnele că topograful a început deja lucrul pe comandă. */
function collaboratorWorkStarted(order: OrderForSwitch, docTypes: string[]): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cd = (order.customer_data ?? {}) as any;
  const sub = cd.ocpi_submission;
  if (sub && (sub.registration_number || sub.submitted_at)) {
    const nr = sub.registration_number ? ` (nr. ${sub.registration_number})` : '';
    return `Topograful a depus deja cererea la OCPI${nr}`;
  }
  if (cd.identified_property) return 'Topograful a raportat deja identificarea imobilului';
  if (cd.identification_result) return 'Topograful a raportat deja rezultatul identificării';
  if (docTypes.includes(COLLABORATOR_DOC_TYPE)) return 'Topograful a încărcat deja documentul lucrării';
  if (CHANGE_SERVICE_LATE_STATUSES.has(order.status) || CHANGE_SERVICE_FINISHED_STATUSES.has(order.status)) {
    return `Lucrarea e deja „${statusLabel(order.status)}"`;
  }
  return null;
}

export function evaluateServiceSwitch(input: SwitchEvaluationInput): SwitchEvaluation {
  const { order, source, target } = input;
  const blockers: string[] = [];
  const todo: string[] = [];
  const warnings: string[] = [];
  const changes: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cd = (order.customer_data ?? {}) as any;
  const docTypes = input.existingDocTypes ?? [];

  const paidBase = toNum(order.base_price);
  const sourceBase = toNum(source.base_price);
  const targetBase = toNum(target.base_price);
  const basePriceDelta = Math.round((targetBase - sourceBase) * 100) / 100;

  const srcFamily = serviceFamily(source);
  const tgtFamily = serviceFamily(target);
  const family: ServiceFamily = srcFamily === tgtFamily ? srcFamily : 'other';

  // ── Comanda ────────────────────────────────────────────────────────────
  if (order.payment_status !== 'paid') {
    blockers.push('Comanda nu e plătită: serviciul se schimbă doar pe comenzi plătite (înainte de plată îl alege clientul).');
  }
  if (CHANGE_SERVICE_LOCKED_STATUSES.has(order.status)) {
    blockers.push(`Comanda e „${statusLabel(order.status)}": serviciul nu se mai schimbă.`);
  }
  const finished = CHANGE_SERVICE_FINISHED_STATUSES.has(order.status);
  const late = CHANGE_SERVICE_LATE_STATUSES.has(order.status);

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
  if (srcFamily === 'instant' || tgtFamily === 'instant') {
    blockers.push('Serviciile emise automat (extras CF, plan cadastral, certificat constatator) nu se schimbă: documentul pleacă pe loc.');
  } else if (srcFamily !== tgtFamily || family === 'other') {
    blockers.push(
      'Serviciul se schimbă doar în aceeași familie: între serviciile prin avocat (caziere, certificat de integritate, stare civilă) ' +
        'sau între serviciile imobiliare prin topograf. Fluxurile sunt diferite: anulare și comandă nouă.'
    );
  }

  // ── Bani (catalogul ACTUAL, nu prețul plătit) ─────────────────────────
  if (basePriceDelta !== 0) {
    blockers.push(
      `Prețul diferă: azi ${source.name} costă ${lei(sourceBase)}, iar ${target.name} costă ${lei(targetBase)}. ` +
        'Aici se schimbă doar la același preț; diferențele de bani se fac din „Modifică" (sau anulare și comandă nouă).'
    );
  } else if (paidBase > 0 && paidBase !== sourceBase) {
    changes.push(
      `Clientul a plătit ${lei(paidBase)} pe serviciu (preț vechi); azi ambele servicii costă ${lei(sourceBase)}. ` +
        'Banii nu se mișcă: prețurile comenzii rămân cele plătite.'
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

  // ── Imobiliare: datele imobilului, topograful, robotul ANCPI ───────────
  if (tgtFamily === 'property') {
    const pv = tvc.propertyVerification ?? {};
    const p = (cd.property ?? {}) as Record<string, unknown>;
    for (const [field, label] of Object.entries(PROPERTY_FIELD_LABELS)) {
      if (pv.fields?.[field]?.required === true && !filled(p[field])) {
        blockers.push(`Comanda nu are ${label} imobilului, cerut de ${target.name}. Anulare și comandă nouă (sau completează întâi datele imobilului).`);
      }
    }
    const hasIdentifier = filled(p.carteFunciara) || filled(p.cadastral);
    if (pv.identificationService?.enabled === true) {
      if (!hasIdentifier && !filled(p.propertyAddress)) {
        blockers.push(`${target.name} cere adresa imobilului sau un număr de CF / cadastral; comanda nu are niciunul.`);
      }
    } else if (!hasIdentifier && pv.fields?.carteFunciara?.required !== true) {
      blockers.push(`${target.name} cere numărul de carte funciară sau cadastral; comanda are doar adresa (era o identificare). Anulare și comandă nouă.`);
    }
    if (tvc.conventie?.enabled === true) {
      const conventieOk = ['beneficiaryName', 'beneficiaryCnp', 'beneficiaryAddress', 'beneficiaryIdSeries', 'beneficiaryIdNumber'].every(
        (k) => filled(p[k])
      );
      if (!conventieOk) {
        blockers.push(`Lipsesc datele proprietarului pentru convenția cu topograful, cerute de ${target.name} (nume, CNP, adresă, act de identitate).`);
      }
    }
  }

  let deletePendingAncpiJobId: string | null = null;
  if (srcFamily === 'property' || tgtFamily === 'property') {
    const started = collaboratorWorkStarted(order, docTypes);
    if (started) {
      blockers.push(`${started}: cererea e pentru ${source.name} și nu se mai schimbă. Anulare și comandă nouă.`);
    }

    const assigned = order.assigned_collaborator_id ?? null;
    const handlers = new Set([...(input.sourceCollaboratorIds ?? []), ...(assigned ? [assigned] : [])]);
    const visibleAfter = new Set([...(input.targetCollaboratorIds ?? []), ...(assigned ? [assigned] : [])]);
    const lost = [...handlers].filter((c) => !visibleAfter.has(c));
    if (lost.length > 0) {
      blockers.push(
        `Topograful care are comanda nu lucrează pe ${target.name}: comanda ar dispărea din portalul lui. ` +
          'Alocă-i întâi serviciul din Colaboratori, sau anulare și comandă nouă.'
      );
    } else if (handlers.size > 0) {
      changes.push(`Comanda rămâne la același topograf; în portalul lui apare cu serviciul ${target.name}.`);
    } else if (visibleAfter.size > 0) {
      changes.push(`Comanda intră în portalul topografului (lucrează pe ${target.name}).`);
    }
  }

  const job = input.ancpiJob ?? null;
  if (job) {
    if (job.status === 'PENDING' && !job.ancpi_order_id) {
      deletePendingAncpiJobId = job.id;
      changes.push(`Jobul robotului ANCPI din coadă (încă nepornit) se șterge: ${target.name} nu se emite automat.`);
    } else {
      blockers.push(
        `Robotul ANCPI a pornit deja comanda (job: ${job.status}${job.ancpi_order_id ? `, comanda ePay ${job.ancpi_order_id}` : ''}): ` +
          'serviciul nu se mai schimbă. Verifică în pagina ANCPI și, la nevoie, anulare și comandă nouă.'
      );
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

  // ── Comandă deja la instituție sau încheiată ──────────────────────────
  if (finished || late) {
    warnings.push(
      `Comanda e deja „${statusLabel(order.status)}": schimbarea corectează doar evidența; ` +
        'documentele deja depuse/livrate nu se schimbă.'
    );
  }
  if (finished) {
    changes.push('Termenul rămâne cel de acum (comanda e încheiată).');
  }
  changes.push(`Statusul rămâne „${statusLabel(order.status)}".`);

  return {
    eligible: blockers.length === 0,
    blockers,
    todo,
    warnings,
    changes,
    needsLicenseConfirmation: licenseConfirm && cd.vehicle?.licenseIssuedAbroad !== false,
    basePriceDelta,
    keepEstimate: finished,
    deletePendingAncpiJobId,
    family,
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
  const lawyer = isLawyerService(source.slug) && isLawyerService(target.slug);
  const sourceHasCerere = lawyer && !SERVICES_WITHOUT_CERERE.has(source.slug);
  const targetHasCerere = lawyer && !SERVICES_WITHOUT_CERERE.has(target.slug);
  const hadCerere = existingDocTypes.some((t) => t.startsWith('cerere_eliberare'));

  const notes: string[] = [];
  if (toRegenerate.length) {
    notes.push('Documentele generate au numele serviciului vechi: regenerează-le din „Procesare comandă". Cele vechi nu se șterg singure.');
  }
  if (lawyer) {
    notes.push('Numerele de Barou (contract și împuternicire) rămân aceleași: se mută pe serviciul nou în registru.');
  } else {
    notes.push('Serviciu prin topograf: fără numere de Barou.');
  }
  if (sourceHasCerere && !targetHasCerere && lawyer) {
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
