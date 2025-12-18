'use client';

import { Shield, Clock, Zap, FileText, Truck, Tag, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useOrderWizard } from '@/providers/order-wizard-provider';

export function PriceSidebar() {
  const { state, priceBreakdown } = useOrderWizard();

  if (!state.service) {
    return null;
  }

  const { service, selectedOptions, deliverySelection } = state;
  const { basePrice, optionsPrice, deliveryPrice, discountAmount, totalPrice, currency } =
    priceBreakdown;

  // Calculate estimated delivery
  const estimatedDays = service.estimated_days;
  const hasUrgent = selectedOptions.some((opt) =>
    opt.option_name.toLowerCase().includes('urgent')
  );
  const finalDays = hasUrgent && service.urgent_days ? service.urgent_days : estimatedDays;

  return (
    <Card className="border border-neutral-200 shadow-sm overflow-hidden">
      {/* Service Header */}
      <CardHeader className="bg-secondary-900 text-white p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-secondary-900" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-white">
              {service.name}
            </CardTitle>
            {service.urgent_available && (
              <Badge className="mt-1 bg-primary-500/20 text-primary-400 border-0">
                <Zap className="h-3 w-3 mr-1" />
                Urgent disponibil
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Price Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wide">
            Detalii Preț
          </h3>

          {/* Base Price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Preț de bază</span>
            <span className="font-medium text-secondary-900">
              {basePrice} {currency}
            </span>
          </div>

          {/* Selected Options */}
          {selectedOptions.length > 0 && (
            <>
              {selectedOptions.map((option) => (
                <div
                  key={option.option_id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-neutral-600 flex items-center gap-1">
                    <Check className="h-3 w-3 text-primary-500" />
                    {option.option_name}
                    {option.quantity > 1 && ` (x${option.quantity})`}
                  </span>
                  <span className="font-medium text-secondary-900">
                    +{option.price_modifier * option.quantity} {currency}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* Delivery */}
          {deliverySelection.method && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 flex items-center gap-1">
                <Truck className="h-3 w-3 text-primary-500" />
                {deliverySelection.method.name}
              </span>
              <span className="font-medium text-secondary-900">
                {deliveryPrice === 0 ? 'Gratuit' : `+${deliveryPrice} ${currency}`}
              </span>
            </div>
          )}

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-sm text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Reducere aplicată
              </span>
              <span className="font-medium">-{discountAmount} {currency}</span>
            </div>
          )}

          <Separator className="my-3" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-secondary-900">Total</span>
            <span className="text-xl font-bold text-primary-600">
              {totalPrice} {currency}
            </span>
          </div>
        </div>

        <Separator />

        {/* Delivery Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wide">
            Estimare Livrare
          </h3>

          <div className="flex items-start gap-3 text-sm">
            <Clock className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-secondary-900">
                {finalDays === 1 ? '24 ore' : `${finalDays} zile lucrătoare`}
              </p>
              <p className="text-neutral-500 text-xs">
                Termen{hasUrgent ? ' urgent' : ' standard'}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Trust Badges */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-secondary-900">100% Legal</p>
              <p className="text-neutral-500 text-xs">
                Document oficial cu valabilitate juridică
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-secondary-900">Plată Securizată</p>
              <p className="text-neutral-500 text-xs">
                Plată prin Stripe cu criptare SSL
              </p>
            </div>
          </div>
        </div>

        {/* Promo Code (Future Feature) */}
        {/*
        <Separator />
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary-900">
            Cod promoțional
          </label>
          <div className="flex gap-2">
            <Input placeholder="Introdu codul" className="h-9" />
            <Button variant="outline" size="sm">
              Aplică
            </Button>
          </div>
        </div>
        */}
      </CardContent>
    </Card>
  );
}
