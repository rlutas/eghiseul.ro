/**
 * POST /api/reupload/[token]/verify — email-confirm gate for the COMPLETION
 * flow (comenzi telefonice). The client types the order's email; on match we
 * return the full payload (documents + signature flag + order code) plus a
 * stateless HMAC proof required by the upload/signature endpoints.
 *
 * Brute-force: attempts counter on the request row, hard lock at 10.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { computeCompletionProof } from '@/lib/reupload/completion-proof';
import { REUPLOAD_DOC_SPECS, reuploadDocLabel } from '@/lib/reupload/doc-types';

export const runtime = 'nodejs';

const MAX_ATTEMPTS = 10;

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: req } = await (admin as any)
      .from('reupload_requests')
      .select('id, order_id, document_type, document_types, completed_documents, status, token_expires_at, flow, require_email_confirm, signature_required, signature_completed_at, email_confirm_attempts')
      .eq('token', token)
      .single();

    if (!req) {
      return NextResponse.json({ success: false, error: 'Link invalid' }, { status: 404 });
    }
    const expired = new Date(req.token_expires_at).getTime() < Date.now();
    if (req.status !== 'pending' || expired) {
      return NextResponse.json({ success: false, error: expired ? 'Link expirat' : 'Link folosit' }, { status: 410 });
    }
    if (!req.require_email_confirm) {
      return NextResponse.json({ success: false, error: 'Confirmarea nu e necesară pentru acest link' }, { status: 400 });
    }
    if ((req.email_confirm_attempts || 0) >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, error: 'Prea multe încercări — contactează-ne pentru un link nou.' },
        { status: 429 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as { email?: string };
    const email = (body.email || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ success: false, error: 'Emailul e obligatoriu' }, { status: 400 });
    }

    const { data: order } = await admin
      .from('orders')
      .select('friendly_order_id, order_number, customer_data')
      .eq('id', req.order_id)
      .single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderEmail = String((order?.customer_data as any)?.contact?.email || '').trim().toLowerCase();

    if (!order || !orderEmail || orderEmail !== email) {
      // Increment ATOMIC sub prag (funcție SQL, migrarea 126) — read-modify-
      // write-ul clasic pierdea incremente la cereri paralele și lock-ul de
      // brute-force devenea ocolibil (finding code-review ea6269e).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newCount } = await (admin as any).rpc('increment_email_confirm_attempts', {
        p_request_id: req.id,
        p_max: MAX_ATTEMPTS,
      });
      if (newCount === null || newCount === undefined) {
        return NextResponse.json(
          { success: false, error: 'Prea multe încercări — contactează-ne pentru un link nou.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Emailul nu corespunde comenzii. Folosește adresa cu care s-a plasat comanda.' },
        { status: 403 }
      );
    }

    // Success — full payload + proof.
    // Array-ul e autoritar chiar și gol ([] = doar semnătura) — vezi
    // requestedTypes din ruta principală.
    const types: string[] = Array.isArray(req.document_types)
      ? req.document_types
      : req.document_type
        ? [req.document_type]
        : [];
    const done = new Set(
      (Array.isArray(req.completed_documents) ? req.completed_documents : []).map(
        (d: { type: string }) => d.type
      )
    );
    const documents = types.map((type: string) => ({
      type,
      label: reuploadDocLabel(type),
      hint: REUPLOAD_DOC_SPECS[type]?.hint ?? '',
      acceptsPdf: REUPLOAD_DOC_SPECS[type]?.acceptsPdf ?? false,
      uploaded: done.has(type),
      optional: false,
    }));

    return NextResponse.json({
      success: true,
      data: {
        proof: computeCompletionProof(token, email),
        email,
        orderCode: order.friendly_order_id || order.order_number,
        documents,
        signatureRequired: !!req.signature_required,
        signatureDone: !!req.signature_completed_at,
      },
    });
  } catch (error) {
    console.error('[reupload:verify] error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
