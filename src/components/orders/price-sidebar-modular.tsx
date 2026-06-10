'use client';

/**
 * Wizard sidebar — thin adapter that maps live wizard state onto the shared
 * <OrderSidebar> component used on both /comanda (this) and
 * /comanda/checkout/[id]. Anything visual lives in OrderSidebar so the two
 * pages stay in lockstep.
 */

import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Service } from '@/types/services';
import { normalizeOrderOptions } from '@/lib/orders/normalize';
import { estimateFromSelectedOptions } from '@/lib/delivery-calculator';
import { OrderSidebar } from './order-sidebar';

interface PriceSidebarModularProps {
  service: Service;
  /** 'summary' = price only (mobile dropdown); 'extras' = time + badges
   *  (mobile form); 'full' (default) = everything (desktop sidebar). */
  variant?: 'full' | 'summary' | 'extras';
}

export function PriceSidebarModular({ service, variant = 'full' }: PriceSidebarModularProps) {
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
  // used by the API + checkout page so the rendered list is identical
  // regardless of which surface the customer is on. Carry optionId +
  // bundledForParentId so OrderSummaryCard can group bundled children under
  // their parent secondary service.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawSelected = state.selectedOptions as any[];
  const options = normalizeOrderOptions(rawSelected).map((opt, idx) => {
    const raw = rawSelected[idx] || {};
    return {
      name: opt.quantity > 1 ? `${opt.name} × ${opt.quantity}` : opt.name,
      price: opt.total,
      optionId: opt.optionId ?? raw.optionId ?? raw.option_id,
      bundledForParentId: opt.bundledForParentId,
    };
  });

  const VAT_RATE = 0.21;
  const subtotalWithoutVat =
    Math.round((priceBreakdown.totalPrice / (1 + VAT_RATE)) * 100) / 100;
  const vatAmount =
    Math.round((priceBreakdown.totalPrice - subtotalWithoutVat) * 100) / 100;

  // Delivery estimate — full math via the shared calculator. Sums per-step
  // business days: base processing (or "urgent" if the user toggled it) +
  // each document add-on (traducere/legalizare/apostila*) + courier leg.
  // Bundled add-ons share the parent's processing slot (deduped by code).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasUrgentaMain = state.selectedOptions.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (o: any) => o.code === 'urgenta' && !o.bundledFor
  );
  const courierCode = (state.delivery.method as string | undefined) || null;
  const estimate = estimateFromSelectedOptions({
    selectedOptions:
      state.selectedOptions as unknown as Parameters<
        typeof estimateFromSelectedOptions
      >[0]['selectedOptions'],
    baseDays: service.estimated_days,
    courier: courierCode,
    includeCourierLeg: !!courierCode,
  });
  const deliveryTimeText: string =
    estimate.minDays === estimate.maxDays
      ? `${estimate.minDays} zile lucrătoare`
      : `${estimate.minDays}-${estimate.maxDays} zile lucrătoare`;

  return (
    <OrderSidebar
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
      deliveryTimeText={deliveryTimeText}
      urgencyActive={hasUrgentaMain}
      variant={variant}
    />
  );
}
