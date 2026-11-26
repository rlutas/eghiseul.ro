/**
 * Who is asking for a signature: a staff member with the given permission, or
 * the collaborator the order is assigned to (admin preview `?as=` = read only).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';

export async function staffActor(permission: 'orders.view' | 'orders.manage') {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 }) };
  }
  try {
    await requirePermission(user.id, permission);
  } catch (e) {
    if (e instanceof Response) return { error: e };
    throw e;
  }
  return { actor: { type: 'team' as const, id: user.id } };
}

export async function collaboratorActor(request: NextRequest, orderId: string, write: boolean) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 }) };
  }
  try {
    const ctx = await resolveCollaboratorContext(user.id, request.nextUrl.searchParams.get('as'));
    await requireCollaboratorForOrder(ctx.collaboratorId, orderId);
    if (write && ctx.preview) {
      return { error: NextResponse.json({ success: false, error: 'Previzualizarea e doar pentru citire' }, { status: 403 }) };
    }
    return { actor: { type: 'collaborator' as const, id: ctx.collaboratorId } };
  } catch (e) {
    if (e instanceof Response) return { error: e };
    throw e;
  }
}
