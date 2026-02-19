'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  ShieldAlert,
  Trash2,
  Loader2,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';
import type { NumberRangeWithStats, NumberRegistryEntry } from '@/types/number-registry';

// ──────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────

export default function AdminRegistruPage() {
  const { hasPermission } = useAdminPermissions();

  if (!hasPermission('settings.manage')) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acces interzis</h2>
        <p className="text-muted-foreground max-w-md">
          Nu ai permisiunea de a gestiona registrul de numere. Contacteaza un
          administrator pentru a obtine acces.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Registru</h1>
        <p className="text-sm text-muted-foreground">
          Evidenta numere contracte si imputerniciri (Baroul Satu Mare)
        </p>
      </div>

      <NumberRegistryContent />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Number Registry Content
// ──────────────────────────────────────────────────────────────

function NumberRegistryContent() {
  // Ranges
  const [ranges, setRanges] = useState<NumberRangeWithStats[]>([]);
  const [rangesLoading, setRangesLoading] = useState(true);

  // Registry journal
  const [registryEntries, setRegistryEntries] = useState<(NumberRegistryEntry & { friendly_order_id?: string | null })[]>([]);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 50, total: 0, total_pages: 0 });

  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterSource, setFilterSource] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Dialogs
  const [addRangeOpen, setAddRangeOpen] = useState(false);
  const [addManualOpen, setAddManualOpen] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [voidEntryId, setVoidEntryId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // Forms
  const [newRange, setNewRange] = useState({
    type: 'contract' as 'contract' | 'delegation',
    year: new Date().getFullYear(),
    range_start: 0,
    range_end: 0,
    series: 'SM',
    notes: '',
  });
  const [manualEntry, setManualEntry] = useState({
    type: 'contract' as 'contract' | 'delegation',
    client_name: '',
    client_email: '',
    client_cnp: '',
    client_cui: '',
    service_type: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [saving, setSaving] = useState(false);

  // ── Group entries by order for display ─────────────────────

  interface GroupedOrderRow {
    orderId: string;
    friendlyOrderId: string;
    contractNumber: number | null;
    contractEntryId: string | null;
    contractDocS3Key: string | null;
    delegationNumbers: { number: number; series: string | null; id: string; s3Key: string | null }[];
    date: string;
    clientName: string;
    clientCnp: string | null;
    clientCui: string | null;
    serviceType: string | null;
    amount: number | null;
    source: string;
    voided: boolean;
    voidedEntryIds: string[];
  }

  const groupedData = useMemo(() => {
    const orderGroups = new Map<string, GroupedOrderRow>();
    const manualEntries: (NumberRegistryEntry & { friendly_order_id?: string | null })[] = [];

    for (const entry of registryEntries) {
      if (!entry.order_id) {
        manualEntries.push(entry);
        continue;
      }

      const key = entry.order_id;
      if (!orderGroups.has(key)) {
        orderGroups.set(key, {
          orderId: entry.order_id,
          friendlyOrderId: entry.friendly_order_id || '-',
          contractNumber: null,
          contractEntryId: null,
          contractDocS3Key: null,
          delegationNumbers: [],
          date: entry.date,
          clientName: entry.client_name,
          clientCnp: entry.client_cnp,
          clientCui: entry.client_cui,
          serviceType: entry.service_type,
          amount: entry.amount,
          source: entry.source,
          voided: false,
          voidedEntryIds: [],
        });
      }

      const group = orderGroups.get(key)!;
      if (entry.type === 'contract') {
        group.contractNumber = entry.number;
        group.contractEntryId = entry.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        group.contractDocS3Key = (entry as any).document_s3_key || null;
      } else {
        group.delegationNumbers.push({
          number: entry.number,
          series: entry.series,
          id: entry.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          s3Key: (entry as any).document_s3_key || null,
        });
      }
      if (entry.voided_at) {
        group.voidedEntryIds.push(entry.id);
      }
    }

    // Mark group as voided if ALL entries are voided
    for (const group of orderGroups.values()) {
      const totalEntries = (group.contractNumber !== null ? 1 : 0) + group.delegationNumbers.length;
      group.voided = totalEntries > 0 && group.voidedEntryIds.length === totalEntries;
    }

    // Apply type filter to grouped entries
    let filteredGroups = Array.from(orderGroups.values());
    if (filterType === 'contract') {
      filteredGroups = filteredGroups.filter(g => g.contractNumber !== null);
    } else if (filterType === 'delegation') {
      filteredGroups = filteredGroups.filter(g => g.delegationNumbers.length > 0);
    }

    return { orderGroups: filteredGroups, manualEntries };
  }, [registryEntries, filterType]);

  // ── Data fetching ──────────────────────────────────────────

  const fetchRanges = useCallback(async () => {
    setRangesLoading(true);
    try {
      const params = new URLSearchParams({ year: String(filterYear) });
      const res = await fetch(`/api/admin/settings/number-ranges?${params}`);
      const json = await res.json();
      if (json.success) setRanges(json.data);
    } catch (err) { console.error('Failed to fetch ranges:', err); }
    finally { setRangesLoading(false); }
  }, [filterYear]);

  const fetchRegistry = useCallback(async (page = 1) => {
    setRegistryLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(filterYear),
        page: String(page),
        per_page: '50',
      });
      if (filterType) params.set('type', filterType);
      if (filterSource) params.set('source', filterSource);
      if (filterSearch) params.set('search', filterSearch);
      const res = await fetch(`/api/admin/settings/number-registry?${params}`);
      const json = await res.json();
      if (json.success) {
        setRegistryEntries(json.data);
        setPagination(json.pagination);
      }
    } catch (err) { console.error('Failed to fetch registry:', err); }
    finally { setRegistryLoading(false); }
  }, [filterYear, filterType, filterSource, filterSearch]);

  useEffect(() => { fetchRanges(); }, [fetchRanges]);
  useEffect(() => { fetchRegistry(); }, [fetchRegistry]);

  // ── Action handlers ────────────────────────────────────────

  const handleAddRange = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/number-ranges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRange),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Interval adaugat cu succes');
        setAddRangeOpen(false);
        setNewRange({ type: 'contract', year: new Date().getFullYear(), range_start: 0, range_end: 0, series: 'SM', notes: '' });
        fetchRanges();
      } else {
        toast.error(json.error || 'Eroare la adaugarea intervalului');
      }
    } catch { toast.error('Eroare de retea'); }
    finally { setSaving(false); }
  };

  const handleManualEntry = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/number-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualEntry,
          amount: manualEntry.amount ? parseFloat(manualEntry.amount) : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const nr = json.data[0];
        toast.success(`Numar alocat: ${nr.allocated_number} (${nr.allocated_series ? nr.allocated_series : ''}${manualEntry.type === 'contract' ? 'Contract' : 'Delegatie'} ${nr.allocated_year})`);
        setAddManualOpen(false);
        setManualEntry({ type: 'contract', client_name: '', client_email: '', client_cnp: '', client_cui: '', service_type: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
        fetchRegistry();
        fetchRanges(); // Refresh ranges too (available count changed)
      } else {
        toast.error(json.error || 'Eroare la alocarea numarului');
      }
    } catch { toast.error('Eroare de retea'); }
    finally { setSaving(false); }
  };

  const handleVoid = async () => {
    if (!voidEntryId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/number-registry/${voidEntryId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: voidReason }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Numar anulat cu succes');
        setVoidDialogOpen(false);
        setVoidEntryId(null);
        setVoidReason('');
        fetchRegistry();
      } else {
        toast.error(json.error || 'Eroare la anularea numarului');
      }
    } catch { toast.error('Eroare de retea'); }
    finally { setSaving(false); }
  };

  const handleExport = async () => {
    const params = new URLSearchParams({ year: String(filterYear) });
    if (filterType) params.set('type', filterType);
    if (filterSource) params.set('source', filterSource);
    if (filterSearch) params.set('search', filterSearch);
    window.open(`/api/admin/settings/number-registry/export?${params}`, '_blank');
  };

  const handleArchiveRange = async (rangeId: string) => {
    try {
      const res = await fetch(`/api/admin/settings/number-ranges/${rangeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Interval arhivat');
        fetchRanges();
      } else {
        toast.error(json.error || 'Eroare');
      }
    } catch { toast.error('Eroare de retea'); }
  };

  const handleActivateRange = async (rangeId: string) => {
    try {
      const res = await fetch(`/api/admin/settings/number-ranges/${rangeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Interval reactivat');
        fetchRanges();
      } else {
        toast.error(json.error || 'Eroare');
      }
    } catch { toast.error('Eroare de retea'); }
  };

  const handleDocDownload = async (s3Key: string) => {
    try {
      const res = await fetch(`/api/upload/download?key=${encodeURIComponent(s3Key)}`);
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // ── Helpers ────────────────────────────────────────────────

  function getProgressColor(percent: number): string {
    if (percent < 70) return 'bg-green-500';
    if (percent < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Alerts: ranges near exhaustion */}
      {ranges.filter(r => r.status === 'active' && r.usage_percent >= 90).length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-4">
            {ranges.filter(r => r.status === 'active' && r.usage_percent >= 90).map(r => (
              <div key={r.id} className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Interval {r.type === 'contract' ? 'contracte' : 'imputerniciri'} {r.year}:
                  {' '}{r.usage_percent}% utilizat ({r.available} ramase)
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alert: no active contract range for current year */}
      {!rangesLoading && !ranges.some(r => r.type === 'contract' && r.year === new Date().getFullYear() && r.status === 'active') && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <ShieldAlert className="h-4 w-4" />
              <span>Nu exista interval activ pentru contracte {new Date().getFullYear()}!</span>
            </div>
          </CardContent>
        </Card>
      )}
      {!rangesLoading && !ranges.some(r => r.type === 'delegation' && r.year === new Date().getFullYear() && r.status === 'active') && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <ShieldAlert className="h-4 w-4" />
              <span>Nu exista interval activ pentru imputerniciri {new Date().getFullYear()}!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Ranges */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Intervale Numere</CardTitle>
            <CardDescription>Intervale alocate de Baroul Satu Mare</CardDescription>
          </div>
          <Button size="sm" onClick={() => setAddRangeOpen(true)}>
            + Adauga interval
          </Button>
        </CardHeader>
        <CardContent>
          {rangesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : ranges.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nu exista intervale configurate.</p>
          ) : (
            <div className="space-y-4">
              {ranges.map(range => (
                <div key={range.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {range.type === 'contract' ? 'Contracte Asistenta' : 'Imputerniciri'} {range.year}
                        {range.series ? ` (Seria ${range.series})` : ''}
                      </span>
                      <Badge variant={range.status === 'active' ? 'default' : range.status === 'exhausted' ? 'destructive' : 'secondary'}>
                        {range.status === 'active' ? 'Activ' : range.status === 'exhausted' ? 'Epuizat' : 'Arhivat'}
                      </Badge>
                    </div>
                    {range.status === 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => handleArchiveRange(range.id)}>
                        Arhiveaza
                      </Button>
                    )}
                    {range.status === 'archived' && (
                      <Button variant="ghost" size="sm" onClick={() => handleActivateRange(range.id)}>
                        Activeaza
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span>{range.range_start} - {range.range_end}</span>
                    <span>{range.used}/{range.total} utilizate ({range.usage_percent}%)</span>
                    {range.status === 'active' && <span>Urmatorul: {range.next_number}</span>}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(range.usage_percent)}`}
                      style={{ width: `${Math.min(range.usage_percent, 100)}%` }}
                    />
                  </div>
                  {range.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{range.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registry Journal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Jurnal Numere</CardTitle>
            <CardDescription>Evidenta completa a numerelor alocate</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}>
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setAddManualOpen(true)}>
              + Alocare manuala
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              className="border rounded px-3 py-1.5 text-sm"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">Toate tipurile</option>
              <option value="contract">Contract</option>
              <option value="delegation">Delegatie</option>
            </select>
            <Input
              type="number"
              placeholder="An"
              className="w-24"
              value={filterYear}
              onChange={e => setFilterYear(parseInt(e.target.value) || new Date().getFullYear())}
            />
            <select
              className="border rounded px-3 py-1.5 text-sm"
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
            >
              <option value="">Toate sursele</option>
              <option value="platform">Platforma</option>
              <option value="manual">Manual</option>
              <option value="reserved">Rezervat</option>
              <option value="voided">Anulat</option>
            </select>
            <Input
              type="text"
              placeholder="Cauta client..."
              className="w-48"
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          {registryLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : registryEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nu exista inregistrari.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 px-2 font-medium">Comanda</th>
                      <th className="py-2 px-2 font-medium">Nr Contract</th>
                      <th className="py-2 px-2 font-medium">Nr Delegatie</th>
                      <th className="py-2 px-2 font-medium">Serie</th>
                      <th className="py-2 px-2 font-medium">Data</th>
                      <th className="py-2 px-2 font-medium">Client</th>
                      <th className="py-2 px-2 font-medium">CNP/CUI</th>
                      <th className="py-2 px-2 font-medium">Serviciu</th>
                      <th className="py-2 px-2 font-medium">Suma</th>
                      <th className="py-2 px-2 font-medium">Sursa</th>
                      <th className="py-2 px-2 font-medium">Actiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Grouped order rows */}
                    {groupedData.orderGroups.map(group => {
                      const delegationSeries = group.delegationNumbers.length > 0
                        ? group.delegationNumbers[0].series
                        : null;
                      const allEntryIds: { id: string; label: string }[] = [];
                      if (group.contractEntryId && !group.voidedEntryIds.includes(group.contractEntryId)) {
                        allEntryIds.push({ id: group.contractEntryId, label: `Contract ${group.contractNumber}` });
                      }
                      for (const d of group.delegationNumbers) {
                        if (!group.voidedEntryIds.includes(d.id)) {
                          allEntryIds.push({ id: d.id, label: `Delegatie ${d.series || ''}${d.number}` });
                        }
                      }

                      return (
                        <tr
                          key={group.orderId}
                          className={`border-b ${group.voided ? 'bg-red-50 line-through text-muted-foreground' : ''}`}
                        >
                          <td className="py-2 px-2">
                            <a href={`/admin/orders/${group.orderId}`} className="text-blue-600 hover:underline text-xs font-mono">
                              {group.friendlyOrderId}
                            </a>
                          </td>
                          <td className="py-2 px-2 font-mono">
                            {group.contractNumber ?? '-'}
                            {group.contractDocS3Key && (
                              <button
                                onClick={() => handleDocDownload(group.contractDocS3Key!)}
                                className="ml-1.5 inline-flex align-middle text-primary hover:text-primary/70"
                                title="Descarca contract"
                              >
                                <FileDown className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                          <td className="py-2 px-2 font-mono">
                            {group.delegationNumbers.length > 0
                              ? group.delegationNumbers.map((d, idx) => (
                                  <span key={d.id}>
                                    {idx > 0 && ', '}
                                    {d.number}
                                    {d.s3Key && (
                                      <button
                                        onClick={() => handleDocDownload(d.s3Key!)}
                                        className="ml-1 inline-flex align-middle text-primary hover:text-primary/70"
                                        title="Descarca delegatie"
                                      >
                                        <FileDown className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </span>
                                ))
                              : '-'}
                          </td>
                          <td className="py-2 px-2">{delegationSeries || '-'}</td>
                          <td className="py-2 px-2">
                            {new Date(group.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </td>
                          <td className="py-2 px-2">{group.clientName}</td>
                          <td className="py-2 px-2 font-mono text-xs">{group.clientCnp || group.clientCui || '-'}</td>
                          <td className="py-2 px-2">{group.serviceType || '-'}</td>
                          <td className="py-2 px-2">{group.amount ? `${group.amount} RON` : '-'}</td>
                          <td className="py-2 px-2">
                            <Badge variant={
                              group.source === 'platform' ? 'default' :
                              group.source === 'manual' ? 'secondary' :
                              group.source === 'voided' ? 'destructive' : 'outline'
                            }>
                              {group.source === 'platform' ? 'Platforma' :
                               group.source === 'manual' ? 'Manual' :
                               group.source === 'voided' ? 'Anulat' : 'Rezervat'}
                            </Badge>
                          </td>
                          <td className="py-2 px-2">
                            {allEntryIds.length === 1 ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                title={`Anuleaza ${allEntryIds[0].label}`}
                                onClick={() => {
                                  setVoidEntryId(allEntryIds[0].id);
                                  setVoidDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : allEntryIds.length > 1 ? (
                              <div className="flex flex-col gap-1">
                                {allEntryIds.map(e => (
                                  <Button
                                    key={e.id}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-800 h-auto py-0.5 px-1 text-xs justify-start"
                                    title={`Anuleaza ${e.label}`}
                                    onClick={() => {
                                      setVoidEntryId(e.id);
                                      setVoidDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    {e.label}
                                  </Button>
                                ))}
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Manual entries (no order_id) shown individually */}
                    {groupedData.manualEntries.map(entry => (
                      <tr
                        key={entry.id}
                        className={`border-b ${entry.voided_at ? 'bg-red-50 line-through text-muted-foreground' : ''}`}
                      >
                        <td className="py-2 px-2 text-xs text-muted-foreground">-</td>
                        <td className="py-2 px-2 font-mono">
                          {entry.type === 'contract' ? entry.number : '-'}
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {entry.type === 'contract' && (entry as any).document_s3_key && (
                            <button
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              onClick={() => handleDocDownload((entry as any).document_s3_key)}
                              className="ml-1.5 inline-flex align-middle text-primary hover:text-primary/70"
                              title="Descarca contract"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                        <td className="py-2 px-2 font-mono">
                          {entry.type === 'delegation' ? entry.number : '-'}
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {entry.type === 'delegation' && (entry as any).document_s3_key && (
                            <button
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              onClick={() => handleDocDownload((entry as any).document_s3_key)}
                              className="ml-1.5 inline-flex align-middle text-primary hover:text-primary/70"
                              title="Descarca delegatie"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                        <td className="py-2 px-2">{entry.series || '-'}</td>
                        <td className="py-2 px-2">
                          {new Date(entry.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="py-2 px-2">{entry.client_name}</td>
                        <td className="py-2 px-2 font-mono text-xs">{entry.client_cnp || entry.client_cui || '-'}</td>
                        <td className="py-2 px-2">{entry.service_type || '-'}</td>
                        <td className="py-2 px-2">{entry.amount ? `${entry.amount} RON` : '-'}</td>
                        <td className="py-2 px-2">
                          <Badge variant="secondary">Manual</Badge>
                        </td>
                        <td className="py-2 px-2">
                          {!entry.voided_at && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                setVoidEntryId(entry.id);
                                setVoidDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    Pagina {pagination.page} din {pagination.total_pages} ({pagination.total} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchRegistry(pagination.page - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.total_pages}
                      onClick={() => fetchRegistry(pagination.page + 1)}
                    >
                      Urmator
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Range Dialog */}
      <Dialog open={addRangeOpen} onOpenChange={setAddRangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adauga Interval Numere</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tip</Label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={newRange.type} onChange={e => setNewRange({...newRange, type: e.target.value as 'contract' | 'delegation'})}>
                <option value="contract">Contract Asistenta Juridica</option>
                <option value="delegation">Imputernicire Avocatiala</option>
              </select>
            </div>
            <div>
              <Label>An</Label>
              <Input type="number" value={newRange.year} onChange={e => setNewRange({...newRange, year: parseInt(e.target.value) || new Date().getFullYear()})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Numar start</Label>
                <Input type="number" value={newRange.range_start || ''} onChange={e => setNewRange({...newRange, range_start: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <Label>Numar sfarsit</Label>
                <Input type="number" value={newRange.range_end || ''} onChange={e => setNewRange({...newRange, range_end: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            {newRange.range_start > 0 && newRange.range_end >= newRange.range_start && (
              <p className="text-sm text-muted-foreground">
                Interval: {newRange.range_start} - {newRange.range_end} ({newRange.range_end - newRange.range_start + 1} numere)
              </p>
            )}
            {newRange.type === 'delegation' && (
              <div>
                <Label>Seria</Label>
                <Input value={newRange.series} onChange={e => setNewRange({...newRange, series: e.target.value})} placeholder="SM" />
              </div>
            )}
            <div>
              <Label>Note (optional)</Label>
              <Textarea value={newRange.notes} onChange={e => setNewRange({...newRange, notes: e.target.value})} placeholder="Ex: Interval primit ianuarie 2026" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRangeOpen(false)}>Anuleaza</Button>
            <Button onClick={handleAddRange} disabled={saving || newRange.range_start <= 0 || newRange.range_end < newRange.range_start}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Adauga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={addManualOpen} onOpenChange={setAddManualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alocare Manuala Numar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tip</Label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={manualEntry.type} onChange={e => setManualEntry({...manualEntry, type: e.target.value as 'contract' | 'delegation'})}>
                <option value="contract">Contract</option>
                <option value="delegation">Imputernicire</option>
              </select>
            </div>
            <div>
              <Label>Nume client *</Label>
              <Input value={manualEntry.client_name} onChange={e => setManualEntry({...manualEntry, client_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CNP</Label>
                <Input value={manualEntry.client_cnp} onChange={e => setManualEntry({...manualEntry, client_cnp: e.target.value})} maxLength={13} />
              </div>
              <div>
                <Label>CUI</Label>
                <Input value={manualEntry.client_cui} onChange={e => setManualEntry({...manualEntry, client_cui: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={manualEntry.client_email} onChange={e => setManualEntry({...manualEntry, client_email: e.target.value})} />
            </div>
            <div>
              <Label>Serviciu / Descriere</Label>
              <Input value={manualEntry.service_type} onChange={e => setManualEntry({...manualEntry, service_type: e.target.value})} placeholder="Ex: Consultanta juridica" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Suma (RON)</Label>
                <Input type="number" step="0.01" value={manualEntry.amount} onChange={e => setManualEntry({...manualEntry, amount: e.target.value})} />
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={manualEntry.date} onChange={e => setManualEntry({...manualEntry, date: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddManualOpen(false)}>Anuleaza</Button>
            <Button onClick={handleManualEntry} disabled={saving || !manualEntry.client_name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Aloca numar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Dialog */}
      <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anulare Numar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Numarul anulat nu va putea fi reutilizat. Aceasta actiune este ireversibila.
            </p>
            <div>
              <Label>Motiv anulare</Label>
              <Textarea value={voidReason} onChange={e => setVoidReason(e.target.value)} placeholder="Ex: Comanda anulata de client" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setVoidDialogOpen(false); setVoidEntryId(null); setVoidReason(''); }}>Anuleaza</Button>
            <Button variant="destructive" onClick={handleVoid} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Anuleaza numarul
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
