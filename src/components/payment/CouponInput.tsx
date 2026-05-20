'use client';

import { useState } from 'react';
import { Tag, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  // Applied state — green compact card with remove button.
  if (hasApplied) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/60">
        <CardContent className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-emerald-800 truncate">
                Cupon <span className="font-mono">{appliedCode}</span>
              </p>
              <p className="text-xs text-emerald-700">
                −{(appliedDiscount ?? 0).toFixed(2)} RON aplicat
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={busy}
            className="h-8 px-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 shrink-0"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            <span className="ml-1 text-xs">Elimină</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default state — input + apply button.
  return (
    <Card className="bg-white">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-secondary-900">
          <Tag className="h-4 w-4 text-primary-500" />
          Ai un cod de reducere?
        </div>
        <div className="flex items-stretch gap-2">
          <Input
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
            placeholder="Cod cupon"
            className="h-10 font-mono uppercase placeholder:text-neutral-400"
            disabled={busy}
            autoComplete="off"
          />
          <Button
            type="button"
            onClick={handleApply}
            disabled={busy || !input.trim()}
            className={cn(
              'h-10 px-4 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold shrink-0',
              busy && 'opacity-70'
            )}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Aplică'
            )}
          </Button>
        </div>
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
