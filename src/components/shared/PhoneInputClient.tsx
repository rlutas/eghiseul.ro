'use client';

import { PhoneInput as ReactPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

interface Props {
  value: string;
  onChange: (phone: string) => void;
}

export function PhoneInputClient({ value, onChange }: Props) {
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
      onChange={onChange}
      forceDialCode
      disableDialCodePrefill
      className="!flex !gap-0"
      inputClassName="!h-11 !flex-1 !rounded-l-none !rounded-r-lg !border !border-l-0 !border-neutral-300 !bg-white !text-base focus:!border-primary-500 focus:!ring-2 focus:!ring-primary-500/20 focus:!z-10"
      countrySelectorStyleProps={{
        buttonClassName:
          '!h-11 !rounded-l-lg !rounded-r-none !border !border-neutral-300 !bg-white !px-3 hover:!bg-neutral-50',
      }}
      inputProps={{
        inputMode: 'tel',
        autoComplete: 'tel',
        // Accessible name so screen readers announce the field and tests can
        // target it (react-international-phone renders a bare <input> otherwise).
        'aria-label': 'Telefon',
      }}
    />
  );
}
