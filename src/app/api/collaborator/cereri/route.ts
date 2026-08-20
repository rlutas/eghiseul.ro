/**
 * GET /api/collaborator/cereri
 *
 * Every cerere the topograph still has to file, as one ZIP. His own words:
 * "am nevoie de ajutor dacă aveți cereri multe" — downloading them one by one
 * is the part that does not scale, so this is the bulk path: unzip, batch-sign,
 * file.
 *
 * Scope = paid extras-CF orders of his, minus the ones already delivered. Names
 * follow his convention and are de-duplicated across orders, so a ZIP can never
 * overwrite one paid job with another that happens to share a CF number.
 */

import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCollaboratorServices } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import { cereriForOrder, type OrderForCereri } from '@/lib/ancpi/cereri-for-order';
import { disambiguateFilenames } from '@/lib/ancpi/cerere-filename';
import { cerereDateRo } from '@/lib/ancpi/cerere-date';
import { generateCerereExtrasCfPdf } from '@/lib/documents/cerere-extras-cf-pdf';
import { CERERE_CF_SLUG, CERERE_DONE_STATUSES } from '@/lib/ancpi/cerere-scope';
import { contentDisposition } from '@/lib/http/content-disposition';

/** Ceiling per ZIP — a few hundred cereri would time out the function. */
const MAX_ORDERS = 100;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 });
    }

    let collaboratorId: string;
    try {
      ({ collaboratorId } = await resolveCollaboratorContext(
        user.id,
        request.nextUrl.searchParams.get('as')
      ));
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const serviceIds = await getCollaboratorServices(collaboratorId);
    const scopeFilter = serviceIds.length > 0
      ? `service_id.in.(${serviceIds.join(',')}),assigned_collaborator_id.eq.${collaboratorId}`
      : `assigned_collaborator_id.eq.${collaboratorId}`;

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any)
      .from('orders')
      .select('id, friendly_order_id, status, created_at, customer_data, services:service_id!inner(slug)')
      .or(scopeFilter)
      .eq('payment_status', 'paid')
      .eq('services.slug', CERERE_CF_SLUG)
      .not('status', 'in', `(${CERERE_DONE_STATUSES.join(',')})`)
      // oldest first: the client who has been waiting longest gets filed first
      .order('created_at', { ascending: true })
      .limit(MAX_ORDERS);

    if (error) {
      console.error('[collaborator] cereri ZIP query error:', error.message);
      return NextResponse.json({ success: false, error: 'Eroare la încărcarea comenzilor' }, { status: 500 });
    }

    const orders = (data ?? []) as OrderForCereri[];
    const date = cerereDateRo();
    const cereri = orders.flatMap(order => cereriForOrder(order, date));

    if (cereri.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nu ai cereri de depus în acest moment' },
        { status: 404 }
      );
    }

    const names = disambiguateFilenames(cereri.map(c => ({ name: c.name, orderRef: c.orderRef })));

    const zip = new PizZip();
    for (let i = 0; i < cereri.length; i++) {
      zip.file(names[i], await generateCerereExtrasCfPdf(cereri[i].data));
    }
    const buffer: Buffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });

    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': contentDisposition(`cereri extras cf ${stamp} (${cereri.length}).zip`),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[collaborator] cereri ZIP error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
