'use client';

import { CreditCard, Building2, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'card' | 'bank_transfer';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  selected,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-secondary-900">Alege metoda de plată</h3>

      {/* Card Payment Option */}
      <label
        className={cn(
          'flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
          selected === 'card'
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-200 hover:border-neutral-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="radio"
          name="payment_method"
          value="card"
          checked={selected === 'card'}
          onChange={() => !disabled && onChange('card')}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            selected === 'card' ? 'bg-primary-100' : 'bg-neutral-100'
          )}
        >
          <CreditCard
            className={cn(
              'h-6 w-6',
              selected === 'card' ? 'text-primary-600' : 'text-neutral-500'
            )}
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-secondary-900">Card Bancar</p>
          <p className="text-sm text-neutral-500">
            Visa, Mastercard, Apple Pay, Google Pay
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 border-green-200"
        >
          Instant
        </Badge>
      </label>

      {/* Bank Transfer Option */}
      <label
        className={cn(
          'flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
          selected === 'bank_transfer'
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-200 hover:border-neutral-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="radio"
          name="payment_method"
          value="bank_transfer"
          checked={selected === 'bank_transfer'}
          onChange={() => !disabled && onChange('bank_transfer')}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            selected === 'bank_transfer' ? 'bg-primary-100' : 'bg-neutral-100'
          )}
        >
          <Building2
            className={cn(
              'h-6 w-6',
              selected === 'bank_transfer' ? 'text-primary-600' : 'text-neutral-500'
            )}
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-secondary-900">Transfer Bancar</p>
          <p className="text-sm text-neutral-500">
            IBAN · Verificare în 1-3 zile lucrătoare
          </p>
        </div>
      </label>

      {/* Info text */}
      <p className="text-xs text-neutral-500 text-center pt-2">
        <Smartphone className="inline h-3 w-3 mr-1" />
        Plata cu card include Apple Pay și Google Pay
      </p>
    </div>
  );
}
