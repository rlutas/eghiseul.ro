'use client';

/**
 * Wizard Progress Component for Modular Wizard
 *
 * Displays progress through dynamic steps.
 */

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { ModularStep, ModularStepId } from '@/types/verification-modules';

interface WizardProgressProps {
  steps: ModularStep[];
  currentStepId: ModularStepId;
  onStepClick?: (stepId: ModularStepId) => void;
}

export function WizardProgress({ steps, currentStepId, onStepClick }: WizardProgressProps) {
  // Find current step index, fallback to 0 if not found
  const rawIndex = steps.findIndex(s => s.id === currentStepId);
  const currentIndex = rawIndex >= 0 ? rawIndex : 0;

  return (
    <div className="w-full">
      {/* Desktop Progress — continuous track behind, no per-step connectors */}
      <div className="hidden md:block relative px-5">
        {/* Track (full width behind circles) */}
        <div
          className="absolute top-5 left-10 right-10 h-0.5 bg-neutral-200 -translate-y-1/2"
          aria-hidden="true"
        />
        {/* Progress fill */}
        <div
          className="absolute top-5 left-10 h-0.5 bg-emerald-500 -translate-y-1/2 transition-all duration-300"
          style={{
            width:
              steps.length > 1
                ? `calc((100% - 5rem) * ${currentIndex / (steps.length - 1)})`
                : '0%',
          }}
          aria-hidden="true"
        />

        <div className="relative flex items-start justify-between">
          {steps.map((step) => {
            const isCompleted = steps.findIndex((s) => s.id === step.id) < currentIndex;
            const isCurrent = step.id === currentStepId;
            const isClickable = isCompleted && onStepClick;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all bg-white',
                    isCompleted &&
                      'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 ring-4 ring-white',
                    isCurrent &&
                      'bg-primary-500 text-secondary-900 ring-4 ring-primary-100',
                    !isCompleted && !isCurrent &&
                      'bg-neutral-100 text-neutral-500 ring-4 ring-white',
                    isClickable && 'cursor-pointer'
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.number}
                </button>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium whitespace-nowrap',
                    isCurrent
                      ? 'text-secondary-900'
                      : isCompleted
                      ? 'text-emerald-600'
                      : 'text-neutral-500'
                  )}
                >
                  {step.labelRo}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-secondary-900">
            Pasul {currentIndex + 1} din {steps.length}
          </span>
          <span className="text-sm text-neutral-500">
            {steps[currentIndex]?.labelRo}
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
