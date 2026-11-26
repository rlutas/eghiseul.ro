/**
 * Route handlers shared by the two sides that ASK for a signature — the team
 * (`/api/admin/orders/[id]/signature-requests`) and the topograph
 * (`/api/collaborator/orders/[id]/signature-requests`). The route files only
 * authenticate and pass the actor in; the behaviour is identical.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPersonName } from '@/lib/format/person-name';
import { identifiableName } from '@/lib/orders/abandoned-progress';
import { convertDocxToPdf } from '@/lib/documents/docx-to-pdf';
import { brandForOrder } from '@/lib/brand/for-order';
import {
  SIGNABLE_DOCUMENTS,
  SIGNABLE_KINDS,
  FIELD_GROUP_LABELS,
  isSignableKind,
  prefillFields,
  renderSignableDocx,
  sanitizeFields,
  type SignableKind,
} from './documents';
import {
  cancelSignatureRequest,
  createSignatureRequest,
  listSignatureRequests,
  parseRequestInput,
} from './service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = any;

export interface Actor {
  type: 'team' | 'collaborator';
  id: string;
}

const ORDER_COLUMNS =
  'id, status, platform, friendly_order_id, order_number, created_at, total_price, customer_data, services:service_id(name, slug, verification_config)';

async function actorProfile(admin: Admin, id: string) {
  const { data } = await admin.from('profiles').select('first_name, last_name, email, phone').eq('id', id).maybeSingle();
  const name =
    formatPersonName(data?.last_name, data?.first_name) || data?.email || 'Echipa';
  return { name, email: (data?.email as string | null) ?? null, phone: (data?.phone as string | null) ?? null };
}

/** The catalog the composer renders: documents, their fields and groups. */
export function signableCatalog() {
  return {
    kinds: SIGNABLE_KINDS.map((k) => ({
      kind: k,
      label: SIGNABLE_DOCUMENTS[k].label,
      description: SIGNABLE_DOCUMENTS[k].description,
      fields: SIGNABLE_DOCUMENTS[k].fields,
    })),
    groups: FIELD_GROUP_LABELS,
  };
}

/** Signed request rows with the ids of the documents they produced. */
function publicRequest(r: Awaited<ReturnType<typeof listSignatureRequests>>[number]) {
  return {
    id: r.id,
    kinds: r.kinds,
    labels: r.kinds.map((k) => SIGNABLE_DOCUMENTS[k]?.label ?? k),
    fields: r.fields,
    askIdentity: r.ask_identity,
    note: r.note,
    status: r.status,
    requestedBy: r.requested_by_name,
    requestedByType: r.requested_by_type,
    createdAt: r.created_at,
    signedAt: r.signed_at,
    signedDocumentIds: r.signed_document_ids ?? [],
    ip: (r.signature_metadata as { ip_address?: string } | null)?.ip_address ?? null,
  };
}

export async function handleList(orderId: string, actor: Actor) {
  const admin = createAdminClient() as Admin;
  const { data: order } = await admin.from('orders').select(ORDER_COLUMNS).eq('id', orderId).maybeSingle();
  if (!order) return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });
  const profile = await actorProfile(admin, actor.id);
  const svc = Array.isArray(order.services) ? order.services[0] : order.services;
  const requests = await listSignatureRequests(admin, orderId);
  const docIds = requests.flatMap((r) => r.signed_document_ids ?? []);
  const { data: docs } = docIds.length
    ? await admin.from('order_documents').select('id, type, file_name, s3_key, created_at').in('id', docIds)
    : { data: [] };
  return NextResponse.json({
    success: true,
    data: {
      ...signableCatalog(),
      prefill: prefillFields(
        { ...order, services: svc },
        // The OCPI answer goes to whoever files the request: the topograph's
        // own contact when he asks, the client's when the team asks.
        actor.type === 'collaborator' ? profile : null
      ),
      // Shown in the „send to client” confirmation (wrong-order incident, 25.11).
      recipient: {
        orderNumber: order.friendly_order_id || order.order_number || order.id,
        clientName: (() => {
          const n = identifiableName(order.customer_data);
          return n ? formatPersonName(n.lastName, n.firstName) : null;
        })(),
        closed: ['completed', 'cancelled', 'refunded', 'shipped', 'delivered'].includes(order.status),
      },
      requests: requests.map(publicRequest),
      signedDocuments: (docs ?? []).map((d: { id: string; type: string; file_name: string; s3_key: string; created_at: string }) => ({
        id: d.id,
        type: d.type,
        fileName: d.file_name,
        // The team previews by S3 key; the collaborator by document id.
        s3Key: actor.type === 'team' ? d.s3_key : undefined,
        createdAt: d.created_at,
      })),
    },
  });
}

export async function handleCreate(orderId: string, body: unknown, actor: Actor) {
  const parsed = parseRequestInput(body);
  if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: parsed.status });
  const admin = createAdminClient() as Admin;
  const profile = await actorProfile(admin, actor.id);
  const result = await createSignatureRequest(admin, {
    orderId,
    ...parsed.data,
    actor: { type: actor.type, id: actor.id, name: profile.name },
  });
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: result.status });
  return NextResponse.json({ success: true, data: { request: publicRequest(result.data) } });
}

export async function handleCancel(orderId: string, requestId: string | null, actor: Actor) {
  if (!requestId) return NextResponse.json({ success: false, error: 'requestId lipsește' }, { status: 400 });
  const admin = createAdminClient() as Admin;
  const profile = await actorProfile(admin, actor.id);
  const who = actor.type === 'collaborator' ? `colaborator: ${profile.name}` : profile.name;
  const result = await cancelSignatureRequest(admin, orderId, requestId, who);
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: result.status });
  return NextResponse.json({ success: true });
}

/**
 * Renders one document as PDF (DOCX when no converter is available) —
 * unsigned, from the given fields. Used by the composer and the client card.
 */
export async function renderPreview(
  order: { id: string; friendly_order_id?: string | null; order_number?: string | null; platform?: string | null },
  kind: SignableKind,
  fields: Record<string, string>
) {
  const orderNumber = order.friendly_order_id || order.order_number || order.id;
  const docx = renderSignableDocx(kind, fields, { orderNumber, brandName: brandForOrder(order).name });
  const base = `${SIGNABLE_DOCUMENTS[kind].template}-${orderNumber}`;
  const pdf = await convertDocxToPdf(docx);
  if (pdf) {
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${base}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  }
  return new NextResponse(new Uint8Array(docx), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${base}.docx"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

export async function handlePreview(orderId: string, body: unknown) {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (!isSignableKind(b.kind)) return NextResponse.json({ success: false, error: 'Document necunoscut' }, { status: 400 });
  const admin = createAdminClient() as Admin;
  const { data: order } = await admin
    .from('orders')
    .select('id, friendly_order_id, order_number, platform')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });
  return renderPreview(order, b.kind, sanitizeFields([b.kind], b.fields));
}
