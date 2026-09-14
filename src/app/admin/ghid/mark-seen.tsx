'use client';

import { useEffect } from 'react';

export const GHID_SEEN_KEY = 'eghiseul_ghid_last_seen';
export const GHID_SEEN_EVENT = 'eghiseul:ghid-seen';

/**
 * Când operatorul deschide Ghidul, reținem în browser data ultimei livrări
 * văzute; badge-ul din meniu numără livrările mai noi decât ea. Doar
 * conveniență per browser — nu ajunge pe server.
 */
export function MarkGhidSeen({ latestDate }: { latestDate: string | null }) {
  useEffect(() => {
    if (!latestDate) return;
    try {
      localStorage.setItem(GHID_SEEN_KEY, latestDate);
      window.dispatchEvent(new Event(GHID_SEEN_EVENT));
    } catch {
      /* private mode / storage blocat — badge-ul rămâne, nimic critic */
    }
  }, [latestDate]);
  return null;
}
