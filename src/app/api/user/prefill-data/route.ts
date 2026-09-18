import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { buildUserPrefillData } from '@/lib/account/prefill';

/**
 * GET /api/user/prefill-data
 *
 * Fetches saved user data for pre-filling the order wizard. The shape is
 * built by `lib/account/prefill.ts`, shared with the order page (which
 * passes it to the wizard server-side).
 *
 * Authentication: Required (Supabase session)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    const data = await buildUserPrefillData(supabase, user);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Prefill data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
