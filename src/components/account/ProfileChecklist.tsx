import Link from 'next/link';
import { Check, ChevronRight, Sparkles } from 'lucide-react';
import type { ProfileCompleteness } from '@/lib/account/profile-completeness';
import { cn } from '@/lib/utils';

/**
 * "Fewer steps next time" checklist, shown at the top of the account until the
 * profile is complete.
 *
 * Deliberately NOT a gate and deliberately not a wizard: a customer can order
 * anything with an empty account, and the order form asks for whatever is
 * missing. This only shows what is already saved, so the same data is not typed
 * twice. It disappears on its own once every step is done.
 */
export function ProfileChecklist({ completeness }: { completeness: ProfileCompleteness }) {
  if (completeness.isComplete) return null;

  const { steps, doneCount, totalCount, percent } = completeness;

  return (
    <section
      aria-labelledby="profil-checklist-titlu"
      className="rounded-2xl border border-primary-200 bg-primary-50/60 overflow-hidden"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-700">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="profil-checklist-titlu" className="font-bold text-secondary-900">
              Comandă mai repede data viitoare
            </h2>
            <p className="text-sm text-neutral-600 mt-0.5">
              Ce salvezi aici nu-ți mai este cerut la comandă. Poți comanda oricând, chiar dacă
              lași profilul necompletat.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-600 mb-1.5">
            <span>
              {doneCount} din {totalCount} completate
            </span>
            <span>{percent}%</span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-white overflow-hidden"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Cât de complet este profilul"
          >
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <ul className="divide-y divide-primary-100 border-t border-primary-100 bg-white/70">
        {steps.map((step) => (
          <li key={step.id}>
            {step.done ? (
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-medium text-neutral-500 line-through">
                  {step.label}
                </span>
              </div>
            ) : (
              <Link
                href={step.href}
                className={cn(
                  'flex items-center gap-3 px-4 sm:px-5 py-3 min-h-[56px]',
                  'hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                )}
              >
                <span className="h-6 w-6 flex-shrink-0 rounded-full border-2 border-primary-300 bg-white" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-secondary-900">{step.label}</span>
                  <span className="block text-xs text-neutral-500">{step.benefit}</span>
                </span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
