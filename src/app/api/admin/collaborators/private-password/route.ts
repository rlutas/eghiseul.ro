import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserPermissions, requirePermission } from '@/lib/admin/permissions';
import { clearPrivatePassword, setPrivatePassword } from '@/lib/collaborator/private-gate';

/**
 * Parola internă a paginilor private din portalul unui colaborator
 * (Decont lunar, Serviciile mele). Admin-only (users.manage).
 *
 * POST   { collaboratorId, password } → setează / schimbă parola
 * DELETE { collaboratorId }           → scoate gardul (paginile se deschid liber)
 *
 * Parola NU se poate citi înapoi — se păstrează doar hash-ul. Dacă titularul o
 * uită, adminul setează una nouă.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MIN_LENGTH = 6;

async function requireAdminAndTarget(request: NextRequest): Promise<{ collaboratorId: string; body: Record<string, unknown> }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  await requirePermission(user.id, 'users.manage');

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const collaboratorId = typeof body.collaboratorId === 'string' ? body.collaboratorId : '';
  if (!UUID_RE.test(collaboratorId)) {
    throw NextResponse.json({ success: false, error: 'Colaborator invalid' }, { status: 400 });
  }
  const { role } = await getUserPermissions(collaboratorId);
  if (role !== 'collaborator') {
    throw NextResponse.json({ success: false, error: 'Utilizatorul nu este colaborator' }, { status: 404 });
  }
  return { collaboratorId, body };
}

export async function POST(request: NextRequest) {
  try {
    const { collaboratorId, body } = await requireAdminAndTarget(request);
    const password = typeof body.password === 'string' ? body.password.trim() : '';
    if (password.length < MIN_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Parola trebuie să aibă cel puțin ${MIN_LENGTH} caractere.` },
        { status: 400 }
      );
    }
    await setPrivatePassword(collaboratorId, password);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error('[admin] private-password POST error:', e);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { collaboratorId } = await requireAdminAndTarget(request);
    await clearPrivatePassword(collaboratorId);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error('[admin] private-password DELETE error:', e);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
