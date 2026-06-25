import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

/**
 * Lists collaborators (topographs etc.) with their assigned services, for the
 * admin Colaboratori dashboard. Admin-only (orders.view).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.view');
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    const { data: profiles } = await admin
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('role', 'collaborator')
      .order('created_at', { ascending: true });

    const { data: assignments } = await admin
      .from('collaborator_service_assignments')
      .select('collaborator_id, service_id, services:service_id(name, slug)');

    const byCollab: Record<string, { service_id: string; name: string; slug: string }[]> = {};
    for (const a of (assignments || [])) {
      (byCollab[a.collaborator_id] ||= []).push({
        service_id: a.service_id,
        name: a.services?.name ?? '',
        slug: a.services?.slug ?? '',
      });
    }

    const collaborators = (profiles || []).map((p: { id: string; first_name?: string; last_name?: string; email?: string }) => ({
      id: p.id,
      name: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'Colaborator',
      email: p.email || '',
      feeLabel: 'Onorariu topograf',
      services: byCollab[p.id] || [],
    }));

    // Synthetic "Avocat" entry — not a collaborator account, but the lawyer fee
    // is configured per-service (lawyer_fee_ron) on the non-cadastral services.
    // Surfaced here so admins see avocat onorarii alongside the topograph, in one place.
    const { data: lawyerSvcs } = await admin
      .from('services')
      .select('id, name, slug')
      .gt('lawyer_fee_ron', 0)
      .neq('category', 'imobiliare')
      .eq('is_active', true);
    if (lawyerSvcs && lawyerSvcs.length > 0) {
      const { data: lawyerSetting } = await admin
        .from('admin_settings').select('value').eq('key', 'lawyer_data').maybeSingle();
      const lawyerName = lawyerSetting?.value?.lawyer_name || 'Avocat';
      collaborators.unshift({
        id: '__avocat__',
        name: `${lawyerName} (avocat)`,
        email: '',
        feeLabel: 'Onorariu avocat',
        services: lawyerSvcs.map((s: { id: string; name: string; slug: string }) => ({ service_id: s.id, name: s.name, slug: s.slug })),
      });
    }

    return NextResponse.json({ success: true, data: collaborators });
  } catch (error) {
    console.error('[admin] collaborators list error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
