'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, CreditCard, MapPin, Phone, User } from 'lucide-react';
import type { ProfileCompleteness, ProfileStepId } from '@/lib/account/profile-completeness';
import { cn } from '@/lib/utils';
import { ProfileStepDialog } from './ProfileStepDialog';

/**
 * The customer's own data, as a menu at the top of the account.
 *
 * Four rows, always the same four, always visible: telefon, date personale,
 * adresă, facturare. A row that is not filled in opens its form in a dialog,
 * right here. A row that is filled in shows what is saved and opens the tab
 * where it can be changed. The percentage and the bar are there only while
 * something is missing.
 *
 * Deliberately not a gate and not a wizard: every service is orderable with an
 * empty account and the order form asks for whatever is missing. This exists so
 * the same data is not typed twice, and so the customer can see at a glance what
 * the next order will already know about them.
 *
 * It used to hide itself once complete and to collapse the finished rows into
 * one line. Raul, 18.09.2026: it should be the first thing on the page and read
 * like a menu — where the data is, one tap away. Once everything is done it
 * shrinks to a single line saying so.
 */

const ICONS: Record<ProfileStepId, typeof Phone> = {
  contact: Phone,
  personal: User,
  address: MapPin,
  billing: CreditCard,
};

const ROW_CLASS = cn(
  'flex w-full min-h-[56px] items-center gap-3 px-4 py-3 text-left sm:px-5',
  'transition-colors duration-200 motion-reduce:transition-none',
  'hover:bg-primary-50/60 focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-inset focus-visible:ring-primary-500'
);

export function ProfileChecklist({ completeness }: { completeness: ProfileCompleteness }) {
  const [openStep, setOpenStep] = useState<ProfileStepId | null>(null);
  // Radix gives the focus back to a `DialogTrigger`, and these rows are not
  // one: closing has to be told where to put it. Back to the row that opened
  // the step — or, when a save has just turned that row into a link, to the
  // title above it.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rowRef = useRef<HTMLButtonElement | null>(null);

  const { steps, doneCount, totalCount, percent, isComplete } = completeness;

  // Complete: one quiet line, not four rows of things that are done (Raul,
  // 18.09.2026). The data itself is one tap away in the menu below.
  if (isComplete) {
    return (
      <section
        aria-labelledby="profil-checklist-titlu"
        className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 sm:px-5"
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700"
        >
          <Check className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <h2
            id="profil-checklist-titlu"
            ref={headingRef}
            tabIndex={-1}
            className="text-sm font-bold text-secondary-900 focus:outline-none"
          >
            Profilul tău e complet 100%
          </h2>
          <span className="block text-xs leading-relaxed text-neutral-600">
            Datele se completează singure la comandă. Le modifici din „Datele mele&quot;, mai jos.
          </span>
        </span>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="profil-checklist-titlu"
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
    >
      <div className="border-b border-neutral-100 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="profil-checklist-titlu"
              ref={headingRef}
              tabIndex={-1}
              className="font-bold text-secondary-900 focus:outline-none"
            >
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
        {steps.map((step) => {
          const Icon = ICONS[step.id];
          const icon = (
            <span
              aria-hidden="true"
              className={cn(
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
                step.done ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-500'
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          );
          const text = (
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-secondary-900">
                {step.label}
                {step.done && (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <Check className="h-2.5 w-2.5" aria-hidden="true" />
                    <span className="sr-only">completat</span>
                  </span>
                )}
              </span>
              {/* A saved value fits one line and is cut if not; a sentence
                  gets two — cut mid-word it reads like a bug. */}
              <span
                className={cn(
                  'block text-xs leading-relaxed',
                  step.done ? 'truncate text-neutral-600' : 'line-clamp-2 text-neutral-500'
                )}
              >
                {step.done ? step.summary ?? 'Salvat' : step.benefit}
              </span>
            </span>
          );
          const chevron = (
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-400" aria-hidden="true" />
          );

          return (
            <li key={step.id}>
              {step.done ? (
                // Saved: the tab is where it is listed and changed, and it now
                // opens exactly where the URL says (the tab is read off the URL).
                <Link href={step.href.replace('&edit=1', '')} className={ROW_CLASS}>
                  {icon}
                  {text}
                  {chevron}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={(event) => {
                    rowRef.current = event.currentTarget;
                    setOpenStep(step.id);
                  }}
                  className={ROW_CLASS}
                >
                  {icon}
                  {text}
                  {chevron}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <ProfileStepDialog
        step={openStep}
        onClose={() => setOpenStep(null)}
        triggerRef={rowRef}
        returnFocusRef={headingRef}
      />
    </section>
  );
}
