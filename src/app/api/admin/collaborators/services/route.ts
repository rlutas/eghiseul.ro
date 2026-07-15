import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

/**
 * Collaborator service assignments — admin-manageable (decizie Raul
 * 2026-07-15: bife pe servicii în /admin/colaboratori, nu migrări manuale).
 *
 * GET  ?collaboratorId=<uuid> → all active services + assigned flag
 * POST { collaboratorId, serviceId, assigned } → insert/delete the assignment
 *
 * Permission: users.manage (schimbă cine vede comenzile clienților prin RLS —
 * mai mult decât orders.view).
 */

async function requireAdmin(): Promise<Response | { userId: string }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'users.manage');
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
  return { userId: user.id };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const collaboratorId = req.nextUrl.searchParams.get('collaboratorId');
  if (!collaboratorId) {
    return NextResponse.json({ success: false, error: 'collaboratorId lipsă' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const [{ data: services }, { data: assigned }] = await Promise.all([
    admin.from('services').select('id, slug, name, category').eq('is_active', true).order('category').order('name'),
    admin.from('collaborator_service_assignments').select('service_id').eq('collaborator_id', collaboratorId),
  ]);
  const assignedIds = new Set((assigned ?? []).map((a: { service_id: string }) => a.service_id));
  return NextResponse.json({
    success: true,
    data: (services ?? []).map((s: { id: string; slug: string; name: string; category: string }) => ({
      ...s,
      assigned: assignedIds.has(s.id),
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  let body: { collaboratorId?: string; serviceId?: string; assigned?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Cerere invalidă' }, { status: 400 });
  }
  if (!body.collaboratorId || !body.serviceId || typeof body.assigned !== 'boolean') {
    return NextResponse.json({ success: false, error: 'Parametri lipsă' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  if (body.assigned) {
    const { error } = await admin
      .from('collaborator_service_assignments')
      .upsert(
        { collaborator_id: body.collaboratorId, service_id: body.serviceId, can_upload_pdf: true },
        { onConflict: 'collaborator_id,service_id' }
      );
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } else {
    const { error } = await admin
      .from('collaborator_service_assignments')
      .delete()
      .eq('collaborator_id', body.collaboratorId)
      .eq('service_id', body.serviceId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
