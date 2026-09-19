'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Operator "Reîncearcă" — resets a FAILED job to PENDING so the worker retries. */
export function AncpiRetry({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMsg(null);
          try {
            const res = await fetch(`/api/admin/orders/${orderId}/ancpi-retry`, { method: 'POST' });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.error || 'Eroare');
            setMsg('✓ Reluat');
            router.refresh();
          } catch (e) {
            setMsg(e instanceof Error ? e.message : 'Eroare');
          } finally {
            setBusy(false);
          }
        }}
        className="w-full rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? 'Se reia…' : '↻ Reîncearcă automat'}
      </button>
      {msg && <div className="text-[10px] text-neutral-600">{msg}</div>}
    </div>
  );
}
