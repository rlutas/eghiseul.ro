'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import type { ConstatatorConfig, ConstatatorState } from '@/types/verification-modules';
import { cn } from '@/lib/utils';

interface ConstatatorStepProps {
  config: ConstatatorConfig | null | undefined;
  onValidChange: (valid: boolean) => void;
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

export default function ConstatatorStep({ config, onValidChange }: ConstatatorStepProps) {
  const { state, updateConstatator, validationAttempt } = useModularWizard();
  const cs: ConstatatorState = useMemo(() => state.constatator ?? {}, [state.constatator]);
  const docTypes = useMemo(() => config?.documentTypes ?? [], [config]);
  const purposes = useMemo(() => config?.purposes ?? [], [config]);

  const selectedType = docTypes.find((t) => t.value === cs.documentType);
  // Report types may be plain strings (legacy) or { name, purposes } objects.
  const reportTypeOpts = useMemo(
    () =>
      (selectedType?.reportTypes ?? []).map((r) =>
        typeof r === 'string' ? { name: r, purposes: undefined as string[] | undefined } : r
      ),
    [selectedType]
  );
  const reportTypes = reportTypeOpts.map((r) => r.name);
  // Purposes shown are SPECIFIC to the selected report type (ONRC step 4); fall
  // back to the global list when a report type has none / none is chosen.
  const activePurposes = useMemo(() => {
    const rt = reportTypeOpts.find((r) => r.name === cs.reportType);
    if (rt?.purposes && rt.purposes.length > 0) return rt.purposes;
    // Type-level purposes (e.g. 'pf' → the 10 ONRC reasons for subtype 160).
    if (selectedType?.purposes && selectedType.purposes.length > 0) return selectedType.purposes;
    return purposes;
  }, [reportTypeOpts, cs.reportType, purposes, selectedType]);
  const isOtherPurpose = (cs.purpose ?? '').toLowerCase() === 'altele';
  // 'istoric' → needs the certificate period; 'pf' → needs the person (CNP).
  // 'firma'/'istoric' (CUI types) capture the CUI in the next step (company-data).
  const isIstoric = cs.documentType === 'istoric';
  const isPf = cs.documentType === 'pf';

  // Each check carries a label so a failed «Continuă» lists what's missing.
  const missingItems = useMemo(() => {
    const missing: string[] = [];
    const req = (ok: boolean, label: string) => {
      if (!ok) missing.push(label);
    };
    req(!!cs.documentType, 'Tipul documentului');
    if (reportTypes.length > 0) req(!!cs.reportType, 'Tipul raportului');
    // "cu istoric" has NO purpose at ONRC (no Tip Document step) — don't require it.
    if (!isIstoric) req(!!cs.purpose, 'Scopul solicitării');
    if (!isIstoric && isOtherPurpose) req(!!cs.otherPurpose?.trim(), 'Detaliază scopul (ai ales „Altele")');
    if (isIstoric) {
      req(!!cs.period, 'Perioada certificatului istoric');
      if (cs.period === 'custom') {
        req(!!cs.periodFrom, 'Data de început a perioadei');
        req(!!cs.periodTo, 'Data de sfârșit a perioadei');
      }
    }
    if (isPf) {
      req(!!cs.requesterName?.trim(), 'Numele persoanei');
      req(!!cs.requesterCnp?.trim() && cs.requesterCnp!.trim().length === 13, 'CNP-ul persoanei (13 cifre)');
    }
    return missing;
  }, [cs, reportTypes.length, isOtherPurpose, isIstoric, isPf]);

  useEffect(() => {
    onValidChange(missingItems.length === 0);
  }, [missingItems, onValidChange]);

  // «Continuă» tapped while incomplete → show the missing list below.
  // Baseline captured at mount: counter is global, ignore attempts from
  // previous steps.
  const [validationBaseline] = useState(validationAttempt);
  const showErrors = validationAttempt !== validationBaseline;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-secondary-900 mb-1">Detalii certificat constatator</h2>
        <p className="text-sm text-neutral-600">
          Alege tipul de document și scopul. Prețul se actualizează în funcție de tipul ales.
        </p>
      </div>

      {/* Document type — price-bearing */}
      <Field label="Tipul documentului" required>
        <div className="grid gap-3">
          {docTypes.map((t) => {
            const active = cs.documentType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() =>
                  updateConstatator({
                    documentType: t.value,
                    reportType: undefined,
                    // Clear fields that don't apply to the newly chosen type.
                    ...(t.value !== 'istoric' ? { period: undefined, periodFrom: undefined, periodTo: undefined } : {}),
                    ...(t.value !== 'pf' ? { requesterName: undefined, requesterCnp: undefined } : {}),
                  })
                }
                aria-pressed={active}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  active ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white hover:border-primary-300'
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
                      active ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300'
                    )}
                  >
                    {active && <Check className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-secondary-900">{t.label}</span>
                    <span className="text-xs text-neutral-500">
                      {t.value === 'pf' ? 'Pe baza CNP (persoană fizică)' : 'Pe baza CUI (firmă)'}
                      {t.value === 'istoric' ? ' · include perioada' : ''}
                    </span>
                  </span>
                </span>
                <span className="font-bold text-primary-700 whitespace-nowrap">{t.price} RON</span>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Report type (conditional) */}
      {reportTypes.length > 0 && (
        <Field label="Specificați tipul de raport" required>
          <Select
            value={cs.reportType ?? ''}
            onValueChange={(v) => updateConstatator({ reportType: v, purpose: undefined, otherPurpose: undefined })}
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue placeholder="Alege tipul de raport" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      {/* Purpose / destination — not for "cu istoric" (ONRC has no motiv there) */}
      {!isIstoric && (
      <Field label="Document solicitat spre a servi la" required>
        <Select value={cs.purpose ?? ''} onValueChange={(v) => updateConstatator({ purpose: v })}>
          <SelectTrigger className="w-full min-w-0">
            <SelectValue placeholder="Alege destinația" />
          </SelectTrigger>
          <SelectContent>
            {activePurposes.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isOtherPurpose && (
          <Input
            className="mt-2"
            value={cs.otherPurpose ?? ''}
            onChange={(e) => updateConstatator({ otherPurpose: e.target.value })}
            placeholder="Precizați alt scop"
          />
        )}
      </Field>
      )}

      {/* Period — only for "cu istoric" */}
      {isIstoric && (
      <Field label="Perioada certificatului" required>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'founding', label: 'De la înființare până în prezent' },
            { value: 'custom', label: 'Selectare perioadă' },
          ].map((opt) => {
            const active = cs.period === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => updateConstatator({ period: opt.value as ConstatatorState['period'] })}
                className={cn(
                  'px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  active ? 'border-primary-500 bg-primary-50 text-secondary-900' : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary-300'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {cs.period === 'custom' && (
          <div className="mt-3 grid sm:grid-cols-2 gap-4">
            <Field label="De la" required>
              <Input type="date" value={cs.periodFrom ?? ''} onChange={(e) => updateConstatator({ periodFrom: e.target.value })} />
            </Field>
            <Field label="Până la" required>
              <Input type="date" value={cs.periodTo ?? ''} onChange={(e) => updateConstatator({ periodTo: e.target.value })} />
            </Field>
          </div>
        )}
      </Field>
      )}

      {/* Requester person — only for "persoană fizică" (CNP) */}
      {isPf && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nume complet (persoana solicitantă)" required>
            <Input
              value={cs.requesterName ?? ''}
              onChange={(e) => updateConstatator({ requesterName: e.target.value })}
              placeholder="Nume și prenume"
            />
          </Field>
          <Field label="CNP persoană solicitantă" required>
            <Input
              inputMode="numeric"
              maxLength={13}
              value={cs.requesterCnp ?? ''}
              onChange={(e) => updateConstatator({ requesterCnp: e.target.value.replace(/\D/g, '').slice(0, 13) })}
              placeholder="13 cifre"
            />
          </Field>
        </div>
      )}

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
