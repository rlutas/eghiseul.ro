import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/consent-log — consent receipt for the cookie banner (GDPR art. 7:
 * the controller must be able to demonstrate consent). Body:
 * { consentId, analytics, marketing, bannerVersion }. The same consentId lives
 * in the visitor's eg_cookie_consent cookie, so a specific choice can be
 * proven on request. Best-effort: the banner never blocks on this call.
 */
export async function POST(req: NextRequest) {
  let body: { consentId?: string; analytics?: boolean; marketing?: boolean; bannerVersion?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  if (
    !body.consentId ||
    !UUID_RE.test(body.consentId) ||
    typeof body.analytics !== 'boolean' ||
    typeof body.marketing !== 'boolean'
  ) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { error } = await supabase.from('cookie_consent_log').insert({
    consent_id: body.consentId,
    analytics: body.analytics,
    marketing: body.marketing,
    banner_version: (body.bannerVersion ?? 'v1').slice(0, 40),
    ip,
    user_agent: (req.headers.get('user-agent') ?? '').slice(0, 300) || null,
  });
  if (error) {
    console.error('[consent-log] insert failed:', error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
