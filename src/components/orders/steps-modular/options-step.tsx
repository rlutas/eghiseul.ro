'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Stamp,
  Languages,
  Scale,
  BookOpen,
  Clock,
  ShieldCheck,
  Globe,
  Info,
  ChevronDown,
  ChevronUp,
  Package,
  Lock,
  Layers,
  CheckCircle,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { ServiceOption } from '@/types/services';
import type { SelectedOptionState } from '@/types/verification-modules';
import { cn } from '@/lib/utils';
import {
  fetchBundledOptions,
  BUNDLED_OPTION_CODES,
} from '@/lib/services/bundled-options';
import {
  isOptionDepBlocked,
  cascadeDropCodes,
} from '@/lib/services/option-dependencies';
import { APOSTILA_COUNTRIES } from '@/config/apostila-countries';
import { TRANSLATION_LANGUAGES } from '@/config/translation-languages';
import { SpecimenInfoButton } from '@/components/orders/specimen-info-button';

interface OptionsStepProps {
  onValidChange: (valid: boolean) => void;
}

// ────────────────────────────────────────────────────────────────────────────
// Option codes + icon/hint mapping (cazierjudiciaronline.com parity)
// ────────────────────────────────────────────────────────────────────────────

// Icon assignment per stable DB code.
const CODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  apostila_haga: Stamp,
  traducere: Languages,
  legalizare: Scale,
  apostila_notari: BookOpen,
  urgenta: Clock,
  extras_multilingv: Globe,
};

// Hint text displayed under the option name (kept short — ~1 line).
const CODE_HINTS: Record<string, string> = {
  apostila_haga: 'Convenția de la Haga (+1 zi)',
  traducere: 'Traducere legalizată (+1-2 zile)',
  legalizare: 'Legalizare document tradus',
  apostila_notari: 'Apostilă pe documentul legalizat',
  urgenta: 'Eliberare prioritară',
};

// Codes that belong to the "extras internaționale" dependency chain.
const EXTRAS_CODES = ['apostila_haga', 'traducere', 'legalizare', 'apostila_notari'] as const;

// Auto-applied system flags — rendered as read-only info cards, not toggles.
const AUTO_APPLIED_CODES = new Set(['cetatean_strain']);

// Codes hidden from UI (deprecated, or driven by another module).
// 'extras_suplimentar' is set by the Property module (multi-imobil), not a toggle.
const HIDDEN_CODES = new Set(['verificare_expert', 'copii_suplimentare', 'extras_suplimentar']);

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function isCrossServiceOption(option: ServiceOption): boolean {
  if (option.code?.startsWith('addon_')) return true;
  const cfg = option.config as { addon_type?: string } | null | undefined;
  return cfg?.addon_type === 'bundled_service';
}

function getBundledServiceSlug(option: ServiceOption): string | null {
  const cfg = option.config as { addon_service_slug?: string } | null | undefined;
  return cfg?.addon_service_slug ?? null;
}

/** Format price as Romanian short decimal (e.g. 178.5 → "178,50", 238 → "238"). */
function formatPrice(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace('.', ',');
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN STEP COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export function OptionsStepModular({ onValidChange }: OptionsStepProps) {
  const { state, updateOptions, priceBreakdown, serviceOptions, goToStep } = useModularWizard();
  const { selectedOptions } = state;

  // Service name — used in the extras header (e.g. "Opțiuni suplimentare Certificat Nastere").
  const serviceDisplayName = useMemo(() => {
    // We don't have the service name directly in provider state, but we can
    // derive a readable label from the slug (fallback).
    if (!state.serviceSlug) return '';
    return state.serviceSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [state.serviceSlug]);

  // ──────────────────────────────────────────────────────────────────────────
  // Index service options by code for quick lookup.
  // ──────────────────────────────────────────────────────────────────────────
  const optionsByCode = useMemo(() => {
    const map = new Map<string, ServiceOption>();
    for (const opt of serviceOptions) {
      if (opt.code) map.set(opt.code, opt);
    }
    return map;
  }, [serviceOptions]);

  // Auto-applied selections (e.g. cetățean_strain from citizenship).
  const autoAppliedSelections = useMemo(
    () =>
      selectedOptions.filter(
        (o) => o.isAutoApplied || (o.code && AUTO_APPLIED_CODES.has(o.code))
      ),
    [selectedOptions]
  );

  // Cross-service add-on options (second bundled service).
  const crossServiceOptions = useMemo(
    () => serviceOptions.filter(isCrossServiceOption),
    [serviceOptions]
  );

  // Generic "other options" bucket — any active option NOT already rendered by a
  // dedicated section above (urgența, lanțul apostilă/traducere, cross-service,
  // auto-aplicate, sau ascunse). Ex: extras multilingv pe naștere/căsătorie.
  // Previne pasul gol și randează automat opțiuni viitoare fără cod nou.
  const otherOptions = useMemo(() => {
    const handled = new Set<string>([
      ...EXTRAS_CODES,
      'urgenta',
      ...AUTO_APPLIED_CODES,
      ...HIDDEN_CODES,
    ]);
    return serviceOptions.filter(
      (o) =>
        !!o.code &&
        o.is_active !== false &&
        !handled.has(o.code) &&
        !isCrossServiceOption(o)
    );
  }, [serviceOptions]);

  // Specimen (mostră) pentru o opțiune, dacă există — afișat ca „Vezi specimen".
  const optionSpecimen = useCallback(
    (code: string | undefined): { src: string; alt: string } | null => {
      if (code === 'apostila_haga')
        return { src: '/images/specimens/apostila-haga.webp', alt: 'Apostila de la Haga (specimen)' };
      if (code === 'extras_multilingv') {
        return state.serviceSlug === 'certificat-casatorie'
          ? { src: '/images/specimens/extras-multilingv-casatorie.webp', alt: 'Extras multilingv căsătorie (specimen)' }
          : { src: '/images/specimens/extras-multilingv-nastere.webp', alt: 'Extras multilingv naștere (specimen)' };
      }
      return null;
    },
    [state.serviceSlug]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Selection helpers
  // ──────────────────────────────────────────────────────────────────────────
  const findByCode = useCallback(
    (code: string) => selectedOptions.find((o) => o.code === code && !o.bundledFor),
    [selectedOptions]
  );
  const isCodeSelected = useCallback((code: string) => !!findByCode(code), [findByCode]);

  // Replace the full array atomically for multi-step updates (e.g. toggling
  // traducere must also drop legalizare + apostila_notari).
  const commit = useCallback(
    (next: SelectedOptionState[]) => updateOptions(next),
    [updateOptions]
  );

  // Toggle a regular option by code. Idempotent.
  const toggleByCode = useCallback(
    (option: ServiceOption) => {
      if (!option.code) return;
      const exists = selectedOptions.some((o) => o.optionId === option.id);
      if (exists) {
        commit(selectedOptions.filter((o) => o.optionId !== option.id));
      } else {
        const next: SelectedOptionState = {
          optionId: option.id,
          optionName: option.name,
          optionDescription: option.description || '',
          quantity: 1,
          priceModifier: option.price,
          code: option.code,
        };
        commit([...selectedOptions, next]);
      }
    },
    [selectedOptions, commit]
  );

  // Patch metadata on an already-selected option (by code).
  const patchMetadata = useCallback(
    (code: string, patch: Partial<NonNullable<SelectedOptionState['metadata']>>) => {
      commit(
        selectedOptions.map((o) =>
          o.code === code && !o.bundledFor
            ? { ...o, metadata: { ...(o.metadata ?? {}), ...patch } }
            : o
        )
      );
    },
    [selectedOptions, commit]
  );

  // Toggle cross-service parent add-on (drops its bundled children on deselect).
  const toggleCrossServiceOption = useCallback(
    (option: ServiceOption) => {
      const exists = selectedOptions.some((o) => o.optionId === option.id);
      if (exists) {
        commit(
          selectedOptions.filter(
            (o) => o.optionId !== option.id && o.bundledFor?.parentOptionId !== option.id
          )
        );
      } else {
        const next: SelectedOptionState = {
          optionId: option.id,
          optionName: option.name,
          optionDescription: option.description || '',
          quantity: 1,
          priceModifier: option.price,
          code: option.code,
        };
        commit([...selectedOptions, next]);
      }
    },
    [selectedOptions, commit]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Dependency chain handlers (extras internaționale)
  // ──────────────────────────────────────────────────────────────────────────
  const apostilaHaga = optionsByCode.get('apostila_haga');
  const traducere = optionsByCode.get('traducere');
  const legalizare = optionsByCode.get('legalizare');
  const apostilaNotari = optionsByCode.get('apostila_notari');

  const hagaSelected = isCodeSelected('apostila_haga');
  const traducereSelected = isCodeSelected('traducere');
  const legalizareSelected = isCodeSelected('legalizare');
  const notariSelected = isCodeSelected('apostila_notari');

  const hagaState = findByCode('apostila_haga');
  const traducereState = findByCode('traducere');
  const notariState = findByCode('apostila_notari');

  // Shared destination country (Haga or Notari — whichever is selected).
  // When both are on, Haga's country is the source of truth.
  const sharedCountry =
    hagaState?.metadata?.country ?? notariState?.metadata?.country ?? '';

  const toggleTraducere = useCallback(() => {
    if (!traducere) return;
    if (traducereSelected) {
      // Deselecting Traducere cascades: drop Legalizare + Apostila Notari too.
      const dropCodes = new Set(['traducere', 'legalizare', 'apostila_notari']);
      commit(selectedOptions.filter((o) => !(o.code && dropCodes.has(o.code) && !o.bundledFor)));
    } else {
      const next: SelectedOptionState = {
        optionId: traducere.id,
        optionName: traducere.name,
        optionDescription: traducere.description || '',
        quantity: 1,
        priceModifier: traducere.price,
        code: traducere.code,
      };
      commit([...selectedOptions, next]);
    }
  }, [traducere, traducereSelected, selectedOptions, commit]);

  const toggleLegalizare = useCallback(() => {
    if (!legalizare || !traducereSelected) return;
    if (legalizareSelected) {
      // Deselecting Legalizare also drops Apostila Notari.
      const dropCodes = new Set(['legalizare', 'apostila_notari']);
      commit(selectedOptions.filter((o) => !(o.code && dropCodes.has(o.code) && !o.bundledFor)));
    } else {
      const next: SelectedOptionState = {
        optionId: legalizare.id,
        optionName: legalizare.name,
        optionDescription: legalizare.description || '',
        quantity: 1,
        priceModifier: legalizare.price,
        code: legalizare.code,
      };
      commit([...selectedOptions, next]);
    }
  }, [legalizare, traducereSelected, legalizareSelected, selectedOptions, commit]);

  const toggleNotari = useCallback(() => {
    if (!apostilaNotari || !traducereSelected || !legalizareSelected) return;
    toggleByCode(apostilaNotari);
  }, [apostilaNotari, traducereSelected, legalizareSelected, toggleByCode]);

  // Propagate country to whichever apostila option(s) are selected.
  const setCountry = useCallback(
    (country: string) => {
      commit(
        selectedOptions.map((o) => {
          if (o.bundledFor) return o;
          if (o.code === 'apostila_haga' || o.code === 'apostila_notari') {
            return { ...o, metadata: { ...(o.metadata ?? {}), country } };
          }
          return o;
        })
      );
    },
    [selectedOptions, commit]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Validation
  // ──────────────────────────────────────────────────────────────────────────
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (traducereSelected && !traducereState?.metadata?.language) {
      errs.language = 'Selectați limba de traducere';
    }
    const needsCountry = hagaSelected || (notariSelected && !hagaSelected);
    if (needsCountry && !sharedCountry) {
      errs.country = 'Selectați țara';
    }
    return errs;
  }, [
    traducereSelected,
    traducereState,
    hagaSelected,
    notariSelected,
    sharedCountry,
  ]);

  const isValid = Object.keys(errors).length === 0;

  // Surface errors whenever a dependent field is selected. Derived, not state —
  // keeps the render loop clean (no setState-in-effect).
  const showErrors = traducereSelected || hagaSelected || notariSelected;

  useEffect(() => {
    onValidChange(isValid);
  }, [isValid, onValidChange]);

  // Whether cetatean_strain is auto-applied (suppresses urgenta).
  const hasCetateanStrain = autoAppliedSelections.some((o) => o.code === 'cetatean_strain');

  // Defense: if cetatean_strain is active and urgenta was somehow selected, auto-remove it.
  useEffect(() => {
    if (!hasCetateanStrain) return;
    const urgentaOpt = optionsByCode.get('urgenta');
    if (!urgentaOpt) return;
    const urgentaSelected = selectedOptions.some(
      (o) => o.code === 'urgenta' && !o.bundledFor
    );
    if (urgentaSelected) {
      commit(selectedOptions.filter((o) => o.code !== 'urgenta' || !!o.bundledFor));
    }
  }, [hasCetateanStrain, optionsByCode, selectedOptions, commit]);

  // Sweep deprecated codes from draft selections (one-time, on mount/sync).
  useEffect(() => {
    const hasDeprecated = selectedOptions.some(
      (o) => o.code && HIDDEN_CODES.has(o.code) && !o.bundledFor
    );
    if (hasDeprecated) {
      commit(
        selectedOptions.filter(
          (o) => !(o.code && HIDDEN_CODES.has(o.code) && !o.bundledFor)
        )
      );
    }
  }, [selectedOptions, commit]);

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────
  if (serviceOptions.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          Nu sunt opțiuni suplimentare disponibile
        </h3>
        <p className="text-neutral-600">
          Poți continua la pasul următor pentru a finaliza comanda.
        </p>
      </div>
    );
  }

  const urgenta = optionsByCode.get('urgenta');
  const hasExtras = EXTRAS_CODES.some((c) => optionsByCode.has(c));

  return (
    <div className="space-y-8">
      {/* ────────────────────────────────────────────────────────────── */}
      {/* Procesare Rapidă — urgența (hidden when cetatean_strain)       */}
      {/* ────────────────────────────────────────────────────────────── */}
      {urgenta && !hasCetateanStrain && (
        <section className="space-y-3">
          <SectionHeader
            icon={Clock}
            title="Procesare Rapidă"
            subtitle="Reducere semnificativă a timpului de eliberare"
          />
          <OptionCard
            icon={CODE_ICONS[urgenta.code] ?? Clock}
            name={urgenta.name}
            hint={urgenta.description || CODE_HINTS[urgenta.code] || ''}
            price={urgenta.price}
            selected={isCodeSelected(urgenta.code)}
            onClick={() => toggleByCode(urgenta)}
          />
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* Foreign citizen processing info (replaces urgenta)              */}
      {/* ────────────────────────────────────────────────────────────── */}
      {hasCetateanStrain && (
        <section className="space-y-3">
          <div className="flex items-start gap-3 border-b border-amber-100 pb-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 shrink-0">
              <Globe className="h-4.5 w-4.5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-base font-semibold text-secondary-900 leading-tight">
                Cetățean Străin — Procesare 7-15 zile lucrătoare
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Procesarea urgentă nu este disponibilă pentru cetățeni străini
              </p>
            </div>
          </div>
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <Globe className="h-5 w-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-800">
                  Comanda dumneavoastră necesită verificări suplimentare la I.G.I.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Termenul standard este de 7-15 zile lucrătoare.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* Cetățean Străin — auto-applied info card                        */}
      {/* ────────────────────────────────────────────────────────────── */}
      {autoAppliedSelections.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-start gap-3 border-b border-amber-100 pb-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 shrink-0">
              <Globe className="h-4.5 w-4.5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-base font-semibold text-secondary-900 leading-tight">
                Cetățean Străin
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Verificare suplimentară aplicată automat
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {autoAppliedSelections.map((opt) => (
              <div
                key={opt.optionId}
                className="relative rounded-xl border-2 border-amber-300 bg-amber-50 p-4"
              >
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <Globe className="h-5 w-5 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-amber-900">{opt.optionName}</h4>
                      <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                        <Lock className="mr-1 h-3 w-3" />
                        Aplicat automat
                      </Badge>
                    </div>
                    {opt.optionDescription && (
                      <p className="mt-1 text-sm text-amber-800">{opt.optionDescription}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-amber-200 px-2.5 py-1 text-sm font-bold text-amber-900 tabular-nums">
                        +{formatPrice(opt.priceModifier)} RON
                      </span>
                      <button
                        type="button"
                        onClick={() => goToStep('personal-data')}
                        className="text-xs font-medium text-amber-800 underline hover:text-amber-900"
                      >
                        Modifică cetățenia → pasul 2
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* Opțiuni suplimentare (extras internaționale) — chained          */}
      {/* ────────────────────────────────────────────────────────────── */}
      {hasExtras && (
        <section className="space-y-3">
          <SectionHeader
            icon={Stamp}
            title={`Opțiuni suplimentare${serviceDisplayName ? ` ${serviceDisplayName}` : ''}`}
            subtitle="Apostilă, traducere și legalizare pentru utilizare în străinătate"
          />
          <div className="space-y-3">
            {/* 1. Apostila Haga */}
            {apostilaHaga && (
              <>
                <OptionCard
                  icon={Stamp}
                  name="Apostilă Haga"
                  hint={CODE_HINTS.apostila_haga}
                  price={apostilaHaga.price}
                  selected={hagaSelected}
                  onClick={() => toggleByCode(apostilaHaga)}
                />
                <div className="pl-1">
                  <SpecimenInfoButton
                    src="/images/specimens/apostila-haga.webp"
                    alt="Apostila de la Haga (specimen)"
                  />
                </div>
                {hagaSelected && (
                  <CountryDropdown
                    id="opt-country-haga"
                    label="Țara pentru care se solicită Apostila"
                    value={sharedCountry}
                    onChange={setCountry}
                    error={showErrors ? errors.country : undefined}
                  />
                )}
              </>
            )}

            {/* 2. Traducere Autorizată */}
            {traducere && (
              <>
                <OptionCard
                  icon={Languages}
                  name="Traducere Autorizată"
                  hint={CODE_HINTS.traducere}
                  price={traducere.price}
                  selected={traducereSelected}
                  onClick={toggleTraducere}
                />
                {traducereSelected && (
                  <LanguageDropdown
                    value={traducereState?.metadata?.language ?? ''}
                    onChange={(language) => patchMetadata('traducere', { language })}
                    error={showErrors ? errors.language : undefined}
                  />
                )}
              </>
            )}

            {/* 3. Legalizare Notarială — requires Traducere */}
            {legalizare && (
              <OptionCard
                icon={Scale}
                name="Legalizare Notarială"
                hint={
                  traducereSelected
                    ? CODE_HINTS.legalizare
                    : 'Necesită Traducere Autorizată'
                }
                price={legalizare.price}
                selected={legalizareSelected && traducereSelected}
                disabled={!traducereSelected}
                onClick={toggleLegalizare}
              />
            )}

            {/* 4. Apostila Notari — requires Legalizare */}
            {apostilaNotari && (
              <>
                <OptionCard
                  icon={BookOpen}
                  name="Apostilă Notari (Camera Notarilor)"
                  hint={
                    traducereSelected && legalizareSelected
                      ? CODE_HINTS.apostila_notari
                      : 'Necesită Legalizare'
                  }
                  price={apostilaNotari.price}
                  selected={notariSelected && legalizareSelected && traducereSelected}
                  disabled={!traducereSelected || !legalizareSelected}
                  onClick={toggleNotari}
                />
                {/* Shared country dropdown — shown here only when Haga is NOT already selected */}
                {notariSelected && !hagaSelected && (
                  <CountryDropdown
                    id="opt-country-notari"
                    label="Țara pentru care se solicită documentul"
                    value={sharedCountry}
                    onChange={setCountry}
                    error={showErrors ? errors.country : undefined}
                  />
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* Cross-Service Add-ons — "Adaugă Serviciu Suplimentar"           */}
      {/* ────────────────────────────────────────────────────────────── */}
      {crossServiceOptions.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            icon={Layers}
            title="Adaugă Serviciu Suplimentar"
            subtitle="Combină mai multe servicii într-o singură comandă cu plată consolidată"
          />
          <div className="space-y-3">
            {crossServiceOptions.map((option) => (
              <CrossServiceAddonCard
                key={option.id}
                option={option}
                isSelected={selectedOptions.some((o) => o.optionId === option.id)}
                selectedOptions={selectedOptions}
                onToggleParent={() => toggleCrossServiceOption(option)}
                onUpdateOptions={commit}
              />
            ))}
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* Alte opțiuni — bucket generic (ex: extras multilingv UE)        */}
      {/* ────────────────────────────────────────────────────────────── */}
      {otherOptions.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            icon={Globe}
            title="Documente suplimentare"
            subtitle="Forme suplimentare ale documentului, în aceeași comandă"
          />
          <div className="space-y-3">
            {otherOptions.map((option) => {
              const spec = optionSpecimen(option.code);
              return (
                <div key={option.id}>
                  <OptionCard
                    icon={CODE_ICONS[option.code] ?? Globe}
                    name={option.name}
                    hint={option.description || ''}
                    price={option.price}
                    selected={isCodeSelected(option.code)}
                    onClick={() => toggleByCode(option)}
                  />
                  {spec && (
                    <div className="mt-1.5 pl-1">
                      <SpecimenInfoButton src={spec.src} alt={spec.alt} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Disclaimer extras multilingv — nu se poate traduce/apostila. */}
          {otherOptions.some((o) => o.code === 'extras_multilingv') &&
            isCodeSelected('extras_multilingv') && (
              <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800 leading-snug">
                  Extrasul multilingv <strong>nu se poate traduce și nici apostila</strong>.
                  Dacă alegi și traducere/apostilă, acestea se aplică pe duplicatul
                  certificatului simplu, nu pe extrasul multilingv.
                </p>
              </div>
            )}
        </section>
      )}

      {/* "Rezumat Selecții" block removed 2026-05-27 — sticky OrderSummaryCard
          on the right shows the same breakdown across every wizard step, no
          need to duplicate it at the bottom of Step 3. */}

      <p className="text-sm text-center text-neutral-500">
        Opțiunile sunt opționale. Poți continua fără a selecta nimic.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PRESENTATIONAL SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}

function SectionHeader({ icon: Icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3 border-b border-neutral-100 pb-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 shrink-0">
        <Icon className="h-4.5 w-4.5 text-primary-600" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="text-base font-semibold text-secondary-900 leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface OptionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  hint: string;
  price: number;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function OptionCard({
  icon: Icon,
  name,
  hint,
  price,
  selected,
  disabled = false,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'group flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200',
        disabled
          ? 'opacity-50 cursor-not-allowed border-neutral-200 bg-neutral-50/40'
          : selected
          ? 'border-primary-500 bg-primary-50 shadow-sm'
          : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/30'
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-colors',
          disabled
            ? 'bg-neutral-100'
            : selected
            ? 'bg-primary-100'
            : 'bg-neutral-100 group-hover:bg-primary-100/60'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 transition-colors',
            disabled
              ? 'text-neutral-400'
              : selected
              ? 'text-primary-600'
              : 'text-neutral-500 group-hover:text-primary-600'
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-secondary-900 leading-tight">{name}</p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{hint}</p>
      </div>
      <PriceChip price={price} selected={selected} disabled={disabled} />
    </button>
  );
}

interface PriceChipProps {
  price: number;
  selected: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

function PriceChip({ price, selected, disabled = false, size = 'md' }: PriceChipProps) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-lg font-bold tabular-nums transition-colors whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        disabled
          ? 'bg-neutral-100 text-neutral-400'
          : selected
          ? 'bg-primary-100 text-primary-700'
          : 'bg-neutral-100 text-neutral-700 group-hover:bg-primary-100/70 group-hover:text-primary-700'
      )}
    >
      +{formatPrice(price)} RON
    </span>
  );
}

interface LanguageDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
}

function LanguageDropdown({ value, onChange, error, id = 'opt-language' }: LanguageDropdownProps) {
  return (
    <div className="border-l-2 border-primary-200 pl-4">
      <label htmlFor={id} className="text-sm font-medium text-secondary-900">
        Limba Traducere <span className="text-red-500">*</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          // text-base on mobile prevents iOS Safari auto-zoom on focus.
          'mt-1.5 h-11 w-full rounded-lg border bg-white px-3 text-base sm:text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          error ? 'border-red-500' : 'border-neutral-300'
        )}
      >
        <option value="">Selectați limba</option>
        {TRANSLATION_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface CountryDropdownProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function CountryDropdown({ id, label, value, onChange, error }: CountryDropdownProps) {
  return (
    <div className="border-l-2 border-primary-200 pl-4">
      <label htmlFor={id} className="text-sm font-medium text-secondary-900">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          // text-base on mobile prevents iOS Safari auto-zoom on focus.
          'mt-1.5 h-11 w-full rounded-lg border bg-white px-3 text-base sm:text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          error ? 'border-red-500' : 'border-neutral-300'
        )}
      >
        <option value="">Selectați țara</option>
        {APOSTILA_COUNTRIES.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CROSS-SERVICE ADD-ON SUBCOMPONENT (unchanged from Phase I — restyled)
// ════════════════════════════════════════════════════════════════════════════

interface CrossServiceAddonCardProps {
  option: ServiceOption;
  isSelected: boolean;
  selectedOptions: SelectedOptionState[];
  onToggleParent: () => void;
  onUpdateOptions: (options: SelectedOptionState[]) => void;
}

function CrossServiceAddonCard({
  option,
  isSelected,
  selectedOptions,
  onToggleParent,
  onUpdateOptions,
}: CrossServiceAddonCardProps) {
  const bundledSlug = getBundledServiceSlug(option);
  const [bundledOptions, setBundledOptions] = useState<ServiceOption[]>([]);
  const [isLoadingBundled, setIsLoadingBundled] = useState(false);
  const [bundledError, setBundledError] = useState<string | null>(null);

  // Lazy-load bundled sub-options when the parent is activated.
  // Setting state synchronously here is a legitimate "subscribe to an
  // external async resource" pattern (not a synchronous cascade render).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;
    if (!isSelected || !bundledSlug || bundledOptions.length > 0) return;

    setIsLoadingBundled(true);
    setBundledError(null);
    fetchBundledOptions(bundledSlug)
      .then((opts) => {
        if (!cancelled) setBundledOptions(opts);
      })
      .catch((err) => {
        if (!cancelled)
          setBundledError(
            err instanceof Error ? err.message : 'Nu am putut încărca opțiunile'
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBundled(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSelected, bundledSlug, bundledOptions.length]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // BUG fix (2026-05-27): the selection check has to use the same synthetic
  // id that `toggleBundled` writes, `bundled:<parent.id>:<bundled.id>`.
  // The previous version compared against `bundled.id` directly, so it
  // always returned false — the row would briefly flash yellow on hover
  // but never stay highlighted after clicking, even though the option
  // was correctly added to selectedOptions and showed up in the summary.
  const isBundledSelected = useCallback(
    (bundledOptionId: string) => {
      const syntheticId = `bundled:${option.id}:${bundledOptionId}`;
      return selectedOptions.some(
        (o) =>
          o.bundledFor?.parentOptionId === option.id && o.optionId === syntheticId
      );
    },
    [selectedOptions, option.id]
  );

  // Which bundled codes are currently selected WITHIN this parent's group.
  // The apostilă/traducere/legalizare dependency chain is scoped per parent —
  // selecting "legalizare" under Certificat Integritate must look only at the
  // traducere chosen under that same secondary service, not the primary one.
  const selectedBundledCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const o of selectedOptions) {
      if (
        o.bundledFor?.parentOptionId === option.id &&
        o.bundledFor?.bundledOptionCode
      ) {
        codes.add(o.bundledFor.bundledOptionCode);
      }
    }
    return codes;
  }, [selectedOptions, option.id]);

  const toggleBundled = (bundled: ServiceOption) => {
    const syntheticId = `bundled:${option.id}:${bundled.id}`;
    const already = selectedOptions.find((o) => o.optionId === syntheticId);

    if (already) {
      // Deselecting a prerequisite cascades: drop its dependents in this group
      // (traducere → legalizare → apostila_notari).
      const dropCodes = cascadeDropCodes(bundled.code);
      onUpdateOptions(
        selectedOptions.filter(
          (o) =>
            !(
              o.bundledFor?.parentOptionId === option.id &&
              o.bundledFor?.bundledOptionCode &&
              dropCodes.has(o.bundledFor.bundledOptionCode)
            )
        )
      );
    } else {
      if (!bundledSlug) return;
      // Block selecting a dependent option before its prerequisite.
      if (isOptionDepBlocked(bundled.code, selectedBundledCodes)) return;
      const newOption: SelectedOptionState = {
        optionId: syntheticId,
        optionName: `${bundled.name} (${option.name})`,
        optionDescription: bundled.description || '',
        quantity: 1,
        priceModifier: bundled.price,
        bundledFor: {
          parentOptionId: option.id,
          bundledServiceSlug: bundledSlug,
          bundledOptionCode: bundled.code,
        },
        // Holds the apostila destination country / translation language for
        // bundled options (same as primary options carry on their metadata).
        metadata: {},
      };
      onUpdateOptions([...selectedOptions, newOption]);
    }
  };

  // Patch the country/language metadata on a specific bundled option (by its
  // synthetic id). Mirrors the primary patchMetadata but scoped to this card.
  const patchBundledMetadata = (
    syntheticId: string,
    patch: { country?: string; language?: string }
  ) => {
    onUpdateOptions(
      selectedOptions.map((o) =>
        o.optionId === syntheticId
          ? { ...o, metadata: { ...(o.metadata ?? {}), ...patch } }
          : o
      )
    );
  };

  const sortedBundled = useMemo(() => {
    return [...bundledOptions].sort(
      (a, b) =>
        BUNDLED_OPTION_CODES.indexOf(a.code as (typeof BUNDLED_OPTION_CODES)[number]) -
        BUNDLED_OPTION_CODES.indexOf(b.code as (typeof BUNDLED_OPTION_CODES)[number])
    );
  }, [bundledOptions]);

  return (
    <div
      className={cn(
        'group rounded-xl border-2 transition-all duration-200',
        isSelected
          ? 'border-primary-500 bg-primary-50/50 shadow-sm'
          : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/30'
      )}
    >
      {/* Parent toggle — matches OptionCard style */}
      <button
        type="button"
        onClick={onToggleParent}
        className="w-full p-4 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-colors',
              isSelected ? 'bg-primary-100' : 'bg-neutral-100 group-hover:bg-primary-100/60'
            )}
          >
            <ShieldCheck
              className={cn(
                'h-5 w-5 transition-colors',
                isSelected ? 'text-primary-600' : 'text-neutral-500 group-hover:text-primary-600'
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            {/* Strip the "(adaugă în aceeași comandă)" disclaimer from the
                option name — marketing copy on the DB row that makes the
                title noisy. Full title on its own line (no truncation), then
                the badge BELOW it so the name is always fully readable on
                mobile. */}
            <p className="text-sm font-semibold text-secondary-900 leading-tight">
              {option.name.replace(/\s*\(adaugă în aceeași comandă\)\s*$/i, '').trim()}
            </p>
            <Badge className="mt-1 bg-primary-500 text-white hover:bg-primary-500">
              Serviciu secundar
            </Badge>
            <p className="text-xs text-neutral-500 mt-1 leading-snug">
              {option.description || 'Serviciu suplimentar bundluit în aceeași comandă'}
            </p>
          </div>
          <PriceChip price={option.price} selected={isSelected} />
        </div>

        {/* Expand/collapse toggle on its OWN line below, separated — so on
            mobile it reads clearly as the "see options" control, not crammed
            next to the badge + price. */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-center gap-1 text-xs font-medium text-primary-600">
          {isSelected ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Ascunde opțiuni
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Vezi opțiuni pachet
            </>
          )}
        </div>
      </button>

      {isSelected && (
        <div className="border-t border-primary-200 bg-neutral-50/70 rounded-b-xl">
          <div className="p-4 space-y-3">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Opțiuni suplimentare pentru {option.name.replace(/\s*\(.*$/, '')}
            </p>

            {isLoadingBundled && (
              <p className="text-sm text-neutral-500">Se încarcă opțiunile...</p>
            )}

            {bundledError && <p className="text-sm text-red-600">{bundledError}</p>}

            {!isLoadingBundled && !bundledError && sortedBundled.length === 0 && (
              <p className="text-sm text-neutral-500">
                Nu sunt opțiuni suplimentare disponibile pentru acest pachet.
              </p>
            )}

            <div className="space-y-2">
              {sortedBundled.map((bundled) => {
                const BIcon = CODE_ICONS[bundled.code] ?? Package;
                const selected = isBundledSelected(bundled.id);
                // Block dependents until their prerequisite is selected —
                // exactly like the primary "Opțiuni suplimentare" section.
                const depBlocked =
                  !selected && isOptionDepBlocked(bundled.code, selectedBundledCodes);
                const depHint = !depBlocked
                  ? bundled.description
                  : bundled.code === 'apostila_notari'
                  ? 'Necesită Legalizare'
                  : 'Necesită Traducere Autorizată';
                const syntheticId = `bundled:${option.id}:${bundled.id}`;
                const bundledMeta =
                  selectedOptions.find((o) => o.optionId === syntheticId)?.metadata ?? {};
                return (
                  <div key={bundled.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleBundled(bundled)}
                    disabled={depBlocked}
                    aria-pressed={selected}
                    className={cn(
                      'group/inner flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-all duration-200',
                      depBlocked
                        ? 'opacity-50 cursor-not-allowed border-neutral-200 bg-neutral-50/40'
                        : selected
                        // Same visual contract as the top-level OptionCard:
                        // 2px primary border + full primary-50 fill +
                        // shadow lift. Anything lighter (1px border, /30
                        // tint, no shadow) reads identically to the hover
                        // state and users can't tell selection persisted.
                        ? 'cursor-pointer border-primary-500 bg-primary-50 shadow-sm'
                        : 'cursor-pointer border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/30'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors',
                        depBlocked
                          ? 'bg-neutral-100'
                          : selected
                          ? 'bg-primary-100'
                          : 'bg-neutral-100 group-hover/inner:bg-primary-100/60'
                      )}
                    >
                      <BIcon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          depBlocked
                            ? 'text-neutral-400'
                            : selected
                            ? 'text-primary-600'
                            : 'text-neutral-500 group-hover/inner:text-primary-600'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 leading-tight">
                        {bundled.name}
                      </p>
                      {depHint && (
                        <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
                          {depHint}
                        </p>
                      )}
                    </div>
                    <PriceChip
                      price={bundled.price}
                      selected={selected}
                      disabled={depBlocked}
                      size="sm"
                    />
                    {/* No separate checkbox/radio indicator on the right —
                        the row itself becomes yellow (border + bg) when
                        selected, matching the top-level OptionCard style.
                        A standalone empty circle on the right misled users
                        into thinking the option wasn't selected even when
                        the row was clearly highlighted. */}
                  </button>

                  {/* When a bundled apostila/traducere is selected, ask for the
                      destination country / translation language right here — so
                      a customer who wants these ONLY on the secondary service
                      (not on the main one) can still specify them. */}
                  {selected && bundled.code === 'apostila_haga' && (
                    <CountryDropdown
                      id={`bundled-country-${bundled.id}`}
                      label="Țara pentru care se solicită Apostila"
                      value={(bundledMeta.country as string) ?? ''}
                      onChange={(country) => patchBundledMetadata(syntheticId, { country })}
                    />
                  )}
                  {selected && bundled.code === 'traducere' && (
                    <LanguageDropdown
                      id={`bundled-language-${bundled.id}`}
                      value={(bundledMeta.language as string) ?? ''}
                      onChange={(language) => patchBundledMetadata(syntheticId, { language })}
                    />
                  )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
