'use client';

/**
 * Unified order sidebar — used by BOTH the wizard (live state) and the
 * checkout page (post-submit API data). Renders:
 *   1. OrderSummaryCard (nested main service + secondary services + total)
 *   2. Estimated delivery time block (dynamic per add-ons)
 *   3. Trust badges
 *
 * Inputs are pre-shaped so the wrappers (`PriceSidebarModular` for wizard,
 * `checkout/[orderId]/page.tsx` for checkout) can pull from their own state
 * sources without duplicating the layout. Anything visual lives here so
 * the two pages stay in sync — adding a row in one place propagates to
 * both surfaces.
 */

import { OrderSummaryCard } from '@/components/payment';

interface OrderSidebarOption {
  name: string;
  price: number;
  optionId?: string;
  bundledForParentId?: string;
}

export interface OrderSidebarProps {
  orderNumber: string;
  serviceName: string;
  basePrice: number;
  options?: OrderSidebarOption[];
  deliveryMethod?: string;
  deliveryPrice?: number;
  totalPrice: number;
  subtotalWithoutVat?: number;
  vatAmount?: number;
  couponCode?: string | null;
  discountAmount?: number;
  /** Pre-computed text like "5-7 zile lucrătoare" or "2-4 zile lucrătoare". */
  deliveryTimeText: string;
  /** "Ce primești" — delivered document, shown under the base service. */
  deliverableText?: string;
  /** Show the orange "⚡ Procesare urgentă activată" hint under the time. */
  urgencyActive?: boolean;
  /**
   * Which parts to render:
   *  - 'full'    (default) — price summary + estimated time + trust badges
   *  - 'summary' — only the price breakdown card (used in the mobile dropdown)
   *  - 'extras'  — only estimated time + trust badges (shown in the mobile form)
   */
  variant?: 'full' | 'summary' | 'extras';
  /** When true, the estimated time is shown INSIDE the summary card (under the
   *  base service) instead of as a separate card. Used on checkout. */
  timeInSummary?: boolean;
  /** When true, hide the "Timp estimat livrare" card entirely (instant-digital
   *  services rely on the live SystemStatus badge instead). */
  hideDeliveryTimeCard?: boolean;
  /** When true, hide the "Plată securizată / Garanție rambursare" trust badges. */
  hideTrustBadges?: boolean;
}

export function OrderSidebar({
  orderNumber,
  serviceName,
  basePrice,
  options = [],
  deliveryMethod,
  deliveryPrice = 0,
  totalPrice,
  subtotalWithoutVat,
  vatAmount,
  couponCode,
  discountAmount = 0,
  deliveryTimeText,
  deliverableText,
  variant = 'full',
  hideDeliveryTimeCard = false,
}: OrderSidebarProps) {
  const showSummary = variant === 'full' || variant === 'summary';
  return (
    <div className="space-y-3">
      {showSummary && (
        <OrderSummaryCard
          orderNumber={orderNumber}
          serviceName={serviceName}
          basePrice={basePrice}
          options={options}
          deliveryMethod={deliveryMethod}
          deliveryPrice={deliveryPrice}
          totalPrice={totalPrice}
          subtotalWithoutVat={subtotalWithoutVat}
          vatAmount={vatAmount}
          couponCode={couponCode}
          discountAmount={discountAmount}
          deliveryTimeText={!hideDeliveryTimeCard ? deliveryTimeText : undefined}
          deliverableText={deliverableText}
        />
      )}
    </div>
  );
}
