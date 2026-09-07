/**
 * POST /api/admin/collaborators/avocat-decont/xlsx
 *
 * Exportul Excel al decontului lunar cu avocata colaboratoare — reproduce
 * foaia pe care Raul o făcea manual (referință: „IUNIE - Foaie2"): o filă cu
 * toate comenzile (inclusiv numerele de contract și de delegație din registrul
 * central Barou) și o filă de decont cu totalurile, cheltuielile lunii și
 * împărțirea profitului.
 *
 * Cheltuielile se trimit din formularul de generare (nu sunt hardcodate) —
 * inclusiv linii libere pentru cheltuieli ocazionale.
 */
import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { buildDecont, platformLabel, round2, ONORARIU_PER_COMANDA, TVA, type DecontRow } from '@/lib/admin/avocat-decont';

interface CostLine { label: string; amount: number }

interface ExportBody {
  month?: string;
  platform?: 'all' | 'eghiseul' | 'cjo';
  /** Cheltuielile lunii, în ordinea în care apar în foaie. */
  costs?: CostLine[];
  /** Procentul lui Raul din profitul rămas (restul merge la avocată). */
  splitRaulPercent?: number;
  /** Impozit pe profit (%) și impozit pe dividende (%). */
  profitTaxPercent?: number;
  dividendTaxPercent?: number;
  /** Factura cabinetului către noi, scăzută la final. */
  facturaCabinet?: number;
  /** Comisionul Stripe: implicit cel real, din tranzacțiile sincronizate. */
  stripeFeeOverride?: number;
}

const MONEY = '#,##0.00';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Neautentificat' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'orders.view');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  const body = (await request.json().catch(() => ({}))) as ExportBody;
  const month = body.month ?? '';
  const platform = body.platform ?? 'all';
  const costs = (body.costs ?? []).filter((c) => c && c.label && Number.isFinite(Number(c.amount)));
  const splitRaul = clamp(Number(body.splitRaulPercent ?? 55), 0, 100);
  const profitTax = clamp(Number(body.profitTaxPercent ?? 16), 0, 100);
  const dividendTax = clamp(Number(body.dividendTaxPercent ?? 16), 0, 100);
  const facturaCabinet = Number(body.facturaCabinet ?? 0) || 0;

  const { rows, summary, byPlatform, warnings } = await buildDecont({ month, platform, enrich: true });
  const real = rows.filter((r) => !r.isTest);

  const stripeFeeReal = round2(real.reduce((s, r) => s + (r.stripeFee ?? 0), 0));
  const stripeFee = Number.isFinite(Number(body.stripeFeeOverride)) && body.stripeFeeOverride !== undefined
    ? Number(body.stripeFeeOverride)
    : stripeFeeReal;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'eghiseul.ro';
  wb.created = new Date();

  // ── Fila 1: comenzile ────────────────────────────────────────────────────
  const ws = wb.addWorksheet('Comenzi', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [
    { header: 'Nr', key: 'nr', width: 5 },
    { header: 'Data', key: 'data', width: 11 },
    { header: 'Ora', key: 'ora', width: 7 },
    { header: 'Platformă', key: 'platforma', width: 22 },
    { header: 'Comandă', key: 'comanda', width: 20 },
    { header: 'Serviciu', key: 'serviciu', width: 34 },
    { header: 'Serviciu (RON)', key: 'cazier', width: 14, style: { numFmt: MONEY } },
    { header: 'Urgență', key: 'urgenta', width: 11, style: { numFmt: MONEY } },
    { header: 'Apostilă Haga', key: 'apostila', width: 14, style: { numFmt: MONEY } },
    { header: 'Add-on cabinet', key: 'addon', width: 15, style: { numFmt: MONEY } },
    { header: 'Total cu TVA', key: 'total', width: 14, style: { numFmt: MONEY } },
    { header: 'Fără TVA', key: 'totalNet', width: 13, style: { numFmt: MONEY } },
    { header: 'Nr. contract', key: 'contract', width: 15 },
    { header: 'Nr. delegație', key: 'delegatie', width: 15 },
    { header: 'Nume client', key: 'client', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Telefon', key: 'telefon', width: 16 },
    { header: 'Onorariu', key: 'onorariu', width: 10, style: { numFmt: MONEY } },
    { header: 'Retur', key: 'retur', width: 10, style: { numFmt: MONEY } },
    { header: 'Observații', key: 'obs', width: 40 },
  ];
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

  real.forEach((r, i) => {
    const paid = r.paidAt ? new Date(r.paidAt) : null;
    ws.addRow({
      nr: i + 1,
      data: paid ? paid.toISOString().slice(0, 10) : '',
      ora: paid ? paid.toISOString().slice(11, 16) : '',
      platforma: platformLabel(r.platform),
      comanda: r.orderNumber,
      serviciu: r.service,
      cazier: r.cazier,
      urgenta: r.urgenta || null,
      apostila: r.apostila || null,
      addon: r.addon || null,
      total: r.total,
      totalNet: r.totalNet,
      contract: r.contractNumber ?? '',
      delegatie: r.delegationNumber ?? '',
      client: r.client,
      email: r.email ?? '',
      telefon: r.phone ?? '',
      onorariu: ONORARIU_PER_COMANDA,
      retur: r.refunded || null,
      obs: observatii(r),
    });
  });

  const totalRow = ws.addRow({
    platforma: 'TOTAL',
    cazier: summary.totalCazier,
    urgenta: summary.totalUrgenta,
    apostila: summary.totalApostila,
    addon: summary.totalAddon,
    total: summary.total,
    totalNet: summary.totalNet,
    onorariu: summary.onorarii,
  });
  totalRow.font = { bold: true };
  totalRow.border = { top: { style: 'thin' } };
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };

  // ── Fila 2: decontul ─────────────────────────────────────────────────────
  const d = wb.addWorksheet('Decont');
  d.columns = [
    { header: '', key: 'label', width: 52 },
    { header: '', key: 'value', width: 16, style: { numFmt: MONEY } },
    { header: '', key: 'note', width: 46 },
  ];
  const line = (label: string, value?: number | null, note?: string, opts?: { bold?: boolean; top?: boolean }) => {
    const r = d.addRow({ label, value: value ?? null, note: note ?? '' });
    if (opts?.bold) r.font = { bold: true };
    if (opts?.top) r.border = { top: { style: 'thin' } };
    return r;
  };

  line(`DECONT AVOCATĂ — ${month || 'toate lunile'}`, null, '', { bold: true });
  line('');
  line('Servicii cabinet (cu TVA)', summary.total, `${summary.count} comenzi`, { bold: true });
  line('  din care serviciu', summary.totalCazier);
  line('  din care urgență', summary.totalUrgenta);
  line('  din care apostilă Haga', summary.totalApostila, `${summary.apostilaCount} apostile`);
  line('  din care add-on cabinet', summary.totalAddon);
  line('');
  for (const [key, s] of [['eghiseul', byPlatform.eghiseul], ['cjo', byPlatform.cjo]] as const) {
    if (!s.count) continue;
    line(`  ${platformLabel(key)}`, s.total, `${s.count} comenzi · ${fmt(s.totalNet)} fără TVA`);
  }
  line('');
  const tva = round2(summary.total - summary.total / TVA);
  line('TVA 21%', -tva, 'inclus în sumele de mai sus', { top: true });
  line('Comision Stripe', -stripeFee, stripeFee === stripeFeeReal ? 'real, din tranzacțiile sincronizate' : `real: ${fmt(stripeFeeReal)}`);
  for (const c of costs) line(c.label, -Math.abs(Number(c.amount)));
  const costsSum = costs.reduce((s, c) => s + Math.abs(Number(c.amount)), 0);
  const ramas = round2(summary.total - tva - stripeFee - costsSum);
  line('TOTAL RĂMAS', ramas, '', { bold: true, top: true });
  const impozitProfit = round2((ramas * profitTax) / 100);
  line(`Impozit pe profit ${profitTax}%`, -impozitProfit);
  const dupaImpozit = round2(ramas - impozitProfit);
  line('TOTAL RĂMAS după impozit pe profit', dupaImpozit, '', { bold: true });
  line('');
  const partRaul = round2((dupaImpozit * splitRaul) / 100);
  const partGabi = round2(dupaImpozit - partRaul);
  line(`RAUL (${splitRaul}%)`, partRaul, '', { bold: true });
  line(`AVOCATĂ (${round2(100 - splitRaul)}%)`, partGabi, '', { bold: true });
  line(`− Factura cabinet (${summary.count} × ${ONORARIU_PER_COMANDA})`, -summary.onorarii, 'onorariile, facturate separat de cabinet');
  const dupaOnorarii = round2(partGabi - summary.onorarii);
  line('RĂMAS AVOCATĂ', dupaOnorarii);
  const dividende = round2((dupaOnorarii * dividendTax) / 100);
  line(`Impozit dividende ${dividendTax}%`, -dividende);
  const dupaDividende = round2(dupaOnorarii - dividende);
  line('RĂMAS AVOCATĂ după dividende', dupaDividende);
  if (facturaCabinet) {
    line('− Factura cabinet (curentă)', -Math.abs(facturaCabinet));
    line('RĂMAS TOTAL DUPĂ TOT', round2(dupaDividende - Math.abs(facturaCabinet)), '', { bold: true, top: true });
  } else {
    line('RĂMAS TOTAL DUPĂ TOT', dupaDividende, '', { bold: true, top: true });
  }

  if (warnings.length) {
    line('');
    line('DE VERIFICAT', null, '', { bold: true, top: true });
    for (const w of warnings) line(w);
  }
  line('');
  line('Excluse din decont', null, 'livrare, traducere, legalizare, apostilă notari, alte extra');
  line('Retururi', null, 'se scad întâi din ce nu e al cabinetului; restul taie partea ei');

  const buffer = await wb.xlsx.writeBuffer();
  const name = `decont-avocat-${month || 'toate'}.xlsx`;
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${name}"`,
    },
  });
}

function observatii(r: DecontRow): string {
  const parts: string[] = [];
  if (r.refunded > 0) parts.push(`retur ${fmt(r.refunded)} RON — decontat doar ce a rămas`);
  if (!r.contractNumber) parts.push('fără număr de contract în registru');
  if (!r.delegationNumber) parts.push('fără număr de delegație în registru');
  return parts.join(' · ');
}

function fmt(n: number): string {
  return n.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
