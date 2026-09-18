'use client';

/**
 * What a scan produced, shown before anything is saved: which fields were
 * filled in, and the address the document carried.
 *
 * The address is an offer with a tick, not a silent write — the customer can
 * see exactly what would be saved and can refuse it.
 */

import { Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { ExtractedAddress } from '@/components/shared/IdScanner';
import { addressSummary, LABELS, type FieldId } from './personal-fields';

export function ScanResultNotice({
  filled,
  address,
  saveAddress,
  onSaveAddressChange,
}: {
  filled: FieldId[];
  address: ExtractedAddress | null;
  saveAddress: boolean;
  onSaveAddressChange: (next: boolean) => void;
}) {
  if (filled.length === 0 && !address) return null;

  return (
    <>
      {filled.length > 0 && (
        <p
          role="status"
          className="flex items-start gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs leading-relaxed font-medium text-green-800"
        >
          <Check className="mt-px h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          Am completat {filled.map((id) => LABELS[id]).join(', ')}. Verifică datele înainte de a
          salva.
        </p>
      )}

      {address && (
        <div className="flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-white p-3">
          <Checkbox
            id="save-scanned-address"
            checked={saveAddress}
            onCheckedChange={(checked) => onSaveAddressChange(!!checked)}
            className="mt-0.5"
          />
          <Label
            htmlFor="save-scanned-address"
            className="block text-xs leading-relaxed font-normal text-neutral-600"
          >
            <span className="block font-semibold text-secondary-900">
              Salvează și adresa din act ca adresă de livrare
            </span>
            {addressSummary(address)}
          </Label>
        </div>
      )}
    </>
  );
}
