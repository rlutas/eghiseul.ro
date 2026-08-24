/**
 * GET /api/collaborator/orders/[id]/cerere[?imobil=<index>]
 *
 * Serves the "Cerere pentru eliberare extras de carte funciara pentru informare"
 * (Anexa nr. 6) for ONE imobil of an extras-CF order, already filled in and
 * named in the collaborator's convention:
 *
 *   cf 101010 - Baile Govora-Valcea.pdf
 *
 * He signs it electronically and files it at OCPI — he reads the CF number, UAT
 * and county off the FILENAME and never opens the document, so the name and the
 * content are generated from the same order data and cannot drift apart.
 *
 * Privacy: this cerere carries HIS applicant data, not the client's — nothing
 * about the customer leaves the server here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import { cereriForOrderSlug, type OrderForCereri } from '@/lib/ancpi/cereri-for-order';
import { cerereDateRo } from '@/lib/ancpi/cerere-date';
import { generateCerereExtrasCfPdf } from '@/lib/documents/cerere-extras-cf-pdf';
import { CERERE_SLUGS, IDENTIFICARE_SLUGS } from '@/lib/ancpi/cerere-scope';
import { contentDisposition } from '@/lib/http/content-disposition';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 });
    }

    try {
      const { collaboratorId } = await resolveCollaboratorContext(
        user.id,
        request.nextUrl.searchParams.get('as')
      );
      await requireCollaboratorForOrder(collaboratorId, orderId);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const admin = createAdminClient();
    const { data: order, error } = await admin
      .from('orders')
      .select('id, friendly_order_id, customer_data, services:service_id(slug)')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });
    }

    const svc = order.services as { slug?: string } | { slug?: string }[] | null;
    const slug = Array.isArray(svc) ? svc[0]?.slug : svc?.slug;
    const isIdentificare = (IDENTIFICARE_SLUGS as readonly string[]).includes(slug ?? '');
    if (!slug || (!CERERE_SLUGS[slug] && !isIdentificare)) {
      return NextResponse.json(
        { success: false, error: 'Serviciul comenzii nu are cerere OCPI generabilă' },
        { status: 400 }
      );
    }

    const cereri = cereriForOrderSlug(
      {
        friendly_order_id: order.friendly_order_id ?? orderId,
        customer_data: order.customer_data as OrderForCereri['customer_data'],
      },
      slug,
      cerereDateRo()
    );
    if (cereri.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: isIdentificare
            ? 'Completează întâi identificarea imobilului (nr. CF găsit) — cererea de extras CF se generează din ea'
            : 'Comanda nu are date de imobil (nr. CF / cadastral) — nu se poate genera cererea',
        },
        { status: 400 }
      );
    }

    const requested = request.nextUrl.searchParams.get('imobil');
    const cerere = requested === null
      ? cereri[0]
      : cereri.find(c => c.index === Number(requested));

    if (!cerere) {
      return NextResponse.json({ success: false, error: 'Imobilul cerut nu există pe comandă' }, { status: 404 });
    }

    const pdf = await generateCerereExtrasCfPdf(cerere.data, cerere.template);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition(cerere.name),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[collaborator] cerere CF error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
