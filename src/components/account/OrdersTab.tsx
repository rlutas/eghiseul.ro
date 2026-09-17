'use client';

/**
 * The customer's orders, as cards.
 *
 * Faza 4 of `docs/dashboard-client/PLAN.md`. Each card answers three questions,
 * in this order, and nothing else:
 *
 *   1. Where is it?  — status in Romanian + what happens next and WHO does it
 *      (us / the institution / you), with a deadline as a DATE, never a range.
 *   2. Do I have to do something? — if yes, it is the only emphasised thing on
 *      the card. If no, the card stays quiet.
 *   3. Where are my documents? — a direct link to them, plus the invoice.
 *
 * The wording lives in `lib/orders/customer-status` (where it is) and
 * `lib/orders/customer-next-step` (what happens next, and the date). This file
 * only decides what is shown and how loudly — it invents no copy of its own for
 * a status, so a status added to the workflow cannot get a different story here
 * than on the order page.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { customerStatus, STATUS_TONE_CLASSES, type StatusTone } from '@/lib/orders/customer-status';
import {
  customerNextStep,
  estimatedReadyDate,
  formatReadyDate,
  type Actor,
} from '@/lib/orders/customer-next-step';
import { documentValidity, validityLabel } from '@/lib/orders/document-validity';
import {
  Package,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Truck,
  Receipt,
  CalendarClock,
  PauseCircle,
  Building2,
  Hand,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Order {
  id: string;
  /** What the customer sees on the card — the friendly code when we have one. */
  displayCode: string;
  /** The raw `E-YYMMDD-XXXXX` code, needed to resume a draft in the wizard. */
  friendlyOrderId: string | null;
  serviceName?: string;
  serviceSlug: string | null;
  status: string;
  totalPrice: number;
  createdAt: string;
  paidAt: string | null;
  estimatedCompletionDate: string | null;
  estimatedDays: number | null;
  tracking: { number: string; url: string | null; status: string | null } | null;
  documentsAvailable: number;
  invoiceIssued: boolean;
  /** The invoice PDF itself, when Oblio has issued one. */
  invoiceUrl: string | null;
  /** When the order was finished — what the document's validity counts from. */
  completedAt: string | null;
}

interface OrdersTabProps {
  initialOrders?: Order[];
  className?: string;
}

/** Icon per tone — the wording itself comes from lib/orders/customer-status. */
const TONE_ICON: Record<StatusTone, typeof Clock> = {
  waiting: Clock,
  progress: RefreshCw,
  done: CheckCircle,
  problem: XCircle,
};

/**
 * Naming the actor is the whole point of the line: "în curs" hides that we are
 * waiting on an institution we cannot hurry, and the customer reads the silence
 * as us being slow.
 */
const ACTOR: Record<Actor, { label: string; icon: typeof Clock; className: string } | null> = {
  noi: { label: 'Lucrăm noi', icon: Wrench, className: 'text-blue-700' },
  institutia: { label: 'La instituție', icon: Building2, className: 'text-amber-700' },
  tu: { label: 'Depinde de tine', icon: Hand, className: 'text-amber-800' },
  nimeni: null,
};

/**
 * Statuses where there is deliberately no date. Saying WHY beats an empty row:
 * a missing deadline with no explanation reads as a deadline we blew.
 */
const CLOCK_PAUSED_REASON: Record<string, string> = {
  on_hold_institution: 'Termenul este pe pauză cât timp instituția e indisponibilă.',
  standby: 'Termenul pornește din momentul în care primim ce lipsește.',
};

/** Raw API row — everything the account needs arrives in one GET /api/orders. */
interface ApiOrder {
  id: string;
  friendly_order_id?: string | null;
  orderNumber?: string;
  status: string;
  total_price?: number;
  totalAmount?: number;
  created_at?: string;
  createdAt?: string;
  paidAt?: string | null;
  estimatedCompletionDate?: string | null;
  estimatedDays?: number | null;
  tracking?: { number: string; url: string | null; status: string | null } | null;
  documentsAvailable?: number;
  invoiceIssued?: boolean;
  invoiceUrl?: string | null;
  completedAt?: string | null;
  service?: { name?: string; slug?: string } | null;
  services?: { name?: string; slug?: string } | null;
}

function toOrder(row: ApiOrder): Order {
  const service = row.service || row.services || null;
  return {
    id: row.id,
    displayCode: row.friendly_order_id || row.orderNumber || `#${row.id.slice(0, 8)}`,
    friendlyOrderId: row.friendly_order_id ?? null,
    serviceName: service?.name,
    serviceSlug: service?.slug ?? null,
    status: row.status,
    totalPrice: row.total_price ?? row.totalAmount ?? 0,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    paidAt: row.paidAt ?? null,
    estimatedCompletionDate: row.estimatedCompletionDate ?? null,
    estimatedDays: row.estimatedDays ?? null,
    tracking: row.tracking ?? null,
    documentsAvailable: row.documentsAvailable ?? 0,
    invoiceIssued: row.invoiceIssued ?? false,
    invoiceUrl: row.invoiceUrl ?? null,
    completedAt: row.completedAt ?? null,
  };
}

/**
 * Where a next-step button goes.
 *
 * `resume` is the only subtle one: the wizard hydrates a draft from
 * `?order=<friendly code>` and, for the signed-in owner, does NOT need the
 * `?email=` anti-IDOR guard (`modular-wizard-provider.tsx`). Without a slug or a
 * code there is no safe resume target, so the order page is the fallback rather
 * than a wizard that would silently start blank.
 */
function actionHref(order: Order, kind: 'pay' | 'resume' | 'contact' | 'track'): string | null {
  switch (kind) {
    case 'pay':
      return `/comanda/checkout/${order.id}/`;
    case 'resume':
      return order.serviceSlug && order.friendlyOrderId
        ? `/comanda/${order.serviceSlug}/?order=${encodeURIComponent(order.friendlyOrderId)}`
        : `/account/orders/${order.id}/`;
    case 'contact':
      return '/contact/';
    case 'track':
      return order.tracking?.url ?? null;
  }
}

/** `GET /api/orders` pages at 20; the list asks for the next page on demand. */
const PAGE_SIZE = 20;

export default function OrdersTab({ initialOrders, className }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [isLoading, setIsLoading] = useState(!initialOrders);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * One page of orders. The route has always paged at 20 and the list never
   * asked for more, so a customer with 21 orders simply could not see the
   * oldest — silently, with nothing on screen to suggest anything was missing.
   */
  const loadPage = useCallback(async (offset: number): Promise<{ rows: Order[]; hasMore: boolean }> => {
    const response = await fetch(`/api/orders?limit=${PAGE_SIZE}&offset=${offset}`);
    const result = await response.json();

    if (!response.ok) {
      // The route answers with `error: { code, message }`, so the old
      // `throw new Error(result.error)` printed "[object Object]" to the customer.
      throw new Error(result?.error?.message || 'Failed to fetch orders');
    }

    const rows: ApiOrder[] = result.data?.orders || result.data || [];
    return { rows: rows.map(toOrder), hasMore: !!result.data?.pagination?.hasMore };
  }, []);

  useEffect(() => {
    if (initialOrders) return;

    let cancelled = false;

    const fetchFirstPage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const page = await loadPage(0);
        if (!cancelled) {
          setOrders(page.rows);
          setHasMore(page.hasMore);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (!cancelled) setError('Nu am putut încărca comenzile. Reîncarcă pagina.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchFirstPage();
    return () => {
      cancelled = true;
    };
  }, [initialOrders, loadPage]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    setError(null);
    try {
      const page = await loadPage(orders.length);
      setOrders((current) => [...current, ...page.rows]);
      setHasMore(page.hasMore);
    } catch (err) {
      console.error('Error fetching more orders:', err);
      setError('Nu am putut încărca restul comenzilor. Încearcă din nou.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  /**
   * Anything that needs the customer goes to the top, whatever its date — the
   * whole reason to open this screen is to find out if you are the blocker.
   * Everything else keeps the API's newest-first order.
   */
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aBlocked = customerNextStep(a.status)?.needsCustomerAction ? 0 : 1;
      const bBlocked = customerNextStep(b.status)?.needsCustomerAction ? 0 : 1;
      if (aBlocked !== bBlocked) return aBlocked - bBlocked;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* No heading: the panel around this already says "Comenzile mele", and
          repeating it reads as a mistake. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">Unde e fiecare comandă și ce urmează</p>
        <Button asChild className="bg-primary-500 hover:bg-primary-600 text-secondary-900 min-h-[44px]">
          <Link href="/account/?tab=services">
            <Plus className="w-4 h-4 mr-2" />
            Comandă nouă
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {sortedOrders.length > 0 ? (
        <div className="space-y-3">
          {sortedOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}

          {hasMore && (
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="min-h-[44px] w-full"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se încarcă...
                </>
              ) : (
                'Vezi comenzile mai vechi'
              )}
            </Button>
          )}
        </div>
      ) : (
        <EmptyOrders />
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = customerStatus(order.status);
  const tone = STATUS_TONE_CLASSES[status.tone];
  const StatusIcon = TONE_ICON[status.tone];

  const nextStep = customerNextStep(order.status);
  const actor = nextStep ? ACTOR[nextStep.actor] : null;
  const ActorIcon = actor?.icon;

  const needsAction = !!nextStep?.needsCustomerAction;
  const actionUrl = nextStep?.action ? actionHref(order, nextStep.action.kind) : null;

  const estimate = estimatedReadyDate({
    status: order.status,
    estimatedCompletionDate: order.estimatedCompletionDate,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    estimatedDays: order.estimatedDays,
  });
  const pausedReason = !estimate ? CLOCK_PAUSED_REASON[order.status] : undefined;

  // What the customer got, and for how long it is still worth something. The
  // account is the only place that can say this next to the order it came from —
  // the validity table and its legal basis live in lib/lifecycle/rules.
  const validity = documentValidity(order.serviceSlug, order.completedAt);
  const ValidityIcon = validity?.state === 'valid' ? ShieldCheck : ShieldAlert;

  const trackingUrl = order.tracking?.url ?? null;
  // The `track` action and the tracking link are the same button. Rendered once,
  // below, so a shipped order does not get two "urmărește coletul".
  const quietAction =
    !needsAction && nextStep?.action && nextStep.action.kind !== 'track' && actionUrl
      ? { label: nextStep.action.label, href: actionUrl }
      : null;

  return (
    <article
      className={cn(
        'rounded-2xl border bg-white p-4 sm:p-5',
        needsAction ? 'border-amber-300 bg-amber-50 ring-1 ring-amber-200' : 'border-neutral-200'
      )}
    >
      {/* 1. Where is it */}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
            tone.bg
          )}
        >
          <StatusIcon className={cn('h-5 w-5', tone.text)} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-sm font-semibold text-secondary-900">
              {order.displayCode}
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                tone.bg,
                tone.text
              )}
            >
              {status.label}
            </span>
          </div>
          {order.serviceName && (
            <p className="mt-0.5 break-words text-sm font-medium text-secondary-900">
              {order.serviceName}
            </p>
          )}
        </div>
      </div>

      {/* Ce urmează și cine face */}
      {nextStep && (
        <div className="mt-3 flex items-start gap-2 text-sm">
          {ActorIcon && (
            <ActorIcon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', actor?.className)} />
          )}
          <p className="text-neutral-700">
            {actor && <span className={cn('font-semibold', actor.className)}>{actor.label}: </span>}
            {nextStep.text}
          </p>
        </div>
      )}

      {/* Termenul, ca dată */}
      {(estimate || pausedReason) && (
        <div className="mt-2 flex items-start gap-2 text-sm">
          {estimate ? (
            <>
              <CalendarClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
              <p className="text-neutral-700">
                {estimate.source === 'set' ? 'Termen: ' : 'Estimat gata: '}
                <span className="font-semibold text-secondary-900">
                  {formatReadyDate(estimate.date)}
                </span>
              </p>
            </>
          ) : (
            <>
              <PauseCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
              <p className="text-neutral-600">{pausedReason}</p>
            </>
          )}
        </div>
      )}

      {/* 2. Trebuie să fac eu ceva — singurul lucru accentuat de pe card */}
      {needsAction && nextStep?.action && actionUrl && (
        <div className="mt-4">
          <Button
            asChild
            className="min-h-[44px] w-full bg-primary-500 text-secondary-900 hover:bg-primary-600 sm:w-auto"
          >
            <Link href={actionUrl}>
              {nextStep.action.label}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Valabilitatea documentului primit */}
      {validity && (
        <div
          className={cn(
            'mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-3 py-2 text-sm',
            validity.state === 'valid'
              ? 'bg-neutral-50 text-neutral-700'
              : validity.state === 'expiring'
                ? 'bg-amber-50 text-amber-900'
                : 'bg-neutral-100 text-neutral-700'
          )}
        >
          <span className="flex items-center gap-2">
            <ValidityIcon
              className={cn(
                'h-4 w-4 flex-shrink-0',
                validity.state === 'valid' ? 'text-green-600' : 'text-amber-600'
              )}
            />
            {validityLabel(validity)}
          </span>
          {validity.state !== 'valid' && order.serviceSlug && (
            <Link
              href={`/comanda/${order.serviceSlug}/`}
              className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-primary-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              <RotateCcw className="h-4 w-4 flex-shrink-0" />
              Comandă din nou
            </Link>
          )}
        </div>
      )}

      {/* 3. Unde-mi sunt documentele */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-neutral-100 pt-3 text-sm">
        {order.documentsAvailable > 0 && (
          <CardLink href={`/account/orders/${order.id}/`} icon={FileText} emphasis>
            Vezi documentele ({order.documentsAvailable})
          </CardLink>
        )}
        {trackingUrl && (
          <CardLink href={trackingUrl} icon={Truck} external>
            Urmărește coletul
          </CardLink>
        )}
        {order.invoiceIssued && (
          // Straight to the PDF when we hold its address; the order page only
          // when we do not, so the link never promises a file it cannot open.
          <CardLink
            href={order.invoiceUrl ?? `/account/orders/${order.id}/`}
            icon={Receipt}
            external={!!order.invoiceUrl}
          >
            Factura
          </CardLink>
        )}
        {quietAction && (
          <CardLink href={quietAction.href} icon={ChevronRight}>
            {quietAction.label}
          </CardLink>
        )}
        <CardLink href={`/account/orders/${order.id}/`} icon={ChevronRight}>
          Detalii comandă
        </CardLink>
      </div>

      {/* Preț și dată — secundare, dar prezente */}
      <p className="mt-2 text-xs text-neutral-500">
        {order.totalPrice.toFixed(2)} RON · comandată{' '}
        {new Date(order.createdAt).toLocaleDateString('ro-RO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </article>
  );
}

function CardLink({
  href,
  icon: Icon,
  children,
  emphasis,
  external,
}: {
  href: string;
  icon: typeof FileText;
  children: React.ReactNode;
  emphasis?: boolean;
  external?: boolean;
}) {
  const className = cn(
    'inline-flex min-h-[44px] items-center gap-1.5 font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded',
    emphasis ? 'text-primary-700' : 'text-neutral-600'
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        <Icon className="h-4 w-4 flex-shrink-0" />
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      {children}
    </Link>
  );
}

/**
 * No orders means the screen has nothing to report, so it shows what can be
 * ordered instead of an empty dashboard (decizia D2 din PLAN.md). The primary
 * destination stays inside the account, where the catalogue already knows what
 * we have on file for this customer.
 */
function EmptyOrders() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center sm:p-8">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
        <Package className="h-8 w-8 text-neutral-400" />
      </div>
      <h4 className="mb-2 font-semibold text-secondary-900">Nu ai nicio comandă</h4>
      <p className="mb-5 text-sm text-neutral-600">
        Alege un serviciu și îl completăm cu datele pe care le avem deja în contul tău.
      </p>
      <div className="flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
        <Button asChild className="min-h-[44px] bg-primary-500 text-secondary-900 hover:bg-primary-600">
          <Link href="/account/?tab=services">Vezi ce pot comanda</Link>
        </Button>
        <Button asChild variant="outline" className="min-h-[44px]">
          <Link href="/servicii/">Toate serviciile</Link>
        </Button>
      </div>
    </div>
  );
}
