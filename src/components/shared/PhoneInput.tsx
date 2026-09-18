'use client';

import dynamic from 'next/dynamic';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  error?: string;
  className?: string;
  /** Forwarded to the `<input>`, so a `<label htmlFor>` can point at it. */
  id?: string;
  onBlur?: () => void;
  /** Marks the input for the profile dialogs, which focus `[data-autofocus]`. */
  autoFocus?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

// Lazy-load to avoid SSR/hydration mismatch.
// The library reads `navigator` and document on first render, which would
// otherwise fail or warn during Next.js SSR.
const PhoneInputInner = dynamic(
  () => import('./PhoneInputClient').then((mod) => mod.PhoneInputClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-11 w-full items-center rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-400">
        +40 ...
      </div>
    ),
  }
);

export function PhoneInput({ value, onChange, error, className, ...inputProps }: PhoneInputProps) {
  return (
    <div className={className}>
      <PhoneInputInner value={value} onChange={onChange} {...inputProps} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
