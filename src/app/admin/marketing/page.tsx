'use client';

/**
 * /admin/marketing — Abonați newsletter (GDPR).
 * Lists everyone who explicitly opted in to marketing emails (calculators
 * popup, contact form, order wizard), with status + source + consent proof.
 * Export CSV for campaigns. Unsubscribed rows are kept (proof of consent) but
 * clearly marked — NEVER email those.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Download, RefreshCw, Search, Send } from 'lucide-react';
import { toast } from 'sonner';
import { LifecycleEmailsCard } from './lifecycle-card';
import { CampaignsCard } from './campaigns-card';
import { MarketingKpisCard } from './kpis-card';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  consent_text: string | null;
  created_at: string | null;
  unsubscribed_at: string | null;
}

interface WarmupStats {
  total: number;
  sent: number;
  skipped: number;
  remaining: number;
  unsubscribed: number;
}

interface WarmupSettings {
  enabled: boolean;
  dailyBatchSize: number;
}

function WarmupCampaignCard() {
  const [stats, setStats] = useState<WarmupStats | null>(null);
  const [settings, setSettings] = useState<WarmupSettings>({ enabled: false, dailyBatchSize: 25 });
  const [batchInput, setBatchInput] = useState('25');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/marketing/warmup-stats'),
        fetch('/api/admin/settings'),
      ]);
      const statsJson = await statsRes.json();
      const settingsJson = await settingsRes.json();
      if (statsJson.success) setStats(statsJson.data);
      const s: WarmupSettings = settingsJson.data?.warmup_campaign ?? { enabled: false, dailyBatchSize: 25 };
      setSettings(s);
      setBatchInput(String(s.dailyBatchSize));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (next: WarmupSettings) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'warmup_campaign', value: next }),
      });
      const json = await res.json();
      if (json.success) {
        setSettings(next);
        toast.success('Salvat');
      } else {
        toast.error(json.error || 'Eroare la salvare');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setSaving(false);
    }
  };

  const pct = stats && stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Send className="h-5 w-5" />
            Campanie warm-up (registru 72k contacte)
          </h2>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Reîncarcă
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Trimite câte un email de reactivare, o singură dată per contact, din registrul intern
          (<a href="/admin/clienti" className="text-primary-700 underline">/admin/clienti</a>) — treptat,
          nu într-un singur val. Detalii: <code>docs/marketing/email-marketing-plan-2026-09.md</code>.
        </p>

        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-lg border bg-slate-50 p-3">
              <div className="text-xs text-muted-foreground">Total contacte</div>
              <div className="text-xl font-bold text-slate-900">{stats.total.toLocaleString('ro-RO')}</div>
            </div>
            <div className="rounded-lg border bg-slate-50 p-3">
              <div className="text-xs text-muted-foreground">Deja trimise</div>
              <div className="text-xl font-bold text-green-700">{stats.sent.toLocaleString('ro-RO')} ({pct}%)</div>
            </div>
            <div className="rounded-lg border bg-slate-50 p-3">
              <div className="text-xs text-muted-foreground">Rămase</div>
              <div className="text-xl font-bold text-slate-900">{stats.remaining.toLocaleString('ro-RO')}</div>
            </div>
            <div className="rounded-lg border bg-slate-50 p-3" title="Fără email valid / domeniu nelivrabil / respinse de Resend">
              <div className="text-xs text-muted-foreground">Sărite</div>
              <div className="text-xl font-bold text-slate-500">{stats.skipped.toLocaleString('ro-RO')}</div>
            </div>
            <div className="rounded-lg border bg-slate-50 p-3">
              <div className="text-xs text-muted-foreground">Dezabonați</div>
              <div className="text-xl font-bold text-red-700">{stats.unsubscribed.toLocaleString('ro-RO')}</div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => save({ ...settings, enabled: checked })}
              disabled={saving}
            />
            <span className="text-sm font-medium">
              {settings.enabled ? 'Activă — cronul trimite zilnic' : 'Oprită — implicit, nimic nu se trimite'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="warmup-batch" className="text-sm text-muted-foreground">Pe zi:</label>
            <Input
              id="warmup-batch"
              type="number"
              min={1}
              max={2000}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              onBlur={() => {
                const n = parseInt(batchInput, 10);
                if (Number.isInteger(n) && n >= 1 && n <= 2000 && n !== settings.dailyBatchSize) {
                  save({ ...settings, dailyBatchSize: n });
                } else {
                  setBatchInput(String(settings.dailyBatchSize));
                }
              }}
              className="w-24"
              disabled={saving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminMarketingPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'active' | 'unsubscribed' | 'all'>('active');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ status });
      if (search) p.set('search', search);
      const res = await fetch(`/api/admin/marketing/subscribers?${p}`);
      const json = await res.json();
      if (json.success) setRows(json.data || []);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const exportCsv = () => {
    const p = new URLSearchParams({ status, format: 'csv' });
    if (search) p.set('search', search);
    window.location.href = `/api/admin/marketing/subscribers?${p}`;
  };

  const chip = (v: 'active' | 'unsubscribed' | 'all', label: string) => (
    <button
      type="button"
      onClick={() => setStatus(v)}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
        status === v
          ? 'border-slate-400 bg-slate-100 text-slate-900'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <MarketingKpisCard />
      <LifecycleEmailsCard />
      <CampaignsCard />
      <WarmupCampaignCard />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Mail className="h-6 w-6" />
            Marketing — Abonați newsletter
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? 'abonat' : 'abonați'} · doar persoane cu consimțământ explicit (GDPR).{' '}
            <a href="/admin/clienti" className="text-primary-700 underline">Registrul complet de clienți & lead-uri →</a>
            Cei dezabonați rămân în listă ca dovadă, dar NU li se trimit emailuri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="mr-1 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={fetchRows} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Reîncarcă
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {chip('active', 'Activi')}
        {chip('unsubscribed', 'Dezabonați')}
        {chip('all', 'Toți')}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Caută email sau nume…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
            onBlur={() => searchInput !== search && setSearch(searchInput)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nume</TableHead>
              <TableHead>Sursă</TableHead>
              <TableHead>Abonat la</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Niciun abonat încă. Abonații apar când clienții bifează opt-in-ul pe
                  calculatoare, formularul de contact sau wizard.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.email}</TableCell>
                  <TableCell className="text-sm">{r.name || '—'}</TableCell>
                  <TableCell>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                      {r.source || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleDateString('ro-RO', {
                          day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Bucharest',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {r.unsubscribed_at ? (
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700">Dezabonat</span>
                    ) : (
                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">Activ</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
