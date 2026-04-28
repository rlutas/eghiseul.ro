/* eslint-disable react-hooks/static-components -- pre-existing inline render helpers; extract to module scope when touched */
'use client';

import { useState } from 'react';
import { Copy, Check, AlertTriangle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BankTransferDetailsProps {
  orderNumber: string;
  amount: number;
}

// Company bank details - in production, these should come from env or config
const BANK_DETAILS = {
  beneficiary: 'SC EGHISEUL SRL',
  iban: 'RO49 BTRL 0000 1234 5678 9012',
  bank: 'Banca Transilvania',
  swift: 'BTRLRO22',
};

export function BankTransferDetails({
  orderNumber,
  amount,
}: BankTransferDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const CopyButton = ({
    text,
    fieldName,
  }: {
    text: string;
    fieldName: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, fieldName)}
      className="h-8 w-8 p-0"
    >
      {copiedField === fieldName ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 text-neutral-400" />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Warning Alert */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Important:</strong> Transferul bancar necesită verificare manuală.
          Comanda va fi procesată după confirmarea plății (1-3 zile lucrătoare).
        </AlertDescription>
      </Alert>

      {/* Bank Details Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary-500" />
            Detalii pentru transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Beneficiary */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">Beneficiar</p>
              <p className="font-medium text-secondary-900">
                {BANK_DETAILS.beneficiary}
              </p>
            </div>
            <CopyButton text={BANK_DETAILS.beneficiary} fieldName="beneficiary" />
          </div>

          <Separator />

          {/* IBAN */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">IBAN</p>
              <p className="font-mono font-medium text-secondary-900">
                {BANK_DETAILS.iban}
              </p>
            </div>
            <CopyButton
              text={BANK_DETAILS.iban.replace(/\s/g, '')}
              fieldName="iban"
            />
          </div>

          <Separator />

          {/* Bank */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">Bancă</p>
              <p className="font-medium text-secondary-900">{BANK_DETAILS.bank}</p>
            </div>
            <CopyButton text={BANK_DETAILS.bank} fieldName="bank" />
          </div>

          <Separator />

          {/* SWIFT */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">SWIFT/BIC</p>
              <p className="font-mono font-medium text-secondary-900">
                {BANK_DETAILS.swift}
              </p>
            </div>
            <CopyButton text={BANK_DETAILS.swift} fieldName="swift" />
          </div>

          <Separator />

          {/* Payment Reference - IMPORTANT */}
          <div className="flex justify-between items-center bg-primary-50 p-4 rounded-lg -mx-2">
            <div>
              <p className="text-sm text-primary-600 font-medium">
                Referință plată (OBLIGATORIU)
              </p>
              <p className="font-mono font-bold text-xl text-secondary-900">
                {orderNumber}
              </p>
            </div>
            <CopyButton text={orderNumber} fieldName="reference" />
          </div>

          <Separator />

          {/* Amount */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">Sumă de plată</p>
              <p className="font-bold text-2xl text-secondary-900">
                {amount.toFixed(2)} RON
              </p>
            </div>
            <CopyButton text={amount.toFixed(2)} fieldName="amount" />
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <p className="text-sm text-neutral-600 text-center">
        Trebuie să incluzi referința{' '}
        <strong className="text-secondary-900">{orderNumber}</strong> în
        detaliile transferului pentru a putea identifica plata.
      </p>
    </div>
  );
}
