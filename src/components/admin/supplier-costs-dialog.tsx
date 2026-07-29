'use client';

/**
 * "Cât ne-a costat?" — asked once, when an order is finalized.
 *
 * Only opens when the order actually has cost-bearing lines that were never
 * priced (translation, notary, apostilă notarială, ONRC/ANCPI fee). A plain
 * cazier + urgency order never sees it.
 *
 * Deliberately escapable ("Completez mai târziu"): when the operator does not
 * know a figure, forcing one produces invented numbers, and invented costs are
 * worse than missing ones. Skipped orders surface in /admin/costuri-furnizori.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import { tariffAmount, type PendingCostRow } from '@/lib/admin/supplier-costs';

interface Props {
  orderId: string;
  orderNumber: string;
  rows: PendingCostRow[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface RowState {
  pages: string;
  amount: string;
}

export function SupplierCostsDialog({ orderId, orderNumber, rows, open, onClose, onSaved }: Props) {
  const [state, setState] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      rows.map((r) => [
        r.category,
        { pages: '1', amount: r.suggestedAmount != null ? String(r.suggestedAmount) : '' },
      ])
    )
  );
  const [saving, setSaving] = useState(false);

  const setRow = (category: string, patch: Partial<RowState>) =>
    setState((s) => ({ ...s, [category]: { ...s[category], ...patch } }));

  /**
   * Page count re-prices the line, but ONLY when the amount still is what the
   * tariff produced. Once the operator types a figure of their own (the notary
   * charged something else), we stop overwriting it.
   */
  const setPages = (row: PendingCostRow, pages: string) => {
    const current = state[row.category];
    const priced = tariffAmount(row.tariff, Number(current?.pages ?? 1));
    const untouched = priced != null && current?.amount === String(priced);
    const next = tariffAmount(row.tariff, Number(pages) || 1);
    setRow(row.category, {
      pages,
      ...(untouched && next != null ? { amount: String(next) } : {}),
    });
  };

  const filled = rows.filter((r) => {
    const raw = state[r.category]?.amount ?? '';
    return raw.trim() !== '' && Number.isFinite(Number(raw));
  });

  const total = filled.reduce((sum, r) => sum + Number(state[r.category].amount), 0);

  const save = async () => {
    if (filled.length === 0) {
      toast.error('Completează cel puțin o sumă sau alege „Completez mai târziu"');
      return;
    }
    setSaving(true);
    try {
      const payload = filled.map((r) => ({
        supplier: r.supplier || 'Nespecificat',
        category: r.category,
        description: r.label,
        documentLanguage: r.language,
        amountRon: Number(state[r.category].amount),
      }));
      const res = await fetch(`/api/admin/orders/${orderId}/supplier-costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Eroare la salvarea costurilor');
        return;
      }
      toast.success(
        filled.length === rows.length
          ? 'Costuri înregistrate'
          : `${filled.length} din ${rows.length} costuri înregistrate — restul rămâne de completat`
      );
      onSaved();
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Cât ne-a costat comanda {orderNumber}?
          </DialogTitle>
          <DialogDescription>
            Sumele plătite furnizorilor. Rămân doar pentru echipă — clientul nu le vede.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.category} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{r.label}</span>
                {r.supplier && (
                  <Badge variant="secondary" className="shrink-0">{r.supplier}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground whitespace-nowrap">Pagini</label>
                <Input
                  type="number"
                  min={1}
                  value={state[r.category]?.pages ?? '1'}
                  onChange={(e) => setPages(r, e.target.value)}
                  className="h-8 w-16"
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="sumă"
                  value={state[r.category]?.amount ?? ''}
                  onChange={(e) => setRow(r.category, { amount: e.target.value })}
                  className="h-8 flex-1"
                />
                <span className="text-xs text-muted-foreground">lei</span>
              </div>
              {r.suggestionSource && (
                <p className="text-[11px] text-muted-foreground">
                  {r.suggestionSource === 'tarif'
                    ? 'Sumă din tariful configurat — schimb-o dacă s-a taxat altfel.'
                    : 'Ultima sumă înregistrată pentru același serviciu.'}
                </p>
              )}
            </div>
          ))}
        </div>

        {filled.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Total cost intern: <span className="font-semibold text-foreground tabular-nums">{total.toFixed(2)} lei</span>
          </p>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Completez mai târziu
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Se salvează…' : 'Salvează costurile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
