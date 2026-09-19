'use client';

/**
 * Card „KPI marketing" din /admin/marketing — ce am trimis, ce comenzi au
 * venit din asta, cât venit; pe 7 / 30 / 90 de zile. Sursa:
 * GET /api/admin/marketing/kpis. Judecăm după comenzi și venit, nu după
 * deschideri (Apple MPP le umflă).
 */

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, RefreshCw } from 'lucide-react';

interface Attributed {
  orders: number;
  revenueRon: number;
}
interface Kpis {
  days: number;
  paidOrdersInWindow: number;
  recovery: { sent: { step1: number; step2: number; step3: number }; converted: Attributed; couponsUsed: Attributed };
  phone: { contacted: number; contactedAll: number; converted: Attributed; couponsUsed: Attributed };
  lifecycle: Record<string, { sent: number } & Attributed>;
  warmup: { sent: number; sentAll: number; unsubscribed: number } & Attributed;
  campaigns: Array<{ id: string; name: string; status: string; sent: number } & Attributed>;
}

const ron = (n: number) => `${n.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON`;
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : '—');

export function MarketingKpisCard() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/marketing/kpis?days=${days}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const rows: Array<{ channel: string; sent: string; orders: number; revenue: number; note?: string }> = data
    ? [
        {
          channel: 'Recovery email (3 pași)',
          sent: `${data.recovery.sent.step1 + data.recovery.sent.step2 + data.recovery.sent.step3} (${data.recovery.sent.step1}/${data.recovery.sent.step2}/${data.recovery.sent.step3})`,
          orders: data.recovery.converted.orders,
          revenue: data.recovery.converted.revenueRon,
          note: `comenzi plătite după ≥1 email · cupon RECOVERY folosit: ${data.recovery.couponsUsed.orders}`,
        },
        {
          channel: 'Recuperare telefonică',
          sent: `${data.phone.contacted} sunați`,
          orders: data.phone.converted.orders,
          revenue: data.phone.converted.revenueRon,
          note: `conversie ${pct(data.phone.converted.orders, data.phone.contacted)} · cupon TEL folosit: ${data.phone.couponsUsed.orders}`,
        },
        {
          channel: 'Recenzie Google',
          sent: String(data.lifecycle.review_request?.sent ?? 0),
          orders: data.lifecycle.review_request?.orders ?? 0,
          revenue: data.lifecycle.review_request?.revenueRon ?? 0,
          note: 'rezultatul real = recenzii noi pe profilul Google (numără manual)',
        },
        {
          channel: 'Reminder expirare',
          sent: String(data.lifecycle.expiry_reminder?.sent ?? 0),
          orders: data.lifecycle.expiry_reminder?.orders ?? 0,
          revenue: data.lifecycle.expiry_reminder?.revenueRon ?? 0,
          note: 'comenzi cu utm_campaign=expiry',
        },
        {
          channel: 'Cross-sell',
          sent: String(data.lifecycle.cross_sell?.sent ?? 0),
          orders: data.lifecycle.cross_sell?.orders ?? 0,
          revenue: data.lifecycle.cross_sell?.revenueRon ?? 0,
          note: 'comenzi cu utm_campaign=cross_sell',
        },
        {
          channel: 'Warm-up (registru 72k)',
          sent: `${data.warmup.sent} (total ${data.warmup.sentAll})`,
          orders: data.warmup.orders,
          revenue: data.warmup.revenueRon,
          note: `dezabonați dintre cei trimiși: ${data.warmup.unsubscribed} (${pct(data.warmup.unsubscribed, data.warmup.sentAll)}) — peste 0,5% = oprește și revizuiește textul`,
        },
        ...data.campaigns.map((c) => ({
          channel: `Campanie: ${c.name}`,
          sent: `${c.sent} (${c.status})`,
          orders: c.orders,
          revenue: c.revenueRon,
        })),
      ]
    : [];

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <BarChart3 className="h-5 w-5" />
            KPI marketing — ultimele {days} zile
          </h2>
          <div className="flex items-center gap-1">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium ${days === d ? 'border-slate-400 bg-slate-100 text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {d} zile
              </button>
            ))}
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Comenzile se leagă de email prin UTM-urile din linkuri (`orders.attribution.last`) sau direct (recovery: comanda a primit emailul; telefon: bifa
          „sunat”). Nu măsurăm deschideri — Apple Mail le umflă. {data ? `Comenzi plătite în fereastră, toate canalele: ${data.paidOrdersInWindow}.` : ''}
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-3 py-2">Canal</th>
                <th className="px-3 py-2">Trimise</th>
                <th className="px-3 py-2 text-right">Comenzi</th>
                <th className="px-3 py-2 text-right">Venit</th>
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    Se încarcă…
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.channel} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{r.channel}</div>
                      {r.note && <div className="text-[11px] text-muted-foreground">{r.note}</div>}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{r.sent}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">{r.orders}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{ron(r.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
