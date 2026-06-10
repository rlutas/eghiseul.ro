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

import { Card, CardContent } from '@/components/ui/card';
import { Shield, CheckCircle, Clock } from 'lucide-react';
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
  /** Show the orange "⚡ Procesare urgentă activată" hint under the time. */
  urgencyActive?: boolean;
  /**
   * Which parts to render:
   *  - 'full'    (default) — price summary + estimated time + trust badges
   *  - 'summary' — only the price breakdown card (used in the mobile dropdown)
   *  - 'extras'  — only estimated time + trust badges (shown in the mobile form)
   */
  variant?: 'full' | 'summary' | 'extras';
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
  urgencyActive = false,
  variant = 'full',
}: OrderSidebarProps) {
  const showSummary = variant === 'full' || variant === 'summary';
  const showExtras = variant === 'full' || variant === 'extras';
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
        />
      )}

      {/* Estimated delivery */}
      {showExtras && (
      <Card className="bg-white border-neutral-200">
        <CardContent className="p-3.5 flex items-start gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 shrink-0">
            <Clock className="h-3.5 w-3.5 text-primary-600" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-neutral-500">Timp estimat livrare</p>
            <p className="text-sm font-semibold text-secondary-900 leading-tight">
              {deliveryTimeText}
            </p>
            {urgencyActive && (
              <p className="text-[10px] text-primary-600 font-medium mt-0.5">
                ⚡ Procesare urgentă activată
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Trust badges */}
      {showExtras && (
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
      )}
    </div>
  );
}
