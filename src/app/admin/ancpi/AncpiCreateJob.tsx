'use client';

import { useState } from 'react';
import { checkCf } from '@/lib/ancpi/cf-format';
import { COUNTY_NAMES, normalizeJudet } from '@/lib/ancpi/judete';
import uatNomenclator from '@/lib/ancpi/uat-nomenclator.json';

/**
 * Operator form: queue an ANCPI extras-CF job manually for THIS order — for
 * "identificare imobil" orders once the operator found the CF number (geoportal
 * tool), or as a fallback when the auto-queue at payment didn't fire. The worker
 * picks it up at the next poll and issues the PDF; delivery to the client is
 * automatic. Costs 1 prepaid ePay credit point.
 */
export function AncpiCreateJob({
  orderId,
  defaultJudet,
  defaultLocalitate,
  onCreated,
}: {
  orderId: string;
  defaultJudet?: string;
  defaultLocalitate?: string;
  onCreated?: () => void;
}) {
  // Prefill only with values that exist in the shared lists — a free-text
  // county/locality from older data must not preselect something the worker
  // can't resolve.
  const initialJudet =
    COUNTY_NAMES.find((c) => normalizeJudet(c) === normalizeJudet(defaultJudet ?? '')) ?? '';
  const uatsFor = (county: string): string[] =>
    (uatNomenclator as Record<string, string[]>)[normalizeJudet(county)] ?? [];
  const initialLocalitate =
    uatsFor(initialJudet).find((u) => u.toLowerCase() === (defaultLocalitate ?? '').toLowerCase()) ?? '';

  const [open, setOpen] = useState(false);
  const [judet, setJudet] = useState(initialJudet);
  const [localitate, setLocalitate] = useState(initialLocalitate);
  const [identificator, setIdentificator] = useState('');
  const [tip, setTip] = useState<'CF' | 'CAD' | 'TOPO'>('CF');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const cfCheck = tip !== 'TOPO' && identificator.trim() ? checkCf(identificator) : null;

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ancpi-create-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judet, localitate, identificator, identificatorType: tip }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Eroare');
      setMsg({ ok: true, text: '✓ Job creat — workerul îl preia la următorul poll (~1 min). Urmărește-l în /admin/ancpi.' });
      onCreated?.();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Eroare' });
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
        >
          ⚙️ Generează extras CF (worker ANCPI)
        </button>
        {msg && <div className={`mt-1 text-xs ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</div>}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <p className="text-xs font-semibold text-secondary-900">Generează extras CF prin workerul ANCPI</p>
      <p className="text-[11px] text-neutral-500">
        Introdu CF-ul identificat → workerul plasează comanda pe ePay, descarcă PDF-ul și îl livrează
        automat clientului. Consumă <strong>1 punct</strong> din creditul prepaid.
      </p>
      {/* Same county list + ANCPI UAT nomenclator as the customer wizard
          (PropertyDataStep) — dropdowns, not free text, so the worker's
          locality→uatId resolution can't fail on a typo. */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <select
          value={judet}
          onChange={(e) => { setJudet(e.target.value); setLocalitate(''); }}
          className="rounded border border-neutral-300 bg-white px-2 py-1.5 text-xs"
        >
          <option value="">Județ…</option>
          {COUNTY_NAMES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={localitate}
          onChange={(e) => setLocalitate(e.target.value)}
          disabled={!judet}
          className="rounded border border-neutral-300 bg-white px-2 py-1.5 text-xs disabled:opacity-50"
        >
          <option value="">{judet ? 'Localitate / UAT…' : 'Alege întâi județul'}</option>
          {uatsFor(judet).map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <select value={tip} onChange={(e) => setTip(e.target.value as 'CF' | 'CAD' | 'TOPO')}
          className="rounded border border-neutral-300 px-2 py-1.5 text-xs">
          <option value="CF">Nr. CF</option>
          <option value="CAD">Nr. cadastral</option>
          <option value="TOPO">Nr. topografic</option>
        </select>
        <input value={identificator} onChange={(e) => setIdentificator(e.target.value)}
          placeholder="ex: 12783 sau 123456-C1-U2"
          className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-xs font-mono" />
      </div>
      {cfCheck && cfCheck.status !== 'valid' && cfCheck.status !== 'empty' && (
        <p className="text-[11px] text-amber-700">
          ⚠️ {cfCheck.status === 'collective'
            ? `CF colectivă (întreaga clădire, ${cfCheck.normalized}) — workerul o va ruta la „Necesită operator”. Pentru un apartament adaugă unitatea (ex. ${cfCheck.normalized}-U20).`
            : cfCheck.status === 'old_format'
              ? 'Pare un nr. de CF veche (pe hârtie) — nu e în e-Terra electronic; probabil ajunge la „Necesită operator”.'
              : 'Nu pare un identificator electronic standard (ex. 123456 sau 123456-C1-U2) — verifică înainte de a consuma punctul.'}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button type="button" onClick={submit} disabled={busy || !judet.trim() || !localitate.trim() || !identificator.trim()}
          className="rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
          {busy ? 'Se creează…' : 'Creează job (1 punct)'}
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={busy}
          className="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100">
          Renunță
        </button>
      </div>
      {msg && <div className={`text-xs ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</div>}
    </div>
  );
}
