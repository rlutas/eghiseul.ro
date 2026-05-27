'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';
import { STATUS_OPTIONS, findStatusLabel } from '@/lib/admin/status-options';

interface UpdateStatusCardProps {
  orderId: string;
  currentStatus: string;
  onUpdated: () => void;
}

/**
 * Inline "Actualizează Status" card on the admin order detail page.
 *
 * Matches the sister project UX: dropdown + optional note + button in one
 * row. This is the everyday tool — it replaces the old behind-a-button
 * dialog, which made every transition feel ceremonial. Special transitions
 * (standby, terminal statuses) still show an inline warning before submit.
 */
export function UpdateStatusCard({
  orderId,
  currentStatus,
  onUpdated,
}: UpdateStatusCardProps) {
  const [newStatus, setNewStatus] = useState<string>(currentStatus);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sameStatus = newStatus === currentStatus;
  const selected = STATUS_OPTIONS.find((o) => o.value === newStatus);
  const isStandby = newStatus === 'standby';
  const isTerminal = selected?.group === 'terminal';

  const apply = async () => {
    if (sameStatus) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: note.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Eroare la actualizare');
        return;
      }
      const msg = json.standby
        ? `Status actualizat — termen mutat cu ${json.standby.pausedBusinessDays} zile lucrătoare`
        : `Status actualizat: ${findStatusLabel(newStatus)}`;
      toast.success(msg);
      setNote('');
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare de rețea');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Actualizează Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="update-status-select" className="text-sm font-medium">
              Status nou
            </Label>
            <select
              id="update-status-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="update-status-note" className="text-sm font-medium">
              Notă (opțional)
            </Label>
            <Input
              id="update-status-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Adaugă o notă…"
              maxLength={500}
            />
          </div>
          <Button onClick={apply} disabled={submitting || sameStatus}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizează'}
          </Button>
        </div>

        {/* Inline contextual warnings — only show when the selected status
            needs the admin to know something beyond the label. */}
        {isStandby && !sameStatus && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
            <PauseCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              SLA se pauzează cât timp comanda este în standby. La revenirea într-un alt status,
              termenul de livrare se decalează cu zilele lucrătoare petrecute în pauză.
            </p>
          </div>
        )}
        {isTerminal && !sameStatus && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-900">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Status terminal. Această tranziție <strong>nu</strong> inițiază automat refund-ul
              Stripe sau stornarea facturii — fă-le manual din dialogul Modifică / Storno dacă e
              nevoie.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
