'use client';

/**
 * TrackingTimeline Component
 *
 * Displays courier tracking info for an order: AWB number, delivery status badge,
 * and a vertical timeline of tracking events. Supports auto-refresh and guest access.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  statusCode?: string;
  description: string;
  location?: string;
  signedBy?: string;
}

interface TrackingData {
  awb: string | null;
  status: string;
  statusDescription: string;
  events: TrackingEvent[];
  trackingUrl: string | null;
  lastUpdate: string | null;
  message?: string;
  signedBy?: string;
  actualDelivery?: string;
  cached?: boolean;
  fetchError?: string;
}

export interface TrackingTimelineProps {
  orderId: string;
  sessionId?: string;
  email?: string;
  autoRefresh?: boolean;
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

type TrackingStatusKey =
  | 'delivered'
  | 'out_for_delivery'
  | 'in_transit'
  | 'picked_up'
  | 'failed_delivery'
  | 'returned'
  | 'cancelled'
  | 'pending'
  | 'unknown';

const STATUS_BADGE: Record<
  TrackingStatusKey,
  { label: string; className: string; icon: typeof CheckCircle }
> = {
  delivered: {
    label: 'Livrat',
    className: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  out_for_delivery: {
    label: 'In curs de livrare',
    className: 'bg-blue-100 text-blue-800',
    icon: Truck,
  },
  in_transit: {
    label: 'In tranzit',
    className: 'bg-amber-100 text-amber-800',
    icon: Truck,
  },
  picked_up: {
    label: 'Preluat de curier',
    className: 'bg-amber-100 text-amber-800',
    icon: Package,
  },
  failed_delivery: {
    label: 'Livrare esuata',
    className: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  returned: {
    label: 'Returnat',
    className: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  cancelled: {
    label: 'Anulat',
    className: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  pending: {
    label: 'In asteptare',
    className: 'bg-neutral-100 text-neutral-800',
    icon: Clock,
  },
  unknown: {
    label: 'Necunoscut',
    className: 'bg-neutral-100 text-neutral-800',
    icon: Clock,
  },
};

function getStatusBadge(status: string) {
  return (
    STATUS_BADGE[status as TrackingStatusKey] ?? STATUS_BADGE.unknown
  );
}

// Auto-refresh interval: 5 minutes
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TrackingTimeline({
  orderId,
  email,
  autoRefresh = false,
}: TrackingTimelineProps) {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async () => {
    try {
      setError(null);

      const url = new URL(`/api/orders/${orderId}/tracking`, window.location.origin);
      if (email) {
        url.searchParams.set('email', email);
      }

      const response = await fetch(url.toString());
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message || 'Nu s-au putut incarca datele de urmarire'
        );
      }

      setTracking(result.data as TrackingData);
    } catch (err) {
      console.error('[TrackingTimeline] Fetch error:', err);
      setError(
        err instanceof Error ? err.message : 'Eroare la incarcarea datelor de urmarire'
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId, email]);

  // Initial fetch
  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    // Don't refresh if in a final status
    if (
      tracking &&
      ['delivered', 'returned', 'cancelled'].includes(tracking.status)
    ) {
      return;
    }

    const interval = setInterval(fetchTracking, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTracking, tracking]);

  // ---------------------------
  // Loading state
  // ---------------------------
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-6 justify-center text-neutral-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Se incarca datele de urmarire...</span>
      </div>
    );
  }

  // ---------------------------
  // Error state
  // ---------------------------
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // ---------------------------
  // No AWB yet
  // ---------------------------
  if (!tracking || !tracking.awb) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Package className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">AWB-ul nu a fost generat inca</p>
            <p className="text-amber-700">
              {tracking?.message ||
                'Comanda este in curs de procesare. Vei primi un numar de tracking cand coletul va fi expediat.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------
  // Tracking data available
  // ---------------------------
  const badge = getStatusBadge(tracking.status);
  const BadgeIcon = badge.icon;
  const events = tracking.events || [];

  return (
    <div className="space-y-4">
      {/* AWB + status badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">AWB:</span>
          <span className="font-mono font-semibold text-secondary-900">
            {tracking.awb}
          </span>
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
            badge.className
          )}
        >
          <BadgeIcon className="w-3.5 h-3.5" />
          {badge.label}
        </div>
      </div>

      {/* Signed by / actual delivery */}
      {tracking.signedBy && (
        <p className="text-sm text-neutral-600">
          Semnat de: <span className="font-medium">{tracking.signedBy}</span>
        </p>
      )}

      {/* Fetch error note (stale data) */}
      {tracking.fetchError && (
        <p className="text-xs text-amber-600">
          Datele afisate ar putea sa nu fie actualizate. Se vor reincarca automat.
        </p>
      )}

      {/* Event timeline */}
      {events.length > 0 ? (
        <div className="relative">
          {events.map((event, index) => {
            const isFirst = index === 0;
            const isLast = index === events.length - 1;

            return (
              <div key={index} className="flex gap-3 group">
                {/* Vertical line + dot */}
                <div className="flex flex-col items-center relative">
                  {/* Dot */}
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1.5 z-10',
                      isFirst
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-neutral-300'
                    )}
                  />
                  {/* Line */}
                  {!isLast && (
                    <div className="w-0.5 flex-1 bg-neutral-200 mt-1" />
                  )}
                </div>

                {/* Event content */}
                <div className={cn('pb-5 flex-1 min-w-0', isLast && 'pb-0')}>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isFirst ? 'text-secondary-900' : 'text-neutral-600'
                    )}
                  >
                    {event.description}
                  </p>
                  {event.location && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      <span className="text-xs text-neutral-500">
                        {event.location}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {formatEventDateTime(event.date, event.time)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-neutral-500 text-center py-2">
          Nu sunt inca evenimente de urmarire disponibile.
        </p>
      )}

      {/* Footer: tracking link + last update */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-neutral-100">
        {tracking.trackingUrl && (
          <a
            href={tracking.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Urmareste pe site-ul curierului
          </a>
        )}
        {tracking.lastUpdate && (
          <p className="text-xs text-neutral-400">
            Ultima actualizare: {formatLastUpdate(tracking.lastUpdate)}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatEventDateTime(date: string, time: string): string {
  if (!date) return '';

  try {
    // date may be "2026-02-15" and time "14:30" or "14:30:00"
    const parts = date.split('-');
    if (parts.length === 3) {
      const day = parts[2];
      const month = parts[1];
      const year = parts[0];
      const displayTime = time ? `, ${time.slice(0, 5)}` : '';
      return `${day}.${month}.${year}${displayTime}`;
    }
  } catch {
    // fallback
  }

  return `${date} ${time || ''}`.trim();
}

function formatLastUpdate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
