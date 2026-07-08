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
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Download, RefreshCw, Search } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  consent_text: string | null;
  created_at: string | null;
  unsubscribed_at: string | null;
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Mail className="h-6 w-6" />
            Marketing — Abonați newsletter
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? 'abonat' : 'abonați'} · doar persoane cu consimțământ explicit (GDPR).
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
