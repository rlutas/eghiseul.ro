'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Wallet, ClipboardList } from 'lucide-react';
import { findStatusLabel } from '@/lib/admin/status-options';

interface EarningOrder {
  id: string;
  friendlyOrderId: string;
  service: string;
  locality: string;
  status: string;
  paidAt: string | null;
  fee: number;
  isTest: boolean;
}

interface EarningsData {
  month: string | null;
  orders: EarningOrder[];
  summary: { count: number; totalFees: number };
}

/** Last 12 months as YYYY-MM options, newest first. */
function monthOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  for (let i = 0; i < 12; i++) {
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const value = `${y}-${String(m).padStart(2, '0')}`;
    const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('ro-RO', {
      month: 'long',
      year: 'numeric',
    });
    out.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    d.setUTCMonth(d.getUTCMonth() - 1);
  }
  return out;
}

export default function CollaboratorDecontPage() {
  const months = useMemo(monthOptions, []);
  const [month, setMonth] = useState(months[0]!.value);
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/collaborator/earnings?month=${month}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Eroare');
        setData(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Eroare la încărcare');
      } finally {
        setLoading(false);
      }
    })();
  }, [month]);

  const summary = data?.summary ?? { count: 0, totalFees: 0 };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-semibold text-slate-900">Decont lunar</h1>
          <p className="text-sm text-slate-500">
            Comenzile plătite din serviciile tale și onorariul aferent, pe luna selectată.
          </p>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase text-slate-400">
            <ClipboardList className="h-4 w-4" /> Comenzi plătite
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '…' : summary.count}</p>
        </div>
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 sm:p-5">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase text-primary-700">
            <Wallet className="h-4 w-4" /> Onorariu total
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            {loading ? '…' : `${summary.totalFees.toFixed(2)} RON`}
          </p>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && (data?.orders.length ?? 0) === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Nicio comandă plătită în luna selectată.
        </div>
      )}

      {!loading && (data?.orders.length ?? 0) > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Comandă</th>
                <th className="px-4 py-3">Serviciu</th>
                <th className="px-4 py-3">Localitate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Plătită la</th>
                <th className="px-4 py-3 text-right">Onorariu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data!.orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/colaborator/orders/${o.id}`} className="font-medium text-primary-700 hover:underline">
                      {o.friendlyOrderId}
                    </Link>
                    {o.isTest && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] uppercase text-amber-700">test</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{o.service}</td>
                  <td className="px-4 py-3 text-slate-700">{o.locality}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {findStatusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {o.paidAt ? new Date(o.paidAt).toLocaleDateString('ro-RO') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {o.isTest ? '—' : `${o.fee.toFixed(2)} RON`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Onorariul se calculează per comandă plătită (luna plății), fără comenzile anulate,
        rambursate sau de test. Decontarea se face la sfârșitul lunii.
      </p>
    </div>
  );
}
