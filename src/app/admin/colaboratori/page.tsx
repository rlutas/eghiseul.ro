'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Users, ClipboardList, Wallet, Receipt, ListChecks } from 'lucide-react';
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

export default function CollaboratorsAdminPage() {
  const { hasPermission } = useAdminPermissions();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [month, setMonth] = useState('');
  const [orders, setOrders] = useState<CollabOrder[]>([]);
  const [summary, setSummary] = useState<Summary>({ count: 0, revenue: 0, fees: 0 });
  const [loading, setLoading] = useState(true);
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
    reloadCollaborators();
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

          {/* Service assignments — users.manage only */}
          {hasPermission('users.manage') && selectedId && (
            <ServiceAssignments collaboratorId={selectedId} onChanged={() => reloadCollaborators(true)} />
          )}

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
              <div className="flex items-center gap-2 text-slate-500"><Receipt className="h-4 w-4" /><span className="text-xs uppercase tracking-wide">{feeLabel}</span></div>
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
