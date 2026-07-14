import { TARIFE_ANCPI, REGULA_URGENTA } from '@/lib/ancpi/tarife-oficiale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Official ANCPI tariff reference (Ordin 16/2019) — shared by the admin page
 * and the collaborator portal so everyone quotes the same numbers. Static data,
 * server component.
 */
export function TarifeAncpiTable() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Cum funcționează taxa de urgență (Art. 4)</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5">
          <li>{REGULA_URGENTA.supliment}.</li>
          <li>{REGULA_URGENTA.plafon}.</li>
          <li>{REGULA_URGENTA.termen}.</li>
          <li>{REGULA_URGENTA.exceptii}</li>
        </ul>
        <p className="mt-2 text-xs text-amber-700">
          Sursa: {REGULA_URGENTA.sursa}. Acestea sunt taxele oficiale ANCPI — separate de onorariile
          serviciilor noastre.
        </p>
      </div>

      {TARIFE_ANCPI.map((grupa) => (
        <div key={grupa.grupa} className="rounded-xl border border-neutral-200 bg-white">
          <h2 className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold text-secondary-900">
            {grupa.grupa}
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Cod</TableHead>
                  <TableHead>Serviciu</TableHead>
                  <TableHead>Tarif normal</TableHead>
                  <TableHead>UM</TableHead>
                  <TableHead>Total în regim de urgență</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupa.tarife.map((t) => (
                  <TableRow key={t.cod}>
                    <TableCell className="align-top text-xs font-mono text-neutral-500">{t.cod}</TableCell>
                    <TableCell className="align-top text-sm">
                      {t.serviciu}
                      {t.nota && <div className="mt-0.5 text-xs text-neutral-500">{t.nota}</div>}
                    </TableCell>
                    <TableCell className="align-top text-sm font-semibold whitespace-nowrap">{t.tarif}</TableCell>
                    <TableCell className="align-top text-xs text-neutral-500 whitespace-nowrap">{t.um}</TableCell>
                    <TableCell className="align-top text-sm">{t.urgent}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
