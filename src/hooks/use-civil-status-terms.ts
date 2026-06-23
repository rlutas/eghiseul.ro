'use client';

import { useEffect, useState } from 'react';
import {
  CivilTermTiers,
  DEFAULT_CIVIL_TERM_TIERS,
} from '@/lib/civil-status/delivery-terms';

// Module-level cache — one fetch per page load, shared across components
// (civil-status step + price sidebar).
let cached: CivilTermTiers | null = null;
let inflight: Promise<CivilTermTiers> | null = null;

async function loadTiers(): Promise<CivilTermTiers> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = fetch('/api/civil-status-terms')
    .then((r) => r.json())
    .then((json) => {
      cached = (json?.data as CivilTermTiers) || DEFAULT_CIVIL_TERM_TIERS;
      return cached;
    })
    .catch(() => DEFAULT_CIVIL_TERM_TIERS)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Returns the live civil-status term tiers (defaults until loaded). */
export function useCivilStatusTerms(): CivilTermTiers {
  const [tiers, setTiers] = useState<CivilTermTiers>(
    cached || DEFAULT_CIVIL_TERM_TIERS
  );

  useEffect(() => {
    let active = true;
    loadTiers().then((t) => {
      if (active) setTiers(t);
    });
    return () => {
      active = false;
    };
  }, []);

  return tiers;
}
