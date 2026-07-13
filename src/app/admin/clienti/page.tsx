'use client';

/**
 * /admin/clienti — registrul de clienți & lead-uri (tabela `contacts`).
 * Import istoric WPForms + sync automat la fiecare comandă plătită.
 * GDPR: doar clienții confirmați (is_customer) sunt eligibili pentru
 * comunicări comerciale (soft opt-in, cu dezabonare).
 */

import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Users, Download, Search, Loader2 } from 'lucide-react';

interface ContactRow {
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  sources: string[];
  services: string[];
  is_customer: boolean;
  marketing_status: string;
  orders_count: number;
  total_spent_ron: number;
  last_activity_at: string | null;
}

const SERVICE_OPTIONS = [
  ['', 'Toate serviciile'],
  ['cazier-judiciar', 'Cazier judiciar'],
  ['cazier-fiscal', 'Cazier fiscal'],
  ['extras-carte-funciara', 'Extras carte funciară'],
  ['certificat-constatator', 'Certificat constatator'],
  ['certificat-nastere', 'Certificat naștere'],
  ['certificat-casatorie', 'Certificat căsătorie'],
] as const;

export default function AdminClientiPage() {
  const [q, setQ] = useState('');
  const [service, setService] = useState('');
  const [customer, setCustomer] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // defer the synchronous setState out of the effect's sync body (lint rule)
    await Promise.resolve();
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (q.trim()) params.set('q', q.trim());
    if (service) params.set('service', service);
    if (customer) params.set('customer', customer);
    const res = await fetch(`/api/admin/contacts?${params}`);
    const json = await res.json();
    if (json.success) {
      setRows(json.data.contacts);
      setTotal(json.data.total);
    }
    setLoading(false);
  }, [q, service, customer, page]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = () => {
    const params = new URLSearchParams({ format: 'csv' });
    if (q.trim()) params.set('q', q.trim());
    if (service) params.set('service', service);
    if (customer) params.set('customer', customer);
    window.open(`/api/admin/contacts?${params}`, '_blank');
  };

  const pages = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" /> Clienți & lead-uri
          <span className="text-sm font-normal text-muted-foreground">({total.toLocaleString('ro-RO')})</span>
        </h1>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-1" /> Export CSV (filtrul curent)
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Caută email / nume / telefon"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={service || 'all'} onValueChange={(v) => { setService(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SERVICE_OPTIONS.map(([v, label]) => (
              <SelectItem key={v || 'all'} value={v || 'all'}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={customer || 'all'} onValueChange={(v) => { setCustomer(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toți</SelectItem>
            <SelectItem value="1">Doar clienți (au plătit)</SelectItem>
            <SelectItem value="0">Doar lead-uri</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        GDPR: comunicări comerciale doar către <strong>clienți</strong> (soft opt-in — servicii similare,
        cu dezabonare în fiecare email). Lead-urile (formular fără plată) nu primesc marketing.
      </p>

      <div className="rounded-lg border overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Nume</th>
              <th className="px-3 py-2.5">Telefon</th>
              <th className="px-3 py-2.5">Servicii</th>
              <th className="px-3 py-2.5">Tip</th>
              <th className="px-3 py-2.5 text-right">Comenzi</th>
              <th className="px-3 py-2.5 text-right">Total RON</th>
              <th className="px-3 py-2.5">Ultima activitate</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-neutral-400">
                <Loader2 className="h-5 w-5 animate-spin inline" />
              </td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-neutral-400">Niciun rezultat.</td></tr>
            ) : rows.map((c) => (
              <tr key={c.email} className="hover:bg-neutral-50">
                <td className="px-3 py-2 font-medium">{c.email}</td>
                <td className="px-3 py-2">{[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}</td>
                <td className="px-3 py-2 text-neutral-500">{c.phone || '—'}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {c.services.slice(0, 3).map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                    ))}
                    {c.services.length > 3 && <span className="text-xs text-neutral-400">+{c.services.length - 3}</span>}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {c.is_customer
                    ? <Badge className="bg-green-100 text-green-800 border-green-200">client</Badge>
                    : <Badge variant="outline" className="text-neutral-500">lead</Badge>}
                </td>
                <td className="px-3 py-2 text-right">{c.orders_count || '—'}</td>
                <td className="px-3 py-2 text-right">{c.total_spent_ron ? Number(c.total_spent_ron).toFixed(2) : '—'}</td>
                <td className="px-3 py-2 text-neutral-500">
                  {c.last_activity_at ? new Date(c.last_activity_at).toLocaleDateString('ro-RO') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">Pagina {page} din {pages.toLocaleString('ro-RO')}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Înapoi</Button>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Înainte</Button>
        </div>
      </div>
    </div>
  );
}
