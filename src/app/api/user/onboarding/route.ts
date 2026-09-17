import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseInterests, interestConsequence } from '@/lib/account/service-interests';

/**
 * POST /api/user/onboarding
 *
 * Records the answer to the account's single onboarding question — which kinds
 * of service the customer comes here for. The answer decides whether the
 * account asks for an identity document at all (Faza 2 of
 * `docs/dashboard-client/PLAN.md`).
 *
 * Body: `{ interests: string[] }`. An empty array means the question was
 * skipped, which is a real answer and is stored as such: `NULL` means „never
 * asked", `{}` means „asked and skipped". Unknown ids are dropped rather than
 * rejected — a stale id from an older build must not cost the customer their
 * answer, and it can never widen what the account asks for.
 *
 * Authentication: required.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid body' },
        { status: 400 }
      );
    }

    const interests = parseInterests((body as { interests?: unknown })?.interests);

    // The user's own row, through RLS — no admin client, so this endpoint can
    // never write somebody else's profile.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        service_interests: interests,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Onboarding save error:', error);
      return NextResponse.json(
        { success: false, error: 'Nu am putut salva răspunsul. Încearcă din nou.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        interests,
        consequence: interestConsequence(interests),
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
