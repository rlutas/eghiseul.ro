'use client';

/**
 * Banner „facturi furnizori nepredate contabilului" — stă pe Decontări și pe
 * Extras bancă până când fiecare lună are toți furnizorii bifați „Predată".
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface MonthRow { month: string; suppliers: number; handed: number }

const MONTHS_RO = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
const monthLabel = (m: string) => {
  const [y, mm] = m.split('-').map(Number);
  return `${MONTHS_RO[mm - 1]} ${y}`;
};

export function SupplierInvoicesBanner({ refreshKey = 0 }: { refreshKey?: number }) {
  const [months, setMonths] = useState<MonthRow[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/decontari/facturi-furnizori')
      .then((r) => r.json())
      .then((j) => { if (j.success) setMonths(j.data.months); })
      .catch(() => { /* bannerul e doar semnal — fără el pagina merge */ });
  }, [refreshKey]);

  if (!months || months.length === 0) return null;
  const pending = months.filter((m) => m.handed < m.suppliers);

  if (pending.length === 0) {
    return (
      <Link href="/admin/decontari/facturi-furnizori" className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800 hover:bg-green-100">
        <CheckCircle className="h-4 w-4" /> Facturi furnizori: toate lunile predate contabilului.
      </Link>
    );
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold flex items-center gap-1.5">
        <AlertTriangle className="h-4 w-4" /> Facturi furnizori (Meta, Google, TikTok, OpenAI…) nepredate contabilului
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {pending.map((m) => (
          <li key={m.month}>
            <Link href={`/admin/decontari/facturi-furnizori?month=${m.month}`} className="underline capitalize">
              {monthLabel(m.month)}
            </Link>
            : {m.suppliers - m.handed} din {m.suppliers} furnizori nepredați
          </li>
        ))}
      </ul>
    </div>
  );
}
