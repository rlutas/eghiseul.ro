'use client';

import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Truck,
  FileText,
  PenTool,
  CheckCircle,
  Edit2,
  Shield,
  Clock,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderWizard } from '@/providers/order-wizard-provider';
import { maskCNP } from '@/lib/validations/cnp';
import { cn } from '@/lib/utils';

interface ReviewStepProps {
  onValidChange: (valid: boolean) => void;
}

export function ReviewStep({ onValidChange }: ReviewStepProps) {
  const { state, goToStep, priceBreakdown, submitOrder } = useOrderWizard();
  const {
    service,
    contactData,
    personalData,
    selectedOptions,
    kycDocuments,
    signatureData,
    deliverySelection,
    isLoading,
  } = state;

  const [confirmOrder, setConfirmOrder] = useState(false);

  // Always valid - review is informational
  useEffect(() => {
    onValidChange(true);
  }, [onValidChange]);

  // Section Card Component
  const SectionCard = ({
    icon: Icon,
    title,
    step,
    children,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    step: 'contact' | 'personal' | 'options' | 'kyc' | 'delivery';
    children: React.ReactNode;
  }) => (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary-500" />
          <h3 className="font-semibold text-secondary-900 text-sm">{title}</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => goToStep(step)}
          className="h-7 px-2 text-xs text-primary-600 hover:text-primary-700"
        >
          <Edit2 className="h-3 w-3 mr-1" />
          Modifică
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );

  // Data Row Component
  const DataRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="flex justify-between py-1.5 text-sm border-b border-neutral-100 last:border-0">
      <span className="text-neutral-500">{label}</span>
      <span className="text-secondary-900 font-medium text-right">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-neutral-200">
        <h2 className="text-xl font-bold text-secondary-900 mb-1">
          Verifică comanda ta
        </h2>
        <p className="text-neutral-600 text-sm">
          Asigură-te că toate informațiile sunt corecte înainte de plată
        </p>
      </div>

      {/* Service Info */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-4 border border-primary-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-200 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-700" />
          </div>
          <div>
            <h3 className="font-bold text-secondary-900">{service?.name}</h3>
            <p className="text-sm text-neutral-600">{service?.short_description}</p>
          </div>
        </div>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">
        {/* Contact Info */}
        <SectionCard icon={Mail} title="Informații Contact" step="contact">
          <DataRow label="Email" value={contactData.email || '-'} />
          <DataRow label="Telefon" value={contactData.phone || '-'} />
          <DataRow
            label="Contact preferat"
            value={
              contactData.preferred_contact === 'email'
                ? 'Email'
                : contactData.preferred_contact === 'phone'
                ? 'Telefon'
                : 'WhatsApp'
            }
          />
        </SectionCard>

        {/* Personal Data */}
        <SectionCard icon={User} title="Date Personale" step="personal">
          <DataRow
            label="Nume complet"
            value={`${personalData.last_name || ''} ${personalData.first_name || ''}`}
          />
          <DataRow
            label="CNP"
            value={personalData.cnp ? maskCNP(personalData.cnp) : '-'}
          />
          <DataRow label="Data nașterii" value={personalData.birth_date || '-'} />
          <DataRow label="Locul nașterii" value={personalData.birth_place || '-'} />
          {personalData.address && (
            <DataRow
              label="Adresă"
              value={
                <span className="text-right">
                  {personalData.address.street} {personalData.address.number}
                  {personalData.address.building && `, Bl. ${personalData.address.building}`}
                  {personalData.address.apartment && `, Ap. ${personalData.address.apartment}`}
                  <br />
                  {personalData.address.city}, {personalData.address.county}
                  <br />
                  {personalData.address.postal_code}
                </span>
              }
            />
          )}
        </SectionCard>

        {/* Service Options */}
        <SectionCard icon={Package} title="Opțiuni Selectate" step="options">
          {selectedOptions.length === 0 ? (
            <p className="text-sm text-neutral-500">Nicio opțiune suplimentară selectată</p>
          ) : (
            selectedOptions.map((opt) => (
              <DataRow
                key={opt.option_id}
                label={`${opt.option_name}${opt.quantity > 1 ? ` x${opt.quantity}` : ''}`}
                value={`+${opt.price_modifier * opt.quantity} RON`}
              />
            ))
          )}
        </SectionCard>

        {/* KYC Documents */}
        {service?.requires_kyc && (
          <SectionCard icon={CreditCard} title="Documente KYC" step="kyc">
            <div className="grid grid-cols-3 gap-2">
              {(['ci_front', 'ci_back', 'selfie'] as const).map((type) => {
                const doc = kycDocuments[type];
                const labels = {
                  ci_front: 'CI Față',
                  ci_back: 'CI Verso',
                  selfie: 'Selfie',
                };
                return (
                  <div
                    key={type}
                    className={cn(
                      'aspect-video rounded-lg border flex items-center justify-center',
                      doc
                        ? 'border-green-300 bg-green-50'
                        : 'border-neutral-200 bg-neutral-50'
                    )}
                  >
                    {doc ? (
                      <div className="text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                        <span className="text-xs text-green-600">{labels[type]}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">{labels[type]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Delivery */}
        <SectionCard icon={Truck} title="Livrare" step="delivery">
          {deliverySelection.method && (
            <>
              <DataRow
                label="Metodă"
                value={deliverySelection.method.name}
              />
              <DataRow
                label="Cost"
                value={
                  deliverySelection.method.price === 0
                    ? 'Gratuit'
                    : `${deliverySelection.method.price} RON`
                }
              />
              {deliverySelection.method.estimated_days > 0 && (
                <DataRow
                  label="Termen livrare"
                  value={`${deliverySelection.method.estimated_days} zile lucrătoare`}
                />
              )}
            </>
          )}
          {deliverySelection.address && (
            <DataRow
              label="Adresă livrare"
              value={
                <span className="text-right">
                  {deliverySelection.address.street} {deliverySelection.address.number}
                  {deliverySelection.address.building &&
                    `, Bl. ${deliverySelection.address.building}`}
                  {deliverySelection.address.apartment &&
                    `, Ap. ${deliverySelection.address.apartment}`}
                  <br />
                  {deliverySelection.address.city}, {deliverySelection.address.county}
                </span>
              }
            />
          )}
        </SectionCard>

        {/* Signature */}
        <SectionCard icon={PenTool} title="Semnătură" step="delivery">
          {signatureData.signature_base64 ? (
            <div className="space-y-2">
              <div className="bg-white rounded-lg border border-neutral-200 p-2">
                <img
                  src={signatureData.signature_base64}
                  alt="Semnătură"
                  className="h-16 w-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Termeni și condiții acceptate</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Semnătură lipsă</p>
          )}
        </SectionCard>
      </div>

      {/* Price Summary */}
      <div className="bg-secondary-900 rounded-xl p-4 text-white">
        <h3 className="font-semibold mb-3">Rezumat Plată</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-300">Serviciu de bază</span>
            <span>{priceBreakdown.basePrice} RON</span>
          </div>
          {priceBreakdown.optionsPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-300">Opțiuni suplimentare</span>
              <span>+{priceBreakdown.optionsPrice} RON</span>
            </div>
          )}
          {priceBreakdown.deliveryPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-300">Livrare</span>
              <span>+{priceBreakdown.deliveryPrice} RON</span>
            </div>
          )}
          {priceBreakdown.discountAmount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Reducere</span>
              <span>-{priceBreakdown.discountAmount} RON</span>
            </div>
          )}
          <div className="pt-2 mt-2 border-t border-neutral-700 flex justify-between items-center">
            <span className="font-semibold">Total de plată</span>
            <span className="text-2xl font-bold text-primary-400">
              {priceBreakdown.totalPrice} RON
            </span>
          </div>
        </div>
      </div>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="flex items-center gap-2 text-neutral-500 text-xs">
          <Lock className="h-4 w-4" />
          <span>Plată securizată</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500 text-xs">
          <Shield className="h-4 w-4" />
          <span>Date protejate</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500 text-xs">
          <Clock className="h-4 w-4" />
          <span>Procesare rapidă</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="text-center">
        <p className="text-xs text-neutral-500 mb-2">Metode de plată acceptate</p>
        <div className="flex items-center justify-center gap-3">
          <img src="/images/payment/visa.svg" alt="Visa" className="h-6" />
          <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-6" />
          <img src="/images/payment/apple-pay.svg" alt="Apple Pay" className="h-6" />
          <img src="/images/payment/google-pay.svg" alt="Google Pay" className="h-6" />
        </div>
      </div>

      {/* Final Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <p className="text-sm text-blue-800">
          Apăsând butonul <strong>&quot;Plătește&quot;</strong> vei fi redirecționat către
          platforma securizată <strong>Stripe</strong> pentru a finaliza plata.
        </p>
      </div>
    </div>
  );
}
