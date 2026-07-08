'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getCountyFromCNP } from '@/lib/validations/cnp';
import { estimateFromSelectedOptions } from '@/lib/delivery-calculator';
import { isNoLawyerService } from '@/lib/documents/no-lawyer-services';
import { REUPLOAD_DOC_SPECS, suggestedDocsForService } from '@/lib/reupload/doc-types';
import {
  type KycPerDoc,
  extractKycByDocType,
  kycConfidenceClass,
  needsKycReview,
} from '@/lib/kyc/review';
import {
  crossValidateExtractedData,
  type CrossValidationWarning,
  type ExtractedPersonalData,
  type ExtractedCINouBack,
  type ExtractedROCEIReader,
} from '@/lib/services/document-ocr';
import { ModifyOrderDialog } from '@/components/admin/modify-order-dialog';
import { QuickStatusSelect } from '@/components/admin/update-status-card';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building2,
  CreditCard,
  Truck,
  Printer,
  MapPin,
  ExternalLink,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Package,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  FileCheck,
  Upload,
  Shield,
  Receipt,
  PlayCircle,
  CheckCircle,
  Circle,
  ClipboardList,
  Image as ImageIcon,
  PenLine,
  Eye,
  Download,
  Pencil,
  RotateCcw,
  Camera,
  MessageCircle,
  Handshake,
} from 'lucide-react';

// ---------- Types ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

interface OrderDetail {
  id: string;
  friendly_order_id: string | null;
  order_number: string;
  status: string | null;
  total_price: number;
  base_price: number;
  options_price: number | null;
  delivery_price: number | null;
  discount_amount: number | null;
  currency: string | null;
  payment_status: string | null;
  payment_method: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id?: string | null;
  is_test?: boolean | null;
  estimated_completion_date?: string | null;
  paid_at: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
  invoice_issued_at: string | null;
  courier_provider: string | null;
  courier_service: string | null;
  courier_quote: AnyObj | null;
  delivery_method: AnyObj | string | null;
  delivery_address: AnyObj | null;
  delivery_tracking_number: string | null;
  delivery_tracking_url: string | null;
  delivery_tracking_status: string | null;
  customer_data: AnyObj | null;
  selected_options: Array<{
    option_id?: string;
    option_name?: string;
    quantity?: number;
    price_modifier?: number;
    option_description?: string;
    /** Stable code (e.g. 'urgenta', 'apostila_haga') — feeds the delivery
     *  calculator and lets the bundled-children join up to a parent. */
    code?: string;
    /** Per-option wizard input (apostila → country, traducere → language). */
    metadata?: { country?: string; language?: string } | null;
    /** Cross-service bundling marker — when set, this row belongs under the
     *  referenced parent option in the grouped admin view. */
    bundled_for?: {
      parent_option_id?: string;
      bundled_service_slug?: string;
      bundled_option_code?: string;
    } | null;
    bundledFor?: { parentOptionId?: string } | null;
  }> | null;
  kyc_documents: AnyObj | null;
  documents: AnyObj | null;
  admin_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  submitted_at: string | null;
  services: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    estimated_days: number | null;
    verification_config?: unknown;
  } | null;
}

interface ReuploadRequestInfo {
  id: string;
  status: 'pending' | 'completed' | 'expired';
  documentTypes: string[];
  completedDocuments: Array<{ type: string; s3Key: string; at: string }>;
  reason: string | null;
  requestedAt: string;
  expiresAt: string;
  url: string;
}

interface TimelineEvent {
  id: string;
  event_type: string;
  notes: string | null;
  new_value: AnyObj | null;
  created_at: string | null;
  changed_by?: string | null;
  from_status?: string | null;
  to_status?: string | null;
}

interface OrderDocument {
  id: string;
  order_id: string;
  type: string;
  s3_key: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  document_number: string | null;
  visible_to_client: boolean;
  generated_by: string | null;
  metadata: AnyObj | null;
  created_at: string | null;
}

interface OrderOptionStatus {
  id: string;
  order_id: string;
  option_code: string;
  option_name: string;
  price: number;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  created_at: string | null;
}

// ---------- Status Config ----------

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  draft: { label: 'Ciorna', variant: 'secondary' },
  pending: { label: 'In asteptare', variant: 'outline' },
  paid: { label: 'Platita', variant: 'default', className: 'bg-green-600 text-white' },
  processing: { label: 'In procesare', variant: 'default', className: 'bg-blue-600 text-white' },
  documents_generated: { label: 'Documente generate', variant: 'default', className: 'bg-blue-500 text-white' },
  submitted_to_institution: { label: 'Depusa la institutie', variant: 'default', className: 'bg-orange-600 text-white' },
  document_received: { label: 'Document primit', variant: 'default', className: 'bg-teal-600 text-white' },
  extras_in_progress: { label: 'Traducere / Apostila', variant: 'default', className: 'bg-amber-600 text-white' },
  la_tradus: { label: 'La traducere', variant: 'default', className: 'bg-sky-500 text-white' },
  la_legalizat: { label: 'La legalizare', variant: 'default', className: 'bg-fuchsia-500 text-white' },
  la_apostila_notari: { label: 'Apostila Notari', variant: 'default', className: 'bg-pink-500 text-white' },
  eliberat_apostila_haga: { label: 'Apostila Haga', variant: 'default', className: 'bg-purple-500 text-white' },
  kyc_pending: { label: 'KYC Pending', variant: 'outline' },
  kyc_approved: { label: 'KYC Aprobat', variant: 'default', className: 'bg-green-600 text-white' },
  kyc_rejected: { label: 'KYC Respins', variant: 'destructive' },
  document_ready: { label: 'Gata de expediere', variant: 'default', className: 'bg-indigo-600 text-white' },
  shipped: { label: 'Expediata', variant: 'default', className: 'bg-purple-600 text-white' },
  in_progress: { label: 'In lucru', variant: 'default', className: 'bg-blue-600 text-white' },
  completed: { label: 'Finalizata', variant: 'default', className: 'bg-green-700 text-white' },
  cancelled: { label: 'Anulata', variant: 'destructive' },
  refunded: { label: 'Rambursata', variant: 'destructive' },
  standby: { label: 'In asteptare client', variant: 'default', className: 'bg-amber-500 text-white' },
  cancellation_requested: { label: 'Anulare solicitata', variant: 'default', className: 'bg-red-500 text-white' },
  delivered: { label: 'Livrata', variant: 'default', className: 'bg-emerald-600 text-white' },
  abandoned: { label: 'Abandonata', variant: 'secondary' },
};

// ---------- Helpers ----------

function extractCustomerData(cd: AnyObj | null) {
  if (!cd) return { contact: null, personal: null, company: null, billing: null, constatator: null, clientType: 'pf' as string, billsToCompany: false };
  const contact = cd.contact || null;
  const personal = cd.personalData || cd.personal || null;
  const company = cd.companyData || cd.company || null;
  const billing = cd.billing || null;
  const constatator = cd.constatator || null; // ONRC certificat constatator: documentType/reportType/purpose/…

  // clientType = WHO the service is for (PF / PJ). NOT inferred from billing —
  // a Cazier PF customer can ask the invoice to go to their employer (PJ
  // billing). Earlier logic upgraded PF→PJ based on billing.type which
  // wrongly mis-labeled PF orders as PJ across the admin UI.
  //
  // Only auto-promote to PJ when the customer_data has companyKyc (the
  // service literally requires PJ data — e.g., Certificat constatator PJ),
  // OR clientType is explicitly 'pj' in customer_data.
  const explicitPJ = cd.clientType === 'pj';
  // Company-KYC evidence lives under cd.company for the modular wizard (PJ
  // cazier writes company.cui/companyName/uploadedDocuments there — checking
  // only companyData/companyKyc mis-labeled those orders as PF). Constatator
  // is excluded: its cd.company is the TARGET firm looked up by a (possibly
  // PF) customer, and it gets its own firm badge downstream.
  const hasCompanyKyc =
    !!cd.companyData?.uploadedDocuments?.length ||
    !!cd.companyKyc ||
    (!cd.constatator &&
      !!(cd.company?.cui || cd.company?.companyName || cd.company?.uploadedDocuments?.length));
  const clientType: string = explicitPJ || hasCompanyKyc ? 'pj' : 'pf';

  // Separate flag for the "PF customer wants invoice issued to a company"
  // case — surfaced as a small chip on the admin header without flipping
  // the whole UI to PJ mode.
  const billsToCompany = clientType === 'pf'
    && (billing?.type === 'persoana_juridica' || !!billing?.companyName || !!billing?.cui);

  return { contact, personal, company, billing, constatator, clientType, billsToCompany };
}

function getCustomerDisplayName(contact: AnyObj | null, personal: AnyObj | null, company: AnyObj | null, billing: AnyObj | null, isPJ: boolean): string {
  if (isPJ) return company?.companyName || billing?.companyName || 'N/A';
  if (contact?.name) return contact.name;
  // Billing name as final fallback — services without a personal-KYC step
  // (e.g. identificare imobil) only collect the customer's name at billing.
  const firstName = contact?.firstName || personal?.firstName || billing?.firstName || '';
  const lastName = contact?.lastName || personal?.lastName || billing?.lastName || '';
  if (firstName || lastName) return `${firstName} ${lastName}`.trim();
  if (billing?.name) return String(billing.name);
  return 'N/A';
}

function parseDeliveryMethod(dm: AnyObj | string | null): AnyObj | null {
  if (!dm) return null;
  if (typeof dm === 'object') return dm;
  try { return JSON.parse(dm); } catch { return { name: dm }; }
}

/** Format an address object into a human-readable Romanian address string */
function formatAddress(addr: AnyObj | string | null | undefined): string | null {
  if (!addr) return null;
  if (typeof addr === 'string') return addr;

  const parts: string[] = [];

  // Street line: Str. X, Nr. Y, Bl. Z, Sc. A, Et. B, Ap. C
  const streetParts: string[] = [];
  if (addr.street) streetParts.push(`Str. ${addr.street}`);
  if (addr.number) streetParts.push(`Nr. ${addr.number}`);
  if (addr.building) streetParts.push(`Bl. ${addr.building}`);
  if (addr.staircase) streetParts.push(`Sc. ${addr.staircase}`);
  if (addr.floor) streetParts.push(`Et. ${addr.floor}`);
  if (addr.apartment) streetParts.push(`Ap. ${addr.apartment}`);
  if (streetParts.length > 0) parts.push(streetParts.join(', '));

  // City + County line
  const locParts: string[] = [];
  if (addr.city) locParts.push(addr.city);
  if (addr.county) locParts.push(`Jud. ${addr.county}`);
  if (addr.postalCode || addr.postal_code) locParts.push(addr.postalCode || addr.postal_code);
  if (locParts.length > 0) parts.push(locParts.join(', '));

  return parts.length > 0 ? parts.join(', ') : null;
}

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ro-RO', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Bucharest',
  });
}

/** Strip the trailing "Persoană Fizică"/"Persoană Juridică" from a service
 *  name — the entity-type badge in the page header already shows it, so
 *  repeating it in the service card is redundant (e.g. "Cazier Fiscal
 *  Persoană Fizică" → "Cazier Fiscal"). */
function stripEntitySuffix(name: string): string {
  return name.replace(/\s+Persoan[ăa]\s+(Fizic[ăa]|Juridic[ăa])\s*$/i, '');
}

/** Format a date string as DD.MM.YYYY only (no time component).
 *  Handles ISO strings ("1992-07-02T00:00:00.000Z"), plain dates ("1992-07-02"),
 *  and already-formatted Romanian dates ("02.07.1992"). */
function formatDateOnly(d: string | null): string {
  if (!d) return '-';
  // Already in DD.MM.YYYY format
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(d)) return d;
  const date = new Date(d);
  if (isNaN(date.getTime())) return d; // Return as-is if unparseable
  return date.toLocaleDateString('ro-RO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatDateLong(d: string | null) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('ro-RO', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Bucharest',
  });
}

/**
 * Compute cross-validation warnings from a customer_data blob.
 *
 * Returns warnings (severity='warning') when the same field has different
 * values across CI front, eCI back MRZ, and RO CEI Reader PDF scans —
 * indicates either OCR drift or a real data mismatch (different person,
 * wrong PDF uploaded, etc.).
 *
 * Empty array means everything matches OR there's not enough data to compare.
 */
function computeOcrCrossValidationWarnings(cd: AnyObj | null): CrossValidationWarning[] {
  if (!cd) return [];
  const personal = cd.personalData || cd.personal;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ocrResults: Array<{ documentType: string; extractedData: any }> | undefined = personal?.ocrResults;
  if (!ocrResults || ocrResults.length === 0) return [];

  const byType = (type: string) =>
    ocrResults.find((r) => r.documentType === type)?.extractedData;

  return crossValidateExtractedData({
    ci_front: byType('ci_front') as ExtractedPersonalData | undefined,
    ci_nou_back: byType('ci_nou_back') as ExtractedCINouBack | undefined,
    ro_cei_reader_pdf: byType('ro_cei_reader_pdf') as ExtractedROCEIReader | undefined,
  });
}

// ── OCR vs date completate de client ────────────────────────────────────────
// Compară ce a EXTRAS OCR-ul de pe buletin (personal.ocrResults[].extractedData)
// cu ce a COMPLETAT/editat clientul în formular (personal.firstName/cnp/etc).
// Diferențele = client a corectat OCR-ul SAU a introdus date greșite → operatorul
// verifică manual. Datele OCR sunt prefill, dar editabile de client.
interface OcrFormRow {
  field: string;
  label: string;
  ocr: string;
  form: string;
  match: boolean;
}

function normCmp(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

// Egalitate de dată indiferentă la format (DD.MM.YYYY vs YYYY-MM-DD etc).
function datesEqual(a: unknown, b: unknown): boolean {
  const parts = (s: unknown) =>
    String(s ?? '')
      .split(/\D+/)
      .filter(Boolean)
      .map(Number)
      .sort((x, y) => x - y);
  const pa = parts(a);
  const pb = parts(b);
  if (pa.length !== 3 || pb.length !== 3) return normCmp(a) === normCmp(b);
  return pa.every((v, i) => v === pb[i]);
}

function computeOcrVsFormRows(cd: AnyObj | null): OcrFormRow[] {
  if (!cd) return [];
  const personal = cd.personalData || cd.personal;
  const ocrResults: Array<{ extractedData?: AnyObj }> | undefined = personal?.ocrResults;
  if (!personal || !ocrResults || ocrResults.length === 0) return [];

  // Merge OCR fields across all scans (first non-empty wins).
  const ocr: AnyObj = {};
  for (const r of ocrResults) {
    const d = r.extractedData || {};
    for (const k of ['firstName', 'lastName', 'cnp', 'birthDate', 'series', 'number', 'expiryDate']) {
      if (ocr[k] == null && d[k]) ocr[k] = d[k];
    }
  }
  if (Object.keys(ocr).length === 0) return [];

  const pairs: Array<[string, string, unknown, unknown, boolean]> = [
    ['lastName', 'Nume', ocr.lastName, personal.lastName, false],
    ['firstName', 'Prenume', ocr.firstName, personal.firstName, false],
    ['cnp', 'CNP', ocr.cnp, personal.cnp, false],
    ['birthDate', 'Data nașterii', ocr.birthDate, personal.birthDate, true],
    ['series', 'Serie', ocr.series, personal.documentSeries, false],
    ['number', 'Număr', ocr.number, personal.documentNumber, false],
    ['expiryDate', 'Expirare', ocr.expiryDate, personal.documentExpiry, true],
  ];

  const rows: OcrFormRow[] = [];
  for (const [field, label, o, f, isDate] of pairs) {
    if (!o && !f) continue;
    const match = !!o && !!f && (isDate ? datesEqual(o, f) : normCmp(o) === normCmp(f));
    rows.push({ field, label, ocr: o ? String(o) : '—', form: f ? String(f) : '—', match });
  }
  return rows;
}

/** Extract all client-uploaded documents from customer_data */
function extractClientDocuments(cd: AnyObj | null): Array<{ type: string; label: string; s3Key?: string; base64?: string; fileName?: string }> {
  if (!cd) return [];
  const docs: Array<{ type: string; label: string; s3Key?: string; base64?: string; fileName?: string }> = [];

  const DOC_LABELS: Record<string, string> = {
    ci_front: 'CI - Fata',
    ci_back: 'CI - Verso',
    ci_vechi: 'CI vechi - Fata',
    ci_nou_front: 'CI nou - Fata',
    ci_nou_back: 'CI nou - Verso (data emit. + SPCEP + MRZ)',
    passport: 'Pasaport',
    passport_opened: 'Pasaport - pagina cu foto',
    ro_cei_reader_pdf: 'PDF RO CEI Reader (dovada domiciliu)',
    certificat_domiciliu: 'Certificat domiciliu',
    residence_permit: 'Permis rezidenta',
    act_identitate: 'Act de identitate — față (manual)',
    act_identitate_back: 'Act de identitate — spate (manual)',
    registration_cert: 'Certificat inregistrare',
    selfie: 'Selfie verificare',
    company_registration_cert: 'Certificat Inregistrare',
    company_statement_cert: 'Certificat Constatator',
  };

  // Personal KYC documents
  const personal = cd.personalData || cd.personal;
  if (personal?.uploadedDocuments) {
    for (const doc of personal.uploadedDocuments) {
      docs.push({
        type: doc.type || 'document',
        label: DOC_LABELS[doc.type] || doc.type || 'Document KYC',
        s3Key: doc.s3Key,
        base64: doc.base64,
        fileName: doc.fileName,
      });
    }
  }

  // Company documents
  const company = cd.companyData || cd.company;
  if (company?.uploadedDocuments) {
    for (const doc of company.uploadedDocuments) {
      docs.push({
        type: doc.type || 'document',
        label: DOC_LABELS[doc.type] || doc.type || 'Document firma',
        s3Key: doc.s3Key,
        base64: doc.base64,
        fileName: doc.fileName,
      });
    }
  }

  return docs;
}

/** Extract KYC document S3 keys from kyc_documents field.
 *  Handles both legacy object format ({idFront, idBack, selfie}) and
 *  array format ([{type, s3Key, ...}]).
 */
function extractKycDocKeys(kycDocs: AnyObj | null): Array<{ type: string; label: string; s3Key?: string; base64?: string }> {
  if (!kycDocs || typeof kycDocs !== 'object') return [];

  const DOC_LABELS: Record<string, string> = {
    ci_front: 'CI - Fata',
    ci_back: 'CI - Verso',
    ci_vechi: 'CI vechi - Fata',
    ci_nou_front: 'CI nou - Fata',
    ci_nou_back: 'CI nou - Verso (data emit. + SPCEP + MRZ)',
    passport: 'Pasaport',
    passport_opened: 'Pasaport - pagina cu foto',
    ro_cei_reader_pdf: 'PDF RO CEI Reader (dovada domiciliu)',
    certificat_domiciliu: 'Certificat domiciliu',
    residence_permit: 'Permis rezidenta',
    act_identitate: 'Act de identitate — față (manual)',
    act_identitate_back: 'Act de identitate — spate (manual)',
    registration_cert: 'Certificat inregistrare',
    selfie: 'Selfie verificare',
    company_registration_cert: 'Certificat Inregistrare',
    company_statement_cert: 'Certificat Constatator',
  };

  // Handle array format: [{type, s3Key, base64, fileName, ...}]
  if (Array.isArray(kycDocs)) {
    return kycDocs.map((doc: AnyObj) => ({
      type: doc.type || 'document',
      label: DOC_LABELS[doc.type] || doc.type || 'Document KYC',
      s3Key: doc.s3Key,
      base64: doc.base64,
    }));
  }

  // Legacy object format: {idFront, idBack, selfie}
  const docs: Array<{ type: string; label: string; s3Key?: string; base64?: string }> = [];
  if (kycDocs.idFront) docs.push({ type: 'ci_front', label: 'CI - Fata', s3Key: typeof kycDocs.idFront === 'string' ? kycDocs.idFront.replace('s3://', '').replace(/^[^/]+\//, '') : undefined });
  if (kycDocs.idBack) docs.push({ type: 'ci_back', label: 'CI - Verso', s3Key: typeof kycDocs.idBack === 'string' ? kycDocs.idBack.replace('s3://', '').replace(/^[^/]+\//, '') : undefined });
  if (kycDocs.selfie) docs.push({ type: 'selfie', label: 'Selfie verificare', s3Key: typeof kycDocs.selfie === 'string' ? kycDocs.selfie.replace('s3://', '').replace(/^[^/]+\//, '') : undefined });

  return docs;
}

// ---------- Main Component ----------

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [account, setAccount] = useState<{
    id: string; email: string | null; firstName: string | null;
    lastName: string | null; phone: string | null; kycVerified: boolean;
  } | null>(null);
  const [kycSaving, setKycSaving] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [orderDocuments, setOrderDocuments] = useState<OrderDocument[]>([]);
  const [optionStatuses, setOptionStatuses] = useState<OrderOptionStatus[]>([]);
  const [reuploadRequest, setReuploadRequest] = useState<ReuploadRequestInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AWB state
  const [generating, setGenerating] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [awbError, setAwbError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchOrder = useCallback(async (opts?: { silent?: boolean }) => {
    // Silent refresh: inline actions (generate document, add note, update
    // status…) re-fetch WITHOUT flipping the whole page into the loading
    // spinner — that unmounted the content and threw the user back to the
    // top of the page (team-reported bug).
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Comanda nu a fost gasita.');
        return;
      }

      const orderData = json.data.order;
      const normalizedOrder = {
        ...orderData,
        services: Array.isArray(orderData.services)
          ? (orderData.services[0] as OrderDetail['services']) || null
          : (orderData.services as OrderDetail['services']),
      } as unknown as OrderDetail;

      setOrder(normalizedOrder);
      setAccount(json.data.account || null);
      setTimeline((json.data.timeline || []) as TimelineEvent[]);
      setOrderDocuments((json.data.documents || []) as OrderDocument[]);
      setOptionStatuses((json.data.option_statuses || []) as OrderOptionStatus[]);
      setReuploadRequest((json.data.reupload_request || null) as ReuploadRequestInfo | null);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('A aparut o eroare la incarcarea comenzii.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Stable callback for inline sections — never triggers the full-page spinner.
  const refreshSilent = useCallback(() => fetchOrder({ silent: true }), [fetchOrder]);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId, fetchOrder]);

  // ---------- AWB Handlers ----------

  const handleToggleAccountKyc = async () => {
    if (!account) return;
    setKycSaving(true);
    try {
      const res = await fetch(`/api/admin/users/customers/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc_verified: !account.kycVerified }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || 'KYC actualizat');
        setAccount((a) => (a ? { ...a, kycVerified: !a.kycVerified } : a));
      } else {
        toast.error(json.error || 'Eroare la actualizare KYC');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setKycSaving(false);
    }
  };

  const handleGenerateAwb = async () => {
    if (!order) return;
    setGenerating(true);
    setAwbError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/generate-awb`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        const msg = data.error?.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
        throw new Error(msg || 'Nu s-a putut genera AWB');
      }
      toast.success(`AWB generat: ${data.data.awb}`);
      await fetchOrder();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Eroare necunoscuta';
      setAwbError(message);
      toast.error('Nu s-a putut genera AWB');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintLabel = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/awb-label?format=pdf`);
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          throw new Error(data.error?.message || 'Nu s-a putut descarca eticheta');
        }
        throw new Error(`Eroare HTTP: ${res.status}`);
      }
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (data.data?.url) {
          window.open(data.data.url, '_blank');
          toast.success('Eticheta deschisa in tab nou');
          return;
        }
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AWB-${order.delivery_tracking_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Eticheta descarcata');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare la descarcare');
    } finally {
      setDownloading(false);
    }
  };

  const handleCancelAwb = async () => {
    if (!order || !order.delivery_tracking_number) return;
    if (!confirm(`Sigur vrei sa anulezi AWB-ul ${order.delivery_tracking_number}?`)) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/cancel-awb`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Nu s-a putut anula AWB');
      toast.success('AWB anulat cu succes');
      if (data.data?.cancelWarning) toast.warning(data.data.cancelWarning, { duration: 8000 });
      await fetchOrder();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare la anulare');
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyAwb = () => {
    if (order?.delivery_tracking_number) {
      navigator.clipboard.writeText(order.delivery_tracking_number);
      toast.success('AWB copiat in clipboard');
    }
  };

  // Quick-flip from `shipped` → `completed` straight from the AWB card —
  // saves operators a trip through the Update Status dropdown for the
  // common end-of-shipment confirmation.
  const handleMarkDelivered = async () => {
    if (!order) return;
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message ?? 'Eroare la marcare livrat');
        return;
      }
      toast.success('Comanda marcată ca livrată');
      fetchOrder();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare de rețea');
    }
  };

  // ---------- Loading / Error States ----------

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-80" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Inapoi
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Eroare</AlertTitle>
          <AlertDescription>{error || 'Comanda nu a fost gasita.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // ---------- Derived Data ----------

  const displayOrderNumber = order.friendly_order_id || order.order_number;
  const { contact, personal, company, billing, constatator, clientType, billsToCompany } = extractCustomerData(order.customer_data);
  const isPJ = clientType === 'pj';
  // Certificat constatator on a firm (documentType firma/istoric) is a company
  // document even though no PF/PJ "clientType" is collected — show a firm badge
  // instead of the misleading "Persoana Fizica".
  const constatatorFirm =
    order.services?.slug === 'certificat-constatator' &&
    (constatator as AnyObj | null)?.documentType !== 'pf';
  const constatatorFirmName =
    company?.companyName || billing?.companyName || (constatator as AnyObj | null)?.companyName || null;
  const status = order.status || 'draft';
  const statusConfig = STATUS_CONFIG[status] || { label: status, variant: 'outline' as const };
  const customerName = getCustomerDisplayName(contact, personal, company, billing, isPJ);

  // ── Copy Sheet 1/2 derivations (lawyer's manual Google Sheets register) ──
  // Price = service base + urgency tier only (NEVER the full total — the team
  // uses this column to spot urgent orders), same rule as the sister project.
  const sheetPrice = (() => {
    const base = Number(order.base_price ?? order.services?.base_price ?? 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts = (order.selected_options as any[] | null) || [];
    const urgent = opts.find((o) => o?.code === 'urgenta' && !o?.bundledFor);
    return Math.round(base + (urgent ? Number(urgent.price) || 0 : 0));
  })();
  const sheetServiceLabel = order.services?.name ? stripEntitySuffix(order.services.name) : 'Serviciu';
  const sheetInstitution = (() => {
    const slug = order.services?.slug || '';
    if (slug.startsWith('cazier-fiscal')) return 'ANAF SATU MARE';
    if (slug.startsWith('cazier-') || slug.startsWith('certificat-integritate')) return 'IPJ SATU MARE';
    if (/nastere|casatorie|celibat|multilingv/.test(slug)) return 'STARE CIVILĂ (PRIMĂRIE)';
    return '-';
  })();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sheetMotiv = (() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cd = order.customer_data as any;
    return (
      cd?.contact?.purpose || cd?.civil_status?.purpose || cd?.property?.motiv || cd?.constatator?.purpose || ''
    );
  })();

  const deliveryMethodParsed = parseDeliveryMethod(order.delivery_method);
  const courierQuote = order.courier_quote as AnyObj | null;
  const isLockerDelivery = !!courierQuote?.lockerId || deliveryMethodParsed?.name?.toLowerCase().includes('box') || deliveryMethodParsed?.name?.toLowerCase().includes('locker');
  const hasAwb = !!order.delivery_tracking_number;
  const hasCourier = !!order.courier_provider || deliveryMethodParsed?.type === 'courier';
  const detectedCourierProvider = order.courier_provider ||
    (deliveryMethodParsed?.name?.toLowerCase().includes('fan') ? 'fancourier' :
     deliveryMethodParsed?.name?.toLowerCase().includes('sameday') ? 'sameday' : null);

  // All client-uploaded documents
  const clientDocs = extractClientDocuments(order.customer_data);
  const kycDocs = extractKycDocKeys(order.kyc_documents);
  // Merge and deduplicate (prefer clientDocs which have more info)
  const allClientDocs = [...clientDocs];
  for (const kd of kycDocs) {
    if (!allClientDocs.find(d => d.type === kd.type)) {
      allClientDocs.push(kd);
    }
  }

  // Signature - check both nested path (wizard state) and top-level (submit route saves here)
  const signature = order.customer_data?.signature || {
    signatureBase64: order.customer_data?.signature_base64 || null,
    signedAt: order.customer_data?.signature_metadata?.signed_at || null,
  };

  return (
    <div className="space-y-6">
      {/* Header — stacks on mobile, single row on desktop */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="h-4 w-4" />
            Inapoi
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono break-all">{displayOrderNumber}</h1>
              <Badge variant={statusConfig.variant} className={`text-sm px-3 py-1 ${statusConfig.className || ''}`}>
                {statusConfig.label}
              </Badge>
              {constatatorFirm ? (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <Building2 className="h-3.5 w-3.5 mr-1" />
                  Firmă{constatatorFirmName ? ` · ${constatatorFirmName}` : ' / PJ'}
                </Badge>
              ) : isPJ ? (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <Building2 className="h-3.5 w-3.5 mr-1" />
                  Persoana Juridica
                </Badge>
              ) : (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  <User className="h-3.5 w-3.5 mr-1" />
                  Persoana Fizica
                </Badge>
              )}
              {/* PF client → invoice billed to a company. Separate chip so the
                  admin sees BOTH facts without us flipping the entire UI to PJ
                  mode (which used to happen and caused mis-classified cards). */}
              {billsToCompany && (
                <Badge variant="outline" className="text-sm px-3 py-1 border-amber-300 bg-amber-50 text-amber-900">
                  <Building2 className="h-3.5 w-3.5 mr-1" />
                  Factură → {billing?.companyName || 'PJ'}
                </Badge>
              )}
              {order.friendly_order_id && (
                <a
                  href={`/comanda/status?order=${encodeURIComponent(order.friendly_order_id)}&email=${encodeURIComponent(order.customer_data?.contact?.email ?? '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-blue-600 underline whitespace-nowrap"
                  title="Deschide pagina de status așa cum o vede clientul"
                >
                  Vezi ca clientul ↗
                </a>
              )}
              {order.friendly_order_id && (
                <button
                  type="button"
                  title="Copiază linkul de status (pre-completat) pentru client"
                  className="inline-flex items-center gap-1 rounded border border-neutral-200 px-1.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  onClick={async () => {
                    const url = `${window.location.origin}/comanda/status/?order=${encodeURIComponent(order.friendly_order_id!)}&email=${encodeURIComponent((order.customer_data as AnyObj | null)?.contact?.email || '')}`;
                    try {
                      await navigator.clipboard.writeText(url);
                      toast.success('Link status copiat');
                    } catch {
                      toast.error('Nu am putut copia');
                    }
                  }}
                >
                  <Copy className="h-3 w-3" /> Link status
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span>Creata: {formatDateLong(order.created_at)}</span>
              {order.submitted_at && <span>Trimisa: {formatDate(order.submitted_at)}</span>}
              {/* Termen estimat — up top, right under the order number (sister parity). */}
              {order.estimated_completion_date && (
                <span className="font-semibold text-orange-600">
                  Termen estimat: {formatDate(order.estimated_completion_date)}
                  {order.services?.estimated_days ? ` (${order.services.estimated_days} zile lucratoare)` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {/* Quick status dropdown — in front of the action buttons (team
              request): pick a status → applied instantly, no second click. */}
          <QuickStatusSelect
            orderId={order.id}
            currentStatus={order.status || 'draft'}
            onUpdated={refreshSilent}
          />
          {/* Sync Stripe — visible only for orders that have a checkout
              session but aren't marked paid. Catches "webhook didn't
              arrive" scenarios (localhost dev, prod outage, sig mismatch).
              Calls the Stripe API directly and flips payment_status if
              Stripe confirms the session is paid. */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {order.payment_status !== 'paid' && (order as any).stripe_checkout_session_id && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!confirm('Sincronizezi cu Stripe? Acest buton verifică dacă plata a fost confirmată pe Stripe și actualizează comanda corespunzător.')) return;
                try {
                  const res = await fetch(`/api/admin/orders/${order.id}/sync-stripe`, { method: 'POST' });
                  const json = await res.json();
                  if (!res.ok || !json.success) {
                    toast.error(json.error || 'Sync eșuat');
                    return;
                  }
                  if (json.data.alreadyPaid) {
                    toast.info('Comanda era deja marcată plătită — nimic de făcut.');
                  } else {
                    toast.success('Plată sincronizată. Verifică Stripe Dashboard → Webhooks dacă se repetă.');
                  }
                  await fetchOrder();
                } catch {
                  toast.error('Eroare la sincronizare');
                }
              }}
              title="Verifică starea plății direct pe Stripe și actualizează comanda — util când webhook-ul nu a ajuns"
            >
              <RefreshCw className="h-4 w-4" />
              Sync Stripe
            </Button>
          )}
          {/* Modify button — only available on paid orders. Hidden on
              draft/pending/abandoned where the customer can still finish
              checkout or hasn't paid yet. Mirrors sister UX. */}
          {order.payment_status === 'paid' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModifyDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Modifică
            </Button>
          )}
          {/* Storno + Reemite — available only when there's already an
              invoice issued. After admin runs Modify, the existing Oblio
              invoice no longer matches the new line items; this button
              emits a stornare + a fresh corrective invoice in one call.
              Shows a confirmation dialog because it's irreversible (storno
              gets submitted in SPV). */}
          {order.payment_status === 'paid' && order.invoice_number && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (
                  !confirm(
                    `Sigur stornezi factura ${order.invoice_number} și emiți una nouă cu liniile curente? Operația este irreversibilă (stornarea ajunge automat în SPV).`
                  )
                ) {
                  return;
                }
                try {
                  const res = await fetch(`/api/admin/orders/${order.id}/reissue-invoice`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                  });
                  const json = await res.json();
                  if (!res.ok || !json.success) {
                    toast.error(json.error?.message ?? 'Reemiterea a eșuat');
                    return;
                  }
                  toast.success(
                    `Storno OK. Factură nouă: ${json.data.newInvoice.invoiceNumber}`
                  );
                  fetchOrder();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Reemiterea a eșuat');
                }
              }}
              className="text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              <RotateCcw className="h-4 w-4" />
              Storno + Reemite
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchOrder()}>
            <RefreshCw className="h-4 w-4" />
            Reincarca
          </Button>
        </div>
      </div>

      {/* Cancellation requested banner — shown when a customer self-cancelled
          within the 30-min window (or admin set this status manually). One
          click processes the Stripe refund (70%) and flips to 'refunded'. */}
      {order.status === 'cancellation_requested' && (
        <CancellationRequestedBanner order={order} onProcessed={refreshSilent} />
      )}

      {/* Standby banner — shown when SLA is paused. Reminds operators that
          the deadline isn't ticking down. */}
      {order.status === 'standby' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-semibold">
            <RefreshCw className="h-4 w-4" />
            SLA pauzat — comanda este în „standby”
          </div>
          <p className="mt-1 text-xs">
            Termenul de livrare nu avansează. Folosește butonul „Forțează status” pentru a relua
            comanda când blocajul cu clientul este rezolvat.
          </p>
        </div>
      )}


      {/* Note Echipă — moved to the top for parity with cazierjudiciaronline.com
          (prominent, right after the banners) so the team sees/writes notes
          without scrolling to the bottom. The old "Actualizează Status" card
          that sat next to it was replaced by the QuickStatusSelect dropdown
          in the header (team request 2026-07-08). */}
      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <NoteEchipaCard orderId={order.id} timeline={timeline} onAdded={refreshSilent} />
        {/* Service & Options — grouped to match what the customer saw in
            the order summary (main service + nested add-ons + each
            "Serviciu secundar" like Certificat Integritate with its own
            indented add-ons). Same shape used on /comanda, /comanda/checkout
            and the success page so admin reads the order the same way the
            customer placed it. */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detalii Serviciu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Urgenta + metoda livrare sus, ca pe sora */}
            <InfoRow
              label="Urgenta"
              value={(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const opts = (order.selected_options as any[] | null) || [];
                const urgent = opts.find((o) => o?.code === 'urgenta' && !o?.bundledFor);
                return urgent ? '⚡ Urgent' : 'Standard';
              })()}
            />
            {deliveryMethodParsed?.name && (
              <InfoRow label="Metoda livrare" value={String(deliveryMethodParsed.name)} />
            )}
            <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Servicii comandate</p>
            <InfoRow label="Serviciu" value={order.services?.name ? stripEntitySuffix(order.services.name) : 'N/A'} />
            {/* Motivul solicitării — critical operational info (goes on the
                request to the institution). Sourced from whichever module
                collected it (contact/cazier, stare civilă, imobil, ONRC). */}
            {sheetMotiv && <InfoRow label="Motivul solicitarii" value={sheetMotiv} />}
            {/* Certificat constatator (ONRC): what the bot actually requested —
                firm + CUI, document type, report type, purpose, period/person.
                Sourced from customer_data.constatator + billing/company. */}
            {constatator && (() => {
              const c = constatator as AnyObj;
              const firmName = company?.companyName || billing?.companyName || null;
              const firmCui = company?.cui || billing?.cui || null;
              const docTypeLabel =
                c.documentType === 'istoric' ? 'Pe firmă (CUI) — cu istoric'
                : c.documentType === 'pf' ? 'Persoană fizică (CNP)'
                : 'Pe firmă (CUI) — de bază';
              const purposeText = /^altele$/i.test(String(c.purpose ?? ''))
                ? `Altele${c.otherPurpose ? ` — ${c.otherPurpose}` : ''}`
                : (c.purpose || '—');
              const periodText =
                c.period === 'founding' ? 'De la înființare până în prezent'
                : c.period === 'custom' ? `${c.periodFrom ?? '?'} → ${c.periodTo ?? '?'}`
                : null;
              return (
                <>
                  {firmName && <InfoRow label="Firmă" value={firmName} />}
                  {firmCui && <InfoRow label="CUI" value={String(firmCui)} mono />}
                  <InfoRow label="Tip document" value={docTypeLabel} />
                  {c.reportType && <InfoRow label="Tip raport" value={String(c.reportType)} />}
                  <InfoRow label="Scop / motiv (de ce a aplicat)" value={String(purposeText)} />
                  {periodText && <InfoRow label="Perioadă" value={periodText} />}
                  {c.requesterName && <InfoRow label="Solicitant (PF)" value={String(c.requesterName)} />}
                  {c.requesterCnp && <InfoRow label="CNP solicitant" value={String(c.requesterCnp)} mono />}
                </>
              );
            })()}
            {/* Real per-step delivery estimate (sums urgenta + traducere +
                legalizare + apostila*) so admin sees the same window the
                customer was promised. Falls back to `service.estimated_days`
                if the calculator returns nothing (no recognized add-ons). */}
            {(() => {
              const rawOpts = (order.selected_options ?? []).map((o) => ({
                code: o.code ?? null,
                optionName: o.option_name,
                bundledFor:
                  o.bundledFor ??
                  (o.bundled_for
                    ? { parentOptionId: o.bundled_for.parent_option_id }
                    : null),
              }));
              const courier =
                typeof order.delivery_method === 'object'
                  ? (order.delivery_method as { method?: string } | null)?.method ?? null
                  : (order.delivery_method as string | null) ?? null;
              const est = estimateFromSelectedOptions({
                selectedOptions: rawOpts,
                baseDays: order.services?.estimated_days ?? undefined,
                courier,
                includeCourierLeg: !!courier,
              });
              // Digital, auto-issued services (ONRC constatator) — minutes, not days.
              const digitalInstant = order.services?.slug === 'certificat-constatator';
              const label = digitalInstant
                ? 'de obicei câteva minute (automat, 24/7)'
                : est.minDays === est.maxDays
                  ? `${est.minDays} zile lucratoare`
                  : `${est.minDays}-${est.maxDays} zile lucratoare`;
              return <InfoRow label="Termen estimat" value={label} />;
            })()}
            {order.selected_options && order.selected_options.length > 0 && (() => {
              // Split into main-service add-ons vs secondary-service groups.
              // A row is a "secondary service" if other rows reference it
              // via `bundled_for.parent_option_id`. The marketing suffix
              // "(adaugă în aceeași comandă)" is stripped from display so
              // names stay readable (it's still in the DB row for audit).
              const stripSuffix = (name: string | undefined) =>
                (name ?? '')
                  .replace(/\s*\([^()]*\(adaugă în aceeași comandă\)\)\s*$/i, '')
                  .replace(/\s*\(adaugă în aceeași comandă\)\s*$/i, '')
                  .trim();
              const opts = order.selected_options;
              const childrenByParent = new Map<string, typeof opts>();
              for (const o of opts) {
                const parentId =
                  o.bundled_for?.parent_option_id ?? o.bundledFor?.parentOptionId;
                if (parentId) {
                  const list = childrenByParent.get(parentId) ?? [];
                  list.push(o);
                  childrenByParent.set(parentId, list);
                }
              }
              const topLevel = opts.filter(
                (o) => !(o.bundled_for?.parent_option_id ?? o.bundledFor?.parentOptionId)
              );
              const directAddons = topLevel.filter(
                (o) => !(o.option_id && (childrenByParent.get(o.option_id)?.length ?? 0) > 0)
              );
              const subServices = topLevel.filter(
                (o) => o.option_id && (childrenByParent.get(o.option_id)?.length ?? 0) > 0
              );
              const renderRow = (opt: (typeof opts)[number], indented = false) => (
                <div
                  key={opt.option_id ?? opt.option_name}
                  className={`flex items-start justify-between gap-2 text-sm ${
                    indented ? 'pl-3 ml-1 border-l-2 border-primary-100 text-muted-foreground' : ''
                  }`}
                >
                  <div>
                    <span className={indented ? '' : 'font-medium'}>{stripSuffix(opt.option_name)}</span>
                    {(opt.quantity || 1) > 1 && (
                      <span className="text-muted-foreground"> x{opt.quantity}</span>
                    )}
                    {/* Wizard per-option input: apostille destination country /
                        translation language — operationally critical (the
                        apostille is issued FOR that country). */}
                    {opt.metadata?.country && (
                      <p className="text-xs text-muted-foreground">
                        Țara: <span className="font-medium text-foreground">{opt.metadata.country}</span>
                      </p>
                    )}
                    {opt.metadata?.language && (
                      <p className="text-xs text-muted-foreground">
                        Limba: <span className="font-medium text-foreground">{opt.metadata.language}</span>
                      </p>
                    )}
                  </div>
                  {opt.price_modifier ? (
                    <span className={indented ? 'shrink-0' : 'font-medium shrink-0'}>
                      +{opt.price_modifier.toFixed(2)} RON
                    </span>
                  ) : null}
                </div>
              );
              return (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Optiuni selectate
                  </p>
                  {directAddons.map((opt) => renderRow(opt))}
                  {subServices.map((sub) => {
                    const kids = (sub.option_id && childrenByParent.get(sub.option_id)) || [];
                    return (
                      <div key={sub.option_id} className="space-y-1.5 mt-1">
                        <div className="flex items-start justify-between gap-2 text-sm pt-1 border-t border-neutral-100">
                          <div>
                            <span className="font-semibold">{stripSuffix(sub.option_name)}</span>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                              Serviciu secundar
                            </p>
                          </div>
                          {sub.price_modifier ? (
                            <span className="font-semibold shrink-0">
                              +{sub.price_modifier.toFixed(2)} RON
                            </span>
                          ) : null}
                        </div>
                        {kids.map((kid) => renderRow(kid, true))}
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* ROW 1: Date contact + Date personale (left) | Serviciu + Livrare (right).
                 Stacked cards within each column per user-requested layout. */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* LEFT column — contact info on top, personal/company data below */}
        <div className="space-y-4">
        {/* Informatii Client — contact + date personale într-un singur card
            (paritate cazierjudiciaronline), cu Copy Sheet 1/2 sub titlu. */}
        <Card>
          <CardHeader className="pb-3 space-y-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Informatii Client
            </CardTitle>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                title="Sheet 1 (clienți) — D:Nume E:Email F:CNP/CUI G:Serviciu H:Link I:Preț"
                onClick={async () => {
                  const idCode = isPJ
                    ? String(company?.cui || billing?.cui || '').replace(/^RO/i, '')
                    : String(personal?.cnp || billing?.cnp || '');
                  const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://eghiseul.ro'}/admin/orders/${order.id}`;
                  const row = [customerName, contact?.email || '', idCode, sheetServiceLabel, link, sheetPrice].join('\t');
                  try {
                    await navigator.clipboard.writeText(row);
                    toast.success('Sheet 1 copiat — paste în coloana D');
                  } catch {
                    toast.error('Nu am putut copia.');
                  }
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Sheet 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                title="Sheet 2 (instituții) — D:Nume E:Email F:Preț G:Serviciu H:- I:Instituție J:Motiv"
                onClick={async () => {
                  const row = [customerName, contact?.email || '', sheetPrice, sheetServiceLabel, '-', sheetInstitution, sheetMotiv].join('\t');
                  try {
                    await navigator.clipboard.writeText(row);
                    toast.success('Sheet 2 copiat — paste în coloana D');
                  } catch {
                    toast.error('Nu am putut copia.');
                  }
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Sheet 2
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Tip persoana" value={isPJ ? 'Persoana Juridica' : 'Persoana Fizica'} />
            <InfoRow label="Nume" value={customerName} icon={isPJ ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />} />
            {isPJ && company?.cui && <InfoRow label="CUI" value={String(company.cui)} />}
            {contact?.email && <InfoRow label="Email" value={contact.email} icon={<Mail className="h-3.5 w-3.5" />} />}
            {contact?.phone && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <Phone className="h-3.5 w-3.5" />
                  Telefon
                </span>
                <div className="flex items-center gap-2">
                  <span>{contact.phone}</span>
                  <a
                    href={`https://wa.me/${contact.phone.replace(/[\s+()-]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            )}
            {!contact?.email && !contact?.phone && (
              <p className="text-sm text-muted-foreground">Nicio informatie de contact.</p>
            )}

            {/* Corectare contact — clientul greșește frecvent telefonul și
                devine de necontactat; echipa îl corectează aici (cu audit). */}
            <ContactEditInline
              orderId={order.id}
              email={contact?.email || ''}
              phone={contact?.phone || ''}
              onSaved={refreshSilent}
            />

            {/* Account linkage — client cu cont eGhișeul + status KYC pe cont */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Cont eGhișeul
                </span>
                {account ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 border border-blue-200">
                    <CheckCircle2 className="h-3 w-3" /> Client înregistrat
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                    Comandă ca invitat
                  </span>
                )}
              </div>
              {account && (
                <>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" /> KYC cont
                    </span>
                    {account.kycVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 border border-green-300">
                        <CheckCircle2 className="h-3 w-3" /> Verificat
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 border border-amber-300">
                        <AlertTriangle className="h-3 w-3" /> Neverificat — necesită check
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleAccountKyc}
                      disabled={kycSaving}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
                        account.kycVerified
                          ? 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {kycSaving
                        ? 'Se salvează...'
                        : account.kycVerified
                          ? 'Anulează verificarea KYC'
                          : 'Marchează KYC verificat'}
                    </button>
                    <a href="/admin/users" className="text-xs text-primary-600 hover:underline">
                      Vezi clientul →
                    </a>
                  </div>
                </>
              )}
            </div>
            {/* Citizenship + foreign type (PF only). Surfaced for admin
                triage — foreign citizens have a different processing SLA. */}
            {contact?.citizenship && (
              <InfoRow
                label="Cetatenie"
                value={
                  contact.citizenship === 'romanian'
                    ? 'Cetatean roman'
                    : contact.foreignType === 'eu'
                    ? 'Cetatean strain — UE'
                    : contact.foreignType === 'non-eu'
                    ? 'Cetatean strain — Non-UE'
                    : 'Cetatean strain'
                }
              />
            )}
            {contact?.purpose && (
              <InfoRow label="Motivul solicitarii" value={String(contact.purpose)} />
            )}

            {/* Date personale / firmă — continuare în același card */}
            {(personal || company) && (
              <>
                <Separator className="my-2" />
            {isPJ && company ? (
              <>
                {/* Denumire + CUI sunt deja afișate în capul cardului (Nume /
                    CUI) — aici rămân doar datele care NU apar mai sus. */}
                {(company.registrationNumber || company.regCom) && (
                  <InfoRow label="Nr. Reg. Com." value={company.registrationNumber || company.regCom} mono />
                )}
                {company.validationStatus && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Validare CUI</span>
                    <Badge variant={company.validationStatus === 'valid' ? 'default' : 'destructive'}
                           className={company.validationStatus === 'valid' ? 'bg-green-600' : ''}>
                      {company.validationStatus === 'valid' ? 'Validat ANAF' : company.validationStatus}
                    </Badge>
                  </div>
                )}
                {company.address && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sediu social</p>
                    <p className="text-sm">{formatAddress(company.address) || 'N/A'}</p>
                  </>
                )}
              </>
            ) : personal ? (
              <>
                {/* Compact 2-column grid for personal data */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  {personal.lastName && (
                    <div>
                      <span className="text-muted-foreground text-xs">Nume</span>
                      <p className="font-medium">{personal.lastName}</p>
                    </div>
                  )}
                  {personal.firstName && (
                    <div>
                      <span className="text-muted-foreground text-xs">Prenume</span>
                      <p className="font-medium">{personal.firstName}</p>
                    </div>
                  )}
                  {personal.cnp && (
                    <div>
                      <span className="text-muted-foreground text-xs">CNP</span>
                      <p className="font-mono font-medium">{personal.cnp}</p>
                    </div>
                  )}
                  {personal.birthPlace && (
                    <div>
                      <span className="text-muted-foreground text-xs">Locul nasterii (localitate)</span>
                      <p className="font-medium">{personal.birthPlace}</p>
                    </div>
                  )}
                  {/* Judetul nasterii derivat din CNP — autoritar (codul 7-8 din CNP).
                      OCR poate da "Mun. Bucuresti Sec. 1" la localitate; CNP da
                      "Bucuresti S.1" la judet, care e ce intra pe cerere. */}
                  {personal.cnp && getCountyFromCNP(personal.cnp) && (
                    <div>
                      <span className="text-muted-foreground text-xs">Judet nastere (din CNP)</span>
                      <p className="font-medium">{getCountyFromCNP(personal.cnp)}</p>
                    </div>
                  )}
                  {personal.birthDate && (
                    <div>
                      <span className="text-muted-foreground text-xs">Data nasterii</span>
                      <p className="font-medium">{formatDateOnly(personal.birthDate)}</p>
                    </div>
                  )}
                  {(personal.documentSeries || personal.ci_series || personal.ciSeries) && (
                    <div>
                      <span className="text-muted-foreground text-xs">Serie CI</span>
                      <p className="font-mono font-medium">{personal.documentSeries || personal.ci_series || personal.ciSeries}</p>
                    </div>
                  )}
                  {(personal.documentNumber || personal.ci_number || personal.ciNumber) && (
                    <div>
                      <span className="text-muted-foreground text-xs">Numar CI</span>
                      <p className="font-mono font-medium">{personal.documentNumber || personal.ci_number || personal.ciNumber}</p>
                    </div>
                  )}
                  {(personal.documentIssuedBy || personal.issuedBy) && (
                    <div>
                      <span className="text-muted-foreground text-xs">Emis de</span>
                      <p className="font-medium">{personal.documentIssuedBy || personal.issuedBy}</p>
                    </div>
                  )}
                  {(personal.documentExpiry || personal.expiryDate) && (
                    <div>
                      <span className="text-muted-foreground text-xs">Data expirare</span>
                      <p className="font-medium">{formatDateOnly(personal.documentExpiry || personal.expiryDate)}</p>
                    </div>
                  )}
                </div>

                {/* Address as separate labeled fields */}
                {personal.address && typeof personal.address === 'object' && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adresa domiciliu</p>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-sm">
                      {/* Each address field renders only when populated —
                          empty Bl/Sc/Et/Ap/Cod postal cells were noisy on
                          most orders where the customer only had Str+Nr. */}
                      {personal.address.street && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground text-xs">Str</span>
                          <p className="font-medium">{personal.address.street}</p>
                        </div>
                      )}
                      {personal.address.number && (
                        <div>
                          <span className="text-muted-foreground text-xs">Nr</span>
                          <p className="font-medium">{personal.address.number}</p>
                        </div>
                      )}
                      {personal.address.building && (
                        <div>
                          <span className="text-muted-foreground text-xs">Bl</span>
                          <p className="font-medium">{personal.address.building}</p>
                        </div>
                      )}
                      {personal.address.staircase && (
                        <div>
                          <span className="text-muted-foreground text-xs">Sc</span>
                          <p className="font-medium">{personal.address.staircase}</p>
                        </div>
                      )}
                      {personal.address.floor && (
                        <div>
                          <span className="text-muted-foreground text-xs">Et</span>
                          <p className="font-medium">{personal.address.floor}</p>
                        </div>
                      )}
                      {personal.address.apartment && (
                        <div>
                          <span className="text-muted-foreground text-xs">Ap</span>
                          <p className="font-medium">{personal.address.apartment}</p>
                        </div>
                      )}
                      {personal.address.city && (
                        <div>
                          <span className="text-muted-foreground text-xs">Localitatea</span>
                          <p className="font-medium">{personal.address.city}</p>
                        </div>
                      )}
                      {personal.address.county && (
                        <div>
                          <span className="text-muted-foreground text-xs">Jud</span>
                          <p className="font-medium">{personal.address.county}</p>
                        </div>
                      )}
                      {(personal.address.postalCode || personal.address.postal_code) && (
                        <div>
                          <span className="text-muted-foreground text-xs">Cod postal</span>
                          <p className="font-medium">{personal.address.postalCode || personal.address.postal_code}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {/* Fallback: address is a string */}
                {personal.address && typeof personal.address === 'string' && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adresa domiciliu</p>
                    <p className="text-sm">{personal.address}</p>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isPJ ? 'Nicio informatie despre firma.' : 'Nicio informatie personala.'}
              </p>
            )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Date stare civilă — for naștere/căsătorie/celibat orders. Renders
            customer_data.civil_status (marriage history, parents, birth name,
            purpose) which was previously stored but never displayed. */}
        <CivilStatusCard civilStatus={(order.customer_data as AnyObj | null)?.civil_status as AnyObj | null} />

        {/* Date imobil — identificare imobil / servicii cadastrale. Renders
            customer_data.property (county/locality/address/owner/CF), needed
            by the team to actually run the identification. */}
        <PropertyCard property={(order.customer_data as AnyObj | null)?.property as AnyObj | null} />
        </div>
        {/* RIGHT column — service+options on top, delivery info below */}
        <div className="space-y-4">
        {/* Delivery Address — hidden entirely for email-only deliveries
            (certificat constatator, extras CF: PDF-ul e singura metodă, cardul
            ar arăta doar "Metoda: Email (PDF)" = zgomot). Reapare dacă există
            orice semnal fizic: adresă, curier sau AWB. */}
        {!(
          deliveryMethodParsed?.type === 'email' &&
          !order.delivery_address &&
          !detectedCourierProvider &&
          !order.delivery_tracking_number
        ) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Livrare
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deliveryMethodParsed && (
              <InfoRow label="Metoda" value={deliveryMethodParsed.name || deliveryMethodParsed.type || 'N/A'} />
            )}
            {/* Hide cost row for free delivery (Email/PDF) — showing
                "0.00 RON" is just noise. */}
            {deliveryMethodParsed?.price !== undefined &&
              Number(deliveryMethodParsed.price) > 0 && (
                <InfoRow
                  label="Cost livrare"
                  value={`${Number(deliveryMethodParsed.price).toFixed(2)} RON`}
                />
              )}
            {detectedCourierProvider && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Curier</span>
                <span className="flex items-center gap-1.5">
                  <CourierIcon provider={detectedCourierProvider} />
                  <span className="font-medium">
                    {detectedCourierProvider === 'fancourier' ? 'Fan Courier' :
                     detectedCourierProvider === 'sameday' ? 'Sameday' : detectedCourierProvider}
                  </span>
                </span>
              </div>
            )}
            {isLockerDelivery && courierQuote?.lockerName && (
              <>
                <Separator className="my-2" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Locker</p>
                <InfoRow label="Punct" value={courierQuote.lockerName} />
                {courierQuote?.lockerAddress && (
                  <p className="text-sm text-muted-foreground">{courierQuote.lockerAddress}</p>
                )}
              </>
            )}
            {order.delivery_address && !isLockerDelivery && (
              <>
                <Separator className="my-2" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adresa livrare</p>
                <div className="text-sm space-y-1">
                  {order.delivery_address.street && (
                    <p className="font-medium">
                      {[
                        order.delivery_address.street && `${order.delivery_address.street}${order.delivery_address.number ? `, Nr. ${order.delivery_address.number}` : ''}`,
                        order.delivery_address.building && `Bl. ${order.delivery_address.building}`,
                        order.delivery_address.staircase && `Sc. ${order.delivery_address.staircase}`,
                        order.delivery_address.floor && `Et. ${order.delivery_address.floor}`,
                        order.delivery_address.apartment && `Ap. ${order.delivery_address.apartment}`,
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {[
                      order.delivery_address.city,
                      order.delivery_address.county && `Jud. ${order.delivery_address.county}`,
                      order.delivery_address.postalCode || order.delivery_address.postal_code,
                    ].filter(Boolean).join(', ')}
                  </p>
                  {order.delivery_address.country && (
                    <p className="text-muted-foreground">{order.delivery_address.country}</p>
                  )}
                  {(order.delivery_address.name || order.delivery_address.phone) && (
                    <p className="text-muted-foreground">
                      {[order.delivery_address.name, order.delivery_address.phone].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {/* Copy-paste friendly international label (name / street /
                      postal city / country / phone) for manual shipping (DHL etc.) */}
                  <CopyAddressButton
                    label={[
                      order.delivery_address.name ||
                        (order.customer_data as AnyObj | null)?.contact?.name ||
                        '',
                      [
                        order.delivery_address.street,
                        order.delivery_address.number && `Nr. ${order.delivery_address.number}`,
                      ].filter(Boolean).join(', '),
                      [
                        order.delivery_address.postalCode || order.delivery_address.postal_code,
                        order.delivery_address.city,
                      ].filter(Boolean).join(' '),
                      order.delivery_address.county,
                      order.delivery_address.country || 'România',
                      order.delivery_address.phone ||
                        (order.customer_data as AnyObj | null)?.contact?.phone,
                    ]
                      .filter(Boolean)
                      .join('\n')}
                  />
                </div>
              </>
            )}
            {!order.delivery_address && !isLockerDelivery && !deliveryMethodParsed && (
              <p className="text-sm text-muted-foreground">Nicio informatie de livrare.</p>
            )}
            {/* AWB controls nested inside the Livrare card so the operator
                doesn't have to scroll to a separate section. Renders the
                "Genereaza AWB" button when courier is set but no AWB yet,
                or the AWB number + Print/Tracking/Cancel buttons once
                generated. Returns null for email/PDF orders. */}
            <AwbSection
              order={order}
              hasCourier={hasCourier}
              hasAwb={hasAwb}
              isLockerDelivery={isLockerDelivery}
              deliveryMethodParsed={deliveryMethodParsed}
              courierQuote={courierQuote}
              detectedCourierProvider={detectedCourierProvider}
              generating={generating}
              awbError={awbError}
              cancelling={cancelling}
              downloading={downloading}
              onGenerateAwb={handleGenerateAwb}
              onPrintLabel={handlePrintLabel}
              onCancelAwb={handleCancelAwb}
              onCopyAwb={handleCopyAwb}
              onMarkDelivered={handleMarkDelivered}
            />
          </CardContent>
        </Card>
        )}

        {/* Facturare — mutat în coloana dreaptă sub Livrare (umple golul,
            cerere user). */}
        {/* Facturare — clean InfoRow style matching sister project. Includes
            Oblio invoice number row with a link when the invoice has been
            issued (paid orders). */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Facturare
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {(() => {
              const isPJBilling = billing?.type === 'persoana_juridica';
              const tipFactura = isPJBilling ? 'Persoana Juridica' : 'Persoana Fizica';
              const nume = isPJBilling
                ? billing?.companyName || ''
                : [billing?.lastName || personal?.lastName, billing?.firstName || personal?.firstName]
                    .filter(Boolean)
                    .join(' ');
              const addrObj = isPJBilling
                ? typeof billing?.companyAddress === 'object'
                  ? billing.companyAddress
                  : null
                : typeof personal?.address === 'object'
                  ? personal.address
                  : null;
              const addrStr = isPJBilling
                ? typeof billing?.companyAddress === 'string'
                  ? billing.companyAddress
                  : ''
                : typeof personal?.address === 'string'
                  ? personal.address
                  : '';

              // For PF the invoice address comes from the billing step
              // (billing.address/city/county) — that's what's sent to Oblio and
              // may differ from the domicile (e.g. passport users, "another
              // person"). Fall back to the scanned domicile address.
              const pfStrada =
                (!isPJBilling && billing?.address) ||
                (addrObj
                  ? [
                      addrObj.street,
                      addrObj.number && `nr. ${addrObj.number}`,
                      addrObj.building && `bl. ${addrObj.building}`,
                      addrObj.staircase && `sc. ${addrObj.staircase}`,
                      addrObj.floor && `et. ${addrObj.floor}`,
                      addrObj.apartment && `ap. ${addrObj.apartment}`,
                    ]
                      .filter(Boolean)
                      .join(', ')
                  : addrStr);
              const strada = isPJBilling
                ? addrObj
                  ? [
                      addrObj.street,
                      addrObj.number && `nr. ${addrObj.number}`,
                      addrObj.building && `bl. ${addrObj.building}`,
                      addrObj.staircase && `sc. ${addrObj.staircase}`,
                      addrObj.floor && `et. ${addrObj.floor}`,
                      addrObj.apartment && `ap. ${addrObj.apartment}`,
                    ]
                      .filter(Boolean)
                      .join(', ')
                  : addrStr
                : pfStrada;
              const cityVal = isPJBilling
                ? addrObj?.city
                : billing?.city || addrObj?.city;
              const countyVal = isPJBilling
                ? addrObj?.county
                : billing?.county || addrObj?.county;
              const postalVal = isPJBilling
                ? addrObj?.postalCode || addrObj?.postal_code
                : billing?.postalCode || addrObj?.postalCode || addrObj?.postal_code;

              return (
                <>
                  <InfoRow label="Tip factură" value={tipFactura} />
                  {nume && <InfoRow label="Nume" value={nume} />}
                  {isPJBilling && billing?.cui && <InfoRow label="CUI" value={billing.cui} mono />}
                  {isPJBilling && (billing?.regCom || billing?.registrationNumber) && (
                    <InfoRow
                      label="Nr. Reg. Com."
                      value={billing.regCom || billing.registrationNumber}
                      mono
                    />
                  )}
                  {strada && <InfoRow label="Strada" value={strada} />}
                  {cityVal && <InfoRow label="Oraș" value={cityVal} />}
                  {countyVal && <InfoRow label="Județ" value={countyVal} />}
                  {postalVal && (
                    <InfoRow label="Cod poștal" value={postalVal} />
                  )}
                  <Separator className="my-1.5" />
                  {/* Oblio invoice slot — shows "—" until the invoice is
                      issued, then displays the invoice number with a link
                      to the Oblio PDF. */}
                  {order.invoice_number && order.invoice_url ? (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Nr. factură Oblio</span>
                      <Link
                        href={order.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-primary hover:underline"
                      >
                        {order.invoice_number} ↗
                      </Link>
                    </div>
                  ) : order.invoice_number ? (
                    <InfoRow label="Nr. factură Oblio" value={order.invoice_number} mono />
                  ) : (
                    <InfoRow label="Nr. factură Oblio" value="—" />
                  )}
                  {!billing && !personal && (
                    <p className="text-sm text-muted-foreground">Nicio informație de facturare.</p>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* ROW 3: Client Uploaded Documents + KYC inline + Signature.
          KYC verification badges are rendered per-document (OCR % and
          face-match %) instead of in a separate card — so the operator
          sees the confidence right next to the photo it applies to. */}
      {(allClientDocs.length > 0 || signature?.signatureBase64) && (
        (() => {
          const kycByType = extractKycByDocType(order.customer_data);
          const reviewNeeded = needsKycReview(kycByType);
          const crossValWarnings = computeOcrCrossValidationWarnings(order.customer_data);
          const ocrFormRows = computeOcrVsFormRows(order.customer_data);
          const ocrFormMismatches = ocrFormRows.filter((r) => !r.match && r.ocr !== '—' && r.form !== '—').length;
          const personalData = order.customer_data?.personalData || order.customer_data?.personal;
          const idDocumentType = personalData?.idDocumentType as 'ci_vechi' | 'ci_nou' | 'passport' | null | undefined;
          const idTypeLabel =
            idDocumentType === 'ci_vechi' ? 'CI vechi (fără cip)' :
            idDocumentType === 'ci_nou' ? 'CI nou electronic (cu cip)' :
            idDocumentType === 'passport' ? 'Pașaport' :
            null;
          const adminVerifiedAt = personalData?.adminVerifiedAt as string | undefined;
          const adminVerifiedBy = personalData?.adminVerifiedBy as string | undefined;
          return (
        <Card className={
          adminVerifiedAt
            ? 'border-green-300 bg-green-50/30'
            : (reviewNeeded || crossValWarnings.length > 0)
              ? 'border-yellow-300 bg-yellow-50/30'
              : ''
        }>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                <Upload className="h-4 w-4" />
                Documente încărcate de client
                {idTypeLabel && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800 border border-blue-200">
                    <CreditCard className="h-3 w-3" />
                    {idTypeLabel}
                  </span>
                )}
                {Object.keys(kycByType).length > 0 && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                    <Shield className="h-3 w-3" />
                    KYC
                  </span>
                )}
                {crossValWarnings.length > 0 && !adminVerifiedAt && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900 border border-amber-300">
                    <AlertTriangle className="h-3 w-3" />
                    {crossValWarnings.length} {crossValWarnings.length === 1 ? 'avertisment' : 'avertismente'}
                  </span>
                )}
                {adminVerifiedAt && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 border border-green-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Verificat manual
                  </span>
                )}
              </CardTitle>

              {/* Verify / Unverify + request-reupload actions */}
              <div className="flex flex-col items-end gap-2">
                <VerifyDocumentsButton
                  orderId={order.id}
                  verifiedAt={adminVerifiedAt}
                  verifiedBy={adminVerifiedBy}
                  onChange={refreshSilent}
                />
                <RequestDocumentsButton
                  orderId={order.id}
                  customerPhone={contact?.phone}
                  verificationConfig={order.services?.verification_config}
                  onSent={refreshSilent}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {reuploadRequest && reuploadRequest.status !== 'completed' && (
              <Alert className={reuploadRequest.status === 'expired' ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-300'}>
                <Camera className={`h-4 w-4 ${reuploadRequest.status === 'expired' ? 'text-red-700' : 'text-orange-700'}`} />
                <AlertTitle className={`text-sm font-semibold ${reuploadRequest.status === 'expired' ? 'text-red-900' : 'text-orange-900'}`}>
                  {reuploadRequest.status === 'expired'
                    ? 'Cerere de documente EXPIRATĂ (clientul nu a încărcat la timp)'
                    : 'Documente solicitate de la client — în așteptare'}
                </AlertTitle>
                <AlertDescription className={`text-sm ${reuploadRequest.status === 'expired' ? 'text-red-800' : 'text-orange-800'}`}>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {reuploadRequest.documentTypes.map((t) => {
                      const done = reuploadRequest.completedDocuments.some((d) => d.type === t);
                      return (
                        <li key={t}>
                          {REUPLOAD_DOC_SPECS[t]?.label ?? t}
                          {done && <span className="ml-1 text-green-700 font-medium">✓ încărcat</span>}
                        </li>
                      );
                    })}
                  </ul>
                  {reuploadRequest.reason && (
                    <p className="text-xs mt-1.5 italic">Motiv: {reuploadRequest.reason}</p>
                  )}
                  <p className="text-xs mt-1.5">
                    Solicitat {new Date(reuploadRequest.requestedAt).toLocaleString('ro-RO')} · valabil până la{' '}
                    {new Date(reuploadRequest.expiresAt).toLocaleDateString('ro-RO')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        navigator.clipboard?.writeText(reuploadRequest.url);
                        toast.success('Link copiat');
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiază linkul
                    </Button>
                    {contact?.phone && reuploadRequest.status === 'pending' && (
                      <a
                        href={`https://wa.me/${contact.phone.replace(/[\s+()-]/g, '')}?text=${encodeURIComponent(`Bună! Pentru a continua comanda, te rugăm încarcă documentele aici: ${reuploadRequest.url}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="h-7 text-xs border-green-300 text-green-700 hover:bg-green-50">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          WhatsApp
                        </Button>
                      </a>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {crossValWarnings.length > 0 && (
              <Alert className="bg-amber-50 border-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <AlertTitle className="text-amber-900 text-sm font-semibold">
                  Cross-validation: datele nu se potrivesc între scanări
                </AlertTitle>
                <AlertDescription className="text-amber-800 text-sm">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {crossValWarnings.map((w, i) => (
                      <li key={i}>{w.message}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-amber-700 mt-2 italic">
                    Verifică manual documentele înainte de procesare. Mismatches pot însemna OCR slab, document greșit urcat, sau identitate diferită.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            {reviewNeeded && (
              <Alert className="bg-yellow-50 border-yellow-300">
                <AlertTriangle className="h-4 w-4 text-yellow-700" />
                <AlertDescription className="text-yellow-800 text-sm font-medium">
                  Verificare KYC necesită revizuire manuală — confidence sub 70% pe cel puțin un
                  document sau face-match.
                </AlertDescription>
              </Alert>
            )}

            {/* OCR (de pe buletin) vs date completate de client în formular */}
            {ocrFormRows.length > 0 && (
              <div className={`rounded-lg border ${ocrFormMismatches > 0 ? 'border-amber-300 bg-amber-50/40' : 'border-neutral-200 bg-neutral-50/40'}`}>
                <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100">
                  {ocrFormMismatches > 0 ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-sm font-semibold text-secondary-900">
                    OCR buletin vs. date completate
                  </span>
                  {ocrFormMismatches > 0 && (
                    <span className="ml-auto inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
                      {ocrFormMismatches} {ocrFormMismatches === 1 ? 'diferență' : 'diferențe'}
                    </span>
                  )}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-neutral-400">
                      <th className="text-left font-medium px-3 py-1.5">Câmp</th>
                      <th className="text-left font-medium px-3 py-1.5">OCR (buletin)</th>
                      <th className="text-left font-medium px-3 py-1.5">Formular (client)</th>
                      <th className="px-3 py-1.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ocrFormRows.map((r) => (
                      <tr key={r.field} className={`border-t border-neutral-100 ${!r.match && r.ocr !== '—' && r.form !== '—' ? 'bg-amber-50' : ''}`}>
                        <td className="px-3 py-1.5 text-neutral-500">{r.label}</td>
                        <td className="px-3 py-1.5 font-medium text-secondary-900 tabular-nums">{r.ocr}</td>
                        <td className="px-3 py-1.5 font-medium text-secondary-900 tabular-nums">{r.form}</td>
                        <td className="px-3 py-1.5 text-right">
                          {r.ocr === '—' || r.form === '—' ? (
                            <span className="text-neutral-300">–</span>
                          ) : r.match ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600 inline" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ocrFormMismatches > 0 && (
                  <p className="px-3 py-2 text-xs text-amber-700 italic border-t border-amber-100">
                    Clientul a modificat datele față de buletinul scanat. Verifică înainte de procesare.
                  </p>
                )}
              </div>
            )}




            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {allClientDocs.map((doc, i) => (
                <ClientDocumentCard
                  key={`${doc.type}-${i}`}
                  doc={doc}
                  kyc={kycByType[doc.type]}
                  orderId={order.id}
                  onRerun={refreshSilent}
                />
              ))}
            </div>
            {allClientDocs.length === 0 && (
              <p className="text-sm text-muted-foreground">Niciun document încărcat de client.</p>
            )}

            {/* Signature */}
            {signature?.signatureBase64 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <PenLine className="h-3.5 w-3.5" />
                    Semnatura electronica
                  </p>
                  <div className="inline-block border rounded-lg p-2 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={signature.signatureBase64.startsWith('data:') ? signature.signatureBase64 : `data:image/png;base64,${signature.signatureBase64}`}
                      alt="Semnatura client"
                      className="h-16 w-auto"
                    />
                  </div>
                  {signature.signedAt && (
                    <p className="text-xs text-muted-foreground mt-1">Semnat la: {formatDate(signature.signedAt)}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
          );
        })()
      )}

      {/* ROW 2: Contract semnat + Plata — aceeași linie, 50/50 (cerere user). */}
      <div className="grid gap-4 lg:grid-cols-2 items-start">

        {/* Contract semnat — legal validity audit: signature timestamp,
            signing IP, browser user agent, SHA-256 of the contract PDF.
            Hidden when the contract hasn't been signed yet. */}
        <ContractSignedCard customerData={order.customer_data} />
        {/* Payment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Plata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pret baza serviciu</span>
              <span className="text-sm">{order.base_price?.toFixed(2) || '0.00'} RON</span>
            </div>
            {(order.options_price || 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Optiuni</span>
                <span className="text-sm">+{(order.options_price || 0).toFixed(2)} RON</span>
              </div>
            )}
            {(order.delivery_price || 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Livrare</span>
                <span className="text-sm">+{(order.delivery_price || 0).toFixed(2)} RON</span>
              </div>
            )}
            {(order.discount_amount || 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Discount</span>
                <span className="text-sm text-green-600">-{(order.discount_amount || 0).toFixed(2)} RON</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between text-base font-bold">
              <span>Total</span>
              <span>{order.total_price?.toFixed(2) || '0.00'} RON</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                Metoda plata
              </span>
              <span className="flex items-center gap-1.5">
                {order.payment_method === 'bank_transfer' ? (
                  'Transfer bancar'
                ) : order.payment_method === 'card' || order.payment_method === 'stripe' ? (
                  <>
                    <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                    Stripe (card)
                  </>
                ) : order.payment_method ? (
                  order.payment_method
                ) : order.stripe_payment_intent_id || order.stripe_checkout_session_id ? (
                  <>
                    <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                    Stripe (card)
                  </>
                ) : order.payment_status === 'paid' || order.payment_status === 'succeeded' ? (
                  'Platita'
                ) : (
                  'Nespecificata'
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status plata</span>
              <PaymentStatusBadge status={order.payment_status} />
            </div>
            {/* Stripe dashboard deep links — parity with sister. Live vs test
                detected from the checkout-session prefix (cs_live_/cs_test_). */}
            {(() => {
              const isTest = order.stripe_checkout_session_id?.startsWith('cs_test_') || order.is_test;
              const stripeBase = isTest ? 'https://dashboard.stripe.com/test' : 'https://dashboard.stripe.com';
              return (
                <>
                  {order.stripe_checkout_session_id && (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted-foreground shrink-0">Checkout Session</span>
                      <a
                        href={`${stripeBase}/checkout/sessions/${order.stripe_checkout_session_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-xs text-indigo-600 hover:text-indigo-800 hover:underline truncate max-w-[60%]"
                        title="Deschide sesiunea in Stripe Dashboard"
                      >
                        {order.stripe_checkout_session_id.substring(0, 22)}…
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  )}
                  {order.stripe_payment_intent_id && (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted-foreground shrink-0">Stripe Payment</span>
                      <a
                        href={`${stripeBase}/payments/${order.stripe_payment_intent_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-xs text-indigo-600 hover:text-indigo-800 hover:underline truncate max-w-[60%]"
                        title="Deschide plata in Stripe Dashboard"
                      >
                        {order.stripe_payment_intent_id.substring(0, 22)}…
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </>
              );
            })()}
            <InfoRow label="Platita la" value={order.paid_at ? formatDate(order.paid_at) : 'Neplătit'} />
            <InfoRow label="Data comanda" value={formatDate(order.created_at)} />
          </CardContent>
        </Card>
      </div>


      {/* PROCESSING / GENERARE DOCUMENTE — at the bottom, parity with the
          sister's "Generare Documente Juridice" placement. */}
      <ProcessingSection
        order={order}
        documents={orderDocuments}
        optionStatuses={optionStatuses}
        onStatusChange={refreshSilent}
      />

      {/* Order Timeline — ultimul, cerere user */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Istoric comanda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTimeline timeline={timeline} orderCreatedAt={order.created_at} />
        </CardContent>
      </Card>


      {/* Admin Notes */}
      {order.admin_notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Note interne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{order.admin_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Raw customer_data debug (collapsible) */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground py-2">
          Date brute customer_data (debug)
        </summary>
        <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto">
          {JSON.stringify(order.customer_data, null, 2)}
        </pre>
      </details>

      {/* Modify dialog — invoked by the "Modifică" header button. State + open
          flag live on the page so we can refresh the order data after a
          successful apply. */}
      <ModifyOrderDialog
        open={modifyDialogOpen}
        onOpenChange={setModifyDialogOpen}
        orderId={order.id}
        orderNumber={displayOrderNumber}
        initialOptions={(order.selected_options ?? []) as Parameters<typeof ModifyOrderDialog>[0]['initialOptions']}
        initialDeliveryPrice={Number(order.delivery_price ?? 0)}
        onApplied={refreshSilent}
      />

    </div>
  );
}

// ---------- Note Echipă Card ----------

function NoteEchipaCard({
  orderId,
  timeline,
  onAdded,
}: {
  orderId: string;
  timeline: TimelineEvent[];
  onAdded: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only MANUALLY added team notes (event_type note_added, human author).
  // Status-change notes are NOT repeated here — they already show in the
  // Istoric timeline below (user request: no duplication).
  const visibleNotes = useMemo(
    () =>
      timeline.filter((t: TimelineEvent) => {
        const by = (t.changed_by || '').toLowerCase();
        // Only notes with a REAL human author — auto rows (contract generat
        // automat etc.) have changed_by null and are not team notes.
        if (!by || by.startsWith('system')) return false;
        return t.event_type === 'note_added' && !!(t.notes || '').trim();
      }),
    [timeline]
  );

  const submit = async () => {
    const text = draft.trim();
    if (text.length < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: text }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Eroare la salvare');
        return;
      }
      setDraft('');
      onAdded();
    } catch {
      setError('Eroare de rețea');
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter submits.
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Card id="notes-echipa">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PenLine className="h-4 w-4" />
          Note Echipă
          {visibleNotes.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              ({visibleNotes.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nicio notă încă. Prima ta notă apare aici.</p>
        ) : (
          <ul className="space-y-2.5">
            {visibleNotes.map((n) => (
              <li
                key={n.id}
                className="rounded-md border border-amber-100 bg-amber-50/40 p-2.5 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-slate-700">{n.changed_by || 'admin'}</span>
                  <span>·</span>
                  <span>{n.created_at ? new Date(n.created_at).toLocaleString('ro-RO') : '—'}</span>
                  {n.event_type !== 'note_added' && n.to_status && (
                    <span className="rounded bg-slate-200 px-1.5 py-0 text-[10px] font-semibold tracking-wide text-slate-700">
                      la status: {n.to_status}
                    </span>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-slate-900">{n.notes}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2 border-t border-slate-100 pt-3">
          <Label htmlFor="note-textarea" className="text-xs font-medium text-slate-600">
            Adaugă notă (Cmd/Ctrl+Enter pentru salvare rapidă)
          </Label>
          <Textarea
            id="note-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Adaugă o notă despre acest client / comandă (vizibilă doar echipei)…"
            rows={3}
            className="resize-none text-sm"
            maxLength={5000}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end">
            <Button size="sm" onClick={submit} disabled={submitting || draft.trim().length === 0}>
              {submitting ? 'Se salvează…' : 'Adaugă notă'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Cancellation Requested Banner ----------

function CancellationRequestedBanner({
  order,
  onProcessed,
}: {
  order: OrderDetail;
  onProcessed: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const totalRon = Number(order.total_price || 0);
  const refundAmountRon = Math.round(totalRon * 0.7 * 100) / 100;

  const processRefund = async () => {
    if (
      !confirm(
        `Procesezi refund 70% (${refundAmountRon.toFixed(
          2
        )} RON din ${totalRon.toFixed(2)} RON) și marchezi comanda ca 'refunded'?\n\nOperația trimite cererea automat la Stripe.`
      )
    ) {
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/process-cancellation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Refund eșuat');
        return;
      }
      toast.success(`Refund procesat: ${json.refundAmountRon.toFixed(2)} RON (${json.refundId})`);
      onProcessed();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare rețea');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-semibold text-red-900">
            <AlertCircle className="h-5 w-5" />
            Cerere de anulare — refund 70% în așteptare
          </div>
          <p className="mt-1 text-sm text-red-800">
            Clientul a solicitat anularea în termenul de 30 minute. Procesarea acestui buton va
            iniția refund-ul Stripe ({refundAmountRon.toFixed(2)} RON din {totalRon.toFixed(2)}{' '}
            RON) și va marca comanda ca <code>refunded</code>.
          </p>
          <p className="mt-1 text-xs text-red-700">
            Diferența de 30% (~{(totalRon - refundAmountRon).toFixed(2)} RON) rămâne reținută per
            policy (acoperă comisioanele Stripe + procesarea începută).
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={processRefund}
          disabled={processing}
          className="shrink-0 text-white"
        >
          {processing ? 'Se procesează…' : `Procesează refund ${refundAmountRon.toFixed(2)} RON`}
        </Button>
      </div>
    </div>
  );
}

// ---------- Client Document Card ----------

// ---------- KYC helpers (merged into the Documents card) ----------
// Pure logic lives in `src/lib/kyc/review.ts` so it stays unit-testable and
// shared. See `extractKycByDocType` / `needsKycReview` there.

// Which doc types can be re-run through OCR. Excludes selfie + company
// docs because we don't have OCR pipelines for those (selfie has a
// separate KYC face-match flow).
const RERUNNABLE_OCR_TYPES = new Set([
  'ci_front', 'ci_back', 'ci_nou_front', 'ci_nou_back', 'ci_vechi',
  'passport', 'passport_opened', 'ro_cei_reader_pdf',
]);

/**
 * "Marchează verificat" — small action surface on the documents card header.
 * Toggles between two states:
 *   - Not verified: shows a green "Marchează verificat" button
 *   - Verified:     shows a muted "Verificat de ... la ..." chip + an
 *                   inline "Retrage" link to undo the verification
 *
 * Calls /api/admin/orders/[id]/verify-documents (POST to verify, DELETE
 * to clear). Parent re-fetches via `onChange` after each transition.
 */
function VerifyDocumentsButton({
  orderId,
  verifiedAt,
  verifiedBy,
  onChange,
}: {
  orderId: string;
  verifiedAt?: string;
  verifiedBy?: string;
  onChange: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-documents`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Marcaj eșuat');
        return;
      }
      toast.success('Documente marcate verificate');
      onChange();
    } catch {
      toast.error('Eroare la marcaj');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Retragi marcajul de verificare manuală?')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-documents`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Retragere eșuată');
        return;
      }
      toast.success('Marcaj retras');
      onChange();
    } catch {
      toast.error('Eroare la retragere');
    } finally {
      setSubmitting(false);
    }
  };

  if (verifiedAt) {
    return (
      <div className="flex flex-col items-end gap-1 text-xs">
        <span className="text-green-700 flex items-center gap-1 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verificat
        </span>
        <span className="text-muted-foreground text-[10px]" title={verifiedBy ? `Admin id: ${verifiedBy}` : undefined}>
          la {formatDate(verifiedAt)}
        </span>
        <button
          type="button"
          onClick={handleClear}
          disabled={submitting}
          className="text-[10px] underline text-muted-foreground hover:text-red-600 disabled:opacity-50"
        >
          Retrage
        </button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 text-xs border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 hover:text-green-800 shrink-0"
      onClick={handleVerify}
      disabled={submitting}
    >
      {submitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
      Marchează verificat
    </Button>
  );
}

/**
 * Admin action: "Solicită documente" — pick which documents the customer must
 * (re)upload, generate a single-use link, email it to them and park the order
 * in standby (SLA paused). Copy / WhatsApp-share controls let the operator
 * also send the link manually (no WhatsApp API integration).
 */
function RequestDocumentsButton({
  orderId,
  customerPhone,
  verificationConfig,
  onSent,
}: {
  orderId: string;
  customerPhone?: string | null;
  verificationConfig?: unknown;
  onSent?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  // Pre-check what the service itself requires (CI+selfie / acte firmă);
  // the operator can adjust freely.
  const suggested = useMemo(
    () => new Set(suggestedDocsForService(verificationConfig)),
    [verificationConfig]
  );
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(suggested.size > 0 ? suggested : ['selfie'])
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    emailSent: boolean;
    expiresAt: string;
    standby: boolean;
  } | null>(null);

  const toggle = (type: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const handleSend = async () => {
    if (selected.size === 0) {
      toast.error('Bifează cel puțin un document');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/request-reupload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentTypes: [...selected], reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Cererea a eșuat');
        return;
      }
      setResult({
        url: data.data.reuploadUrl,
        emailSent: data.data.emailSent,
        expiresAt: data.data.expiresAt,
        standby: !!data.data.standby,
      });
      toast.success(
        data.data.emailSent
          ? `Link trimis pe email${data.data.standby ? ' — comanda e în așteptare client' : ''}`
          : 'Link generat (email indisponibil)'
      );
      onSent?.();
    } catch {
      toast.error('Eroare la generarea linkului');
    } finally {
      setSubmitting(false);
    }
  };

  const waHref = result
    ? `https://wa.me/${(customerPhone || '').replace(/[\s+()-]/g, '')}?text=${encodeURIComponent(
        `Bună! Pentru a continua comanda, te rugăm încarcă documentele aici: ${result.url}`
      )}`
    : '';

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-800 shrink-0"
        onClick={() => setOpen(true)}
      >
        <Camera className="h-3 w-3 mr-1" />
        Solicită documente
      </Button>
    );
  }

  return (
    <div className="w-80 rounded-lg border border-amber-200 bg-amber-50/60 p-3 space-y-2 text-left">
      {!result ? (
        <>
          <p className="text-xs font-medium text-amber-900">
            Ce documente ceri de la client?
          </p>
          <div className="space-y-1 bg-white rounded-md border border-amber-100 p-2 max-h-44 overflow-y-auto">
            {Object.entries(REUPLOAD_DOC_SPECS)
              .filter(([, spec]) => !spec.companionOf)
              .sort(([a], [b]) => Number(suggested.has(b)) - Number(suggested.has(a)))
              .map(([type, spec]) => (
                <label
                  key={type}
                  className="flex items-start gap-2 text-xs text-neutral-800 cursor-pointer py-0.5"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-amber-600"
                    checked={selected.has(type)}
                    onChange={() => toggle(type)}
                  />
                  <span>
                    {spec.label}
                    {suggested.has(type) && (
                      <span className="ml-1 rounded bg-amber-100 px-1 py-px text-[10px] font-medium text-amber-800">
                        necesar la serviciu
                      </span>
                    )}
                  </span>
                </label>
              ))}
          </div>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motiv (opțional) — ex. poza era neclară"
            className="text-xs min-h-[56px] bg-white"
          />
          <p className="text-[11px] text-amber-800">
            Clientul primește email cu link de încărcare. Comanda intră automat în
            „așteptare client&rdquo; (SLA pauzat) și revine singură când încarcă tot.
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={handleSend} disabled={submitting}>
              {submitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
              Trimite cererea ({selected.size})
            </Button>
            <button
              type="button"
              className="text-xs text-neutral-500 hover:text-neutral-700"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Anulează
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs font-medium text-green-800 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {result.emailSent ? 'Link trimis pe email' : 'Link generat'}
            {result.standby ? ' — comandă în așteptare client' : ''}
          </p>
          <p className="text-[11px] text-neutral-600 break-all bg-white rounded px-2 py-1 border border-neutral-200">
            {result.url}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                navigator.clipboard?.writeText(result.url);
                toast.success('Link copiat');
              }}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copiază
            </Button>
            {customerPhone && (
              <a href={waHref} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="h-7 text-xs border-green-300 text-green-700 hover:bg-green-50">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  WhatsApp
                </Button>
              </a>
            )}
            <button
              type="button"
              className="text-xs text-neutral-500 hover:text-neutral-700"
              onClick={() => {
                setOpen(false);
                setResult(null);
                setReason('');
              }}
            >
              Închide
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ClientDocumentCard({
  doc,
  kyc,
  orderId,
  onRerun,
}: {
  doc: { type: string; label: string; s3Key?: string; base64?: string; fileName?: string };
  kyc?: KycPerDoc;
  orderId: string;
  onRerun?: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [rerunning, setRerunning] = useState(false);

  const canRerunOcr = RERUNNABLE_OCR_TYPES.has(doc.type) && (!!doc.s3Key || !!doc.base64);

  const handleRerunOcr = async () => {
    if (rerunning) return;
    setRerunning(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/rerun-ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: doc.type }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Re-rulare OCR eșuată');
        return;
      }
      const conf = data.data?.ocr?.confidence ?? 0;
      const success = data.data?.ocr?.success ?? false;
      toast.success(`OCR re-rulat (${conf}% încredere, ${success ? 'succes' : 'parțial'})`);
      onRerun?.();
    } catch {
      toast.error('Eroare la re-rulare OCR');
    } finally {
      setRerunning(false);
    }
  };

  const handlePreview = async () => {
    if (doc.base64) {
      // Preview base64 image/file in new tab
      const dataUrl = doc.base64.startsWith('data:') ? doc.base64 : `data:image/jpeg;base64,${doc.base64}`;
      window.open(dataUrl, '_blank');
      return;
    }

    if (!doc.s3Key) {
      toast.error('Fisierul nu este disponibil');
      return;
    }

    setDownloading(true);
    try {
      const res = await fetch(`/api/upload/download?key=${encodeURIComponent(doc.s3Key)}`);
      const data = await res.json();
      if (data.success && data.data?.url) {
        // Images and PDFs can be opened directly; DOCX needs Google Viewer
        const isDocx = doc.s3Key.endsWith('.docx') || doc.s3Key.endsWith('.doc');
        if (isDocx) {
          const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(data.data.url)}&embedded=true`;
          window.open(viewerUrl, '_blank');
        } else {
          window.open(data.data.url, '_blank');
        }
      } else {
        toast.error('Nu s-a putut genera link-ul de previzualizare');
      }
    } catch {
      toast.error('Eroare la previzualizare');
    } finally {
      setDownloading(false);
    }
  };

  const isImage = doc.type?.includes('ci_') || doc.type?.includes('selfie') || doc.type?.includes('front') || doc.type?.includes('back');

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
      {isImage ? (
        <ImageIcon className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
      ) : (
        <FileCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{doc.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {doc.s3Key ? 'Stocat în S3' : doc.base64 ? 'Disponibil local' : 'Neîncărcat'}
        </p>
        {/* AI validation result + confidence — shown inline so the admin
            doesn't have to scroll to a separate "Verificare KYC" card. */}
        {kyc && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {kyc.valid ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-red-600" />
            )}
            <Badge
              variant="secondary"
              className={`h-5 text-[10px] font-mono px-1.5 ${kycConfidenceClass(kyc.confidence)}`}
            >
              OCR {Math.round(kyc.confidence)}%
            </Badge>
            {kyc.faceMatchConfidence !== undefined && (
              <Badge
                variant="secondary"
                className={`h-5 text-[10px] font-mono px-1.5 ${kycConfidenceClass(kyc.faceMatchConfidence)}`}
              >
                {kyc.faceMatch ? 'Match' : 'No match'} {Math.round(kyc.faceMatchConfidence)}%
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        {(doc.s3Key || doc.base64) && (
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handlePreview} disabled={downloading}>
            {downloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
            <span className="ml-1">Vezi</span>
          </Button>
        )}
        {canRerunOcr && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-50"
            onClick={handleRerunOcr}
            disabled={rerunning}
            title="Re-rulează Gemini OCR pe document (după ce prompt-ul s-a îmbunătățit sau dacă confidence inițial e mic)"
          >
            {rerunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            <span className="ml-1">Re-OCR</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------- Processing Section Component ----------

const DOC_TYPE_LABELS: Record<string, string> = {
  'contract_complet': 'Contract complet (prestari + asistenta + nota)',
  'contract_prestari': 'Contract prestari servicii',
  'contract_asistenta': 'Contract asistenta juridica',
  'imputernicire': 'Imputernicire avocatiala',
  'cerere_eliberare_pf': 'Cerere eliberare PF',
  'cerere_eliberare_pj': 'Cerere eliberare PJ',
  'cerere_eliberare': 'Cerere eliberare',
  'document_received': 'Document primit de la institutie',
  'document_final': 'Document final',
  'constatator': 'Certificat Constatator (ONRC)',
  'invoice': 'Factura',
};

const DOC_TEMPLATE_MAP: Record<string, string> = {
  'contract_complet': 'contract-complet',
  'contract_prestari': 'contract-prestari',
  'contract_asistenta': 'contract-asistenta',
  'imputernicire': 'imputernicire',
  'cerere_eliberare_pf': 'cerere-eliberare-pf',
  'cerere_eliberare_pj': 'cerere-eliberare-pj',
};

const PROCESSING_ACTION_BUTTONS: Record<string, {
  label: string;
  action: string;
  icon: React.ElementType;
  color: string;
  description: string;
}> = {
  'paid': {
    label: 'Incepe procesarea',
    action: 'start_processing',
    icon: PlayCircle,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Marcheaza comanda ca fiind in curs de procesare',
  },
  'processing': {
    label: 'Marcheaza documente generate',
    action: 'mark_documents_generated',
    icon: FileCheck,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Toate documentele au fost generate',
  },
  'documents_generated': {
    label: 'Marcheaza depusa la IPJ',
    action: 'mark_submitted',
    icon: Building2,
    color: 'bg-orange-600 hover:bg-orange-700',
    description: 'Cererea a fost depusa la institutia competenta',
  },
  'submitted_to_institution': {
    label: 'Marcheaza document primit',
    action: 'upload_received',
    icon: Upload,
    color: 'bg-green-600 hover:bg-green-700',
    description: 'Documentul a fost primit de la institutie',
  },
  'document_received': {
    label: 'Marcheaza gata de expediere',
    action: 'mark_ready',
    icon: CheckCircle,
    color: 'bg-green-600 hover:bg-green-700',
    description: 'Toate documentele sunt pregatite',
  },
  'extras_in_progress': {
    label: 'Marcheaza gata de expediere',
    action: 'mark_ready',
    icon: CheckCircle,
    color: 'bg-green-600 hover:bg-green-700',
    description: 'Extras-urile sunt finalizate',
  },
};

function ProcessingSection({
  order,
  documents,
  optionStatuses,
  onStatusChange,
}: {
  order: OrderDetail;
  documents: OrderDocument[];
  optionStatuses: OrderOptionStatus[];
  onStatusChange: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  const handleAction = async (action: string, data?: AnyObj) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Status actualizat: ${STATUS_CONFIG[json.data.new_status]?.label || json.data.new_status}`);
        onStatusChange();
      } else {
        toast.error(json.error?.message || 'Eroare');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateDocument = async (template: string) => {
    setGeneratingDoc(template);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/generate-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Eroare la generarea documentului');
      }

      // Document was generated and uploaded to S3 - just refresh the list
      // (no download - user can preview from the document list)
      await res.blob(); // consume response body

      toast.success(`Document generat: ${DOC_TYPE_LABELS[template.replace(/-/g, '_')] || template}`);
      onStatusChange(); // Refresh to show new document in list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare la generare');
    } finally {
      setGeneratingDoc(null);
    }
  };

  const handlePreviewDocument = async (doc: OrderDocument) => {
    // Open the server-side preview endpoint which converts DOCX to HTML
    const previewUrl = `/api/admin/orders/${order.id}/preview-document?key=${encodeURIComponent(doc.s3_key)}`;
    window.open(previewUrl, '_blank');
  };

  const handleDownloadDocument = async (doc: OrderDocument) => {
    setDownloadingDoc(doc.id);
    try {
      const res = await fetch(`/api/upload/download?key=${encodeURIComponent(doc.s3_key)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Eroare');
      const a = document.createElement('a');
      a.href = json.data.url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error('Nu s-a putut descarca documentul');
    } finally {
      setDownloadingDoc(null);
    }
  };

  const status = order.status || 'draft';
  const buttonConfig = PROCESSING_ACTION_BUTTONS[status];
  const isPJ = order.customer_data?.billing?.type === 'persoana_juridica' || !!order.customer_data?.companyData?.companyName;

  // Show for all processable statuses
  const processableStatuses = ['pending', 'paid', 'processing', 'documents_generated', 'submitted_to_institution', 'document_received', 'extras_in_progress', 'document_ready'];
  if (!processableStatuses.includes(status)) {
    return null;
  }

  // Determine which document types to show. Fully-automated services with no
  // lawyer involvement (ONRC constatator, ANCPI carte funciară / plan cadastral /
  // identificare imobil) get NO legal-assistance contract / împuternicire /
  // cerere and NO Barou number — see NO_LAWYER_SERVICE_SLUGS.
  const noLawyerService = isNoLawyerService(order.services?.slug);
  const generableDocTypes = noLawyerService
    ? ['contract_prestari']
    : ['contract_prestari', 'contract_asistenta', 'imputernicire', isPJ ? 'cerere_eliberare_pj' : 'cerere_eliberare_pf'];

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-700" />
          Procesare comanda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contextual Action Button */}
        {buttonConfig && (
          <button
            onClick={() => handleAction(buttonConfig.action)}
            disabled={processing}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white font-medium transition-colors ${buttonConfig.color} disabled:opacity-50`}
          >
            {processing ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <buttonConfig.icon className="h-5 w-5" />
            )}
            <div className="text-left">
              <div>{buttonConfig.label}</div>
              <div className="text-xs opacity-80 font-normal">{buttonConfig.description}</div>
            </div>
          </button>
        )}

        {/* Completed status indicator */}
        {status === 'document_ready' && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium">Gata de expediere</div>
              <div className="text-xs opacity-80 font-normal">Genereaza AWB-ul din sectiunea de mai jos</div>
            </div>
          </div>
        )}

        {/* Generated Documents - with generate + preview buttons */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documente generate
          </h4>
          <div className="space-y-1.5">
            {/* Auto-generated contracts */}
            {generableDocTypes.map(docType => {
              const doc = documents.find(d => d.type === docType);
              const template = DOC_TEMPLATE_MAP[docType];
              const isGenerating = generatingDoc === template;

              return (
                <div key={docType} className="flex items-center justify-between py-2 px-3 rounded-lg border bg-white text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {doc ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className={doc ? 'font-medium' : ''}>{DOC_TYPE_LABELS[docType] || docType}</span>
                      {doc?.document_number && (
                        <span className="text-xs text-muted-foreground ml-2 font-mono">Nr. {doc.document_number}</span>
                      )}
                      {doc?.created_at && (
                        <span className="text-xs text-muted-foreground ml-2">{formatDate(doc.created_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {doc && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => handlePreviewDocument(doc)}
                        >
                          <Eye className="h-3 w-3" />
                          <span className="ml-1">Previzualizare</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => handleDownloadDocument(doc)}
                          disabled={downloadingDoc === doc.id}
                        >
                          {downloadingDoc === doc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                          <span className="ml-1">Descarca</span>
                        </Button>
                      </>
                    )}
                    {template && (
                      <Button
                        size="sm"
                        variant={doc ? 'outline' : 'default'}
                        className="h-7 text-xs"
                        onClick={() => handleGenerateDocument(template)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                        <span className="ml-1">{doc ? 'Regenereaza' : 'Genereaza'}</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Other existing documents (imputernicire, cerere, etc. - already generated or uploaded) */}
            {documents
              .filter(d => !generableDocTypes.includes(d.type) && !['document_received', 'document_final'].includes(d.type))
              .map(doc => (
                <div key={doc.id} className="flex items-center justify-between py-2 px-3 rounded-lg border bg-white text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium">{DOC_TYPE_LABELS[doc.type] || doc.type}</span>
                      {doc.document_number && (
                        <span className="text-xs text-muted-foreground ml-2 font-mono">Nr. {doc.document_number}</span>
                      )}
                      {doc.created_at && (
                        <span className="text-xs text-muted-foreground ml-2">{formatDate(doc.created_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => handlePreviewDocument(doc)}
                    >
                      <Eye className="h-3 w-3" />
                      <span className="ml-1">Previzualizare</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => handleDownloadDocument(doc)}
                      disabled={downloadingDoc === doc.id}
                    >
                      {downloadingDoc === doc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                      <span className="ml-1">Descarca</span>
                    </Button>
                  </div>
                </div>
              ))
            }

            {/* Special documents (received from institution, final) */}
            {['document_received', 'document_final'].map(docType => {
              const doc = documents.find(d => d.type === docType);
              if (!doc) return null;
              return (
                <div key={docType} className="flex items-center justify-between py-2 px-3 rounded-lg border bg-white text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{DOC_TYPE_LABELS[docType] || docType}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => handlePreviewDocument(doc)}
                    >
                      <Eye className="h-3 w-3" />
                      <span className="ml-1">Previzualizare</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => handleDownloadDocument(doc)}
                      disabled={downloadingDoc === doc.id}
                    >
                      {downloadingDoc === doc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                      <span className="ml-1">Descarca</span>
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Documents uploaded by a collaborator (topograf) */}
            {documents.filter(d => d.type === 'collaborator-document').map(doc => (
              <div key={doc.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-primary-200 bg-primary-50 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Handshake className="h-4 w-4 text-primary-600 shrink-0" />
                  <span className="font-medium truncate">Document de la colaborator</span>
                  <span className="text-xs text-neutral-500 truncate">{doc.file_name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handlePreviewDocument(doc)}>
                    <Eye className="h-3 w-3" /><span className="ml-1">Previzualizare</span>
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleDownloadDocument(doc)} disabled={downloadingDoc === doc.id}>
                    {downloadingDoc === doc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}<span className="ml-1">Descarca</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extra Options Checklist */}
        {optionStatuses.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Optiuni extra</h4>
            <div className="space-y-1.5">
              {optionStatuses.map(opt => (
                <div key={opt.option_code} className="flex items-center justify-between py-1.5 px-2 rounded border text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={opt.completed}
                      onChange={() => handleAction('complete_option', { option_code: opt.option_code })}
                      className="rounded"
                    />
                    <span>{opt.option_name}</span>
                    <span className="text-muted-foreground">- {opt.price} lei</span>
                  </label>
                  {opt.completed_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(opt.completed_at).toLocaleDateString('ro-RO')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- AWB Section Component ----------

interface AwbSectionProps {
  order: OrderDetail;
  hasCourier: boolean;
  hasAwb: boolean;
  isLockerDelivery: boolean;
  deliveryMethodParsed: AnyObj | null;
  courierQuote: AnyObj | null;
  detectedCourierProvider: string | null;
  generating: boolean;
  awbError: string | null;
  cancelling: boolean;
  downloading: boolean;
  onGenerateAwb: () => void;
  onPrintLabel: () => void;
  onCancelAwb: () => void;
  onCopyAwb: () => void;
  onMarkDelivered?: () => void;
}

function AwbSection({
  order,
  hasCourier,
  hasAwb,
  isLockerDelivery,
  courierQuote,
  detectedCourierProvider,
  generating,
  awbError,
  cancelling,
  downloading,
  onGenerateAwb,
  onPrintLabel,
  onCancelAwb,
  onCopyAwb,
  onMarkDelivered,
}: AwbSectionProps) {
  // Nested inside the Livrare card — returns just the inner section
  // (separator + title + content) without an outer Card wrapper.
  // Email/PDF orders have no courier → render nothing.
  if (!hasCourier) {
    return null;
  }

  // Automatic AWB generation only works for Fan Courier + Sameday. DHL /
  // Poșta / other international couriers are handled MANUALLY by the team —
  // show a clear note instead of a button that would fail.
  const provider = (order.courier_provider || detectedCourierProvider || '').toLowerCase();
  const AWB_CAPABLE = ['fancourier', 'fan_courier', 'fan', 'sameday'];
  if (!hasAwb && provider && !AWB_CAPABLE.includes(provider)) {
    return (
      <>
        <Separator className="my-2" />
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-semibold">AWB manual ({provider.toUpperCase()})</p>
          <p className="mt-1 text-xs">
            Generarea automată de AWB funcționează doar pentru Fan Courier și Sameday. Pentru acest
            curier, expedierea se face manual — folosește adresa de livrare de mai sus (buton „Copiază adresa”).
          </p>
        </div>
      </>
    );
  }

  if (hasAwb) {
    const canMarkDelivered = order.status === 'shipped';
    return (
      <>
        <Separator className="my-2" />
        <div className="rounded-md border border-green-200 bg-green-50/30 p-3 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            AWB Generat
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">AWB:</span>
              <span className="font-mono text-base font-bold text-green-800">
                {order.delivery_tracking_number}
              </span>
              <Button variant="ghost" size="icon-sm" onClick={onCopyAwb} title="Copiaza AWB">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            {order.delivery_tracking_status && (
              <Badge variant="secondary" className="capitalize">{order.delivery_tracking_status}</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onPrintLabel} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              Printeaza eticheta
            </Button>
            {order.delivery_tracking_url && (
              <Button variant="outline" size="sm" asChild>
                <Link href={order.delivery_tracking_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Tracking
                </Link>
              </Button>
            )}
            {/* Quick "Marchează livrat" — one-click flip from shipped to
                completed (1 click vs going through the dropdown). Hidden
                once the order has moved past shipped. */}
            {canMarkDelivered && onMarkDelivered && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onMarkDelivered}
              >
                <CheckCircle2 className="h-4 w-4" />
                Marchează livrat
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onCancelAwb}
              disabled={cancelling}
            >
              {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Anuleaza AWB
            </Button>
          </div>
          {isLockerDelivery && courierQuote?.lockerName && (
            <p className="text-xs text-muted-foreground">Locker: {courierQuote.lockerName}</p>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Separator className="my-2" />
      <div className="space-y-3">
        {awbError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Eroare la generarea AWB</AlertTitle>
            <AlertDescription>{awbError}</AlertDescription>
          </Alert>
        )}
        <Button onClick={onGenerateAwb} disabled={generating} className="text-white">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
          {awbError ? 'Incearca din nou' : 'Genereaza AWB'}
        </Button>
      </div>
    </>
  );
}

// ---------- Helper Components ----------

/** Inline admin correction of the customer's contact (phone/email) — saved
 *  via PATCH /api/admin/orders/[id]/contact with an audit note. */
function ContactEditInline({
  orderId,
  email,
  phone,
  onSaved,
}: {
  orderId: string;
  email: string;
  phone: string;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [newPhone, setNewPhone] = useState(phone);
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setNewEmail(email);
          setNewPhone(phone);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        <Pencil className="h-3 w-3" />
        Corectează contact
      </button>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/contact`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim(), phone: newPhone.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Eroare la salvare');
        return;
      }
      toast.success('Contact actualizat');
      setOpen(false);
      onSaved();
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
      <p className="text-xs font-semibold text-amber-800">Corectează datele de contact</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Email"
          className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-amber-400"
        />
        <input
          type="tel"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          placeholder="Telefon (+40...)"
          className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-amber-400"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="h-7 text-xs" onClick={save} disabled={saving}>
          {saving ? 'Se salvează…' : 'Salvează'}
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setOpen(false)} disabled={saving}>
          Anulează
        </Button>
      </div>
      <p className="text-[11px] text-amber-700">Modificarea se notează automat în Note Echipă (vechi → nou).</p>
    </div>
  );
}

/** One-click copy of the delivery address as an international shipping label
 *  (name / street / postal+city / region / country / phone) — for manual
 *  shipping with DHL & co. where the team pastes into the courier's form. */
function CopyAddressButton({ label }: { label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(label);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard unavailable — ignore */
        }
      }}
      className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copiat!' : 'Copiază adresa'}
    </button>
  );
}

/** Romanian labels for customer_data.property keys (identificare imobil /
 *  servicii cadastrale), in display order. Unknown keys fall back verbatim. */
const PROPERTY_LABELS: Array<[string, string]> = [
  ['county', 'Județ'],
  ['locality', 'Localitate'],
  ['propertyAddress', 'Adresa imobilului'],
  ['ownerName', 'Proprietar (nume complet)'],
  ['cadastral', 'Nr. cadastral'],
  ['carteFunciara', 'Nr. carte funciară'],
  ['motiv', 'Motivul solicitării'],
];

function PropertyCard({ property }: { property: AnyObj | null }) {
  if (!property || typeof property !== 'object') return null;
  const entries = Object.entries(property).filter(([, v]) => v != null && String(v).trim() !== '');
  if (entries.length === 0) return null;

  const known = new Map(PROPERTY_LABELS);
  const ordered: Array<[string, string]> = [
    ...PROPERTY_LABELS.filter(([k]) => property[k] != null && String(property[k]).trim() !== '').map(
      ([k, label]) => [label, String(property[k])] as [string, string]
    ),
    ...entries.filter(([k]) => !known.has(k)).map(([k, v]) => [k, String(v)] as [string, string]),
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Date imobil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {ordered.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </CardContent>
    </Card>
  );
}

/** Romanian labels for known civil_status keys, in display order. Unknown
 *  keys fall back to the raw key so imported/new fields are never hidden. */
const CIVIL_STATUS_LABELS: Array<[string, string]> = [
  ['marriageDate', 'Data căsătoriei'],
  ['marriagePlace', 'Căsătoria a avut loc în'],
  ['officeLocality', 'Oficiul stării civile (localitate)'],
  ['spouseNameBeforeMarriage', 'Numele soțului/soției înainte de căsătorie'],
  ['previouslyMarried', 'Căsătorit(ă) anterior'],
  ['previousMarriagesCount', 'De câte ori anterior'],
  ['lastMarriageEndedBy', 'Ultima căsătorie încheiată prin'],
  ['renouncedRomanianCitizenship', 'A renunțat la cetățenia română'],
  ['birthName', 'Numele la naștere'],
  ['fatherName', 'Numele tatălui'],
  ['motherName', 'Numele mamei'],
  ['purpose', 'Scopul obținerii'],
  ['countryOfUse', 'Țara în care va fi folosit'],
];

function CivilStatusCard({ civilStatus }: { civilStatus: AnyObj | null }) {
  if (!civilStatus || typeof civilStatus !== 'object') return null;
  const entries = Object.entries(civilStatus).filter(
    ([, v]) => v != null && String(v).trim() !== ''
  );
  if (entries.length === 0) return null;

  const known = new Map(CIVIL_STATUS_LABELS);
  // Known keys first (in label order), then any extras verbatim.
  const ordered: Array<[string, string]> = [
    ...CIVIL_STATUS_LABELS.filter(
      ([k]) => civilStatus[k] != null && String(civilStatus[k]).trim() !== ''
    ).map(([k, label]) => [label, String(civilStatus[k])] as [string, string]),
    ...entries.filter(([k]) => !known.has(k)).map(([k, v]) => [k, String(v)] as [string, string]),
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Date stare civilă
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {ordered.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value, icon, mono = false }: { label: string; value: string; icon?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
        {icon}
        {label}
      </span>
      <span className={`text-right truncate max-w-[60%] ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string | null }) {
  if (!status || status === 'pending') return <Badge variant="outline">In asteptare</Badge>;
  if (status === 'paid' || status === 'succeeded') return <Badge variant="default" className="bg-green-600 text-white">Platita</Badge>;
  if (status === 'failed') return <Badge variant="destructive" className="text-white">Esuata</Badge>;
  if (status === 'processing') return <Badge variant="secondary">Se proceseaza</Badge>;
  if (status === 'awaiting_verification') return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Asteapta verificare</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function CourierIcon({ provider }: { provider: string | null }) {
  if (provider === 'fancourier') return <Truck className="h-4 w-4 text-orange-600" />;
  if (provider === 'sameday') return <Package className="h-4 w-4 text-blue-600" />;
  return <Truck className="h-4 w-4" />;
}

// ---------- Timeline Component ----------

const TIMELINE_EVENT_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  draft_created: { icon: FileText, color: 'text-gray-400', label: 'Ciorna creata' },
  order_created: { icon: FileText, color: 'text-blue-500', label: 'Comanda creata' },
  status_change: { icon: RefreshCw, color: 'text-blue-500', label: 'Schimbare status' },
  status_changed: { icon: RefreshCw, color: 'text-blue-500', label: 'Schimbare status' },
  payment_confirmed: { icon: CreditCard, color: 'text-green-500', label: 'Plata confirmata' },
  payment_created: { icon: CreditCard, color: 'text-yellow-500', label: 'Plata initiata' },
  payment_verified: { icon: CreditCard, color: 'text-green-500', label: 'Plata verificata' },
  payment_rejected: { icon: XCircle, color: 'text-red-500', label: 'Plata respinsa' },
  payment_proof_submitted: { icon: Upload, color: 'text-yellow-500', label: 'Dovada plata trimisa' },
  kyc_submitted: { icon: User, color: 'text-blue-500', label: 'KYC trimis' },
  kyc_approved: { icon: CheckCircle2, color: 'text-green-500', label: 'KYC aprobat' },
  kyc_rejected: { icon: XCircle, color: 'text-red-500', label: 'KYC respins' },
  awb_created: { icon: Truck, color: 'text-purple-500', label: 'AWB generat' },
  awb_cancelled: { icon: XCircle, color: 'text-red-500', label: 'AWB anulat' },
  document_uploaded: { icon: Upload, color: 'text-blue-500', label: 'Document incarcat' },
  document_generated: { icon: FileCheck, color: 'text-blue-500', label: 'Documente generate' },
  submitted_to_institution: { icon: Building2, color: 'text-orange-500', label: 'Depusa la institutie' },
  document_received_from_institution: { icon: FileCheck, color: 'text-teal-500', label: 'Document primit de la institutie' },
  option_completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Optiune finalizata' },
  extras_started: { icon: Clock, color: 'text-amber-500', label: 'Extras-uri incepute' },
  notification_sent: { icon: Mail, color: 'text-blue-400', label: 'Notificare trimisa' },
  order_completed: { icon: CheckCircle2, color: 'text-green-600', label: 'Comanda finalizata' },
  order_submitted: { icon: CheckCircle2, color: 'text-green-500', label: 'Comanda trimisa' },
  document_generation_failed: { icon: AlertTriangle, color: 'text-red-500', label: 'Eroare generare document' },
  order_cancelled: { icon: XCircle, color: 'text-red-500', label: 'Comanda anulata' },
};

function OrderTimeline({ timeline, orderCreatedAt }: { timeline: TimelineEvent[]; orderCreatedAt: string | null }) {
  const events = [...timeline];
  if (events.length === 0 || !events.find((e) => e.event_type === 'order_created' || e.event_type === 'draft_created')) {
    events.unshift({ id: 'initial', event_type: 'order_created', notes: 'Comanda a fost plasata', new_value: null, created_at: orderCreatedAt });
  }
  if (events.length === 0) return <p className="text-sm text-muted-foreground">Niciun eveniment inregistrat.</p>;

  return (
    <div className="relative space-y-0">
      {events.map((event, index) => {
        const config = TIMELINE_EVENT_CONFIG[event.event_type] || { icon: Clock, color: 'text-gray-400', label: event.event_type };
        const Icon = config.icon;
        const isLast = index === events.length - 1;
        return (
          <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />}
            <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border ${config.color}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
                {event.changed_by && (
                  <span className="text-xs text-muted-foreground">· {event.changed_by}</span>
                )}
              </div>
              {/* Status badges with arrow — only when this row carries a
                  real transition (from_status → to_status). */}
              {event.from_status && event.to_status && event.from_status !== event.to_status && (
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <StatusBadgeMini status={event.from_status} />
                  <span className="text-muted-foreground">→</span>
                  <StatusBadgeMini status={event.to_status} />
                </div>
              )}
              {event.notes && <p className="text-sm text-muted-foreground mt-1">{event.notes}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Small colored status pill used in the timeline transitions.
// ---------- Contract Signed Card ----------

function ContractSignedCard({ customerData }: { customerData: AnyObj | null }) {
  const meta = customerData?.signature_metadata as
    | {
        signed_at?: string;
        ip_address?: string;
        user_agent?: string;
        document_hash?: string;
      }
    | undefined;

  // Hide the card entirely when there's no signature yet — keeps the layout
  // tidy for in-progress orders.
  if (!meta?.signed_at) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Contract
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Contract nesemnat încă.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <InfoRow label="Semnat" value="Da" />
        <InfoRow label="Data semnare" value={formatDate(meta.signed_at)} />
        {meta.ip_address && <InfoRow label="IP semnare" value={meta.ip_address} mono />}
        {meta.user_agent && (
          <div className="py-1.5 border-b">
            <span className="text-sm text-muted-foreground">Browser</span>
            <p className="text-xs text-foreground mt-1 break-all leading-relaxed">
              {meta.user_agent}
            </p>
          </div>
        )}
        {meta.document_hash && (
          <div className="py-1.5">
            <span className="text-sm text-muted-foreground">SHA-256 PDF</span>
            <p className="text-[10px] font-mono text-foreground mt-1 break-all">
              {meta.document_hash}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadgeMini({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, variant: 'outline' as const };
  return (
    <Badge variant={cfg.variant} className={`text-xs px-2 py-0.5 ${cfg.className || ''}`}>
      {cfg.label}
    </Badge>
  );
}
