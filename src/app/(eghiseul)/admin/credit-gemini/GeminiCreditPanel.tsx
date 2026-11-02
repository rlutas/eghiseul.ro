'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GeminiCreditSummary, UsageBucket } from '@/lib/ai/gemini-credit';

const FEATURE_LABEL: Record<string, string> = {
  ocr_ci_front: 'CI față',
  ocr_ci_back: 'CI verso',
  ocr_ci_nou_back: 'CI nou verso',
  ocr_passport_opened: 'Pașaport deschis',
  ocr_passport: 'Pașaport',
  ocr_ro_cei_pdf: 'PDF RO CEI',
  ocr_auto_detect: 'Detectare tip act',
  kyc_ci_front: 'Verificare CI față',
  kyc_ci_back: 'Verificare CI verso',
  kyc_selfie: 'Verificare selfie',
  ancpi_receipt_amount: 'Chitanță ANCPI (sumă)',
  health_probe: 'Test orar',
};

const PLATFORM_LABEL: Record<string, string> = {
  eghiseul: 'eghiseul + documentero',
  cjo: 'CJO',
  ecazier: 'ecazier',
};

function usd(n: number | null | undefined, digits = 2) {
  if (n == null || !Number.isFinite(n)) return '—';
  return `$${n.toFixed(digits)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function todayYmd() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest' }).format(new Date());
}

function BucketCells({ b }: { b: UsageBucket | undefined }) {
  return (
    <>
      <TableCell className="text-right tabular-nums">{b?.calls ?? 0}</TableCell>
      <TableCell className="text-right tabular-nums">{b?.errors ? <span className="text-red-600">{b.errors}</span> : 0}</TableCell>
      <TableCell className="text-right tabular-nums">{usd(b?.cost ?? 0, 3)}</TableCell>
    </>
  );
}

function BreakdownTable({
  title,
  windows,
  dimension,
  label,
}: {
  title: string;
  windows: GeminiCreditSummary['windows'];
  dimension: 'byPlatform' | 'byFeature';
  label: (k: string) => string;
}) {
  const keys = Array.from(
    new Set([
      ...Object.keys(windows.d30[dimension]),
      ...Object.keys(windows.d7[dimension]),
      ...Object.keys(windows.today[dimension]),
    ])
  ).sort((a, b) => (windows.d30[dimension][b]?.cost ?? 0) - (windows.d30[dimension][a]?.cost ?? 0));
  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b px-4 py-2 font-medium">{title}</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2}></TableHead>
            <TableHead colSpan={3} className="text-center">Azi</TableHead>
            <TableHead colSpan={3} className="text-center">7 zile</TableHead>
            <TableHead colSpan={3} className="text-center">30 zile</TableHead>
          </TableRow>
          <TableRow>
            {['today', 'd7', 'd30'].flatMap((w) => [
              <TableHead key={`${w}-c`} className="text-right">Apeluri</TableHead>,
              <TableHead key={`${w}-e`} className="text-right">Erori</TableHead>,
              <TableHead key={`${w}-$`} className="text-right">Cost</TableHead>,
            ])}
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="py-6 text-center text-neutral-500">
                Niciun apel înregistrat încă.
              </TableCell>
            </TableRow>
          )}
          {keys.map((k) => (
            <TableRow key={k}>
              <TableCell className="font-medium">{label(k)}</TableCell>
              <BucketCells b={windows.today[dimension][k]} />
              <BucketCells b={windows.d7[dimension][k]} />
              <BucketCells b={windows.d30[dimension][k]} />
            </TableRow>
          ))}
          {keys.length > 0 && (
            <TableRow className="bg-neutral-50 font-medium">
              <TableCell>Total</TableCell>
              <BucketCells b={windows.today.total} />
              <BucketCells b={windows.d7.total} />
              <BucketCells b={windows.d30.total} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function GeminiCreditPanel() {
  const [data, setData] = useState<GeminiCreditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayYmd());
  const [note, setNote] = useState('');
  const [threshold, setThreshold] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gemini-credit', { cache: 'no-store' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Eroare');
      setData(json.data);
      setThreshold(String(json.data.settings.alert_below_usd));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nu am putut încărca datele');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const post = async (payload: Record<string, unknown>, okMsg: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/gemini-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Salvarea a eșuat');
      toast.success(okMsg);
      await load();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Salvarea a eșuat');
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
      </div>
    );
  }
  if (!data) return <p className="text-sm text-red-600">Nu am putut încărca datele.</p>;

  const noTopups = data.settings.topups.length === 0;
  const lastOk = data.lastCall?.ok ?? null;
  const daysLeft = data.daysLeft;

  return (
    <div className="space-y-6">
      {noTopups && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" /> Lipsește suma încărcată în AI Studio
          </div>
          <p className="mt-1">
            Fără ea nu putem estima cât credit a rămas. Trece mai jos suma (în dolari) alimentată pe 02.11.2026 — o
            găsești în AI Studio → Billing — și data ei. De atunci încolo, costul fiecărei citiri se scade automat.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-neutral-500">Stare</div>
          {data.lastCall ? (
            <div className={`mt-1 flex items-center gap-2 font-semibold ${lastOk ? 'text-green-700' : 'text-red-700'}`}>
              {lastOk ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {lastOk ? 'Funcționează' : 'Ultimul apel a eșuat'}
            </div>
          ) : (
            <div className="mt-1 font-semibold text-neutral-500">Niciun apel înregistrat</div>
          )}
          {data.lastCall && (
            <div className="mt-1 text-xs text-neutral-500">
              Ultimul apel: {fmtDate(data.lastCall.at)} ({PLATFORM_LABEL[data.lastCall.platform] ?? data.lastCall.platform})
            </div>
          )}
          {data.lastError && (
            <div className="mt-1 text-xs text-red-600">
              Ultima eroare: {fmtDate(data.lastError.at)} — {data.lastError.error_code ?? data.lastError.http_status ?? 'necunoscută'} (
              {FEATURE_LABEL[data.lastError.feature] ?? data.lastError.feature})
            </div>
          )}
        </div>

        <div className={`rounded-lg border p-4 ${data.lowCredit ? 'border-red-300 bg-red-50' : 'bg-white'}`}>
          <div className="text-sm text-neutral-500">Credit rămas (estimat)</div>
          <div className={`mt-1 text-3xl font-bold tabular-nums ${data.lowCredit ? 'text-red-700' : ''}`}>
            {noTopups ? '—' : usd(data.remaining)}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {noTopups
              ? 'Adaugă alimentarea ca să apară estimarea.'
              : `Alimentat ${usd(data.topupsTotal)} din ${data.firstTopupDate?.split('-').reverse().join('.')} · consumat ${usd(data.spentSinceFirstTopup, 3)}`}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-neutral-500">Ajunge pentru</div>
          <div className="mt-1 text-3xl font-bold tabular-nums">
            {noTopups ? '—' : daysLeft == null ? '∞' : `${Math.floor(daysLeft)} zile`}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Consum mediu ultimele 7 zile: {usd(data.burnPerDay7d, 3)}/zi
          </div>
        </div>
      </div>

      {data.sources.some((s) => !s.ok) && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
          {data.sources
            .filter((s) => !s.ok)
            .map((s) => (
              <div key={s.platform}>
                {PLATFORM_LABEL[s.platform] ?? s.platform}: {s.note}
              </div>
            ))}
        </div>
      )}

      <BreakdownTable
        title="Pe site"
        windows={data.windows}
        dimension="byPlatform"
        label={(k) => PLATFORM_LABEL[k] ?? k}
      />
      <BreakdownTable
        title="Pe tip de citire"
        windows={data.windows}
        dimension="byFeature"
        label={(k) => FEATURE_LABEL[k] ?? k}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <form
          className="space-y-3 rounded-lg border bg-white p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await post(
              { action: 'add_topup', amount_usd: Number(amount.replace(',', '.')), date, note },
              'Alimentare salvată'
            );
            if (ok) {
              setAmount('');
              setNote('');
            }
          }}
        >
          <div className="font-medium">Adaugă alimentare</div>
          <p className="text-xs text-neutral-500">
            După ce plătești în AI Studio, trece aici suma exactă în dolari, ca atunci când apare pe factura Google.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="topup-amount">Sumă (USD)</Label>
              <Input
                id="topup-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="ex. 25"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="topup-date">Data</Label>
              <Input id="topup-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="topup-note">Notă (opțional)</Label>
            <Input id="topup-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
          </div>
          <Button type="submit" disabled={saving || !amount}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvează alimentarea
          </Button>
        </form>

        <div className="space-y-3 rounded-lg border bg-white p-4">
          <form
            className="space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await post({ action: 'set_threshold', alert_below_usd: Number(threshold.replace(',', '.')) }, 'Prag salvat');
            }}
          >
            <div className="font-medium">Alertă pe email</div>
            <p className="text-xs text-neutral-500">
              Primești un email o singură dată când creditul estimat scade sub prag sau ajunge pentru mai puțin de 7
              zile. O alimentare nouă repornește alerta.
            </p>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="threshold">Prag (USD)</Label>
                <Input
                  id="threshold"
                  inputMode="decimal"
                  className="w-32"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" disabled={saving}>
                Salvează pragul
              </Button>
            </div>
          </form>

          <div>
            <div className="mb-1 text-sm font-medium">Alimentări înregistrate</div>
            {noTopups ? (
              <p className="text-sm text-neutral-500">Niciuna încă.</p>
            ) : (
              <ul className="divide-y text-sm">
                {data.settings.topups.map((t, i) => (
                  <li key={`${t.date}-${i}`} className="flex items-center justify-between py-1.5">
                    <span>
                      {t.date.split('-').reverse().join('.')} — <strong>{usd(t.amount_usd)}</strong>
                      {t.note ? <span className="text-neutral-500"> · {t.note}</span> : null}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={saving}
                      aria-label="Șterge alimentarea"
                      onClick={() => {
                        if (confirm('Ștergi această alimentare? Estimarea se recalculează.')) {
                          void post({ action: 'remove_topup', index: i }, 'Alimentare ștearsă');
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Estimarea folosește prețurile publice Google (gemini-2.5-flash-lite: $0,10 / $0,40 pe 1M tokeni intrare /
        ieșire; gemini-2.5-flash: $0,30 / $2,50). Pot exista mici diferențe față de AI Studio, care rămâne sursa
        exactă — verifică-l lunar și corectează alimentările dacă e nevoie.
      </p>
    </div>
  );
}
