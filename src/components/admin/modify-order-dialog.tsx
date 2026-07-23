'use client';

/**
 * Modify Order Dialog — admin can change a paid order's options and the
 * system reconciles money. Two-step UX:
 *   1. Adjust toggles → click "Calculează diferența" → POST preview
 *   2. Review the diff banner → click "Aplică" → POST apply → done
 *
 * Backed by /api/admin/orders/[id]/modify. See docs/admin/modify-order.md
 * for the operational handbook. UI matches cazierjudiciaronline.com's
 * Modify dialog so operators familiar with both platforms recognize the
 * flow.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, ArrowRight, RotateCcw, Send, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslationLanguages } from '@/hooks/use-translation-languages';
import { APOSTILA_COUNTRIES } from '@/config/apostila-countries';
import { computeAddedTermShiftDays } from '@/lib/orders/modify-diff';

interface OptionRow {
  optionId?: string;
  option_id?: string;
  code?: string;
  option_name?: string;
  optionName?: string;
  priceModifier?: number;
  price_modifier?: number;
  quantity?: number;
  /** Selection details — traducere → language, apostilă → country. Same
   *  shape the wizard persists; flows into selected_options on apply. */
  metadata?: { language?: string; country?: string } | null;
}

interface CatalogOption {
  optionId: string;
  code: string;
  name: string;
  description: string | null;
  priceModifier: number;
  selected: boolean;
  quantity: number;
}

interface DiffResult {
  newTotal: number;
  currentNetPaid: number;
  originalTotal: number;
  refunded: number;
  additionalPaid: number;
  diff: number;
  action: 'refund' | 'extra_payment' | 'none';
}

interface ModifyOrderDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  orderId: string;
  orderNumber: string;
  /** Current options on the order. Used to seed the editable list. */
  initialOptions: OptionRow[];
  /** Current delivery price (RON). Used to seed the input. */
  initialDeliveryPrice: number;
  /** Refresh hook the parent passes — admin order detail re-fetches after apply. */
  onApplied?: () => void;
}

export function ModifyOrderDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  initialOptions,
  initialDeliveryPrice,
  onApplied,
}: ModifyOrderDialogProps) {
  // Normalize the initial option list — caller passes snake_case from DB OR
  // camelCase from API, we accept both and keep the same shape locally.
  const seed: OptionRow[] = useMemo(() => initialOptions ?? [], [initialOptions]);

  const [options, setOptions] = useState<OptionRow[]>(seed);
  const [deliveryPrice, setDeliveryPrice] = useState<number>(initialDeliveryPrice);
  const [note, setNote] = useState('');
  const [refundReason, setRefundReason] = useState('');
  // DB-driven language list (admin settings → Traduceri); static fallback.
  const translationLanguages = useTranslationLanguages();

  // Free-form extra service — for things that aren't in the addon catalog
  // (e.g. "traducere legalizată maghiară"). Both empty = not sent at all.
  const [customExtraName, setCustomExtraName] = useState('');
  const [customExtraPrice, setCustomExtraPrice] = useState('');

  // Full addon catalog for the service. Fetched on open so the dialog can
  // show options the customer DIDN'T buy initially — admin can add them as
  // upsells (a common phone-call workflow: client adds apostila / traducere
  // after paying).
  const [catalog, setCatalog] = useState<CatalogOption[] | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when the dialog re-opens (so closing without saving doesn't leak
  // a stale diff into the next open) + fetch the addon catalog.
  useEffect(() => {
    if (!open) return;
    setOptions(seed);
    setDeliveryPrice(initialDeliveryPrice);
    setNote('');
    setRefundReason('');
    setCustomExtraName('');
    setCustomExtraPrice('');
    setDiff(null);
    setSummary('');
    setError(null);
    setCatalog(null);
    setLoadingCatalog(true);
    fetch(`/api/admin/orders/${orderId}/available-options`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCatalog(json.data.options as CatalogOption[]);
      })
      .catch(() => {
        // Non-fatal — fall back to just-existing-options view if catalog
        // fails to load (no upsell, but admin can still remove options).
      })
      .finally(() => setLoadingCatalog(false));
  }, [open, seed, initialDeliveryPrice, orderId]);

  // When the admin tweaks anything, invalidate the cached preview so they
  // can't accidentally apply against stale numbers.
  function markDirty() {
    setDiff(null);
    setSummary('');
  }

  function toggleOption(opt: OptionRow) {
    const id = opt.optionId ?? opt.option_id;
    markDirty();
    setOptions((prev) => {
      const present = prev.some((o) => (o.optionId ?? o.option_id) === id);
      if (present) {
        let next = prev.filter((o) => (o.optionId ?? o.option_id) !== id);
        // Dependency cascade (same rules as the wizard): traducere off drops
        // legalizare + apostila notari; legalizare off drops apostila notari.
        if (opt.code === 'traducere') {
          next = next.filter((o) => o.code !== 'legalizare' && o.code !== 'apostila_notari');
        } else if (opt.code === 'legalizare') {
          next = next.filter((o) => o.code !== 'apostila_notari');
        }
        return next;
      }
      // Adding from catalog — make sure the row we send to the API has the
      // canonical shape (optionId + optionName + priceModifier + quantity).
      return [
        ...prev,
        {
          optionId: id,
          code: opt.code,
          optionName: opt.optionName ?? opt.option_name,
          priceModifier: opt.priceModifier ?? opt.price_modifier ?? 0,
          quantity: opt.quantity ?? 1,
        },
      ];
    });
  }

  /** Patch metadata (language/country) on selected rows. Country is shared
   *  between apostila_haga + apostila_notari — same convention as the wizard. */
  function setOptionMetadata(codes: string[], patch: { language?: string; country?: string }) {
    markDirty();
    setOptions((prev) =>
      prev.map((o) =>
        o.code && codes.includes(o.code)
          ? { ...o, metadata: { ...(o.metadata ?? {}), ...patch } }
          : o
      )
    );
  }

  /**
   * Build the optional `customExtra` payload from the two free-form inputs.
   * Both empty → `{ customExtra: undefined }` (nothing sent). Partially or
   * badly filled → `{ error }` so the caller can surface it BEFORE hitting
   * the API (server re-validates anyway: name 3–120 chars, price 1–20000).
   */
  function resolveCustomExtra():
    | { customExtra: { name: string; price: number } | undefined; error?: undefined }
    | { customExtra?: undefined; error: string } {
    const name = customExtraName.trim();
    const priceRaw = customExtraPrice.trim();
    if (!name && !priceRaw) return { customExtra: undefined };
    if (name.length < 3) {
      return { error: 'Denumirea serviciului extra trebuie să aibă minim 3 caractere.' };
    }
    const price = parseFloat(priceRaw);
    if (!Number.isFinite(price) || price <= 0) {
      return { error: 'Prețul serviciului extra trebuie să fie un număr mai mare ca 0.' };
    }
    return { customExtra: { name, price } };
  }

  // Details required on NEWLY added options (parity with the wizard):
  // traducere → limbă, apostilă → țară. Existing (already-paid) rows are
  // exempt — legacy orders may predate the metadata convention.
  function validateOptionDetails(): string | null {
    const originalCodes = new Set(seed.map((o) => o.code).filter(Boolean));
    const byCode = (c: string) => options.find((o) => o.code === c);
    const trad = byCode('traducere');
    if (trad && !originalCodes.has('traducere') && !trad.metadata?.language) {
      return 'Selectează limba pentru Traducere Autorizată.';
    }
    const haga = byCode('apostila_haga');
    const notari = byCode('apostila_notari');
    const country = haga?.metadata?.country ?? notari?.metadata?.country ?? '';
    const newApostila =
      (haga && !originalCodes.has('apostila_haga')) ||
      (notari && !originalCodes.has('apostila_notari'));
    if (newApostila && !country) {
      return 'Selectează țara pentru apostilă.';
    }
    return null;
  }

  async function runPreview() {
    const detailsError = validateOptionDetails();
    if (detailsError) {
      setError(detailsError);
      return;
    }
    const resolved = resolveCustomExtra();
    if (resolved.error) {
      setError(resolved.error);
      return;
    }
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          selectedOptions: options,
          deliveryPrice,
          customExtra: resolved.customExtra,
          note: note || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Preview eșuat');
      }
      setDiff(json.data.diff);
      setSummary(json.data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview eșuat');
    } finally {
      setPreviewing(false);
    }
  }

  async function runApply() {
    if (!diff) return;
    if (diff.action === 'refund' && !refundReason.trim()) {
      setError('Pentru refund trebuie să introduci un motiv (apare pe Stripe).');
      return;
    }
    const detailsError = validateOptionDetails();
    if (detailsError) {
      setError(detailsError);
      return;
    }
    const resolved = resolveCustomExtra();
    if (resolved.error) {
      setError(resolved.error);
      return;
    }
    setApplying(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          selectedOptions: options,
          deliveryPrice,
          customExtra: resolved.customExtra,
          note: note || undefined,
          refundReason: refundReason || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Aplicare eșuată');
      }
      const data = json.data;
      if (diff.action === 'refund') {
        toast.success(`Refund aplicat: ${Math.abs(diff.diff).toFixed(2)} RON`, {
          description: `Stripe refund ${data.stripeRefundId}`,
        });
      } else if (diff.action === 'extra_payment') {
        toast.success(`Link plată extra creat: ${diff.diff.toFixed(2)} RON`, {
          description: 'Customer-ul primește email cu link de plată.',
        });
      } else {
        toast.success('Modificare aplicată (fără diferență de bani)');
      }
      if (data.termShift) {
        toast.info(`Termen actualizat: ${data.termShift}`);
      }
      onApplied?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aplicare eșuată');
    } finally {
      setApplying(false);
    }
  }

  // ─── Render helpers ────────────────────────────────────────────────────────

  // Display rows: prefer the catalog (full list of available addons) when
  // it has loaded, otherwise fall back to just the options currently on the
  // order. Each row carries an `addable` flag so the UI can mark addons
  // that were NOT on the order originally — these are upsells the admin
  // is adding via Modify.
  const optionRows: Array<OptionRow & { selected: boolean; addable: boolean; description?: string | null }> = useMemo(() => {
    const selectedIds = new Set(
      options.map((x) => x.optionId ?? x.option_id).filter(Boolean) as string[]
    );
    const originalIds = new Set(
      seed.map((x) => x.optionId ?? x.option_id).filter(Boolean) as string[]
    );

    if (catalog) {
      return catalog.map((c) => ({
        optionId: c.optionId,
        code: c.code,
        option_name: c.name,
        optionName: c.name,
        priceModifier: c.priceModifier,
        quantity: c.quantity,
        description: c.description,
        selected: selectedIds.has(c.optionId),
        addable: !originalIds.has(c.optionId),
      }));
    }

    // Catalog still loading — only show what's already on the order.
    return seed.map((o) => ({
      ...o,
      selected: selectedIds.has((o.optionId ?? o.option_id ?? '') as string),
      addable: false,
    }));
  }, [seed, options, catalog]);

  // Live math while the admin toggles — instant feedback before the
  // authoritative server preview. Options sum + custom extra + term impact
  // of the newly added codes (traducere +2z, legalizare/apostile +1z,
  // cetățean străin +7z — pessimistic, mirrors the server shift).
  const liveOptionsTotal = options.reduce(
    (sum, o) => sum + (o.priceModifier ?? o.price_modifier ?? 0) * (o.quantity ?? 1),
    0
  );
  const liveCustomPrice = parseFloat(customExtraPrice) || 0;
  const liveTermShift = computeAddedTermShiftDays(seed, options);

  const selectedTraducere = options.find((o) => o.code === 'traducere');
  const selectedHaga = options.find((o) => o.code === 'apostila_haga');
  const selectedNotari = options.find((o) => o.code === 'apostila_notari');
  const sharedCountry =
    selectedHaga?.metadata?.country ?? selectedNotari?.metadata?.country ?? '';
  const traducereOn = !!selectedTraducere;
  const legalizareOn = options.some((o) => o.code === 'legalizare');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifică comanda {orderNumber}</DialogTitle>
          <DialogDescription>
            Adaugă/scoate opțiuni. Sistemul calculează diferența și aplică refund
            automat sau creează un link de plată extra după caz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Options checklist */}
          <div>
            <Label className="text-sm font-semibold">Opțiuni</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Bifează/debifează ce vrei. Lista include toate addon-urile disponibile —
              cele marcate <span className="font-semibold text-emerald-700">Nou</span> nu erau
              pe comandă inițial (adăugare cu plată suplimentară).
            </p>
            {loadingCatalog && (
              <p className="mb-2 text-xs text-muted-foreground">Încarc catalogul de opțiuni…</p>
            )}
            <div className="space-y-2 rounded-lg border p-3 bg-neutral-50/40">
              {optionRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nicio opțiune înregistrată pe comandă.</p>
              ) : (
                optionRows.map((o, i) => {
                  const id = (o.optionId ?? o.option_id ?? `o-${i}`) as string;
                  const name = (o.option_name ?? o.optionName ?? 'Opțiune') as string;
                  const price = (o.priceModifier ?? o.price_modifier ?? 0) * (o.quantity ?? 1);
                  // Wizard dependency rules: legalizare needs traducere;
                  // apostila notari needs legalizare.
                  const depDisabled =
                    !o.selected &&
                    ((o.code === 'legalizare' && !traducereOn) ||
                      (o.code === 'apostila_notari' && !legalizareOn));
                  // Detail selects shown under the selected row. Country is
                  // shared between the two apostille types — render it under
                  // Haga when selected, else under Notari.
                  const showLanguage = o.selected && o.code === 'traducere';
                  const showCountry =
                    o.selected &&
                    ((o.code === 'apostila_haga') ||
                      (o.code === 'apostila_notari' && !selectedHaga));
                  return (
                    <div key={id}>
                      <label
                        className={`flex items-start gap-3 text-sm rounded px-2 py-1 ${
                          depDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          o.addable && o.selected
                            ? 'bg-emerald-50 ring-1 ring-emerald-200'
                            : ''
                        }`}
                      >
                        <Checkbox
                          checked={o.selected}
                          disabled={depDisabled}
                          onCheckedChange={() => toggleOption(o)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{name}</span>
                            {o.addable ? (
                              <span className="rounded-full bg-emerald-600 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide text-white">
                                Nou
                              </span>
                            ) : (
                              <span className="rounded-full bg-neutral-200 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide text-neutral-600">
                                Plătit deja
                              </span>
                            )}
                          </div>
                          {o.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{o.description}</p>
                          )}
                          {depDisabled && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {o.code === 'legalizare'
                                ? 'Necesită Traducere Autorizată selectată.'
                                : 'Necesită Legalizare Notarială selectată.'}
                            </p>
                          )}
                        </div>
                        <span className="font-medium tabular-nums whitespace-nowrap pt-0.5">
                          +{price.toFixed(2)} RON
                        </span>
                      </label>
                      {showLanguage && (
                        <div className="ml-9 mt-1 mb-1">
                          <Label htmlFor={`lang-${id}`} className="text-xs text-muted-foreground">
                            Limba traducerii
                          </Label>
                          <select
                            id={`lang-${id}`}
                            value={selectedTraducere?.metadata?.language ?? ''}
                            onChange={(e) => setOptionMetadata(['traducere'], { language: e.target.value })}
                            className="mt-1 block w-full max-w-xs rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">— Selectează limba —</option>
                            {translationLanguages.map((lang) => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {showCountry && (
                        <div className="ml-9 mt-1 mb-1">
                          <Label htmlFor={`country-${id}`} className="text-xs text-muted-foreground">
                            Țara de utilizare (apostilă)
                          </Label>
                          <select
                            id={`country-${id}`}
                            value={sharedCountry}
                            onChange={(e) =>
                              setOptionMetadata(['apostila_haga', 'apostila_notari'], { country: e.target.value })
                            }
                            className="mt-1 block w-full max-w-xs rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">— Selectează țara —</option>
                            {APOSTILA_COUNTRIES.map((country) => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {/* Live math — instant feedback while toggling; the authoritative
                diff still comes from "Calculează diferența". */}
            {optionRows.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Opțiuni selectate:{' '}
                  <span className="font-semibold text-foreground tabular-nums">
                    {liveOptionsTotal.toFixed(2)} RON
                  </span>
                  {liveCustomPrice > 0 && (
                    <>
                      {' '}+ custom{' '}
                      <span className="font-semibold text-foreground tabular-nums">
                        {liveCustomPrice.toFixed(2)} RON
                      </span>
                    </>
                  )}
                </span>
                {liveTermShift > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                    <Clock className="h-3.5 w-3.5" />
                    termen +{liveTermShift} zile lucrătoare
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Custom extra service — free-form name + price for services that
              aren't in the addon catalog. Goes into the extra-payment link
              and onto the order as a `custom_extra` option. */}
          <div>
            <Label className="text-sm font-semibold">Serviciu extra (custom)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Pentru un serviciu care nu apare în lista de mai sus. Intră în
              plata suplimentară și pe comandă. Lasă ambele câmpuri goale dacă
              nu e cazul.
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="custom-extra-name" className="text-xs text-muted-foreground">
                  Denumire serviciu
                </Label>
                <Input
                  id="custom-extra-name"
                  value={customExtraName}
                  onChange={(e) => {
                    setCustomExtraName(e.target.value);
                    markDirty();
                  }}
                  placeholder="ex: traducere legalizată maghiară"
                  maxLength={120}
                  className="mt-1"
                />
              </div>
              <div className="w-32">
                <Label htmlFor="custom-extra-price" className="text-xs text-muted-foreground">
                  Preț (RON)
                </Label>
                <Input
                  id="custom-extra-price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={customExtraPrice}
                  onChange={(e) => {
                    setCustomExtraPrice(e.target.value);
                    markDirty();
                  }}
                  placeholder="ex: 150"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Delivery price */}
          <div>
            <Label htmlFor="delivery-price" className="text-sm font-semibold">
              Preț livrare (RON)
            </Label>
            <Input
              id="delivery-price"
              type="number"
              step="0.01"
              value={deliveryPrice}
              onChange={(e) => {
                setDeliveryPrice(parseFloat(e.target.value) || 0);
                markDirty();
              }}
              className="mt-1 max-w-xs"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Lăsat ca atare dacă nu schimbi curierul.
            </p>
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="note" className="text-sm font-semibold">
              Notă (opțional)
            </Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ex: clientul a sunat la 14:00 și a cerut Poșta în loc de DHL"
              className="mt-1"
              maxLength={500}
            />
          </div>

          {/* Preview button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={runPreview}
              disabled={previewing || applying}
            >
              {previewing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Calculează diferența
            </Button>
          </div>

          {/* Preview banner */}
          {diff && (
            <div
              className={`rounded-lg border-2 p-4 space-y-2 ${
                diff.action === 'refund'
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : diff.action === 'extra_payment'
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-neutral-300 bg-neutral-50/40'
              }`}
            >
              <div className="flex items-start gap-2">
                {diff.action === 'refund' ? (
                  <RotateCcw className="h-5 w-5 text-emerald-700 mt-0.5" />
                ) : diff.action === 'extra_payment' ? (
                  <Send className="h-5 w-5 text-amber-700 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-neutral-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {diff.action === 'refund'
                      ? `Refund către client: ${Math.abs(diff.diff).toFixed(2)} RON`
                      : diff.action === 'extra_payment'
                        ? `Plată suplimentară necesară: ${diff.diff.toFixed(2)} RON`
                        : 'Fără diferență de bani'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{summary}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs tabular-nums pt-2 border-t border-neutral-200">
                <div>
                  <p className="text-muted-foreground">Total inițial</p>
                  <p className="font-medium">{diff.originalTotal.toFixed(2)} RON</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total nou</p>
                  <p className="font-medium">{diff.newTotal.toFixed(2)} RON</p>
                </div>
                {diff.refunded > 0 && (
                  <div>
                    <p className="text-muted-foreground">Refundat anterior</p>
                    <p className="font-medium">−{diff.refunded.toFixed(2)} RON</p>
                  </div>
                )}
                {diff.additionalPaid > 0 && (
                  <div>
                    <p className="text-muted-foreground">Plătit suplimentar</p>
                    <p className="font-medium">+{diff.additionalPaid.toFixed(2)} RON</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-muted-foreground">Net curent încasat</p>
                  <p className="font-medium">{diff.currentNetPaid.toFixed(2)} RON</p>
                </div>
              </div>
              {diff.action === 'refund' && (
                <div className="pt-2">
                  <Label htmlFor="refund-reason" className="text-xs font-semibold">
                    Motiv refund (apare pe Stripe + email-ul clientului)
                  </Label>
                  <Input
                    id="refund-reason"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="ex: clientul a cerut scoaterea apostilei"
                    className="mt-1"
                    maxLength={200}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive font-medium" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={applying}>
            Anulează
          </Button>
          <Button
            onClick={runApply}
            disabled={!diff || applying}
            className={
              diff?.action === 'refund'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : diff?.action === 'extra_payment'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : ''
            }
          >
            {applying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {diff?.action === 'refund'
              ? 'Aplică + refund'
              : diff?.action === 'extra_payment'
                ? 'Aplică + trimite link plată'
                : 'Aplică modificare'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
