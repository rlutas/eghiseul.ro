'use client';

/**
 * /admin/costuri-furnizori — raport lunar al costurilor de la colaboratori
 * (traducător/notar/…). Grupat pe furnizor, cu comenzi + documente + total,
 * ca să combați factura furnizorului la sfârșit de lună. Sursă:
 * order_supplier_costs (migration 136). Auth: payments.verify.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import { SUPPLIER_CATEGORY_LABELS } from '@/lib/admin/supplier-costs';

interface CostRow {
  id: string;
  order_id: string;
  supplier: string;
  category: string;
  description: string | null;
  document_language: string | null;
  amount_ron: number;
  created_at: string;
  orderNumber: string;
  client: string;
}
interface SupplierGroup {
  supplier: string;
  count: number;
  total: number;
  rows: CostRow[];
}
interface Report {
  month: string;
  grandTotal: number;
  count: number;
  suppliers: SupplierGroup[];
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function CosturiFurnizoriPage() {
  const [month, setMonth] = useState(currentMonth());
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/supplier-costs?month=${month}`);
      const json = await res.json();
      if (json.success) setReport(json.data as Report);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const catLabel = (c: string) => SUPPLIER_CATEGORY_LABELS[c as keyof typeof SUPPLIER_CATEGORY_LABELS] || c;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Coins className="h-5 w-5" /> Costuri furnizori
          </h1>
          <p className="text-sm text-muted-foreground">
            Cât ne-au costat colaboratorii (traducător/notar/…) pe lună — de combătut cu factura lor.
          </p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : !report || report.count === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Niciun cost înregistrat în {month}. Costurile se adaugă din pagina fiecărei comenzi
            (&bdquo;Cost intern &amp; marjă&rdquo;).
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-lg border bg-neutral-50 p-4 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total lună</p>
              <p className="text-2xl font-bold tabular-nums">{report.grandTotal.toFixed(2)} lei</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Înregistrări</p>
              <p className="text-2xl font-bold tabular-nums">{report.count}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Furnizori</p>
              <p className="text-2xl font-bold tabular-nums">{report.suppliers.length}</p>
            </div>
          </div>

          {report.suppliers.map((sup) => (
            <Card key={sup.supplier}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{sup.supplier}</span>
                  <span className="tabular-nums">
                    {sup.count} lucrări · <strong>{sup.total.toFixed(2)} lei</strong>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b">
                        <th className="py-1.5 pr-2">Data</th>
                        <th className="py-1.5 pr-2">Comandă</th>
                        <th className="py-1.5 pr-2">Client</th>
                        <th className="py-1.5 pr-2">Categorie</th>
                        <th className="py-1.5 pr-2">Descriere</th>
                        <th className="py-1.5 pr-2 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sup.rows.map((r) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="py-1.5 pr-2 whitespace-nowrap text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })}
                          </td>
                          <td className="py-1.5 pr-2 whitespace-nowrap">
                            <Link href={`/admin/orders/${r.order_id}`} className="font-mono text-xs underline">
                              {r.orderNumber}
                            </Link>
                          </td>
                          <td className="py-1.5 pr-2 truncate max-w-[160px]">{r.client}</td>
                          <td className="py-1.5 pr-2">
                            <Badge variant="secondary">{catLabel(r.category)}</Badge>
                          </td>
                          <td className="py-1.5 pr-2 text-muted-foreground truncate max-w-[220px]">
                            {r.description}{r.document_language ? ` · ${r.document_language}` : ''}
                          </td>
                          <td className="py-1.5 pr-2 text-right font-medium tabular-nums whitespace-nowrap">
                            {Number(r.amount_ron).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
