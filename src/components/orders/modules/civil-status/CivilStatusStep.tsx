'use client';

import { useEffect, useMemo } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import type { CivilStatusConfig, CivilStatusState } from '@/types/verification-modules';
import { cn } from '@/lib/utils';
import { useCivilStatusTerms } from '@/hooks/use-civil-status-terms';
import {
  CIVIL_REGISTRATION_OPTIONS,
  resolveCivilTermTier,
} from '@/lib/civil-status/delivery-terms';

interface CivilStatusStepProps {
  config: CivilStatusConfig | null | undefined;
  onValidChange: (valid: boolean) => void;
}

const DOC_LABEL: Record<NonNullable<CivilStatusConfig>['documentType'], string> = {
  nastere: 'certificatul de naștere',
  casatorie: 'certificatul de căsătorie',
  celibat: 'certificatul de celibat',
};

/** Pill-style yes/no/choice control (mobile-friendly, accessible). */
function ChoiceRow({
  current,
  onChange,
  options,
}: {
  current: string | undefined;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
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

function Notice({ tone, children }: { tone: 'warn' | 'info'; children: React.ReactNode }) {
  const warn = tone === 'warn';
  return (
    <div
      className={cn(
        'mt-3 flex items-start gap-2 rounded-xl border p-3 text-sm',
        warn ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-blue-200 bg-blue-50 text-blue-800'
      )}
    >
      {warn ? (
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <span>{children}</span>
    </div>
  );
}

const YES_NO = [
  { value: 'da', label: 'Da' },
  { value: 'nu', label: 'Nu' },
];
const PLACE = [
  { value: 'ro', label: 'România' },
  { value: 'strainatate', label: 'Străinătate' },
];

export default function CivilStatusStep({ config, onValidChange }: CivilStatusStepProps) {
  const { state, updateCivilStatus } = useModularWizard();
  const cs: CivilStatusState = useMemo(() => state.civilStatus ?? {}, [state.civilStatus]);
  const fields = useMemo(() => config?.fields ?? {}, [config]);
  const docLabel = config ? DOC_LABEL[config.documentType] : 'documentul';

  // Termen de eliberare estimat în funcție de oficiul (registrationPlace) ales.
  const termTiers = useCivilStatusTerms();
  const resolvedTerm = useMemo(
    () => resolveCivilTermTier(cs.registrationPlace, termTiers),
    [cs.registrationPlace, termTiers]
  );

  const isAdult = !fields.applicantType || cs.applicantType === 'adult';
  const showCurrentlyMarried = !!fields.currentlyMarried && isAdult;
  const showMaritalHistory = !!fields.maritalHistory && isAdult;
  const showMarriagePlace =
    !!fields.marriagePlace &&
    (config?.documentType === 'casatorie' || !!cs.currentlyMarried || !!cs.wasMarriedBefore);

  // Validity: every visible required control must be answered.
  useEffect(() => {
    const checks: boolean[] = [];
    if (fields.applicantType) checks.push(!!cs.applicantType);
    if (fields.birthPlace) checks.push(cs.bornAbroad !== undefined);
    if (fields.birthLocality) {
      checks.push(!!cs.birthLocality?.trim());
      checks.push(!!cs.birthCounty?.trim());
    }
    if (fields.nationality) checks.push(!!cs.nationality?.trim());
    if (showCurrentlyMarried) checks.push(cs.currentlyMarried !== undefined);
    if (fields.maritalStatus) checks.push(!!cs.maritalStatus);
    if (showMaritalHistory) {
      checks.push(cs.wasMarriedBefore !== undefined);
      if (cs.wasMarriedBefore) {
        checks.push(!!cs.priorMarriagesCount?.trim());
        checks.push(!!cs.lastMarriageEndedBy);
        if (fields.stillHaveOldMarriageCert) checks.push(cs.stillHaveOldMarriageCert !== undefined);
      }
    }
    if (fields.marriageAbroadIntent) checks.push(cs.marriageAbroadIntent !== undefined);
    if (showMarriagePlace) checks.push(cs.marriageAbroad !== undefined);
    if (fields.spouseName) checks.push(!!cs.spouseNameBeforeMarriage?.trim());
    if (fields.marriageDate) checks.push(!!cs.marriageDate?.trim());
    if (fields.registrationPlace) checks.push(!!cs.registrationPlace?.trim());
    if (fields.birthName) checks.push(!!cs.birthName?.trim());
    if (fields.parentNames) {
      checks.push(!!cs.fatherName?.trim());
      checks.push(!!cs.motherName?.trim());
    }
    if (fields.oldCertificateReason) checks.push(!!cs.oldCertificateReason);
    if (fields.renouncedCitizenship) checks.push(cs.renouncedRomanianCitizenship !== undefined);
    if (fields.purpose) checks.push(!!cs.purpose?.trim());
    if (fields.countryOfUse) checks.push(!!cs.countryOfUse?.trim());
    onValidChange(checks.every(Boolean));
  }, [cs, fields, showCurrentlyMarried, showMaritalHistory, showMarriagePlace, onValidChange]);

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
              current={cs.applicantType}
              onChange={(v) => updateCivilStatus({ applicantType: v as CivilStatusState['applicantType'] })}
              options={[
                { value: 'minor', label: 'Minor (sub 18 ani)' },
                { value: 'adult', label: 'Adult (18 ani și peste)' },
              ]}
            />
          </Field>
        )}

        {fields.birthPlace && (
          <Field label="Nașterea a avut loc în:" required>
            <ChoiceRow
              current={cs.bornAbroad === undefined ? undefined : cs.bornAbroad ? 'strainatate' : 'ro'}
              onChange={(v) => updateCivilStatus({ bornAbroad: v === 'strainatate' })}
              options={PLACE}
            />
            {cs.bornAbroad && (
              <Notice tone="warn">
                Dacă nașterea a avut loc în străinătate și <strong>nu a fost transcrisă</strong> în România
                (prin Ambasadă/Consulat, Oficiul de Stare Civilă sau Direcția de Evidență a Persoanelor),
                nu putem elibera documentul solicitat.
              </Notice>
            )}
          </Field>
        )}

        {fields.birthLocality && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Localitatea în care v-ați născut" required>
              <Input
                value={cs.birthLocality ?? ''}
                onChange={(e) => updateCivilStatus({ birthLocality: e.target.value })}
                placeholder="Oraș / comună"
              />
            </Field>
            <Field label="Județul / Sectorul în care v-ați născut" required>
              <Input
                value={cs.birthCounty ?? ''}
                onChange={(e) => updateCivilStatus({ birthCounty: e.target.value })}
                placeholder="Județ / sector"
              />
            </Field>
          </div>
        )}

        {fields.nationality && (
          <Field label="Naționalitatea" required>
            <Input
              value={cs.nationality ?? ''}
              onChange={(e) => updateCivilStatus({ nationality: e.target.value })}
              placeholder="ex: română"
            />
          </Field>
        )}

        {fields.maritalStatus && (
          <Field label="Care este starea civilă actuală?" required>
            <ChoiceRow
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

        {showCurrentlyMarried && (
          <Field label="Sunteți căsătorit(ă)?" required>
            <ChoiceRow
              current={cs.currentlyMarried === undefined ? undefined : cs.currentlyMarried ? 'da' : 'nu'}
              onChange={(v) => updateCivilStatus({ currentlyMarried: v === 'da' })}
              options={YES_NO}
            />
          </Field>
        )}

        {showMaritalHistory && (
          <Field label="Ați mai fost căsătorit(ă) anterior?" required>
            <ChoiceRow
              current={cs.wasMarriedBefore === undefined ? undefined : cs.wasMarriedBefore ? 'da' : 'nu'}
              onChange={(v) => updateCivilStatus({ wasMarriedBefore: v === 'da' })}
              options={YES_NO}
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
                    current={cs.lastMarriageEndedBy}
                    onChange={(v) => updateCivilStatus({ lastMarriageEndedBy: v as CivilStatusState['lastMarriageEndedBy'] })}
                    options={[
                      { value: 'divort', label: 'Divorț' },
                      { value: 'deces', label: 'Decesul soțului/soției' },
                    ]}
                  />
                </Field>
                {cs.lastMarriageEndedBy === 'divort' && (
                  <div className="sm:col-span-2">
                    <Notice tone="warn">
                      Dacă divorțul a fost pronunțat în străinătate, el trebuie recunoscut/transcris în România
                      pentru a putea elibera documentul. Altfel, căsătoria anterioară figurează ca fiind în vigoare.
                    </Notice>
                  </div>
                )}
                {fields.stillHaveOldMarriageCert && (
                  <div className="sm:col-span-2">
                    <Field label="Mai dețineți vechiul certificat de căsătorie?" required>
                      <ChoiceRow
                        current={cs.stillHaveOldMarriageCert === undefined ? undefined : cs.stillHaveOldMarriageCert ? 'da' : 'nu'}
                        onChange={(v) => updateCivilStatus({ stillHaveOldMarriageCert: v === 'da' })}
                        options={YES_NO}
                      />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </Field>
        )}

        {showMarriagePlace && (
          <Field label="Căsătoria a avut loc în:" required>
            <ChoiceRow
              current={cs.marriageAbroad === undefined ? undefined : cs.marriageAbroad ? 'strainatate' : 'ro'}
              onChange={(v) => updateCivilStatus({ marriageAbroad: v === 'strainatate' })}
              options={PLACE}
            />
            {cs.marriageAbroad && (
              <Notice tone="warn">
                Dacă căsătoria a avut loc în străinătate și <strong>nu a fost transcrisă</strong> în România,
                nu putem elibera documentul solicitat.
              </Notice>
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

        {fields.oldCertificateReason && (
          <Field label="Vechiul certificat mi-a fost:" required>
            <ChoiceRow
              current={cs.oldCertificateReason}
              onChange={(v) => updateCivilStatus({ oldCertificateReason: v as CivilStatusState['oldCertificateReason'] })}
              options={[
                { value: 'pierdut', label: 'Pierdut' },
                { value: 'deteriorat', label: 'Deteriorat' },
                { value: 'furat', label: 'Furat' },
                { value: 'altul', label: 'Altul' },
              ]}
            />
          </Field>
        )}

        {fields.registrationPlace && (
          <Field label="Județul / sectorul care a înregistrat actul" required>
            <select
              value={cs.registrationPlace ?? ''}
              onChange={(e) => updateCivilStatus({ registrationPlace: e.target.value })}
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base sm:text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Selectați județul / sectorul</option>
              {CIVIL_REGISTRATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {cs.registrationPlace?.trim() && (
              <Notice tone="info">
                Termen estimat de eliberare:{' '}
                <strong>{resolvedTerm.display}</strong>. Termenul efectiv depinde
                de oficiul de stare civilă și poate varia.
              </Notice>
            )}
          </Field>
        )}

        {fields.renouncedCitizenship && (
          <Field label="Ați renunțat vreodată la cetățenia română?" required>
            <ChoiceRow
              current={cs.renouncedRomanianCitizenship === undefined ? undefined : cs.renouncedRomanianCitizenship ? 'da' : 'nu'}
              onChange={(v) => updateCivilStatus({ renouncedRomanianCitizenship: v === 'da' })}
              options={YES_NO}
            />
            {cs.renouncedRomanianCitizenship && (
              <Notice tone="info">
                Certificatul poate fi eliberat, însă pe el <strong>nu va mai figura CNP-ul</strong>, deoarece
                acesta se anulează odată cu renunțarea la cetățenia română.
              </Notice>
            )}
          </Field>
        )}

        {fields.marriageAbroadIntent && (
          <Field label="Solicitați certificatul în vederea încheierii căsătoriei în străinătate?" required>
            <ChoiceRow
              current={cs.marriageAbroadIntent === undefined ? undefined : cs.marriageAbroadIntent ? 'da' : 'nu'}
              onChange={(v) => updateCivilStatus({ marriageAbroadIntent: v === 'da' })}
              options={YES_NO}
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
