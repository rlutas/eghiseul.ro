import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { readFileSync } from 'fs';
import { join } from 'path';
import { insertSignatureImages, type SignatureEntry } from './signature-inserter';

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
  previous_name?: string;
  birth_date?: string;
  birth_county?: string;
  birth_country?: string;
  address_parts?: { county?: string; city?: string; sector?: string; street?: string; number?: string; building?: string; staircase?: string; floor?: string; apartment?: string; postalCode?: string };
  company_address_parts?: { county?: string; city?: string; street?: string; number?: string; building?: string; apartment?: string };
}

export interface SelectedOption {
  option_id?: string;
  option_name?: string;
  optionName?: string;
  quantity?: number;
  price_modifier?: number;
  priceModifier?: number;
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

/**
 * Map service slug to institution name for imputernicire avocatiala.
 */
export function buildInstitutie(serviceSlug?: string): string {
  const map: Record<string, string> = {
    'cazier-judiciar': 'IPJ SATU MARE - CAZIER JUDICIAR',
    'cazier-judiciar-persoana-fizica': 'IPJ SATU MARE - CAZIER JUDICIAR',
    'cazier-judiciar-persoana-juridica': 'IPJ SATU MARE - CAZIER JUDICIAR',
    'cazier-auto': 'IPJ SATU MARE - CAZIER AUTO',
    'cazier-fiscal': 'ANAF SATU MARE',
    'certificat-nastere': 'OFICIUL DE STARE CIVILĂ',
    'certificat-casatorie': 'OFICIUL DE STARE CIVILĂ',
    'certificat-celibat': 'OFICIUL DE STARE CIVILĂ',
    'certificat-integritate-comportamentala': 'IPJ SATU MARE - CAZIER JUDICIAR',
    'extras-carte-funciara': 'OCPI SATU MARE',
    'certificat-constatator': 'ONRC SATU MARE',
  };
  return map[serviceSlug || ''] || serviceSlug || '';
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
    CLIENT_FATHER_NAME: ctx.client.father_name || '',
    CLIENT_MOTHER_NAME: ctx.client.mother_name || '',

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
    INSTITUTIE: buildInstitutie(ctx.order.service_slug),

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
  const templateBuffer = loadTemplate(serviceSlug, templateName);
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
