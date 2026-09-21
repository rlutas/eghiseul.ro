import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserPermissions, requireAdmin } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import type { ChatAudience } from './chat-context';

export interface KnowledgeActor {
  id: string;
  role: string;
  email: string | null;
  audience: ChatAudience;
}

/**
 * Cine întreabă / raportează din Ghid. Aruncă `Response` (ca restul
 * helperelor de permisiuni) când accesul e refuzat.
 */
export async function requireKnowledgeActor(request: NextRequest, audience: ChatAudience): Promise<KnowledgeActor> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (audience === 'collaborator') {
    // Previzualizarea de admin (`?as=`) trece; întrebările se loghează pe adminul real.
    await resolveCollaboratorContext(user.id, request.nextUrl.searchParams.get('as'));
  } else {
    await requireAdmin(user.id);
  }
  const { role } = await getUserPermissions(user.id);
  return { id: user.id, role, email: user.email ?? null, audience };
}

export function asResponse(e: unknown): Response | null {
  return e instanceof Response ? e : null;
}
