'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { findStatusLabel } from '@/lib/admin/status-options';

interface CollabOrder {
  id: string;
  friendly_order_id: string | null;
  status: string;
  created_at: string;
  service_id: string;
  // API-ul returnează DOAR datele de lucrare (property) — fără date de client.
  customer_data: { property?: { county?: string; locality?: string } | null } | null;
  services: { name: string; slug: string } | null;
}

function propertyLocation(o: CollabOrder): string {
  const p = o.customer_data?.property;
  return [p?.locality, p?.county].filter(Boolean).join(', ') || '—';
}

export default function CollaboratorOrdersPage() {
  const [orders, setOrders] = useState<CollabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/collaborator/orders');
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Eroare');
        setOrders(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Eroare la încărcare');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Comenzi</h1>
      <p className="mb-6 text-sm text-slate-500">Comenzile serviciilor alocate ție.</p>

      {loading && <p className="text-sm text-slate-500">Se încarcă...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Nicio comandă încă.
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Comandă</th>
                <th className="px-4 py-3">Serviciu</th>
                <th className="px-4 py-3">Localitate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dată</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/colaborator/orders/${o.id}`} className="font-medium text-primary-700 hover:underline">
                      {o.friendly_order_id || o.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{o.services?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{propertyLocation(o)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {findStatusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(o.created_at).toLocaleDateString('ro-RO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
