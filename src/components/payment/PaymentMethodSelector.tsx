'use client';

import { CreditCard, Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentMarks } from './PaymentMarks';

export type PaymentMethod = 'card' | 'bank_transfer';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

interface OptionProps {
  value: PaymentMethod;
  selected: PaymentMethod;
  disabled: boolean;
  onChange: (method: PaymentMethod) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Right side on wide screens, under the text on phones. */
  aside?: React.ReactNode;
}

function MethodOption({ value, selected, disabled, onChange, icon, title, description, aside }: OptionProps) {
  const active = selected === value;
  return (
    <label
      className={cn(
        'group relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-colors',
        'focus-within:ring-2 focus-within:ring-primary-500/40 focus-within:ring-offset-2',
        active
          ? 'border-primary-500 bg-primary-50/70 shadow-[inset_0_0_0_1px_var(--primary-500)]'
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/60',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <input
        type="radio"
        name="payment_method"
        value={value}
        checked={active}
        onChange={() => !disabled && onChange(value)}
        disabled={disabled}
        className="sr-only"
      />
      {/* The radio itself, drawn: the choice is visible without relying on the tint alone. */}
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          active ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-transparent'
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3.5} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-[15px] font-semibold text-secondary-900">
            <span className={cn('shrink-0', active ? 'text-primary-600' : 'text-neutral-500')}>{icon}</span>
            {title}
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-neutral-600">{description}</span>
        </span>
        {aside && <span className="shrink-0">{aside}</span>}
      </span>
    </label>
  );
}

export function PaymentMethodSelector({ selected, onChange, disabled = false }: PaymentMethodSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-base font-semibold text-secondary-900">Cum plătești</legend>

      <MethodOption
        value="card"
        selected={selected}
        disabled={disabled}
        onChange={onChange}
        icon={<CreditCard className="h-[18px] w-[18px]" />}
        title="Card bancar"
        description="Plata se confirmă pe loc și începem lucrul imediat."
        aside={<PaymentMarks />}
      />

      <MethodOption
        value="bank_transfer"
        selected={selected}
        disabled={disabled}
        onChange={onChange}
        icon={<Building2 className="h-[18px] w-[18px]" />}
        title="Transfer bancar"
        description="Plătești din aplicația băncii, în contul nostru IBAN. Banii ajung în 1–3 zile lucrătoare."
      />
    </fieldset>
  );
}
