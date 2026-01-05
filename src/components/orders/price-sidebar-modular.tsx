'use client';

/**
 * Price Sidebar for Modular Wizard
 *
 * Shows price breakdown based on selected options.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Service } from '@/types/services';
import { Shield, Truck, CheckCircle } from 'lucide-react';

interface PriceSidebarModularProps {
  service: Service;
}

export function PriceSidebarModular({ service }: PriceSidebarModularProps) {
  const { state, priceBreakdown } = useModularWizard();

  return (
    <Card className="border border-neutral-200 shadow-sm overflow-hidden !p-0 !gap-0">
      <div className="bg-secondary-900 text-white py-3 px-4">
        <h3 className="text-base font-semibold">Rezumat Comandă</h3>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Service Name */}
        <div>
          <h3 className="font-semibold text-secondary-900 text-sm">{service.name}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">{service.short_description}</p>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          {/* Base Price */}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Preț serviciu</span>
            <span className="font-medium">{priceBreakdown.basePrice} RON</span>
          </div>

          {/* Selected Options */}
          {state.selectedOptions.map((option, index) => {
            const price = typeof option.priceModifier === 'number' && !isNaN(option.priceModifier)
              ? option.priceModifier
              : 0;
            return (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-neutral-600">{option.optionName}</span>
                <span className="font-medium">+{price * (option.quantity || 1)} RON</span>
              </div>
            );
          })}

          {/* Delivery */}
          {state.delivery.method && state.delivery.price > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 flex items-center gap-1">
                <Truck className="h-3 w-3" />
                {state.delivery.methodName}
              </span>
              <span className="font-medium">+{state.delivery.price} RON</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-secondary-900">Total</span>
          <span className="text-2xl font-bold text-primary-600">
            {priceBreakdown.totalPrice} RON
          </span>
        </div>

        {/* Estimated Delivery */}
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-500 mb-1">Timp estimat livrare</p>
          <p className="text-sm font-semibold text-secondary-900">
            {service.estimated_days} zile lucrătoare
          </p>
        </div>

        {/* Trust Badges */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Plată securizată 100%</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Garanție rambursare</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
