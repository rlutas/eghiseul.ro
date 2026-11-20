'use client';

/**
 * Terms + contract acceptance for services WITHOUT a signature step
 * (extras CF, identificare imobil, certificat constatator…).
 *
 * Since the Review step was dropped (27.05.2026) these services had no
 * checkbox at all: the checkout only said „Apăsând Plătește accepți…", so
 * /submit recorded terms_accepted=false on every order and the contract's
 * client cell showed a bare name (E-261109-754AK, 20.11.2026). The tick here
 * is the client's acceptance of the contract; the generated contract then
 * carries the typed signature (name + date + IP, typed-signature.tsx).
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useModularWizard } from '@/providers/modular-wizard-provider';

const ContractPreview = dynamic(() => import('../modules/signature/ContractPreview'), {
  ssr: false,
});

export function isAcceptanceGiven(consent: {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  withdrawalWaiver: boolean;
}): boolean {
  return consent.termsAccepted && consent.privacyAccepted && consent.withdrawalWaiver;
}

export function AcceptanceConsent({ showError }: { showError: boolean }) {
  const { state, updateConsent } = useModularWizard();
  const [showContract, setShowContract] = useState(false);
  const accepted = isAcceptanceGiven(state.consent);
  const invalid = showError && !accepted;

  return (
    <div className="mt-6 space-y-3">
      <div
        className={
          invalid
            ? 'rounded-lg border-2 border-red-400 bg-red-50 p-4'
            : 'rounded-lg border bg-muted/20 p-4'
        }
        {...(invalid ? { 'data-wizard-error': true } : {})}
      >
        {invalid && (
          <p className="text-sm font-semibold text-red-700 mb-2" role="alert">
            Bifează acordul de mai jos ca să poți plăti.
          </p>
        )}
        <label className="flex items-start gap-3 cursor-pointer group">
          <Checkbox
            checked={accepted}
            onCheckedChange={(checked) => {
              const v = checked === true;
              updateConsent({ termsAccepted: v, privacyAccepted: v, withdrawalWaiver: v });
            }}
            className="mt-0.5 shrink-0"
          />
          <span className="text-sm leading-relaxed text-neutral-700 group-hover:text-neutral-900">
            <span className="text-red-500">*</span> Am citit și sunt de acord cu{' '}
            <a
              href="/termeni-si-conditii/"
              target="_blank"
              rel="noopener"
              className="text-primary-600 hover:underline font-medium"
            >
              Termenii și Condițiile
            </a>
            {' '}și{' '}
            <a
              href="/politica-de-confidentialitate/"
              target="_blank"
              rel="noopener"
              className="text-primary-600 hover:underline font-medium"
            >
              Politica de Confidențialitate
            </a>
            . Accept contractul de prestări servicii pentru această comandă: bifa ține loc
            de semnătură electronică simplă (Legea nr. 214/2024, Regulamentul UE 910/2014),
            iar contractul va purta numele meu, data, ora și adresa IP. Solicit executarea
            imediată a serviciului și renunț la dreptul de retragere de 14 zile (OUG 34/2014,
            art. 16 lit. a).
          </span>
        </label>
        <Button
          type="button"
          variant="link"
          className="mt-1 h-auto p-0 pl-7 text-sm text-primary-600"
          onClick={() => setShowContract((v) => !v)}
        >
          <FileText className="mr-1 h-4 w-4" />
          {showContract ? 'Ascunde contractul' : 'Vezi contractul pe care îl accepți'}
        </Button>
      </div>
      {showContract && <ContractPreview typedSignature />}
    </div>
  );
}
