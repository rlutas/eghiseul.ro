import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserPermissions, getCollaboratorServices } from '@/lib/admin/permissions';

/**
 * The collaborator's assigned services with the client price and THEIR
 * per-order fee (services.lawyer_fee_ron — the "Onorariu Topograf" line on the
 * invoice). Read-only info page data.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { role } = await getUserPermissions(user.id);
    if (role !== 'collaborator') {
      return NextResponse.json({ success: false, error: 'Collaborator access required' }, { status: 403 });
    }

    const serviceIds = await getCollaboratorServices(user.id);
    if (serviceIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data, error } = await admin
      .from('services')
      .select('id, name, slug, base_price, lawyer_fee_ron, processing_config')
      .in('id', serviceIds)
      .order('name');

    if (error) {
      console.error('[collaborator] services error:', error.message);
      return NextResponse.json({ success: false, error: 'Eroare la încărcarea serviciilor' }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services = (data ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      clientPrice: Number(s.base_price) || 0,
      fee: Number(s.lawyer_fee_ron) || 0,
      ancpiCost: s.processing_config?.ancpi_cost_ron != null ? Number(s.processing_config.ancpi_cost_ron) : null,
    }));

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error('[collaborator] services error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
