import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { resolveJudetId } from '@/lib/ancpi/judete';
import { effectiveIdentifier } from '@/lib/ancpi/cf-format';

/**
 * Operator creates an ANCPI job MANUALLY for a paid order — used when the CF
 * number was found by an operator (e.g. an "identificare imobil" order where the
 * client only had an address, identified via /admin/identifica-imobil), so the
 * worker can issue the extras automatically instead of the operator doing it by
 * hand on ePay. Also a fallback for extras-CF orders whose auto-queue at payment
 * didn't fire (missing property data).
 *
 * Body: { judet, localitate, identificator, identificatorType?: 'CF'|'CAD'|'TOPO', motiv? }
 *
 * Costs 1 prepaid ePay credit point per extras once the worker places the order.
 * One job per order (unique index on ancpi_jobs.order_id) → 409 if one exists.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await request.json().catch(() => ({}));
    const judet = String(body.judet ?? '').trim();
    const localitate = String(body.localitate ?? '').trim();
    const rawIdentificator = String(body.identificator ?? '').trim();
    const identificatorType = (['CF', 'CAD', 'TOPO'] as const).includes(body.identificatorType)
      ? (body.identificatorType as 'CF' | 'CAD' | 'TOPO')
      : 'CF';
    const motiv = String(body.motiv ?? '').trim() || null;

    if (!judet || !localitate || !rawIdentificator) {
      return NextResponse.json(
        { success: false, error: 'Completează județul, localitatea (UAT) și identificatorul (CF/cadastral).' },
        { status: 400 }
      );
    }
    const judetId = resolveJudetId(judet);
    if (judetId == null) {
      return NextResponse.json(
        { success: false, error: `Județ nerecunoscut de nomenclatorul ANCPI: „${judet}”.` },
        { status: 400 }
      );
    }
    // TOPO identifiers keep their raw shape; CF/CAD get the light normalization.
    const identificator =
      identificatorType === 'TOPO' ? rawIdentificator : effectiveIdentifier(rawIdentificator);

    const admin = createAdminClient();
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, payment_status')
      .eq('id', orderId)
      .single();
    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Comandă inexistentă' }, { status: 404 });
    }
    // Guard: the worker pays from prepaid credit — never burn a point on an unpaid order.
    if (order.payment_status !== 'paid' && order.payment_status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: 'Comanda nu e plătită — nu creez job (extrasul consumă credit ePay).' },
        { status: 400 }
      );
    }

    // Same detail shape as ensure-ancpi-job.ts (what the worker expects).
    const detail = {
      serviceType: 'extras-cf',
      imobile: [
        {
          judet,
          judetId,
          uat: localitate,
          uatId: null as number | null,
          identificator,
          identificatorType,
          carteFunciara: identificatorType === 'CF' ? identificator : null,
          cadastral: identificatorType === 'CAD' ? identificator : null,
          topografic: identificatorType === 'TOPO' ? identificator : null,
          immovableId: null as string | null,
          validatedAddress: null as string | null,
        },
      ],
      motiv,
      ownerName: null as string | null,
      ownerCnpCui: null as string | null,
      address: null as string | null,
      createdManuallyBy: user.id,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: job, error: insertError } = await (admin as any)
      .from('ancpi_jobs')
      .insert({
        order_id: orderId,
        status: 'PENDING',
        service_type: 'EXTRAS_CF',
        prod_id: '14200', // extras de informare, preplătit (1 punct)
        detail,
      })
      .select('id')
      .single();

    if (insertError) {
      if (insertError.code === '23505' || /duplicate key|unique/i.test(insertError.message)) {
        return NextResponse.json(
          { success: false, error: 'Există deja un job ANCPI pentru această comandă — vezi /admin/ancpi.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('ancpi_job_events').insert({
      job_id: job.id,
      order_id: orderId,
      type: 'created_manual',
      message: `Job creat manual din admin — ${identificatorType} ${identificator}, ${judet} / ${localitate}.`,
    });

    return NextResponse.json({ success: true, data: { jobId: job.id } });
  } catch (error) {
    console.error('[ancpi] manual job create error:', error);
    return NextResponse.json({ success: false, error: 'Eroare la crearea jobului' }, { status: 500 });
  }
}
