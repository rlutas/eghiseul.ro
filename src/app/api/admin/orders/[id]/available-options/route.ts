import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

/**
 * GET /api/admin/orders/[id]/available-options
 *
 * Returns the full addon catalog for the order's service, merged with the
 * options currently on the order. Powers the Modify dialog's "add new
 * service" flow: today the dialog can only toggle off what's there — this
 * endpoint gives the UI everything that COULD be added.
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       serviceSlug: string,
 *       options: Array<{
 *         optionId: string,    // service_option.id
 *         code: string,
 *         name: string,
 *         description: string | null,
 *         priceModifier: number,
 *         selected: boolean,   // is this on the order today?
 *         quantity: number,    // 1 unless already on order with N qty
 *       }>
 *     }
 *   }
 */

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface ExistingOption {
  optionId?: string;
  option_id?: string;
  quantity?: number;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    try {
      await requirePermission(user.id, 'orders.view');
    } catch (err) {
      if (err instanceof Response) return err;
      throw err;
    }

    const { id: orderId } = await context.params;
    const adminClient = createAdminClient();

    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('id, service_id, selected_options, services(slug)')
      .eq('id', orderId)
      .single();

    if (fetchError || !order || !order.service_id) {
      return NextResponse.json(
        { success: false, error: 'Comanda nu a fost găsită' },
        { status: 404 }
      );
    }

    const { data: catalog, error: catalogError } = await adminClient
      .from('service_options')
      .select('id, code, name, description, price, is_active, display_order')
      .eq('service_id', order.service_id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (catalogError) {
      console.error('[available-options] catalog fetch failed:', catalogError);
      return NextResponse.json(
        { success: false, error: 'Eroare la încărcarea opțiunilor' },
        { status: 500 }
      );
    }

    const existing = (order.selected_options ?? []) as ExistingOption[];
    const existingById = new Map<string, ExistingOption>();
    for (const o of existing) {
      const id = o.optionId ?? o.option_id;
      if (id) existingById.set(id, o);
    }

    const options = (catalog ?? []).map((c) => {
      const onOrder = existingById.get(c.id);
      return {
        optionId: c.id,
        code: c.code,
        name: c.name,
        description: c.description,
        priceModifier: Number(c.price ?? 0),
        selected: !!onOrder,
        quantity: onOrder?.quantity ?? 1,
      };
    });

    // Include any bundled / synthetic options that exist on the order but
    // aren't in the catalog (e.g., "bundled:<parent>:<child>" entries for
    // cross-service add-ons like Certificat Integritate attached to Cazier).
    // We can't toggle these on if they aren't there yet, but we surface them
    // so the admin can remove them.
    for (const o of existing) {
      const id = o.optionId ?? o.option_id;
      if (!id) continue;
      if ((catalog ?? []).some((c) => c.id === id)) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = o as any;
      options.push({
        optionId: id,
        code: raw.code ?? id,
        name: (raw.option_name ?? raw.optionName ?? 'Opțiune bundled') as string,
        description: null,
        priceModifier: Number(raw.priceModifier ?? raw.price_modifier ?? 0),
        selected: true,
        quantity: raw.quantity ?? 1,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services = order.services as any;
    const serviceSlug = Array.isArray(services) ? services[0]?.slug : services?.slug;

    return NextResponse.json({
      success: true,
      data: {
        serviceSlug: serviceSlug ?? null,
        options,
      },
    });
  } catch (err) {
    console.error('[available-options] failed:', err);
    return NextResponse.json(
      { success: false, error: 'Eroare internă.' },
      { status: 500 }
    );
  }
}
