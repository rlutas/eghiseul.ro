'use client';

import { Truck, Receipt, TicketPercent, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderOption {
  name: string;
  price: number;
  /** Stable option id used to nest bundled children under their parent. */
  optionId?: string;
  /** If set, this option is bundled under another (e.g. add-ons attached to
   *  a Certificat Integritate sub-service). The renderer indents it under
   *  the parent identified by optionId. */
  bundledForParentId?: string;
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
  /** Optional estimated delivery time (e.g. "3 zile lucrătoare"). When passed,
   *  it's shown inline under the base service instead of as a separate card. */
  deliveryTimeText?: string;
  /** "Ce primești" — the delivered document for this service. */
  deliverableText?: string;
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
  deliveryTimeText,
  deliverableText,
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
        <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-secondary-900 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 shrink-0 ring-2 ring-white shadow-sm">
            <Receipt className="h-4 w-4 text-white" />
          </span>
          <span className="leading-none truncate">Rezumat comandă</span>
        </CardTitle>
        {/* Order code — own labelled row so it's actually visible (was a tiny
            grey badge tucked in the corner). */}
        {orderNumber && (
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-primary-200 bg-white px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Cod comandă
            </span>
            <span
              className="font-mono text-sm font-bold text-primary-700 whitespace-nowrap"
              title={orderNumber}
            >
              {orderNumber}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Service + its options (nested) — bundled sub-services with their
            own add-ons render as a separate group below. The visual tree:
              Cazier Judiciar PF                 198 RON
                ↳ Procesare Urgentă             +80 RON
                ↳ Apostilă de la Haga          +238 RON
              Certificat Integritate           +100 RON
                ↳ Apostilă de la Haga          +238 RON
                ↳ Traducere Autorizată         +178.50 RON
            The vertical primary-100 rule makes the parent→child relationship
            unambiguous in both groups. */}
        {(() => {
          // Top-level options (no bundledForParentId) belong to the main
          // service. Bundled options nest under their respective parent.
          const topLevel = options.filter((o) => !o.bundledForParentId);
          const childrenByParent = new Map<string, OrderOption[]>();
          for (const o of options) {
            if (o.bundledForParentId) {
              const list = childrenByParent.get(o.bundledForParentId) ?? [];
              list.push(o);
              childrenByParent.set(o.bundledForParentId, list);
            }
          }
          // A top-level option is treated as a "sub-service" group when it
          // has bundled children pointing to it. Everything else is a direct
          // add-on of the main service. (Procesare Urgentă, Apostilă, etc.
          // for plain Cazier Judiciar = direct main-service add-ons.)
          const subServices = topLevel.filter(
            (o) => o.optionId && (childrenByParent.get(o.optionId)?.length ?? 0) > 0
          );
          const mainAddons = topLevel.filter(
            (o) => !(o.optionId && (childrenByParent.get(o.optionId)?.length ?? 0) > 0)
          );
          // Bundled options whose declared parent isn't in the list anymore
          // (legacy/edge case) — render at the bottom so they don't disappear.
          const orphans = options.filter(
            (o) =>
              o.bundledForParentId &&
              !topLevel.some((p) => p.optionId === o.bundledForParentId)
          );
          return (
            <>
              {/* Main service block — base price + its direct add-ons nested. */}
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-secondary-900 leading-snug">
                      {serviceName}
                    </p>
                    <p className="text-xs text-neutral-500">Serviciu de bază</p>
                    {deliverableText && (
                      <p className="mt-0.5 text-xs text-neutral-600">
                        Primești: <span className="font-medium text-secondary-900">{deliverableText}</span>
                      </p>
                    )}
                    {deliveryTimeText && (
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-neutral-500">
                        <Clock className="h-3 w-3 text-primary-500 shrink-0" />
                        Timp estimat: <span className="font-medium text-secondary-900">{deliveryTimeText}</span>
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-secondary-900 shrink-0 tabular-nums">
                    {fmt(basePrice)} RON
                  </p>
                </div>
                {mainAddons.length > 0 && (
                  <div className="pl-3 ml-1 border-l-2 border-primary-100 space-y-1 pt-1">
                    {mainAddons.map((opt, idx) => (
                      <div
                        key={opt.optionId || `m-${idx}`}
                        className="flex items-start justify-between gap-3"
                      >
                        <p className="text-xs text-neutral-700 leading-snug min-w-0">
                          {opt.name}
                        </p>
                        <p className="text-xs text-neutral-700 shrink-0 tabular-nums">
                          +{fmt(opt.price)} RON
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bundled sub-services — each is its own block with the same
                  visual treatment as the main service: name + price on top,
                  nested children under a primary-100 vertical rule. */}
              {subServices.map((sub, idx) => {
                const kids = (sub.optionId && childrenByParent.get(sub.optionId)) || [];
                return (
                  <div
                    key={sub.optionId || `sub-${idx}`}
                    className="space-y-1.5 border-t border-neutral-100 pt-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-secondary-900 leading-snug">
                          {sub.name}
                        </p>
                        <p className="text-xs text-neutral-500">Serviciu secundar</p>
                      </div>
                      <p className="text-sm font-semibold text-secondary-900 shrink-0 tabular-nums">
                        +{fmt(sub.price)} RON
                      </p>
                    </div>
                    {kids.length > 0 && (
                      <div className="pl-3 ml-1 border-l-2 border-primary-100 space-y-1 pt-1">
                        {kids.map((kid, kidIdx) => (
                          <div
                            key={kid.optionId || `sk-${idx}-${kidIdx}`}
                            className="flex items-start justify-between gap-3"
                          >
                            <p className="text-xs text-neutral-700 leading-snug min-w-0">
                              {kid.name}
                            </p>
                            <p className="text-xs text-neutral-700 shrink-0 tabular-nums">
                              +{fmt(kid.price)} RON
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {orphans.length > 0 && (
                <div className="border-t border-neutral-100 pt-3 space-y-1">
                  {orphans.map((kid, kidIdx) => (
                    <div
                      key={kid.optionId || `o-${kidIdx}`}
                      className="flex items-start justify-between gap-3"
                    >
                      <p className="text-sm text-secondary-800 leading-snug min-w-0">
                        {kid.name}
                      </p>
                      <p className="text-sm text-secondary-800 shrink-0 tabular-nums">
                        +{fmt(kid.price)} RON
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}

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
