'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import type { CivilStatusConfig, CivilStatusState } from '@/types/verification-modules';
import { cn } from '@/lib/utils';
import { useCivilStatusTerms } from '@/hooks/use-civil-status-terms';
import {
  CIVIL_COUNTY_OPTIONS,
  BUCHAREST_SECTORS,
  resolveCivilTermTier,
} from '@/lib/civil-status/delivery-terms';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { COUNTRIES } from '@/config/countries';

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
  const { state, updateCivilStatus, validationAttempt } = useModularWizard();
  const cs: CivilStatusState = useMemo(() => state.civilStatus ?? {}, [state.civilStatus]);
  const fields = useMemo(() => config?.fields ?? {}, [config]);
  const docLabel = config ? DOC_LABEL[config.documentType] : 'documentul';

  // Termen de eliberare estimat în funcție de oficiul (registrationPlace) ales.
  const termTiers = useCivilStatusTerms();
  const resolvedTerm = useMemo(
    () => resolveCivilTermTier(cs.registrationPlace, termTiers),
    [cs.registrationPlace, termTiers]
  );
  // Cascadă județ → sector pentru registrationPlace. Pt București stocăm
  // „București (Sectorul N)"; pt rest = numele județului.
  const rp = cs.registrationPlace ?? '';
  const rpIsBuc = /^bucure[sș]ti/i.test(rp);
  const rpCounty = rpIsBuc ? 'București' : rp;
  const rpSector = rpIsBuc ? (rp.match(/Sectorul \d/)?.[0] ?? '') : '';
  const rpComplete = !!rp.trim() && (!rpIsBuc || !!rpSector);

  // Aceeași cascadă județ→sector pentru județul/sectorul nașterii (celibat).
  const bc = cs.birthCounty ?? '';
  const bcIsBuc = /^bucure[sș]ti/i.test(bc);
  const bcCounty = bcIsBuc ? 'București' : bc;
  const bcSector = bcIsBuc ? (bc.match(/Sectorul \d/)?.[0] ?? '') : '';
  const bcComplete = !!bc.trim() && (!bcIsBuc || !!bcSector);

  const isAdult = !fields.applicantType || cs.applicantType === 'adult';
  const showCurrentlyMarried = !!fields.currentlyMarried && isAdult;
  const showMaritalHistory = !!fields.maritalHistory && isAdult;
  const showMarriagePlace =
    !!fields.marriagePlace &&
    (config?.documentType === 'casatorie' || !!cs.currentlyMarried || !!cs.wasMarriedBefore);

  // Validity: every visible required control must be answered. Each check
  // carries a label so a failed «Continuă» can list exactly what's missing.
  const missingItems = useMemo(() => {
    const missing: string[] = [];
    const req = (ok: boolean, label: string) => {
      if (!ok) missing.push(label);
    };
    if (fields.applicantType) req(!!cs.applicantType, 'Pentru cine se solicită certificatul');
    if (fields.birthPlace) req(cs.bornAbroad !== undefined, 'Unde s-a înregistrat nașterea (România sau străinătate)');
    if (fields.birthLocality) {
      req(!!cs.birthLocality?.trim(), 'Localitatea nașterii');
      req(bcComplete, 'Județul (și sectorul, pentru București) nașterii');
    }
    if (fields.marriageAbroadIntent && cs.marriageAbroadIntent === true) {
      req(!!cs.futureSpouseName?.trim(), 'Numele viitorului soț / viitoarei soții');
      if (fields.nationality) req(!!cs.nationality?.trim(), 'Cetățenia');
      // Country of use is asked conditionally for the marriage-abroad flow
      // even when the service config doesn't enable countryOfUse globally.
      if (!fields.countryOfUse)
        req(!!cs.countryOfUse?.trim(), 'Țara în care va avea loc căsătoria');
    }
    if (showCurrentlyMarried) req(cs.currentlyMarried !== undefined, 'Dacă ești căsătorit(ă) în prezent');
    if (fields.maritalStatus) req(!!cs.maritalStatus, 'Starea civilă');
    if (showMaritalHistory) {
      req(cs.wasMarriedBefore !== undefined, 'Dacă ai mai fost căsătorit(ă)');
      if (cs.wasMarriedBefore) {
        req(!!cs.priorMarriagesCount?.trim(), 'Numărul căsătoriilor anterioare');
        req(!!cs.lastMarriageEndedBy, 'Cum s-a încheiat ultima căsătorie');
        if (cs.lastMarriageEndedBy === 'divort') {
          req(!!cs.divorcePlace, 'Unde a avut loc divorțul');
          if (cs.divorcePlace === 'strainatate')
            req(cs.divorceRegisteredInRomania !== undefined, 'Dacă divorțul este înregistrat în România');
        }
        if (fields.stillHaveOldMarriageCert)
          req(cs.stillHaveOldMarriageCert !== undefined, 'Dacă mai deții certificatul de căsătorie vechi');
      }
    }
    if (fields.marriageAbroadIntent) req(cs.marriageAbroadIntent !== undefined, 'Dacă intenționezi să te căsătorești în străinătate');
    if (showMarriagePlace) req(cs.marriageAbroad !== undefined, 'Unde a avut loc căsătoria');
    if (fields.spouseName) req(!!cs.spouseNameBeforeMarriage?.trim(), 'Numele soțului/soției dinaintea căsătoriei');
    if (fields.marriageDate) req(!!cs.marriageDate?.trim(), 'Data căsătoriei');
    if (fields.registrationPlace) req(rpComplete, 'Județul (și sectorul, pentru București) unde s-a înregistrat actul');
    if (fields.birthName) req(!!cs.birthName?.trim(), 'Numele la naștere');
    if (fields.parentNames) {
      req(!!cs.fatherName?.trim(), 'Prenumele tatălui');
      req(!!cs.motherName?.trim(), 'Prenumele mamei');
    }
    if (fields.oldCertificateReason) req(!!cs.oldCertificateReason, 'Motivul pentru care soliciți un certificat nou');
    if (fields.renouncedCitizenship) req(cs.renouncedRomanianCitizenship !== undefined, 'Dacă ai renunțat la cetățenia română');
    if (fields.purpose && !(fields.marriageAbroadIntent && cs.marriageAbroadIntent === true))
      req(!!cs.purpose?.trim(), 'Scopul solicitării');
    if (fields.countryOfUse) req(!!cs.countryOfUse?.trim(), 'Țara unde va fi folosit documentul');
    return missing;
  }, [cs, fields, bcComplete, rpComplete, showCurrentlyMarried, showMaritalHistory, showMarriagePlace]);

  useEffect(() => {
    onValidChange(missingItems.length === 0);
  }, [missingItems, onValidChange]);

  // «Continuă» tapped while incomplete → show the missing list below.
  // Baseline captured at mount: the counter is global, don't flash errors
  // for attempts made on previous steps.
  const [validationBaseline] = useState(validationAttempt);
  const showErrors = validationAttempt !== validationBaseline;

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
            <Field label="Județul în care v-ați născut" required>
              <SearchableSelect
                options={CIVIL_COUNTY_OPTIONS}
                value={bcCounty}
                placeholder="Caută județul..."
                onChange={(county) =>
                  updateCivilStatus({
                    birthCounty: county === 'București' ? 'București' : county,
                  })
                }
              />
              {bcIsBuc && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-secondary-900 mb-1.5">
                    Sectorul <span className="text-red-500">*</span>
                  </p>
                  <SearchableSelect
                    options={BUCHAREST_SECTORS}
                    value={bcSector}
                    placeholder="Alege sectorul..."
                    onChange={(sector) =>
                      updateCivilStatus({ birthCounty: `București (${sector})` })
                    }
                  />
                </div>
              )}
            </Field>
          </div>
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
                    onChange={(v) =>
                      updateCivilStatus({
                        lastMarriageEndedBy: v as CivilStatusState['lastMarriageEndedBy'],
                        // Divorce sub-answers only make sense for 'divort'.
                        ...(v !== 'divort'
                          ? { divorcePlace: undefined, divorceRegisteredInRomania: undefined }
                          : {}),
                      })
                    }
                    options={[
                      { value: 'divort', label: 'Divorț' },
                      { value: 'deces', label: 'Decesul soțului/soției' },
                    ]}
                  />
                </Field>
                {cs.lastMarriageEndedBy === 'divort' && (
                  <div className="sm:col-span-2">
                    <Field label="Unde s-a făcut divorțul?" required>
                      <ChoiceRow
                        current={cs.divorcePlace}
                        onChange={(v) =>
                          updateCivilStatus({
                            divorcePlace: v as CivilStatusState['divorcePlace'],
                            ...(v === 'ro' ? { divorceRegisteredInRomania: undefined } : {}),
                          })
                        }
                        options={PLACE}
                      />
                    </Field>
                    {cs.divorcePlace === 'strainatate' && (
                      <div className="mt-4">
                        <Field label="A fost înregistrat divorțul în România?" required>
                          <ChoiceRow
                            current={
                              cs.divorceRegisteredInRomania === undefined
                                ? undefined
                                : cs.divorceRegisteredInRomania
                                  ? 'da'
                                  : 'nu'
                            }
                            onChange={(v) => updateCivilStatus({ divorceRegisteredInRomania: v === 'da' })}
                            options={YES_NO}
                          />
                        </Field>
                      </div>
                    )}
                    {cs.divorcePlace === 'strainatate' && cs.divorceRegisteredInRomania === false && (
                      <Notice tone="warn">
                        Divorțul pronunțat în străinătate trebuie recunoscut/transcris în România
                        pentru a putea elibera documentul. Altfel, căsătoria anterioară figurează ca fiind în vigoare.
                      </Notice>
                    )}
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
              // Naștere + căsătorie: doar „Pierdut". Celibat: pierdut/distrus/furat.
              options={
                config?.documentType === 'celibat'
                  ? [
                      { value: 'pierdut', label: 'Pierdut' },
                      { value: 'distrus', label: 'Distrus' },
                      { value: 'furat', label: 'Furat' },
                    ]
                  : [{ value: 'pierdut', label: 'Pierdut' }]
              }
            />
          </Field>
        )}

        {fields.registrationPlace && (
          <Field label="Județul care a înregistrat actul" required>
            <SearchableSelect
              options={CIVIL_COUNTY_OPTIONS}
              value={rpCounty}
              placeholder="Caută județul..."
              onChange={(county) =>
                updateCivilStatus({
                  registrationPlace: county === 'București' ? 'București' : county,
                })
              }
            />
            {rpIsBuc && (
              <div className="mt-3">
                <p className="text-sm font-medium text-secondary-900 mb-1.5">
                  Sectorul <span className="text-red-500">*</span>
                </p>
                <SearchableSelect
                  options={BUCHAREST_SECTORS}
                  value={rpSector}
                  placeholder="Alege sectorul..."
                  onChange={(sector) =>
                    updateCivilStatus({ registrationPlace: `București (${sector})` })
                  }
                />
              </div>
            )}
            {rpComplete && (
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
              onChange={(v) =>
                updateCivilStatus({
                  marriageAbroadIntent: v === 'da',
                  // Switching to "nu" drops the marriage country so stale data
                  // doesn't ride into customer_data (unless the service asks
                  // for countryOfUse independently via config).
                  ...(v !== 'da' && !fields.countryOfUse ? { countryOfUse: undefined } : {}),
                })
              }
              options={YES_NO}
            />
          </Field>
        )}

        {/* Căsătorie în străinătate = Da → date despre viitorul soț/soție. */}
        {fields.marriageAbroadIntent && cs.marriageAbroadIntent === true && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Numele complet al viitorului soț/soție" required>
              <Input
                value={cs.futureSpouseName ?? ''}
                onChange={(e) => updateCivilStatus({ futureSpouseName: e.target.value })}
                placeholder="Nume și prenume"
              />
            </Field>
            <Field label="Naționalitatea viitorului soț/soție" required>
              <Input
                value={cs.nationality ?? ''}
                onChange={(e) => updateCivilStatus({ nationality: e.target.value })}
                placeholder="ex: italiană, germană"
              />
            </Field>
          </div>
        )}

        {/* Căsătorie în străinătate = Da → țara unde va fi folosit actul
            (unde are loc căsătoria). Necesară echipei pentru apostilă/
            supralegalizare și mențiunile de pe cerere. Fără România — actul
            e cerut explicit pentru străinătate. Randează doar când serviciul
            nu are deja countryOfUse activat în config (evită dublura). */}
        {!fields.countryOfUse &&
          fields.marriageAbroadIntent &&
          cs.marriageAbroadIntent === true && (
          <Field label="În ce țară va avea loc căsătoria (unde va fi folosit certificatul)?" required>
            <SearchableSelect
              options={COUNTRIES.filter((c) => c !== 'România')}
              value={cs.countryOfUse ?? ''}
              placeholder="Caută țara..."
              onChange={(country) => updateCivilStatus({ countryOfUse: country })}
            />
          </Field>
        )}

        {/* Scopul — apare DOAR dacă NU e pentru căsătorie în străinătate. */}
        {fields.purpose && !(fields.marriageAbroadIntent && cs.marriageAbroadIntent === true) && (
          <Field label="Scopul obținerii certificatului" required>
            <Input
              value={cs.purpose ?? ''}
              onChange={(e) => updateCivilStatus({ purpose: e.target.value })}
              placeholder="ex: dosar de cetățenie, instanță, bancă"
            />
          </Field>
        )}

        {fields.countryOfUse && (
          <Field label="Țara în care urmează să fie folosit actul" required>
            <SearchableSelect
              options={COUNTRIES}
              value={cs.countryOfUse ?? ''}
              placeholder="Caută țara..."
              onChange={(country) => updateCivilStatus({ countryOfUse: country })}
            />
          </Field>
        )}
      </div>

      {/* What's blocking «Continuă» — shown only after a failed attempt;
          data-wizard-error is the parent's scroll target. */}
      {showErrors && missingItems.length > 0 && (
        <div data-wizard-error className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800 mb-1">
            Ca să poți continua, mai completează:
          </p>
          <ul className="text-sm text-red-700 list-disc pl-5 space-y-0.5">
            {missingItems.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
