/**
 * POST /api/reupload/[token]/signature — semnătura clientului pe fluxul de
 * COMPLETARE (comenzi telefonice). Cere proof-ul HMAC din /verify
 * (headerele x-confirm-email + x-confirm-proof).
 *
 * Salvează semnătura în S3 + signature_metadata cu EXACT forma din submit
 * (IP, UA, timestamp, hash SHA-256, consimțăminte — Legea 214/2024, eIDAS).
 * Când și documentele cerute sunt complete → finalizare (ieșire standby +
 * regenerare contracte CU semnătura + notificare echipă).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { uploadOrderSignature } from '@/lib/aws/s3';
import { checkProofHeaders } from '@/lib/reupload/completion-proof';
import { finalizeReuploadRequest } from '@/lib/reupload/finalize';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_SIGNATURE_LEN = 2_000_000; // ~1.5MB binary — canvas PNG e mult sub

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: req } = await (admin as any)
      .from('reupload_requests')
      .select('id, order_id, document_type, document_types, completed_documents, status, token_expires_at, return_status, flow, require_email_confirm, signature_required, signature_completed_at')
      .eq('token', token)
      .single();

    if (!req) return NextResponse.json({ success: false, error: 'Link invalid' }, { status: 404 });
    const expired = new Date(req.token_expires_at).getTime() < Date.now();
    if (req.status !== 'pending' || expired) {
      return NextResponse.json({ success: false, error: expired ? 'Link expirat' : 'Link folosit' }, { status: 410 });
    }
    if (req.flow !== 'completion' || !req.signature_required) {
      return NextResponse.json({ success: false, error: 'Semnătura nu e cerută pe acest link' }, { status: 400 });
    }

    const { data: order } = await admin
      .from('orders')
      .select('id, friendly_order_id, order_number, status, customer_data, total_price, service_id, standby_started_at, standby_total_seconds, estimated_completion_date')
      .eq('id', req.order_id)
      .single();
    if (!order) return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customerData = ((order as any).customer_data as Record<string, any>) ?? {};
    const orderEmail = customerData?.contact?.email;
    if (req.require_email_confirm && !checkProofHeaders(request.headers, token, orderEmail)) {
      return NextResponse.json({ success: false, error: 'Confirmă mai întâi emailul comenzii.' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      signatureBase64?: string;
      consent?: {
        termsAccepted?: boolean;
        privacyAccepted?: boolean;
        signatureConsent?: boolean;
        withdrawalWaiver?: boolean;
      };
    };
    const signatureBase64 = body.signatureBase64;
    if (!signatureBase64 || typeof signatureBase64 !== 'string') {
      return NextResponse.json({ success: false, error: 'Lipsește semnătura' }, { status: 400 });
    }
    if (signatureBase64.length > MAX_SIGNATURE_LEN) {
      return NextResponse.json({ success: false, error: 'Semnătură prea mare' }, { status: 413 });
    }
    if (
      body.consent?.termsAccepted !== true ||
      body.consent?.privacyAccepted !== true ||
      body.consent?.signatureConsent !== true
    ) {
      return NextResponse.json(
        { success: false, error: 'Toate consimțămintele obligatorii trebuie bifate.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Hash-ul documentului semnat — aceeași formulă ca în submit.
    const contractContentForHash = JSON.stringify({
      customer_data: customerData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      total_price: (order as any).total_price,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      service_id: (order as any).service_id,
    });
    const documentHash = createHash('sha256').update(contractContentForHash).digest('hex');

    const signatureMetadata = {
      ip_address: ipAddress,
      user_agent: userAgent,
      signed_at: now,
      document_hash: documentHash,
      consent: {
        terms_accepted: true,
        privacy_accepted: true,
        signature_consent: true,
        withdrawal_waiver: body.consent?.withdrawalWaiver === true,
        consent_timestamp: now,
      },
      via: 'completion_link',
    };

    let signatureS3Key: string | undefined;
    try {
      const result = await uploadOrderSignature(req.order_id, signatureBase64);
      signatureS3Key = result.key;
    } catch (e) {
      console.error('[completion:signature] S3 upload failed, falling back to JSONB:', e);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('orders')
      .update({
        customer_data: {
          ...customerData,
          ...(signatureS3Key ? { signature_s3_key: signatureS3Key } : { signature_base64: signatureBase64 }),
          signature_metadata: signatureMetadata,
        },
        contract_signed_at: now,
        updated_at: now,
      })
      .eq('id', req.order_id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('reupload_requests')
      .update({ signature_completed_at: now, updated_at: now })
      .eq('id', req.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_history').insert({
      order_id: req.order_id,
      event_type: 'admin_action',
      new_value: { signatureS3Key, via: 'completion_link', reuploadRequestId: req.id },
      notes: 'Client a semnat contractul prin link-ul de completare',
    });

    // Complet? (toate documentele + semnătura)
    const types: string[] =
      Array.isArray(req.document_types) && req.document_types.length > 0
        ? req.document_types
        : req.document_type
          ? [req.document_type]
          : [];
    const done = new Set(
      (Array.isArray(req.completed_documents) ? req.completed_documents : []).map(
        (d: { type: string }) => d.type
      )
    );
    const docsDone = types.every((t) => done.has(t));

    if (docsDone) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from('reupload_requests')
        .update({ status: 'completed', completed_at: now, updated_at: now })
        .eq('id', req.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await finalizeReuploadRequest(admin, { ...req, flow: 'completion' }, order as any, types, now);
    }

    return NextResponse.json({ success: true, data: { signatureDone: true, allDone: docsDone } });
  } catch (error) {
    console.error('[completion:signature] error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
