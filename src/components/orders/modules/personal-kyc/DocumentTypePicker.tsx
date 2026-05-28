'use client';

import { CreditCard, IdCard, BookOpen } from 'lucide-react';

export type IdDocumentType = 'ci_vechi' | 'ci_nou' | 'passport';

interface DocumentTypePickerProps {
  onPick: (type: IdDocumentType) => void;
}

/**
 * 3-card picker shown in Step 2 scan mode (post-2026-05-28).
 *
 * The user explicitly chooses what type of ID they have BEFORE seeing scan
 * zones. This drives:
 *   - which scan zones render (front-only vs front+back+PDF vs opened spread)
 *   - which OCR extractor is called per upload
 *   - what is required for "Continuă" to enable
 *
 * Why explicit pick (not auto-detect):
 *   - eCI vs CIS (electronic vs simple-no-chip) look almost identical;
 *     auto-detecting from a low-quality phone photo is unreliable
 *   - User knows which card they hold; one click is fast and unambiguous
 *   - For passport users, scan UX is entirely different (full spread, not
 *     just one side) — better to commit to the flow upfront
 */
export function DocumentTypePicker({ onPick }: DocumentTypePickerProps) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-sm sm:text-base font-semibold text-secondary-900">
          Ce tip de act ai?
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          Apasă pe varianta care arată ca actul tău.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onPick('ci_vechi')}
          className="group flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 border-neutral-200 bg-white p-3 sm:p-4 text-center transition-all hover:border-primary-300 hover:bg-primary-50/30 hover:shadow-sm"
        >
          <span className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-amber-100 group-hover:bg-amber-200">
            <IdCard className="h-5 w-5 sm:h-7 sm:w-7 text-amber-700" />
          </span>
          <div>
            <p className="text-sm sm:text-base font-semibold text-secondary-900 leading-tight">
              Buletin / CI vechi
            </p>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-snug">
              Plastic 2009-2024, fără cip
            </p>
            <p className="hidden sm:block text-[10px] text-neutral-400 mt-1 leading-snug">
              Scan: doar față
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onPick('ci_nou')}
          className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 border-primary-500 bg-primary-50/40 p-3 sm:p-4 text-center transition-all hover:bg-primary-50 hover:shadow-sm"
        >
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wide whitespace-nowrap">
            Recent
          </span>
          <span className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary-100 group-hover:bg-primary-200">
            <CreditCard className="h-5 w-5 sm:h-7 sm:w-7 text-primary-700" />
          </span>
          <div>
            <p className="text-sm sm:text-base font-semibold text-secondary-900 leading-tight">
              CI nou electronic
            </p>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-snug">
              Cu cip auriu pe spate
            </p>
            <p className="hidden sm:block text-[10px] text-neutral-400 mt-1 leading-snug">
              Scan: față + spate + PDF
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onPick('passport')}
          className="group flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 border-neutral-200 bg-white p-3 sm:p-4 text-center transition-all hover:border-primary-300 hover:bg-primary-50/30 hover:shadow-sm"
        >
          <span className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-blue-200">
            <BookOpen className="h-5 w-5 sm:h-7 sm:w-7 text-blue-700" />
          </span>
          <div>
            <p className="text-sm sm:text-base font-semibold text-secondary-900 leading-tight">
              Pașaport
            </p>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-snug">
              Livret cu pagini
            </p>
            <p className="hidden sm:block text-[10px] text-neutral-400 mt-1 leading-snug">
              Scan: pașaport deschis
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
