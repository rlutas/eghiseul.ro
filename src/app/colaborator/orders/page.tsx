'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { findStatusLabel } from '@/lib/admin/status-options';
import { Download } from 'lucide-react';
import { usePreviewAs, withPreview } from '@/lib/collaborator/preview';
import { CERERE_DONE_STATUSES } from '@/lib/ancpi/cerere-scope';
import { cereriForOrderSlug, type PropertyLike } from '@/lib/ancpi/cereri-for-order';
import { cerereDateRo } from '@/lib/ancpi/cerere-date';

interface CollabOrder {
  id: string;
  friendly_order_id: string | null;
  status: string;
  created_at: string;
  /** >0 = urcată în capul listei de echipă (client nemulțumit, termen ratat). */
  priority: number | null;
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

/** Grupele după care filtrează: unde e lucrarea în drumul ei. */
type Etapa = 'toate' | 'de_depus' | 'depuse' | 'livrate';

function etapaOf(status: string): Exclude<Etapa, 'toate'> {
  if (CERERE_DONE_STATUSES.includes(status as never)) return 'livrate';
  if (status === 'submitted_to_institution') return 'depuse';
  return 'de_depus';
}

/** Fold pentru căutare: fără diacritice, lowercase. */
function fold(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function CollaboratorOrdersPage() {
  const previewAs = usePreviewAs();
  const [orders, setOrders] = useState<CollabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<Etapa>('de_depus');
  const [judet, setJudet] = useState('');
  const [cauta, setCauta] = useState('');

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
  // cereriForOrderSlug acoperă acum și plan cadastral + identificările cu
  // CF raportat — exact ce intră și în ZIP.
  const deDepus = orders
    .filter((o) => !CERERE_DONE_STATUSES.includes(o.status as never))
    .flatMap((o) =>
      cereriForOrderSlug(
        { friendly_order_id: o.friendly_order_id ?? o.id, customer_data: o.customer_data },
        o.services?.slug,
        cerereDateRo()
      )
    );
  const cfDeDepus = deDepus.length;
  const deVerificat = deDepus.filter((c) => c.name.startsWith('verifica ')).length;

  const judete = useMemo(
    () => [...new Set(orders.map((o) => o.customer_data?.property?.county).filter(Boolean))].sort() as string[],
    [orders]
  );

  // Filtrarea e locală: API-ul întoarce deja doar lucrările lui, iar așa
  // comutarea e instantanee. Ordinea (cea mai veche prima) vine de la API.
  const vizibile = useMemo(() => {
    const q = fold(cauta.trim());
    return orders.filter((o) => {
      if (etapa !== 'toate' && etapaOf(o.status) !== etapa) return false;
      if (judet && o.customer_data?.property?.county !== judet) return false;
      if (!q) return true;
      const p = o.customer_data?.property;
      const haystack = fold(
        [o.friendly_order_id, p?.locality, p?.county, p?.carteFunciara, p?.cadastral, o.services?.name]
          .filter(Boolean)
          .join(' ')
      );
      return haystack.includes(q);
    });
  }, [orders, etapa, judet, cauta]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Comenzi</h1>
      <p className="mb-6 text-sm text-slate-500">
        Comenzile serviciilor alocate ție: marcate <span className="font-semibold text-red-600">Urgent</span>{' '}
        primele, apoi cele mai vechi — clientul care așteaptă de cel mai mult timp are prioritate.
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
            href={withPreview(
              judet ? `/api/collaborator/cereri?judet=${encodeURIComponent(judet)}` : '/api/collaborator/cereri',
              previewAs
            )}
            className="inline-flex items-center gap-2 rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800"
          >
            <Download className="h-4 w-4" />
            {judet ? `Descarcă cererile pentru ${judet} (ZIP)` : 'Descarcă toate cererile (ZIP)'}
          </a>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {([
              ['de_depus', 'De depus'],
              ['depuse', 'Depuse la OCPI'],
              ['livrate', 'Livrate'],
              ['toate', 'Toate'],
            ] as [Etapa, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setEtapa(value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  etapa === value ? 'bg-primary-700 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={judet}
            onChange={(e) => setJudet(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="">Toate județele</option>
            {judete.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>

          <input
            value={cauta}
            onChange={(e) => setCauta(e.target.value)}
            placeholder="Caută nr. comandă, CF, localitate..."
            className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />

          <span className="text-xs text-slate-500">
            {vizibile.length} din {orders.length}
          </span>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Se încarcă...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Nicio comandă încă.
        </div>
      )}

      {!loading && orders.length > 0 && vizibile.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Nicio comandă pentru filtrul ales.
        </div>
      )}

      {!loading && vizibile.length > 0 && (
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
              {vizibile.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={withPreview(`/colaborator/orders/${o.id}`, previewAs)} className="font-medium text-primary-700 hover:underline">
                      {o.friendly_order_id || o.id.slice(0, 8)}
                    </Link>
                    {(o.priority ?? 0) > 0 && (
                      <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Urgent
                      </span>
                    )}
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
