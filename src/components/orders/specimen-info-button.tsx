'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import Image from 'next/image';

/**
 * Small "Vezi specimen" link that opens a modal with a sample image of the
 * document/stamp an option produces (ex: Apostilă Haga, Extras multilingv).
 * Self-contained (own open state + portal) so it can drop next to any option.
 */
export function SpecimenInfoButton({
  src,
  alt,
  label = 'Vezi specimen',
}: {
  src: string;
  alt: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
      >
        <Info className="h-3.5 w-3.5" /> {label}
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-md rounded-xl bg-white p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Închide"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="mb-2 pr-8 text-sm font-semibold text-secondary-900">{alt}</p>
              <Image
                src={src}
                alt={alt}
                width={600}
                height={840}
                className="h-auto w-full rounded-lg border border-neutral-100"
              />
              <p className="mt-1.5 text-center text-[10px] text-neutral-400">
                Model orientativ
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
