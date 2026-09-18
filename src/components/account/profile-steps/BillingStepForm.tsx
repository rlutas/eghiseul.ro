'use client';

/**
 * Checklist step „Date de facturare".
 *
 * Wraps the shared `BillingProfileForm` — the same one the order wizard uses,
 * ANAF lookup included — and adds what it does not do on its own: required
 * fields per profile type, the error under the field it belongs to, focus on
 * the first one that is wrong, and the save request.
 *
 * The required set for a persoană fizică is the one `isPfBillingComplete`
 * enforces at checkout (street + locality + county, because Oblio invoices them
 * separately). Saving anything less would tick the checklist and still make the
 * customer retype everything on the next order.
 */

import { useCallback, useEffect, useState } from 'react';
import BillingProfileForm, { type BillingData } from '@/components/shared/BillingProfileForm';
import { useBillingProfiles } from '@/hooks/useBillingProfiles';
import { validateCNP } from '@/lib/validations/cnp';
import { FormError, StepFormFooter, focusFirstInvalid, type ProfileStepFormProps } from './step-form-kit';

type FieldId = keyof BillingData;

const PF_FIELDS: FieldId[] = ['label', 'lastName', 'firstName', 'cnp', 'address', 'county', 'city'];
const PJ_FIELDS: FieldId[] = ['label', 'cui', 'companyName', 'companyAddress'];

const MESSAGES: Partial<Record<FieldId, string>> = {
  label: 'Dă profilului un nume, ca să îl recunoști la comandă.',
  lastName: 'Scrie numele de familie.',
  firstName: 'Scrie prenumele.',
  cnp: 'Scrie CNP-ul.',
  address: 'Scrie strada și numărul.',
  county: 'Alege județul.',
  city: 'Alege localitatea.',
  cui: 'Scrie CUI-ul firmei.',
  companyName: 'Scrie denumirea firmei.',
  companyAddress: 'Scrie sediul social.',
};

function fieldsFor(value: Partial<BillingData>): FieldId[] {
  return value.type === 'persoana_juridica' ? PJ_FIELDS : PF_FIELDS;
}

function validate(value: Partial<BillingData>): Partial<Record<FieldId, string>> {
  const found: Partial<Record<FieldId, string>> = {};
  for (const field of fieldsFor(value)) {
    const raw = value[field];
    if (typeof raw !== 'string' || !raw.trim()) {
      found[field] = MESSAGES[field] ?? 'Completează acest câmp.';
      continue;
    }
    if (field === 'cnp') {
      const result = validateCNP(raw);
      if (!result.valid) found.cnp = result.errors[0];
    }
  }
  return found;
}

export function BillingStepForm({ onDirtyChange, onSaved, onRequestClose }: ProfileStepFormProps) {
  const { create } = useBillingProfiles();
  const [value, setValue] = useState<Partial<BillingData>>({
    type: 'persoana_fizica',
    label: '',
    isDefault: true,
  });
  const [errors, setErrors] = useState<Partial<Record<FieldId, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = fieldsFor(value).some((field) => {
    const raw = value[field];
    return typeof raw === 'string' && raw.trim().length > 0;
  });
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const handleChange = useCallback(
    (next: BillingData) => {
      setValue(next);
      if (submitted) {
        setErrors(validate(next));
        return;
      }
      setErrors((prev) => {
        const cleared = { ...prev };
        for (const field of Object.keys(cleared) as FieldId[]) {
          const raw = next[field];
          if (typeof raw === 'string' && raw.trim()) delete cleared[field];
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
      focusFirstInvalid(fieldsFor(value) as string[], found as Record<string, string | null>);
      return;
    }

    setSaving(true);
    setFormError(null);
    const saved = await create(value as BillingData);
    if (!saved) {
      setFormError('Nu am putut salva datele de facturare. Încearcă din nou.');
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

      {/* The shared form asks its county/locality triggers for `h-11`, and
          shadcn's own `data-[size=default]:h-9` wins on specificity — 36px,
          under the 44 a finger needs. Same override the address step uses. */}
      <div className="[&_[role=combobox]]:h-11">
        <BillingProfileForm value={value} onChange={handleChange} errors={errors} />
      </div>

      <StepFormFooter saving={saving} onCancel={onRequestClose} saveLabel="Salvează datele" />
    </form>
  );
}
