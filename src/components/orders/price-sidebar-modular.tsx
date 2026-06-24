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
import { SystemStatus } from '@/components/services/system-status';
import { useCivilStatusTerms } from '@/hooks/use-civil-status-terms';
import { resolveCivilTermTier } from '@/lib/civil-status/delivery-terms';
import { getServiceSpecimen } from '@/config/service-specimens';
import Image from 'next/image';

interface PriceSidebarModularProps {
  service: Service;
  /** 'summary' = price only (mobile dropdown); 'extras' = time + badges
   *  (mobile form); 'full' (default) = everything (desktop sidebar). */
  variant?: 'full' | 'summary' | 'extras';
}

export function PriceSidebarModular({ service, variant = 'full' }: PriceSidebarModularProps) {
  const { state, priceBreakdown } = useModularWizard();
  const civilTiers = useCivilStatusTerms();

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
  // Constatator is digital + auto-issued — minutes, not business days.
  // Constatator + extras carte funciară are digital + auto-issued — minutes, not days.
  const isInstantDigital =
    service.slug === 'certificat-constatator' || service.slug === 'extras-carte-funciara';

  // Civil-status (naștere/căsătorie/celibat): termenul de procesare depinde de
  // oficiul de înregistrare (registrationPlace). Suprascrie calculul numeric.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isCivilStatus = !!(state.verificationConfig as any)?.civilStatus;
  const civilTerm =
    isCivilStatus && state.civilStatus?.registrationPlace
      ? resolveCivilTermTier(state.civilStatus.registrationPlace, civilTiers)
      : null;

  const deliveryTimeText: string = isInstantDigital
    ? 'câteva minute (24/7)'
    : civilTerm
      ? civilTerm.display
      : estimate.minDays === estimate.maxDays
        ? `${estimate.minDays} zile lucrătoare`
        : `${estimate.minDays}-${estimate.maxDays} zile lucrătoare`;

  const specimen = getServiceSpecimen(service.slug);

  return (
    <div className="space-y-3">
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
        hideDeliveryTimeCard={isInstantDigital}
        hideTrustBadges={isInstantDigital}
      />
      {/* Live system status — replaces the delivery-time card for instant-digital
          services. ANCPI for carte funciară, ONRC for constatator. */}
      {isInstantDigital && variant === 'full' && (
        <SystemStatus service={service.slug === 'extras-carte-funciara' ? 'ancpi' : 'onrc'} />
      )}

      {/* Specimen document — așa arată ce primește clientul (doar sidebar desktop). */}
      {variant === 'full' && specimen && (
        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <p className="text-xs font-medium text-neutral-500 mb-2">
            Așa arată documentul pe care îl primești
          </p>
          <Image
            src={specimen.src}
            alt={specimen.alt}
            width={400}
            height={560}
            className="w-full h-auto rounded-lg border border-neutral-100"
          />
          <p className="text-[10px] text-neutral-400 mt-1.5 text-center">
            Model orientativ
          </p>
        </div>
      )}
    </div>
  );
}
