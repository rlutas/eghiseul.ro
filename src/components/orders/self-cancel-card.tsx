'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  cancelWindowRemainingMs,
  computeCancelRefundAmount,
  formatCancelCountdown,
} from '@/lib/orders/self-cancel';

interface SelfCancelCardProps {
  orderCode: string;
  email: string;
  status: string;
  paidAt: string | null;
  totalRon: number;
  onCancelled: () => void;
}

/**
 * Customer-facing card shown on /comanda/status when the order is within the
 * 30-min cancel window. Live countdown, confirm step, calls /api/orders/cancel.
 *
 * Hidden entirely when: status !== 'paid', no paid_at, or window expired.
 * After cancellation_requested: shows a confirmation banner instead.
 */
export function SelfCancelCard({
  orderCode,
  email,
  status,
  paidAt,
  totalRon,
  onCancelled,
}: SelfCancelCardProps) {
  // Re-render every second to update the countdown.
  const [now, setNow] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'cancellation_requested' || status === 'cancelled' || status === 'refunded') {
      return;
    }
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [status]);

  // Post-cancel banner.
  if (success || status === 'cancellation_requested') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-900">Cererea de anulare a fost înregistrată</p>
            <p className="mt-1 text-amber-800">
              Vei primi rambursarea de 70% ({computeCancelRefundAmount(totalRon).toFixed(2)} RON)
              în 5–10 zile lucrătoare, pe metoda de plată folosită. Te contactăm pe email când
              refund-ul este procesat.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'paid' || !paidAt) return null;
  const remaining = cancelWindowRemainingMs(paidAt, now);
  if (remaining <= 0) return null;

  const refundAmount = computeCancelRefundAmount(totalRon);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderCode, email }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Eroare la procesarea cererii.');
        return;
      }
      setSuccess(true);
      onCancelled();
    } catch {
      setError('Eroare de rețea. Te rugăm să încerci din nou.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <details>
        <summary className="cursor-pointer text-sm font-medium text-amber-900 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Anulare comandă · timp rămas{' '}
            <span className="font-mono font-semibold tabular-nums">
              {formatCancelCountdown(remaining)}
            </span>
          </span>
        </summary>

        <div className="mt-3 space-y-3 text-sm text-amber-900">
          <p>
            Poți cere anularea în primele 30 minute după plată. Vei primi <strong>70%</strong>{' '}
            din suma plătită ({refundAmount.toFixed(2)} RON din {totalRon.toFixed(2)} RON).
          </p>
          <p className="text-xs text-amber-800">
            Diferența de 30% acoperă comisioanele Stripe + procesarea deja începută. Rambursarea
            apare în cont în 5–10 zile lucrătoare.
          </p>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {!confirming ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirming(true)}
              className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
            >
              <XIcon className="mr-1 h-4 w-4" />
              Anulează comanda
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={submit}
                disabled={submitting}
                className="text-white"
              >
                {submitting
                  ? 'Se procesează…'
                  : `Confirm anularea — refund ${refundAmount.toFixed(2)} RON`}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={submitting}
              >
                Renunț, las comanda
              </Button>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
