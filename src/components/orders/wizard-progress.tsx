'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WIZARD_STEPS, WizardStep } from '@/types/orders';

interface WizardProgressProps {
  currentStep: WizardStep;
  stepNumber: number;
  onStepClick?: (step: WizardStep) => void;
  completedSteps?: WizardStep[];
}

export function WizardProgress({
  currentStep,
  stepNumber,
  onStepClick,
  completedSteps = [],
}: WizardProgressProps) {
  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden md:block">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {WIZARD_STEPS.map((step, index) => {
              const isCurrent = step.id === currentStep;
              const isCompleted = completedSteps.includes(step.id) || index < stepNumber - 1;
              const isClickable = isCompleted || index <= stepNumber;

              return (
                <li
                  key={step.id}
                  className={cn(
                    'relative flex-1',
                    index !== WIZARD_STEPS.length - 1 && 'pr-8 sm:pr-20'
                  )}
                >
                  {/* Connector Line */}
                  {index !== WIZARD_STEPS.length - 1 && (
                    <div
                      className="absolute top-4 left-0 -right-8 sm:-right-20 h-0.5"
                      aria-hidden="true"
                    >
                      <div
                        className={cn(
                          'h-full transition-colors duration-300',
                          isCompleted ? 'bg-primary-500' : 'bg-neutral-200'
                        )}
                      />
                    </div>
                  )}

                  {/* Step Circle and Label */}
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      'group relative flex flex-col items-center',
                      isClickable && 'cursor-pointer',
                      !isClickable && 'cursor-not-allowed'
                    )}
                  >
                    {/* Circle */}
                    <span
                      className={cn(
                        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                        isCurrent &&
                          'border-primary-500 bg-primary-500 text-secondary-900 shadow-[0_0_0_4px_rgba(236,185,95,0.2)]',
                        isCompleted &&
                          !isCurrent &&
                          'border-primary-500 bg-primary-500 text-secondary-900',
                        !isCurrent &&
                          !isCompleted &&
                          'border-neutral-300 bg-white text-neutral-500',
                        isClickable &&
                          !isCurrent &&
                          'group-hover:border-primary-400 group-hover:shadow-sm'
                      )}
                    >
                      {isCompleted && !isCurrent ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        step.number
                      )}
                    </span>

                    {/* Label */}
                    <span
                      className={cn(
                        'mt-2 text-xs font-medium transition-colors duration-300',
                        isCurrent && 'text-primary-600',
                        isCompleted && !isCurrent && 'text-secondary-900',
                        !isCurrent && !isCompleted && 'text-neutral-500'
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-500 ease-out"
              style={{
                width: `${((stepNumber - 1) / (WIZARD_STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step Info */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500">
              Pasul {stepNumber} din {WIZARD_STEPS.length}
            </span>
            <h3 className="text-sm font-semibold text-secondary-900">
              {WIZARD_STEPS.find((s) => s.id === currentStep)?.label}
            </h3>
          </div>

          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {WIZARD_STEPS.map((step, index) => {
              const isCurrent = step.id === currentStep;
              const isCompleted = index < stepNumber - 1;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => (isCompleted || index <= stepNumber) && onStepClick?.(step.id)}
                  disabled={!isCompleted && index > stepNumber}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    isCurrent && 'w-6 bg-primary-500',
                    isCompleted && !isCurrent && 'w-2 bg-primary-500',
                    !isCurrent && !isCompleted && 'w-2 bg-neutral-300'
                  )}
                  aria-label={`Go to step ${step.number}: ${step.label}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for sidebar
export function WizardProgressVertical({
  currentStep,
  stepNumber,
  onStepClick,
  completedSteps = [],
}: WizardProgressProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="space-y-4">
        {WIZARD_STEPS.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id) || index < stepNumber - 1;
          const isClickable = isCompleted || index <= stepNumber;

          return (
            <li key={step.id} className="relative">
              {/* Connector Line */}
              {index !== WIZARD_STEPS.length - 1 && (
                <div
                  className="absolute left-4 top-8 -bottom-4 w-0.5"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      'h-full transition-colors duration-300',
                      isCompleted ? 'bg-primary-500' : 'bg-neutral-200'
                    )}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'group flex items-center gap-3 w-full text-left',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-not-allowed opacity-60'
                )}
              >
                {/* Circle */}
                <span
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 flex-shrink-0',
                    isCurrent &&
                      'border-primary-500 bg-primary-500 text-secondary-900 shadow-[0_0_0_4px_rgba(236,185,95,0.2)]',
                    isCompleted &&
                      !isCurrent &&
                      'border-primary-500 bg-primary-500 text-secondary-900',
                    !isCurrent &&
                      !isCompleted &&
                      'border-neutral-300 bg-white text-neutral-500',
                    isClickable &&
                      !isCurrent &&
                      'group-hover:border-primary-400'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-300',
                    isCurrent && 'text-primary-600',
                    isCompleted && !isCurrent && 'text-secondary-900',
                    !isCurrent && !isCompleted && 'text-neutral-500'
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
