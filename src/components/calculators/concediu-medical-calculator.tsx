'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Concediu medical (OUG 158/2005) — actualizat 2026 (Legea 141/2025 progresiv +
 * OUG 91/2025 prima zi neplătită). Orientativ — vezi disclaimer.
 */
const CAP = 12 * 4050; // 12 salarii minime / lună

type LeaveKey = 'boala' | 'urgente' | 'grupa_a' | 'maternitate' | 'copil' | 'risc' | 'accident';
const LEAVES: { key: LeaveKey; label: string; pct: number | 'progresiv'; noCass?: boolean; noFirstDay?: boolean }[] = [
  { key: 'boala', label: 'Boală obișnuită', pct: 'progresiv' },
  { key: 'urgente', label: 'Urgențe medico-chirurgicale', pct: 100 },
  { key: 'grupa_a', label: 'Boli grupa A / TBC / cancer', pct: 100 },
  { key: 'maternitate', label: 'Sarcină și lăuzie (maternitate)', pct: 85 },
  { key: 'copil', label: 'Îngrijire copil bolnav', pct: 85 },
  { key: 'risc', label: 'Risc maternal', pct: 75 },
  { key: 'accident', label: 'Accident de muncă', pct: 80, noCass: true, noFirstDay: true },
];

const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(n);

export function ConcediuMedicalCalculator() {
  const [type, setType] = useState<LeaveKey>('boala');
  const [avgStr, setAvg] = useState('');
  const [workDays, setWorkDays] = useState('21');
  const [leaveDays, setLeaveDays] = useState('');
  const [episodeDays, setEpisodeDays] = useState('');

  const leave = LEAVES.find((l) => l.key === type)!;
  const avg = parseFloat(avgStr.replace(/[.\s]/g, '').replace(',', '.'));
  const wd = parseInt(workDays) || 21;
  const ld = parseInt(leaveDays) || 0;
  const ed = parseInt(episodeDays) || ld;
  const valid = !isNaN(avg) && avg > 0 && ld > 0;

  // procent
  let pct = typeof leave.pct === 'number' ? leave.pct : 55;
  if (leave.pct === 'progresiv') pct = ed >= 15 ? 75 : ed >= 8 ? 65 : 55;

  const dailyBase = valid ? Math.min(avg, CAP) / wd : 0;
  const payableDays = leave.noFirstDay ? ld : Math.max(0, ld - 1); // OUG 91/2025: prima zi neplătită
  const gross = valid ? Math.round(dailyBase * (pct / 100) * payableDays) : 0;
  const retineri = leave.noCass ? 0.1 : 0.2; // impozit 10% (+ CASS 10% dacă nu e accident)
  const net = Math.round(gross * (1 - retineri));

  return (
    <div>
      <div className="mb-4">
        <Label className="mb-1.5 block">Tipul concediului</Label>
        <div className="flex flex-wrap gap-2">
          {LEAVES.map((l) => (
            <button key={l.key} type="button" onClick={() => setType(l.key)}
              className={cn('px-3 py-2 rounded-full text-sm font-semibold border transition-all',
                type === l.key ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cm-avg" className="mb-1.5 block">Venit brut mediu lunar (ultimele 6 luni)</Label>
          <Input id="cm-avg" inputMode="numeric" value={avgStr} onChange={(e) => setAvg(e.target.value)} placeholder="ex. 5000" />
        </div>
        <div>
          <Label htmlFor="cm-wd" className="mb-1.5 block">Zile lucrătoare / lună</Label>
          <Input id="cm-wd" inputMode="numeric" value={workDays} onChange={(e) => setWorkDays(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="cm-ld" className="mb-1.5 block">Zile lucrătoare de concediu</Label>
          <Input id="cm-ld" inputMode="numeric" value={leaveDays} onChange={(e) => setLeaveDays(e.target.value)} placeholder="ex. 10" />
        </div>
        {leave.pct === 'progresiv' && (
          <div>
            <Label htmlFor="cm-ed" className="mb-1.5 block">Total zile în episodul de boală</Label>
            <Input id="cm-ed" inputMode="numeric" value={episodeDays} onChange={(e) => setEpisodeDays(e.target.value)} placeholder="pentru % progresiv" />
          </div>
        )}
      </div>

      {valid && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
              <p className="text-xs text-neutral-500 mb-1">Indemnizație netă (estimat)</p>
              <p className="text-2xl font-extrabold text-secondary-900">{fmt(net)} lei</p>
            </div>
            <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500 mb-1">Indemnizație brută</p>
              <p className="text-2xl font-extrabold text-secondary-900">{fmt(gross)} lei</p>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mt-3">
            Procent aplicat: <strong>{pct}%</strong> · zile plătite: <strong>{payableDays}</strong>
            {!leave.noFirstDay && ' (prima zi a episodului nu se plătește — OUG 91/2025)'}.
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Estimare orientativă. Baza de calcul e plafonată la 12 salarii minime/lună; din indemnizație
            se rețin impozit 10%{!leave.noCass && ' și CASS 10%'}. Reguli 2026 în curs de clarificare prin norme.
          </p>
        </div>
      )}
    </div>
  );
}
