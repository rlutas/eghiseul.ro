'use client';

import { useState } from 'react';

interface Parcel { cf: string | null; immovableId: string | null; inspireId: string | null }
interface LookupData {
  found: boolean;
  reason?: string;
  geocoded?: { address: string; score: number; type?: string | null; x?: number; y?: number };
  parcels?: Parcel[];
}

/**
 * Operator tool: identify an immovable from a free-text address via the public
 * ANCPI geoportal (geocode → parcel CF). The geoportal is flaky, so we retry a
 * few times client-side. For apartments this finds the building parcel — a
 * starting point for manual research.
 */
export function IdentificaImobilTool() {
  const [judet, setJudet] = useState('');
  const [localitate, setLocalitate] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [res, setRes] = useState<LookupData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true); setErr(null); setRes(null);
    const params = new URLSearchParams({ address, localitate, judet });
    // The geoportal 502s in waves → retry a few times before giving up.
    for (let i = 1; i <= 5; i++) {
      setAttempt(i);
      try {
        const r = await fetch(`/api/ancpi/lookup/?${params}`, { cache: 'no-store' });
        const j = await r.json();
        if (j.success) {
          const d = j.data as LookupData;
          // Keep retrying only when ANCPI was unavailable (not on a real "no parcel").
          if (d.found || d.reason !== 'ancpi_unavailable' || i === 5) { setRes(d); break; }
        } else {
          setErr(j.error || 'Eroare'); break;
        }
      } catch (e) {
        if (i === 5) setErr(e instanceof Error ? e.message : 'Eroare');
      }
      await new Promise((s) => setTimeout(s, 1500));
    }
    setBusy(false); setAttempt(0);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={judet} onChange={(e) => setJudet(e.target.value)} placeholder="Județ (ex: Satu Mare)"
          className="rounded border border-neutral-300 px-3 py-2 text-sm" />
        <input value={localitate} onChange={(e) => setLocalitate(e.target.value)} placeholder="Localitate (ex: Odoreu)"
          className="rounded border border-neutral-300 px-3 py-2 text-sm" />
      </div>
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresă (stradă + nr., ex: Strada Salcâmilor 2)"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm" />
      <button type="button" onClick={run} disabled={busy || (!address && !localitate)}
        className="rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
        {busy ? `Se caută… (încercarea ${attempt})` : '🔍 Identifică imobil'}
      </button>

      {err && <div className="rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}

      {res && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm space-y-2">
          {res.geocoded && (
            <p className="text-neutral-700">
              📍 Adresă geocodată: <strong>{res.geocoded.address}</strong> (scor {res.geocoded.score})
              {res.geocoded.x != null && (
                <> · <a className="text-primary-600 underline" target="_blank" rel="noreferrer"
                  href={`https://geoportal.ancpi.ro/imobile_lookup.html`}>vezi pe geoportal</a></>
              )}
            </p>
          )}
          {res.found && res.parcels?.length ? (
            <div className="space-y-1">
              <p className="font-semibold text-green-700">✓ Parcelă identificată:</p>
              {res.parcels.map((p, i) => (
                <div key={i} className="rounded bg-green-50 border border-green-200 px-3 py-2">
                  Nr. Carte Funciară: <strong>{p.cf ?? '—'}</strong> · immovableId: {p.immovableId ?? '—'}
                </div>
              ))}
              <p className="text-xs text-neutral-500">
                Pentru apartamente, acesta e CF-ul parcelei/blocului — folosește-l ca punct de plecare pentru a găsi unitatea.
              </p>
            </div>
          ) : (
            <p className="text-amber-700">
              {res.reason === 'ancpi_unavailable'
                ? '⚠️ Geoportalul ANCPI e momentan indisponibil (502). Reîncearcă în câteva minute.'
                : res.reason === 'geocode_failed'
                  ? '⚠️ Adresa nu a putut fi geocodată — verifică scrierea.'
                  : '⚠️ Nicio parcelă găsită la acest punct (imobil posibil neînscris în CF sau geocodare imprecisă) — investigare manuală.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
