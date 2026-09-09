import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import {
  PRIVATE_UNLOCK_COOKIE,
  PRIVATE_UNLOCK_TTL_MS,
  checkPrivatePassword,
  makeUnlockToken,
  privateGateState,
  unlockCookieOptions,
} from '@/lib/collaborator/private-gate';

/**
 * Gardul cu parolă al paginilor private din portalul de colaborator
 * (Decont lunar, Serviciile mele). Vezi `@/lib/collaborator/private-gate`.
 *
 * GET    → { required, unlocked } pentru colaboratorul curent
 * POST   { password } → verifică și pune cookie-ul de deblocare (8h)
 * DELETE → șterge cookie-ul (blochează la loc)
 *
 * Preview de admin (`?as=`) nu are gard: adminul vede oricum decontul din /admin.
 */

async function currentCollaborator(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  return resolveCollaboratorContext(user.id, request.nextUrl.searchParams.get('as'));
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await currentCollaborator(request);
    if (ctx.preview) {
      return NextResponse.json({ success: true, data: { required: false, unlocked: true } });
    }
    const state = await privateGateState(ctx.collaboratorId);
    return NextResponse.json({ success: true, data: state });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error('[collaborator] unlock GET error:', e);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await currentCollaborator(request);
    if (ctx.preview) {
      return NextResponse.json({ success: false, error: 'Nu în modul previzualizare' }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as { password?: unknown };
    const password = typeof body.password === 'string' ? body.password : '';
    if (!password) {
      return NextResponse.json({ success: false, error: 'Introdu parola.' }, { status: 400 });
    }

    const ok = await checkPrivatePassword(ctx.collaboratorId, password);
    if (!ok) {
      // Frânează ghicitul: o încercare greșită costă o secundă.
      await new Promise((r) => setTimeout(r, 1000));
      console.warn(`[collaborator] wrong private password for ${ctx.collaboratorId}`);
      return NextResponse.json({ success: false, error: 'Parolă greșită.' }, { status: 403 });
    }

    const res = NextResponse.json({ success: true, data: { required: true, unlocked: true } });
    res.cookies.set(
      PRIVATE_UNLOCK_COOKIE,
      makeUnlockToken(ctx.collaboratorId),
      unlockCookieOptions(Math.floor(PRIVATE_UNLOCK_TTL_MS / 1000))
    );
    return res;
  } catch (e) {
    if (e instanceof Response) return e;
    console.error('[collaborator] unlock POST error:', e);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(PRIVATE_UNLOCK_COOKIE, '', unlockCookieOptions(0));
  return res;
}
