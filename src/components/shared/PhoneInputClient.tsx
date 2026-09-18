'use client';

import { PhoneInput as ReactPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { stripTrunkZero } from '@/lib/format/phone-trunk-zero';

interface Props {
  value: string;
  onChange: (phone: string) => void;
  id?: string;
  onBlur?: () => void;
  autoFocus?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export function PhoneInputClient({
  value,
  onChange,
  id,
  onBlur,
  autoFocus,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: Props) {
  return (
    <ReactPhoneInput
      defaultCountry="ro"
      preferredCountries={[
        'ro',
        'it',
        'es',
        'de',
        'gb',
        'fr',
        'be',
        'at',
        'nl',
        'ch',
      ]}
      value={value}
      // The field already shows „+40 ", and people type their number the way
      // they say it: 0712 345 678. The library keeps that zero, so what we
      // store is +400712345678 — a number that reaches nobody when the courier
      // dials it. Dropped here, once, for every form that uses this field.
      onChange={(phone) => onChange(stripTrunkZero(phone))}
      forceDialCode
      disableDialCodePrefill
      className="!flex !gap-0"
      inputClassName="!h-11 !flex-1 !rounded-l-none !rounded-r-lg !border !border-l-0 !border-neutral-300 !bg-white !text-base focus:!border-primary-500 focus:!ring-2 focus:!ring-primary-500/20 focus:!z-10"
      countrySelectorStyleProps={{
        buttonClassName:
          '!h-11 !rounded-l-lg !rounded-r-none !border !border-neutral-300 !bg-white !px-3 hover:!bg-neutral-50',
      }}
      inputProps={{
        id,
        onBlur,
        inputMode: 'tel',
        autoComplete: 'tel',
        'aria-invalid': ariaInvalid,
        'aria-describedby': ariaDescribedBy,
        // Not the `autoFocus` attribute: the profile dialogs decide themselves
        // what to focus on open, and look for this marker.
        ...(autoFocus ? { 'data-autofocus': 'true' } : {}),
        // Accessible name so screen readers announce the field and tests can
        // target it (react-international-phone renders a bare <input> otherwise).
        'aria-label': 'Telefon',
      }}
    />
  );
}
