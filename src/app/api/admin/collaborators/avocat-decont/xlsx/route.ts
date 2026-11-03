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
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { buildAvocatDecontWorkbook, type ExportBody } from '@/lib/admin/avocat-decont-xlsx';

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
  const { buffer, name } = await buildAvocatDecontWorkbook(body);
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${name}"`,
    },
  });
}

