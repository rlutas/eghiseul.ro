'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Operator manual upload for an ONRC job that the bot couldn't finish
 * (NEEDS_OPERATOR / FAILED). Uploads the PDF obtained manually from ONRC →
 * attaches it to the order, emails the client, and marks the job DONE.
 */
export function OnrcManualUpload({ orderId }: { orderId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [reg, setReg] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (reg.trim()) fd.append('registrationNumber', reg.trim());
      const res = await fetch(`/api/admin/orders/${orderId}/onrc-upload`, { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Eroare');
      setMsg('✓ Încărcat și livrat clientului');
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Eroare');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <input
        type="text"
        value={reg}
        onChange={(e) => setReg(e.target.value)}
        placeholder="Nr. înreg. (opțional)"
        className="w-full rounded border border-neutral-300 px-1.5 py-1 text-[11px]"
      />
      {/* Hidden input + button (macOS-friendly pattern). */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded bg-amber-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {busy ? 'Se încarcă…' : 'Încarcă PDF manual'}
      </button>
      {msg && <div className="text-[10px] text-neutral-600">{msg}</div>}
    </div>
  );
}
