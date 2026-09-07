/**
 * GET /api/admin/collaborators/avocat-decont?month=YYYY-MM[&platform=all|eghiseul|cjo][&format=tsv]
 *
 * Raportul de decont al avocatei colaboratoare — vezi regulile complete în
 * `@/lib/admin/avocat-decont` (calculul e comun cu exportul Excel din
 * `./xlsx`). Aici rămâne doar handler-ul HTTP: autorizare, parametri, TSV.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { buildDecont, platformLabel, round2, ONORARIU_PER_COMANDA, TVA } from '@/lib/admin/avocat-decont';

export async function GET(request: NextRequest) {
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

  const month = request.nextUrl.searchParams.get('month') || '';
  const format = request.nextUrl.searchParams.get('format') || '';
  const platform = (request.nextUrl.searchParams.get('platform') || 'all') as 'all' | 'eghiseul' | 'cjo';

  const { rows, summary, byPlatform, warnings } = await buildDecont({ month, platform });

  if (format === 'tsv') {
    const head = ['Platforma', 'Comanda', 'Data platii', 'Client', 'Serviciu', 'Status', 'Serviciu (cu TVA)', 'Urgenta', 'Apostila Haga', 'Add-on cabinet', 'Total (cu TVA)', 'Total (fara TVA)', 'Onorariu', 'Retur'];
    const lines = rows.map((r) =>
      [platformLabel(r.platform), r.orderNumber, (r.paidAt || '').slice(0, 10), r.client, r.service, r.status, r.cazier, r.urgenta, r.apostila, r.addon, r.total, r.totalNet, ONORARIU_PER_COMANDA, r.refunded || ''].join('\t')
    );
    lines.push('');
    for (const [key, s] of [['eghiseul', byPlatform.eghiseul], ['cjo', byPlatform.cjo]] as const) {
      if (!s.count) continue;
      lines.push([`TOTAL ${platformLabel(key)} (${s.count} comenzi)`, '', '', '', '', '', s.totalCazier, s.totalUrgenta, s.totalApostila, s.totalAddon, s.total, s.totalNet, s.onorarii, ''].join('\t'));
    }
    lines.push(['TOTAL GENERAL', '', '', '', '', '', summary.totalCazier, summary.totalUrgenta, summary.totalApostila, summary.totalAddon, summary.total, summary.totalNet, summary.onorarii, ''].join('\t'));
    lines.push([`  din care APOSTILE HAGA (${summary.apostilaCount} buc)`, '', '', '', '', '', '', '', summary.totalApostila, '', '', round2(summary.totalApostila / TVA), '', ''].join('\t'));
    lines.push(['ONORARII (se scad la decontare)', '', '', '', '', '', '', '', '', '', '', '', summary.onorarii, ''].join('\t'));
    lines.push(['EXCLUSE din decont: livrare, traducere, legalizare, apostila notarilor, alte extra'].join('\t'));
    return new NextResponse([head.join('\t'), ...lines].join('\n'), {
      headers: {
        'Content-Type': 'text/tab-separated-values; charset=utf-8',
        'Content-Disposition': `attachment; filename="decont-avocat-${month || 'toate'}.tsv"`,
      },
    });
  }

  return NextResponse.json({ success: true, data: { rows, summary, byPlatform, warnings } });
}
