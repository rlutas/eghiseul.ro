'use client';

import { useSyncExternalStore } from 'react';

/**
 * Modul „preview de admin" al portalului de colaborator: `?as=<collaboratorId>`
 * pe orice pagină din /colaborator. Adminul (users.manage) vede EXACT ce vede
 * colaboratorul, dar read-only — acțiunile de lucru sunt ascunse în UI, iar
 * rutele care scriu cer rol de colaborator, deci refuză adminul oricum.
 *
 * Se citește din `window.location.search`, nu din `useSearchParams()`, ca să nu
 * ceară Suspense boundary la prerender. La server/hidratare valoarea e null,
 * deci fetch-urile din pagini așteaptă un tick înainte să pornească.
 */
const noopSubscribe = () => () => {};

export function usePreviewAs(): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get('as'),
    () => null
  );
}

/** Adaugă `?as=` unui href intern, dacă suntem în preview. */
export function withPreview(href: string, as: string | null): string {
  if (!as) return href;
  return href + (href.includes('?') ? '&' : '?') + `as=${encodeURIComponent(as)}`;
}
