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
 *
 * Email manual (07.10.2026, cerere echipă: „sunt prea mulți de sunat"): pe un
 * rând sau pe toate bifate, fără cupon, semnat cu prenumele colegei. Pasul 3
 * al secvenței automate nu mai trimite cupon — după 2 emailuri fără răspuns
 * comanda apare aici marcată „2 emailuri fără răspuns".
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
import { Phone, RefreshCw, Ticket, ExternalLink, CheckCircle2, Globe, Mail } from 'lucide-react';
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
  duplicateCount: number;
  freshness: 0 | 1 | 2;
  recoveryEmailStep: number;
  currentStep: string | null;
  manualRecoveryEmailAt: string | null;
  manualRecoveryEmailBy: string | null;
}

interface RecoveredRow {
  id: string;
  friendlyOrderId: string | null;
  serviceName: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  phoneContactedAt: string;
  phoneContactedBy: string | null;
  phoneContactNotes: string | null;
  paidOrderId: string;
  paidOrderRef: string;
  paidTotalRon: number;
  paidAt: string;
}

interface Kpi {
  calls7: number;
  calls30: number;
  recovered: number;
  recoveredLei: number;
  unpaidNoCall7: number;
}

const fmtLei = (n: number) => n.toLocaleString('ro-RO', { maximumFractionDigits: 0 });
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Bucharest' });

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 1) return '<1h';
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}z`;
}

const MANUAL_EMAIL_COOLDOWN_MS = 24 * 3_600_000;
const emailedRecently = (r: PriorityRow) =>
  !!r.manualRecoveryEmailAt && Date.now() - new Date(r.manualRecoveryEmailAt).getTime() < MANUAL_EMAIL_COOLDOWN_MS;
const canEmail = (r: PriorityRow) => !!r.email && !emailedRecently(r);

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
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [recovered, setRecovered] = useState<RecoveredRow[]>([]);
  const [view, setView] = useState<'open' | 'recovered'>('open');
  const [contactTarget, setContactTarget] = useState<PriorityRow | null>(null);
  const [notes, setNotes] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [existingCoupon, setExistingCoupon] = useState('');
  const [sendFollowup, setSendFollowup] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailTargets, setEmailTargets] = useState<PriorityRow[] | null>(null);
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (includeContacted) p.set('includeContacted', '1');
      const res = await fetch(`/api/admin/orders/priority-calls?${p}`);
      const json = await res.json();
      if (json.success) {
        setRows(json.data.rows);
        setSelected(new Set());
        setKpi(json.data.kpi ?? null);
        setRecovered(json.data.recovered ?? []);
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

  const toggleSelected = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const emailable = rows.filter(canEmail);
  const allSelected = emailable.length > 0 && emailable.every((r) => selected.has(r.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(emailable.slice(0, 50).map((r) => r.id)));

  const closeEmailDialog = () => {
    setEmailTargets(null);
    setEmailMessage('');
  };

  const submitEmail = async () => {
    if (!emailTargets || emailTargets.length === 0) return;
    setSendingEmail(true);
    try {
      const res = await fetch('/api/admin/orders/recovery-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: emailTargets.map((r) => r.id), message: emailMessage }),
      });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        if (d.sent > 0) toast.success(`Email trimis la ${d.sent} ${d.sent === 1 ? 'client' : 'clienți'}`);
        const notSent = (d.results as Array<{ status: string; reason?: string }>).filter((r) => r.status !== 'sent');
        if (notSent.length > 0) {
          const reasons = [...new Set(notSent.map((r) => r.reason).filter(Boolean))].join('; ');
          toast.warning(`${notSent.length} netrimise: ${reasons}`, { duration: 10000 });
        }
        closeEmailDialog();
        fetchRows();
      } else {
        toast.error(json.error || 'Eroare la trimitere');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Phone className="h-6 w-6" />
            Recuperare telefonică
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? 'client' : 'clienți'} de sunat (ultimele 30 zile, un rând per email) · prioritate:
            telefon străin + stare civilă, apoi cele din ultimele 24 h, apoi cine a completat mai mult.
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

      {kpi && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-slate-500">Apeluri</div>
            <div className="text-xl font-bold text-slate-900">{kpi.calls7} <span className="text-sm font-normal text-slate-500">în 7 zile</span></div>
            <div className="text-xs text-slate-500">{kpi.calls30} în 30 de zile</div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="text-xs text-green-800">Au plătit după apel</div>
            <div className="text-xl font-bold text-green-900">{kpi.recovered} {kpi.recovered === 1 ? 'client' : 'clienți'}</div>
            <div className="text-xs text-green-800">{fmtLei(kpi.recoveredLei)} lei recuperați (90 de zile)</div>
          </div>
          <div className={`rounded-lg border p-3 ${kpi.unpaidNoCall7 > 0 ? 'border-amber-200 bg-amber-50' : 'bg-white'}`}>
            <div className="text-xs text-amber-800">Nesunate, ultimele 7 zile</div>
            <div className="text-xl font-bold text-amber-900">{kpi.unpaidNoCall7}</div>
            <div className="text-xs text-amber-800">comenzi neplătite fără apel</div>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-slate-500">Rata de recuperare</div>
            <div className="text-xl font-bold text-slate-900">
              {kpi.calls30 > 0 ? `${Math.round((kpi.recovered / kpi.calls30) * 100)}%` : '—'}
            </div>
            <div className="text-xs text-slate-500">clienți care au plătit / apeluri în 30 de zile</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant={view === 'open' ? 'default' : 'outline'} size="sm" onClick={() => setView('open')}>
          De sunat ({rows.length})
        </Button>
        <Button variant={view === 'recovered' ? 'default' : 'outline'} size="sm" onClick={() => setView('recovered')}>
          ✅ Recuperate ({recovered.length})
        </Button>
        {view === 'open' && selected.size > 0 && (
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => setEmailTargets(rows.filter((r) => selected.has(r.id)))}
          >
            <Mail className="mr-1 h-4 w-4" />
            Trimite email la {selected.size} {selected.size === 1 ? 'client' : 'clienți'}
          </Button>
        )}
      </div>

      {view === 'recovered' && (
        <div className="rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-slate-500">
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Serviciu sunat</th>
                <th className="px-3 py-2">Apel</th>
                <th className="px-3 py-2">A plătit</th>
                <th className="px-3 py-2 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {recovered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">
                    Niciun client recuperat în ultimele 90 de zile.
                  </td>
                </tr>
              ) : (
                recovered.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">
                        {[r.firstName, r.lastName].filter(Boolean).join(' ') || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </td>
                    <td className="px-3 py-2">{r.serviceName}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {fmtDate(r.phoneContactedAt)}
                      {r.phoneContactedBy ? ` · ${r.phoneContactedBy}` : ''}
                      {r.phoneContactNotes && (
                        <div className="max-w-[220px] truncate" title={r.phoneContactNotes}>{r.phoneContactNotes}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-xs font-semibold text-green-800">
                        ✅ A plătit după apel · {fmtLei(r.paidTotalRon)} lei · {r.paidOrderRef}
                      </span>
                      <div className="text-[11px] text-muted-foreground">pe {fmtDate(r.paidAt)}</div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <a
                        href={`/admin/orders/${r.paidOrderId}`}
                        className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs hover:bg-slate-50"
                        title="Deschide comanda plătită"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className={`rounded-lg border bg-white ${view === 'open' ? '' : 'hidden'}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-slate-500">
              <th className="w-8 px-3 py-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={emailable.length === 0}
                  title="Bifează toți cărora li se poate scrie (cel mult 50)"
                />
              </th>
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
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-3 py-2"><Skeleton className="h-5 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                  Nimic de sunat acum — coada e goală.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelected(r.id)}
                      disabled={!canEmail(r)}
                      title={!r.email ? 'Fără email' : emailedRecently(r) ? 'I s-a scris în ultimele 24 h' : 'Bifează pentru email'}
                    />
                  </td>
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
                      {r.duplicateCount > 1 && (
                        <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-600" title={`${r.duplicateCount} comenzi începute de pe acest email`}>
                          ×{r.duplicateCount}
                        </span>
                      )}
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
                  <td className="px-3 py-2 text-muted-foreground">
                    {r.freshness === 0 ? <span className="font-medium text-green-700">{timeAgo(r.createdAt)}</span> : timeAgo(r.createdAt)}
                  </td>
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
                    {r.manualRecoveryEmailAt ? (
                      <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-blue-700">
                        <Mail className="h-3.5 w-3.5" />
                        email {fmtDate(r.manualRecoveryEmailAt)}
                        {r.manualRecoveryEmailBy ? ` · ${r.manualRecoveryEmailBy}` : ''}
                      </div>
                    ) : r.recoveryEmailStep >= 3 ? (
                      <div className="mt-0.5 text-xs font-medium text-amber-700">2 emailuri fără răspuns</div>
                    ) : null}
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
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canEmail(r)}
                        title={!r.email ? 'Fără email' : emailedRecently(r) ? 'I s-a scris în ultimele 24 h' : 'Trimite email fără cupon'}
                        onClick={() => setEmailTargets([r])}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
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

      <Dialog open={!!emailTargets} onOpenChange={(o) => !o && closeEmailDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Trimite email de recuperare</DialogTitle>
            <DialogDescription>
              {emailTargets && emailTargets.length === 1
                ? `${[emailTargets[0].firstName, emailTargets[0].lastName].filter(Boolean).join(' ') || 'Client'} · ${emailTargets[0].serviceName}`
                : `${emailTargets?.length ?? 0} clienți`}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            Emailul pleacă semnat cu prenumele tău, fără cupon: îi spune clientului la ce pas s-a oprit, că datele lui sunt
            păstrate și că poate răspunde direct (răspunsul vine pe contact@) sau pe WhatsApp. Are butonul „Reia comanda”.
          </div>
          <Textarea
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            placeholder="Opțional: un rând de la tine (ex: „Dacă ai o întrebare despre termen sau livrare, răspunde-mi aici și revin azi.”)"
            rows={3}
            maxLength={1000}
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeEmailDialog} disabled={sendingEmail}>
              Anulează
            </Button>
            <Button onClick={submitEmail} disabled={sendingEmail}>
              {sendingEmail ? 'Se trimite...' : 'Trimite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
