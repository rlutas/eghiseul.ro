'use client';

import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

interface CollabService {
  id: string;
  name: string;
  slug: string;
  clientPrice: number;
  fee: number;
}

export default function CollaboratorServicesPage() {
  const [services, setServices] = useState<CollabService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/collaborator/services');
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Eroare');
        setServices(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Eroare la încărcare');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Serviciile mele</h1>
      <p className="mb-6 text-sm text-slate-500">
        Serviciile alocate ție, prețul plătit de client și onorariul tău per comandă
        (apare pe factură ca &bdquo;Onorariu Topograf&rdquo;).
      </p>

      {loading && <p className="text-sm text-slate-500">Se încarcă...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && services.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Niciun serviciu alocat încă.
        </div>
      )}

      {!loading && services.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Serviciu</span>
                </th>
                <th className="px-4 py-3 text-right">Preț client</th>
                <th className="px-4 py-3 text-right">Onorariul tău</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{s.clientPrice.toFixed(2)} RON</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{s.fee.toFixed(2)} RON</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Onorariul se decontează lunar, per comandă plătită — vezi pagina &bdquo;Decont lunar&rdquo;.
        Comenzile de identificare imobil sunt lucrate de echipa internă; primești doar
        pe cele trimise explicit către tine (primești email când se întâmplă).
      </p>
    </div>
  );
}
