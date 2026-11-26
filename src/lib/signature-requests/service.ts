/**
 * Server side of „Documente de semnat": create / list / cancel a request,
 * and the client's signature that turns it into signed order documents.
 *
 * Every caller checks WHO is asking before reaching here (staff permission,
 * the assigned collaborator, or the order-client token).
 */

import { createHash } from 'crypto';
import { uploadFile, uploadBase64 } from '@/lib/aws/s3';
import { postOrderMessage } from '@/lib/orders/messages';
import { sanitizeClientFiles, type ClientFile } from '@/lib/orders/client-files';
import { validateCNP } from '@/lib/validations/cnp';
import { brandForOrder } from '@/lib/brand/for-order';
import {
  SIGNABLE_DOCUMENTS,
  IDENTITY_KEYS,
  isSignableKind,
  sanitizeFields,
  missingIdentityFields,
  renderSignableDocx,
  type SignableKind,
} from './documents';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = any;

export interface SignatureRequestRow {
  id: string;
  order_id: string;
  kinds: SignableKind[];
  fields: Record<string, string>;
  ask_identity: boolean;
  note: string | null;
  status: 'pending' | 'signed' | 'cancelled';
  requested_by: string | null;
  requested_by_type: 'team' | 'collaborator';
  requested_by_name: string;
  signed_at: string | null;
  signature_metadata: Record<string, unknown> | null;
  signed_document_ids: string[] | null;
  created_at: string;
}

const COLUMNS =
  'id, order_id, kinds, fields, ask_identity, note, status, requested_by, requested_by_type, requested_by_name, signed_at, signature_metadata, signed_document_ids, created_at';

/** Orders on which nobody can be asked to sign anything any more. */
const DEAD_STATUSES = ['cancelled', 'refunded', 'abandoned', 'draft'];

export const MAX_SIGNATURE_LEN = 2_000_000;

export type Result<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export async function listSignatureRequests(admin: Admin, orderId: string): Promise<SignatureRequestRow[]> {
  const { data } = await admin
    .from('order_signature_requests')
    .select(COLUMNS)
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });
  return (data ?? []) as SignatureRequestRow[];
}

export async function getSignatureRequest(
  admin: Admin,
  orderId: string,
  requestId: string
): Promise<SignatureRequestRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(requestId)) return null;
  const { data } = await admin
    .from('order_signature_requests')
    .select(COLUMNS)
    .eq('id', requestId)
    .eq('order_id', orderId)
    .maybeSingle();
  return (data as SignatureRequestRow) ?? null;
}

/** Validates the body of a create / preview call. */
export function parseRequestInput(body: unknown): Result<{
  kinds: SignableKind[];
  fields: Record<string, string>;
  askIdentity: boolean;
  note: string;
}> {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const kinds = Array.isArray(b.kinds) ? [...new Set(b.kinds.filter(isSignableKind))] : [];
  if (kinds.length === 0) return { ok: false, error: 'Alege cel puțin un document', status: 400 };
  return {
    ok: true,
    data: {
      kinds,
      fields: sanitizeFields(kinds, b.fields),
      askIdentity: b.askIdentity === true,
      note: typeof b.note === 'string' ? b.note.trim().slice(0, 1000) : '',
    },
  };
}

function docList(kinds: SignableKind[]): string {
  return kinds.map((k, i) => `${i + 1}. ${SIGNABLE_DOCUMENTS[k].label}`).join('\n');
}

export async function createSignatureRequest(
  admin: Admin,
  input: {
    orderId: string;
    kinds: SignableKind[];
    fields: Record<string, string>;
    askIdentity: boolean;
    note: string;
    actor: { type: 'team' | 'collaborator'; id: string; name: string };
  }
): Promise<Result<SignatureRequestRow>> {
  const { data: order } = await admin
    .from('orders')
    .select('id, status, friendly_order_id')
    .eq('id', input.orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: 'Comanda nu există', status: 404 };
  if (DEAD_STATUSES.includes(order.status)) {
    return { ok: false, error: 'Comanda e închisă — nu se mai pot cere semnături', status: 409 };
  }

  // One open request per order: a new one replaces the previous pending one
  // (corrected data, another document), so the client never sees two.
  await admin
    .from('order_signature_requests')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('order_id', input.orderId)
    .eq('status', 'pending');

  const { data: row, error } = await admin
    .from('order_signature_requests')
    .insert({
      order_id: input.orderId,
      kinds: input.kinds,
      fields: input.fields,
      ask_identity: input.askIdentity,
      note: input.note || null,
      requested_by: input.actor.id,
      requested_by_type: input.actor.type,
      requested_by_name: input.actor.name.slice(0, 120),
    })
    .select(COLUMNS)
    .single();
  if (error || !row) {
    console.error('[signature-requests] insert error:', error?.message);
    return { ok: false, error: 'Cererea nu a putut fi salvată', status: 500 };
  }

  // The client learns about it the way every other request reaches him: a
  // message in the order thread (email included), pointing at the card.
  const body =
    `Bună ziua,\n\nPentru a continua comanda avem nevoie de semnătura dumneavoastră pe:\n${docList(input.kinds)}\n\n` +
    (input.askIdentity
      ? 'Vă rugăm să încărcați și o poză clară cu actul de identitate — datele din el se trec în documente.\n\n'
      : '') +
    (input.note ? `${input.note}\n\n` : '') +
    'Le găsiți completate în pagina comenzii, la „Documente de semnat". Le citiți, semnați o singură dată pe ecran (cu degetul sau cu mouse-ul) și semnătura se aplică pe toate.';
  await postOrderMessage({
    orderId: input.orderId,
    authorType: input.actor.type,
    authorId: input.actor.id,
    authorName: input.actor.name,
    body,
  }).catch((e) => console.error('[signature-requests] message failed:', e instanceof Error ? e.message : e));

  return { ok: true, data: row as SignatureRequestRow };
}

export async function cancelSignatureRequest(
  admin: Admin,
  orderId: string,
  requestId: string,
  who: string
): Promise<Result<null>> {
  const req = await getSignatureRequest(admin, orderId, requestId);
  if (!req) return { ok: false, error: 'Cererea nu există', status: 404 };
  if (req.status !== 'pending') return { ok: false, error: 'Cererea nu mai e în așteptare', status: 409 };
  const now = new Date().toISOString();
  await admin
    .from('order_signature_requests')
    .update({ status: 'cancelled', cancelled_at: now, updated_at: now })
    .eq('id', requestId)
    .eq('status', 'pending');
  await admin.from('order_history').insert({
    order_id: orderId,
    event_type: 'admin_action',
    changed_by: who,
    new_value: { signatureRequestId: requestId, cancelled: true },
    notes: `Cerere de semnătură anulată (${req.kinds.map((k) => SIGNABLE_DOCUMENTS[k].label).join(', ')})`,
  });
  return { ok: true, data: null };
}

/**
 * The fields the documents are rendered with: the request's, plus — when the
 * request asks for the ID card — what the client typed for the identity keys.
 */
export function effectiveFields(req: SignatureRequestRow, clientIdentity?: unknown): Record<string, string> {
  const fields = { ...req.fields };
  if (req.ask_identity && clientIdentity && typeof clientIdentity === 'object') {
    const typed = sanitizeFields(req.kinds, clientIdentity);
    for (const k of IDENTITY_KEYS) {
      if (typed[k] !== undefined) fields[k] = typed[k];
    }
  }
  return fields;
}

/** Returns an error message (Romanian) when the identity data is not usable. */
export function checkIdentity(fields: Record<string, string>): string | null {
  const missing = missingIdentityFields(fields);
  if (missing.length > 0) return 'Completează toate datele din actul de identitate.';
  const cnp = validateCNP(fields.cnp);
  if (!cnp.valid) return 'CNP-ul nu este valid. Verifică cifrele.';
  return null;
}

export async function signSignatureRequest(
  admin: Admin,
  input: {
    orderId: string;
    requestId: string;
    signatureBase64: string;
    identity?: unknown;
    identityFiles?: unknown;
    consent: { documentsRead: boolean; signatureConsent: boolean };
    ip: string;
    userAgent: string;
  }
): Promise<Result<{ documentIds: string[] }>> {
  const req = await getSignatureRequest(admin, input.orderId, input.requestId);
  if (!req) return { ok: false, error: 'Cererea nu există', status: 404 };
  if (req.status !== 'pending') {
    return { ok: false, error: req.status === 'signed' ? 'Documentele sunt deja semnate.' : 'Cererea a fost anulată.', status: 409 };
  }
  if (!input.consent.documentsRead || !input.consent.signatureConsent) {
    return { ok: false, error: 'Bifează că ai citit documentele și ești de acord cu semnătura.', status: 400 };
  }
  if (!/^data:image\/png;base64,/.test(input.signatureBase64) || input.signatureBase64.length > MAX_SIGNATURE_LEN) {
    return { ok: false, error: 'Semnătura nu este validă. Semnează din nou.', status: 400 };
  }

  const fields = effectiveFields(req, input.identity);
  let identityFiles: ClientFile[] = [];
  if (req.ask_identity) {
    const idError = checkIdentity(fields);
    if (idError) return { ok: false, error: idError, status: 400 };
    identityFiles = sanitizeClientFiles(input.orderId, input.identityFiles);
    if (identityFiles.length === 0) {
      return { ok: false, error: 'Încarcă o poză cu actul de identitate.', status: 400 };
    }
  }

  const { data: order } = await admin
    .from('orders')
    .select('id, friendly_order_id, order_number, platform, status')
    .eq('id', input.orderId)
    .single();
  if (!order) return { ok: false, error: 'Comanda nu există', status: 404 };
  const orderNumber: string = order.friendly_order_id || order.order_number || input.orderId;
  const brand = brandForOrder(order);
  const signedAt = new Date();
  const signedIso = signedAt.toISOString();

  // Claim first: a double tap must not produce two sets of documents.
  const { data: claimed } = await admin
    .from('order_signature_requests')
    .update({ status: 'signed', signed_at: signedIso, updated_at: signedIso })
    .eq('id', req.id)
    .eq('status', 'pending')
    .select('id');
  if (!claimed || claimed.length === 0) {
    return { ok: false, error: 'Documentele sunt deja semnate.', status: 409 };
  }

  const documents: { kind: SignableKind; id: string; fileName: string; sha256: string }[] = [];
  try {
    const sigKey = `orders/${input.orderId}/semnaturi/${req.id}.png`;
    await uploadBase64(sigKey, input.signatureBase64, 'image/png', {
      'order-id': input.orderId,
      'signature-request': req.id,
      'signed-at': signedIso,
    });

    for (const kind of req.kinds) {
      const def = SIGNABLE_DOCUMENTS[kind];
      const buffer = renderSignableDocx(kind, fields, {
        orderNumber,
        signatureBase64: input.signatureBase64,
        signedAt,
        ip: input.ip,
        brandName: brand.name,
      });
      const sha256 = createHash('sha256').update(buffer).digest('hex');
      const fileName = `${def.template}-${orderNumber}-semnat.docx`;
      const s3Key = `orders/${orderNumber}/semnate/${req.id}/${fileName}`;
      await uploadFile(s3Key, buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', {
        'order-id': input.orderId,
        'signature-request': req.id,
        template: def.template,
      });
      const { data: doc, error } = await admin
        .from('order_documents')
        .insert({
          order_id: input.orderId,
          type: def.docType,
          s3_key: s3Key,
          file_name: fileName,
          file_size: buffer.length,
          mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          document_number: orderNumber,
          // The client signed it: it is his document too.
          visible_to_client: true,
          generated_by: null,
          metadata: { source: 'signature_request', signature_request_id: req.id, template: def.template, sha256 },
        })
        .select('id')
        .single();
      if (error || !doc) throw new Error(`order_documents insert failed: ${error?.message}`);
      documents.push({ kind, id: doc.id, fileName, sha256 });
    }

    const signatureMetadata = {
      ip_address: input.ip,
      user_agent: input.userAgent,
      signed_at: signedIso,
      consent: { documents_read: true, signature_consent: true, consent_timestamp: signedIso },
      documents: documents.map((d) => ({ kind: d.kind, document_id: d.id, sha256: d.sha256 })),
      fields_hash: createHash('sha256').update(JSON.stringify(fields)).digest('hex'),
      identity_files: identityFiles,
      via: 'status_page',
    };
    await admin
      .from('order_signature_requests')
      .update({
        fields,
        signature_s3_key: sigKey,
        signature_metadata: signatureMetadata,
        signed_document_ids: documents.map((d) => d.id),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.id);

    await admin.from('order_history').insert({
      order_id: input.orderId,
      // document_generated: one of the events the client's timeline shows,
      // worded for him (the status API maps it to „Documente semnate").
      event_type: 'document_generated',
      changed_by: 'client',
      new_value: { signatureRequestId: req.id, documents: signatureMetadata.documents },
      notes: `Documente semnate electronic: ${req.kinds.map((k) => SIGNABLE_DOCUMENTS[k].label).join(', ')}`,
    });

    // The thread tells the requester (topograph / team) — with the ID photo
    // attached, so it is where he already reads the client's acts.
    await postOrderMessage({
      orderId: input.orderId,
      authorType: 'client',
      authorName: fields.nume || 'Client',
      body:
        `Am semnat documentele:\n${docList(req.kinds)}\n\nSemnate electronic la ${signedAt.toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}.` +
        (identityFiles.length ? '\nAm atașat actul de identitate.' : ''),
      attachments: identityFiles,
    }).catch((e) => console.error('[signature-requests] signed message failed:', e instanceof Error ? e.message : e));

    return { ok: true, data: { documentIds: documents.map((d) => d.id) } };
  } catch (err) {
    // Nothing half-signed: give the request back to the client.
    console.error('[signature-requests] sign failed, reverting claim:', err instanceof Error ? err.message : err);
    for (const d of documents) {
      await admin.from('order_documents').delete().eq('id', d.id);
    }
    await admin
      .from('order_signature_requests')
      .update({ status: 'pending', signed_at: null, updated_at: new Date().toISOString() })
      .eq('id', req.id)
      .eq('status', 'signed');
    return { ok: false, error: 'Semnarea nu a reușit. Încearcă din nou peste un minut.', status: 500 };
  }
}
