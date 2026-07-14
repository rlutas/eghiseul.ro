'use client';

/**
 * /admin/decontari/[payoutId] — payout detail: every transaction with order,
 * platform, client, Oblio invoice, gross/fee/net. Print-ready (replaces the
 * manual "print Stripe payout + write invoice numbers by hand" workflow) +
 * CSV export per payout.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Tx {
  id: string;
  type: string;
  gross_bani: number;
  fee_bani: number;
  net_bani: number;
  description: string | null;
  platform: string;
  order_number: string | null;
  service_name: string | null;
  client_name: string | null;
  client_email: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
}

interface Payout {
  id: string;
  amount_bani: number;
  status: string;
  arrival_date: string | null;
  tx_count: number;
  matched_count: number;
  synced_at: string;
}

const ron = (bani: number) =>
  (bani / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function PlatformBadge({ platform }: { platform: string }) {
  if (platform === 'eghiseul') return <Badge className="bg-blue-100 text-blue-800">eGhișeul</Badge>;
  if (platform === 'cjo') return <Badge className="bg-purple-100 text-purple-800">CJO</Badge>;
  return <Badge className="bg-neutral-200 text-neutral-700">?</Badge>;
}

export default function PayoutDetailPage() {
  const { payoutId } = useParams<{ payoutId: string }>();
  const [payout, setPayout] = useState<Payout | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/decontari/${payoutId}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setPayout(json.data.payout);
        setTxs(json.data.transactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [payoutId]);

  if (error) return <p className="p-8 text-red-600">Eroare: {error}</p>;
  if (!payout) return <p className="p-8 text-neutral-500">Se încarcă…</p>;

  const charges = txs.filter((t) => t.type === 'charge');
  const refunds = txs.filter((t) => t.type === 'refund');
  const others = txs.filter((t) => t.type !== 'charge' && t.type !== 'refund');
  const totGross = txs.reduce((a, t) => a + t.gross_bani, 0);
  const totFee = txs.reduce((a, t) => a + t.fee_bani, 0);
  const totNet = txs.reduce((a, t) => a + t.net_bani, 0);
  const reconciles = totNet === payout.amount_bani;

  const Row = ({ t }: { t: Tx }) => (
    <tr className="border-b last:border-b-0">
      <td className="px-3 py-2 whitespace-nowrap">
        {t.order_number ? (
          t.platform === 'eghiseul' ? (
            <Link href={`/admin/orders?search=${encodeURIComponent(t.order_number)}`} className="text-primary-700 hover:underline print:text-black print:no-underline">
              {t.order_number}
            </Link>
          ) : (
            t.order_number
          )
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </td>
      <td className="px-3 py-2 print:hidden"><PlatformBadge platform={t.platform} /></td>
      <td className="hidden print:table-cell px-3 py-2">{t.platform === 'cjo' ? 'CJO' : t.platform === 'eghiseul' ? 'eGhișeul' : '?'}</td>
      <td className="px-3 py-2">
        <div>{t.client_name || <span className="text-neutral-400">{t.client_email || '—'}</span>}</div>
        {t.client_name && t.client_email && (
          <div className="text-xs text-neutral-400 print:hidden">{t.client_email}</div>
        )}
      </td>
      <td className="px-3 py-2 max-w-[180px] truncate" title={t.service_name ?? t.description ?? ''}>
        {t.service_name ?? t.description ?? '—'}
      </td>
      <td className="px-3 py-2">
        {t.invoice_number ? (
          t.invoice_url ? (
            <a href={t.invoice_url} target="_blank" rel="noopener" className="text-primary-700 hover:underline inline-flex items-center gap-1 print:text-black print:no-underline">
              {t.invoice_number} <ExternalLink className="h-3 w-3 print:hidden" />
            </a>
          ) : (
            t.invoice_number
          )
        ) : (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" /> nefacturat
          </Badge>
        )}
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">{ron(t.gross_bani)}</td>
      <td className="px-3 py-2 text-right whitespace-nowrap text-neutral-500">{ron(-t.fee_bani)}</td>
      <td className="px-3 py-2 text-right whitespace-nowrap font-medium">{ron(t.net_bani)}</td>
    </tr>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5 print:p-2">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/decontari" className="inline-flex items-center text-sm text-neutral-600 hover:text-secondary-900">
          <ArrowLeft className="h-4 w-4 mr-1" /> Toate decontările
        </Link>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`/api/admin/decontari/export?payout=${payout.id}`}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </a>
          </Button>
          <Button onClick={() => window.print()} size="sm">
            <Printer className="h-4 w-4 mr-1" /> Printează
          </Button>
        </div>
      </div>

      {/* Header — visible in print too */}
      <div>
        <h1 className="text-xl font-bold text-secondary-900">
          Decontare Stripe — {payout.arrival_date ?? 'în tranzit'}
        </h1>
        <p className="text-sm text-neutral-500 font-mono">{payout.id}</p>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <span>Sumă payout: <strong>{ron(payout.amount_bani)} RON</strong></span>
          <span>Tranzacții: <strong>{charges.length}</strong>{refunds.length > 0 && <> + {refunds.length} rambursări</>}</span>
          <span>Facturate: <strong>{payout.matched_count}/{payout.tx_count}</strong></span>
          {!reconciles && (
            <span className="text-red-600 font-medium">⚠️ Totalul tranzacțiilor ({ron(totNet)}) diferă de payout!</span>
          )}
        </div>
      </div>

      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-neutral-50 text-left text-neutral-600 border-b">
            <th className="px-3 py-2 font-medium">Comandă</th>
            <th className="px-3 py-2 font-medium">Platformă</th>
            <th className="px-3 py-2 font-medium">Client</th>
            <th className="px-3 py-2 font-medium">Serviciu</th>
            <th className="px-3 py-2 font-medium">Factură Oblio</th>
            <th className="px-3 py-2 font-medium text-right">Brut</th>
            <th className="px-3 py-2 font-medium text-right">Fee</th>
            <th className="px-3 py-2 font-medium text-right">Net</th>
          </tr>
        </thead>
        <tbody>
          {charges.map((t) => <Row key={t.id} t={t} />)}
          {refunds.length > 0 && (
            <tr className="bg-red-50/50">
              <td colSpan={8} className="px-3 py-1.5 text-xs font-semibold text-red-700 uppercase">Rambursări</td>
            </tr>
          )}
          {refunds.map((t) => <Row key={t.id} t={t} />)}
          {others.map((t) => <Row key={t.id} t={t} />)}
        </tbody>
        <tfoot>
          <tr className="bg-neutral-100 font-semibold border-t">
            <td className="px-3 py-2" colSpan={5}>TOTAL</td>
            <td className="px-3 py-2 text-right">{ron(totGross)}</td>
            <td className="px-3 py-2 text-right">{ron(-totFee)}</td>
            <td className="px-3 py-2 text-right">{ron(totNet)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="text-xs text-neutral-400 print:block">
        Generat din eGhișeul Admin · sincronizat {new Date(payout.synced_at).toLocaleString('ro-RO')} · sume în RON
      </p>
    </div>
  );
}
