'use client';

/**
 * Card „Emailuri automate după comandă" din /admin/marketing: trei comutatoare
 * (recenzie / expirare / cross-sell) salvate în `admin_settings.lifecycle_emails`
 * + contoare din `lifecycle_emails`. Spec: docs/technical/specs/lifecycle-emails.md
 */

import { useCallback, useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type Kind = 'review_request' | 'expiry_reminder' | 'cross_sell';
interface Settings {
  reviewRequest: boolean;
  expiryReminder: boolean;
  crossSell: boolean;
}
type Stats = Record<Kind, { sent: number; sent30d: number; failed: number }>;

const DEFAULTS: Settings = { reviewRequest: false, expiryReminder: false, crossSell: false };

const ROWS: Array<{ key: keyof Settings; kind: Kind; label: string; hint: string }> = [
  {
    key: 'reviewRequest',
    kind: 'review_request',
    label: 'Cerere de recenzie Google',
    hint: 'La 3–10 zile după finalizare, DOAR comenzile livrate în termen și fără pauze/reîncărcări.',
  },
  {
    key: 'expiryReminder',
    kind: 'expiry_reminder',
    label: 'Reminder expirare document',
    hint: 'Cazier judiciar și integritate: 6 luni. Cazier fiscal, auto, constatator: 30 zile. Pleacă cu 14 zile înainte, o dată per comandă.',
  },
  {
    key: 'crossSell',
    kind: 'cross_sell',
    label: 'Cross-sell (documente înrudite)',
    hint: 'La 30–60 zile după finalizare, 2 documente care au sens după cel cumpărat. Maxim un email per client la 6 luni.',
  },
];

export function LifecycleEmailsCard() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, statsRes] = await Promise.all([fetch('/api/admin/settings'), fetch('/api/admin/marketing/lifecycle-stats')]);
      const settingsJson = await settingsRes.json();
      const statsJson = await statsRes.json();
      setSettings({ ...DEFAULTS, ...(settingsJson.data?.lifecycle_emails ?? {}) });
      if (statsJson.success) setStats(statsJson.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (next: Settings) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'lifecycle_emails', value: next }),
      });
      const json = await res.json();
      if (json.success) {
        setSettings(next);
        toast.success('Salvat');
      } else toast.error(json.error || 'Eroare la salvare');
    } catch {
      toast.error('Eroare de rețea');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5" />
            Emailuri automate după comandă
          </h2>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Reîncarcă
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Rulează zilnic (07:20 UTC), fiecare tip cu comutatorul lui. Un email per comandă, niciodată către
          dezabonați sau adrese cu bounce. Șabloanele: <code>src/lib/email/templates/</code> — review-request,
          expiry-reminder, cross-sell.
        </p>
        <div className="divide-y rounded-lg border">
          {ROWS.map((r) => {
            const s = stats?.[r.kind];
            return (
              <div key={r.key} className="flex flex-wrap items-center gap-3 p-3">
                <Switch
                  checked={settings[r.key]}
                  disabled={saving || loading}
                  onCheckedChange={(checked) => save({ ...settings, [r.key]: checked })}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    {r.label}{' '}
                    <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${settings[r.key] ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {settings[r.key] ? 'activ' : 'oprit'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{r.hint}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold text-slate-900">{s?.sent ?? 0}</span> trimise
                    {s ? ` · ${s.sent30d} în 30 zile` : ''}
                  </div>
                  {s && s.failed > 0 && <div className="text-red-600">{s.failed} eșuate</div>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
