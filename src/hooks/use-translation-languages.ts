'use client';

import { useEffect, useState } from 'react';
import { TRANSLATION_LANGUAGES } from '@/config/translation-languages';

// Active translation languages — DB-driven via GET /api/translation-prices
// (admin_settings.translation_price_list, editable in /admin/settings →
// Traduceri). Static TRANSLATION_LANGUAGES is the fallback so the wizard
// never shows an empty dropdown. Module-level cache: one fetch per page
// load, shared across consumers (options-step + Modifică dialog).

const FALLBACK: string[] = [...TRANSLATION_LANGUAGES];

let cached: string[] | null = null;
let inflight: Promise<string[]> | null = null;

interface PublicRow {
  language: string;
  active: boolean;
}

async function loadLanguages(): Promise<string[]> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = fetch('/api/translation-prices')
    .then((r) => r.json())
    .then((json) => {
      const rows = (json?.data as PublicRow[]) || [];
      const active = rows.filter((r) => r.active && r.language?.trim()).map((r) => r.language);
      cached = active.length ? active : FALLBACK;
      return cached;
    })
    .catch(() => FALLBACK)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Active translation languages (static fallback until loaded). */
export function useTranslationLanguages(): string[] {
  const [languages, setLanguages] = useState<string[]>(cached || FALLBACK);

  useEffect(() => {
    let active = true;
    loadLanguages().then((l) => {
      if (active) setLanguages(l);
    });
    return () => {
      active = false;
    };
  }, []);

  return languages;
}
