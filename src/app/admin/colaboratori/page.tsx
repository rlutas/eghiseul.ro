'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Users, ClipboardList, Wallet, Receipt, ListChecks, Eye, FileSpreadsheet, Plus, X, Loader2 } from 'lucide-react';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';
import { findStatusLabel } from '@/lib/admin/status-options';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  feeLabel: string;
  services: { service_id: string; name: string; slug: string }[];
}
interface CollabOrder {
  id: string;
  friendlyOrderId: string;
  service: string;
  client: string;
  status: string;
  total: number;
  fee: number;
  ocpiCost: number;
  isTest: boolean;
  createdAt: string;
}
interface Breakdown {
  collectedWithVat: number;
  netOfVat: number;
  vat: number;
  ocpiCosts: number;
  stripeFees: number;
  commission: number;
  platformCost: number;
  pendingOcpi: number;
  totalCosts: number;
  grossProfit: number;
  profitTax: number;
  netProfit: number;
  dividendTax: number;
  distributable: number;
  sharePerSide: number;
  collaboratorShare: number;
}
interface Summary { count: number; revenue: number; fees: number; breakdown: Breakdown | null }

function monthOptions(): { value: string; label: string }[] {
  const opts = [{ value: '', label: 'Toate lunile' }];
  const now = new Date();
  const months = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    opts.push({ value, label: `${months[d.getMonth()]} ${d.getFullYear()}` });
  }
  return opts;
}


/** Admin-manageable service assignments (decizie 2026-07-15): bife pe servicii
 *  în loc de migrări manuale. users.manage only — schimbă ce comenzi vede
 *  colaboratorul prin RLS. */
function ServiceAssignments({ collaboratorId, onChanged }: { collaboratorId: string; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<{ id: string; slug: string; name: string; category: string; assigned: boolean }[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open || !collaboratorId) return;
    (async () => {
      const res = await fetch(`/api/admin/collaborators/services?collaboratorId=${collaboratorId}`);
      const json = await res.json();
      if (json.success) setRows(json.data);
      else setErr(json.error || 'Eroare la încărcare');
    })();
  }, [open, collaboratorId]);

  const toggle = async (serviceId: string, assigned: boolean) => {
    setBusy(serviceId);
    setErr('');
    try {
      const res = await fetch('/api/admin/collaborators/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaboratorId, serviceId, assigned }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Eroare');
      setRows((r) => r.map((x) => (x.id === serviceId ? { ...x, assigned } : x)));
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Eroare');
    } finally {
      setBusy(null);
    }
  };

  const byCategory = rows.reduce<Record<string, typeof rows>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ListChecks className="h-4 w-4 text-primary-600" />
          Servicii alocate ({rows.filter((r) => r.assigned).length || '…'})
        </span>
        <span className="text-xs text-slate-400">{open ? 'ascunde' : 'gestionează'}</span>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="mb-3 text-xs text-slate-500">
            Bifat = colaboratorul vede și lucrează comenzile serviciului (și intră în decontul lui).
            Debifat = serviciul se lucrează intern.
          </p>
          {err && <p className="mb-2 text-xs font-semibold text-red-600">{err}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat}>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{cat}</p>
                <ul className="space-y-1">
                  {items.map((svc) => (
                    <li key={svc.id}>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={svc.assigned}
                          disabled={busy === svc.id}
                          onChange={(e) => toggle(svc.id, e.target.checked)}
                          className="h-4 w-4"
                        />
                        {svc.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Avansurile trimise colaboratorului pentru taxele instituțiilor (OCPI).
 *  Banii pleacă din contul lui Raul (de regulă Revolut) ca el să poată plăti
 *  taxa la depunere; consumul e în order_supplier_costs, per comandă. Soldul
 *  arată cât mai are la el, neconsumat — se confruntă la decont. */
interface Advance {
  id: string; amount_ron: number; sent_at: string; method: string; note: string | null;
}

const ADVANCE_METHODS: [string, string][] = [
  ['revolut', 'Transfer Revolut'],
  ['card', 'Taxă plătită cu cardul'],
  ['transfer', 'Transfer bancar'],
  ['numerar', 'Numerar'],
  ['alt', 'Altfel'],
];

function AdvancesPanel({ collaboratorId }: { collaboratorId: string }) {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [summary, setSummary] = useState({ sent: 0, spent: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [sentAt, setSentAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('revolut');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/admin/collaborators/advances?collaboratorId=${collaboratorId}`);
    const json = await res.json();
    if (json.success) { setAdvances(json.data.advances); setSummary(json.data.summary); }
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      setLoading(true);
      void (async () => { if (alive) await load(); })();
    }, 0);
    return () => { alive = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collaboratorId]);

  const add = async () => {
    const value = Number(amount.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/collaborators/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaboratorId, amountRon: value, sentAt, method, note }),
      });
      if (!res.ok) { alert('Nu s-a putut salva avansul.'); return; }
      setAmount(''); setNote('');
      await load();
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/collaborators/advances?id=${id}`, { method: 'DELETE' });
    if (res.ok) await load();
  };

  const fmt2 = (n: number) => n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Avansuri pentru taxe</h2>
          <p className="text-xs text-slate-500">Banii trimiși colaboratorului ca să plătească taxele la instituții. Consumul se ia din taxele înregistrate pe comenzi.</p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Trimis</p>
          <p className="text-lg font-bold text-slate-900">{fmt2(summary.sent)} <span className="text-xs font-semibold text-slate-400">RON</span></p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Consumat în taxe</p>
          <p className="text-lg font-bold text-slate-900">{fmt2(summary.spent)} <span className="text-xs font-semibold text-slate-400">RON</span></p>
        </div>
        <div className={`rounded-lg border p-3 ${summary.balance < 0 ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'}`}>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Sold la colaborator</p>
          <p className={`text-lg font-bold ${summary.balance < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{fmt2(summary.balance)} <span className="text-xs font-semibold text-slate-400">RON</span></p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Sumă (RON)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="500" className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Data</label>
          <input type="date" value={sentAt} onChange={(e) => setSentAt(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Cum</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            {ADVANCE_METHODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">Mențiune (opțional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex. taxe OCPI Ilfov" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button type="button" onClick={() => void add()} disabled={saving || !amount} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
          {saving ? 'Se salvează...' : 'Adaugă'}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Data</th><th className="px-3 py-2">Cum</th><th className="px-3 py-2">Mențiune</th><th className="px-3 py-2 text-right">Sumă</th><th className="px-3 py-2"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">Se încarcă...</td></tr>
            ) : advances.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">Niciun avans înregistrat.</td></tr>
            ) : advances.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-slate-600">{a.sent_at}</td>
                <td className="px-3 py-2 text-slate-700">{ADVANCE_METHODS.find(([v]) => v === a.method)?.[1] ?? a.method}</td>
                <td className="px-3 py-2 text-slate-500">{a.note || '—'}</td>
                <td className="px-3 py-2 text-right font-medium text-slate-900">{fmt2(Number(a.amount_ron))}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => void remove(a.id)} className="text-slate-400 hover:text-rose-600" title="Șterge">
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Decontul avocatei colaboratoare (caziere + integritate + stare civilă) — cerut de
 *  Raul 05.08.2026. Componentele cabinetului (serviciu + urgență + apostilă
 *  Haga, cu reducerile aplicate), FĂRĂ livrare/traducere/legalizare/apostilă
 *  notarilor. Onorariul 15 RON/comandă e separat — se scade la decontare.
 *  Din 07.09.2026: eghiseul + cazierjudiciaronline în același raport (ecazier
 *  NU — e cabinetul ei propriu). */
type DecontPlatform = 'all' | 'eghiseul' | 'cjo';

interface DecontSummary {
  count: number; total: number; totalNet: number; totalCazier: number; totalUrgenta: number;
  totalApostila: number; totalAddon: number; apostilaCount: number; onorarii: number; onorariuPerComanda: number;
}

const EMPTY_DECONT_SUMMARY: DecontSummary = {
  count: 0, total: 0, totalNet: 0, totalCazier: 0, totalUrgenta: 0,
  totalApostila: 0, totalAddon: 0, apostilaCount: 0, onorarii: 0, onorariuPerComanda: 15,
};

function AvocatDecont() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [platform, setPlatform] = useState<DecontPlatform>('all');
  const [rows, setRows] = useState<{
    id: string; platform: 'eghiseul' | 'cjo'; orderNumber: string; paidAt: string; client: string;
    service: string; status: string; isTest: boolean; cazier: number; urgenta: number;
    apostila: number; addon: number; total: number; totalNet: number; refunded: number;
  }[]>([]);
  const [summary, setSummary] = useState<DecontSummary>(EMPTY_DECONT_SUMMARY);
  const [byPlatform, setByPlatform] = useState<{ eghiseul: DecontSummary; cjo: DecontSummary }>({ eghiseul: EMPTY_DECONT_SUMMARY, cjo: EMPTY_DECONT_SUMMARY });
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  // Cheltuielile lunii — se tastează la generare (nu sunt fixe în cod);
  // valorile de start sunt cele din foaia de iunie 2026.
  const [costs, setCosts] = useState<{ label: string; amount: string }[]>([
    { label: 'Taxe angajați', amount: '12000' },
    { label: 'Programe / hosting / domenii', amount: '1000' },
    { label: 'Contabilitate', amount: '2500' },
  ]);
  const [splitRaul, setSplitRaul] = useState('55');
  const [profitTax, setProfitTax] = useState('16');
  const [dividendTax, setDividendTax] = useState('16');
  const [facturaCabinet, setFacturaCabinet] = useState('');
  const months = useMemo(() => monthOptions(), []);

  async function downloadXlsx() {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/collaborators/avocat-decont/xlsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          platform,
          costs: costs
            .filter((c) => c.label.trim() && Number(c.amount))
            .map((c) => ({ label: c.label.trim(), amount: Number(c.amount) })),
          splitRaulPercent: Number(splitRaul) || 55,
          profitTaxPercent: Number(profitTax) || 0,
          dividendTaxPercent: Number(dividendTax) || 0,
          facturaCabinet: Number(facturaCabinet) || 0,
        }),
      });
      if (!res.ok) { alert('Exportul a eșuat. Încearcă din nou.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decont-avocat-${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    let alive = true;
    // Deferred a tick — react-compiler flags sync setState in effects (același
    // pattern ca reloadCollaborators mai jos).
    const t = setTimeout(() => {
      setLoading(true);
      void (async () => {
        const res = await fetch(`/api/admin/collaborators/avocat-decont?month=${month}&platform=${platform}`);
        const json = await res.json();
        if (!alive) return;
        if (json.success) {
          setRows(json.data.rows);
          setSummary(json.data.summary);
          setByPlatform(json.data.byPlatform ?? { eghiseul: EMPTY_DECONT_SUMMARY, cjo: EMPTY_DECONT_SUMMARY });
          setWarnings(json.data.warnings ?? []);
        }
        setLoading(false);
      })();
    }, 0);
    return () => { alive = false; clearTimeout(t); };
  }, [month, platform]);

  const fmt = (n: number) => n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Lună</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Platformă</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value as DecontPlatform)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="all">Ambele (eghiseul + CJO)</option>
            <option value="eghiseul">eghiseul.ro</option>
            <option value="cjo">cazierjudiciaronline.com</option>
          </select>
        </div>
        <p className="max-w-sm text-xs text-slate-400">
          Doar <strong>serviciu + urgență + apostilă Haga + add-on-uri de cabinet</strong>, cu reducerile aplicate. Livrarea, traducerea, legalizarea, apostila notarilor și orice alt extra NU intră. ecazier NU intră (cabinetul ei).
        </p>
        <button
          type="button"
          onClick={() => setShowExport((v) => !v)}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <FileSpreadsheet className="h-4 w-4" /> Decont Excel
        </button>
        <a
          href={`/api/admin/collaborators/avocat-decont?month=${month}&platform=${platform}&format=tsv`}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Download className="h-4 w-4" /> Export TSV
        </a>
      </div>

      {showExport && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Decont Excel — {month}</p>
              <p className="text-xs text-slate-500">
                Fila „Comenzi” (cu numerele de contract și delegație din registru) + fila „Decont” (totaluri, cheltuieli, împărțire profit).
                Comisionul Stripe se ia automat, real, din tranzacțiile sincronizate.
              </p>
            </div>
            <button type="button" onClick={() => setShowExport(false)} className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"><X className="h-4 w-4" /></button>
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Cheltuielile lunii</p>
          <div className="space-y-2">
            {costs.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={c.label}
                  onChange={(e) => setCosts(costs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  placeholder="Denumire cheltuială"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  value={c.amount}
                  onChange={(e) => setCosts(costs.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))}
                  placeholder="RON"
                  inputMode="decimal"
                  className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <button type="button" onClick={() => setCosts(costs.filter((_, j) => j !== i))} className="rounded-lg border border-slate-300 bg-white px-2 text-slate-400 hover:text-rose-600"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCosts([...costs, { label: '', amount: '' }])}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
          >
            <Plus className="h-3 w-3" /> Adaugă cheltuială
          </button>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {([
              ['Partea Raul (%)', splitRaul, setSplitRaul],
              ['Impozit profit (%)', profitTax, setProfitTax],
              ['Impozit dividende (%)', dividendTax, setDividendTax],
              ['Factura cabinet (RON)', facturaCabinet, setFacturaCabinet],
            ] as const).map(([label, value, setter]) => (
              <div key={label}>
                <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
                <input value={value} onChange={(e) => setter(e.target.value)} inputMode="decimal" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void downloadXlsx()}
            disabled={exporting}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            {exporting ? 'Se generează...' : 'Descarcă Excel'}
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500"><ClipboardList className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Comenzi</span></div>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{summary.count}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500"><Wallet className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Servicii (cu TVA)</span></div>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{fmt(summary.total)} <span className="text-sm font-bold text-slate-400">RON</span></p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500"><Wallet className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Servicii (fără TVA)</span></div>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{fmt(summary.totalNet)} <span className="text-sm font-bold text-slate-400">RON</span></p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500"><Receipt className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Apostile Haga</span></div>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{fmt(summary.totalApostila)} <span className="text-sm font-bold text-slate-400">RON</span></p>
          <p className="mt-1 text-[11px] text-slate-400">{summary.apostilaCount} apostile · incluse în total</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500"><Receipt className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Onorarii (15 × comandă)</span></div>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{fmt(summary.onorarii)} <span className="text-sm font-bold text-slate-400">RON</span></p>
          <p className="mt-1 text-[11px] text-slate-400">Nu se adună la total — se scad la decontare.</p>
        </div>
      </div>

      {platform === 'all' && (byPlatform.eghiseul.count > 0 || byPlatform.cjo.count > 0) && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {([['eghiseul.ro', byPlatform.eghiseul], ['cazierjudiciaronline.com', byPlatform.cjo]] as const).map(([label, s]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{fmt(s.total)} <span className="text-xs font-semibold text-slate-400">RON cu TVA</span></p>
              <p className="text-xs text-slate-500">{s.count} comenzi · {fmt(s.totalNet)} fără TVA · serviciu {fmt(s.totalCazier)} · urgență {fmt(s.totalUrgenta)} · apostile {fmt(s.totalApostila)} ({s.apostilaCount}) · add-on {fmt(s.totalAddon)} · onorarii {fmt(s.onorarii)}</p>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <p className="mb-1 font-semibold">De verificat manual:</p>
          <ul className="list-disc pl-4">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3">Comandă</th>
              <th className="px-3 py-3">Platformă</th>
              <th className="px-3 py-3">Dată</th>
              <th className="px-3 py-3">Client</th>
              <th className="px-3 py-3">Serviciu</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Serviciu</th>
              <th className="px-3 py-3 text-right">Urgență</th>
              <th className="px-3 py-3 text-right">Apostilă</th>
              <th className="px-3 py-3 text-right">Add-on</th>
              <th className="px-3 py-3 text-right">Total cu TVA</th>
              <th className="px-3 py-3 text-right">fără TVA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={12} className="px-4 py-10 text-center text-slate-500">Se încarcă...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={12} className="px-4 py-10 text-center text-slate-500">Nicio comandă în perioada selectată.</td></tr>
            ) : rows.map((r) => (
              <tr key={`${r.platform}-${r.id}`} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-medium">
                  {r.platform === 'eghiseul' ? (
                    <a href={`/admin/orders/${r.id}`} className="text-primary-700 hover:underline">{r.orderNumber}</a>
                  ) : (
                    <span className="text-slate-700">{r.orderNumber}</span>
                  )}
                  {r.isTest && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">TEST</span>}
                  {r.refunded > 0 && <span className="ml-2 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">RETUR {fmt(r.refunded)}</span>}
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${r.platform === 'cjo' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {r.platform === 'cjo' ? 'CJO' : 'eghiseul'}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-500">{(r.paidAt || '').slice(0, 10)}</td>
                <td className="px-3 py-2 text-slate-700">{r.client}</td>
                <td className="px-3 py-2 text-slate-700">{r.service}</td>
                <td className="px-3 py-2"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{findStatusLabel(r.status)}</span></td>
                <td className="px-3 py-2 text-right text-slate-700">{fmt(r.cazier)}</td>
                <td className="px-3 py-2 text-right text-slate-700">{r.urgenta ? fmt(r.urgenta) : '—'}</td>
                <td className="px-3 py-2 text-right text-slate-700">{r.apostila ? fmt(r.apostila) : '—'}</td>
                <td className="px-3 py-2 text-right text-slate-700">{r.addon ? fmt(r.addon) : '—'}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-900">{fmt(r.total)}</td>
                <td className="px-3 py-2 text-right text-slate-500">{fmt(r.totalNet)}</td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900">
              <tr>
                <td colSpan={6} className="px-3 py-2 text-right text-xs uppercase text-slate-500">Total componente:</td>
                <td className="px-3 py-2 text-right">{fmt(summary.totalCazier)}</td>
                <td className="px-3 py-2 text-right">{fmt(summary.totalUrgenta)}</td>
                <td className="px-3 py-2 text-right">{fmt(summary.totalApostila)}</td>
                <td className="px-3 py-2 text-right">{fmt(summary.totalAddon)}</td>
                <td className="px-3 py-2 text-right">{fmt(summary.total)}</td>
                <td className="px-3 py-2 text-right text-slate-500">{fmt(summary.totalNet)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  );
}

export default function CollaboratorsAdminPage() {
  const { hasPermission } = useAdminPermissions();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [month, setMonth] = useState('');
  const [orders, setOrders] = useState<CollabOrder[]>([]);
  const [summary, setSummary] = useState<Summary>({ count: 0, revenue: 0, fees: 0, breakdown: null });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'servicii' | 'avocat'>('servicii');
  const months = useMemo(() => monthOptions(), []);

  const reloadCollaborators = async (keepSelection = false) => {
    const res = await fetch('/api/admin/collaborators');
    const json = await res.json();
    if (json.success) {
      setCollaborators(json.data);
      if (!keepSelection && json.data.length) setSelectedId(json.data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Deferred a tick — react-compiler can't see the await gap inside
    // reloadCollaborators and flags it as sync setState in an effect.
    const t = setTimeout(() => {
      void reloadCollaborators();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const res = await fetch(`/api/admin/collaborators/orders?collaboratorId=${selectedId}&month=${month}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data.orders);
        setSummary(json.data.summary);
      }
    })();
  }, [selectedId, month]);

  if (!hasPermission('orders.view')) {
    return <p className="text-sm text-red-600">Nu ai acces la această secțiune.</p>;
  }

  const exportUrl = `/api/admin/collaborators/orders?collaboratorId=${selectedId}&month=${month}&format=tsv`;
  const fmt = (n: number) => n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const feeLabel = collaborators.find((c) => c.id === selectedId)?.feeLabel || 'Onorariu';

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-primary-600" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Colaboratori</h1>
          <p className="text-sm text-slate-500">Comenzile și onorariile colaboratorilor (topograf, etc.).</p>
        </div>
      </div>

      {/* Tab: colaboratori pe servicii (topograf) vs decontul avocatei */}
      <div className="mb-6 flex gap-2">
        {([['servicii', 'Colaboratori servicii'], ['avocat', 'Avocat — decont cabinet']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === key ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'avocat' ? (
        <AvocatDecont />
      ) : loading ? (
        <p className="text-sm text-slate-500">Se încarcă...</p>
      ) : collaborators.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Niciun colaborator înregistrat.
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="mb-6 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Colaborator</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                {collaborators.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.services.length} servicii)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Lună</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            {/* Preview: portalul colaboratorului, exact cum îl vede el (read-only). */}
            {hasPermission('users.manage') && selectedId && (
              <a
                href={`/colaborator/orders?as=${selectedId}`}
                target="_blank"
                rel="noopener"
                className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                title="Deschide portalul colaboratorului în modul previzualizare (doar citire)"
              >
                <Eye className="h-4 w-4" /> Vezi ce vede colaboratorul
              </a>
            )}
            <a
              href={exportUrl}
              className={`inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800${hasPermission('users.manage') ? '' : ' ml-auto'}`}
            >
              <Download className="h-4 w-4" /> Export CSV/TSV
            </a>
          </div>

          {/* Service assignments — users.manage only */}
          {hasPermission('users.manage') && selectedId && (
            <ServiceAssignments collaboratorId={selectedId} onChanged={() => reloadCollaborators(true)} />
          )}

          {selectedId && selectedId !== '__avocat__' && <AdvancesPanel collaboratorId={selectedId} />}

          {/* Summary — modelul 50/50 din lib-ul de decont (aceleași cifre ca
              pagina colaboratorului); onorariul per comandă rămâne doar unde
              nu există breakdown (avocat). */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-slate-500"><ClipboardList className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Comenzi</span></div>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{summary.count}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-slate-500"><Wallet className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Încasări (cu TVA)</span></div>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{fmt(summary.revenue)} <span className="text-sm font-bold text-slate-400">RON</span></p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-slate-500"><Receipt className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">{summary.breakdown ? 'Taxe OCPI' : feeLabel}</span></div>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{fmt(summary.breakdown ? summary.breakdown.ocpiCosts : summary.fees)} <span className="text-sm font-bold text-slate-400">RON</span></p>
            </div>
            {summary.breakdown && (
              <div className="rounded-xl border border-primary-200 bg-primary-50 p-5">
                <div className="flex items-center gap-2 text-primary-700"><Wallet className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Partea fiecăruia (50% net)</span></div>
                <p className="mt-1 text-2xl font-extrabold text-secondary-900">{fmt(summary.breakdown.sharePerSide)} <span className="text-sm font-bold text-primary-700/60">RON</span></p>
              </div>
            )}
          </div>

          {/* Împărțeala 50/50 pas cu pas — sursa unică: lib/collaborator/settlement */}
          {summary.breakdown && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">Împărțeala 50/50 (perioada selectată)</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-4">
                {([
                  ['Net fără TVA', summary.breakdown.netOfVat],
                  ['− Taxe OCPI', -summary.breakdown.ocpiCosts],
                  ['− Comisioane Stripe', -summary.breakdown.stripeFees],
                  ['− Găzduire + programe', -summary.breakdown.platformCost],
                  ['− Provizion taxe nelucrate', -summary.breakdown.pendingOcpi],
                  ['Profit brut', summary.breakdown.grossProfit],
                  ['− Impozit profit 16%', -summary.breakdown.profitTax],
                  ['− Impozit dividende 16%', -summary.breakdown.dividendTax],
                  ['Net de distribuit', summary.breakdown.distributable],
                  ['Partea colaboratorului (50%)', summary.breakdown.sharePerSide],
                  ['− Comision facturat de el', -summary.breakdown.commission],
                  ['Rest de plată colaborator', summary.breakdown.collaboratorShare],
                  ['Partea eGhiseul', summary.breakdown.sharePerSide],
                ] as [string, number][]).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">{label}</span>
                    <span className="tabular-nums font-medium text-slate-900">
                      {value < 0 ? `−${fmt(Math.abs(value))}` : fmt(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders table */}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Comandă</th>
                  <th className="px-4 py-3">Serviciu</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Preț</th>
                  <th className="px-4 py-3 text-right">{summary.breakdown ? 'Taxă OCPI' : 'Onorariu'}</th>
                  <th className="px-4 py-3">Dată</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Nicio comandă în perioada selectată.</td></tr>
                ) : orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <a href={`/admin/orders/${o.id}`} className="text-primary-700 hover:underline">{o.friendlyOrderId}</a>
                      {o.isTest && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">TEST</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{o.service}</td>
                    <td className="px-4 py-3 text-slate-700">{o.client}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{findStatusLabel(o.status)}</span></td>
                    <td className="px-4 py-3 text-right text-slate-700">{fmt(o.total)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{summary.breakdown ? (o.ocpiCost > 0 ? fmt(o.ocpiCost) : '—') : fmt(o.fee)}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString('ro-RO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
