'use client';

/**
 * /admin/decontari/facturi-furnizori — checklist lunar pentru facturile care
 * NU vin prin SPV (Meta, Google, TikTok, OpenAI, Anthropic, Vercel…).
 * Un rând pe furnizor × lună, 3 bife: descărcată → listată → predată
 * contabilului, fiecare cu cine și când. Stânga: istoricul lunilor.
 */
import { Fragment, Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronRight, FileCheck2, StickyNote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface StepState { at: string; by: string }
interface Supplier {
  key: string;
  label: string;
  where: string | null;
  count: number;
  total_bani: number;
  payments: Array<{ reference: string; tx_date: string; debit_bani: number; description: string | null }>;
  downloaded: StepState | null;
  printed: StepState | null;
  handed: StepState | null;
  note: string | null;
}
interface MonthRow { month: string; suppliers: number; handed: number; total_bani: number }

type Step = 'downloaded' | 'printed' | 'handed';
const STEPS: Array<{ key: Step; label: string }> = [
  { key: 'downloaded', label: 'Descărcată' },
  { key: 'printed', label: 'Listată' },
  { key: 'handed', label: 'Predată contabil' },
];

const ron = (bani: number) =>
  (bani / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MONTHS_RO = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
const monthLabel = (m: string) => {
  const [y, mm] = m.split('-').map(Number);
  return `${MONTHS_RO[mm - 1]} ${y}`;
};
/** Data plății la POS și suma în valuta originală, ca pe factura furnizorului. */
const posDetails = (desc: string | null) => {
  const d = desc ?? '';
  const date = d.match(/\bE?POS (\d{2}\/\d{2}\/\d{4})/)?.[1]?.replace(/\//g, '.') ?? null;
  const amount = d.match(/valoare tranzactie: ([\d.]+ [A-Z]{3})/)?.[1] ?? null;
  return { date, amount };
};
const when = (iso: string) =>
  new Date(iso).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function FacturiFurnizoriPage() {
  // useSearchParams cere Suspense la randarea statică.
  return (
    <Suspense fallback={null}>
      <FacturiFurnizori />
    </Suspense>
  );
}

function FacturiFurnizori() {
  const router = useRouter();
  const params = useSearchParams();
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [month, setMonth] = useState<string>(params.get('month') ?? '');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const loadMonths = useCallback(async () => {
    const res = await fetch('/api/admin/decontari/facturi-furnizori');
    const json = await res.json();
    if (!json.success) return toast.error(json.error);
    setMonths(json.data.months);
    // Fără lună în URL: deschide cea mai veche lună cu restanțe, altfel ultima.
    setMonth((cur) => {
      if (cur) return cur;
      const list: MonthRow[] = json.data.months;
      const pending = [...list].reverse().find((m) => m.handed < m.suppliers);
      return (pending ?? list[0])?.month ?? '';
    });
  }, []);

  const loadMonth = useCallback(async () => {
    if (!month) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/decontari/facturi-furnizori?month=${month}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSuppliers(json.data.suppliers);
    } catch (err) {
      toast.error(`Eroare la încărcare: ${err instanceof Error ? err.message : err}`);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { loadMonths(); }, [loadMonths]);
  useEffect(() => { loadMonth(); }, [loadMonth]);

  const pick = (m: string) => {
    setMonth(m);
    setOpen(null);
    router.replace(`/admin/decontari/facturi-furnizori?month=${m}`, { scroll: false });
  };

  const save = async (supplierKey: string, payload: Record<string, unknown>) => {
    setSaving(supplierKey);
    try {
      const res = await fetch('/api/admin/decontari/facturi-furnizori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, supplier_key: supplierKey, ...payload }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await Promise.all([loadMonth(), loadMonths()]);
    } catch (err) {
      toast.error(`Nu s-a salvat: ${err instanceof Error ? err.message : err}`);
    } finally {
      setSaving(null);
    }
  };

  const toggle = (s: Supplier, step: Step) => {
    const done = !s[step];
    if (!done && !confirm(`Debifezi „${STEPS.find((x) => x.key === step)?.label}” la ${s.label}?`)) return;
    save(s.key, { step, done });
  };

  const editNote = (s: Supplier) => {
    const note = prompt(`Notă pentru ${s.label} (ex. „lipsește factura din 12.09”):`, s.note ?? '');
    if (note === null) return;
    save(s.key, { note });
  };

  const current = months.find((m) => m.month === month);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/admin/decontari" className="inline-flex items-center text-sm text-neutral-600 hover:text-secondary-900 mb-1">
          <ArrowLeft className="h-4 w-4 mr-1" /> Decontări
        </Link>
        <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
          <FileCheck2 className="h-6 w-6 text-primary-600" /> Facturi furnizori pentru contabil
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Plățile cu cardul la furnizori care NU trimit factura în SPV (Meta, Google, TikTok, OpenAI, Anthropic, Vercel…).
          Lista se face singură din extrasul importat în{' '}
          <Link href="/admin/decontari/banca" className="underline">Extras bancă</Link>.
          Pentru fiecare furnizor: descarcă factura din contul lui, list-o, predă-o contabilului.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Istoric pe luni */}
        <Card className="h-fit">
          <CardContent className="p-2">
            {months.length === 0 && <p className="p-3 text-sm text-neutral-500">Niciun extras importat.</p>}
            {months.map((m) => {
              const complete = m.handed === m.suppliers;
              return (
                <button
                  key={m.month}
                  onClick={() => pick(m.month)}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm flex items-center justify-between gap-2 ${m.month === month ? 'bg-primary-50 font-semibold' : 'hover:bg-neutral-50'}`}
                >
                  <span className="capitalize">{monthLabel(m.month)}</span>
                  <Badge className={complete ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                    {complete ? '✓ complet' : `${m.handed}/${m.suppliers}`}
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {current && (
            <p className="text-sm text-neutral-700">
              <span className="font-semibold capitalize">{monthLabel(current.month)}</span>: {current.suppliers} furnizori ·{' '}
              {ron(current.total_bani)} lei · <span className={current.handed === current.suppliers ? 'text-green-700' : 'text-amber-700'}>
                {current.handed} predați contabilului
              </span>
            </p>
          )}

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              {loading && suppliers.length === 0 ? (
                <p className="p-10 text-center text-neutral-500">Se încarcă…</p>
              ) : suppliers.length === 0 ? (
                <p className="p-10 text-center text-neutral-500">Nicio plată la furnizori fără SPV în luna asta.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-neutral-50 text-left text-neutral-600">
                      <th className="px-3 py-2 font-medium">Furnizor</th>
                      <th className="px-3 py-2 font-medium text-right">Plăți</th>
                      <th className="px-3 py-2 font-medium text-right">Total lei</th>
                      {STEPS.map((st) => <th key={st.key} className="px-3 py-2 font-medium text-center whitespace-nowrap">{st.label}</th>)}
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s) => {
                      const isOpen = open === s.key;
                      const rowCls = s.handed ? 'bg-green-50/50' : '';
                      return (
                        <Fragment key={s.key}>
                          <tr className={`border-b ${rowCls}`}>
                            <td className="px-3 py-2">
                              <button onClick={() => setOpen(isOpen ? null : s.key)} className="flex items-start gap-1 text-left">
                                {isOpen ? <ChevronDown className="h-4 w-4 mt-0.5 shrink-0" /> : <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />}
                                <span>
                                  <span className="font-medium">{s.label}</span>
                                  {s.note && <span className="block text-xs text-amber-700">📝 {s.note}</span>}
                                </span>
                              </button>
                            </td>
                            <td className="px-3 py-2 text-right">{s.count}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{ron(s.total_bani)}</td>
                            {STEPS.map((st) => {
                              const v = s[st.key];
                              return (
                                <td key={st.key} className="px-3 py-2 text-center">
                                  <label className="inline-flex flex-col items-center gap-0.5 cursor-pointer" title={v ? `${v.by} · ${when(v.at)}` : 'Nebifat'}>
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 accent-green-600"
                                      checked={!!v}
                                      disabled={saving === s.key}
                                      onChange={() => toggle(s, st.key)}
                                    />
                                    {v && <span className="text-[10px] leading-tight text-neutral-500 whitespace-nowrap">{v.by.split(' ')[0]} · {new Date(v.at).toLocaleDateString('ro-RO')}</span>}
                                  </label>
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-right">
                              <button onClick={() => editNote(s)} title="Notă" className="text-neutral-500 hover:text-secondary-900">
                                <StickyNote className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                          {isOpen && (
                            <tr className="border-b bg-neutral-50">
                              <td colSpan={7} className="px-8 py-3">
                                {s.where && <p className="text-xs text-neutral-600 mb-2">Unde găsești facturile: <span className="font-medium">{s.where}</span></p>}
                                <ul className="text-xs space-y-0.5">
                                  {s.payments.map((p) => {
                                    const pos = posDetails(p.description);
                                    return (
                                      <li key={p.reference} className="grid grid-cols-[110px_120px_1fr] gap-3 max-w-lg">
                                        <span title="Data plății cu cardul (pe factură)">{pos.date ?? p.tx_date.split('-').reverse().join('.')}</span>
                                        <span className="font-medium text-right">{ron(p.debit_bani)} lei</span>
                                        <span className="text-neutral-500">{pos.amount && !pos.amount.endsWith('RON') ? pos.amount : ''}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
