'use client';

/**
 * /admin/recuperare-telefonica — coadă de priorizare pentru echipa care sună
 * clienții cu comenzi abandonate/draft, complementară cronului automat de
 * email+cupon din `/admin/orders?status=abandoned` (acela trimite un email
 * cu 10% reducere fix; redemption real doar 1.4% — vezi memorie/analiză
 * 2026-09-14). Aici omul sună, ascultă motivul real și dă un cupon custom.
 *
 * Prioritizare (cercetare telefon vs email, 2026-09-14): telefon străin +
 * serviciu de stare civilă (naștere/căsătorie) = tier maxim — diaspora, cu
 * termene reale (ambasadă, oficiu stare civilă).
 */

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Phone, RefreshCw, Ticket, ExternalLink, CheckCircle2, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface PriorityRow {
  id: string;
  friendlyOrderId: string | null;
  orderNumber: string | null;
  status: string;
  totalRon: number;
  createdAt: string;
  serviceName: string;
  serviceSlug: string | null;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  isForeignPhone: boolean;
  isCivilStatus: boolean;
  depthScore: number;
  tier: 0 | 1 | 2;
  phoneContactedAt: string | null;
  phoneContactedBy: string | null;
  phoneContactNotes: string | null;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return '<1h';
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}z`;
}

function tierBadge(tier: 0 | 1 | 2) {
  if (tier === 2) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">
        <Globe className="h-3 w-3" /> Prioritate maximă
      </span>
    );
  }
  if (tier === 1) {
    return (
      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
        Prioritate
      </span>
    );
  }
  return <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">Normal</span>;
}

export default function RecuperareTelefonicaPage() {
  const [rows, setRows] = useState<PriorityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeContacted, setIncludeContacted] = useState(false);
  const [conversion, setConversion] = useState<{ contactedTotal: number; contactedConverted: number } | null>(null);
  const [contactTarget, setContactTarget] = useState<PriorityRow | null>(null);
  const [notes, setNotes] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [existingCoupon, setExistingCoupon] = useState('');
  const [sendFollowup, setSendFollowup] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (includeContacted) p.set('includeContacted', '1');
      const res = await fetch(`/api/admin/orders/priority-calls?${p}`);
      const json = await res.json();
      if (json.success) {
        setRows(json.data.rows);
        setConversion(json.data.conversion);
      } else {
        toast.error(json.error?.message || 'Eroare la încărcare');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setLoading(false);
    }
  }, [includeContacted]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const closeDialog = () => {
    setContactTarget(null);
    setNotes('');
    setDiscountPercent('');
    setExistingCoupon('');
    setSendFollowup(true);
  };

  const submitContact = async () => {
    if (!contactTarget) return;
    const pct = discountPercent.trim() ? Number(discountPercent) : null;
    if (pct !== null && (!Number.isInteger(pct) || pct < 1 || pct > 50)) {
      toast.error('Reducerea trebuie să fie un număr întreg între 1 și 50');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${contactTarget.id}/phone-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          ...(pct ? { discountPercent: pct } : {}),
          ...(existingCoupon.trim() ? { couponCode: existingCoupon.trim() } : {}),
          sendEmail: sendFollowup,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        if (d.coupon) {
          toast.success(
            `Marcat ca sunat · cupon ${d.coupon.code} (${d.coupon.discountLabel})${d.emailStatus === 'sent' ? ' · email trimis clientului' : ''}`,
            { duration: 8000 }
          );
          if (d.warning) toast.warning(d.warning, { duration: 10000 });
        } else {
          toast.success('Marcat ca sunat');
        }
        closeDialog();
        fetchRows();
      } else {
        toast.error(json.error?.message || 'Eroare la salvare');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setSaving(false);
    }
  };

  const conversionPct =
    conversion && conversion.contactedTotal > 0
      ? Math.round((conversion.contactedConverted / conversion.contactedTotal) * 100)
      : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Phone className="h-6 w-6" />
            Recuperare telefonică
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? 'comandă' : 'comenzi'} de sunat · sortate după prioritate
            (telefon străin + certificat naștere/căsătorie primele) și apoi cele mai recente.
            {conversionPct !== null && (
              <> · conversie după apel: <strong>{conversionPct}%</strong> ({conversion?.contactedConverted}/{conversion?.contactedTotal})</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={includeContacted ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIncludeContacted((v) => !v)}
          >
            {includeContacted ? 'Ascunde sunate' : 'Arată și sunate'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchRows} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Reîncarcă
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-slate-500">
              <th className="px-3 py-2">Prioritate</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Serviciu</th>
              <th className="px-3 py-2">Valoare</th>
              <th className="px-3 py-2">Vechime</th>
              <th className="px-3 py-2">Status apel</th>
              <th className="px-3 py-2 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-3 py-2"><Skeleton className="h-5 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                  Nimic de sunat acum — coada e goală.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2">{tierBadge(r.tier)}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">
                      {[r.firstName, r.lastName].filter(Boolean).join(' ') || '—'}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="text-primary-700 underline">
                          {r.phone}
                        </a>
                      )}
                      {r.isForeignPhone && <span className="text-blue-600">(străin)</span>}
                      {r.email && <span>{r.email}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm">{r.serviceName}</span>
                    {r.isCivilStatus && (
                      <span className="ml-1 rounded bg-blue-50 px-1 py-0.5 text-[10px] font-medium text-blue-700">
                        stare civilă
                      </span>
                    )}
                    <div className="text-[11px] text-muted-foreground">
                      {r.depthScore > 3 ? 'date multe completate' : r.depthScore > 0 ? 'câteva date completate' : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-medium">{r.totalRon.toFixed(0)} RON</td>
                  <td className="px-3 py-2 text-muted-foreground">{timeAgo(r.createdAt)}</td>
                  <td className="px-3 py-2">
                    {r.phoneContactedAt ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {new Date(r.phoneContactedAt).toLocaleDateString('ro-RO', {
                          day: '2-digit', month: '2-digit', timeZone: 'Europe/Bucharest',
                        })}
                        {r.phoneContactedBy ? ` · ${r.phoneContactedBy}` : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">nesunat</span>
                    )}
                    {r.phoneContactNotes && (
                      <div className="mt-0.5 max-w-[220px] truncate text-xs text-muted-foreground" title={r.phoneContactNotes}>
                        {r.phoneContactNotes}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setContactTarget(r);
                          setNotes(r.phoneContactNotes ?? '');
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {r.phoneContactedAt ? 'Actualizează' : 'Bifează sunat'}
                      </Button>
                      {r.friendlyOrderId && (
                        <a
                          href={`/admin/coupons?order=${encodeURIComponent(r.friendlyOrderId)}&system_kind=phone_recovery`}
                          className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs hover:bg-slate-50"
                          title="Creează cupon custom pentru acest caz"
                        >
                          <Ticket className="h-3.5 w-3.5" />
                          Cupon
                        </a>
                      )}
                      <a
                        href={`/admin/orders/${r.id}`}
                        className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs hover:bg-slate-50"
                        title="Deschide comanda"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!contactTarget} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bifează contactat telefonic</DialogTitle>
            <DialogDescription>
              {contactTarget && (
                <>
                  {[contactTarget.firstName, contactTarget.lastName].filter(Boolean).join(' ') || 'Client'} ·{' '}
                  {contactTarget.serviceName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ce a spus clientul, ce ai stabilit (ex: a promis plată mâine, a cerut cupon 15%, nu a răspuns)..."
            rows={4}
          />
          <div className="rounded-lg border bg-slate-50 p-3 space-y-2">
            <div className="text-xs font-medium text-slate-700">Ai oferit o reducere la telefon?</div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={discountPercent}
                  onChange={(e) => {
                    setDiscountPercent(e.target.value);
                    if (e.target.value) setExistingCoupon('');
                  }}
                  placeholder="10"
                  className="h-8 w-16 rounded-md border bg-white px-2 text-sm"
                />
                <span className="text-slate-600">% reducere (cupon nou, 7 zile)</span>
              </label>
              <span className="text-xs text-muted-foreground">sau</span>
              <input
                type="text"
                value={existingCoupon}
                onChange={(e) => {
                  setExistingCoupon(e.target.value.toUpperCase());
                  if (e.target.value) setDiscountPercent('');
                }}
                placeholder="cod existent, ex. TEL-ABC123"
                className="h-8 w-44 rounded-md border bg-white px-2 font-mono text-xs"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={sendFollowup} onChange={(e) => setSendFollowup(e.target.checked)} className="h-4 w-4" />
              Trimite clientului emailul de follow-up („ai vorbit cu …, ai X% reducere, reia comanda din link” — cuponul se aplică automat)
            </label>
            {contactTarget && !contactTarget.email && (
              <div className="text-xs text-amber-700">Comanda nu are email — cuponul se creează, dar codul îl dai prin telefon/WhatsApp.</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Anulează
            </Button>
            <Button onClick={submitContact} disabled={saving}>
              {saving ? 'Se salvează...' : 'Salvează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
