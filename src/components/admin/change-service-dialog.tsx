'use client';

/**
 * „Schimbă serviciul" — mută o comandă plătită pe alt serviciu la același
 * preț în catalogul actual (ex. Cazier Judiciar PF → Cazier Fiscal, 198 lei;
 * Copie intabulare → Copie contract vânzare, 216,59 lei). Trei pași:
 *   1. lista serviciilor (eligibile sus, celelalte cu motivul);
 *   2. previzualizare: ce lipsește, ce documente se regenerează, factura;
 *   3. motiv + confirmare → apply.
 * Backend: /api/admin/orders/[id]/change-service.
 */

import { useEffect, useState } from 'react';
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
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Loader2, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface Candidate {
  slug: string;
  name: string;
  basePrice: number;
  eligible: boolean;
  blockers: string[];
  needsLicenseConfirmation: boolean;
}

interface Consequences {
  from: { slug: string; name: string };
  to: { slug: string; name: string; basePrice: number };
  eligible: boolean;
  blockers: string[];
  todo: string[];
  warnings: string[];
  changes: string[];
  paidBasePrice: number;
  needsLicenseConfirmation: boolean;
  documents: { toRegenerate: Array<{ type: string; label: string }>; notes: string[] };
  invoiceNote: string;
  reissueAvailable: boolean;
  estimate: { old: string | null; new: string | null; kept: boolean };
  registry?: { moved: number; error: string | null };
}

interface Current {
  name: string;
  paidBasePrice: number;
  currentBasePrice: number;
  status: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  onApplied: () => void;
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('ro-RO', { timeZone: 'Europe/Bucharest' }) : '—';

export function ChangeServiceDialog({ open, onOpenChange, orderId, orderNumber, onApplied }: Props) {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<Current | null>(null);
  const [familyNote, setFamilyNote] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [target, setTarget] = useState<string>('');
  const [preview, setPreview] = useState<Consequences | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [licenseOk, setLicenseOk] = useState(false);
  const [note, setNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<Consequences | null>(null);

  const call = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/orders/${orderId}/change-service`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({ success: false, error: 'Răspuns invalid de la server.' }));
    return json as { success: boolean; data?: Record<string, unknown>; error?: string };
  };

  // Deschidere: lista candidaților.
  useEffect(() => {
    if (!open) return;
    setTarget('');
    setPreview(null);
    setResult(null);
    setNote('');
    setLicenseOk(false);
    setListError(null);
    setLoading(true);
    void call({ action: 'preview' })
      .then((json) => {
        if (!json.success || !json.data) {
          setListError(json.error || 'Nu am putut încărca serviciile.');
          return;
        }
        setCurrent(json.data.current as Current);
        setFamilyNote((json.data.familyNote as string | null) ?? null);
        setCandidates(json.data.candidates as Candidate[]);
      })
      .catch(() => setListError('Nu am putut încărca serviciile.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderId]);

  // Previzualizare la alegerea serviciului / bifa permisului.
  useEffect(() => {
    if (!open || !target) return;
    setPreviewLoading(true);
    void call({ action: 'preview', targetServiceSlug: target, licenseConfirmedRomanian: licenseOk })
      .then((json) => {
        if (!json.success || !json.data) {
          toast.error(json.error || 'Previzualizarea a eșuat.');
          setPreview(null);
          return;
        }
        setPreview(json.data as unknown as Consequences);
      })
      .finally(() => setPreviewLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, target, licenseOk]);

  const apply = async () => {
    if (!preview?.eligible || note.trim().length < 3) return;
    setApplying(true);
    try {
      const json = await call({
        action: 'apply',
        targetServiceSlug: target,
        note: note.trim(),
        licenseConfirmedRomanian: licenseOk,
      });
      if (!json.success || !json.data) {
        toast.error(json.error || 'Schimbarea a eșuat.');
        return;
      }
      const data = json.data as unknown as Consequences;
      setResult(data);
      toast.success(`Serviciu schimbat: ${data.from.name} → ${data.to.name}`);
      onApplied();
    } catch {
      toast.error('Schimbarea a eșuat.');
    } finally {
      setApplying(false);
    }
  };

  const eligible = candidates.filter((c) => c.eligible);
  const blocked = candidates.filter((c) => !c.eligible);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schimbă serviciul — {orderNumber}</DialogTitle>
          <DialogDescription>
            Pentru clientul care a plătit alt serviciu decât voia, când azi cele două servicii costă la fel. Banii
            nu se mișcă de aici și statusul nu se schimbă: pentru diferențe de preț folosește „Modifică”.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-green-900">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">
                  Comanda e acum pe {result.to.name}.
                </p>
                <p>
                  {result.estimate.kept
                    ? `Termenul a rămas ${fmtDate(result.estimate.old)}.`
                    : `Termen nou: ${fmtDate(result.estimate.new)}.`}
                </p>
                {result.registry?.error && <p className="text-amber-800">{result.registry.error}</p>}
              </div>
            </div>
            <ConsequenceLists data={result} done />
          </div>
        ) : (
          <div className="space-y-4">
            {loading && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă serviciile…
              </p>
            )}
            {listError && <p className="text-sm text-red-700">{listError}</p>}
            {current && (
              <p className="text-sm">
                Acum: <span className="font-medium">{current.name}</span> · azi costă{' '}
                {current.currentBasePrice.toFixed(2)} lei
                {current.paidBasePrice > 0 && current.paidBasePrice !== current.currentBasePrice && (
                  <span className="text-muted-foreground"> (plătit {current.paidBasePrice.toFixed(2)} lei, preț vechi)</span>
                )}
              </p>
            )}
            {familyNote && <p className="text-sm text-red-700">{familyNote}</p>}

            {!loading && !listError && (
              <div className="space-y-2">
                <Label>Serviciul corect</Label>
                {eligible.length === 0 && !familyNote && (
                  <p className="text-sm text-muted-foreground">
                    Niciun serviciu la același preț nu se potrivește acestei comenzi. Motivele sunt mai jos.
                  </p>
                )}
                <div className="grid gap-2">
                  {eligible.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        setTarget(c.slug);
                        setLicenseOk(false);
                      }}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                        target === c.slug ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                      }`}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{c.basePrice.toFixed(2)} lei</span>
                    </button>
                  ))}
                </div>
                {blocked.length > 0 && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer">De ce nu apar celelalte servicii ({blocked.length})</summary>
                    <ul className="mt-2 space-y-1">
                      {blocked.map((c) => (
                        <li key={c.slug}>
                          <button
                            type="button"
                            className="font-medium text-foreground underline-offset-2 hover:underline"
                            onClick={() => {
                              setTarget(c.slug);
                              setLicenseOk(false);
                            }}
                          >
                            {c.name}
                          </button>
                          : {c.blockers[0]}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {target && previewLoading && !preview && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Verific consecințele…
              </p>
            )}

            {preview && preview.to.slug === target && (
              <div className="space-y-3 rounded-md border p-3 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  {preview.from.name} <ArrowRight className="h-4 w-4" /> {preview.to.name}
                </p>

                {preview.needsLicenseConfirmation && (
                  <label className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2">
                    <Checkbox checked={licenseOk} onCheckedChange={(v) => setLicenseOk(v === true)} />
                    <span>
                      Am confirmat cu clientul că permisul de conducere e emis în România. (Permisul străin are alt
                      preț și alt termen: atunci anulare și comandă nouă.)
                    </span>
                  </label>
                )}

                {preview.blockers.length > 0 && (
                  <div className="rounded-md border border-red-300 bg-red-50 p-2 text-red-900">
                    <p className="font-medium">Nu se poate schimba:</p>
                    <ul className="ml-4 list-disc">
                      {preview.blockers.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <ConsequenceLists data={preview} />

                <p className="text-xs text-muted-foreground">
                  {preview.estimate.kept
                    ? `Termen: rămâne ${fmtDate(preview.estimate.old)} (comanda e încheiată).`
                    : `Termen: ${fmtDate(preview.estimate.old)} → ${fmtDate(preview.estimate.new)} (calculat de la data plății, cu regulile serviciului nou).`}
                </p>

                {preview.eligible && (
                  <div className="space-y-1">
                    <Label htmlFor="change-service-note">Motivul (apare în istoric)</Label>
                    <Input
                      id="change-service-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="ex. clientul a cerut cazier fiscal la telefon"
                      maxLength={500}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {result ? 'Închide' : 'Renunță'}
          </Button>
          {!result && (
            <Button
              onClick={() => void apply()}
              disabled={!preview?.eligible || preview.to.slug !== target || note.trim().length < 3 || applying}
            >
              {applying && <Loader2 className="h-4 w-4 animate-spin" />}
              Schimbă serviciul
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConsequenceLists({ data, done }: { data: Consequences; done?: boolean }) {
  return (
    <div className="space-y-3">
      {data.warnings.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <ul className="space-y-1">
            {data.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      {data.changes.length > 0 && (
        <div>
          <p className="font-medium">{done ? 'Ce s-a schimbat:' : 'Ce se schimbă:'}</p>
          <ul className="ml-4 list-disc">
            {data.changes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {data.todo.length > 0 && (
        <div>
          <p className="font-medium">{done ? 'De făcut acum:' : 'De făcut după schimbare:'}</p>
          <ul className="ml-4 list-disc">
            {data.todo.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <p className="flex items-center gap-1 font-medium">
          <FileText className="h-4 w-4" /> Documente
        </p>
        {data.documents.toRegenerate.length > 0 ? (
          <p>
            De regenerat din „Procesare comandă”: {data.documents.toRegenerate.map((d) => d.label).join(', ')}.
          </p>
        ) : (
          <p>Nu există documente generate încă.</p>
        )}
        <ul className="ml-4 list-disc text-muted-foreground">
          {data.documents.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
      <div className="flex items-start gap-2 rounded-md bg-muted p-2">
        <Receipt className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          {data.invoiceNote}
          {data.reissueAvailable && ' Nu apăsa „Storno + Reemite” fără acordul lor.'}
        </p>
      </div>
    </div>
  );
}
