'use client';

import { useState } from 'react';

/**
 * Admin panel for "Identificare imobil" orders. Shows the client's chosen method
 * (by address / by name) and, for the address method, lets the operator run the
 * automated ANCPI lookup ON-DEMAND (geocode → cadastral parcel CF). The lookup
 * reuses GET /api/ancpi/lookup, which validates the locality to avoid a confident
 * but wrong match in another town. For the name method (or when the automated
 * lookup isn't enough) the operator researches manually on rp.ancpi.ro.
 */

interface Parcel { cf: string | null; immovableId: string | null; inspireId: string | null }
interface LookupData {
  found: boolean;
  reason?: string;
  requestedLocality?: string | null;
  geocodedElsewhere?: Array<{ address: string; score: number }>;
  geocoded?: { address: string; score: number; type?: string | null; approximate?: boolean; lat?: number; lon?: number };
  parcels?: Parcel[];
}

interface PropertyData {
  county?: string;
  locality?: string;
  propertyAddress?: string;
  ownerName?: string;
  ownerCnpCui?: string;
  searchMethod?: 'address' | 'name';
}

function InfoLine({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-neutral-500 min-w-[140px]">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}

export function IdentificareImobilPanel({ property }: { property: PropertyData | null }) {
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [res, setRes] = useState<LookupData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!property) return null;
  // Fall back to inferring the method from which field the client filled in.
  const method = property.searchMethod ?? (property.propertyAddress ? 'address' : property.ownerName ? 'name' : 'address');

  async function runLookup() {
    setBusy(true); setErr(null); setRes(null);
    const params = new URLSearchParams({
      address: property?.propertyAddress ?? '',
      localitate: property?.locality ?? '',
      judet: property?.county ?? '',
    });
    // ANCPI geoportal 502s in waves → retry a few times before giving up.
    for (let i = 1; i <= 5; i++) {
      setAttempt(i);
      try {
        const r = await fetch(`/api/ancpi/lookup/?${params}`, { cache: 'no-store' });
        const j = await r.json();
        if (j.success) {
          const d = j.data as LookupData;
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

  const ownerSearchUrl = 'https://rp.ancpi.ro/owner-registry';

  return (
    <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-neutral-900">Identificare imobil</h4>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${method === 'address' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
          {method === 'address' ? '📍 După adresă (automat)' : '👤 După nume (manual)'}
        </span>
      </div>

      <div className="space-y-1">
        <InfoLine label="Județ" value={property.county} />
        <InfoLine label="Localitate / UAT" value={property.locality} />
        <InfoLine label="Adresă imobil" value={property.propertyAddress} />
        <InfoLine label="Nume proprietar" value={property.ownerName} />
        <InfoLine label="CNP / CUI" value={property.ownerCnpCui} />
      </div>

      {method === 'address' ? (
        <>
          <button
            type="button"
            onClick={runLookup}
            disabled={busy || !property.propertyAddress}
            className="rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? `Se caută… (încercarea ${attempt})` : '🔍 Identifică automat (ANCPI)'}
          </button>
          {!property.propertyAddress && (
            <p className="text-xs text-neutral-500">Comanda nu are adresă completată — caută manual după proprietar.</p>
          )}
        </>
      ) : (
        <div className="rounded bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          Căutare <strong>manuală după proprietar</strong> în{' '}
          <a className="text-primary-600 underline" target="_blank" rel="noreferrer" href={ownerSearchUrl}>
            Registrul Proprietarilor ANCPI (rp.ancpi.ro)
          </a>{' '}
          — acces avocat, prin interfață (NU automatizat).
        </div>
      )}

      {err && <div className="rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}

      {res && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm space-y-2">
          {res.geocoded && (
            <p className="text-neutral-700">
              📍 Adresă geocodată: <strong>{res.geocoded.address}</strong> (scor {res.geocoded.score})
              {res.geocoded.lat != null && res.geocoded.lon != null && (
                <> · <a className="text-primary-600 underline font-medium" target="_blank" rel="noreferrer"
                  href={`https://www.google.com/maps?q=${res.geocoded.lat},${res.geocoded.lon}&t=k&z=19`}>🛰️ vezi pe Google Maps (satelit)</a></>
              )}
            </p>
          )}
          {res.geocoded?.approximate && (
            <p className="rounded bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              ⚠️ Potrivire <strong>aproximativă</strong> (nivel stradă) — verifică manual pe geoportal înainte de a emite.
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
                Pentru apartamente, acesta e CF-ul parcelei/blocului — punct de plecare pentru a găsi unitatea.
              </p>
            </div>
          ) : res.reason === 'locality_mismatch' ? (
            <div className="space-y-1 text-amber-700">
              <p>⚠️ Adresa a fost găsită, dar <strong>NU în „{res.requestedLocality}”</strong> — probabil aceeași stradă în altă localitate. Verifică manual.</p>
              {res.geocodedElsewhere?.length ? (
                <ul className="list-disc pl-5 text-xs text-neutral-500">
                  {res.geocodedElsewhere.map((g, i) => (<li key={i}>{g.address} (scor {g.score})</li>))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="text-amber-700">
              {res.reason === 'ancpi_unavailable'
                ? '⚠️ Geoportalul ANCPI e momentan indisponibil (502). Reîncearcă în câteva minute.'
                : res.reason === 'geocode_failed'
                  ? '⚠️ Adresa nu a putut fi geocodată — verifică scrierea sau caută manual după proprietar.'
                  : '⚠️ Nicio parcelă găsită la acest punct (posibil neînscris în CF) — investigare manuală.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
