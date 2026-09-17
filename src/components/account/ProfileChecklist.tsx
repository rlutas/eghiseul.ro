import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';
import type { ProfileCompleteness } from '@/lib/account/profile-completeness';
import { cn } from '@/lib/utils';

/**
 * "Fewer steps next time" — the profile-completion nudge at the top of the
 * account.
 *
 * Deliberately not a gate and not a wizard: every service is orderable with an
 * empty account and the order form asks for whatever is missing. This only shows
 * what is already saved so the same data is not typed twice, and it removes
 * itself once complete.
 *
 * Shape follows the platform guidance for progress: a real progressbar element
 * with its value exposed, remaining steps as the emphasised rows, and completed
 * ones collapsed into a quiet summary rather than five struck-through lines of
 * noise. Rows are 56px tall so they are comfortable to tap, and the whole thing
 * is one card rather than a banner stacked on a list.
 */
export function ProfileChecklist({ completeness }: { completeness: ProfileCompleteness }) {
  if (completeness.isComplete) return null;

  const { steps, doneCount, totalCount, percent } = completeness;
  const remaining = steps.filter((s) => !s.done);
  const done = steps.filter((s) => s.done);

  return (
    <section
      aria-labelledby="profil-checklist-titlu"
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
    >
      <div className="border-b border-neutral-100 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="profil-checklist-titlu" className="font-bold text-secondary-900">
              Comandă mai repede data viitoare
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">
              Ce salvezi aici nu-ți mai este cerut în formular. Poți comanda oricând, chiar cu
              profilul necompletat.
            </p>
          </div>
          <span className="flex-shrink-0 text-right">
            <span className="block text-2xl font-bold tabular-nums text-secondary-900">
              {percent}%
            </span>
            <span className="block text-xs text-neutral-500 tabular-nums">
              {doneCount}/{totalCount}
            </span>
          </span>
        </div>

        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${doneCount} din ${totalCount} completate`}
          aria-labelledby="profil-checklist-titlu"
        >
          <div
            className="h-full rounded-full bg-primary-500 transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-neutral-100">
        {remaining.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                'flex min-h-[56px] items-center gap-3 px-4 py-3 sm:px-5',
                'transition-colors duration-200 motion-reduce:transition-none',
                'hover:bg-primary-50/60 focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-inset focus-visible:ring-primary-500'
              )}
            >
              <span
                aria-hidden="true"
                className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-neutral-300"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-secondary-900">{step.label}</span>
                <span className="block text-xs leading-relaxed text-neutral-500">
                  {step.benefit}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-400" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      {/* Completed steps as one quiet line instead of five struck-through rows —
          they are done, they should not take up the same space as what is left. */}
      {done.length > 0 && (
        <p className="flex items-center gap-2 border-t border-neutral-100 bg-neutral-50 px-4 py-2.5 text-xs text-neutral-500 sm:px-5">
          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
            <Check className="h-2.5 w-2.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 truncate">
            Gata: {done.map((s) => s.label.toLowerCase()).join(', ')}
          </span>
        </p>
      )}
    </section>
  );
}
