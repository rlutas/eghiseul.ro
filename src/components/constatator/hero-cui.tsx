'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { normalizeCui, saveCuiPrefill } from '@/lib/constatator/cui-prefill';

interface Found {
  cui: string;
  name: string;
  isActive: boolean;
  status: string;
}

/**
 * CUI box in the homepage hero: the visitor types the CUI, sees the firm, then
 * continues to the order. Every competitor starts this way; before 24.11.2026
 * our first screen after the click asked for email + phone.
 *
 * With a CUI the wizard opens with `?tip=de-baza` (basic certificate on a firm
 * preselected) and the company step arrives with the CUI filled in.
 */
export function HeroCuiLookup({ orderHref, price }: { orderHref: string; price: string }) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [found, setFound] = useState<Found | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // With a CUI: basic certificate on a firm, preselected. Without one the
  // visitor may want the PF or „cu istoric” variant, so the type stays open.
  const go = (cui: string | null) => {
    if (cui) saveCuiPrefill(cui);
    router.push(cui ? `${orderHref}?tip=de-baza` : orderHref);
  };

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (found) return go(found.cui);
    const cui = normalizeCui(value);
    if (!cui) {
      setError('Scrie CUI-ul firmei: doar cifre, cu sau fără RO.');
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/company/validate?cui=${cui}`);
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json.data?.name) {
        setFound({ cui, name: json.data.name, isActive: json.data.isActive !== false, status: json.data.status || '' });
      } else if (res.status === 404) {
        setError('Nu am găsit o firmă cu acest CUI. Verifică cifrele.');
      } else {
        // ANAF down or slow: never block the sale on the lookup.
        go(cui);
      }
    } catch {
      go(cui);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={lookup} className="flex flex-col gap-2.5" noValidate>
      <label htmlFor="hero-cui" className="text-[14px] font-semibold text-d-ink">
        CUI-ul firmei
      </label>
      {found ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border-2 border-d-acc bg-d-soft px-3.5 py-3">
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[15px] font-bold">{found.name}</span>
            <span className="text-[13px] text-d-muted">
              CUI {found.cui}
              {!found.isActive && found.status ? ` · ${found.status}` : ''}
            </span>
          </span>
          <button
            type="button"
            onClick={() => { setFound(null); setValue(''); setTimeout(() => inputRef.current?.focus(), 0); }}
            className="shrink-0 text-[13px] font-semibold text-d-muted underline underline-offset-2"
          >
            Schimbă
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          id="hero-cui"
          name="cui"
          inputMode="numeric"
          autoComplete="off"
          placeholder="ex. 14399840 sau RO14399840"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          aria-invalid={!!error}
          aria-describedby={error ? 'hero-cui-error' : undefined}
          className="h-[54px] w-full rounded-xl border-2 border-d-line bg-white px-4 text-[17px] font-semibold text-d-ink outline-none placeholder:font-normal placeholder:text-d-muted focus:border-d-ink"
        />
      )}
      {error && (
        <p id="hero-cui-error" role="alert" className="m-0 text-[13px] font-semibold text-red-700">
          {error}
        </p>
      )}
      {found && !found.isActive && (
        <p className="m-0 text-[13px] text-d-muted">
          ANAF nu o arată ca activă. Certificatul se poate cere și așa; verifică datele în pasul următor.
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-[54px] items-center justify-center gap-2 rounded-xl bg-d-ink text-[16px] font-bold text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Caut firma…' : found ? `Continuă · ${price} lei` : 'Caută firma'}
      </button>
      <button
        type="button"
        onClick={() => go(null)}
        className="text-center text-[13px] font-semibold text-d-muted underline underline-offset-2"
      >
        Nu am CUI-ul la îndemână — încep comanda
      </button>
    </form>
  );
}
