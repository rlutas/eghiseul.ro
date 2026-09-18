'use client';

/**
 * Checklist step „Adresă de livrare".
 *
 * Wraps the shared `AddressForm` rather than re-typing it: the county →
 * locality pair is a two-level dataset, and a second copy of it in the dialog
 * would drift from the one the order wizard uses. The wrapper owns what the
 * shared form does not: validation on blur and on submit, focus on the first
 * field that is wrong, and the save request.
 */

import { useCallback, useEffect, useState } from 'react';
import AddressForm, { type AddressData } from '@/components/shared/AddressForm';
import { useAddresses } from '@/hooks/useAddresses';
import { FormError, StepFormFooter, focusFirstInvalid, type ProfileStepFormProps } from './step-form-kit';

type RequiredField = 'county' | 'city' | 'street' | 'number';

/** International addresses have no Romanian county to pick. */
function requiredFields(country: string | undefined): RequiredField[] {
  const isRomania = !country || country === 'RO';
  return isRomania ? ['county', 'city', 'street', 'number'] : ['city', 'street', 'number'];
}

const MESSAGES: Record<RequiredField, string> = {
  county: 'Alege județul.',
  city: 'Alege localitatea.',
  street: 'Scrie strada.',
  number: 'Scrie numărul.',
};

function validate(value: Partial<AddressData>): Partial<Record<RequiredField, string>> {
  const found: Partial<Record<RequiredField, string>> = {};
  for (const field of requiredFields(value.country)) {
    if (!value[field]?.trim()) found[field] = MESSAGES[field];
  }
  return found;
}

export function AddressStepForm({ onDirtyChange, onSaved, onRequestClose }: ProfileStepFormProps) {
  const { create } = useAddresses();
  const [value, setValue] = useState<Partial<AddressData>>({ country: 'RO', isDefault: true });
  const [errors, setErrors] = useState<Partial<Record<RequiredField, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = Boolean(
    value.label?.trim() || value.street?.trim() || value.number?.trim() || value.city?.trim() || value.county?.trim()
  );
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  // The shared form has no blur hook of its own, so a field that was already
  // reported as wrong clears as soon as it is filled in; the rest only appear
  // after a failed submit, never while the customer is still typing.
  const handleChange = useCallback(
    (next: AddressData) => {
      setValue(next);
      if (submitted) {
        setErrors(validate(next));
        return;
      }
      setErrors((prev) => {
        const cleared = { ...prev };
        for (const field of Object.keys(cleared) as RequiredField[]) {
          if (next[field]?.trim()) delete cleared[field];
        }
        return cleared;
      });
    },
    [submitted]
  );

  const handleSubmit = useCallback(async () => {
    const found = validate(value);
    setSubmitted(true);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstInvalid(requiredFields(value.country), found as Record<string, string | null>);
      return;
    }

    setSaving(true);
    setFormError(null);
    const saved = await create(value as AddressData);
    if (!saved) {
      setFormError('Nu am putut salva adresa. Încearcă din nou.');
      setSaving(false);
      return;
    }
    onDirtyChange(false);
    onSaved();
  }, [value, create, onDirtyChange, onSaved]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      noValidate
      className="space-y-5"
    >
      <FormError message={formError} />

      {/* The shared form's inputs are 36px tall; on a phone that is under the
          44px a finger needs, and this dialog is mostly opened on a phone.
          `w-full` too: the county and country triggers size themselves to their
          own text, which next to full-width inputs reads as a broken column. */}
      <div className="[&_[role=combobox]]:h-11 [&_[role=combobox]]:w-full [&_input]:h-11">
        <AddressForm
          value={value}
          onChange={handleChange}
          errors={errors}
          showLabel
          showIsDefault
          showCountrySelect
        />
      </div>

      <StepFormFooter saving={saving} onCancel={onRequestClose} saveLabel="Salvează adresa" />
    </form>
  );
}
