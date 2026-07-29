'use client';

import { useEffect, useState } from 'react';
import { TRANSLATION_LANGUAGES } from '@/config/translation-languages';

// Active translation languages + per-language client prices — DB-driven via
// GET /api/translation-prices (admin_settings.translation_price_list,
// editable in /admin/settings → Traduceri). Static TRANSLATION_LANGUAGES is
// the fallback so the wizard never shows an empty dropdown. Module-level
// cache: one fetch per page load, shared across consumers (options-step +
// Modifică dialog).

const FALLBACK: string[] = [...TRANSLATION_LANGUAGES];

interface PublicRow {
  language: string;
  active: boolean;
  clientPriceDoc: number | null;
  clientPriceApostilaExtra: number | null;
}

interface TranslationData {
  languages: string[];
  /** Client price per language (RON, VAT included). Missing = use option's base price. */
  prices: Record<string, number>;
  /** Extra client price when the order also has Apostilă Haga (translator translates the apostille too). */
  apostilaExtras: Record<string, number>;
}

const FALLBACK_DATA: TranslationData = { languages: FALLBACK, prices: {}, apostilaExtras: {} };

let cached: TranslationData | null = null;
let inflight: Promise<TranslationData> | null = null;

async function loadData(): Promise<TranslationData> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = fetch('/api/translation-prices')
    .then((r) => r.json())
    .then((json) => {
      const rows = (json?.data as PublicRow[]) || [];
      const active = rows.filter((r) => r.active && r.language?.trim());
      const prices: Record<string, number> = {};
      const apostilaExtras: Record<string, number> = {};
      for (const r of active) {
        if (r.clientPriceDoc != null && Number.isFinite(Number(r.clientPriceDoc))) {
          prices[r.language] = Number(r.clientPriceDoc);
        }
        if (r.clientPriceApostilaExtra != null && Number.isFinite(Number(r.clientPriceApostilaExtra))) {
          apostilaExtras[r.language] = Number(r.clientPriceApostilaExtra);
        }
      }
      cached = active.length
        ? { languages: active.map((r) => r.language), prices, apostilaExtras }
        : FALLBACK_DATA;
      return cached;
    })
    .catch(() => FALLBACK_DATA)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Active languages + per-language prices (static fallback until loaded). */
export function useTranslationData(): TranslationData {
  const [data, setData] = useState<TranslationData>(cached || FALLBACK_DATA);

  useEffect(() => {
    let active = true;
    loadData().then((d) => {
      if (active) setData(d);
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}

/** Active translation languages (static fallback until loaded). */
export function useTranslationLanguages(): string[] {
  return useTranslationData().languages;
}
