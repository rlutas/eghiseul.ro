import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Câmpuri permise la create/update (whitelist).
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

// GET /api/user/vehicles — listează mașinile userului (RLS = doar ale lui).
export async function GET() {
  const supabase = (await createClient()) as Db;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('user_saved_vehicles')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ success: false, error: 'Eroare la încărcare' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: data || [] });
}

// POST /api/user/vehicles — adaugă o mașină.
export async function POST(request: NextRequest) {
  const supabase = (await createClient()) as Db;
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const values = sanitize(body);
  if (!values.plate_number || typeof values.plate_number !== 'string') {
    return NextResponse.json({ success: false, error: 'Numărul de înmatriculare e obligatoriu' }, { status: 400 });
  }
  // Dacă e marcată default, scoatem default-ul de pe celelalte (unic per user).
  if (values.is_default === true) {
    await (supabase as Db).from('user_saved_vehicles').update({ is_default: false }).eq('user_id', user.id);
  }
  const { data, error } = await supabase
    .from('user_saved_vehicles')
    .insert({ ...values, user_id: user.id })
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ success: false, error: 'Eroare la salvare' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
