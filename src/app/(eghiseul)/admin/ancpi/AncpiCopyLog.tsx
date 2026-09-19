'use client';

import { useState } from 'react';

/** Copy the full ANCPI job log (events + error + ids) to the clipboard. */
export function AncpiCopyLog({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="rounded border border-neutral-300 px-2 py-0.5 text-[10px] font-medium text-neutral-700 hover:bg-neutral-100"
      title="Copiază jurnalul + eroarea"
    >
      {copied ? '✓ Copiat' : '📋 Copiază log'}
    </button>
  );
}
