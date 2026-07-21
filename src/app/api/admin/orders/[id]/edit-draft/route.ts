/**
 * PATCH /api/admin/orders/[id]/edit-draft — operatorul repară câmpuri de
 * FORMULAR pe o comandă neterminată (draft/pending/abandoned), ca clientul
 * blocat să poată continua cu date corecte.
 *
 * Whitelist STRICT: doar date de formular (contact, nume/CNP, adresă).
 * NU se ating: KYC (documente/selfie), semnătura, plata — alea rămân la client
 * (decizie Raul 2026-07-21).
 *
 * Setează admin_edited_at: clientul care revine cu un localStorage mai vechi
 * primește datele de pe server (provider-ul compară timestamp-urile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// Câmpuri permise per secțiune — orice altceva din body e ignorat.
const ALLOWED: Record<string, Set<string>> = {
  contact: new Set(['firstName', 'lastName', 'email', 'phone']),
  personal: new Set(['firstName', 'lastName', 'cnp', 'birthDate', 'birthPlace', 'fatherName', 'motherName']),
  personalAddress: new Set(['street', 'number', 'building', 'staircase', 'floor', 'apartment', 'city', 'county', 'postalCode', 'sector']),
  billing: new Set(['firstName', 'lastName', 'cnp', 'address', 'city', 'county', 'postalCode', 'country']),
};

const EDITABLE_STATUSES = new Set(['draft', 'pending', 'abandoned']);

type Section = Record<string, unknown>;

function pickAllowed(input: unknown, allowed: Set<string>): Section {
  const out: Section = {};
  if (!input || typeof input !== 'object') return out;
  for (const [k, v] of Object.entries(input as Section)) {
    if (!allowed.has(k)) continue;
    if (typeof v !== 'string') continue; // doar valori text simple
    out[k] = v.trim();
  }
  return out;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = (await request.json().catch(() => ({}))) as {
      contact?: unknown;
      personal?: unknown;
      personalAddress?: unknown;
      billing?: unknown;
    };

    const patches = {
      contact: pickAllowed(body.contact, ALLOWED.contact),
      personal: pickAllowed(body.personal, ALLOWED.personal),
      personalAddress: pickAllowed(body.personalAddress, ALLOWED.personalAddress),
      billing: pickAllowed(body.billing, ALLOWED.billing),
    };
    const changedPaths = Object.entries(patches)
      .flatMap(([sec, obj]) => Object.keys(obj).map((k) => `${sec}.${k}`));
    if (changedPaths.length === 0) {
      return NextResponse.json({ success: false, error: 'Niciun câmp editabil în cerere' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order } = await (adminClient as any)
      .from('orders')
      .select('id, status, customer_data')
      .eq('id', orderId)
      .single();
    if (!order) {
      return NextResponse.json({ success: false, error: 'Comanda nu a fost găsită' }, { status: 404 });
    }
    if (!EDITABLE_STATUSES.has(order.status)) {
      return NextResponse.json(
        { success: false, error: `Editarea de formular e doar pentru comenzi neterminate (status curent: ${order.status}). Pentru comenzi plătite folosește „Modifică".` },
        { status: 409 }
      );
    }

    // Merge NON-distructiv: doar câmpurile trimise se schimbă; restul secțiunii
    // (inclusiv OCR, documente, orice alt sub-obiect) rămâne neatins.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cd = ((order.customer_data as any) ?? {}) as Record<string, any>;
    if (Object.keys(patches.contact).length) {
      cd.contact = { ...(cd.contact ?? {}), ...patches.contact };
    }
    if (Object.keys(patches.personal).length || Object.keys(patches.personalAddress).length) {
      const personal = { ...(cd.personal ?? {}), ...patches.personal };
      if (Object.keys(patches.personalAddress).length) {
        personal.address = { ...(personal.address ?? {}), ...patches.personalAddress };
      }
      cd.personal = personal;
    }
    if (Object.keys(patches.billing).length) {
      cd.billing = { ...(cd.billing ?? {}), ...patches.billing };
    }

    const nowIso = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updErr } = await (adminClient as any)
      .from('orders')
      .update({ customer_data: cd, admin_edited_at: nowIso, updated_at: nowIso })
      .eq('id', orderId);
    if (updErr) {
      console.error('[edit-draft] update failed:', updErr);
      return NextResponse.json({ success: false, error: 'Nu am putut salva modificările' }, { status: 500 });
    }

    // Audit: CE s-a schimbat (căile, nu valorile — fără PII în istoric).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any).from('order_history').insert({
      order_id: orderId,
      changed_by: user.id,
      event_type: 'draft_edited_by_admin',
      new_value: { fields: changedPaths },
      notes: `Operator a corectat date de formular: ${changedPaths.join(', ')}`,
    });

    return NextResponse.json({ success: true, data: { changedFields: changedPaths } });
  } catch (error) {
    console.error('[edit-draft] error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
