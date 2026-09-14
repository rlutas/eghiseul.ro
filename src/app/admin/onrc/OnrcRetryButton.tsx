'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Operator "Reîncearcă" for a FAILED / NEEDS_OPERATOR ONRC job that never
 * created an ONRC draft (so it cannot have been paid). Resets the job to
 * PENDING; the worker picks it up on the next tick. Use after fixing the
 * cause (portal down, expired ONRC password, ...).
 */
export function OnrcRetryButton({ orderId, disabled }: { orderId: string; disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function retry() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/onrc-retry`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Eroare');
      setMsg('✓ Repus în coadă');
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Eroare');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={busy || disabled}
        onClick={retry}
        title={
          disabled
            ? 'Are deja cerere creată la ONRC (posibil plătită) — nu se re-depune automat'
            : 'Repune job-ul în coadă pentru bot (după ce ai reparat cauza)'
        }
        className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-[11px] font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
      >
        {busy ? 'Se repune…' : '↻ Reîncearcă automat'}
      </button>
      {msg && <div className="text-[11px] text-neutral-600">{msg}</div>}
    </div>
  );
}
