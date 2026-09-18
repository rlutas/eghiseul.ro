'use client';

/**
 * Checklist step „Date personale": family name, given name, CNP, date of birth.
 *
 * The date of birth is derived from a valid CNP instead of being typed twice —
 * the CNP already contains it, and a mismatch between the two is a support
 * ticket waiting to happen. It stays editable, because the century of a CNP
 * issued to a foreign resident (first digit 7 or 8) is a guess.
 *
 * The scan at the top is a shortcut, never a requirement: it fills these same
 * fields and the customer checks them before anything is saved.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useAddresses } from '@/hooks/useAddresses';
import { hasUsableAddress } from '@/lib/account/id-data-to-profile';
import type { ExtractedAddress, ExtractedIdData } from '@/components/shared/IdScanner';
import { IdScanField } from './IdScanField';
import { ScanResultNotice } from './ScanResultNotice';
import {
  addressFromScan,
  birthDateFromCnp,
  CNP_HINT,
  fieldDomId,
  isoFromRomanianDate,
  ORDER,
  validateField,
  type FieldId,
} from './personal-fields';
import {
  describedBy,
  Field,
  FormError,
  focusFirstInvalid,
  INPUT_CLASS,
  StepFormFooter,
  type ProfileStepFormProps,
} from './step-form-kit';

export function PersonalStepForm({ onDirtyChange, onSaved, onRequestClose }: ProfileStepFormProps) {
  const [values, setValues] = useState<Record<FieldId, string>>({
    lastName: '',
    firstName: '',
    cnp: '',
    birthDate: '',
  });
  const [touched, setTouched] = useState<Partial<Record<FieldId, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<FieldId, string | null>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  /** Only a date the customer never touched is overwritten from the CNP. */
  const birthDateEdited = useRef(false);

  // What the last scan filled in, and the address it carried — shown so the
  // customer sees what changed and can correct it before saving.
  const [scanFilled, setScanFilled] = useState<FieldId[]>([]);
  const [scannedAddress, setScannedAddress] = useState<ExtractedAddress | null>(null);
  const [saveScannedAddress, setSaveScannedAddress] = useState(true);
  const { create: createAddress } = useAddresses();

  useEffect(() => {
    onDirtyChange(ORDER.some((id) => values[id].trim().length > 0));
  }, [values, onDirtyChange]);

  const setField = useCallback((id: FieldId, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [id]: value };
      if (id === 'cnp' && !birthDateEdited.current) {
        const fromCnp = birthDateFromCnp(value);
        if (fromCnp) next.birthDate = fromCnp;
      }
      return next;
    });
  }, []);

  /**
   * Fills in whatever the document actually carried and nothing else — a field
   * the OCR did not read stays empty rather than being invented.
   */
  const handleScanned = useCallback((data: ExtractedIdData) => {
    const scanned: Partial<Record<FieldId, string>> = {
      lastName: (data.lastName ?? '').trim(),
      firstName: (data.firstName ?? '').trim(),
      cnp: (data.cnp ?? '').replace(/\D/g, ''),
    };
    // The CNP is the better source for the date of birth — it is the same date,
    // in a format that needs no parsing. The OCR line is the fallback.
    scanned.birthDate =
      birthDateFromCnp(scanned.cnp ?? '') || isoFromRomanianDate(data.birthDate);

    const filled = ORDER.filter((id) => scanned[id]);
    setValues((prev) => {
      const next = { ...prev };
      for (const id of filled) next[id] = scanned[id] as string;
      return next;
    });
    setErrors({});
    setTouched({});
    setScanFilled(filled);

    const address = data.address;
    setScannedAddress(address && hasUsableAddress(address) ? address : null);
  }, []);

  const handleBlur = useCallback(
    (id: FieldId) => {
      setTouched((prev) => ({ ...prev, [id]: true }));
      setErrors((prev) => ({ ...prev, [id]: validateField(id, values) }));
    },
    [values]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const next: Record<string, string | null> = {};
      for (const id of ORDER) next[id] = validateField(id, values);
      setTouched({ lastName: true, firstName: true, cnp: true, birthDate: true });
      setErrors(next);
      if (ORDER.some((id) => next[id])) {
        focusFirstInvalid(ORDER, next, (id) => fieldDomId(id as FieldId));
        return;
      }

      setSaving(true);
      setFormError(null);
      try {
        const response = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lastName: values.lastName.trim(),
            firstName: values.firstName.trim(),
            cnp: values.cnp.trim(),
            birthDate: values.birthDate,
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to save personal data');

        // The address off the document, only if it was there and the customer
        // left the box ticked. A failure here does not undo the profile save,
        // so it is said in those words instead of „încearcă din nou": `create`
        // swallows its own error and returns nothing, and without this the
        // dialog closed as if the ticked address had been saved.
        if (scannedAddress && saveScannedAddress) {
          const savedAddress = await createAddress(addressFromScan(scannedAddress));
          if (!savedAddress) {
            onDirtyChange(false);
            setScannedAddress(null);
            setFormError(
              'Datele personale s-au salvat. Adresa din act nu s-a putut salva — o poți adăuga din pasul „Adresă de livrare".'
            );
            setSaving(false);
            return;
          }
        }

        onDirtyChange(false);
        onSaved();
      } catch (err) {
        console.error('Checklist personal data save failed:', err);
        setFormError('Nu am putut salva datele. Încearcă din nou.');
        setSaving(false);
      }
    },
    [values, scannedAddress, saveScannedAddress, createAddress, onDirtyChange, onSaved]
  );

  const shown = (id: FieldId) => (touched[id] ? errors[id] ?? null : null);
  const ids = {
    lastName: fieldDomId('lastName'),
    firstName: fieldDomId('firstName'),
    cnp: fieldDomId('cnp'),
    birthDate: fieldDomId('birthDate'),
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormError message={formError} />

      <IdScanField onExtracted={handleScanned} />

      <ScanResultNotice
        filled={scanFilled}
        address={scannedAddress}
        saveAddress={saveScannedAddress}
        onSaveAddressChange={setSaveScannedAddress}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id={ids.lastName} label="Nume de familie" required error={shown('lastName')}>
          <Input
            id={ids.lastName}
            data-autofocus="true"
            type="text"
            autoComplete="family-name"
            value={values.lastName}
            onChange={(e) => setField('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            aria-invalid={shown('lastName') ? true : undefined}
            aria-describedby={describedBy(ids.lastName, shown('lastName'))}
            placeholder="Popescu"
            className={INPUT_CLASS}
          />
        </Field>

        <Field id={ids.firstName} label="Prenume" required error={shown('firstName')}>
          <Input
            id={ids.firstName}
            type="text"
            autoComplete="given-name"
            value={values.firstName}
            onChange={(e) => setField('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            aria-invalid={shown('firstName') ? true : undefined}
            aria-describedby={describedBy(ids.firstName, shown('firstName'))}
            placeholder="Ion"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <Field id={ids.cnp} label="CNP" required error={shown('cnp')} hint={CNP_HINT}>
        <Input
          id={ids.cnp}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={13}
          value={values.cnp}
          onChange={(e) => setField('cnp', e.target.value.replace(/\D/g, ''))}
          onBlur={() => handleBlur('cnp')}
          aria-invalid={shown('cnp') ? true : undefined}
          aria-describedby={describedBy(ids.cnp, shown('cnp'), CNP_HINT)}
          placeholder="1234567890123"
          className={`${INPUT_CLASS} font-mono`}
        />
      </Field>

      <Field id={ids.birthDate} label="Data nașterii" required error={shown('birthDate')}>
        <Input
          id={ids.birthDate}
          type="date"
          autoComplete="bday"
          value={values.birthDate}
          onChange={(e) => {
            birthDateEdited.current = true;
            setField('birthDate', e.target.value);
          }}
          onBlur={() => handleBlur('birthDate')}
          aria-invalid={shown('birthDate') ? true : undefined}
          aria-describedby={describedBy(ids.birthDate, shown('birthDate'))}
          className={INPUT_CLASS}
        />
      </Field>

      <StepFormFooter saving={saving} onCancel={onRequestClose} />
    </form>
  );
}
