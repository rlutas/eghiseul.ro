'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ShieldAlert,
  Loader2,
  Copy,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount: number;
  max_uses: number | null;
  times_used: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDiscount(c: Coupon): string {
  if (c.discount_type === 'percentage') return `${Number(c.discount_value)}%`;
  return `${Number(c.discount_value).toFixed(2)} RON`;
}

/** "YYYY-MM-DDTHH:mm" (local) -> ISO string, or null if empty. */
function localToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO -> "YYYY-MM-DDTHH:mm" suitable for <input type="datetime-local">. */
function isoToLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ──────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  const { hasPermission } = useAdminPermissions();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const PAGE_LIMIT = 50;

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_LIMIT));
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setCoupons(json.data?.coupons || []);
        setPagination(json.data?.pagination || null);
      } else {
        toast.error(json.error || 'Eroare la incarcarea cupoanelor');
      }
    } catch {
      toast.error('Eroare de retea');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/coupons/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Cuponul a fost sters');
        setDeleteTarget(null);
        fetchCoupons();
      } else {
        toast.error(json.error || 'Eroare la stergere');
      }
    } catch {
      toast.error('Eroare de retea');
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !c.is_active }),
      });
      const json = await res.json();
      if (json.success) fetchCoupons();
      else toast.error(json.error || 'Eroare');
    } catch {
      toast.error('Eroare de retea');
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Cod copiat');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Permission gate
  if (!hasPermission('settings.manage')) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acces interzis</h2>
        <p className="text-muted-foreground max-w-md">
          Nu ai permisiunea de a gestiona cupoanele.
        </p>
      </div>
    );
  }

  const totalPages = pagination?.total_pages || 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cupoane</h1>
          <p className="text-sm text-muted-foreground">
            Gestionare coduri de reducere pentru checkout
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Adauga Cupon
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cauta dupa cod..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={fetchCoupons} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Reincarca
        </Button>
        {pagination && (
          <p className="text-sm text-muted-foreground ml-auto">
            {pagination.total} cupoane
          </p>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cod</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Valoare</TableHead>
                <TableHead>Utilizari</TableHead>
                <TableHead>Suma min.</TableHead>
                <TableHead>Valabil pana la</TableHead>
                <TableHead>Activ</TableHead>
                <TableHead>Creat</TableHead>
                <TableHead className="text-right">Actiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    Nu exista cupoane. Apasa &ldquo;Adauga Cupon&rdquo; pentru a crea unul.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((c) => {
                  const atLimit = c.max_uses !== null && c.times_used >= c.max_uses;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-bold">
                          {c.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.discount_type === 'percentage' ? 'Procentual' : 'Fix'}
                      </TableCell>
                      <TableCell className="font-medium">{formatDiscount(c)}</TableCell>
                      <TableCell>
                        <span className={atLimit ? 'text-red-600 font-semibold' : ''}>
                          {c.times_used}/{c.max_uses ?? '∞'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {Number(c.min_amount) > 0 ? `${Number(c.min_amount).toFixed(0)} RON` : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.valid_until ? formatDate(c.valid_until) : 'Nelimitat'}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={c.is_active}
                          onCheckedChange={() => toggleActive(c)}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(c.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => copyCode(c.code, c.id)}
                            title="Copiaza cod"
                          >
                            {copiedId === c.id ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setEditing(c);
                              setFormOpen(true);
                            }}
                            title="Editeaza"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteTarget(c)}
                            title="Sterge"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {page} din {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Inapoi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Inainte
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <CouponFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          setFormOpen(false);
          setEditing(null);
          fetchCoupons();
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sterge cupon</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteTarget.times_used > 0
                ? `Cuponul "${deleteTarget.code}" a fost folosit de ${deleteTarget.times_used} ori. Esti sigur ca vrei sa il stergi definitiv?`
                : `Esti sigur ca vrei sa stergi cuponul "${deleteTarget?.code}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuleaza</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Sterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Form Dialog
// ──────────────────────────────────────────────────────────────

interface FormProps {
  open: boolean;
  editing: Coupon | null;
  onClose: () => void;
  onSaved: () => void;
}

function CouponFormDialog({ open, editing, onClose, onSaved }: FormProps) {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minAmount, setMinAmount] = useState('0');
  const [maxUses, setMaxUses] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when opening
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setCode(editing.code);
      setDescription(editing.description ?? '');
      setDiscountType(editing.discount_type);
      setDiscountValue(String(editing.discount_value));
      setMinAmount(String(editing.min_amount ?? 0));
      setMaxUses(editing.max_uses !== null ? String(editing.max_uses) : '');
      setValidFrom(isoToLocal(editing.valid_from));
      setValidUntil(isoToLocal(editing.valid_until));
      setIsActive(editing.is_active);
    } else {
      setCode('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue('');
      setMinAmount('0');
      setMaxUses('');
      setValidFrom('');
      setValidUntil('');
      setIsActive(true);
    }
    setError(null);
  }, [open, editing]);

  const handleSubmit = async () => {
    setError(null);

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError('Codul este obligatoriu');
      return;
    }

    const valueNum = parseFloat(discountValue);
    if (!Number.isFinite(valueNum) || valueNum <= 0) {
      setError('Valoarea trebuie sa fie un numar pozitiv');
      return;
    }
    if (discountType === 'percentage' && (valueNum < 1 || valueNum > 100)) {
      setError('Procentul trebuie sa fie intre 1 si 100');
      return;
    }

    const minAmountNum = parseFloat(minAmount || '0');
    if (!Number.isFinite(minAmountNum) || minAmountNum < 0) {
      setError('Suma minima invalida');
      return;
    }

    let maxUsesNum: number | null = null;
    if (maxUses.trim()) {
      const n = parseInt(maxUses, 10);
      if (!Number.isFinite(n) || n <= 0) {
        setError('Numarul maxim de utilizari trebuie sa fie un intreg pozitiv');
        return;
      }
      maxUsesNum = n;
    }

    const payload: Record<string, unknown> = {
      code: trimmedCode,
      description: description.trim() || null,
      discount_type: discountType,
      discount_value: valueNum,
      min_amount: minAmountNum,
      max_uses: maxUsesNum,
      valid_from: localToIso(validFrom),
      valid_until: localToIso(validUntil),
      is_active: isActive,
    };

    setSaving(true);
    try {
      const url = editing ? `/api/admin/coupons/${editing.id}` : '/api/admin/coupons';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editing ? 'Cupon actualizat' : 'Cupon creat');
        onSaved();
      } else {
        setError(json.error || 'Eroare la salvare');
      }
    } catch {
      setError('Eroare de retea');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editeaza Cupon' : 'Cupon Nou'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Modifica detaliile cuponului. Codul poate fi schimbat (atentie la comenzile existente).'
              : 'Creeaza un cod de reducere pentru clienti.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="coupon-code">Cod</Label>
            <Input
              id="coupon-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="EX: WELCOME10"
              className="font-mono"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="coupon-description">Descriere (optional)</Label>
            <Textarea
              id="coupon-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reducere pentru clienti noi..."
              rows={2}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Tip reducere</Label>
            <RadioGroup
              value={discountType}
              onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}
              className="flex gap-4"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="percentage" />
                <span className="text-sm">Procentual (%)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="fixed" />
                <span className="text-sm">Fix (RON)</span>
              </label>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Value */}
            <div className="space-y-2">
              <Label htmlFor="coupon-value">
                Valoare {discountType === 'percentage' ? '(%)' : '(RON)'}
              </Label>
              <Input
                id="coupon-value"
                type="number"
                step={discountType === 'percentage' ? '1' : '0.01'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? '10' : '50'}
              />
            </div>

            {/* Min amount */}
            <div className="space-y-2">
              <Label htmlFor="coupon-min">Suma min. comanda (RON)</Label>
              <Input
                id="coupon-min"
                type="number"
                step="0.01"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>

            {/* Max uses */}
            <div className="space-y-2">
              <Label htmlFor="coupon-max-uses">Utilizari max.</Label>
              <Input
                id="coupon-max-uses"
                type="number"
                step="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Nelimitat"
              />
            </div>

            {/* Active */}
            <div className="space-y-2">
              <Label>Stare</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm">{isActive ? 'Activ' : 'Inactiv'}</span>
              </div>
            </div>

            {/* Valid from */}
            <div className="space-y-2">
              <Label htmlFor="coupon-from">Valabil de la</Label>
              <Input
                id="coupon-from"
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>

            {/* Valid until */}
            <div className="space-y-2">
              <Label htmlFor="coupon-until">Valabil pana la</Label>
              <Input
                id="coupon-until"
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {editing && (
            <div className="text-xs text-muted-foreground">
              Utilizat de {editing.times_used} ori.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Anuleaza
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Se salveaza...
              </>
            ) : editing ? (
              'Salveaza Modificari'
            ) : (
              'Creeaza Cupon'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
