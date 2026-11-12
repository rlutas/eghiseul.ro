'use client';

import { useState } from 'react';
import { Tag, X, Loader2, TicketPercent, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CouponInputProps {
  orderId: string;
  /** Currently applied coupon code, if any. */
  appliedCode?: string | null;
  /** Currently applied discount in RON. */
  appliedDiscount?: number;
  /** Called after a successful apply or remove — parent should re-fetch order. */
  onChange: () => Promise<void> | void;
}

/**
 * Coupon input rendered on the checkout page sidebar.
 *
 * - Apply: POST /api/orders/[id]/coupon { code }
 * - Remove: DELETE /api/orders/[id]/coupon
 *
 * Both endpoints recompute the order total server-side and cancel the
 * existing Stripe PaymentIntent so the next payment call regenerates it.
 * After the request completes, we ask the parent page to reload the order
 * (setClientSecret(null) on parent triggers a fresh PaymentIntent).
 */
export function CouponInput({
  orderId,
  appliedCode,
  appliedDiscount,
  onChange,
}: CouponInputProps) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasApplied = !!appliedCode && (appliedDiscount ?? 0) > 0;

  const handleApply = async () => {
    const code = input.trim().toUpperCase();
    if (!code) {
      setError('Introdu un cod de cupon');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Eroare la aplicarea cuponului');
        return;
      }
      setInput('');
      await onChange();
    } catch {
      setError('Eroare de rețea');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/coupon`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Eroare la eliminarea cuponului');
        return;
      }
      await onChange();
    } catch {
      setError('Eroare de rețea');
    } finally {
      setBusy(false);
    }
  };

  // Applied state — one quiet row: what was applied, how much it saved, undo.
  if (hasApplied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <TicketPercent className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            {/* No truncate: on a phone the code itself was cut („BLA…"). */}
            <p className="text-sm font-semibold leading-snug text-emerald-900">
              Reducere aplicată:{' '}
              <span className="whitespace-nowrap font-mono tracking-tight">{appliedCode}</span>
            </p>
            <p className="text-xs text-emerald-800">
              Economisești {(appliedDiscount ?? 0).toFixed(2)} RON la această comandă
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={busy}
          className="h-8 shrink-0 px-2.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 hover:text-emerald-950"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          <span className="ml-1">Elimină</span>
        </Button>
      </div>
    );
  }

  // Default state — label, input and button on one line.
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3.5">
      <label htmlFor="coupon-code" className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
        <Tag className="h-4 w-4 text-primary-600" />
        Ai un cod de reducere?
      </label>
      <div className="mt-2.5 flex items-stretch gap-2">
        <Input
          id="coupon-code"
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!busy) handleApply();
            }
          }}
          placeholder="Scrie codul aici"
          className="h-11 font-mono uppercase placeholder:font-sans placeholder:normal-case placeholder:text-neutral-400"
          disabled={busy}
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={error ? 'coupon-error' : undefined}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleApply}
          disabled={busy || !input.trim()}
          className={cn('h-11 shrink-0 border-neutral-300 px-5 font-semibold text-secondary-900', busy && 'opacity-70')}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplică'}
        </Button>
      </div>
      {error && (
        <p id="coupon-error" className="mt-2 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
