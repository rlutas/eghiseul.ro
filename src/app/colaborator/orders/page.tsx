'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { findStatusLabel } from '@/lib/admin/status-options';
import { Download } from 'lucide-react';
import { usePreviewAs, withPreview } from '@/lib/collaborator/preview';
import { CERERE_CF_SLUG, CERERE_DONE_STATUSES } from '@/lib/ancpi/cerere-scope';
import { cereriForOrder, type PropertyLike } from '@/lib/ancpi/cereri-for-order';
import { cerereDateRo } from '@/lib/ancpi/cerere-date';

interface CollabOrder {
  id: string;
  friendly_order_id: string | null;
  status: string;
  created_at: string;
  service_id: string;
  // API-ul returnează DOAR datele de lucrare (property) — fără date de client.
  customer_data: { property?: PropertyLike | null } | null;
  services: { name: string; slug: string } | null;
}

/** Câte zile așteaptă clientul de la plată — coloana după care se prioritizează. */
function daysWaiting(createdAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000));
}

function propertyLocation(o: CollabOrder): string {
  const p = o.customer_data?.property;
  return [p?.locality, p?.county].filter(Boolean).join(', ') || '—';
}

export default function CollaboratorOrdersPage() {
  const previewAs = usePreviewAs();
  const [orders, setOrders] = useState<CollabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Așteaptă citirea `?as=` din URL înainte de fetch (altfel adminul ar primi 403).
    if (typeof window !== 'undefined' && !previewAs && window.location.search.includes('as=')) return;
    (async () => {
      try {
        const res = await fetch(withPreview('/api/collaborator/orders', previewAs));
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Eroare');
        setOrders(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Eroare la încărcare');
      } finally {
        setLoading(false);
      }
    })();
  }, [previewAs]);

  // Câte CERERI are de depus, nu câte comenzi: o comandă cu mai multe imobile
  // înseamnă mai multe cereri, iar el numără hârtii, nu comenzi.
  const deDepus = orders
    .filter((o) => o.services?.slug === CERERE_CF_SLUG && !CERERE_DONE_STATUSES.includes(o.status as never))
    .flatMap((o) =>
      cereriForOrder(
        { friendly_order_id: o.friendly_order_id ?? o.id, customer_data: o.customer_data },
        cerereDateRo()
      )
    );
  const cfDeDepus = deDepus.length;
  const deVerificat = deDepus.filter((c) => c.name.startsWith('verifica ')).length;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Comenzi</h1>
      <p className="mb-6 text-sm text-slate-500">
        Comenzile serviciilor alocate ție, cele mai vechi primele — clientul care așteaptă de cel mai
        mult timp are prioritate.
      </p>

      {cfDeDepus > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4">
          <div>
            <p className="text-sm font-semibold text-secondary-900">
              {cfDeDepus} {cfDeDepus === 1 ? 'cerere de depus' : 'cereri de depus'} la OCPI
            </p>
            <p className="text-xs text-slate-600">
              Completate și denumite după nr. CF, UAT și județ — le semnezi și le depui.
            </p>
            {deVerificat > 0 && (
              <p className="mt-1 text-xs text-amber-700">
                {deVerificat} {deVerificat === 1 ? 'cerere are' : 'cereri au'} numărul de carte funciară
                neobișnuit (carte veche sau text liber) — denumirea începe cu &bdquo;verifica&rdquo;, deschide-le.
              </p>
            )}
          </div>
          <a
            href={withPreview('/api/collaborator/cereri', previewAs)}
            className="inline-flex items-center gap-2 rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
          >
            <Download className="h-4 w-4" /> Descarcă toate cererile (ZIP)
          </a>
        </div>
      )}

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
                <th className="px-4 py-3">Așteaptă</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={withPreview(`/colaborator/orders/${o.id}`, previewAs)} className="font-medium text-primary-700 hover:underline">
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
                  <td className="px-4 py-3">
                    {(() => {
                      const zile = daysWaiting(o.created_at);
                      const tone = zile >= 21 ? 'bg-red-100 text-red-800'
                        : zile >= 7 ? 'bg-amber-100 text-amber-800'
                        : 'text-slate-500';
                      return (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
                          {zile === 0 ? 'azi' : `${zile} zile`}
                        </span>
                      );
                    })()}
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
