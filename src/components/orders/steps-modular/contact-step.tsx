'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Phone,
  CheckCircle,
  Pencil,
  User,
  Building2,
  Globe,
  Check,
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { PhoneInput } from '@/components/shared/PhoneInput';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import { cn } from '@/lib/utils';
import type { ClientType } from '@/types/verification-modules';
import { getCountriesForForeignType } from '@/config/countries';
import {
  MOTIV_CAZIER_OPTIONS,
  MOTIV_CAZIER_FISCAL_OPTIONS,
  MOTIV_CAZIER_AUTO_OPTIONS,
  MOTIV_INTEGRITATE_OPTIONS,
} from '@/config/motiv-options';

/** Map service slug → which "Motiv" list to surface (if any). */
function getPurposeOptionsForService(slug: string | null): readonly string[] | null {
  if (!slug) return null;
  if (slug.includes('cazier-judiciar')) return MOTIV_CAZIER_OPTIONS;
  if (slug.includes('cazier-fiscal')) return MOTIV_CAZIER_FISCAL_OPTIONS;
  if (slug.includes('cazier-auto')) return MOTIV_CAZIER_AUTO_OPTIONS;
  if (slug.includes('integritate')) return MOTIV_INTEGRITATE_OPTIONS;
  return null;
}

// Phone validation: per-country length + pattern via libphonenumber-js.
// react-international-phone gives E.164 (`+40712345678`); isValidPhoneNumber
// respinge un număr cu o cifră în plus/minus pentru țara aleasă (RO sau alta).
const contactSchema = z.object({
  email: z.string().email('Introdu o adresă de email validă'),
  phone: z
    .string()
    .min(1, 'Introdu numărul de telefon')
    .refine((v) => isValidPhoneNumber(v.replace(/\s+/g, '')), {
      message: 'Număr de telefon invalid (verifică numărul de cifre pentru țara aleasă)',
    }),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactStepProps {
  onValidChange: (valid: boolean) => void;
}

export function ContactStepModular({ onValidChange }: ContactStepProps) {
  const {
    state,
    updateContact,
    updatePersonalKyc,
    setClientType,
    isPrefilled,
    priceBreakdown,
  } = useModularWizard();
  const [showEditMode, setShowEditMode] = useState(false);

  // Whether the service requires a client type (PF/PJ) selection.
  const requiresClientType =
    !!state.verificationConfig?.clientTypeSelection?.enabled;

  // Whether to show citizenship toggle. Only relevant for PF (companies are
  // by definition Romanian legal entities here). Also gated per-service:
  // civil-status documents (naștere/căsătorie/celibat) set
  // personalKyc.allowForeignCitizen = false, since they are issued only for
  // persons registered in the Romanian civil registry (no foreign path).
  const allowForeignCitizen =
    state.verificationConfig?.personalKyc?.allowForeignCitizen !== false;
  const showsCitizenship = state.clientType === 'PF' && allowForeignCitizen;
  const citizenship = state.contact.citizenship ?? 'romanian';
  const isForeign = citizenship === 'foreign';

  // Service-specific purpose / motivul solicitării. Drop-down only.
  const purposeOptions = getPurposeOptionsForService(state.serviceSlug);
  const showsPurpose =
    !!purposeOptions && state.clientType === 'PF';
  const purpose = state.contact.purpose ?? '';

  const clientTypeOptions =
    state.verificationConfig?.clientTypeSelection?.options ?? [
      { value: 'PF' as const, label: 'Persoană Fizică', description: 'Pentru persoane fizice' },
      { value: 'PJ' as const, label: 'Persoană Juridică', description: 'Pentru companii și firme' },
    ];

  const hasValidPrefilledData =
    isPrefilled &&
    state.contact.email &&
    state.contact.email.includes('@') &&
    typeof state.contact.phone === 'string' &&
    state.contact.phone.replace(/\s+/g, '').length >= 8;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: state.contact.email || '',
      phone: state.contact.phone || '+40',
    },
    mode: 'onChange',
  });

  const { isValid: formIsValid } = form.formState;

  // Draft resume: react-hook-form only applies defaultValues at mount, so when
  // a saved draft is restored asynchronously AFTER this form mounted (server
  // resume or localStorage), the restored email/phone wouldn't show. Sync them
  // into the form ONCE when they first appear.
  const contactSyncedRef = useRef(false);
  useEffect(() => {
    if (contactSyncedRef.current) return;
    const email = state.contact.email;
    const phone = state.contact.phone;
    if (email || (phone && phone !== '+40')) {
      contactSyncedRef.current = true;
      form.reset({ email: email || '', phone: phone || '+40' });
    }
  }, [state.contact.email, state.contact.phone, form]);

  // Step validity:
  //   contact valid + (if required) client type + (if shown) purpose chosen
  //   + foreign birth fields when foreign citizenship picked.
  const purposeOk = !showsPurpose || !!purpose;
  const foreignBirthOk =
    !isForeign ||
    (!!state.personalKyc?.foreignData?.birthCity?.trim() &&
      !!state.personalKyc?.foreignData?.birthCountry);
  const isStepValid =
    formIsValid &&
    (!requiresClientType || !!state.clientType) &&
    purposeOk &&
    foreignBirthOk;

  useEffect(() => {
    if (hasValidPrefilledData && !showEditMode) {
      onValidChange(
        (!requiresClientType || !!state.clientType) &&
          purposeOk &&
          foreignBirthOk
      );
    } else {
      onValidChange(isStepValid);
    }
  }, [
    isStepValid,
    onValidChange,
    hasValidPrefilledData,
    showEditMode,
    requiresClientType,
    state.clientType,
    purposeOk,
    foreignBirthOk,
  ]);

  // Sync form changes back to wizard state.
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateContact({
        email: value.email,
        phone: value.phone,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, updateContact]);

  const handleClientTypeSelect = (type: ClientType) => {
    setClientType(type);
  };

  const getClientTypeIcon = (type: ClientType) =>
    type === 'PF' ? User : Building2;

  // ── Compact prefilled view ───────────────────────────────────────────
  if (hasValidPrefilledData && !showEditMode) {
    return (
      <div className="space-y-6">
        {/* Prefilled banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-emerald-800">
                Date preluate din contul tău
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                Te vom contacta pe datele de mai jos. Poți continua sau modifica dacă e nevoie.
              </p>
            </div>
          </div>
        </div>

        {/* Contact summary */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Date de Contact
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEditMode(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Modifică
            </Button>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Mail className="w-5 h-5 text-primary-500" />
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Email</p>
                <p className="font-medium text-secondary-900 truncate">
                  {state.contact.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Phone className="w-5 h-5 text-primary-500" />
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Telefon</p>
                <p className="font-medium text-secondary-900 truncate">
                  {state.contact.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Type still required even when contact is prefilled */}
        {requiresClientType && (
          <ClientTypeSelector
            options={clientTypeOptions}
            selectedType={state.clientType}
            onSelect={handleClientTypeSelect}
            getIcon={getClientTypeIcon}
            basePrice={priceBreakdown.basePrice}
          />
        )}

        {/* Citizenship + Purpose also required when contact is prefilled */}
        {showsCitizenship && (
          <>
            <ForeignCitizenCheckbox
              isForeign={isForeign}
              extraDays={Math.max(
                Number(state.verificationConfig?.personalKyc?.citizenshipFlows?.foreign?.extraDays) || 0,
                Number(state.verificationConfig?.personalKyc?.citizenshipFlows?.european?.extraDays) || 0
              )}
              onChange={(foreign) =>
                updateContact({
                  citizenship: foreign ? 'foreign' : 'romanian',
                  foreignType: undefined,
                })
              }
            />
            {isForeign && (
              <ForeignBirthFields
                birthCity={state.personalKyc?.foreignData?.birthCity ?? ''}
                birthCountry={state.personalKyc?.foreignData?.birthCountry ?? ''}
                onChange={(birthCity, birthCountry) => {
                  updatePersonalKyc({
                    foreignData: {
                      birthCity,
                      birthCountry,
                      hasRomanianAddress:
                        state.personalKyc?.foreignData?.hasRomanianAddress ?? true,
                      foreignAddress:
                        state.personalKyc?.foreignData?.foreignAddress,
                    },
                  });
                }}
              />
            )}
          </>
        )}
        {showsPurpose && purposeOptions && (
          <PurposeSelect
            options={purposeOptions}
            value={purpose}
            onChange={(v) => updateContact({ purpose: v })}
          />
        )}
      </div>
    );
  }

  // ── Editable form ────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-secondary-900 font-medium">
                Adresă Email <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="email@exemplu.ro"
                    className="pl-10 h-11"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Vei primi confirmarea comenzii și documentele pe acest email
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone with country code dropdown */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-secondary-900 font-medium">
                Număr de Telefon <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.phone?.message}
                />
              </FormControl>
              <FormDescription>
                Te vom contacta în caz de nelămuriri
              </FormDescription>
              {!form.formState.errors.phone && <FormMessage />}
            </FormItem>
          )}
        />

        {/* Tip Client (PF/PJ) — only when service requires it */}
        {requiresClientType && (
          <ClientTypeSelector
            options={clientTypeOptions}
            selectedType={state.clientType}
            onSelect={handleClientTypeSelect}
            getIcon={getClientTypeIcon}
            basePrice={priceBreakdown.basePrice}
          />
        )}

        {/* Citizenship — only for PF clients */}
        {showsCitizenship && (
          <>
            <ForeignCitizenCheckbox
              isForeign={isForeign}
              extraDays={Math.max(
                Number(state.verificationConfig?.personalKyc?.citizenshipFlows?.foreign?.extraDays) || 0,
                Number(state.verificationConfig?.personalKyc?.citizenshipFlows?.european?.extraDays) || 0
              )}
              onChange={(foreign) =>
                updateContact({
                  citizenship: foreign ? 'foreign' : 'romanian',
                  foreignType: undefined,
                })
              }
            />
            {isForeign && (
              <ForeignBirthFields
                birthCity={state.personalKyc?.foreignData?.birthCity ?? ''}
                birthCountry={state.personalKyc?.foreignData?.birthCountry ?? ''}
                onChange={(birthCity, birthCountry) => {
                  updatePersonalKyc({
                    foreignData: {
                      birthCity,
                      birthCountry,
                      hasRomanianAddress:
                        state.personalKyc?.foreignData?.hasRomanianAddress ?? true,
                      foreignAddress:
                        state.personalKyc?.foreignData?.foreignAddress,
                    },
                  });
                }}
              />
            )}
          </>
        )}

        {/* Purpose / Motivul solicitării — only for cazier-type services + PF */}
        {showsPurpose && purposeOptions && (
          <PurposeSelect
            options={purposeOptions}
            value={purpose}
            onChange={(v) => updateContact({ purpose: v })}
          />
        )}
      </form>
    </Form>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Foreign-citizen checkbox. Single opt-in: unchecked = Romanian (default),
// checked = foreign. No EU/non-EU sub-pick — the form is intentionally simple.
// ──────────────────────────────────────────────────────────────────────────

interface ForeignCitizenCheckboxProps {
  isForeign: boolean;
  onChange: (isForeign: boolean) => void;
  /** Max extra processing days for foreign citizens, from the service's
   *  personalKyc.citizenshipFlows config. 0 = no extra time (e.g. cazier
   *  fiscal) → the description must NOT claim longer processing. */
  extraDays?: number;
}

function ForeignCitizenCheckbox({ isForeign, onChange, extraDays = 0 }: ForeignCitizenCheckboxProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={isForeign}
        onClick={() => onChange(!isForeign)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border-2 p-3 sm:p-4 text-left transition-all duration-200',
          isForeign
            ? 'border-primary-500 bg-primary-50 shadow-sm'
            : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/30'
        )}
      >
        {/* Checkbox box */}
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md border-2 shrink-0 transition-colors',
            isForeign
              ? 'border-primary-500 bg-primary-500 text-white'
              : 'border-neutral-300 bg-white'
          )}
        >
          {isForeign && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        {/* Globe icon */}
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl shrink-0 transition-colors',
            isForeign ? 'bg-primary-100' : 'bg-neutral-100'
          )}
        >
          <Globe
            className={cn('h-4 w-4', isForeign ? 'text-primary-600' : 'text-neutral-500')}
          />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-secondary-900 leading-tight">
            Sunt cetățean străin
          </span>
          <span className="block text-xs text-neutral-500 mt-0.5 leading-snug">
            Bifează doar dacă nu ești cetățean român.
            {extraDays > 0 &&
              ` Cetățenii străini necesită verificări suplimentare (procesare cu până la ${extraDays} zile lucrătoare în plus).`}
          </span>
        </span>
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Foreign birth fields (Localitatea + Țara Nașterii) — step 1 inline block.
// Renders inside the citizenship section when "Sunt cetățean străin" is checked.
// Country dropdown shows the full world list (no EU/non-EU split).
// ──────────────────────────────────────────────────────────────────────────

interface ForeignBirthFieldsProps {
  birthCity: string;
  birthCountry: string;
  onChange: (birthCity: string, birthCountry: string) => void;
}

function ForeignBirthFields({
  birthCity,
  birthCountry,
  onChange,
}: ForeignBirthFieldsProps) {
  const countries = getCountriesForForeignType(undefined);
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3 sm:p-4 space-y-3">
      <p className="text-sm font-medium text-amber-900">
        Date despre naștere
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="contact-birth-city"
            className="block text-sm font-medium text-secondary-900"
          >
            Localitatea Nașterii <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-birth-city"
            type="text"
            value={birthCity}
            onChange={(e) => onChange(e.target.value, birthCountry)}
            placeholder="Orașul sau comuna de naștere"
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base sm:text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="contact-birth-country"
            className="block text-sm font-medium text-secondary-900"
          >
            Țara Nașterii <span className="text-red-500">*</span>
          </label>
          <select
            id="contact-birth-country"
            value={birthCountry}
            onChange={(e) => onChange(birthCity, e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base sm:text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Selectați țara</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Purpose / Motivul solicitării (searchable dropdown)
// ──────────────────────────────────────────────────────────────────────────

interface PurposeSelectProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

function PurposeSelect({
  options,
  value,
  onChange,
}: PurposeSelectProps) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-secondary-900 font-medium text-sm">
          Motivul solicitării <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
          Acest motiv apare scris pe documentul eliberat. Caută sau alege din listă.
        </p>
      </div>
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Selectează motivul (ex: Angajare, Adopție, Vize)"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Client Type sub-component
// ──────────────────────────────────────────────────────────────────────────

interface ClientTypeOption {
  value: ClientType;
  label: string;
  description?: string;
}

interface ClientTypeSelectorProps {
  options: ClientTypeOption[];
  selectedType: ClientType | undefined;
  onSelect: (type: ClientType) => void;
  getIcon: (type: ClientType) => React.ComponentType<{ className?: string }>;
  basePrice?: number;
}

function ClientTypeSelector({
  options,
  selectedType,
  onSelect,
  getIcon,
  basePrice,
}: ClientTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-secondary-900 font-medium text-sm">
          Pentru cine soliciți acest serviciu? <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
          Alege <span className="font-medium text-secondary-700">Persoană Fizică</span> dacă ai nevoie de document pentru tine personal, sau <span className="font-medium text-secondary-700">Persoană Juridică</span> dacă îl soliciți pentru firma ta.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {options.map((option) => {
          const Icon = getIcon(option.value);
          const isSelected = selectedType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              aria-pressed={isSelected}
              className={cn(
                'group relative flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl border-2 p-3 sm:p-4 text-center transition-all duration-200',
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/30'
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-colors',
                  isSelected
                    ? 'bg-primary-100'
                    : 'bg-neutral-100 group-hover:bg-primary-100/60'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 sm:h-5 sm:w-5 transition-colors',
                    isSelected
                      ? 'text-primary-600'
                      : 'text-neutral-500 group-hover:text-primary-600'
                  )}
                />
              </span>
              <div className="min-w-0 w-full">
                <p className="text-sm font-semibold text-secondary-900 leading-tight">
                  {option.label}
                </p>
                {option.description && (
                  <p className="hidden sm:block text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    {option.description}
                  </p>
                )}
                {typeof basePrice === 'number' && basePrice > 0 && (
                  <p
                    className={cn(
                      'mt-1 sm:mt-1.5 text-sm font-bold tabular-nums',
                      isSelected ? 'text-primary-600' : 'text-secondary-900'
                    )}
                  >
                    {basePrice.toFixed(0)} RON
                  </p>
                )}
              </div>
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                  <CheckCircle className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
