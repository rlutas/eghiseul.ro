'use client';

/**
 * Checklist step „Date de facturare".
 *
 * Opens with a question when the account already knows who the customer is:
 * the personal data scanned or typed one step earlier is shown back, and one
 * press makes it the billing profile. Asked for the first time on 18.09.2026:
 * the customer had just scanned their ID and was being asked to type the same
 * name and CNP again. „Nu" leads to the form, where a persoană juridică with a
 * CUI is looked up at ANAF as before.
 *
 * The form itself wraps the shared `BillingProfileForm` — the same one the
 * order wizard uses — and adds what it does not do on its own: required fields
 * per profile type, the error under the field it belongs to, focus on the
 * first one that is wrong, and the save request.
 *
 * The required set for a persoană fizică is the one `isPfBillingComplete`
 * enforces at checkout (street + locality + county, because Oblio invoices them
 * separately). Saving anything less would tick the checklist and still make the
 * customer retype everything on the next order.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, IdCard, Pencil } from 'lucide-react';
import BillingProfileForm, { type BillingData } from '@/components/shared/BillingProfileForm';
import { Button } from '@/components/ui/button';
import { useBillingProfiles } from '@/hooks/useBillingProfiles';
import { useAddresses } from '@/hooks/useAddresses';
import { validateCNP } from '@/lib/validations/cnp';
import { formatPersonName } from '@/lib/format/person-name';
import { streetLineFromIdData } from '@/lib/account/id-data-to-profile';
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

/** What the account already knows about the person, from the profile. */
interface KnownPerson {
  firstName: string;
  lastName: string;
  cnp: string;
}

/** The delivery address worth offering as the billing one: a Romanian one. */
interface KnownAddress {
  streetLine: string;
  city: string;
  county: string;
  postalCode: string;
}

const EMPTY_FORM: Partial<BillingData> = {
  type: 'persoana_fizica',
  label: '',
  isDefault: true,
};

type Phase = 'loading' | 'offer' | 'form';

export function BillingStepForm({ onDirtyChange, onSaved, onRequestClose }: ProfileStepFormProps) {
  const { create } = useBillingProfiles();
  const { addresses, defaultAddress, isLoading: addressesLoading } = useAddresses();

  const [phase, setPhase] = useState<Phase>('loading');
  const [person, setPerson] = useState<KnownPerson | null>(null);
  const [value, setValue] = useState<Partial<BillingData>>(EMPTY_FORM);
  /** What the form opened with — typing counts as work, a prefill does not. */
  const [initial, setInitial] = useState<Partial<BillingData>>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldId, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  /** Shown above the form when „Da" could not finish on its own. */
  const [addressNeeded, setAddressNeeded] = useState(false);
  const yesRef = useRef<HTMLButtonElement>(null);

  // Who the customer is, from the profile — the same data the personal step
  // saved a moment ago, whether scanned from the document or typed.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/user/profile');
        const result = await response.json();
        const data = response.ok ? result.data : null;
        const known: KnownPerson | null =
          data?.firstName?.trim() && data?.lastName?.trim() && data?.cnp?.trim()
            ? { firstName: data.firstName.trim(), lastName: data.lastName.trim(), cnp: data.cnp.trim() }
            : null;
        if (cancelled) return;
        setPerson(known);
        setPhase(known ? 'offer' : 'form');
      } catch (err) {
        console.error('Billing step could not read the profile:', err);
        if (!cancelled) setPhase('form');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // The dialog focuses the first field when it opens, but the question is not
  // there yet at that moment — it arrives with the profile. So the offer puts
  // the focus on its own first button once it is on screen.
  useEffect(() => {
    if (phase === 'offer') yesRef.current?.focus();
  }, [phase]);

  const knownAddress: KnownAddress | null = (() => {
    const candidate =
      defaultAddress && (!defaultAddress.country || defaultAddress.country === 'RO')
        ? defaultAddress
        : addresses.find((a) => !a.country || a.country === 'RO') ?? null;
    if (!candidate) return null;
    const streetLine = streetLineFromIdData(candidate);
    if (!streetLine || !candidate.city?.trim() || !candidate.county?.trim()) return null;
    return {
      streetLine,
      city: candidate.city.trim(),
      county: candidate.county.trim(),
      postalCode: candidate.postalCode?.trim() ?? '',
    };
  })();

  const dirty =
    phase === 'form' &&
    fieldsFor(value).some((field) => {
      const raw = value[field];
      const was = initial[field];
      return typeof raw === 'string' && raw.trim().length > 0 && raw !== was;
    });
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const openForm = useCallback((prefill: Partial<BillingData>) => {
    setInitial(prefill);
    setValue(prefill);
    setErrors({});
    setSubmitted(false);
    setPhase('form');
  }, []);

  /** „Da": save straight away when the address is known, else ask for it. */
  const applyKnownPerson = useCallback(async () => {
    if (!person) return;
    const base: Partial<BillingData> = {
      ...EMPTY_FORM,
      label: formatPersonName(person.lastName, person.firstName),
      firstName: person.firstName,
      lastName: person.lastName,
      cnp: person.cnp,
    };

    if (!knownAddress) {
      setAddressNeeded(true);
      openForm(base);
      // Straight to the one thing still missing.
      requestAnimationFrame(() => document.getElementById('address')?.focus());
      return;
    }

    setSaving(true);
    setFormError(null);
    const saved = await create({
      ...base,
      address: knownAddress.streetLine,
      city: knownAddress.city,
      county: knownAddress.county,
      postalCode: knownAddress.postalCode,
    } as BillingData);
    if (!saved) {
      setSaving(false);
      setFormError('Nu am putut salva datele de facturare. Încearcă din nou.');
      return;
    }
    onDirtyChange(false);
    onSaved();
  }, [person, knownAddress, create, openForm, onDirtyChange, onSaved]);

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

  if (phase === 'loading') {
    return (
      <div className="space-y-3 pb-5" aria-busy="true" aria-live="polite">
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100 motion-reduce:animate-none" />
        <div className="h-24 animate-pulse rounded-xl bg-neutral-100 motion-reduce:animate-none" />
        <span className="sr-only">Se încarcă datele tale</span>
      </div>
    );
  }

  if (phase === 'offer' && person) {
    const name = formatPersonName(person.lastName, person.firstName);
    return (
      <div className="space-y-5 pb-5">
        <FormError message={formError} />

        <p className="text-sm leading-relaxed text-neutral-600">
          Avem deja datele tale din act. Le folosim și pe factură?
        </p>

        {/* What will be on the invoice, shown before it is decided. */}
        <dl className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-neutral-50/60">
          <div className="flex items-start gap-3 px-4 py-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <IdCard className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Nume</dt>
                <dd className="font-semibold text-secondary-900">{name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">CNP</dt>
                <dd className="font-mono text-sm text-secondary-900">{person.cnp}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Adresă de facturare</dt>
                <dd className="text-sm text-secondary-900">
                  {addressesLoading ? (
                    <span className="text-neutral-400">Se încarcă…</span>
                  ) : knownAddress ? (
                    `${knownAddress.streetLine}, ${knownAddress.city}, ${knownAddress.county}`
                  ) : (
                    <span className="text-neutral-500">O completezi la pasul următor.</span>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </dl>

        <div className="flex flex-col gap-2">
          <Button
            ref={yesRef}
            type="button"
            data-autofocus="true"
            onClick={() => void applyKnownPerson()}
            disabled={saving || addressesLoading}
            className="h-12 w-full justify-center rounded-xl bg-primary-600 text-base font-semibold text-white hover:bg-primary-700"
          >
            <Check className="mr-2 h-4 w-4" aria-hidden="true" />
            {saving ? 'Se salvează…' : 'Da, folosește aceste date'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => openForm(EMPTY_FORM)}
            disabled={saving}
            className="h-12 w-full justify-center rounded-xl text-base"
          >
            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
            Nu, completez alte date
          </Button>
          <p className="text-center text-xs leading-relaxed text-neutral-500">
            Poți factura și pe o firmă: alegi „Persoană juridică&quot; și scrii CUI-ul, restul se
            completează de la ANAF.
          </p>
        </div>
      </div>
    );
  }

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

      {addressNeeded && (
        <p
          role="status"
          className="rounded-xl border border-primary-100 bg-primary-50 px-3 py-2.5 text-sm leading-relaxed text-primary-900"
        >
          Numele și CNP-ul sunt luate din act. Mai lipsește doar adresa de facturare.
        </p>
      )}

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
