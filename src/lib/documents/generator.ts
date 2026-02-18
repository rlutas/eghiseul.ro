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
  address_parts?: { county?: string; city?: string; street?: string; number?: string; building?: string; apartment?: string };
  company_address_parts?: { county?: string; city?: string; street?: string; number?: string; building?: string; apartment?: string };
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
  };
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
 * PJ: company name, CUI, sediu
 * PF: full name, CNP, CI, address
 */
function buildClientDetailsBlock(client: ClientData): string {
  if (client.is_pj) {
    const parts = [client.company_name || 'N/A'];
    if (client.cui) parts.push(`CUI: ${client.cui}`);
    if (client.company_reg) parts.push(`Nr. Reg. Com.: ${client.company_reg}`);
    if (client.company_address) parts.push(`cu sediul în: ${client.company_address}`);
    if (client.email) parts.push(`email: ${client.email}`);
    if (client.phone) parts.push(`telefon: ${client.phone}`);
    return parts.join(', ');
  }
  const parts = [client.name || 'N/A'];
  if (client.cnp) parts.push(`CNP: ${client.cnp}`);
  if (client.ci_series && client.ci_number) parts.push(`CI seria ${client.ci_series} nr. ${client.ci_number}`);
  if (client.address) parts.push(`domiciliat/ă în: ${client.address}`);
  if (client.email) parts.push(`email: ${client.email}`);
  if (client.phone) parts.push(`telefon: ${client.phone}`);
  return parts.join(', ');
}

/**
 * Build delivery terms text for the specific service ordered.
 */
function buildDeliveryTerms(order: DocumentContext['order']): string {
  const estimated = order.estimated_days;
  const urgent = order.urgent_days;
  const urgentAvailable = order.urgent_available;

  if (!estimated && !urgent) {
    return 'Termenul de livrare va fi comunicat de prestator.';
  }

  const parts: string[] = [];
  if (urgentAvailable && urgent) {
    parts.push(`Urgent: ${urgent === 1 ? '1 zi lucrătoare' : `${urgent} zile lucrătoare`}`);
  }
  if (estimated) {
    parts.push(`Standard: ${estimated === 1 ? '1 zi lucrătoare' : `${estimated} zile lucrătoare`}`);
  }
  parts.push('Pentru situații care necesită verificări suplimentare, termenul poate fi prelungit cu până la 10 zile lucrătoare.');
  return parts.join('\n');
}

/**
 * Map service slug to institution name for imputernicire avocatiala.
 */
function buildInstitutie(serviceSlug?: string): string {
  const map: Record<string, string> = {
    'cazier-judiciar': 'IPJ SATU MARE - CAZIER JUDICIAR',
    'cazier-judiciar-persoana-fizica': 'IPJ SATU MARE - CAZIER JUDICIAR',
    'cazier-judiciar-persoana-juridica': 'IPJ SATU MARE - CAZIER JUDICIAR',
    'cazier-auto': 'IPJ SATU MARE - CAZIER AUTO',
    'cazier-fiscal': 'ANAF SATU MARE',
    'certificat-nastere': 'OFICIUL DE STARE CIVILĂ',
    'certificat-casatorie': 'OFICIUL DE STARE CIVILĂ',
    'certificat-celibat': 'OFICIUL DE STARE CIVILĂ',
    'extras-carte-funciara': 'OCPI SATU MARE',
    'certificat-constatator': 'ONRC SATU MARE',
  };
  return map[serviceSlug || ''] || serviceSlug || '';
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

    // Client address parts (structured)
    CLIENT_COUNTY: ap?.county || '',
    CLIENT_CITY: ap?.city || '',
    CLIENT_STREET: ap?.street || '',
    CLIENT_STREET_NR: ap?.number || '',
    CLIENT_BUILDING: ap?.building || '',
    CLIENT_APARTMENT: ap?.apartment || '',

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
    IMPUTERNICIRE_SERIA: ctx.lawyer?.imputernicire_series || 'SM',

    // Aliases for imputernicire template (user-created template uses short names)
    SERIE: ctx.lawyer?.imputernicire_series || 'SM',
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

    // Compound: beneficiary details block for contracts
    CLIENT_DETAILS_BLOCK: buildClientDetailsBlock(ctx.client),

    // Compound: delivery terms for the specific service
    TERMEN_LIVRARE: buildDeliveryTerms(ctx.order),
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
