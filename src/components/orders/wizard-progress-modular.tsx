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
      {/* Desktop Progress */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.id === currentStepId;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                    isCompleted && 'bg-green-500 text-white cursor-pointer hover:bg-green-600',
                    isCurrent && 'bg-primary-500 text-secondary-900 ring-4 ring-primary-100',
                    !isCompleted && !isCurrent && 'bg-neutral-200 text-neutral-500',
                    isClickable && 'cursor-pointer'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </button>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center max-w-[80px]',
                    isCurrent ? 'text-secondary-900' : 'text-neutral-500'
                  )}
                >
                  {step.labelRo}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    index < currentIndex ? 'bg-green-500' : 'bg-neutral-200'
                  )}
                />
              )}
            </div>
          );
        })}
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
