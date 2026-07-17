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
  Pencil,
  RotateCcw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';
import type { NumberRangeWithStats, NumberRegistryEntry } from '@/types/number-registry';

// ──────────────────────────────────────────────────────────────
// Order search (manual allocation dialog)
// ──────────────────────────────────────────────────────────────

interface OrderSearchRow {
  orderNumber: string;
  friendlyId: string | null;
  clientName: string;
  email: string;
  cnp: string;
  cui: string;
  serviceName: string;
  total: number | null;
  paid: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrderSearchRow(o: any): OrderSearchRow {
  const cd = o.customer_data || {};
  const contact = cd.contact || {};
  const personal = cd.personal || cd.personalData || {};
  const billing = cd.billing || {};
  const name =
    `${contact.firstName || personal.firstName || ''} ${contact.lastName || personal.lastName || ''}`.trim() ||
    billing.companyName || '';
  return {
    orderNumber: o.order_number,
    friendlyId: o.friendly_order_id || null,
    clientName: name,
    email: contact.email || '',
    cnp: String(personal.cnp || billing.cnp || ''),
    cui: String(billing.cui || ''),
    serviceName: o.services?.name || '',
    total: o.total_price ?? null,
    paid: o.payment_status === 'paid',
  };
}

// ──────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────

export default function AdminRegistruPage() {
  const { hasPermission } = useAdminPermissions();

  if (!hasPermission('registry.manage')) {
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

      {/* Info: registru CENTRAL partajat, alocare automată post-plată */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 space-y-1.5">
        <p className="font-semibold">📖 Registru CENTRAL — partajat pe 3 platforme (din 09.07.2026)</p>
        <ul className="list-disc pl-5 space-y-1 text-blue-800">
          <li>
            Numerele se alocă <strong>automat, DOAR după plata reușită</strong>, pe toate platformele:
            eghiseul.ro, cazierjudiciaronline.com și ecazier.ro (coloana Comanda arată platforma pentru CJO/ecazier).
          </li>
          <li>
            <strong>Nu se mai ține evidența în Google Sheets</strong> — acest jurnal este registrul oficial;
            exportul CSV de aici merge la raportarea către Barou.
          </li>
          <li>
            Intervale oficiale 2026 (seria SM): contracte <strong>003551–006550</strong>, împuterniciri <strong>005051–008050</strong>.
            La comenzile neplătite NU se emit numere; la regenerare de documente numărul se refolosește (nu se irosește).
          </li>
          <li>
            Dacă o alocare eșuează (registru indisponibil), comanda se procesează normal și numărul se alocă
            automat la următoarea rulare a cronului orar — vezi nota de pe comandă.
          </li>
        </ul>
      </div>

      <NumberRegistryContent />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Number Registry Content
// ──────────────────────────────────────────────────────────────

function NumberRegistryContent() {
  // Avocata (rol 'avocat') alocă de regulă pentru clienții EI personali —
  // formularul ei sare direct pe modul simplu (nume + CNP, fără comandă).
  const { user } = useAdminPermissions();
  const isAvocat = user.role === 'avocat';

  // Ranges
  const [ranges, setRanges] = useState<NumberRangeWithStats[]>([]);
  const [rangesLoading, setRangesLoading] = useState(true);

  // Registry journal (central registry rows, enriched by the API with
  // friendly_order_id + local order_id UUID for eghiseul rows)
  const [registryEntries, setRegistryEntries] = useState<(NumberRegistryEntry & { friendly_order_id?: string | null; order_id?: string | null })[]>([]);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, per_page: 50, total: 0, total_pages: 0 });

  // Filters
  const [showArchived, setShowArchived] = useState(false);
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
    type: 'contract_delegatie' as string,
    client_name: '',
    client_email: '',
    client_cnp: '',
    client_cui: '',
    service_type: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    platform: '',
    order_ref: '',
    linked_contract_number: '',
  });
  // Modul dialogului de alocare manuală: client PERSONAL al avocatei (doar
  // nume + CNP, marcat „Client avocat", fără comandă) vs client de platformă.
  const [personalClient, setPersonalClient] = useState(isAvocat);

  const [saving, setSaving] = useState(false);

  // Order search inside the manual-allocation dialog — the team types a
  // client name / order number / email, picks the order, and every relevant
  // field prefills from the DB (no more copy-paste from the orders list).
  const [orderSearch, setOrderSearch] = useState('');
  const [orderResults, setOrderResults] = useState<OrderSearchRow[]>([]);
  const [orderSearching, setOrderSearching] = useState(false);
  const [pickedOrder, setPickedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!addManualOpen) return;
    const q = orderSearch.trim();
    if (q.length < 3) {
      setOrderResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setOrderSearching(true);
      try {
        const res = await fetch(`/api/admin/orders/list?search=${encodeURIComponent(q)}&limit=8`);
        const json = await res.json();
        if (json.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setOrderResults((json.data as any[]).map((o) => mapOrderSearchRow(o)));
        }
      } catch { /* keep last results */ }
      finally { setOrderSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [orderSearch, addManualOpen]);

  const pickOrder = (o: OrderSearchRow) => {
    setManualEntry((prev) => ({
      ...prev,
      client_name: o.clientName || prev.client_name,
      client_email: o.email || prev.client_email,
      client_cnp: o.cnp || '',
      client_cui: o.cui || '',
      service_type: o.serviceName || prev.service_type,
      amount: o.total != null ? String(o.total) : prev.amount,
      platform: 'eghiseul',
      order_ref: o.orderNumber,
    }));
    setPickedOrder(o.friendlyId || o.orderNumber);
    setOrderResults([]);
    setOrderSearch('');
  };

  // Edit entry dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<{
    id: string; type: string; number: string; series: string;
    client_name: string; client_cnp: string; client_cui: string;
    service_type: string; description: string; amount: string; date: string;
  } | null>(null);

  // Numerele se afișează EXACT ca pe documente: padded la 6 cifre (005771).
  const fmtNr = (n: number | null | undefined) =>
    n === null || n === undefined ? '-' : String(n).padStart(6, '0');

  // ── Group entries by order for display ─────────────────────

  interface GroupedOrderRow {
    /** Cheia unică de grup (platform:order_ref) — React key; friendlyOrderId
     *  e doar de AFIȘARE și poate fi '-' pe importurile din Sheets. */
    groupKey: string;
    orderId: string | null;
    platform: string | null;
    friendlyOrderId: string;
    contractNumber: number | null;
    contractEntryId: string | null;
    contractDocS3Key: string | null;
    delegationNumbers: { number: number; series: string | null; id: string; s3Key: string | null; serviceType: string | null }[];
    date: string;
    clientName: string;
    clientCnp: string | null;
    clientCui: string | null;
    serviceType: string | null;
    amount: number | null;
    source: string;
    /** Client personal al avocatei (marcat la alocarea manuală simplă). */
    avocatClient: boolean;
    voided: boolean;
    voidedEntryIds: string[];
  }

  const groupedData = useMemo(() => {
    const orderGroups = new Map<string, GroupedOrderRow>();
    const manualEntries: (NumberRegistryEntry & { friendly_order_id?: string | null })[] = [];

    for (const entry of registryEntries) {
      // Central registry rows are keyed by (platform, order_ref); rows with
      // no order_ref are manual/personal entries.
      if (!entry.order_ref) {
        manualEntries.push(entry);
        continue;
      }

      const key = `${entry.platform ?? ''}:${entry.order_ref}`;
      if (!orderGroups.has(key)) {
        // SHEET-XXXXXX = grupare sintetică pentru importul din Google Sheets;
        // MANUAL-XXXXXX = grupare sintetică pentru alocările manuale combo
        // (contract + delegație legate) — nu sunt comenzi reale.
        const isSyntheticRef = /^(SHEET|MANUAL)-/.test(entry.order_ref || '');
        orderGroups.set(key, {
          groupKey: key,
          orderId: entry.order_id ?? null,
          platform: entry.platform ?? null,
          friendlyOrderId: isSyntheticRef ? '-' : (entry.friendly_order_id || entry.order_ref || '-'),
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
          avocatClient: false,
          voided: false,
          voidedEntryIds: [],
        });
      }

      const group = orderGroups.get(key)!;
      if ((entry.description || '').startsWith('Client avocat')) group.avocatClient = true;
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
          serviceType: entry.service_type,
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
          // Client personal al avocatei: fără comandă/platformă, marcat explicit.
          ...(personalClient
            ? { avocat_client: true, platform: '', order_ref: '', client_email: '', client_cui: '' }
            : {}),
        }),
      });
      const json = await res.json();
      if (json.success) {
        const nr = json.data[0];
        const pad = (n: number) => String(n).padStart(6, '0');
        if (manualEntry.type === 'contract_delegatie' && json.delegation?.[0]) {
          const d = json.delegation[0];
          toast.success(`Alocate: Contract ${pad(nr.allocated_number)} + Delegatie ${d.allocated_series || 'SM'}${pad(d.allocated_number)}`);
        } else {
          toast.success(`Numar alocat: ${manualEntry.type === 'contract' ? 'Contract' : 'Delegatie'} ${nr.allocated_series || ''}${pad(nr.allocated_number)}`);
        }
        setAddManualOpen(false);
        setManualEntry({ type: 'contract_delegatie', client_name: '', client_email: '', client_cnp: '', client_cui: '', service_type: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], platform: '', order_ref: '', linked_contract_number: '' });
        setPersonalClient(isAvocat);
        setPickedOrder(null);
        setOrderSearch('');
        setOrderResults([]);
        // Sari la pagina 1 — numărul nou (cel mai mare) apare primul în jurnal.
        fetchRegistry(1);
        fetchRanges(); // Refresh ranges too (available count changed)
      } else {
        toast.error(json.error || 'Eroare la alocarea numarului');
      }
    } catch { toast.error('Eroare de retea'); }
    finally { setSaving(false); }
  };

  // ── Edit / Restore / Delete entry ───────────────────────────
  const openEditDialog = (entryId: string) => {
    const entry = registryEntries.find(e => e.id === entryId);
    if (!entry) return;
    setEditEntry({
      id: entry.id,
      type: entry.type,
      number: String(entry.number),
      series: entry.series || '',
      client_name: entry.client_name || '',
      client_cnp: entry.client_cnp || '',
      client_cui: entry.client_cui || '',
      service_type: entry.service_type || '',
      description: entry.description || '',
      amount: entry.amount != null ? String(entry.amount) : '',
      date: entry.date || new Date().toISOString().split('T')[0],
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editEntry) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/number-registry/${editEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: parseInt(editEntry.number, 10),
          series: editEntry.series || null,
          client_name: editEntry.client_name,
          client_cnp: editEntry.client_cnp || null,
          client_cui: editEntry.client_cui || null,
          service_type: editEntry.service_type || null,
          description: editEntry.description || null,
          amount: editEntry.amount === '' ? null : parseFloat(editEntry.amount),
          date: editEntry.date,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Inregistrare actualizata');
        setEditOpen(false);
        setEditEntry(null);
        fetchRegistry(pagination.page);
      } else {
        toast.error(json.error || 'Eroare la actualizare');
      }
    } catch { toast.error('Eroare de retea'); }
    finally { setSaving(false); }
  };

  const handleRestore = async (entryId: string) => {
    try {
      const res = await fetch(`/api/admin/settings/number-registry/${entryId}/restore`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast.success('Numar restaurat — este din nou valid');
        fetchRegistry(pagination.page);
      } else {
        toast.error(json.error || 'Eroare la restaurare');
      }
    } catch { toast.error('Eroare de retea'); }
  };

  const handleDeletePermanent = async (entryId: string, label: string) => {
    if (!window.confirm(`Stergi DEFINITIV ${label} din registru? Pentru numere consumate real folositi Anulare (numarul nu se refoloseste). Stergerea e pentru intrari gresite/test.`)) return;
    try {
      const res = await fetch(`/api/admin/settings/number-registry/${entryId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Inregistrare stearsa definitiv');
        fetchRegistry(pagination.page);
      } else {
        toast.error(json.error || 'Eroare la stergere');
      }
    } catch { toast.error('Eroare de retea'); }
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

  // Export CSV — pentru control/raportare la Barou. Un singur fișier grupat
  // pe client/comandă: rând per delegație cu nr. contractului repetat,
  // recente primele. Respectă filtrele active (an, sursă, căutare).
  // 2026 se exportă DOAR din 1 iulie — evidența ianuarie–iunie e ținută în
  // fișierele vechi de pe Drive (era Google Sheets), nu se dublează aici.
  const handleExport = async (exportType?: 'contract' | 'delegation') => {
    const params = new URLSearchParams({ year: String(filterYear) });
    if (filterYear === 2026) params.set('date_from', '2026-07-01');
    if (exportType) params.set('type', exportType);
    else if (filterType) params.set('type', filterType);
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
              {/* Arhivatele stau ascunse implicit — apar doar la cerere. */}
              {ranges.some(r => r.status === 'archived') && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                  />
                  Arata intervalele arhivate ({ranges.filter(r => r.status === 'archived').length})
                </label>
              )}
              {ranges.filter(r => showArchived || r.status !== 'archived').map(range => (
                <div key={range.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {range.type === 'contract' ? 'Contracte Asistenta' : 'Delegatii'} {range.year}
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
                    <span className="font-mono">{fmtNr(range.range_start)} – {fmtNr(range.range_end)}</span>
                    <span>{range.used}/{range.total} utilizate ({range.usage_percent}%)</span>
                    {range.status === 'active' && <span>Urmatorul: <span className="font-mono font-medium text-foreground">{fmtNr(range.next_number)}</span></span>}
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
            <Button size="sm" variant="outline" onClick={() => handleExport()} title="Toată evidența anului, grupată pe client: contract + delegațiile lui + pentru ce — recente primele. Pentru control/Barou.">
              <FileDown className="h-3.5 w-3.5 mr-1" />
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
                      <th className="py-2 px-2 font-medium">Nr Contract Asistenta</th>
                      <th className="py-2 px-2 font-medium">Nr Delegatie</th>
                      <th className="py-2 px-2 font-medium">Serie</th>
                      <th className="py-2 px-2 font-medium">Data</th>
                      <th className="py-2 px-2 font-medium">Client</th>
                      <th className="py-2 px-2 font-medium">CNP/CUI</th>
                      <th className="py-2 px-2 font-medium">Serviciu</th>
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
                      const allEntries: { id: string; label: string; voided: boolean }[] = [];
                      if (group.contractEntryId) {
                        allEntries.push({
                          id: group.contractEntryId,
                          label: `Contract ${fmtNr(group.contractNumber)}`,
                          voided: group.voidedEntryIds.includes(group.contractEntryId),
                        });
                      }
                      for (const d of group.delegationNumbers) {
                        allEntries.push({
                          id: d.id,
                          label: `Delegatie ${d.series || ''}${fmtNr(d.number)}`,
                          voided: group.voidedEntryIds.includes(d.id),
                        });
                      }

                      return (
                        <tr
                          key={group.groupKey}
                          className={`border-b ${group.voided ? 'bg-red-50 line-through text-muted-foreground' : ''}`}
                        >
                          <td className="py-2 px-2">
                            {group.orderId ? (
                              <a href={`/admin/orders/${group.orderId}`} className="text-blue-600 hover:underline text-xs font-mono">
                                {group.friendlyOrderId}
                              </a>
                            ) : (
                              <span className="text-xs font-mono">{group.friendlyOrderId}</span>
                            )}
                            {group.platform && (
                              <span
                                className={`ml-1.5 inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium align-middle ${
                                  group.platform === 'eghiseul'
                                    ? 'bg-blue-100 text-blue-700'
                                    : group.platform === 'ecazier'
                                      ? 'bg-violet-100 text-violet-700'
                                      : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {group.platform === 'eghiseul' ? 'eGhișeul' : group.platform === 'cazierjudiciaronline' ? 'CJO' : 'ecazier'}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 font-mono">
                            {fmtNr(group.contractNumber)}
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
                              ? group.delegationNumbers.map((d) => (
                                  <div key={d.id} className="whitespace-nowrap">
                                    <span title={d.serviceType || undefined}>{fmtNr(d.number)}</span>
                                    {d.serviceType && (
                                      <span className="ml-1 font-sans text-[10px] text-muted-foreground">
                                        {d.serviceType.startsWith('apostila-haga')
                                          ? 'Apostilă Haga'
                                          : d.serviceType.startsWith('bundled:')
                                            ? d.serviceType.split(':').pop()
                                            : d.serviceType}
                                      </span>
                                    )}
                                    {d.s3Key && (
                                      <button
                                        onClick={() => handleDocDownload(d.s3Key!)}
                                        className="ml-1 inline-flex align-middle text-primary hover:text-primary/70"
                                        title="Descarca delegatie"
                                      >
                                        <FileDown className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
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
                          <td className="py-2 px-2">
                            <Badge variant={
                              group.source === 'platform' ? 'default' :
                              group.source === 'manual' ? 'secondary' :
                              group.source === 'voided' ? 'destructive' : 'outline'
                            }>
                              {group.source === 'platform'
                                ? (group.platform === 'eghiseul' ? 'eGhișeul' : group.platform === 'ecazier' ? 'ecazier' : group.platform === 'cazierjudiciaronline' ? 'CJO' : 'Platforma')
                                : group.source === 'manual' ? (group.avocatClient ? 'Client avocat' : 'Manual')
                                : group.source === 'voided' ? 'Anulat' : 'Rezervat'}
                            </Badge>
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex flex-col gap-0.5">
                              {allEntries.map(e => (
                                <EntryActions
                                  key={e.id}
                                  entryId={e.id}
                                  label={e.label}
                                  voided={e.voided}
                                  showLabel={allEntries.length > 1}
                                  onEdit={openEditDialog}
                                  onVoid={(id) => { setVoidEntryId(id); setVoidDialogOpen(true); }}
                                  onRestore={handleRestore}
                                  onDelete={handleDeletePermanent}
                                />
                              ))}
                            </div>
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
                          {entry.type === 'contract' ? fmtNr(entry.number) : '-'}
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
                          {entry.type === 'delegation' ? fmtNr(entry.number) : '-'}
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
                        <td className="py-2 px-2">
                          <Badge variant="secondary">
                            {(entry.description || '').startsWith('Client avocat') ? 'Client avocat' : 'Manual'}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">
                          <EntryActions
                            entryId={entry.id}
                            label={`${entry.type === 'contract' ? 'Contract' : 'Delegatie'} ${entry.series || ''}${fmtNr(entry.number)}`}
                            voided={!!entry.voided_at}
                            showLabel={false}
                            onEdit={openEditDialog}
                            onVoid={(id) => { setVoidEntryId(id); setVoidDialogOpen(true); }}
                            onRestore={handleRestore}
                            onDelete={handleDeletePermanent}
                          />
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
                <option value="delegation">Delegatie (Imputernicire Avocatiala)</option>
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
            {/* Pentru cine se alocă: clientul personal al avocatei (formular
                simplu, marcat „Client avocat") sau un client de platformă. */}
            <div>
              <Label>Pentru cine</Label>
              <div className="mt-1 flex gap-2" role="radiogroup">
                <button
                  type="button"
                  role="radio"
                  aria-checked={personalClient}
                  onClick={() => setPersonalClient(true)}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-medium ${personalClient ? 'border-primary bg-primary/10' : 'border-muted bg-white hover:border-primary/40'}`}
                >
                  Client avocat (personal)
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={!personalClient}
                  onClick={() => setPersonalClient(false)}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-medium ${!personalClient ? 'border-primary bg-primary/10' : 'border-muted bg-white hover:border-primary/40'}`}
                >
                  Client platformă (comandă)
                </button>
              </div>
              {personalClient && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Client din activitatea proprie a cabinetului — fără legătură cu platformele.
                  Apare în jurnal și în export ca <strong>„Client avocat&rdquo;</strong>.
                </p>
              )}
            </div>
            <div>
              <Label>Tip</Label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={manualEntry.type} onChange={e => setManualEntry({...manualEntry, type: e.target.value})}>
                <option value="contract_delegatie">Contract + Delegatie (legate)</option>
                <option value="contract">Doar Contract</option>
                <option value="delegation">Doar Delegatie</option>
              </select>
            </div>
            {/* Delegatie legata de un contract deja existent */}
            {manualEntry.type === 'delegation' && (
              <div>
                <Label>Nr. contract existent (opțional)</Label>
                <Input
                  value={manualEntry.linked_contract_number}
                  onChange={e => setManualEntry({...manualEntry, linked_contract_number: e.target.value})}
                  placeholder="ex: 005771 — leagă delegația de contractul clientului"
                />
              </div>
            )}
            {/* Căutare comandă → precompletează tot (nume, CNP/CUI, email,
                serviciu, sumă, platformă + nr. comandă). Doar în modul
                „client platformă" — clientul personal n-are comandă. */}
            {!personalClient && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2 relative">
              <Label>Caută comanda (nume client / nr. comandă / email)</Label>
              <Input
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                placeholder="ex: Popescu / E-260715-XXXXX — minim 3 caractere"
              />
              {pickedOrder && !orderSearch && (
                <p className="text-xs text-blue-800">
                  ✓ Precompletat din comanda <span className="font-mono font-semibold">{pickedOrder}</span>
                </p>
              )}
              {orderSearching && <p className="text-xs text-muted-foreground">Caut...</p>}
              {orderResults.length > 0 && (
                <div className="absolute left-3 right-3 top-full z-50 -mt-1 max-h-56 overflow-y-auto rounded-md border bg-white shadow-lg">
                  {orderResults.map((o) => (
                    <button
                      key={o.orderNumber}
                      type="button"
                      onClick={() => pickOrder(o)}
                      className="flex w-full items-center justify-between gap-2 border-b px-3 py-2 text-left text-sm hover:bg-blue-50 last:border-b-0"
                    >
                      <span>
                        <span className="font-mono text-xs text-blue-700">{o.friendlyId || o.orderNumber}</span>
                        <span className="ml-2 font-medium">{o.clientName || '—'}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{o.serviceName}</span>
                      </span>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {o.total != null ? `${o.total} lei` : ''}{!o.paid ? ' · neplătită' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}
            <div>
              <Label>Nume client *</Label>
              <Input value={manualEntry.client_name} onChange={e => setManualEntry({...manualEntry, client_name: e.target.value})} />
            </div>
            {personalClient ? (
              <div>
                <Label>CNP</Label>
                <Input value={manualEntry.client_cnp} onChange={e => setManualEntry({...manualEntry, client_cnp: e.target.value})} maxLength={13} />
              </div>
            ) : (
            <>
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
            </>
            )}
            <div>
              <Label>{personalClient ? 'Pentru ce (serviciu / scop)' : 'Serviciu / Descriere'}</Label>
              <Input value={manualEntry.service_type} onChange={e => setManualEntry({...manualEntry, service_type: e.target.value})} placeholder={personalClient ? 'Ex: Reprezentare instanta / Consultanta juridica' : 'Ex: Consultanta juridica / Apostila Haga extra'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {!personalClient && (
              <div>
                <Label>Suma (RON)</Label>
                <Input type="number" step="0.01" value={manualEntry.amount} onChange={e => setManualEntry({...manualEntry, amount: e.target.value})} />
              </div>
              )}
              <div>
                <Label>Data</Label>
                <Input type="date" value={manualEntry.date} onChange={e => setManualEntry({...manualEntry, date: e.target.value})} />
              </div>
            </div>
            {/* Optional: leagă numărul de o comandă existentă — pentru servicii
                extra neprevăzute adăugate ulterior (ex. apostilă cerută după
                plasare). Serviciul de mai sus TREBUIE să difere de cele deja
                alocate pe comandă (altfel primești numărul existent înapoi). */}
            {!personalClient && (
            <div className="rounded-lg border border-dashed p-3 space-y-3">
              <p className="text-xs text-muted-foreground">Opțional: leagă de o comandă existentă (serviciu extra neprevăzut)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platformă</Label>
                  <select className="w-full border rounded px-3 py-2 mt-1" value={manualEntry.platform} onChange={e => setManualEntry({...manualEntry, platform: e.target.value})}>
                    <option value="">— fără comandă —</option>
                    <option value="eghiseul">eGhișeul</option>
                    <option value="cazierjudiciaronline">cazierjudiciaronline</option>
                    <option value="ecazier">ecazier</option>
                  </select>
                </div>
                <div>
                  <Label>Nr. comandă</Label>
                  <Input value={manualEntry.order_ref} onChange={e => setManualEntry({...manualEntry, order_ref: e.target.value})} placeholder="E-260709-XXXXX / CJO-..." disabled={!manualEntry.platform} />
                </div>
              </div>
            </div>
            )}
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

      {/* Edit Entry Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditEntry(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editare {editEntry?.type === 'contract' ? 'Contract' : 'Delegatie'}
            </DialogTitle>
          </DialogHeader>
          {editEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Numar *</Label>
                  <Input value={editEntry.number} onChange={e => setEditEntry({...editEntry, number: e.target.value.replace(/\D/g, '')})} />
                  <p className="text-[11px] text-muted-foreground mt-1">Duplicatele sunt respinse automat.</p>
                </div>
                <div>
                  <Label>Serie</Label>
                  <Input value={editEntry.series} onChange={e => setEditEntry({...editEntry, series: e.target.value})} placeholder="SM" />
                </div>
              </div>
              <div>
                <Label>Nume client *</Label>
                <Input value={editEntry.client_name} onChange={e => setEditEntry({...editEntry, client_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CNP</Label>
                  <Input value={editEntry.client_cnp} onChange={e => setEditEntry({...editEntry, client_cnp: e.target.value})} maxLength={13} />
                </div>
                <div>
                  <Label>CUI</Label>
                  <Input value={editEntry.client_cui} onChange={e => setEditEntry({...editEntry, client_cui: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Serviciu</Label>
                <Input value={editEntry.service_type} onChange={e => setEditEntry({...editEntry, service_type: e.target.value})} />
              </div>
              <div>
                <Label>Descriere</Label>
                <Input value={editEntry.description} onChange={e => setEditEntry({...editEntry, description: e.target.value})} placeholder="ex: Pentru contract 005771 — Cazier Judiciar" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Suma (RON)</Label>
                  <Input type="number" step="0.01" value={editEntry.amount} onChange={e => setEditEntry({...editEntry, amount: e.target.value})} />
                </div>
                <div>
                  <Label>Data</Label>
                  <Input type="date" value={editEntry.date} onChange={e => setEditEntry({...editEntry, date: e.target.value})} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditEntry(null); }}>Anuleaza</Button>
            <Button onClick={handleEditSave} disabled={saving || !editEntry?.client_name.trim() || !editEntry?.number}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salveaza
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Acțiuni per intrare de registru: editare, anulare (void), iar pe cele
 *  anulate — restaurare sau ștergere definitivă. */
function EntryActions({
  entryId,
  label,
  voided,
  showLabel,
  onEdit,
  onVoid,
  onRestore,
  onDelete,
}: {
  entryId: string;
  label: string;
  voided: boolean;
  showLabel: boolean;
  onEdit: (id: string) => void;
  onVoid: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string, label: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 whitespace-nowrap">
      {showLabel && <span className="text-[10px] text-muted-foreground mr-1 font-mono">{label.replace(/^(Contract|Delegatie) /, '$1 ').split(' ')[1]}</span>}
      <button
        onClick={() => onEdit(entryId)}
        className="p-1 text-muted-foreground hover:text-foreground"
        title={`Editeaza ${label}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      {!voided ? (
        <button
          onClick={() => onVoid(entryId)}
          className="p-1 text-red-600 hover:text-red-800"
          title={`Anuleaza ${label} (numarul nu se refoloseste)`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <>
          <button
            onClick={() => onRestore(entryId)}
            className="p-1 text-green-600 hover:text-green-800"
            title={`Restaureaza ${label} (redevine valid)`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(entryId, label)}
            className="p-1 text-red-600 hover:text-red-800"
            title={`Sterge DEFINITIV ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
