'use client';

/**
 * „Marchează sunat" from the unpaid orders list (parity with the CJO
 * Abandonuri button, 13.10.2026). Same endpoint as Recuperare telefonică, but
 * without the coupon part: the operator picks who called (shared admin login)
 * and may leave a note. Coupons stay in Recuperare telefonică.
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { isPhoneCaller, PHONE_CALLERS, type PhoneCaller } from '@/lib/orders/phone-recovery-wins';

// Shared with /admin/recuperare-telefonica, so the pick carries over.
const CALLER_STORAGE_KEY = 'phone-recovery-caller';

interface Props {
  /** Order to mark; null closes the dialog. */
  orderId: string | null;
  description?: React.ReactNode;
  onClose: () => void;
  onSaved: () => void;
}

export function MarkCalledDialog({ orderId, description, onClose, onSaved }: Props) {
  const [caller, setCaller] = useState<PhoneCaller | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setNotes('');
    try {
      const saved = localStorage.getItem(CALLER_STORAGE_KEY);
      setCaller(isPhoneCaller(saved) ? saved : null);
    } catch {
      setCaller(null);
    }
  }, [orderId]);

  const save = async () => {
    if (!orderId) return;
    if (!caller) {
      toast.error('Alege cine a sunat');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/phone-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caller, notes }),
      });
      const json = await res.json();
      if (json.success) {
        try {
          localStorage.setItem(CALLER_STORAGE_KEY, caller);
        } catch {
          // ignore
        }
        toast.success(`Marcat ca sunat de ${caller}`);
        onSaved();
      } else {
        toast.error(json.error?.message || 'Eroare la salvare');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!orderId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marchează sunat</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-slate-700">Cine a sunat?</div>
          <div className="flex gap-2">
            {PHONE_CALLERS.map((name) => (
              <Button
                key={name}
                type="button"
                size="sm"
                variant={caller === name ? 'default' : 'outline'}
                aria-pressed={caller === name}
                onClick={() => setCaller(name)}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Ce a spus clientul (ex: plătește diseară, nu are buletinul la el, nu a răspuns)..."
        />
        <p className="text-xs text-muted-foreground">Reducere la telefon? Marcați din Recuperare telefonică, unde se creează și cuponul.</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Anulează
          </Button>
          <Button onClick={save} disabled={saving || !caller}>
            {saving ? 'Se salvează...' : 'Salvează'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
