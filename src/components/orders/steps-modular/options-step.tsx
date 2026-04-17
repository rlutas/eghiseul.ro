'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Stamp,
  Languages,
  Scale,
  BookOpen,
  Clock,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Info,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  Package,
  Lock,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { ServiceOption } from '@/types/services';
import type { SelectedOptionState } from '@/types/verification-modules';
import { cn } from '@/lib/utils';
import {
  fetchBundledOptions,
  BUNDLED_OPTION_CODES,
} from '@/lib/services/bundled-options';
import { APOSTILA_COUNTRIES } from '@/config/apostila-countries';
import { TRANSLATION_LANGUAGES } from '@/config/translation-languages';

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
  copii_suplimentare: Copy,
  verificare_expert: CheckCircle2,
};

// Hint text displayed under the option name (kept short — ~1 line).
const CODE_HINTS: Record<string, string> = {
  apostila_haga: 'Convenția de la Haga (+1 zi)',
  traducere: 'Traducere legalizată (+1-2 zile)',
  legalizare: 'Legalizare document tradus',
  apostila_notari: 'Apostilă pe documentul legalizat',
  urgenta: 'Eliberare prioritară',
  copii_suplimentare: 'Exemplare suplimentare',
  verificare_expert: 'Revizuire dosar de un expert',
};

// Codes that belong to the "extras internaționale" dependency chain.
const EXTRAS_CODES = ['apostila_haga', 'traducere', 'legalizare', 'apostila_notari'] as const;

// Auto-applied system flags — rendered as read-only info cards, not toggles.
const AUTO_APPLIED_CODES = new Set(['cetatean_strain']);

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

  // "Other" options — not part of extras, not auto-applied, not cross-service.
  // Currently: verificare_expert, copii_suplimentare (rendered in the bottom group).
  const otherCodes = ['verificare_expert', 'copii_suplimentare'];

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

  // Quantity helper (copii_suplimentare).
  const updateQuantity = useCallback(
    (optionId: string, delta: number) => {
      commit(
        selectedOptions.map((opt) =>
          opt.optionId === optionId
            ? { ...opt, quantity: Math.max(1, opt.quantity + delta) }
            : opt
        )
      );
    },
    [selectedOptions, commit]
  );

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
  const otherOptions = otherCodes
    .map((c) => optionsByCode.get(c))
    .filter((o): o is ServiceOption => !!o);

  return (
    <div className="space-y-8">
      {/* ────────────────────────────────────────────────────────────── */}
      {/* Procesare Rapidă — urgența (hidden when cetatean_strain)       */}
      {/* ────────────────────────────────────────────────────────────── */}
      {urgenta && !hasCetateanStrain && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold text-secondary-900">Procesare Rapidă</h3>
          </div>
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
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-secondary-900">Cetățean Străin — Procesare 7-15 zile lucrătoare</h3>
          </div>
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <Globe className="h-5 w-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-800">
                  Comanda dumneavoastră necesită verificări suplimentare la I.G.I.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Procesarea urgentă nu este disponibilă pentru cetățeni străini.
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
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-secondary-900">Cetățean Străin</h3>
          </div>
          <div className="space-y-3">
            {autoAppliedSelections.map((opt) => (
              <div
                key={opt.optionId}
                className="relative rounded-xl border-2 border-amber-300 bg-amber-50 p-4"
              >
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
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
                      <span className="rounded bg-amber-200 px-2 py-0.5 text-sm font-bold text-amber-900">
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
          <div className="flex items-center gap-2">
            <Stamp className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold text-secondary-900">
              Opțiuni suplimentare{serviceDisplayName ? ` ${serviceDisplayName}` : ''}
            </h3>
          </div>
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
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold text-secondary-900">
              Adaugă Serviciu Suplimentar
            </h3>
          </div>
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
      {/* Alte Opțiuni — verificare_expert + copii_suplimentare           */}
      {/* ────────────────────────────────────────────────────────────── */}
      {otherOptions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold text-secondary-900">Alte Opțiuni</h3>
          </div>
          <div className="space-y-3">
            {otherOptions.map((opt) => {
              const Icon = CODE_ICONS[opt.code] ?? ShieldCheck;
              const selected = isCodeSelected(opt.code);
              const data = findByCode(opt.code);
              const showQuantity = opt.code === 'copii_suplimentare' && selected;

              return (
                <div key={opt.id} className="space-y-2">
                  <OptionCard
                    icon={Icon}
                    name={opt.name}
                    hint={opt.description || CODE_HINTS[opt.code] || ''}
                    price={opt.price}
                    selected={selected}
                    onClick={() => toggleByCode(opt)}
                  />
                  {showQuantity && data && (
                    <div className="rounded-lg border border-primary-200 bg-primary-50/60 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary-900">
                          Cantitate:
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(data.optionId, -1)}
                            disabled={data.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {data.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(data.optionId, 1)}
                            disabled={
                              typeof opt.max_quantity === 'number' &&
                              data.quantity >= opt.max_quantity
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* Summary                                                         */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-neutral-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-secondary-900 mb-1">Rezumat Selecții</h4>
            {selectedOptions.length === 0 ? (
              <p className="text-sm text-neutral-600">
                Nu ai selectat nicio opțiune suplimentară. Poți continua cu prețul de
                bază de {priceBreakdown.basePrice} RON.
              </p>
            ) : (
              <div className="space-y-1">
                {selectedOptions.map((opt) => (
                  <div
                    key={opt.optionId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span
                      className={cn(
                        'text-neutral-700',
                        opt.bundledFor && 'pl-3 text-neutral-500 text-xs'
                      )}
                    >
                      {opt.bundledFor ? '↳ ' : ''}
                      {opt.optionName}
                      {opt.quantity > 1 && ` x${opt.quantity}`}
                      {opt.metadata?.language ? ` — ${opt.metadata.language}` : ''}
                      {opt.metadata?.country ? ` — ${opt.metadata.country}` : ''}
                    </span>
                    <span className="font-medium text-secondary-900">
                      +{formatPrice(opt.priceModifier * opt.quantity)} RON
                    </span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-neutral-200 flex items-center justify-between text-sm font-semibold">
                  <span className="text-neutral-700">Total opțiuni:</span>
                  <span className="text-primary-600">
                    +{formatPrice(priceBreakdown.optionsPrice)} RON
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-center text-neutral-500">
        Opțiunile sunt opționale. Poți continua fără a selecta nimic.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PRESENTATIONAL SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

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
        'flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200',
        disabled
          ? 'opacity-40 cursor-not-allowed border-neutral-200 bg-white'
          : selected
          ? 'border-primary-500 bg-primary-50 shadow-sm'
          : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
          selected && !disabled ? 'bg-primary-100' : 'bg-neutral-100'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5',
            selected && !disabled ? 'text-primary-600' : 'text-neutral-400'
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-secondary-900">{name}</span>
          <span
            className={cn(
              'text-sm font-bold shrink-0',
              selected && !disabled ? 'text-primary-600' : 'text-neutral-400'
            )}
          >
            +{formatPrice(price)}
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 mt-0.5">{hint}</p>
      </div>
    </button>
  );
}

interface LanguageDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function LanguageDropdown({ value, onChange, error }: LanguageDropdownProps) {
  return (
    <div className="border-l-2 border-primary-200 pl-4">
      <label htmlFor="opt-language" className="text-sm font-medium text-secondary-900">
        Limba Traducere <span className="text-red-500">*</span>
      </label>
      <select
        id="opt-language"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'mt-1.5 h-11 w-full rounded-lg border bg-white px-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
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
          'mt-1.5 h-11 w-full rounded-lg border bg-white px-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
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

  const isBundledSelected = useCallback(
    (bundledOptionId: string) =>
      selectedOptions.some(
        (o) =>
          o.bundledFor?.parentOptionId === option.id && o.optionId === bundledOptionId
      ),
    [selectedOptions, option.id]
  );

  const toggleBundled = (bundled: ServiceOption) => {
    const syntheticId = `bundled:${option.id}:${bundled.id}`;
    const already = selectedOptions.find((o) => o.optionId === syntheticId);

    if (already) {
      onUpdateOptions(selectedOptions.filter((o) => o.optionId !== syntheticId));
    } else {
      if (!bundledSlug) return;
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
      };
      onUpdateOptions([...selectedOptions, newOption]);
    }
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
        'rounded-xl border-2 transition-all duration-200',
        isSelected
          ? 'border-primary-500 bg-primary-50/50 shadow-sm'
          : 'border-neutral-200 hover:border-primary-300'
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
              'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
              isSelected ? 'bg-primary-100' : 'bg-neutral-100'
            )}
          >
            <ShieldCheck
              className={cn(
                'h-5 w-5',
                isSelected ? 'text-primary-600' : 'text-neutral-400'
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-secondary-900">
                {option.name}
              </span>
              <span
                className={cn(
                  'text-sm font-bold shrink-0',
                  isSelected ? 'text-primary-600' : 'text-neutral-400'
                )}
              >
                +{formatPrice(option.price)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {option.description || 'Serviciu suplimentar bundluit în aceeași comandă'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-primary-500 text-white hover:bg-primary-500">
                Pachet
              </Badge>
              <span className="text-xs text-neutral-500">
                {isSelected ? (
                  <span className="inline-flex items-center gap-1">
                    <ChevronUp className="w-3 h-3" /> Ascunde opțiuni
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <ChevronDown className="w-3 h-3" /> Vezi opțiuni pachet
                  </span>
                )}
              </span>
            </div>
          </div>
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
                return (
                  <button
                    key={bundled.id}
                    type="button"
                    onClick={() => toggleBundled(bundled)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200',
                      selected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 bg-white hover:border-primary-300'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                        selected ? 'bg-primary-100' : 'bg-neutral-100'
                      )}
                    >
                      <BIcon
                        className={cn(
                          'h-4 w-4',
                          selected ? 'text-primary-600' : 'text-neutral-400'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-secondary-900">
                          {bundled.name}
                        </span>
                        <span
                          className={cn(
                            'text-sm font-bold shrink-0',
                            selected ? 'text-primary-600' : 'text-neutral-400'
                          )}
                        >
                          +{formatPrice(bundled.price)}
                        </span>
                      </div>
                      {bundled.description && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {bundled.description}
                        </p>
                      )}
                    </div>
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                        selected
                          ? 'bg-primary-500 border-primary-500'
                          : 'border-neutral-300 bg-white'
                      )}
                    >
                      {selected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
