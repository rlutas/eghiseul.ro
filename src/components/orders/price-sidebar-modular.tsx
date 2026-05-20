'use client';

/**
 * Price Sidebar for Modular Wizard
 *
 * Wraps the canonical <OrderSummaryCard> so the wizard sidebar and the checkout
 * page render the SAME visual + breakdown. Adds wizard-specific extras
 * (estimated delivery + trust badges) below the card.
 */

import { Card, CardContent } from '@/components/ui/card';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Service } from '@/types/services';
import { Shield, CheckCircle, Clock } from 'lucide-react';
import { OrderSummaryCard } from '@/components/payment';
import { normalizeOrderOptions } from '@/lib/orders/normalize';

interface PriceSidebarModularProps {
  service: Service;
}

export function PriceSidebarModular({ service }: PriceSidebarModularProps) {
  const { state, priceBreakdown } = useModularWizard();

  // Append client type suffix to service name when applicable (e.g.
  // "Cazier Judiciar" → "Cazier Judiciar PF" / "PJ"). Driven by service config
  // — services that don't offer a client-type selection stay unchanged.
  const showsClientType =
    !!state.verificationConfig?.clientTypeSelection?.enabled;
  const serviceName =
    showsClientType && state.clientType
      ? `${service.name} ${state.clientType}`
      : service.name;

  // Normalize wizard's live selectedOptions through the same canonical helper
  // used by the API + checkout page, so the rendered list is identical.
  const options = normalizeOrderOptions(state.selectedOptions).map((opt) => ({
    name: opt.quantity > 1 ? `${opt.name} × ${opt.quantity}` : opt.name,
    price: opt.total,
  }));

  const VAT_RATE = 0.21;
  const subtotalWithoutVat =
    Math.round((priceBreakdown.totalPrice / (1 + VAT_RATE)) * 100) / 100;
  const vatAmount =
    Math.round((priceBreakdown.totalPrice - subtotalWithoutVat) * 100) / 100;

  return (
    <div className="space-y-3">
      <OrderSummaryCard
        orderNumber={state.friendlyOrderId || ''}
        serviceName={serviceName}
        basePrice={priceBreakdown.basePrice}
        options={options}
        deliveryMethod={
          state.delivery.method && state.delivery.price >= 0
            ? state.delivery.methodName || state.delivery.method
            : undefined
        }
        deliveryPrice={state.delivery.price}
        totalPrice={priceBreakdown.totalPrice}
        subtotalWithoutVat={subtotalWithoutVat}
        vatAmount={vatAmount}
        couponCode={state.coupon?.code ?? null}
        discountAmount={priceBreakdown.discountAmount}
      />

      {/* Estimated delivery */}
      <Card className="bg-white border-neutral-200">
        <CardContent className="p-3.5 flex items-start gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 shrink-0">
            <Clock className="h-3.5 w-3.5 text-primary-600" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-neutral-500">Timp estimat livrare</p>
            <p className="text-sm font-semibold text-secondary-900 leading-tight">
              {service.processing_config?.estimated_days_display
                ?? `${service.estimated_days} zile lucrătoare`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trust badges */}
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
          <span>Plată securizată 100%</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          <span>Garanție rambursare</span>
        </div>
      </div>
    </div>
  );
}
