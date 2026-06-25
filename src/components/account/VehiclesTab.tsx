'use client';

/**
 * VehiclesTab — „Mașinile mele".
 * CRUD pe mașinile salvate (nr înmatriculare + date) + termene ITP/asigurare/
 * rovinietă cu indicator de expirare. Se refolosesc în wizard (cazier auto /
 * rovinietă) prin dropdown-ul de mașini salvate.
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Plus, Pencil, Trash2, Star, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { expiryStatus } from '@/lib/vehicles/expiry';

export interface SavedVehicle {
  id: string;
  label: string | null;
  plate_number: string;
  vin: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  driving_license: string | null;
  itp_expiry: string | null;
  insurance_expiry: string | null;
  rovinieta_expiry: string | null;
  is_default: boolean;
}

type FormState = Partial<SavedVehicle>;

const EMPTY: FormState = { plate_number: '', is_default: false };

function ExpiryBadge({ label, date }: { label: string; date: string | null }) {
  const s = expiryStatus(date);
  if (!s) return null;
  const cls =
    s.tone === 'red' ? 'bg-red-100 text-red-800 border-red-300'
    : s.tone === 'amber' ? 'bg-amber-100 text-amber-900 border-amber-300'
    : 'bg-green-100 text-green-800 border-green-300';
  const Icon = s.tone === 'green' ? CheckCircle2 : AlertTriangle;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      <Icon className="h-3 w-3" /> {label}: {s.text}
    </span>
  );
}

export default function VehiclesTab() {
  const [vehicles, setVehicles] = useState<SavedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/vehicles');
      const json = await res.json();
      if (json.success) setVehicles(json.data || []);
    } catch {
      toast.error('Eroare la încărcarea mașinilor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startAdd = () => { setForm(EMPTY); setEditingId(null); setShowForm(true); };
  const startEdit = (v: SavedVehicle) => { setForm(v); setEditingId(v.id); setShowForm(true); };

  const save = async () => {
    if (!form.plate_number?.trim()) { toast.error('Numărul de înmatriculare e obligatoriu'); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/user/vehicles/${editingId}` : '/api/user/vehicles';
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editingId ? 'Mașină actualizată' : 'Mașină adăugată');
        setShowForm(false);
        load();
      } else {
        toast.error(json.error || 'Eroare la salvare');
      }
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Ștergi această mașină?')) return;
    const res = await fetch(`/api/user/vehicles/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) { toast.success('Mașină ștearsă'); load(); }
    else toast.error(json.error || 'Eroare la ștergere');
  };

  const field = (k: keyof FormState, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Salvează mașinile + termenele ITP/asigurare/rovinietă — le refolosești la comandă și vezi când expiră.
        </p>
        <Button onClick={startAdd} size="sm">
          <Plus className="h-4 w-4" /> Adaugă mașină
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">Se încarcă...</p>
      ) : vehicles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center">
          <Car className="mx-auto h-10 w-10 text-neutral-300 mb-2" />
          <p className="text-sm text-neutral-500">Nicio mașină salvată încă.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {vehicles.map((v) => (
            <div key={v.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-secondary-900 flex items-center gap-1.5">
                    <Car className="h-4 w-4 text-primary-600" />
                    {v.plate_number}
                    {v.is_default && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {[v.label, [v.brand, v.model].filter(Boolean).join(' '), v.year].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(v)} className="p-1.5 rounded hover:bg-neutral-100" aria-label="Editează"><Pencil className="h-4 w-4 text-neutral-500" /></button>
                  <button onClick={() => remove(v.id)} className="p-1.5 rounded hover:bg-red-50" aria-label="Șterge"><Trash2 className="h-4 w-4 text-red-500" /></button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <ExpiryBadge label="ITP" date={v.itp_expiry} />
                <ExpiryBadge label="RCA" date={v.insurance_expiry} />
                <ExpiryBadge label="Rovinietă" date={v.rovinieta_expiry} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-3">
          <p className="font-semibold text-secondary-900">{editingId ? 'Editează mașina' : 'Mașină nouă'}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nr. înmatriculare *</Label>
              <Input value={form.plate_number ?? ''} onChange={(e) => field('plate_number', e.target.value.toUpperCase())} placeholder="SM 12 ABC" />
            </div>
            <div className="space-y-1.5">
              <Label>Etichetă</Label>
              <Input value={form.label ?? ''} onChange={(e) => field('label', e.target.value)} placeholder="ex: Golf alb" />
            </div>
            <div className="space-y-1.5">
              <Label>Marcă</Label>
              <Input value={form.brand ?? ''} onChange={(e) => field('brand', e.target.value)} placeholder="Volkswagen" />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input value={form.model ?? ''} onChange={(e) => field('model', e.target.value)} placeholder="Golf" />
            </div>
            <div className="space-y-1.5">
              <Label>An</Label>
              <Input type="number" value={form.year ?? ''} onChange={(e) => field('year', e.target.value ? Number(e.target.value) : null)} placeholder="2020" />
            </div>
            <div className="space-y-1.5">
              <Label>Serie șasiu (VIN)</Label>
              <Input value={form.vin ?? ''} onChange={(e) => field('vin', e.target.value.toUpperCase())} placeholder="WVWZZZ..." />
            </div>
            <div className="space-y-1.5">
              <Label>Nr. permis conducere</Label>
              <Input value={form.driving_license ?? ''} onChange={(e) => field('driving_license', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Expirare ITP</Label>
              <Input type="date" value={form.itp_expiry ?? ''} onChange={(e) => field('itp_expiry', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Expirare asigurare (RCA)</Label>
              <Input type="date" value={form.insurance_expiry ?? ''} onChange={(e) => field('insurance_expiry', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Expirare rovinietă</Label>
              <Input type="date" value={form.rovinieta_expiry ?? ''} onChange={(e) => field('rovinieta_expiry', e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!form.is_default} onChange={(e) => field('is_default', e.target.checked)} />
            Mașină implicită
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Anulează</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Se salvează...' : 'Salvează'}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
