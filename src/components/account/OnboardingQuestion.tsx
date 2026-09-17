'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, X } from 'lucide-react';
import { INTEREST_GROUPS, type InterestId } from '@/lib/account/service-interests';
import { cn } from '@/lib/utils';

/**
 * The one question the account asks a new customer (Faza 2 of
 * `docs/dashboard-client/PLAN.md`).
 *
 * A card at the top of the account, not a modal and not a wall: every service
 * stays orderable whether this is answered, skipped or ignored. It is here for a
 * single consequence — someone who only ever wants an extras de carte funciară
 * or a certificat constatator must stop being asked for an identity document we
 * would never hand to ANCPI or ONRC either.
 *
 * Because that is the whole point, the card does not vanish the moment it is
 * answered. It stays and says what changed ("pentru că ai ales X, contul nu-ți
 * mai cere Y"), which is §3.6 of the plan: a question that cannot name its own
 * consequence is not worth asking. The rest of the page is refreshed when the
 * customer closes the confirmation, so the sentence they are reading is not
 * pulled out from under them.
 *
 * Skipping is a real answer, stored as such, and it changes nothing: we know
 * nothing about this person, so the account keeps asking exactly what it asked
 * before.
 */

type Phase = 'question' | 'saved';

export function OnboardingQuestion() {
  const router = useRouter();
  const [selected, setSelected] = useState<InterestId[]>([]);
  const [phase, setPhase] = useState<Phase>('question');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consequence, setConsequence] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const confirmationHeadingRef = useRef<HTMLHeadingElement>(null);

  // The button that was just pressed disappears with the question, and focus
  // would fall back to <body>. Move it onto the confirmation instead, which is
  // also the sentence we want read.
  useEffect(() => {
    if (phase === 'saved') confirmationHeadingRef.current?.focus();
  }, [phase]);

  if (dismissed) return null;

  const toggle = (id: InterestId) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const save = async (interests: InterestId[]) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        // Nothing is cleared: the selection stays on screen and the buttons stay
        // usable, so a flaky network costs a second click and not the answer.
        setError(result?.error || 'Nu am putut salva răspunsul. Încearcă din nou.');
        return;
      }

      setConsequence(result.data?.consequence ?? null);
      setPhase('saved');
    } catch (err) {
      console.error('Onboarding save failed:', err);
      setError('Nu am putut salva răspunsul. Verifică conexiunea și încearcă din nou.');
    } finally {
      setIsSaving(false);
    }
  };

  const close = () => {
    setDismissed(true);
    // Only now: the checklist and the catalogue below re-read the answer, after
    // the customer has finished reading what it changed.
    router.refresh();
  };

  if (phase === 'saved') {
    return (
      <section
        aria-labelledby="onboarding-intrebare-titlu"
        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
      >
        {/* Same live region as below, same position in the tree, so the sentence
            that replaces the question is actually announced instead of silently
            swapped in. */}
        <div aria-live="polite" className="flex items-start gap-3 p-4 sm:p-5">
          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
            <Check className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="onboarding-intrebare-titlu"
              ref={confirmationHeadingRef}
              tabIndex={-1}
              className="font-bold text-secondary-900 focus-visible:outline-none"
            >
              Am salvat răspunsul
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">
              {consequence ??
                'Am notat. Contul rămâne așa cum e — nu-ți cerem nimic în plus față de ce cere comanda.'}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Închide"
            className={cn(
              'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-neutral-400',
              'transition-colors hover:bg-neutral-100 hover:text-secondary-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="onboarding-intrebare-titlu"
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
    >
      {/* Same element, same position as the confirmation above: the swap happens
          inside a live region that already existed, so it is announced. */}
      <div aria-live="polite" className="p-4 sm:p-5">
        <h2 id="onboarding-intrebare-titlu" className="font-bold text-secondary-900">
          Ce servicii te interesează?
        </h2>
        {/* One line, not three: on a 390px screen the old paragraph pushed the
            answers and both buttons off the first screen, which made a one-time
            question look like a form. */}
        <p id="onboarding-intrebare-descriere" className="mt-1 text-sm leading-snug text-neutral-600">
          Ca să nu-ți cerem acte de care n-ai nevoie. Alege câte vrei.
        </p>

        {/* A labelled group rather than a fieldset: the heading is already the
            question, and a <legend> would repeat it or fight the card padding. */}
        <div
          role="group"
          aria-labelledby="onboarding-intrebare-titlu"
          aria-describedby="onboarding-intrebare-descriere"
          className="mt-3 grid gap-1.5 sm:grid-cols-2"
        >
          {INTEREST_GROUPS.map((group) => {
            const isSelected = selected.includes(group.id);
            return (
              <label
                key={group.id}
                className={cn(
                  'flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5',
                  'transition-colors duration-200 motion-reduce:transition-none',
                  'has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2',
                  'has-[:focus-visible]:ring-primary-500 has-[:focus-visible]:ring-offset-2',
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSelected}
                  disabled={isSaving}
                  onChange={() => toggle(group.id)}
                />
                {/* The state is carried by the tick mark and the border weight,
                    not by colour alone. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2',
                    isSelected
                      ? 'border-primary-500 bg-primary-500 text-secondary-900'
                      : 'border-neutral-300 bg-white'
                  )}
                >
                  {isSelected && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-secondary-900">
                    {group.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-neutral-500">
                    {group.examples}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm leading-relaxed text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => save(selected)}
            disabled={isSaving || selected.length === 0}
            className={cn(
              'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5',
              'text-sm font-semibold text-secondary-900 bg-primary-500',
              'transition-colors hover:bg-primary-600 disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
            )}
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Salvează
          </button>
          <button
            type="button"
            onClick={() => save([])}
            disabled={isSaving}
            className={cn(
              'inline-flex min-h-[44px] items-center justify-center rounded-xl px-5',
              'text-sm font-medium text-neutral-600',
              'transition-colors hover:bg-neutral-100 hover:text-secondary-900 disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            Sari peste
          </button>
        </div>
      </div>
    </section>
  );
}
