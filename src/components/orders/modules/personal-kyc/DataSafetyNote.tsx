import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * „Datele tale sunt în siguranță" — the ONE reassurance note of the wizard,
 * folded, in the same shape as the selfie notice. Not shown to a signed-in
 * customer (they already trusted us with an account) — feedback 18.09.2026,
 * #27/#29: three differently styled blocks said the same thing on two steps.
 */
export function DataSafetyNote({ className }: { className?: string }) {
  return (
    <details className={cn('group rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3', className)}>
      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs text-neutral-600 [&::-webkit-details-marker]:hidden">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary-500" />
        <span className="font-medium text-secondary-900">Datele tale sunt în siguranță.</span>
        <span className="ml-auto font-medium text-primary-600 group-open:hidden">Cum?</span>
      </summary>
      <p className="mt-2 pl-6 text-xs leading-relaxed text-neutral-600">
        Documentele și datele personale sunt criptate, stocate în UE și folosite exclusiv pentru
        procesarea comenzii tale. Nu le distribuim către terți.
      </p>
    </details>
  );
}
