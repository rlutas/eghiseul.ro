import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams { params: Promise<{ id: string }> }

// user_saved_vehicles e tabel nou — încă nu e în tipurile generate Supabase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

const ALLOWED = [
  'label', 'plate_number', 'vin', 'brand', 'model', 'year',
  'driving_license', 'itp_expiry', 'insurance_expiry', 'rovinieta_expiry', 'is_default',
] as const;

function sanitize(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of ALLOWED) {
    if (k in body) out[k] = body[k] === '' ? null : body[k];
  }
  return out;
}

// PATCH /api/user/vehicles/[id] — actualizează o mașină (RLS = doar a userului).
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = (await createClient()) as Db;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const values: Record<string, unknown> = { ...sanitize(body), updated_at: new Date().toISOString() };
  if (values.is_default === true) {
    await (supabase as Db).from('user_saved_vehicles').update({ is_default: false }).eq('user_id', user.id);
  }
  const { data, error } = await supabase
    .from('user_saved_vehicles')
    .update(values)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single();
  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Eroare la actualizare' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

// DELETE /api/user/vehicles/[id] — șterge o mașină.
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = (await createClient()) as Db;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { error } = await supabase
    .from('user_saved_vehicles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) {
    return NextResponse.json({ success: false, error: 'Eroare la ștergere' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
