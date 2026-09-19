'use client';

/**
 * Card „Campanii (noutăți, articole, servicii noi)" din /admin/marketing.
 * Echipa scrie subiect + corp (markdown-lite) + buton, alege segmentul și
 * ritmul zilnic, trimite un test pe adresa proprie, apoi pornește. Cronul
 * `/api/cron/email-campaigns` trimite tranșa zilnică.
 * Spec: docs/technical/specs/lifecycle-emails.md
 */

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Newspaper, Play, Pause, Pencil, Plus, RefreshCw, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Segment = 'customers' | 'subscribed' | 'all_contacts';
type Status = 'draft' | 'sending' | 'paused' | 'done';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  body_text: string;
  cta_label: string | null;
  cta_url: string | null;
  segment: Segment;
  status: Status;
  daily_batch_size: number;
  sent_count: number;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

const SEGMENT_LABEL: Record<Segment, string> = {
  customers: 'Clienți (au cumpărat)',
  subscribed: 'Abonați newsletter (opt-in explicit)',
  all_contacts: 'Tot registrul (72k, treptat)',
};
const STATUS_LABEL: Record<Status, string> = { draft: 'Draft', sending: 'Se trimite', paused: 'Pauză', done: 'Terminată' };
const STATUS_CLASS: Record<Status, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sending: 'bg-green-50 text-green-700',
  paused: 'bg-amber-50 text-amber-700',
  done: 'bg-blue-50 text-blue-700',
};

const EMPTY = {
  name: '',
  subject: '',
  preheader: '',
  body_text: 'Salut {{prenume}},\n\n',
  cta_label: '',
  cta_url: '',
  segment: 'customers' as Segment,
  daily_batch_size: 100,
};

export function CampaignsCard() {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/campaigns');
      const json = await res.json();
      if (json.success) setRows(json.data);
      else toast.error(json.error || 'Eroare la încărcare');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };
  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      name: c.name,
      subject: c.subject,
      preheader: c.preheader ?? '',
      body_text: c.body_text,
      cta_label: c.cta_label ?? '',
      cta_url: c.cta_url ?? '',
      segment: c.segment,
      daily_batch_size: c.daily_batch_size,
    });
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        preheader: form.preheader || null,
        cta_label: form.cta_label || null,
        cta_url: form.cta_url || null,
        daily_batch_size: Number(form.daily_batch_size) || 100,
      };
      const res = await fetch(editing ? `/api/admin/marketing/campaigns/${editing.id}` : '/api/admin/marketing/campaigns', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editing ? 'Campanie actualizată' : 'Campanie creată (draft)');
        setOpen(false);
        load();
      } else toast.error(json.error || 'Eroare la salvare');
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (c: Campaign, status: Exclude<Status, 'done'>) => {
    if (status === 'sending' && c.status === 'draft') {
      const ok = window.confirm(
        `Pornești campania „${c.name}" către segmentul „${SEGMENT_LABEL[c.segment]}", ${c.daily_batch_size} emailuri/zi?\n\nAi trimis un test și l-ai citit?`
      );
      if (!ok) return;
    }
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(status === 'sending' ? 'Pornită — prima tranșă pleacă la următoarea rulare a cronului (07:40 UTC)' : 'Pusă pe pauză');
        load();
      } else toast.error(json.error || 'Eroare');
    } finally {
      setBusyId(null);
    }
  };

  const sendTest = async (c: Campaign) => {
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/${c.id}/test`, { method: 'POST' });
      const json = await res.json();
      if (json.success) toast.success(`Test trimis la ${json.data.to}`);
      else toast.error(json.error || 'Eroare la test');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (c: Campaign) => {
    if (!window.confirm(`Ștergi draftul „${c.name}"?`)) return;
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/${c.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) load();
      else toast.error(json.error || 'Eroare');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Newspaper className="h-5 w-5" />
            Campanii: noutăți, articole, servicii noi
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Reîncarcă
            </Button>
            <Button size="sm" onClick={openNew}>
              <Plus className="mr-1 h-4 w-4" />
              Campanie nouă
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Scrii o dată, cronul trimite zilnic tranșa aleasă (07:40 UTC). Testează întâi pe adresa ta. Corpul acceptă:
          paragrafe (linie goală), <code>- listă</code>, <code>## subtitlu</code>, <code>**bold**</code>,{' '}
          <code>[text](https://…)</code>, <code>{'{{prenume}}'}</code>.
        </p>

        {rows.length === 0 && !loading ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Nicio campanie încă.</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {rows.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{c.name}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_CLASS[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground" title={c.subject}>
                    {c.subject}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {SEGMENT_LABEL[c.segment]} · {c.daily_batch_size}/zi · <strong>{c.sent_count}</strong> trimise
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => sendTest(c)} disabled={busyId === c.id} title="Trimite un test pe adresa ta">
                    <Send className="h-3.5 w-3.5" /> Test
                  </Button>
                  {(c.status === 'draft' || c.status === 'paused') && (
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)} disabled={busyId === c.id}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {(c.status === 'draft' || c.status === 'paused') && (
                    <Button size="sm" onClick={() => setStatus(c, 'sending')} disabled={busyId === c.id}>
                      <Play className="h-3.5 w-3.5" /> {c.status === 'draft' ? 'Pornește' : 'Reia'}
                    </Button>
                  )}
                  {c.status === 'sending' && (
                    <Button variant="outline" size="sm" onClick={() => setStatus(c, 'paused')} disabled={busyId === c.id}>
                      <Pause className="h-3.5 w-3.5" /> Pauză
                    </Button>
                  )}
                  {c.status === 'draft' && (
                    <Button variant="ghost" size="sm" onClick={() => remove(c)} disabled={busyId === c.id} title="Șterge draftul">
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editează campania' : 'Campanie nouă'}</DialogTitle>
            <DialogDescription>Se salvează ca draft. Nimic nu pleacă până nu apeși „Pornește”.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Nume intern</span>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Noutăți septembrie — rovinietă + celibat" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Subiect</span>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="ex: {{prenume}}, două servicii noi și un ghid despre cazier" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Preheader (textul gri din inbox, opțional)</span>
              <Input value={form.preheader} onChange={(e) => setForm({ ...form, preheader: e.target.value })} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Corp (markdown-lite)</span>
              <Textarea rows={12} value={form.body_text} onChange={(e) => setForm({ ...form, body_text: e.target.value })} className="font-mono text-xs" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-muted-foreground">Buton — text (opțional)</span>
                <Input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} placeholder="Vezi serviciile" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-muted-foreground">Buton — link</span>
                <Input value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} placeholder="https://eghiseul.ro/servicii/" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-muted-foreground">Cui trimitem</span>
                <select
                  className="h-9 rounded-md border bg-white px-2 text-sm"
                  value={form.segment}
                  onChange={(e) => setForm({ ...form, segment: e.target.value as Segment })}
                >
                  {(Object.keys(SEGMENT_LABEL) as Segment[]).map((s) => (
                    <option key={s} value={s}>
                      {SEGMENT_LABEL[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-xs text-muted-foreground">Emailuri pe zi (1–2000)</span>
                <Input
                  type="number"
                  min={1}
                  max={2000}
                  value={form.daily_batch_size}
                  onChange={(e) => setForm({ ...form, daily_batch_size: Number(e.target.value) })}
                />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Anulează
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? 'Se salvează...' : editing ? 'Salvează' : 'Creează draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
