'use client';

import { CONSENT_OPEN_EVENT } from '@/lib/consent';

/** Re-opens the cookie banner (ePrivacy: withdrawing must be as easy as giving). */
export function CookieSettingsLink({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))}
      className={className}
    >
      Setări cookie-uri
    </button>
  );
}
