'use client';

import { useEffect, useMemo } from 'react';
import {
  Zap,
  Globe,
  FileCheck,
  Copy,
  Package,
  CheckCircle,
  Info,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useOrderWizard } from '@/providers/order-wizard-provider';
import { SelectedOption } from '@/types/orders';
import { ServiceOption } from '@/types/services';
import { cn } from '@/lib/utils';

interface OptionsStepProps {
  onValidChange: (valid: boolean) => void;
}

// Icon mapping for option types
const OPTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  urgenta: Zap,
  traducere: Globe,
  apostila: FileCheck,
  copii: Copy,
  default: Package,
};

// Get icon for option based on name
function getOptionIcon(optionName: string) {
  const lowerName = optionName.toLowerCase();
  if (lowerName.includes('urgent')) return OPTION_ICONS.urgenta;
  if (lowerName.includes('traduc')) return OPTION_ICONS.traducere;
  if (lowerName.includes('apostil')) return OPTION_ICONS.apostila;
  if (lowerName.includes('cop')) return OPTION_ICONS.copii;
  return OPTION_ICONS.default;
}

export function OptionsStep({ onValidChange }: OptionsStepProps) {
  const { state, updateSelectedOptions, priceBreakdown } = useOrderWizard();
  const { serviceOptions, selectedOptions, service } = state;

  // Options are always valid (they're optional)
  useEffect(() => {
    onValidChange(true);
  }, [onValidChange]);

  // Group options by type
  const groupedOptions = useMemo(() => {
    const groups: Record<string, ServiceOption[]> = {
      speed: [],
      translations: [],
      addons: [],
    };

    serviceOptions.forEach((option) => {
      const lowerName = option.name.toLowerCase();
      if (lowerName.includes('urgent')) {
        groups.speed.push(option);
      } else if (lowerName.includes('traduc') || lowerName.includes('limba')) {
        groups.translations.push(option);
      } else {
        groups.addons.push(option);
      }
    });

    return groups;
  }, [serviceOptions]);

  // Check if option is selected
  const isSelected = (optionId: string) => {
    return selectedOptions.some((o) => o.option_id === optionId);
  };

  // Get selected option data
  const getSelectedOption = (optionId: string) => {
    return selectedOptions.find((o) => o.option_id === optionId);
  };

  // Toggle option selection
  const toggleOption = (option: ServiceOption) => {
    if (isSelected(option.id)) {
      // Remove option
      updateSelectedOptions(selectedOptions.filter((o) => o.option_id !== option.id));
    } else {
      // Add option
      const newOption: SelectedOption = {
        option_id: option.id,
        option_name: option.name,
        quantity: 1,
        price_modifier: option.price,
      };
      updateSelectedOptions([...selectedOptions, newOption]);
    }
  };

  // Update quantity for an option
  const updateQuantity = (optionId: string, delta: number) => {
    const updated = selectedOptions.map((opt) => {
      if (opt.option_id === optionId) {
        const newQty = Math.max(1, opt.quantity + delta);
        return { ...opt, quantity: newQty };
      }
      return opt;
    });
    updateSelectedOptions(updated);
  };

  // Render option card
  const renderOptionCard = (option: ServiceOption, showQuantity = false) => {
    const Icon = getOptionIcon(option.name);
    const selected = isSelected(option.id);
    const selectedData = getSelectedOption(option.id);
    const isUrgent = option.name.toLowerCase().includes('urgent');

    return (
      <div
        key={option.id}
        onClick={() => toggleOption(option)}
        className={cn(
          'relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
          selected
            ? 'border-primary-500 bg-primary-50 shadow-md'
            : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50',
          isUrgent && !selected && 'border-amber-200 bg-amber-50/50'
        )}
      >
        {/* Selection Indicator */}
        <div
          className={cn(
            'absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
            selected
              ? 'bg-primary-500 border-primary-500'
              : 'border-neutral-300 bg-white'
          )}
        >
          {selected && <CheckCircle className="w-4 h-4 text-secondary-900" />}
        </div>

        <div className="flex gap-3">
          {/* Icon */}
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              selected ? 'bg-primary-200' : isUrgent ? 'bg-amber-100' : 'bg-neutral-100'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5',
                selected
                  ? 'text-primary-700'
                  : isUrgent
                  ? 'text-amber-600'
                  : 'text-neutral-600'
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-secondary-900">{option.name}</h4>
            </div>
            {option.description && (
              <p className="text-sm text-neutral-600 mt-1">{option.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  'text-sm font-bold px-2 py-0.5 rounded',
                  selected
                    ? 'bg-primary-200 text-primary-800'
                    : 'bg-neutral-100 text-neutral-700'
                )}
              >
                +{option.price} RON
              </span>
              {isUrgent && (
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Livrare rapidă
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quantity Selector (for multi-quantity options) */}
        {showQuantity && selected && selectedData && (
          <div className="mt-3 pt-3 border-t border-primary-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Cantitate:</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(option.id, -1);
                  }}
                  disabled={selectedData.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold">
                  {selectedData.quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(option.id, 1);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (serviceOptions.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          Nu sunt opțiuni suplimentare disponibile
        </h3>
        <p className="text-neutral-600">
          Poți continua la pasul următor pentru a finaliza comanda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Speed Options (Urgency) */}
      {groupedOptions.speed.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-secondary-900">Procesare Rapidă</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupedOptions.speed.map((option) => renderOptionCard(option))}
          </div>
        </div>
      )}

      {/* Translation Options */}
      {groupedOptions.translations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-secondary-900">Traduceri</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupedOptions.translations.map((option) => renderOptionCard(option))}
          </div>
        </div>
      )}

      {/* Other Add-ons */}
      {groupedOptions.addons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-secondary-900">Opțiuni Suplimentare</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupedOptions.addons.map((option) =>
              renderOptionCard(option, option.name.toLowerCase().includes('cop'))
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-neutral-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-secondary-900 mb-1">
              Rezumat Selecții
            </h4>
            {selectedOptions.length === 0 ? (
              <p className="text-sm text-neutral-600">
                Nu ai selectat nicio opțiune suplimentară. Poți continua cu prețul
                de bază de {service?.base_price} RON.
              </p>
            ) : (
              <div className="space-y-1">
                {selectedOptions.map((opt) => (
                  <div
                    key={opt.option_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-neutral-700">
                      {opt.option_name}
                      {opt.quantity > 1 && ` x${opt.quantity}`}
                    </span>
                    <span className="font-medium text-secondary-900">
                      +{opt.price_modifier * opt.quantity} RON
                    </span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-neutral-200 flex items-center justify-between text-sm font-semibold">
                  <span className="text-neutral-700">Total opțiuni:</span>
                  <span className="text-primary-600">
                    +{priceBreakdown.optionsPrice} RON
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skip Info */}
      <p className="text-sm text-center text-neutral-500">
        Opțiunile sunt opționale. Poți continua fără a selecta nimic.
      </p>
    </div>
  );
}
