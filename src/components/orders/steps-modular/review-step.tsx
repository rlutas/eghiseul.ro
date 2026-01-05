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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { cn } from '@/lib/utils';

interface ReviewStepProps {
  onValidChange: (valid: boolean) => void;
}

export function ReviewStepModular({ onValidChange }: ReviewStepProps) {
  const { state, priceBreakdown, goToStep } = useModularWizard();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Validate step
  useEffect(() => {
    onValidChange(termsAccepted && privacyAccepted);
  }, [termsAccepted, privacyAccepted, onValidChange]);

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
                    {state.delivery.address.street} {state.delivery.address.number},
                    {state.delivery.address.city}, {state.delivery.address.county}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

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
                  {state.selectedOptions.map((opt) => (
                    <div key={opt.optionId} className="flex justify-between text-neutral-600">
                      <span>
                        {opt.optionName}
                        {opt.quantity > 1 && ` x${opt.quantity}`}
                      </span>
                      <span className="font-medium">+{opt.priceModifier * opt.quantity} RON</span>
                    </div>
                  ))}
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
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Preț serviciu</span>
              <span>{priceBreakdown.basePrice} RON</span>
            </div>

            {priceBreakdown.optionsPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Opțiuni</span>
                <span>+{priceBreakdown.optionsPrice} RON</span>
              </div>
            )}

            {priceBreakdown.deliveryPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Livrare</span>
                <span>+{priceBreakdown.deliveryPrice} RON</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-secondary-900">Total</span>
              <span className="text-2xl font-bold text-primary-600">
                {priceBreakdown.totalPrice} RON
              </span>
            </div>
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

        <div className="space-y-3">
          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
              Am citit și sunt de acord cu{' '}
              <a
                href="/termeni"
                target="_blank"
                className="text-primary-600 hover:underline font-medium"
              >
                Termenii și Condițiile
              </a>{' '}
              de utilizare a serviciului. <span className="text-red-500">*</span>
            </span>
          </label>

          {/* Privacy */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
              Sunt de acord cu prelucrarea datelor personale conform{' '}
              <a
                href="/confidentialitate"
                target="_blank"
                className="text-primary-600 hover:underline font-medium"
              >
                Politicii de Confidențialitate
              </a>
              . <span className="text-red-500">*</span>
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
