'use client';

import { Package, Truck, Tag, Receipt, TicketPercent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderOption {
  name: string;
  price: number;
}

interface OrderSummaryCardProps {
  orderNumber: string;
  serviceName: string;
  basePrice: number;
  options?: OrderOption[];
  deliveryMethod?: string;
  deliveryPrice?: number;
  totalPrice: number;
  /** Subtotal fără TVA (VAT-exclusive). If not passed, derived from totalPrice. */
  subtotalWithoutVat?: number;
  /** TVA value in RON. If not passed, derived from totalPrice. */
  vatAmount?: number;
  /** Optional applied coupon code. */
  couponCode?: string | null;
  /** Optional discount amount in RON (positive number). */
  discountAmount?: number;
}

function fmt(value: number): string {
  return value.toFixed(2);
}

export function OrderSummaryCard({
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
}: OrderSummaryCardProps) {
  const VAT_RATE = 0.21;
  const computedSubtotal =
    subtotalWithoutVat ?? Math.round((totalPrice / (1 + VAT_RATE)) * 100) / 100;
  const computedVat =
    vatAmount ?? Math.round((totalPrice - computedSubtotal) * 100) / 100;
  const hasDiscount = !!couponCode && discountAmount > 0;

  return (
    <Card className="overflow-hidden bg-white !py-0 !gap-0">
      <CardHeader className="!px-4 !py-3.5 border-b border-neutral-100 bg-primary-50/50 [&[class*='border-b']]:!pb-3.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-secondary-900 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 shrink-0 ring-2 ring-white shadow-sm">
              <Receipt className="h-4 w-4 text-white" />
            </span>
            <span className="leading-none truncate">Rezumat comandă</span>
          </CardTitle>
          {orderNumber && (
            <span className="inline-flex items-center rounded-md border border-primary-200/70 bg-white px-2 py-1 text-[11px] font-mono text-neutral-600 shrink-0 truncate max-w-[140px]">
              {orderNumber}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Service */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <Package className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-secondary-900 leading-snug">
                {serviceName}
              </p>
              <p className="text-xs text-neutral-500">Serviciu de bază</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-secondary-900 shrink-0 tabular-nums">
            {fmt(basePrice)} RON
          </p>
        </div>

        {/* Options */}
        {options.length > 0 && (
          <div className="space-y-2 border-t border-neutral-100 pt-3">
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <Tag className="h-3.5 w-3.5 text-neutral-400 mt-1 shrink-0" />
                  <p className="text-sm text-secondary-800 leading-snug min-w-0">
                    {option.name}
                  </p>
                </div>
                <p className="text-sm text-secondary-800 shrink-0 tabular-nums">
                  +{fmt(option.price)} RON
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Delivery */}
        {deliveryMethod && (
          <div className="flex items-start justify-between gap-3 border-t border-neutral-100 pt-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Truck className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-secondary-900 leading-snug">
                  {deliveryMethod}
                </p>
                <p className="text-xs text-neutral-500">Livrare</p>
              </div>
            </div>
            <p className="text-sm text-secondary-900 shrink-0 tabular-nums">
              {(deliveryPrice || 0) > 0 ? `+${fmt(deliveryPrice)} RON` : 'Gratuit'}
            </p>
          </div>
        )}

        {/* Coupon discount */}
        {hasDiscount && (
          <div className="flex items-start justify-between gap-3 border-t border-neutral-100 pt-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <TicketPercent className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-emerald-700 leading-snug">
                  Cupon {couponCode}
                </p>
                <p className="text-xs text-neutral-500">Reducere aplicată</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-emerald-700 shrink-0 tabular-nums">
              −{fmt(discountAmount)} RON
            </p>
          </div>
        )}

        {/* Subtotal + TVA breakdown */}
        <div className="border-t border-neutral-100 pt-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Subtotal (fără TVA)</span>
            <span className="tabular-nums">{fmt(computedSubtotal)} RON</span>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>TVA 21%</span>
            <span className="tabular-nums">{fmt(computedVat)} RON</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t-2 border-neutral-200 pt-3">
          <p className="text-sm font-semibold text-secondary-900">Total</p>
          <p className="text-xl font-bold text-primary-600 tabular-nums">
            {fmt(totalPrice)} RON
          </p>
        </div>

        <p className="text-[11px] text-neutral-400 text-center pt-1">
          Prețurile includ TVA 21%
        </p>
      </CardContent>
    </Card>
  );
}
