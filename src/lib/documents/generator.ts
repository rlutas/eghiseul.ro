import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { readFileSync } from 'fs';
import { join } from 'path';
import { insertSignatureImages, type SignatureEntry } from './signature-inserter';
import { validateCNP, getCountyFromCNP } from '@/lib/validations/cnp';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface CompanyData {
  name: string;
  cui: string;
  registration_number: string;
  address: string;
  iban: string;
  bank: string;
  email: string;
  phone: string;
  signature_s3_key?: string;
}

export interface LawyerData {
  cabinet_name: string;
  lawyer_name: string;
  professional_address: string;
  cif: string;
  imputernicire_series: string;
  fee: number;
  signature_s3_key?: string;
  stamp_s3_key?: string;
  ci_series?: string;
  ci_number?: string;
  cnp?: string;
}

export interface ClientData {
  name: string;
  firstName?: string;
  lastName?: string;
  cnp?: string;
  cui?: string;
  email: string;
  phone: string;
  address?: string;
  ci_series?: string;
  ci_number?: string;
  document_issued_by?: string;
  document_issue_date?: string;
  company_name?: string;
  company_reg?: string;
  company_address?: string;
  is_pj: boolean;
  // Extended fields for cerere templates
  father_name?: string;
  mother_name?: string;
  /** Marital status raw value from the civil-status wizard step
   *  ('necasatorit' | 'casatorit' | 'divortat' | 'vaduv'). Used by the
   *  stare-civilă împuternicire (UNBR Anexa II) template. */
  civil_status?: string;
  previous_name?: string;
  birth_date?: string;
  birth_county?: string;
  birth_country?: string;
  /** Localitatea nașterii (brută) — OCR-ul CI (personal.birthPlace, poate veni
   *  cu prefix „Jud. XX " / „Mun. ") sau civil_status.birthLocality. Curățată
   *  de buildLocNastere înainte de a intra pe cererea de extras multilingv. */
  birth_locality?: string;
  /** Județul nașterii colectat de pasul civil-status (birthCounty), când
   *  serviciul îl cere. Fallback: codul de județ din CNP (buildJudetNastere). */
  birth_judet?: string;
  /** Numele soțului/soției dinaintea căsătoriei
   *  (civil_status.spouseNameBeforeMarriage) — intră în {{SOTI}} pe cererea
   *  de extras multilingv de căsătorie. */
  spouse_name?: string;
  /** Data căsătoriei (civil_status.marriageDate, ISO sau RO) —
   *  {{DATA_CASATORIE}} pe cererea de extras multilingv de căsătorie. */
  marriage_date?: string;
  /** Județul care a înregistrat actul de căsătorie
   *  (civil_status.registrationPlace: „Sibiu" / „București (Sectorul N)").
   *  Pasul civil-status NU colectează localitatea separat, deci același
   *  string alimentează și localitatea, și județul căsătoriei pe cerere. */
  marriage_place?: string;
  /** Certificat de celibat (ANEXA 9): scopul e căsătoria în străinătate?
   *  (civil_status.marriageAbroadIntent). true → cererea pe varianta
   *  „încheierea căsătoriei în străinătate"; altfel varianta „alte situații"
   *  (cerere-eliberare-pf-alt-motiv.docx). */
  marriage_abroad_intent?: boolean;
  /** Viitorul soț/viitoarea soție (civil_status.futureSpouseName) —
   *  {{SOT_VIITOR}} pe cererea de celibat pentru căsătorie în străinătate. */
  future_spouse_name?: string;
  /** Cetățenia/naționalitatea viitorului soț (civil_status.nationality,
   *  colectată DOAR în fluxul căsătorie-în-străinătate al pasului
   *  civil-status) — {{CETATENIE_SOT}}. */
  future_spouse_citizenship?: string;
  /** Țara unde va avea loc căsătoria (civil_status.countryOfUse — întrebarea
   *  există din 16.07.2026; comenzile mai vechi nu o au → tag gol) —
   *  {{TARA_CASATORIE}}. */
  marriage_country?: string;
  /** Motivul liber al solicitării certificatului de celibat când scopul NU e
   *  căsătoria în străinătate (civil_status.purpose, ex. „Pentru viza") —
   *  {{MOTIV_CELIBAT}} pe varianta „alte situații" a cererii. */
  celibacy_purpose?: string;
  address_parts?: { county?: string; city?: string; sector?: string; street?: string; number?: string; building?: string; staircase?: string; floor?: string; apartment?: string; postalCode?: string };
  company_address_parts?: { county?: string; city?: string; street?: string; number?: string; building?: string; apartment?: string };
}

export interface SelectedOption {
  option_id?: string;
  optionId?: string;
  option_name?: string;
  optionName?: string;
  /** Stable code (e.g. 'urgenta', 'apostila_haga'). Used by the delivery
   *  calculator to assign per-step business days. */
  code?: string | null;
  quantity?: number;
  price_modifier?: number;
  priceModifier?: number;
  /** Cross-service bundling — when present, the option is a child of a
   *  parent option (e.g. an Apostilă Haga picked under the secondary
   *  "Certificat Integritate" service). Rendered indented in the contract's
   *  services breakdown. */
  bundledFor?: { parentOptionId?: string } | null;
  bundled_for?: { parent_option_id?: string } | null;
}

export interface DocumentContext {
  client: ClientData;
  company: CompanyData;
  lawyer?: LawyerData;
  order: {
    order_number: string;
    friendly_order_id: string;
    total_price: number;
    service_name: string;
    service_slug?: string;
    service_price: number;
    created_at: string;
    estimated_days?: number | null;
    urgent_days?: number | null;
    urgent_available?: boolean | null;
    /**
     * Estimated completion timestamp (ISO string, UTC). Computed by the
     * delivery calculator at submission time and stored on
     * `orders.estimated_completion_date`. When present, rendered into the
     * `{{ESTIMATED_DATE}}` placeholder; otherwise the placeholder stays blank.
     */
    estimated_completion_date?: string | null;
  };
  /** Selected service options for this order (e.g., urgent processing) */
  selected_options?: SelectedOption[];
  /** Per-step delivery breakdown — sum of base processing + each document
   *  add-on (traducere/legalizare/apostilă*) the customer picked. Computed
   *  by `estimateFromSelectedOptions` at submission time and passed in so
   *  the generator can render `{{TERMEN_LIVRARE_DETALIAT}}` without
   *  reaching back into the delivery calculator at template-build time. */
  delivery_estimate?: {
    minDays: number;
    maxDays: number;
    breakdown: Array<{ step: string; minDays: number; maxDays: number }>;
  } | null;
  document_numbers?: {
    contract_number?: number;
    contract_series?: string | null;
    imputernicire_number?: number;
    imputernicire_series?: string;
    registry_ids?: {
      contract?: string;
      delegation?: string;
    };
  };
  /** Reason for request (used in cerere-eliberare templates) */
  motiv_solicitare?: string;
  /** Client IP address (for contract legal validity) */
  client_ip?: string;
}

// ──────────────────────────────────────────────────────────────
// Template Loading
// ──────────────────────────────────────────────────────────────

/**
 * Load a DOCX template from the templates directory.
 * Templates are stored in src/templates/{service-slug}/{template-name}.docx
 */
function loadTemplate(serviceSlug: string, templateName: string): Buffer {
  // Try service-specific template first, then shared
  const paths = [
    join(process.cwd(), 'src', 'templates', serviceSlug, `${templateName}.docx`),
    join(process.cwd(), 'src', 'templates', 'shared', `${templateName}.docx`),
  ];

  for (const templatePath of paths) {
    try {
      return readFileSync(templatePath);
    } catch {
      continue;
    }
  }

  throw new Error(`Template not found: ${serviceSlug}/${templateName}`);
}

/**
 * Per-order template variant selection.
 *
 * Certificat de celibat (ANEXA 9) are DOUĂ cereri, alese după scopul din
 * pasul civil-status (customer_data.civil_status.marriageAbroadIntent):
 *  - scop „încheierea căsătoriei în străinătate" (marriageAbroadIntent=true)
 *    → certificat-celibat/cerere-eliberare-pf.docx (varianta cu viitorul soț,
 *      cetățenia lui și țara căsătoriei);
 *  - orice alt scop (false sau necompletat) →
 *    certificat-celibat/cerere-eliberare-pf-alt-motiv.docx (varianta „alte
 *    situații" cu {{MOTIV_CELIBAT}} = civil_status.purpose).
 *
 * Rezolvarea stă AICI (în generateDocument), nu în rute, ca selecția să fie
 * identică pentru toți apelanții (admin generate-document, auto-generate,
 * preview) fără ca vreunul să știe de variante.
 */
function resolveTemplateName(
  serviceSlug: string,
  templateName: string,
  ctx: DocumentContext
): string {
  if (
    serviceSlug === 'certificat-celibat' &&
    templateName === 'cerere-eliberare-pf' &&
    ctx.client.marriage_abroad_intent !== true
  ) {
    return 'cerere-eliberare-pf-alt-motiv';
  }
  return templateName;
}

// ──────────────────────────────────────────────────────────────
// Placeholder Building
// ──────────────────────────────────────────────────────────────

/**
 * Build a formatted client details block for contracts section 1.2.
 * Uses proper Romanian legal identification format:
 * PF: name, CI details, CNP, domiciliu (structured address)
 * PJ: company name, CUI, Nr. Reg. Com., sediu, reprezentant with CI/CNP
 */
export function buildClientDetailsBlock(client: ClientData): string {
  const parts: string[] = [];

  if (client.is_pj) {
    // PJ format: company details + legal representative
    parts.push(client.company_name || client.name);
    if (client.cui) parts.push(`CUI: ${client.cui}`);
    if (client.company_reg) parts.push(`Nr. Reg. Com.: ${client.company_reg}`);
    if (client.company_address) parts.push(`cu sediul în ${client.company_address}`);
    // Representative with CI details
    const repName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
    if (repName) {
      let repText = `reprezentată prin ${repName}`;
      if (client.ci_series && client.ci_number) {
        repText += `, legitimat/ă cu CI seria ${client.ci_series} nr. ${client.ci_number}`;
        if (client.document_issued_by) repText += `, emisă de ${client.document_issued_by}`;
      }
      if (client.cnp) repText += `, CNP ${client.cnp}`;
      parts.push(repText);
    }
  } else {
    // PF format: proper legal identification
    parts.push(client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim());

    // CI details
    if (client.ci_series && client.ci_number) {
      let ciText = `legitimat/ă cu CI seria ${client.ci_series} nr. ${client.ci_number}`;
      if (client.document_issued_by) ciText += `, emisă de ${client.document_issued_by}`;
      parts.push(ciText);
    }

    // CNP
    if (client.cnp) parts.push(`CNP ${client.cnp}`);

    // Structured address from ID card (preferred) or fallback to flat address
    const ap = client.address_parts;
    if (ap) {
      const addrParts: string[] = [];
      if (ap.street) addrParts.push(`Str. ${ap.street}`);
      if (ap.number) addrParts.push(`Nr. ${ap.number}`);
      if (ap.building) addrParts.push(`Bl. ${ap.building}`);
      if (ap.staircase) addrParts.push(`Sc. ${ap.staircase}`);
      if (ap.floor) addrParts.push(`Et. ${ap.floor}`);
      if (ap.apartment) addrParts.push(`Ap. ${ap.apartment}`);
      if (ap.city) addrParts.push(`Localitatea ${ap.city}`);
      if (ap.county) addrParts.push(`Jud. ${ap.county}`);
      if (addrParts.length > 0) {
        parts.push(`cu domiciliul în ${addrParts.join(', ')}`);
      }
    } else if (client.address) {
      parts.push(`cu domiciliul în ${client.address}`);
    }
  }

  return parts.join(', ');
}

/**
 * Check if the order has an urgent option selected.
 */
export function hasUrgentOption(selectedOptions?: SelectedOption[]): boolean {
  if (!selectedOptions || selectedOptions.length === 0) return false;
  return selectedOptions.some(opt => {
    const name = (opt.option_name || opt.optionName || '').toLowerCase();
    return name.includes('urgent');
  });
}

/**
 * Detailed delivery breakdown for the contract — sums the per-step business
 * days for the main service + every document add-on the customer selected
 * (traducere, legalizare, apostilă Haga, apostilă Notari). Bundled add-ons
 * picked under a secondary service share the same processing slot, so
 * duplicates are collapsed by the calculator.
 *
 * Output sample:
 *   Termen estimat: 5-7 zile lucrătoare
 *
 *   • Procesare urgentă: 1-2 zile
 *   • Traducere: 1-2 zile
 *   • Legalizare: 1 zi
 *   • Apostilă Haga: 1 zi
 *   • Apostilă Notari: 1 zi
 *
 *   Pentru situații care necesită verificări suplimentare, termenul poate fi prelungit cu până la 10 zile lucrătoare.
 *
 * The plain-text format renders cleanly in DOCX templates via the
 * `{{TERMEN_LIVRARE_DETALIAT}}` placeholder.
 */
export function buildDeliveryTermsDetailed(
  order: DocumentContext['order'],
  selectedOptions: SelectedOption[] | undefined,
  estimate: { minDays: number; maxDays: number; breakdown: Array<{ step: string; minDays: number; maxDays: number }> } | null
): string {
  if (!estimate || estimate.breakdown.length === 0) {
    // Fallback to the legacy single-line term when we don't have a full
    // breakdown (e.g. service with no delivery-calculator coverage).
    return buildDeliveryTerms(order, selectedOptions);
  }

  const fmtDays = (min: number, max: number): string => {
    if (min === max) return min === 1 ? '1 zi' : `${min} zile`;
    return `${min}-${max} zile`;
  };

  const lines: string[] = [];
  const totalLabel = fmtDays(estimate.minDays, estimate.maxDays) + ' lucrătoare';
  lines.push(`Termen estimat: ${totalLabel}`);
  lines.push('');
  for (const step of estimate.breakdown) {
    lines.push(`• ${step.step}: ${fmtDays(step.minDays, step.maxDays)}`);
  }
  lines.push('');
  lines.push(
    'Pentru situații care necesită verificări suplimentare, termenul poate fi prelungit cu până la 10 zile lucrătoare.'
  );
  return lines.join('\n');
}

/**
 * Build delivery terms text for the specific service ordered.
 * Only shows the relevant term (urgent or standard) based on selected options.
 */
export function buildDeliveryTerms(order: DocumentContext['order'], selectedOptions?: SelectedOption[]): string {
  const estimated = order.estimated_days;
  const urgent = order.urgent_days;
  const urgentAvailable = order.urgent_available;
  const isUrgent = hasUrgentOption(selectedOptions);

  if (!estimated && !urgent) {
    return 'Termenul de livrare va fi comunicat de prestator.';
  }

  const parts: string[] = [];

  if (isUrgent && urgentAvailable && urgent) {
    // Client selected urgent: show only urgent term
    parts.push(`${urgent === 1 ? '1 zi lucrătoare' : `${urgent} zile lucrătoare`} (procesare urgentă)`);
  } else if (estimated) {
    // Standard processing
    parts.push(`${estimated === 1 ? '1 zi lucrătoare' : `${estimated} zile lucrătoare`}`);
  }

  parts.push('Pentru situații care necesită verificări suplimentare, termenul poate fi prelungit cu până la 10 zile lucrătoare.');
  return parts.join('\n');
}

/** Autoritatea + documentul de ridicat, per serviciu — pentru textul
 *  activităților de pe împuternicire. */
const INSTITUTIE_MAP: Record<string, { authority: string; document: string }> = {
  'cazier-judiciar': { authority: 'IPJ SATU MARE', document: 'Cazier Judiciar' },
  'cazier-judiciar-persoana-fizica': { authority: 'IPJ SATU MARE', document: 'Cazier Judiciar' },
  'cazier-judiciar-persoana-juridica': { authority: 'IPJ SATU MARE', document: 'Cazier Judiciar' },
  'cazier-auto': { authority: 'IPJ SATU MARE', document: 'Cazier Auto' },
  'cazier-fiscal': { authority: 'ANAF SATU MARE', document: 'Cazier Fiscal' },
  'certificat-nastere': { authority: 'OFICIUL DE STARE CIVILĂ', document: 'Certificat de Naștere' },
  'certificat-casatorie': { authority: 'OFICIUL DE STARE CIVILĂ', document: 'Certificat de Căsătorie' },
  'certificat-celibat': { authority: 'OFICIUL DE STARE CIVILĂ', document: 'Certificat de Celibat' },
  'certificat-integritate': { authority: 'IPJ SATU MARE', document: 'Certificat de Integritate Comportamentală' },
  'extras-carte-funciara': { authority: 'OCPI SATU MARE', document: 'Extras de Carte Funciară' },
  'certificat-constatator': { authority: 'ONRC SATU MARE', document: 'Certificat Constatator' },
  'extras-multilingv-certificat-nastere': { authority: 'OFICIUL DE STARE CIVILĂ', document: 'Extras Multilingv de Naștere' },
  'extras-multilingv-certificat-casatorie': { authority: 'OFICIUL DE STARE CIVILĂ', document: 'Extras Multilingv de Căsătorie' },
};

// ──────────────────────────────────────────────────────────────
// Stare civilă — împuternicire UNBR (Anexa II la Statutul profesiei)
// ──────────────────────────────────────────────────────────────

/** Documentul de obținut, per serviciu de stare civilă — pentru textul
 *  „să exercite următoarele activități: să obțină {document}" de pe
 *  împuternicirea avocațială model UNBR. Doar aceste 5 slug-uri au
 *  template-ul nou (src/templates/<slug>/imputernicire.docx). */
const CIVIL_STATUS_DOCUMENT_MAP: Record<string, string> = {
  'certificat-nastere': 'certificatul de naștere',
  'certificat-casatorie': 'certificatul de căsătorie',
  'certificat-celibat': 'certificatul de celibat',
  'extras-multilingv-certificat-nastere': 'extrasul multilingv de naștere',
  'extras-multilingv-certificat-casatorie': 'extrasul multilingv de căsătorie',
};

/** Autoritatea în fața căreia avocatul asistă/reprezintă clientul la
 *  serviciile de stare civilă. */
export const AUTORITATE_STARE_CIVILA = 'OFICIUL DE STARE CIVILĂ SATU MARE';

// ──────────────────────────────────────────────────────────────
// Extras multilingv (ANEXA 4) + duplicat certificat (ANEXA 59) —
// cereri de eliberare
// ──────────────────────────────────────────────────────────────

/** Tipul actului de pe cererile de eliberare — {{TIP ACT}}/{{TIP_ACT}}.
 *  Folosit de cererea de extras multilingv (ANEXA 4) și de cererea de
 *  duplicat certificat de naștere (ANEXA 59, „certificatul de {{TIP ACT}}").
 *  Gol la orice alt serviciu (nullGetter golește oricum tag-urile lipsă). */
const CERERE_TIP_ACT: Record<string, string> = {
  'extras-multilingv-certificat-nastere': 'naștere',
  'extras-multilingv-certificat-casatorie': 'căsătorie',
  'certificat-nastere': 'naștere',
};

/** Data nașterii formatată DD.MM.YYYY — din client.birth_date (ISO sau RO)
 *  când există; altfel derivată dintr-un CNP valid. Gol când nu se știe. */
export function buildBirthDateRo(birthDateStr?: string, cnp?: string): string {
  const parsed = parseBirthDate(birthDateStr);
  if (parsed.day && parsed.month && parsed.year) {
    return `${parsed.day}.${parsed.month}.${parsed.year}`;
  }
  const result = validateCNP(cnp || '');
  if (result.valid && result.data) {
    const d = result.data.birthDate;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}`;
  }
  return '';
}

/** Localitatea nașterii pentru cerere — birth_locality curățată de prefixele
 *  pe care OCR-ul CI le include uneori („Jud. SM ", „Mun. ", „Com. "...).
 *  Aceleași regex-uri ca în cardul „Date extrase" din PersonalDataStep. */
export function buildLocNastere(client: ClientData): string {
  return (client.birth_locality || '')
    .replace(/^Jud\.\s*[A-ZĂÂÎȘȚ]{1,3}\s*/i, '')
    .replace(/^Județ\s+[A-ZĂÂÎȘȚa-zăâîșț]+\s*/i, '')
    .replace(/^(Mun|Or|Oraș|Com|Loc|Sat)\.\s*/i, '')
    .trim();
}

/** Județul nașterii — birth_judet (pasul civil-status) când e colectat,
 *  altfel din codul de județ al CNP-ului. „București (Sectorul N)" /
 *  „București Sector N" se normalizează la „București" (rubrica de pe
 *  cererea ANEXA 4 este „județul"). */
export function buildJudetNastere(client: ClientData): string {
  let judet = (client.birth_judet || '').trim();
  if (!judet && validateCNP(client.cnp || '').valid) {
    judet = getCountyFromCNP(client.cnp || '') || '';
  }
  return judet.replace(/^Bucure[sș]ti\b.*$/i, 'București');
}

/** Județul nașterii pe cererea de duplicat certificat de naștere (ANEXA 59).
 *  Pasul civil-status al serviciului certificat-nastere NU colectează
 *  birthLocality/birthCounty — colectează registrationPlace = județul unde e
 *  înregistrat actul de naștere (același câmp JSON pe care căsătoria îl
 *  folosește pentru județul căsătoriei; ajunge în client.marriage_place).
 *  Îl preferăm codului de județ din CNP (alegerea explicită a clientului
 *  bate derivarea); fallback: buildJudetNastere (birth_judet/CNP). */
export function buildJudetNastereCertificat(client: ClientData): string {
  const reg = (client.marriage_place || '')
    .trim()
    .replace(/^Bucure[sș]ti\b.*$/i, 'București');
  return reg || buildJudetNastere(client);
}

/** „{client} și {soț/soție}" — {{SOTI}} pe cererea de extras multilingv de
 *  căsătorie. Doar numele clientului când soțul/soția nu e colectat(ă). */
export function buildSoti(client: ClientData): string {
  const name = (client.name || '').trim();
  const spouse = (client.spouse_name || '').trim();
  if (!spouse) return name;
  return `${name} și ${spouse}`;
}

/** Data căsătoriei formatată DD.MM.YYYY — civil_status.marriageDate (ISO din
 *  input-ul de dată al pasului civil-status, sau deja RO). Gol când lipsește. */
export function buildMarriageDateRo(marriageDateStr?: string): string {
  const parsed = parseBirthDate(marriageDateStr);
  if (parsed.day && parsed.month && parsed.year) {
    return `${parsed.day}.${parsed.month}.${parsed.year}`;
  }
  return '';
}

/** Locul căsătoriei pentru cerere — civil_status.registrationPlace. Pasul
 *  colectează DOAR județul care a înregistrat actul (SearchableSelect de
 *  județe + sector pt București), fără localitate, deci același text intră
 *  și la „localitatea", și la „județul" de pe rândul căsătoriei.
 *  „București (Sectorul N)" se normalizează la „București" (ca la naștere). */
export function buildLocCasatorie(client: ClientData): string {
  return (client.marriage_place || '').trim().replace(/^Bucure[sș]ti\b.*$/i, 'București');
}

/** Județul căsătoriei — identic cu buildLocCasatorie (vezi nota de acolo). */
export function buildJudetCasatorie(client: ClientData): string {
  return buildLocCasatorie(client);
}

/** Gender from the CNP's first digit (1/3/5/7 = M, 2/4/6/8 = F). */
function genderFromCnp(cnp?: string): 'm' | 'f' | null {
  const first = (cnp || '').trim()[0];
  if ('1357'.includes(first || '')) return 'm';
  if ('2468'.includes(first || '')) return 'f';
  return null;
}

/** Romanian label for the wizard's maritalStatus value, gendered via CNP
 *  when possible ('casatorit' → „căsătorit"/„căsătorită"). */
export function buildStareCivilaLabel(civilStatus?: string, cnp?: string): string {
  const labels: Record<string, { m: string; f: string }> = {
    necasatorit: { m: 'necăsătorit', f: 'necăsătorită' },
    casatorit: { m: 'căsătorit', f: 'căsătorită' },
    divortat: { m: 'divorțat', f: 'divorțată' },
    vaduv: { m: 'văduv', f: 'văduvă' },
  };
  const entry = labels[(civilStatus || '').trim().toLowerCase()];
  if (!entry) return '';
  return genderFromCnp(cnp) === 'f' ? entry.f : entry.m;
}

/** Filiation line for the împuternicire: „fiul/fiica lui {tată} și {mamă}".
 *  Gendered via CNP when known. Placeholder "-" values (the cerere templates'
 *  visible-dash default) count as missing. Empty string when no parent known. */
export function buildFiliatie(fatherName?: string, motherName?: string, cnp?: string): string {
  const clean = (v?: string) => {
    const t = (v || '').trim();
    return t && t !== '-' ? t : '';
  };
  const parents = [clean(fatherName), clean(motherName)].filter(Boolean);
  if (parents.length === 0) return '';
  const gender = genderFromCnp(cnp);
  const fiu = gender === 'f' ? 'fiica' : gender === 'm' ? 'fiul' : 'fiul/fiica';
  return `${fiu} lui ${parents.join(' și ')}`;
}

/** Activity text for the stare-civilă împuternicire — „să obțină
 *  certificatul de naștere" etc. Empty for non-stare-civilă services. */
export function buildActivitatiStareCivila(serviceSlug?: string): string {
  const doc = CIVIL_STATUS_DOCUMENT_MAP[serviceSlug || ''];
  return doc ? `să obțină ${doc}` : '';
}

/**
 * Textul complet al activităților de pe împuternicire — placeholder
 * {{INSTITUTIE}}. Format (identic cu template-ul cazierjudiciaronline):
 *   „să se prezinte la IPJ SATU MARE, în vederea ridicării Cazier Judiciar.
 *    Motivul solicitării: AUTORITATI."
 * Înainte scria doar „IPJ SATU MARE - CAZIER AUTO", fără motiv.
 */
export function buildInstitutie(serviceSlug?: string, motiv?: string): string {
  const entry = INSTITUTIE_MAP[serviceSlug || ''];
  if (!entry) return serviceSlug || '';
  const motivPart = motiv?.trim() ? ` Motivul solicitării: ${motiv.trim()}.` : '';
  return `să se prezinte la ${entry.authority}, în vederea ridicării ${entry.document}.${motivPart}`;
}

/**
 * Build a CI/ID document info string: "seria XX nr. YYYYYY, emisă de ZZZZ"
 */
export function buildCIInfo(client: ClientData): string {
  if (!client.ci_series && !client.ci_number) return '';
  const parts: string[] = [];
  if (client.ci_series) parts.push(`seria ${client.ci_series}`);
  if (client.ci_number) parts.push(`nr. ${client.ci_number}`);
  if (client.document_issued_by) parts.push(`emisă de ${client.document_issued_by}`);
  return parts.join(' ');
}

/**
 * Build selected options list as readable text.
 */
export function buildOptionsText(selectedOptions?: SelectedOption[]): string {
  if (!selectedOptions || selectedOptions.length === 0) return '';
  return selectedOptions
    .map(opt => opt.option_name || opt.optionName || '')
    .filter(Boolean)
    .join(', ');
}

/**
 * Strip the marketing "(adaugă în aceeași comandă)" suffix from option names
 * before printing them in the contract. Mirrors the same normalization the
 * UI uses (see `lib/orders/normalize.ts`) so the customer sees consistent
 * names across the order summary, the contract and the admin order detail.
 */
function stripSecondaryServiceSuffix(name: string): string {
  return name
    .replace(/\s*\([^()]*\(adaugă în aceeași comandă\)\)\s*$/i, '')
    .replace(/\s*\(adaugă în aceeași comandă\)\s*$/i, '')
    .trim();
}

function formatRon(value: number): string {
  return `${value.toFixed(2)} RON`;
}

/**
 * Build a structured services breakdown for the contract — mirrors what the
 * customer saw in the order summary at checkout. Main service first, then
 * each top-level option indented under it, then each bundled "secondary
 * service" with its own options nested further.
 *
 * Output is plain text (no Markdown) — designed to render cleanly in a DOCX
 * template via `{{SERVICII_DETALIATE}}`. Example for a fully-loaded cazier
 * judiciar order:
 *
 *   Cazier Judiciar PF                                 198.00 RON
 *     • Procesare Urgentă                              +80.00 RON
 *     • Apostilă de la Haga                           +198.00 RON
 *     • Traducere Autorizată                          +178.50 RON
 *     • Legalizare Notarială                           +99.00 RON
 *     • Apostilă Notari                                +83.30 RON
 *   Certificat Integritate (serviciu secundar)        +100.00 RON
 *     • Apostilă de la Haga                           +198.00 RON
 *     • Traducere Autorizată                          +178.50 RON
 *
 *   Total comandă                                   1 233.30 RON
 */
export function buildServicesBreakdown(
  serviceName: string,
  basePrice: number,
  selectedOptions: SelectedOption[] | undefined,
  totalPrice: number
): string {
  const lines: string[] = [];

  // Header — main service.
  lines.push(`${serviceName} ${formatRon(basePrice)}`);

  if (selectedOptions && selectedOptions.length > 0) {
    // Identify top-level vs bundled options.
    const getOptionId = (o: SelectedOption) =>
      o.optionId ?? o.option_id ?? undefined;
    const getParentId = (o: SelectedOption) =>
      o.bundledFor?.parentOptionId ?? o.bundled_for?.parent_option_id ?? undefined;
    const getPrice = (o: SelectedOption) =>
      (o.priceModifier ?? o.price_modifier ?? 0) * (o.quantity ?? 1);
    const getName = (o: SelectedOption) =>
      stripSecondaryServiceSuffix(o.optionName ?? o.option_name ?? '');

    const topLevel = selectedOptions.filter((o) => !getParentId(o));
    const childrenByParent = new Map<string, SelectedOption[]>();
    for (const o of selectedOptions) {
      const pid = getParentId(o);
      if (pid) {
        const list = childrenByParent.get(pid) ?? [];
        list.push(o);
        childrenByParent.set(pid, list);
      }
    }

    // Top-level options that have NO children = main-service add-ons (e.g.
    // urgenta, apostila on the cazier itself).
    // Top-level options that DO have children = secondary services.
    const directAddons = topLevel.filter(
      (o) => !(getOptionId(o) && (childrenByParent.get(getOptionId(o)!)?.length ?? 0) > 0)
    );
    const subServices = topLevel.filter(
      (o) => getOptionId(o) && (childrenByParent.get(getOptionId(o)!)?.length ?? 0) > 0
    );

    for (const opt of directAddons) {
      lines.push(`  • ${getName(opt)} +${formatRon(getPrice(opt))}`);
    }

    for (const sub of subServices) {
      lines.push(
        `${getName(sub)} (serviciu secundar) +${formatRon(getPrice(sub))}`
      );
      const kids = childrenByParent.get(getOptionId(sub)!) ?? [];
      for (const kid of kids) {
        lines.push(`  • ${getName(kid)} +${formatRon(getPrice(kid))}`);
      }
    }
  }

  lines.push('');
  lines.push(`Total comandă ${formatRon(totalPrice)}`);
  return lines.join('\n');
}

/**
 * Build the full placeholder data object from the document context.
 */
function buildPlaceholderData(ctx: DocumentContext) {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dateLong = now.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateTimeFormatted = now.toLocaleString('ro-RO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const contractNum = ctx.document_numbers?.contract_number;
  const impNum = ctx.document_numbers?.imputernicire_number;

  const birthDate = parseBirthDate(ctx.client.birth_date);
  const ap = ctx.client.address_parts;
  const cap = ctx.client.company_address_parts;

  // Determine if urgent option was selected
  const isUrgent = hasUrgentOption(ctx.selected_options);

  // Build estimated days string for the selected processing type
  const estimatedDays = ctx.order.estimated_days;
  const urgentDays = ctx.order.urgent_days;
  const activeDays = (isUrgent && ctx.order.urgent_available && urgentDays) ? urgentDays : estimatedDays;
  const activeDaysText = activeDays
    ? (activeDays === 1 ? '1 zi lucrătoare' : `${activeDays} zile lucrătoare`)
    : '';

  return {
    // Client data
    NUMECLIENT: ctx.client.name,
    'CNP/CUI': ctx.client.is_pj ? ctx.client.cui : ctx.client.cnp,
    CLIENT_CNP: ctx.client.cnp || '',
    CLIENT_CUI: ctx.client.cui || '',
    EMAIL: ctx.client.email,
    CLIENT_PHONE: ctx.client.phone,
    CLIENT_ADDRESS: ctx.client.address || '',
    CLIENT_CI_SERIES: ctx.client.ci_series || '',
    CLIENT_CI_NUMBER: ctx.client.ci_number || '',
    CLIENT_COMPANY_NAME: ctx.client.company_name || '',
    CLIENT_COMPANY_REG: ctx.client.company_reg || '',
    CLIENT_COMPANY_ADDRESS: ctx.client.company_address || '',

    // CI document details (issued by)
    CLIENT_ISSUED_BY: ctx.client.document_issued_by || '',
    CLIENT_ISSUE_DATE: ctx.client.document_issue_date || '',
    EMIS_DE: ctx.client.document_issued_by || '',
    DATA_EMITERE_CI: ctx.client.document_issue_date || '',
    // CI full info: "seria XX nr. YYYYYY, emisă de ZZZZ"
    CLIENT_CI_INFO: buildCIInfo(ctx.client),
    // Aliases for CI - templates may use SERIE_CI/NUMAR_CI
    SERIE_CI: ctx.client.ci_series || '',
    NUMAR_CI: ctx.client.ci_number || '',

    // Client name parts (for cerere-eliberare-pf)
    CLIENT_FIRSTNAME: ctx.client.firstName || '',
    CLIENT_LASTNAME: ctx.client.lastName || '',
    CLIENT_PREVIOUS_NAME: ctx.client.previous_name || '',
    // Default to "-" so the printed cerere shows a visible dash when parent
    // names aren't collected. Step 2 (cazier judiciar PF) stopped asking for
    // these on 2026-05-27 — see auto-generate.ts for the upstream layer.
    CLIENT_FATHER_NAME: ctx.client.father_name || '-',
    CLIENT_MOTHER_NAME: ctx.client.mother_name || '-',

    // Birth date parts
    CLIENT_BIRTH_YEAR: birthDate.year,
    CLIENT_BIRTH_MONTH: birthDate.month,
    CLIENT_BIRTH_DAY: birthDate.day,
    CLIENT_BIRTH_COUNTY: ctx.client.birth_county || '',
    CLIENT_BIRTH_PLACE: ctx.client.birth_county || '',
    CLIENT_BIRTH_COUNTRY: ctx.client.birth_country || 'ROMANIA',

    // Client address parts (structured)
    CLIENT_COUNTY: ap?.county || '',
    CLIENT_CITY: ap?.city || '',
    CLIENT_SECTOR: ap?.sector || '',
    CLIENT_STREET: ap?.street || '',
    CLIENT_STREET_NR: ap?.number || '',
    CLIENT_BUILDING: ap?.building || '',
    CLIENT_STAIRCASE: ap?.staircase || '',
    CLIENT_FLOOR: ap?.floor || '',
    CLIENT_APARTMENT: ap?.apartment || '',
    CLIENT_POSTAL_CODE: ap?.postalCode || '',

    // Address aliases (templates may use short names)
    JUDET: ap?.county || '',
    LOCALITATE: ap?.city || '',
    SECTOR: ap?.sector || '',
    STRADA: ap?.street || '',

    // ANAF cerere cazier fiscal aliases (cazier-fiscal/cerere-eliberare-pf.docx,
    // ported from cazierjudiciaronline.com cerere-fiscal-template.docx).
    // The official ANAF form is filled in uppercase.
    NUME: (ctx.client.lastName || '').toUpperCase(),
    PRENUME: (ctx.client.firstName || '').toUpperCase(),
    CNP: ctx.client.cnp || '',
    JUDETUL: (ap?.county || '').toUpperCase(),
    LOCALITATEA: (ap?.city || '').toUpperCase(),
    STR: (ap?.street || '').toUpperCase(),
    NR: ap?.number || '',
    BL: ap?.building || '',
    SC: ap?.staircase || '',
    ET: ap?.floor || '',
    AP: ap?.apartment || '',
    COD_POSTAL: ap?.postalCode || '',
    DOMICILIU: ctx.client.address || '',
    ADRESA: ctx.client.address || '',

    // Company address parts (structured)
    CLIENT_COMPANY_CITY: cap?.city || '',
    CLIENT_COMPANY_COUNTY: cap?.county || '',
    CLIENT_COMPANY_STREET: cap?.street || '',
    CLIENT_COMPANY_NR: cap?.number || '',
    CLIENT_COMPANY_BL: cap?.building || '',
    CLIENT_COMPANY_AP: cap?.apartment || '',

    // Company data (prestator)
    NUMEFIRMAN: ctx.company.name,
    CUIFIRMAN: ctx.company.cui,
    NRORDINEFIRMAN: ctx.company.registration_number,
    IBANFIRMAN: ctx.company.iban,
    JUDETFIRMAN: extractJudet(ctx.company.address),
    JUDETFIRMA: extractJudet(ctx.company.address),
    COMUNAFIRMA: extractComuna(ctx.company.address),
    STRADASINRFIRMA: extractStrada(ctx.company.address),

    // Lawyer data
    LAWYER_NAME: ctx.lawyer?.lawyer_name || '',
    LAWYER_LASTNAME: (ctx.lawyer?.lawyer_name || '').split(' ')[0] || '',
    LAWYER_FIRSTNAME: (ctx.lawyer?.lawyer_name || '').split(' ').slice(1).join(' ') || '',
    LAWYER_CABINET: ctx.lawyer?.cabinet_name || '',
    LAWYER_ADDRESS: ctx.lawyer?.professional_address || '',
    LAWYER_CIF: ctx.lawyer?.cif || '',
    LAWYER_FEE: ctx.lawyer?.fee?.toString() || '15',
    LAWYER_JUDET: extractJudet(ctx.lawyer?.professional_address || ''),
    LAWYER_CI_SERIES: ctx.lawyer?.ci_series || '',
    LAWYER_CI_NUMBER: ctx.lawyer?.ci_number || '',
    LAWYER_CNP: ctx.lawyer?.cnp || '',

    // Signature placeholders (replaced with images in post-processing)
    SEMNATURA_CLIENT: '',
    SEMNATURA_PRESTATOR: '',
    SEMNATURA_AVOCAT: '',

    // Order data
    NRCOMANDA: ctx.order.friendly_order_id || ctx.order.order_number,
    TOTALPLATA: ctx.order.total_price.toFixed(2),
    NUMESERVICIU: ctx.order.service_name,
    SERVICE_PRICE: ctx.order.service_price.toFixed(2),

    // Document numbers
    NRCONTRACT: contractNum ? String(contractNum).padStart(6, '0') : '',
    IMPUTERNICIRE_NR: impNum ? String(impNum).padStart(6, '0') : '',
    IMPUTERNICIRE_SERIA: ctx.document_numbers?.imputernicire_series || ctx.lawyer?.imputernicire_series || 'SM',

    // Aliases for imputernicire template (user-created template uses short names)
    SERIE: ctx.document_numbers?.imputernicire_series || ctx.lawyer?.imputernicire_series || 'SM',
    NRDELEGATIE: impNum ? String(impNum).padStart(6, '0') : '',
    CLIENT: ctx.client.name,
    MOTIV: ctx.motiv_solicitare || 'Interes personal',
    DATAGENERAT: dateFormatted,
    INSTITUTIE: buildInstitutie(ctx.order.service_slug, ctx.motiv_solicitare),

    // Stare civilă — împuternicire model UNBR (Anexa II). Populated always;
    // only the per-service templates in src/templates/<slug-stare-civila>/
    // actually reference these tags, older templates ignore them.
    AN_CURENT: String(now.getFullYear()),
    STARE_CIVILA: buildStareCivilaLabel(ctx.client.civil_status, ctx.client.cnp),
    // „Nume Client (căsătorit)" — client name with the marital status from
    // the wizard's civil-status step, when collected.
    // Semantica tag-urilor = layoutul v3 al lui Raul (22.07):
    //  - CLIENT_STARE_CIVILA (randul 1) = DOAR numele clientului, fara paranteza;
    //  - NUMETATA+NUMEMAMA (randul 2, adiacente) = filiatia intreaga (fiul/fiica
    //    lui X si Y) - livrata prin NUMETATA, NUMEMAMA ramane gol;
    //  - FILIATIE (jos, dupa "status civil:") = eticheta starii civile
    //    (casatorit/a etc., acordata pe gen din CNP).
    CLIENT_STARE_CIVILA: ctx.client.name,
    FILIATIE: buildStareCivilaLabel(ctx.client.civil_status, ctx.client.cnp) || '-',
    hasFiliatie: buildFiliatie(ctx.client.father_name, ctx.client.mother_name, ctx.client.cnp) !== '',
    NUMETATA: buildFiliatie(ctx.client.father_name, ctx.client.mother_name, ctx.client.cnp),
    NUMEMAMA: '',
    ACTIVITATI_SC: buildActivitatiStareCivila(ctx.order.service_slug),
    AUTORITATE_SC: CIVIL_STATUS_DOCUMENT_MAP[ctx.order.service_slug || '']
      ? AUTORITATE_STARE_CIVILA
      : '',

    // Extras multilingv — cererea de eliberare (ANEXA 4). Template-ul lui Raul
    // (extras-multilingv-certificat-nastere/cerere-eliberare-pf.docx) folosește
    // {{TIP ACT}} (cu spațiu) și {{DATA_NASTERI}} (un singur I); alias-urile
    // canonice TIP_ACT/DATA_NASTERII sunt populate și ele pentru template-ele
    // viitoare.
    // Varianta de CĂSĂTORIE (extras-multilingv-certificat-casatorie/
    // cerere-eliberare-pf.docx, 22.07) REFOLOSEȘTE tagurile LOC_NASTERE/
    // JUDET_NASTERE pe rândul „titularul este căsătorit cu {{SOTI}} la data de
    // {{DATA_CASATORIE}}, în localitatea ..., județul ..." — la acel serviciu
    // cele două taguri primesc deci LOCUL CĂSĂTORIEI, nu al nașterii.
    // DATA_CASATORIE = scrierea lui Raul (fără I final); DATA_CASATORIEI +
    // LOC_CASATORIE/JUDET_CASATORIE = aliasurile canonice pt template viitoare.
    'TIP ACT': CERERE_TIP_ACT[ctx.order.service_slug || ''] || '',
    TIP_ACT: CERERE_TIP_ACT[ctx.order.service_slug || ''] || '',
    DATA_NASTERI: buildBirthDateRo(ctx.client.birth_date, ctx.client.cnp),
    DATA_NASTERII: buildBirthDateRo(ctx.client.birth_date, ctx.client.cnp),
    LOC_NASTERE: ctx.order.service_slug === 'extras-multilingv-certificat-casatorie'
      ? buildLocCasatorie(ctx.client)
      : buildLocNastere(ctx.client),
    JUDET_NASTERE: ctx.order.service_slug === 'extras-multilingv-certificat-casatorie'
      ? buildJudetCasatorie(ctx.client)
      : ctx.order.service_slug === 'certificat-nastere'
        ? buildJudetNastereCertificat(ctx.client)
        : buildJudetNastere(ctx.client),
    SOTI: buildSoti(ctx.client),
    DATA_CASATORIE: buildMarriageDateRo(ctx.client.marriage_date),
    DATA_CASATORIEI: buildMarriageDateRo(ctx.client.marriage_date),
    LOC_CASATORIE: buildLocCasatorie(ctx.client),
    JUDET_CASATORIE: buildJudetCasatorie(ctx.client),

    // Certificat de celibat — cererea ANEXA 9 (template-ele lui Raul, 22.07).
    // Ambele variante scriu {{DATA_NASTERE}} (fără I final — a treia grafie,
    // după DATA_NASTERI/DATA_NASTERII; toate trei rămân populate identic).
    // Varianta „căsătorie în străinătate": {{SOT_VIITOR}} =
    // civil_status.futureSpouseName, {{CETATENIE_SOT}} =
    // civil_status.nationality (naționalitatea viitorului soț),
    // {{TARA_CASATORIE}} = civil_status.countryOfUse (întrebare adăugată
    // 16.07.2026 — comenzile mai vechi nu o au, tagul rămâne gol).
    // Varianta „alte situații": {{MOTIV_CELIBAT}} = civil_status.purpose.
    DATA_NASTERE: buildBirthDateRo(ctx.client.birth_date, ctx.client.cnp),
    SOT_VIITOR: ctx.client.future_spouse_name || '',
    CETATENIE_SOT: ctx.client.future_spouse_citizenship || '',
    TARA_CASATORIE: ctx.client.marriage_country || '',
    MOTIV_CELIBAT: ctx.client.celibacy_purpose || '',

    // Certificat de naștere — cererea de duplicat ANEXA 59 (template-ul lui
    // Raul, 22.07: certificat-nastere/cerere-eliberare-pf.docx). Tag-uri
    // partajate cu ANEXA 4: {{TIP ACT}}, {{DATA_NASTERI}}, {{LOC_NASTERE}},
    // {{JUDET_NASTERE}} (la certificat-nastere județul vine din
    // registrationPlace — vezi buildJudetNastereCertificat), {{DATAGENERAT}}.
    // {{NUME_NASTERE}} = numele la naștere de pe rândul „m-am născut cu
    // numele de familie ..." — civil_status.birthName (colectat ca nume
    // COMPLET la naștere, ex. „MOLDOVAN IONEL-ALIN"; nu doar numele de
    // familie — pasul nu le colectează separat). Fallback: numele curent.
    NUME_NASTERE: ctx.client.previous_name || ctx.client.name || '',

    // Dates
    DATA: dateFormatted,
    DATACOMANDA: new Date(ctx.order.created_at).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    DATASIORA: dateTimeFormatted,
    GENERATED_AT: dateTimeFormatted,
    DATE_LONG: dateLong,

    // Client IP (for contract legal validity)
    CLIENT_IP: ctx.client_ip || 'N/A',

    // Request reason (for cerere templates)
    MOTIV_SOLICITARE: ctx.motiv_solicitare || 'Interes personal',

    // Conditional flags (for docxtemplater conditionals)
    isPJ: ctx.client.is_pj,
    isPF: !ctx.client.is_pj,
    isUrgent,
    isStandard: !isUrgent,

    // Selected options
    OPTIUNI_SELECTATE: buildOptionsText(ctx.selected_options),
    hasUrgent: isUrgent,

    // Terms / deadlines - only the relevant one based on selected options
    TERMEN_ZILE: activeDaysText,
    TERMEN_STANDARD: estimatedDays ? (estimatedDays === 1 ? '1 zi lucrătoare' : `${estimatedDays} zile lucrătoare`) : '',
    TERMEN_URGENT: (ctx.order.urgent_available && urgentDays) ? (urgentDays === 1 ? '1 zi lucrătoare' : `${urgentDays} zile lucrătoare`) : '',

    // Concrete estimated completion date — computed by delivery-calculator at
    // submission time. Formatted long-form in Romanian when available.
    ESTIMATED_DATE: ctx.order.estimated_completion_date
      ? new Date(ctx.order.estimated_completion_date).toLocaleDateString('ro-RO', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
      : '',
    ESTIMATED_DATE_ISO: ctx.order.estimated_completion_date
      ? new Date(ctx.order.estimated_completion_date).toISOString().slice(0, 10)
      : '',

    // Compound: beneficiary details block for contracts
    CLIENT_DETAILS_BLOCK: buildClientDetailsBlock(ctx.client),

    // Compound: delivery terms for the specific service (only relevant term shown)
    TERMEN_LIVRARE: buildDeliveryTerms(ctx.order, ctx.selected_options),

    // Detailed services + delivery breakdown — match the order summary the
    // customer saw at checkout. SERVICII_DETALIATE includes main service,
    // its add-ons (indented), secondary services (Certificat Integritate),
    // and their nested add-ons, plus the total. TERMEN_LIVRARE_DETALIAT
    // shows the per-step day breakdown from the delivery calculator.
    SERVICII_DETALIATE: buildServicesBreakdown(
      ctx.order.service_name,
      ctx.order.service_price,
      ctx.selected_options,
      ctx.order.total_price
    ),
    TERMEN_LIVRARE_DETALIAT: buildDeliveryTermsDetailed(
      ctx.order,
      ctx.selected_options,
      ctx.delivery_estimate ?? null
    ),
  };
}

// ──────────────────────────────────────────────────────────────
// Date Parsing Helper
// ──────────────────────────────────────────────────────────────

function parseBirthDate(dateStr?: string): { year: string; month: string; day: string } {
  if (!dateStr) return { year: '', month: '', day: '' };
  // Try YYYY-MM-DD
  const iso = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return { year: iso[1], month: iso[2].padStart(2, '0'), day: iso[3].padStart(2, '0') };
  // Try DD.MM.YYYY
  const ro = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (ro) return { year: ro[3], month: ro[2].padStart(2, '0'), day: ro[1].padStart(2, '0') };
  return { year: '', month: '', day: '' };
}

// ──────────────────────────────────────────────────────────────
// Address Parsing Helpers
// ──────────────────────────────────────────────────────────────

function extractJudet(address: string): string {
  const match = address.match(/Jud\.\s*([^,]+)/i);
  return match ? match[1].trim() : '';
}

function extractComuna(address: string): string {
  const match = address.match(/com\.\s*([^,]+)/i);
  return match ? match[1].trim() : '';
}

function extractStrada(address: string): string {
  const match = address.match(/str\.\s*(.+)/i);
  return match ? match[1].trim() : '';
}

// ──────────────────────────────────────────────────────────────
// Document Generation
// ──────────────────────────────────────────────────────────────

export interface GenerateDocumentOptions {
  /** Client's drawn signature (base64 PNG) */
  clientSignatureBase64?: string;
  /** Company/prestator predefined signature (base64 PNG) */
  companySignatureBase64?: string;
  /** Lawyer/avocat predefined signature (base64 PNG) */
  lawyerSignatureBase64?: string;
}

/**
 * Generate a filled DOCX document from a template.
 * Returns the filled document as a Buffer.
 */
export function generateDocument(
  serviceSlug: string,
  templateName: string,
  context: DocumentContext,
  options?: GenerateDocumentOptions
): Buffer {
  const templateBuffer = loadTemplate(
    serviceSlug,
    resolveTemplateName(serviceSlug, templateName, context)
  );
  const zip = new PizZip(templateBuffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    nullGetter: () => '',
  });

  const data = buildPlaceholderData(context);

  // Set text markers for each signature that has data
  // Post-processing will replace these markers with actual images
  if (options?.clientSignatureBase64) {
    data.SEMNATURA_CLIENT = 'SIG_CLIENT';
  }
  if (options?.companySignatureBase64) {
    data.SEMNATURA_PRESTATOR = 'SIG_COMPANY';
  }
  if (options?.lawyerSignatureBase64) {
    data.SEMNATURA_AVOCAT = 'SIG_LAWYER';
  }

  doc.render(data);

  let buffer: Buffer = Buffer.from(doc.getZip().generate({ type: 'nodebuffer' }));

  // Post-process: replace signature marker text with actual images
  const signatures: SignatureEntry[] = [];
  if (options?.clientSignatureBase64) {
    signatures.push({
      marker: 'SIG_CLIENT',
      base64: options.clientSignatureBase64,
      name: 'signature_client',
      widthPt: 120,
      heightPt: 40,
    });
  }
  if (options?.companySignatureBase64) {
    signatures.push({
      marker: 'SIG_COMPANY',
      base64: options.companySignatureBase64,
      name: 'signature_company',
      widthPt: 120,
      heightPt: 40,
    });
  }
  if (options?.lawyerSignatureBase64) {
    signatures.push({
      marker: 'SIG_LAWYER',
      base64: options.lawyerSignatureBase64,
      name: 'signature_lawyer',
      widthPt: 120,
      heightPt: 40,
    });
  }
  if (signatures.length > 0) {
    buffer = insertSignatureImages(buffer, signatures);
  }

  return buffer;
}

/**
 * Generate all auto-generated documents for an order at payment time.
 * Returns array of generated document buffers with metadata.
 */
export async function generatePaymentDocuments(
  context: DocumentContext,
  serviceSlug: string,
  templates: string[]
): Promise<Array<{ buffer: Buffer; type: string; fileName: string }>> {
  const results: Array<{ buffer: Buffer; type: string; fileName: string }> = [];

  for (const template of templates) {
    try {
      const buffer = generateDocument(serviceSlug, template, context);
      const contractNum = context.document_numbers?.contract_number;
      const impNum = context.document_numbers?.imputernicire_number;

      let fileName: string;
      let docType: string;

      switch (template) {
        case 'contract-prestari':
          docType = 'contract_prestari';
          fileName = `contract-prestari-${contractNum ? String(contractNum).padStart(6, '0') : 'draft'}.docx`;
          break;
        case 'contract-asistenta':
          docType = 'contract_asistenta';
          fileName = `contract-asistenta-${contractNum ? String(contractNum).padStart(6, '0') : 'draft'}.docx`;
          break;
        case 'imputernicire':
          docType = 'imputernicire';
          fileName = `imputernicire-${context.lawyer?.imputernicire_series || 'SM'}${impNum ? String(impNum).padStart(6, '0') : 'draft'}.docx`;
          break;
        default:
          docType = template.replace(/-/g, '_');
          fileName = `${template}.docx`;
      }

      results.push({ buffer, type: docType, fileName });
    } catch (error) {
      console.error(`Failed to generate ${template}:`, error);
      // Continue with other documents
    }
  }

  return results;
}
