'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, AlertTriangle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BankTransferDetailsProps {
  orderNumber: string;
  amount: number;
}

/**
 * Datele reale vin din Admin → Setări → Plăți (`admin_settings.bank_details`),
 * prin `/api/payment/bank-details`. Până în 2026-08-18 erau hardcodate aici și
 * erau FALSE („SC EGHISEUL SRL", IBAN inventat) — nu mai lăsa valori implicite
 * în cod: dacă setarea lipsește, arătăm o eroare, nu un cont greșit.
 */
interface BankDetails {
  accountHolder: string;
  bankName: string;
  swift: string;
  ibanRon: string;
  ibanEur: string;
}

function formatIban(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

export function BankTransferDetails({
  orderNumber,
  amount,
}: BankTransferDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [details, setDetails] = useState<BankDetails | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [currency, setCurrency] = useState<'RON' | 'EUR'>('RON');
  const [eurRate, setEurRate] = useState<{ value: number; date: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/payment/bank-details');
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setDetails(json.data);
      } catch {
        setLoadError(true);
      }
    })();
  }, []);

  // Cursul BNR, doar dacă există cont în euro (altfel n-are ce alege clientul).
  useEffect(() => {
    if (!details?.ibanEur) return;
    (async () => {
      try {
        const res = await fetch('/api/bnr-rate');
        const json = await res.json();
        if (json?.eur) setEurRate({ value: json.eur, date: json.date ?? null });
      } catch {
        /* fără curs, rămâne doar plata în lei */
      }
    })();
  }, [details?.ibanEur]);

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

  if (loadError) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Datele pentru transfer bancar nu sunt disponibile momentan. Te rugăm să plătești cu cardul
          sau să ne scrii la <strong>contact@eghiseul.ro</strong> ca să ți le trimitem.
        </AlertDescription>
      </Alert>
    );
  }

  if (!details) {
    return <p className="text-sm text-neutral-500">Se încarcă datele bancare...</p>;
  }

  const canPayEur = !!details.ibanEur && !!eurRate;
  const payingEur = currency === 'EUR' && canPayEur;
  const iban = payingEur ? details.ibanEur : details.ibanRon;
  // Suma în euro e orientativă: banca aplică propriul curs la conversie.
  const eurAmount = eurRate ? Math.ceil((amount / eurRate.value) * 100) / 100 : null;
  const displayAmount = payingEur && eurAmount ? eurAmount : amount;
  const displayCurrency = payingEur ? 'EUR' : 'RON';

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
          {/* Currency switch — doar dacă avem cont în euro ȘI curs BNR */}
          {canPayEur && (
            <div className="flex gap-2">
              {(['RON', 'EUR'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    currency === c
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {c === 'RON' ? 'Plătesc în lei' : 'Plătesc în euro'}
                </button>
              ))}
            </div>
          )}

          {/* Beneficiary */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">Beneficiar</p>
              <p className="font-medium text-secondary-900">{details.accountHolder}</p>
            </div>
            <CopyButton text={details.accountHolder} fieldName="beneficiary" />
          </div>

          <Separator />

          {/* IBAN */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">
                IBAN {payingEur ? '(cont euro)' : '(cont lei)'}
              </p>
              <p className="font-mono font-medium text-secondary-900">{formatIban(iban)}</p>
            </div>
            <CopyButton text={iban} fieldName="iban" />
          </div>

          <Separator />

          {/* Bank */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">Bancă</p>
              <p className="font-medium text-secondary-900">{details.bankName}</p>
            </div>
            <CopyButton text={details.bankName} fieldName="bank" />
          </div>

          {details.swift && (
            <>
              <Separator />

              {/* SWIFT */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-neutral-500">SWIFT/BIC</p>
                  <p className="font-mono font-medium text-secondary-900">{details.swift}</p>
                </div>
                <CopyButton text={details.swift} fieldName="swift" />
              </div>
            </>
          )}

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
                {displayAmount.toFixed(2)} {displayCurrency}
              </p>
              {payingEur && (
                <p className="mt-1 text-xs text-neutral-500">
                  Echivalentul a {amount.toFixed(2)} RON la cursul BNR
                  {eurRate?.date ? ` din ${eurRate.date}` : ''} ({eurRate?.value.toFixed(4)} lei/€).
                  Banca ta poate folosi alt curs — comanda e considerată plătită integral când
                  ajung cei {amount.toFixed(2)} RON.
                </p>
              )}
            </div>
            <CopyButton text={displayAmount.toFixed(2)} fieldName="amount" />
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
