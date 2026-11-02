import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import {
  CREDIT_SETTING_KEY,
  loadGeminiCreditSummary,
  normalizeCreditSettings,
} from '@/lib/ai/gemini-credit';

export const dynamic = 'force-dynamic';

async function authorize(): Promise<Response | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 });
  try {
    await requirePermission(user.id, 'settings.manage');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
  return null;
}

/** GET /api/admin/gemini-credit — estimated credit + usage (eghiseul + CJO). */
export async function GET() {
  const denied = await authorize();
  if (denied) return denied;
  try {
    const summary = await loadGeminiCreditSummary(createAdminClient());
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('[admin/gemini-credit] GET failed:', error);
    return NextResponse.json({ success: false, error: 'Nu am putut calcula creditul' }, { status: 500 });
  }
}

/**
 * POST /api/admin/gemini-credit
 *   { action: 'add_topup', date: 'YYYY-MM-DD', amount_usd: number, note?: string }
 *   { action: 'remove_topup', index: number }   (index in the date-sorted list)
 *   { action: 'set_threshold', alert_below_usd: number }
 */
export async function POST(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.action !== 'string') {
    return NextResponse.json({ success: false, error: 'Cerere invalidă' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: row } = await admin.from('admin_settings').select('value').eq('key', CREDIT_SETTING_KEY).maybeSingle();
  const settings = normalizeCreditSettings(row?.value);

  if (body.action === 'add_topup') {
    const amount = Number(body.amount_usd);
    const date = typeof body.date === 'string' ? body.date.slice(0, 10) : '';
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000) {
      return NextResponse.json({ success: false, error: 'Suma trebuie să fie între 0 și 10.000 USD' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      return NextResponse.json({ success: false, error: 'Data este invalidă' }, { status: 400 });
    }
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 200) : '';
    settings.topups.push({ date, amount_usd: Math.round(amount * 100) / 100, ...(note ? { note } : {}) });
  } else if (body.action === 'remove_topup') {
    const index = Number(body.index);
    if (!Number.isInteger(index) || index < 0 || index >= settings.topups.length) {
      return NextResponse.json({ success: false, error: 'Alimentarea nu există' }, { status: 400 });
    }
    settings.topups.splice(index, 1);
  } else if (body.action === 'set_threshold') {
    const t = Number(body.alert_below_usd);
    if (!Number.isFinite(t) || t < 0 || t > 1000) {
      return NextResponse.json({ success: false, error: 'Pragul trebuie să fie între 0 și 1000 USD' }, { status: 400 });
    }
    settings.alert_below_usd = Math.round(t * 100) / 100;
  } else {
    return NextResponse.json({ success: false, error: 'Acțiune necunoscută' }, { status: 400 });
  }

  const value = normalizeCreditSettings(settings);
  const { error } = await admin
    .from('admin_settings')
    .upsert({ key: CREDIT_SETTING_KEY, value, updated_at: new Date().toISOString() });
  if (error) {
    console.error('[admin/gemini-credit] save failed:', error.message);
    return NextResponse.json({ success: false, error: 'Salvarea a eșuat' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: value });
}
