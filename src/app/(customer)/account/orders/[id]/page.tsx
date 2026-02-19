'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Calendar,
  CreditCard,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  User,
  Building2,
  Receipt,
  Truck,
  ChevronRight,
  RefreshCw,
  Phone,
  Mail,
  Hash,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import TrackingTimeline from '@/components/orders/tracking-timeline';

interface OrderDocument {
  id: string;
  type: string;
  label: string;
  fileName: string;
  fileSize: number | null;
  documentNumber: string | null;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  status: string;
  event: string;
  note: string | null;
  createdAt: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  userId: string | null;
  service: {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    basePrice: number;
  } | null;
  status: string;
  totalAmount: number;
  currency: string;
  breakdown: {
    basePrice: number;
    optionsTotal: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  selectedOptions: Array<{
    name?: string;
    option_name?: string;
    optionName?: string;
    option_id?: string;
    optionId?: string;
    description?: string;
    option_description?: string;
    optionDescription?: string;
    price?: number;
    option_price?: number;
    price_modifier?: number;
    priceModifier?: number;
    quantity?: number;
  }>;
  customerData: {
    contact?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };
    personal?: {
      firstName?: string;
      lastName?: string;
      cnp?: string;
    };
    company?: {
      companyName?: string;
      cui?: string;
      regCom?: string;
    };
    address?: {
      street?: string;
      city?: string;
      county?: string;
      postalCode?: string;
      country?: string;
    };
    billing?: {
      type?: 'individual' | 'company' | 'persoana_fizica' | 'persoana_juridica';
      source?: 'self' | 'other_pf' | 'company';
      firstName?: string;
      lastName?: string;
      cnp?: string;
      address?: string;
      companyName?: string;
      cui?: string;
      regCom?: string;
      companyAddress?: string;
    };
  } | null;
  deliveryMethod: {
    type?: string;
    name?: string;
    price?: number;
    estimated_days?: number;
  } | null;
  deliveryAddress: {
    street?: string;
    city?: string;
    county?: string;
    postalCode?: string;
    country?: string;
  } | null;
  paymentStatus: string;
  paymentIntentId: string | null;
  deliveryTrackingNumber: string | null;
  contractUrl: string | null;
  finalDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  estimatedCompletion: string;
  internalNotes: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  draft: { label: 'Ciornă', color: 'text-neutral-600', bgColor: 'bg-neutral-100', icon: FileText },
  pending: { label: 'În așteptare', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  pending_payment: { label: 'Așteaptă plata', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Clock },
  processing: { label: 'În procesare', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: RefreshCw },
  document_ready: { label: 'Document gata', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  delivered: { label: 'Livrat', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  completed: { label: 'Finalizată', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  rejected: { label: 'Respins', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
  cancelled: { label: 'Anulată', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  unpaid: { label: 'Neplătit', color: 'text-red-600', bgColor: 'bg-red-100' },
  pending: { label: 'În așteptare', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  awaiting_verification: { label: 'Verificare plată', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  paid: { label: 'Plătit', color: 'text-green-600', bgColor: 'bg-green-100' },
  refunded: { label: 'Rambursat', color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
  failed: { label: 'Eșuat', color: 'text-red-600', bgColor: 'bg-red-100' },
};

// Timeline status config - complete workflow
const TIMELINE_STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  // Order lifecycle
  order_created: { label: 'Comandă plasată', color: 'bg-blue-100 text-blue-800', icon: FileText },
  draft: { label: 'Ciornă', color: 'bg-neutral-100 text-neutral-800', icon: FileText },
  pending: { label: 'În așteptarea plății', color: 'bg-yellow-100 text-yellow-800', icon: CreditCard },
  pending_payment: { label: 'În așteptarea plății', color: 'bg-yellow-100 text-yellow-800', icon: CreditCard },
  // Payment statuses
  payment_confirmed: { label: 'Plată confirmată', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  payment_received: { label: 'Plată primită', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  // Processing workflow
  processing: { label: 'În procesare', color: 'bg-blue-100 text-blue-800', icon: Package },
  pending_documents: { label: 'Așteptăm documente', color: 'bg-orange-100 text-orange-800', icon: FileText },
  documents_prepared: { label: 'Documente pregătite', color: 'bg-indigo-100 text-indigo-800', icon: FileText },
  submitted_to_authority: { label: 'Depus la autorități', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  at_authority: { label: 'La autorități', color: 'bg-purple-100 text-purple-800', icon: Clock },
  released: { label: 'Eliberat de autorități', color: 'bg-teal-100 text-teal-800', icon: CheckCircle },
  at_translation: { label: 'La traducere', color: 'bg-cyan-100 text-cyan-800', icon: FileText },
  translation_complete: { label: 'Traducere finalizată', color: 'bg-cyan-100 text-cyan-800', icon: CheckCircle },
  ready_for_delivery: { label: 'Pregătit pentru livrare', color: 'bg-emerald-100 text-emerald-800', icon: Package },
  shipped: { label: 'Expediat', color: 'bg-blue-100 text-blue-800', icon: Truck },
  delivered: { label: 'Livrat', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  // Final statuses
  completed: { label: 'Finalizat', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Anulat', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: 'Rambursat', color: 'bg-neutral-100 text-neutral-800', icon: CreditCard },
  rejected: { label: 'Respins', color: 'bg-red-100 text-red-800', icon: XCircle },
  // Legacy/fallback
  status_changed: { label: 'Status actualizat', color: 'bg-neutral-100 text-neutral-800', icon: Clock },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [orderDocuments, setOrderDocuments] = useState<OrderDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Comanda nu a fost găsită');
        }

        setOrder(data.data.order);
        if (data.data.timeline) {
          setTimeline(data.data.timeline);
        }
        if (data.data.documents) {
          setOrderDocuments(data.data.documents);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea comenzii');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number | undefined) => {
    return (price || 0).toFixed(2);
  };

  const getTimelineConfig = (status: string) => {
    return TIMELINE_STATUS_CONFIG[status] || { label: status, color: 'bg-neutral-100 text-neutral-800', icon: Clock };
  };

  const handleDocumentDownload = async (doc: OrderDocument) => {
    setDownloadingDoc(doc.id);
    try {
      const response = await fetch(`/api/orders/${orderId}/documents/${doc.id}/download`);
      const data = await response.json();
      if (data.success && data.data?.url) {
        window.open(data.data.url, '_blank');
      }
    } catch (err) {
      console.error('Document download error:', err);
    } finally {
      setDownloadingDoc(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/account')}
          className="text-neutral-600 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la cont
        </Button>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Comanda nu a fost găsită'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.unpaid;

  const customerName = order.customerData?.company?.companyName
    || `${order.customerData?.personal?.firstName || order.customerData?.contact?.firstName || ''} ${order.customerData?.personal?.lastName || order.customerData?.contact?.lastName || ''}`.trim()
    || 'Nedefinit';

  const isCompany = !!order.customerData?.company?.cui || order.customerData?.billing?.type === 'company';

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 text-white">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/account')}
                className="text-white/70 hover:text-white hover:bg-white/10 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {order.orderNumber}
                </h1>
                <p className="text-white/70 text-sm">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium self-start sm:self-auto',
              statusConfig.bgColor,
              statusConfig.color
            )}>
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">

      {/* Payment Alert - if unpaid */}
      {order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">Plată necesară</p>
              <p className="text-sm text-amber-600">Comanda necesită plata pentru a fi procesată</p>
            </div>
          </div>
          <Link href={`/comanda/checkout/${order.id}`}>
            <Button className="bg-primary-500 hover:bg-primary-600 text-secondary-900">
              Plătește acum
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <h4 className="font-semibold text-secondary-900">Serviciu comandat</h4>
            </div>
            <div className="divide-y divide-neutral-100">
              {/* Service Details */}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h5 className="text-lg font-semibold text-secondary-900">
                          {order.service?.name || 'Serviciu'}
                        </h5>
                        {order.service?.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700 mt-1">
                            {order.service.category}
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-primary-600 flex-shrink-0">
                        {formatPrice(order.breakdown.basePrice)} RON
                      </p>
                    </div>
                    {order.service?.description && (
                      <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                        {order.service.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Options */}
              {order.selectedOptions && order.selectedOptions.length > 0 && order.selectedOptions.map((option, index) => {
                const optionPrice = option.price_modifier ?? option.priceModifier ?? option.price ?? option.option_price ?? 0;
                const optionName = option.name || option.option_name || option.optionName || 'Opțiune';
                const optionDesc = option.description || option.option_description || option.optionDescription;
                return (
                  <div key={index} className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-500">Opțiune</p>
                      <p className="font-medium text-secondary-900">
                        {optionName}
                        {option.quantity && option.quantity > 1 && ` x${option.quantity}`}
                      </p>
                      {optionDesc && (
                        <p className="text-sm text-neutral-500 mt-0.5">{optionDesc}</p>
                      )}
                    </div>
                    <p className="font-medium text-secondary-900 flex-shrink-0">
                      +{formatPrice(optionPrice * (option.quantity || 1))} RON
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Data */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <h4 className="font-semibold text-secondary-900">Date client</h4>
            </div>
            <div className="divide-y divide-neutral-100">
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  {isCompany ? (
                    <Building2 className="w-5 h-5 text-neutral-500" />
                  ) : (
                    <User className="w-5 h-5 text-neutral-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-500">
                    {isCompany ? 'Companie' : 'Nume'}
                  </p>
                  <p className="font-medium text-secondary-900">{customerName}</p>
                </div>
              </div>

              {order.customerData?.contact?.email && (
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500">Email</p>
                    <p className="font-medium text-secondary-900">
                      {order.customerData.contact.email}
                    </p>
                  </div>
                </div>
              )}

              {order.customerData?.contact?.phone && (
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500">Telefon</p>
                    <p className="font-medium text-secondary-900">
                      {order.customerData.contact.phone}
                    </p>
                  </div>
                </div>
              )}

              {isCompany && order.customerData?.company?.cui && (
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500">CUI</p>
                    <p className="font-medium text-secondary-900 font-mono">
                      {order.customerData.company.cui}
                    </p>
                  </div>
                </div>
              )}

              {!isCompany && order.customerData?.personal?.cnp && (
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500">CNP</p>
                    <p className="font-medium text-secondary-900 font-mono">
                      {order.customerData.personal.cnp.slice(0, 4)}****{order.customerData.personal.cnp.slice(-3)}
                    </p>
                  </div>
                </div>
              )}

              {order.customerData?.address && (
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500">Adresă</p>
                    <p className="font-medium text-secondary-900">
                      {[
                        order.customerData.address.street,
                        order.customerData.address.city,
                        order.customerData.address.county,
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery */}
          {order.deliveryMethod && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <h4 className="font-semibold text-secondary-900">Livrare</h4>
              </div>
              <div className="divide-y divide-neutral-100">
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500">Metodă livrare</p>
                    <p className="font-medium text-secondary-900">
                      {order.deliveryMethod.name || order.deliveryMethod.type || 'Standard'}
                    </p>
                    {order.deliveryMethod.estimated_days != null && order.deliveryMethod.estimated_days > 0 && (
                      <p className="text-xs text-neutral-400">
                        Estimat: {order.deliveryMethod.estimated_days} zile lucrătoare
                      </p>
                    )}
                  </div>
                  {(order.deliveryMethod.price ?? 0) > 0 && (
                    <p className="font-medium text-secondary-900">
                      +{formatPrice(order.deliveryMethod.price)} RON
                    </p>
                  )}
                </div>

                {order.deliveryAddress && (
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-500">Adresa de livrare</p>
                      <p className="font-medium text-secondary-900">
                        {[
                          order.deliveryAddress.street,
                          order.deliveryAddress.city,
                          order.deliveryAddress.county,
                          order.deliveryAddress.postalCode,
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Courier Tracking */}
          {order.deliveryTrackingNumber && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <h4 className="font-semibold text-secondary-900">Urmarire Colet</h4>
              </div>
              <div className="p-5">
                <TrackingTimeline orderId={order.id} autoRefresh={true} />
              </div>
            </div>
          )}

          {/* Billing Data */}
          {order.customerData?.billing && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <h4 className="font-semibold text-secondary-900">Date facturare</h4>
              </div>
              <div className="divide-y divide-neutral-100">
                {/* Billing Type - PF or PJ */}
                {(order.customerData.billing.type === 'persoana_juridica' || order.customerData.billing.source === 'company') ? (
                  // Company billing
                  <>
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-500">Tip</p>
                        <p className="font-medium text-secondary-900">Persoană Juridică</p>
                      </div>
                    </div>
                    {order.customerData.billing.companyName && (
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-neutral-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-neutral-500">Denumire firmă</p>
                          <p className="font-medium text-secondary-900">
                            {order.customerData.billing.companyName}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.customerData.billing.cui && (
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Hash className="w-5 h-5 text-neutral-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-neutral-500">CUI</p>
                          <p className="font-medium text-secondary-900 font-mono">
                            {order.customerData.billing.cui}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.customerData.billing.regCom && (
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-neutral-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-neutral-500">Registrul Comerțului</p>
                          <p className="font-medium text-secondary-900 font-mono">
                            {order.customerData.billing.regCom}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.customerData.billing.companyAddress && (
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-neutral-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-neutral-500">Sediu social</p>
                          <p className="font-medium text-secondary-900">
                            {order.customerData.billing.companyAddress}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Individual billing (PF)
                  <>
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-500">Tip</p>
                        <p className="font-medium text-secondary-900">Persoană Fizică</p>
                      </div>
                    </div>
                    {(order.customerData.billing.firstName || order.customerData.billing.lastName) && (
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-neutral-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-neutral-500">Nume</p>
                          <p className="font-medium text-secondary-900">
                            {order.customerData.billing.firstName} {order.customerData.billing.lastName}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.customerData.billing.cnp && (
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Hash className="w-5 h-5 text-neutral-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-neutral-500">CNP</p>
                          <p className="font-medium text-secondary-900 font-mono">
                            {order.customerData.billing.cnp.slice(0, 4)}****{order.customerData.billing.cnp.slice(-3)}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.customerData.billing.address && (
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-neutral-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-neutral-500">Adresă facturare</p>
                          <p className="font-medium text-secondary-900">
                            {order.customerData.billing.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <h4 className="font-semibold text-secondary-900">Sumar comandă</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Serviciu</span>
                <span className="text-secondary-900">{formatPrice(order.breakdown.basePrice)} RON</span>
              </div>
              {order.breakdown.optionsTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Opțiuni</span>
                  <span className="text-secondary-900">+{formatPrice(order.breakdown.optionsTotal)} RON</span>
                </div>
              )}
              {order.deliveryMethod?.price && order.deliveryMethod.price > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Livrare</span>
                  <span className="text-secondary-900">+{formatPrice(order.deliveryMethod.price)} RON</span>
                </div>
              )}
              <div className="pt-3 border-t border-neutral-100 flex justify-between">
                <span className="font-semibold text-secondary-900">Total</span>
                <span className="font-bold text-lg text-primary-600">{formatPrice(order.totalAmount)} RON</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <h4 className="font-semibold text-secondary-900">Plată</h4>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', paymentConfig.bgColor)}>
                  <CreditCard className={cn('w-5 h-5', paymentConfig.color)} />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">{paymentConfig.label}</p>
                  <p className="text-sm text-neutral-500">
                    {order.paymentStatus === 'paid' ? 'Plătit cu cardul' : 'Status plată'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Completion */}
          {order.estimatedCompletion && order.status !== 'completed' && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-2xl border border-primary-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-200/50 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-700" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-700 font-medium">Estimare finalizare</p>
                    <p className="text-lg font-bold text-primary-900">{formatDate(order.estimatedCompletion)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <h4 className="font-semibold text-secondary-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Istoricul comenzii
              </h4>
            </div>
            <div className="p-4">
              {timeline.length > 0 ? (
                <div className="space-y-4">
                  {timeline.map((event, index) => {
                    const config = getTimelineConfig(event.status);
                    const Icon = config.icon;
                    return (
                      <div key={event.id || index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn('p-1.5 rounded-full', config.color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {index < timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-neutral-200 flex-1 mt-1" />
                          )}
                        </div>
                        <div className="pb-4 flex-1 min-w-0">
                          <p className="font-medium text-secondary-900">{config.label}</p>
                          {event.note && (
                            <p className="text-sm text-neutral-500 mt-0.5">{event.note}</p>
                          )}
                          <p className="text-xs text-neutral-400 mt-1">
                            {formatDateTime(event.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-neutral-500 text-sm">
                  Istoricul comenzii va apărea aici
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {orderDocuments.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <h4 className="font-semibold text-secondary-900">Documente</h4>
              </div>
              <div className="p-4 space-y-2">
                {orderDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDocumentDownload(doc)}
                    disabled={downloadingDoc === doc.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <FileText className="w-5 h-5 text-neutral-500 group-hover:text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900">{doc.label}</p>
                      <p className="text-xs text-neutral-500">
                        {doc.documentNumber && `Nr. ${doc.documentNumber} · `}
                        {formatDate(doc.createdAt)}
                      </p>
                    </div>
                    {downloadingDoc === doc.id ? (
                      <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Legacy document URLs (fallback) */}
          {orderDocuments.length === 0 && (order.contractUrl || order.finalDocumentUrl) && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <h4 className="font-semibold text-secondary-900">Documente</h4>
              </div>
              <div className="p-4 space-y-2">
                {order.contractUrl && (
                  <a
                    href={order.contractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <FileText className="w-5 h-5 text-neutral-500 group-hover:text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">Contract</p>
                      <p className="text-xs text-neutral-500">Click pentru descărcare</p>
                    </div>
                    <Download className="w-5 h-5 text-neutral-400" />
                  </a>
                )}
                {order.finalDocumentUrl && (
                  <a
                    href={order.finalDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">Document final</p>
                      <p className="text-xs text-neutral-500">Click pentru descărcare</p>
                    </div>
                    <Download className="w-5 h-5 text-neutral-400" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Ai nevoie de ajutor?</p>
                <p className="text-blue-700">
                  Contactează-ne la{' '}
                  <a href="mailto:support@eghiseul.ro" className="font-medium underline">
                    support@eghiseul.ro
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
