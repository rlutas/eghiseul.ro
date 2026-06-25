'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Users, ClipboardList, Wallet, Receipt } from 'lucide-react';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';
import { findStatusLabel } from '@/lib/admin/status-options';

interface Collaborator {
  id: string;
  name: string;
  email: string;
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
  isTest: boolean;
  createdAt: string;
}
interface Summary { count: number; revenue: number; fees: number }

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

export default function CollaboratorsAdminPage() {
  const { hasPermission } = useAdminPermissions();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [month, setMonth] = useState('');
  const [orders, setOrders] = useState<CollabOrder[]>([]);
  const [summary, setSummary] = useState<Summary>({ count: 0, revenue: 0, fees: 0 });
  const [loading, setLoading] = useState(true);
  const months = useMemo(() => monthOptions(), []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/collaborators');
      const json = await res.json();
      if (json.success) {
        setCollaborators(json.data);
        if (json.data.length) setSelectedId(json.data[0].id);
      }
      setLoading(false);
    })();
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

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-primary-600" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Colaboratori</h1>
          <p className="text-sm text-slate-500">Comenzile și onorariile colaboratorilor (topograf, etc.).</p>
        </div>
      </div>

      {loading ? (
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
            <a
              href={exportUrl}
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Download className="h-4 w-4" /> Export CSV/TSV
            </a>
          </div>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-slate-500"><ClipboardList className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Comenzi</span></div>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{summary.count}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-slate-500"><Wallet className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Încasări (cu TVA)</span></div>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{fmt(summary.revenue)} <span className="text-sm font-bold text-slate-400">RON</span></p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-slate-500"><Receipt className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">Onorariu topograf</span></div>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{fmt(summary.fees)} <span className="text-sm font-bold text-slate-400">RON</span></p>
            </div>
          </div>

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
                  <th className="px-4 py-3 text-right">Onorariu</th>
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
                    <td className="px-4 py-3 text-right text-slate-700">{fmt(o.fee)}</td>
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
