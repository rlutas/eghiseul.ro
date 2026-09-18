'use client';

/**
 * Checklist step „Telefon de contact", filled in the dialog itself.
 *
 * One field, so it is worth keeping it to one field: the phone number, and
 * nothing that looks like it also has to be answered before saving.
 */

import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  describedBy,
  Field,
  FormError,
  INPUT_CLASS,
  StepFormFooter,
  validatePhone,
  type ProfileStepFormProps,
} from './step-form-kit';

const PHONE_HINT = 'Te sunăm doar dacă apare ceva de lămurit la o comandă.';

export function ContactStepForm({ onDirtyChange, onSaved, onRequestClose }: ProfileStepFormProps) {
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    onDirtyChange(phone.trim().length > 0);
  }, [phone, onDirtyChange]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    setError(validatePhone(phone));
  }, [phone]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const message = validatePhone(phone);
      setTouched(true);
      setError(message);
      if (message) {
        document.getElementById('checklist-phone')?.focus();
        return;
      }

      setSaving(true);
      setFormError(null);
      try {
        const response = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phone.trim() }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to save phone');
        onDirtyChange(false);
        onSaved();
      } catch (err) {
        console.error('Checklist contact save failed:', err);
        setFormError('Nu am putut salva numărul. Încearcă din nou.');
        setSaving(false);
      }
    },
    [phone, onDirtyChange, onSaved]
  );

  const shownError = touched ? error : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormError message={formError} />

      <Field
        id="checklist-phone"
        label="Număr de telefon"
        required
        error={shownError}
        hint={PHONE_HINT}
      >
        <Input
          id="checklist-phone"
          data-autofocus="true"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={handleBlur}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy('checklist-phone', shownError, PHONE_HINT)}
          placeholder="0722 123 456"
          className={INPUT_CLASS}
        />
      </Field>

      <StepFormFooter saving={saving} onCancel={onRequestClose} />
    </form>
  );
}
