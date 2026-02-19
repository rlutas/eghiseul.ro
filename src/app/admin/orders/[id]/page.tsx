'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Package,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Loader2,
  Copy,
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
  paid_at: string | null;
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
  } | null;
}

interface TimelineEvent {
  id: string;
  event_type: string;
  notes: string | null;
  new_value: AnyObj | null;
  created_at: string | null;
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
  paid: { label: 'Platita', variant: 'default', className: 'bg-green-600' },
  processing: { label: 'In procesare', variant: 'default', className: 'bg-blue-600' },
  documents_generated: { label: 'Documente generate', variant: 'default', className: 'bg-blue-500' },
  submitted_to_institution: { label: 'Depusa la institutie', variant: 'default', className: 'bg-orange-600' },
  document_received: { label: 'Document primit', variant: 'default', className: 'bg-teal-600' },
  extras_in_progress: { label: 'Traducere / Apostila', variant: 'default', className: 'bg-amber-600' },
  kyc_pending: { label: 'KYC Pending', variant: 'outline' },
  kyc_approved: { label: 'KYC Aprobat', variant: 'default', className: 'bg-green-600' },
  kyc_rejected: { label: 'KYC Respins', variant: 'destructive' },
  document_ready: { label: 'Gata de expediere', variant: 'default', className: 'bg-indigo-600' },
  shipped: { label: 'Expediata', variant: 'default', className: 'bg-purple-600' },
  in_progress: { label: 'In lucru', variant: 'default', className: 'bg-blue-600' },
  completed: { label: 'Finalizata', variant: 'default', className: 'bg-green-700' },
  cancelled: { label: 'Anulata', variant: 'destructive' },
  refunded: { label: 'Rambursata', variant: 'destructive' },
};

// ---------- Helpers ----------

function extractCustomerData(cd: AnyObj | null) {
  if (!cd) return { contact: null, personal: null, company: null, billing: null, clientType: 'pf' as string };
  const contact = cd.contact || null;
  const personal = cd.personalData || cd.personal || null;
  const company = cd.companyData || cd.company || null;
  const billing = cd.billing || null;
  let clientType = cd.clientType || 'pf';
  if (clientType === 'pf' && (billing?.type === 'persoana_juridica' || company?.companyName)) {
    clientType = 'pj';
  }
  return { contact, personal, company, billing, clientType };
}

function getCustomerDisplayName(contact: AnyObj | null, personal: AnyObj | null, company: AnyObj | null, billing: AnyObj | null, isPJ: boolean): string {
  if (isPJ) return company?.companyName || billing?.companyName || 'N/A';
  if (contact?.name) return contact.name;
  const firstName = contact?.firstName || personal?.firstName || '';
  const lastName = contact?.lastName || personal?.lastName || '';
  if (firstName || lastName) return `${firstName} ${lastName}`.trim();
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
  });
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
  });
}

/** Extract all client-uploaded documents from customer_data */
function extractClientDocuments(cd: AnyObj | null): Array<{ type: string; label: string; s3Key?: string; base64?: string; fileName?: string }> {
  if (!cd) return [];
  const docs: Array<{ type: string; label: string; s3Key?: string; base64?: string; fileName?: string }> = [];

  const DOC_LABELS: Record<string, string> = {
    ci_front: 'CI - Fata',
    ci_back: 'CI - Verso',
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
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [orderDocuments, setOrderDocuments] = useState<OrderDocument[]>([]);
  const [optionStatuses, setOptionStatuses] = useState<OrderOptionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AWB state
  const [generating, setGenerating] = useState(false);
  const [awbError, setAwbError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
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
      setTimeline((json.data.timeline || []) as TimelineEvent[]);
      setOrderDocuments((json.data.documents || []) as OrderDocument[]);
      setOptionStatuses((json.data.option_statuses || []) as OrderOptionStatus[]);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('A aparut o eroare la incarcarea comenzii.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId, fetchOrder]);

  // ---------- AWB Handlers ----------

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
  const { contact, personal, company, billing, clientType } = extractCustomerData(order.customer_data);
  const isPJ = clientType === 'pj';
  const status = order.status || 'draft';
  const statusConfig = STATUS_CONFIG[status] || { label: status, variant: 'outline' as const };
  const customerName = getCustomerDisplayName(contact, personal, company, billing, isPJ);

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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="h-4 w-4" />
            Inapoi
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold font-mono">{displayOrderNumber}</h1>
              <Badge variant={statusConfig.variant} className={`text-sm px-3 py-1 ${statusConfig.className || ''}`}>
                {statusConfig.label}
              </Badge>
              {isPJ && (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <Building2 className="h-3.5 w-3.5 mr-1" />
                  Persoana Juridica
                </Badge>
              )}
              {!isPJ && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  <User className="h-3.5 w-3.5 mr-1" />
                  Persoana Fizica
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>Creata: {formatDateLong(order.created_at)}</span>
              {order.submitted_at && <span>Trimisa: {formatDate(order.submitted_at)}</span>}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrder}>
          <RefreshCw className="h-4 w-4" />
          Reincarca
        </Button>
      </div>

      {/* ROW 1: Contact + Serviciu */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Date contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nume" value={customerName} icon={isPJ ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />} />
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
          </CardContent>
        </Card>

        {/* Service & Options */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Serviciu si optiuni
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Serviciu" value={order.services?.name || 'N/A'} />
            {order.services?.estimated_days && (
              <InfoRow label="Termen estimat" value={`${order.services.estimated_days} zile lucratoare`} />
            )}
            {order.selected_options && order.selected_options.length > 0 && (
              <>
                <Separator className="my-2" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Optiuni selectate</p>
                {order.selected_options.map((opt, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-sm">
                    <div>
                      <span className="font-medium">{opt.option_name}</span>
                      {(opt.quantity || 1) > 1 && <span className="text-muted-foreground"> x{opt.quantity}</span>}
                    </div>
                    {opt.price_modifier ? (
                      <span className="font-medium shrink-0">+{opt.price_modifier.toFixed(2)} RON</span>
                    ) : null}
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PROCESSING SECTION - RIGHT AFTER CONTACT & SERVICE */}
      <ProcessingSection
        order={order}
        documents={orderDocuments}
        optionStatuses={optionStatuses}
        onStatusChange={fetchOrder}
      />

      {/* ROW 2: Personal/Company Data + Billing */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Client Details (PF or PJ) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {isPJ ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
              {isPJ ? 'Date firma' : 'Date personale'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isPJ && company ? (
              <>
                <InfoRow label="Denumire firma" value={company.companyName || 'N/A'} />
                {company.cui && <InfoRow label="CUI" value={company.cui} mono />}
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
                      <span className="text-muted-foreground text-xs">Locul nasterii</span>
                      <p className="font-medium">{personal.birthPlace}</p>
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
                      {personal.address.street && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground text-xs">Str</span>
                          <p className="font-medium">{personal.address.street}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground text-xs">Nr</span>
                        <p className="font-medium">{personal.address.number || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Bl</span>
                        <p className="font-medium">{personal.address.building || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Sc</span>
                        <p className="font-medium">{personal.address.staircase || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Et</span>
                        <p className="font-medium">{personal.address.floor || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Ap</span>
                        <p className="font-medium">{personal.address.apartment || '-'}</p>
                      </div>
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
                      <div>
                        <span className="text-muted-foreground text-xs">Cod postal</span>
                        <p className="font-medium">{personal.address.postalCode || personal.address.postal_code || '-'}</p>
                      </div>
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
          </CardContent>
        </Card>

        {/* Billing / Facturare */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Date facturare
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {billing ? (
              <>
                <InfoRow label="Tip" value={billing.type === 'persoana_juridica' ? 'Persoana Juridica' : 'Persoana Fizica'} />
                {billing.type === 'persoana_juridica' ? (
                  <>
                    {billing.companyName && <InfoRow label="Firma" value={billing.companyName} />}
                    {billing.cui && <InfoRow label="CUI" value={billing.cui} mono />}
                    {(billing.regCom || billing.registrationNumber) && (
                      <InfoRow label="Nr. Reg. Com." value={billing.regCom || billing.registrationNumber} mono />
                    )}
                    {billing.companyAddress && (
                      <>
                        <Separator className="my-2" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adresa facturare</p>
                        <p className="text-sm">{typeof billing.companyAddress === 'string' ? billing.companyAddress : formatAddress(billing.companyAddress)}</p>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* PF billing - show personal data as billing info */}
                    <Separator className="my-2" />
                    {personal ? (
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
                        {personal.address && typeof personal.address === 'object' && (
                          <div className="col-span-2 mt-1">
                            <span className="text-muted-foreground text-xs">Adresa</span>
                            <p className="font-medium">{formatAddress(personal.address) || '-'}</p>
                          </div>
                        )}
                        {personal.address && typeof personal.address === 'string' && (
                          <div className="col-span-2 mt-1">
                            <span className="text-muted-foreground text-xs">Adresa</span>
                            <p className="font-medium">{personal.address}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Date personale indisponibile.</p>
                    )}
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nicio informatie de facturare.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: Client Uploaded Documents + Signature */}
      {(allClientDocs.length > 0 || signature?.signatureBase64) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Documente incarcate de client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allClientDocs.map((doc, i) => (
                <ClientDocumentCard key={`${doc.type}-${i}`} doc={doc} />
              ))}
            </div>
            {allClientDocs.length === 0 && (
              <p className="text-sm text-muted-foreground">Niciun document incarcat de client.</p>
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
      )}

      {/* KYC Verification Results */}
      <KYCVerificationCard customerData={order.customer_data} />

      {/* ROW 4: Payment + Delivery Address */}
      <div className="grid gap-4 lg:grid-cols-2">
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
                ) : order.stripe_payment_intent_id ? (
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
            {order.stripe_payment_intent_id && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground shrink-0">Stripe PI</span>
                <a
                  href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-xs text-indigo-600 hover:text-indigo-800 hover:underline truncate max-w-[60%]"
                  title="Deschide in Stripe Dashboard"
                >
                  {order.stripe_payment_intent_id}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            )}
            {order.paid_at && (
              <InfoRow label="Platita la" value={formatDate(order.paid_at)} />
            )}
          </CardContent>
        </Card>

        {/* Delivery Address */}
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
            {deliveryMethodParsed?.price !== undefined && (
              <InfoRow label="Cost livrare" value={`${Number(deliveryMethodParsed.price).toFixed(2)} RON`} />
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
                </div>
              </>
            )}
            {!order.delivery_address && !isLockerDelivery && !deliveryMethodParsed && (
              <p className="text-sm text-muted-foreground">Nicio informatie de livrare.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AWB Section */}
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
      />

      {/* Order Timeline */}
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
    </div>
  );
}

// ---------- Client Document Card ----------

function ClientDocumentCard({ doc }: { doc: { type: string; label: string; s3Key?: string; base64?: string; fileName?: string } }) {
  const [downloading, setDownloading] = useState(false);

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
          {doc.s3Key ? 'Stocat in S3' : doc.base64 ? 'Disponibil local' : 'Neincarcat'}
        </p>
      </div>
      {(doc.s3Key || doc.base64) && (
        <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0" onClick={handlePreview} disabled={downloading}>
          {downloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
          <span className="ml-1">Vezi</span>
        </Button>
      )}
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

  // Determine which document types to show
  // Contracts are auto-generated; imputernicire + cerere are on-demand
  const generableDocTypes = [
    'contract_prestari',
    'contract_asistenta',
    'imputernicire',
    isPJ ? 'cerere_eliberare_pj' : 'cerere_eliberare_pf',
  ];

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
}

function AwbSection({
  order,
  hasCourier,
  hasAwb,
  isLockerDelivery,
  deliveryMethodParsed,
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
}: AwbSectionProps) {
  if (!hasCourier) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Livrare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {deliveryMethodParsed?.type === 'email'
              ? 'Livrare prin email - nu necesita AWB'
              : 'Niciun curier configurat pentru aceasta comanda.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const providerName =
    detectedCourierProvider === 'fancourier' ? 'Fan Courier' :
    detectedCourierProvider === 'sameday' ? 'Sameday' :
    detectedCourierProvider || '';

  const serviceName = courierQuote?.serviceName || order.courier_service || '';

  if (hasAwb) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            AWB Generat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">AWB:</span>
              <span className="font-mono text-lg font-bold text-green-800">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CourierIcon provider={detectedCourierProvider} />
            <span>{providerName}{serviceName ? ` - ${serviceName}` : ''}</span>
            {isLockerDelivery && courierQuote?.lockerName && (
              <Badge variant="outline" className="ml-1">Locker: {courierQuote.lockerName}</Badge>
            )}
          </div>
          <Separator />
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
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onCancelAwb} disabled={cancelling}>
              {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Anuleaza AWB
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Genereaza AWB
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <CourierIcon provider={detectedCourierProvider} />
          <span className="font-medium">{providerName}</span>
          {serviceName && <span className="text-muted-foreground">- {serviceName}</span>}
        </div>
        {awbError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Eroare la generarea AWB</AlertTitle>
            <AlertDescription>{awbError}</AlertDescription>
          </Alert>
        )}
        <Button onClick={onGenerateAwb} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
          {awbError ? 'Incearca din nou' : 'Genereaza AWB'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------- KYC Verification Card ----------

function KYCVerificationCard({ customerData }: { customerData: AnyObj | null }) {
  if (!customerData) return null;

  const personal = customerData.personalData || customerData.personal;
  if (!personal) return null;

  const kycValidation = personal.kycValidation as {
    ciFront?: { valid: boolean; confidence: number };
    ciBack?: { valid: boolean; confidence: number };
    selfie?: { valid: boolean; confidence: number; faceMatch: boolean; faceMatchConfidence: number };
  } | undefined;

  // Also check ocrResults as a fallback for confidence data
  const ocrResults = personal.ocrResults as Array<{
    documentType: string;
    success: boolean;
    confidence: number;
  }> | undefined;

  // Build validation data from kycValidation or fallback to ocrResults
  const ciFront = kycValidation?.ciFront || (() => {
    const ocr = ocrResults?.find(r => r.documentType === 'ci_front' || r.documentType === 'ci_vechi' || r.documentType === 'ci_nou_front');
    return ocr ? { valid: ocr.success, confidence: ocr.confidence } : undefined;
  })();

  const ciBack = kycValidation?.ciBack || (() => {
    const ocr = ocrResults?.find(r => r.documentType === 'ci_back' || r.documentType === 'ci_nou_back');
    return ocr ? { valid: ocr.success, confidence: ocr.confidence } : undefined;
  })();

  const selfie = kycValidation?.selfie;

  // Nothing to display if no validation data exists
  if (!ciFront && !ciBack && !selfie) return null;

  // Determine if manual review is needed
  const LOW_CONFIDENCE_THRESHOLD = 70;
  const needsReview =
    (ciFront && ciFront.confidence < LOW_CONFIDENCE_THRESHOLD) ||
    (ciBack && ciBack.confidence < LOW_CONFIDENCE_THRESHOLD) ||
    (selfie && selfie.confidence < LOW_CONFIDENCE_THRESHOLD) ||
    (selfie && selfie.faceMatchConfidence < LOW_CONFIDENCE_THRESHOLD);

  function getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return 'text-green-700';
    if (confidence >= 60) return 'text-yellow-700';
    return 'text-red-700';
  }

  function getConfidenceBg(confidence: number): string {
    if (confidence >= 80) return 'bg-green-100';
    if (confidence >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  function renderValidationRow(label: string, data: { valid: boolean; confidence: number } | undefined) {
    if (!data) return null;
    const icon = data.valid ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
    return (
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-2 text-sm">
          {icon}
          <span>{label}</span>
        </div>
        <Badge
          variant="secondary"
          className={`text-xs font-mono ${getConfidenceBg(data.confidence)} ${getConfidenceColor(data.confidence)}`}
        >
          {Math.round(data.confidence)}%
        </Badge>
      </div>
    );
  }

  return (
    <Card className={needsReview ? 'border-yellow-300 bg-yellow-50/30' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Verificare KYC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {needsReview && (
          <Alert className="bg-yellow-50 border-yellow-300 mb-3">
            <AlertTriangle className="h-4 w-4 text-yellow-700" />
            <AlertDescription className="text-yellow-800 text-sm font-medium">
              Verificare KYC necesita revizuire manuala
              {selfie && selfie.faceMatchConfidence < LOW_CONFIDENCE_THRESHOLD && (
                <span> - Potrivire fata: {Math.round(selfie.faceMatchConfidence)}%</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {renderValidationRow('CI Fata', ciFront)}
        {renderValidationRow('CI Verso', ciBack)}
        {selfie && (
          <>
            {renderValidationRow('Selfie', { valid: selfie.valid, confidence: selfie.confidence })}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 text-sm">
                {selfie.faceMatch ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Potrivire fata</span>
              </div>
              <Badge
                variant="secondary"
                className={`text-xs font-mono ${getConfidenceBg(selfie.faceMatchConfidence)} ${getConfidenceColor(selfie.faceMatchConfidence)}`}
              >
                {Math.round(selfie.faceMatchConfidence)}%
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Helper Components ----------

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
  if (status === 'paid' || status === 'succeeded') return <Badge variant="default" className="bg-green-600">Platita</Badge>;
  if (status === 'failed') return <Badge variant="destructive">Esuata</Badge>;
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
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
              </div>
              {event.notes && <p className="text-sm text-muted-foreground mt-0.5">{event.notes}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
