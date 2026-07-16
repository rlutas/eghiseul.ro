'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Truck,
  CreditCard,
  Shield,
  Edit,
  Package,
  FileText,
  Ticket,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useModularWizard } from '@/providers/modular-wizard-provider';


interface ReviewStepProps {
  onValidChange: (valid: boolean) => void;
}

export function ReviewStepModular({ onValidChange }: ReviewStepProps) {
  const { state, service, priceBreakdown, goToStep, updateConsent, applyCoupon, clearCoupon, validationAttempt } = useModularWizard();

  // «Plătește» tapped without the consent ticked → point at the checkbox.
  // Baseline captured at mount so failed attempts on previous steps don't
  // flash this immediately.
  const [validationBaseline] = useState(validationAttempt);
  const showConsentError = validationAttempt !== validationBaseline;
  const { termsAccepted, privacyAccepted, withdrawalWaiver } = state.consent;

  // Coupon input state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Introdu un cod de cupon');
      return;
    }
    setCouponLoading(true);
    setCouponError(null);
    try {
      // Subtotal = sum before discount (service base + options + delivery)
      const subtotal =
        priceBreakdown.basePrice + priceBreakdown.optionsPrice + priceBreakdown.deliveryPrice;

      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.valid) {
        applyCoupon({
          code: json.data.coupon.code,
          discountAmount: json.data.discount,
          discountType: json.data.coupon.discount_type,
          discountValue: Number(json.data.coupon.discount_value),
        });
        setCouponInput('');
      } else {
        setCouponError(json.error || 'Cupon invalid');
      }
    } catch {
      setCouponError('Eroare de retea');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    clearCoupon();
    setCouponInput('');
    setCouponError(null);
  };

  // Combined-consent UX (2026-05-27, aligned with cazierjudiciaronline.com):
  // We show ONE checkbox that bundles T&C + Privacy + the 14-day withdrawal
  // waiver. Internally we keep the three legal flags separate on
  // `state.consent` so the audit log + contract metadata stay granular
  // (required by Law 214/2024 / OUG 34/2014 for the legal trail).
  const acceptAll = termsAccepted && privacyAccepted && withdrawalWaiver;
  const setAcceptAll = (v: boolean) =>
    updateConsent({ termsAccepted: v, privacyAccepted: v, withdrawalWaiver: v });

  // Auto-tick the combined consent the moment the user has finished the
  // signature step. The signature itself already counts as an expression of
  // consent (Legea 214/2024 / eIDAS), so making the customer re-confirm the
  // same thing on the next screen is friction without legal value. The
  // checkbox remains editable — if they untick it, validation blocks payment.
  const hasSignature = !!state.signature?.signatureBase64;
  useEffect(() => {
    if (hasSignature && !acceptAll) {
      setAcceptAll(true);
    }
    // We don't re-run when acceptAll changes — only when signature lands —
    // otherwise an unticking the box would immediately re-tick it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSignature]);

  // Validate step — single combined consent gates "Plătește".
  useEffect(() => {
    onValidChange(acceptAll);
  }, [acceptAll, onValidChange]);

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div>
        <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-500" />
          Rezumat Comandă
        </h3>

        <div className="space-y-4">
          {/* Contact Info */}
          <Card className="border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-secondary-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-neutral-500" />
                  Date Contact
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep('contact')}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editează
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Mail className="h-3.5 w-3.5" />
                  {state.contact.email || '-'}
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="h-3.5 w-3.5" />
                  {state.contact.phone || '-'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Data (if available) */}
          {state.personalKyc && (
            <Card className="border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-secondary-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-500" />
                    Date Personale
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep('personal-data')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editează
                  </Button>
                </div>
                <div className="space-y-1 text-sm text-neutral-600">
                  <p>
                    <strong>Nume:</strong> {state.personalKyc.firstName} {state.personalKyc.lastName}
                  </p>
                  <p>
                    <strong>CNP:</strong> {state.personalKyc.cnp ? `****${state.personalKyc.cnp.slice(-4)}` : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Data (if available) */}
          {state.companyKyc && state.companyKyc.cui && (
            <Card className="border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-secondary-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-neutral-500" />
                    Date Firmă
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep('company-data')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editează
                  </Button>
                </div>
                <div className="space-y-1 text-sm text-neutral-600">
                  <p>
                    <strong>CUI:</strong> {state.companyKyc.cui}
                  </p>
                  <p>
                    <strong>Denumire:</strong> {state.companyKyc.companyName}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery */}
          <Card className="border-neutral-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-secondary-900 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-neutral-500" />
                  Livrare
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep('delivery')}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editează
                </Button>
              </div>
              <div className="space-y-1 text-sm text-neutral-600">
                <p>
                  <strong>Metodă:</strong> {state.delivery.methodName || 'Email (PDF)'}
                </p>
                {state.delivery.address?.street && (
                  <p className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>
                      {state.delivery.address.street} {state.delivery.address.number}
                      {state.delivery.address.building ? `, Bl. ${state.delivery.address.building}` : ''}
                      {state.delivery.address.staircase ? `, Sc. ${state.delivery.address.staircase}` : ''}
                      {state.delivery.address.floor ? `, Et. ${state.delivery.address.floor}` : ''}
                      {state.delivery.address.apartment ? `, Ap. ${state.delivery.address.apartment}` : ''}
                      , {state.delivery.address.city}, {state.delivery.address.county}
                    </span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing */}
          {state.billing && (
            <Card className="border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-secondary-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-neutral-500" />
                    Date Facturare
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep('billing')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editează
                  </Button>
                </div>
                <div className="space-y-1 text-sm text-neutral-600">
                  {state.billing.type === 'persoana_fizica' ? (
                    <>
                      <p>
                        <strong>Tip:</strong> Persoană Fizică
                      </p>
                      <p>
                        <strong>Nume:</strong> {state.billing.firstName} {state.billing.lastName}
                      </p>
                      {state.billing.cnp && (
                        <p>
                          <strong>CNP:</strong> ****{state.billing.cnp.slice(-4)}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Tip:</strong> Persoană Juridică
                      </p>
                      <p>
                        <strong>CUI:</strong> {state.billing.cui}
                      </p>
                      <p>
                        <strong>Denumire:</strong> {state.billing.companyName}
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Options */}
          {state.selectedOptions.length > 0 && (
            <Card className="border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-secondary-900 flex items-center gap-2">
                    <Package className="h-4 w-4 text-neutral-500" />
                    Opțiuni Suplimentare
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep('options')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editează
                  </Button>
                </div>
                <div className="space-y-1 text-sm">
                  {state.selectedOptions.map((opt) => {
                    const price = typeof opt.priceModifier === 'number' && !isNaN(opt.priceModifier)
                      ? opt.priceModifier
                      : 0;
                    return (
                      <div key={opt.optionId} className="flex justify-between text-neutral-600">
                        <span>
                          {opt.optionName}
                          {opt.quantity > 1 && ` x${opt.quantity}`}
                        </span>
                        <span className="font-medium">+{price * (opt.quantity || 1)} RON</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Separator />

      {/* Price Summary */}
      <div>
        <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary-500" />
          Total de Plată
        </h3>

        <Card className="border-primary-200 bg-primary-50/30">
          <CardContent className="p-4 space-y-2">
            {/* Service base price */}
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">
                {service?.name || 'Serviciu de bază'}
              </span>
              <span>{priceBreakdown.basePrice.toFixed(2)} RON</span>
            </div>

            {/* Individual options with prices */}
            {state.selectedOptions.map((opt) => {
              const price = typeof opt.priceModifier === 'number' && !isNaN(opt.priceModifier)
                ? opt.priceModifier
                : 0;
              const totalOptPrice = price * (opt.quantity || 1);
              return (
                <div key={opt.optionId} className="flex justify-between text-sm">
                  <span className="text-neutral-600">
                    {opt.optionName}
                    {opt.quantity > 1 && ` x${opt.quantity}`}
                  </span>
                  <span>+{totalOptPrice.toFixed(2)} RON</span>
                </div>
              );
            })}

            {/* Delivery */}
            {priceBreakdown.deliveryPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">
                  {state.delivery.methodName || 'Livrare'}
                </span>
                <span>+{priceBreakdown.deliveryPrice.toFixed(2)} RON</span>
              </div>
            )}

            {/* Applied coupon (discount line) */}
            {state.coupon && priceBreakdown.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-700 flex items-center gap-1">
                  <Ticket className="h-3.5 w-3.5" />
                  Cupon {state.coupon.code}
                </span>
                <span className="font-medium text-green-700">
                  -{priceBreakdown.discountAmount.toFixed(2)} RON
                </span>
              </div>
            )}

            <Separator />

            {/* Subtotal without TVA */}
            {(() => {
              const tvaRate = 0.21;
              const totalWithTva = priceBreakdown.totalPrice;
              const subtotalWithoutTva = totalWithTva / (1 + tvaRate);
              const tvaAmount = totalWithTva - subtotalWithoutTva;

              return (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal (fără TVA)</span>
                    <span>{subtotalWithoutTva.toFixed(2)} RON</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">TVA 21%</span>
                    <span>{tvaAmount.toFixed(2)} RON</span>
                  </div>
                </>
              );
            })()}

            <Separator />

            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-secondary-900">Total</span>
              <span className="text-2xl font-bold text-primary-600">
                {priceBreakdown.totalPrice.toFixed(2)} RON
              </span>
            </div>

            <p className="text-xs text-neutral-500 text-right">
              Prețurile includ TVA 21%
            </p>
          </CardContent>
        </Card>

        {/* Coupon input */}
        <Card className="mt-3 border-neutral-200">
          <CardContent className="p-4">
            {state.coupon ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Ticket className="h-4 w-4 text-green-600" />
                  <span className="text-neutral-600">Cupon aplicat:</span>
                  <code className="rounded bg-green-50 border border-green-200 px-2 py-0.5 text-sm font-bold text-green-800">
                    {state.coupon.code}
                  </code>
                  <span className="text-sm text-green-700">
                    (-{priceBreakdown.discountAmount.toFixed(2)} RON)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="text-neutral-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                  Elimina
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-secondary-900">
                  <Ticket className="h-4 w-4 text-primary-500" />
                  Aplica cod cupon
                </label>
                <div className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    placeholder="Ex: WELCOME10"
                    className="font-mono uppercase"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    disabled={couponLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                  >
                    {couponLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifica...
                      </>
                    ) : (
                      'Aplica'
                    )}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-600">{couponError}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary-500" />
          Termeni și Condiții
        </h3>

        <div
          className={
            showConsentError && !acceptAll
              ? 'rounded-lg border-2 border-red-400 bg-red-50 p-4'
              : 'rounded-lg border bg-muted/20 p-4'
          }
          {...(showConsentError && !acceptAll ? { 'data-wizard-error': true } : {})}
        >
          {showConsentError && !acceptAll && (
            <p className="text-sm font-semibold text-red-700 mb-2" role="alert">
              Bifează acordul de mai jos ca să poți plăti.
            </p>
          )}
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={acceptAll}
              onCheckedChange={(checked) => setAcceptAll(checked === true)}
              className="mt-0.5 shrink-0"
            />
            <span className="text-sm leading-relaxed text-neutral-700 group-hover:text-neutral-900">
              <span className="text-red-500">*</span> Am citit și sunt de acord cu{' '}
              <a
                href="/termeni"
                target="_blank"
                rel="noopener"
                className="text-primary-600 hover:underline font-medium"
              >
                Termenii și Condițiile
              </a>
              {' '}și{' '}
              <a
                href="/confidentialitate"
                target="_blank"
                rel="noopener"
                className="text-primary-600 hover:underline font-medium"
              >
                Politica de Confidențialitate
              </a>
              . Solicit executarea imediată a serviciului și renunț la dreptul de retragere de 14 zile (OUG 34/2014, art. 16 lit. a). Accept că semnătura electronică simplă aplicată prin platformă are valoare juridică conform Legii nr. 214/2024 și Regulamentului UE 910/2014 (eIDAS).
              {hasSignature && (
                <span className="block mt-1.5 text-xs text-green-700">
                  ✓ Bifat automat la semnare — poți debifa dacă vrei să retragi consimțământul.
                </span>
              )}
            </span>
          </label>
        </div>

        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <strong>Garanție rambursare:</strong> Dacă nu ești mulțumit de serviciu,
            îți returnăm banii în 30 de zile, fără întrebări.
          </div>
        </div>
      </div>
    </div>
  );
}
