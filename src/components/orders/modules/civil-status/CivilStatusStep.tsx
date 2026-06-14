'use client';

import { useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import type { CivilStatusConfig, CivilStatusState } from '@/types/verification-modules';
import { cn } from '@/lib/utils';

interface CivilStatusStepProps {
  config: CivilStatusConfig | null | undefined;
  onValidChange: (valid: boolean) => void;
}

const DOC_LABEL: Record<NonNullable<CivilStatusConfig>['documentType'], string> = {
  nastere: 'certificatul de naștere',
  casatorie: 'certificatul de căsătorie',
  celibat: 'certificatul de celibat',
};

/** Small pill-style radio used throughout the wizard. */
function ChoiceRow({
  name,
  value,
  current,
  onChange,
  options,
}: {
  name: string;
  value: string | undefined;
  current: string | undefined;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  void value;
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              active
                ? 'border-primary-500 bg-primary-50 text-secondary-900'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary-300'
            )}
          >
            {opt.label}
          </button>
        );
      })}
      <input type="hidden" name={name} value={current ?? ''} readOnly />
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-secondary-900">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function CivilStatusStep({ config, onValidChange }: CivilStatusStepProps) {
  const { state, updateCivilStatus } = useModularWizard();
  const cs: CivilStatusState = useMemo(() => state.civilStatus ?? {}, [state.civilStatus]);
  const fields = useMemo(() => config?.fields ?? {}, [config]);
  const docLabel = config ? DOC_LABEL[config.documentType] : 'documentul';

  // Compute validity: every enabled field that is required must be filled.
  useEffect(() => {
    const checks: boolean[] = [];
    if (fields.applicantType) checks.push(!!cs.applicantType);
    if (fields.maritalStatus) checks.push(!!cs.maritalStatus);
    if (fields.maritalHistory) {
      checks.push(cs.wasMarriedBefore !== undefined);
      if (cs.wasMarriedBefore) {
        checks.push(!!cs.priorMarriagesCount?.trim());
        checks.push(!!cs.lastMarriageEndedBy);
      }
    }
    if (fields.spouseName) checks.push(!!cs.spouseNameBeforeMarriage?.trim());
    if (fields.marriageDate) checks.push(!!cs.marriageDate?.trim());
    if (fields.registrationPlace) checks.push(!!cs.registrationPlace?.trim());
    if (fields.birthName) checks.push(!!cs.birthName?.trim());
    if (fields.parentNames) {
      checks.push(!!cs.fatherName?.trim());
      checks.push(!!cs.motherName?.trim());
    }
    if (fields.purpose) checks.push(!!cs.purpose?.trim());
    if (fields.countryOfUse) checks.push(!!cs.countryOfUse?.trim());
    onValidChange(checks.every(Boolean));
  }, [cs, fields, onValidChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-secondary-900 mb-1">Date pentru stare civilă</h2>
        <p className="text-sm text-neutral-600">
          Aceste informații sunt necesare pentru a solicita {docLabel} la Starea Civilă.
        </p>
      </div>

      <div className="space-y-5">
        {fields.applicantType && (
          <Field label="Pentru cine se solicită certificatul?" required>
            <ChoiceRow
              name="applicantType"
              value={cs.applicantType}
              current={cs.applicantType}
              onChange={(v) => updateCivilStatus({ applicantType: v as CivilStatusState['applicantType'] })}
              options={[
                { value: 'minor', label: 'Minor (sub 18 ani)' },
                { value: 'adult', label: 'Adult (18 ani și peste)' },
              ]}
            />
          </Field>
        )}

        {fields.maritalStatus && (
          <Field label="Care este starea civilă actuală?" required>
            <ChoiceRow
              name="maritalStatus"
              value={cs.maritalStatus}
              current={cs.maritalStatus}
              onChange={(v) => updateCivilStatus({ maritalStatus: v as CivilStatusState['maritalStatus'] })}
              options={[
                { value: 'necasatorit', label: 'Necăsătorit(ă)' },
                { value: 'casatorit', label: 'Căsătorit(ă)' },
                { value: 'divortat', label: 'Divorțat(ă)' },
                { value: 'vaduv', label: 'Văduv(ă)' },
              ]}
            />
          </Field>
        )}

        {fields.maritalHistory && (
          <Field label="Ați mai fost căsătorit(ă) anterior?" required>
            <ChoiceRow
              name="wasMarriedBefore"
              value={cs.wasMarriedBefore === undefined ? undefined : cs.wasMarriedBefore ? 'da' : 'nu'}
              current={cs.wasMarriedBefore === undefined ? undefined : cs.wasMarriedBefore ? 'da' : 'nu'}
              onChange={(v) => updateCivilStatus({ wasMarriedBefore: v === 'da' })}
              options={[
                { value: 'da', label: 'Da' },
                { value: 'nu', label: 'Nu' },
              ]}
            />
            {cs.wasMarriedBefore && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <Field label="De câte ori ați mai fost căsătorit(ă)?" required>
                  <Input
                    inputMode="numeric"
                    value={cs.priorMarriagesCount ?? ''}
                    onChange={(e) => updateCivilStatus({ priorMarriagesCount: e.target.value })}
                    placeholder="ex: 1"
                  />
                </Field>
                <Field label="Ultima căsătorie s-a încheiat prin" required>
                  <ChoiceRow
                    name="lastMarriageEndedBy"
                    value={cs.lastMarriageEndedBy}
                    current={cs.lastMarriageEndedBy}
                    onChange={(v) => updateCivilStatus({ lastMarriageEndedBy: v as CivilStatusState['lastMarriageEndedBy'] })}
                    options={[
                      { value: 'divort', label: 'Divorț' },
                      { value: 'deces', label: 'Decesul soțului/soției' },
                    ]}
                  />
                </Field>
              </div>
            )}
          </Field>
        )}

        {fields.marriageDate && (
          <Field label="Data căsătoriei" required>
            <Input
              type="date"
              value={cs.marriageDate ?? ''}
              onChange={(e) => updateCivilStatus({ marriageDate: e.target.value })}
            />
          </Field>
        )}

        {fields.spouseName && (
          <Field label="Numele complet al soțului/soției înainte de căsătorie" required>
            <Input
              value={cs.spouseNameBeforeMarriage ?? ''}
              onChange={(e) => updateCivilStatus({ spouseNameBeforeMarriage: e.target.value })}
              placeholder="Nume și prenume"
            />
          </Field>
        )}

        {fields.birthName && (
          <Field label="Numele și prenumele cu care v-ați născut" required>
            <Input
              value={cs.birthName ?? ''}
              onChange={(e) => updateCivilStatus({ birthName: e.target.value })}
              placeholder="Numele de naștere"
            />
          </Field>
        )}

        {fields.parentNames && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Numele complet al tatălui" required>
              <Input
                value={cs.fatherName ?? ''}
                onChange={(e) => updateCivilStatus({ fatherName: e.target.value })}
                placeholder="Nume și prenume tată"
              />
            </Field>
            <Field label="Numele complet al mamei" required>
              <Input
                value={cs.motherName ?? ''}
                onChange={(e) => updateCivilStatus({ motherName: e.target.value })}
                placeholder="Nume și prenume mamă"
              />
            </Field>
          </div>
        )}

        {fields.registrationPlace && (
          <Field label="Localitatea care a înregistrat actul" required>
            <Input
              value={cs.registrationPlace ?? ''}
              onChange={(e) => updateCivilStatus({ registrationPlace: e.target.value })}
              placeholder="Oraș / comună / sector"
            />
          </Field>
        )}

        {fields.purpose && (
          <Field label="Scopul obținerii certificatului" required>
            <Input
              value={cs.purpose ?? ''}
              onChange={(e) => updateCivilStatus({ purpose: e.target.value })}
              placeholder="ex: dosar de cetățenie, căsătorie în străinătate, instanță"
            />
          </Field>
        )}

        {fields.countryOfUse && (
          <Field label="Țara în care urmează să fie folosit actul" required>
            <Input
              value={cs.countryOfUse ?? ''}
              onChange={(e) => updateCivilStatus({ countryOfUse: e.target.value })}
              placeholder="ex: România, Italia, Germania"
            />
          </Field>
        )}
      </div>
    </div>
  );
}
