/**
 * Order message thread — the team (admin), the topograph (collaborator portal)
 * and the client (status page / account) talking about ONE order.
 *
 * Replaces the relay „Mircea asks the team on WhatsApp → the team writes to
 * the client → the client answers the team → the team tells Mircea": whoever
 * works the order writes here, the client gets an email with the message and a
 * link, answers on the status page (optionally with a photo of an act), and
 * the team + the topograph get an email back.
 *
 * Internal notes stay in `order_history` (never shown to the client); this
 * thread is, by construction, everything the client can read.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import {
  renderOrderMessageToClientEmail,
  renderOrderMessageToStaffEmail,
} from '@/lib/email/templates/order-message';
import { appBaseForOrder, brandForOrder } from '@/lib/brand/for-order';
import { identifiableName } from '@/lib/orders/abandoned-progress';
import { formatPersonName } from '@/lib/format/person-name';
import { getDownloadUrl } from '@/lib/aws/s3';
import { sanitizeClientFiles, type ClientFile } from '@/lib/orders/client-files';

export type MessageAuthorType = 'client' | 'team' | 'collaborator';
export type MessageViewer = 'client' | 'staff';

export const MESSAGE_MAX_LENGTH = 4000;

export interface OrderMessage {
  id: string;
  author_type: MessageAuthorType;
  author_name: string;
  body: string;
  attachments: ClientFile[];
  created_at: string;
  read_by_client_at: string | null;
  read_by_staff_at: string | null;
}

/** The label the CLIENT sees next to a message. */
export function clientFacingAuthor(m: Pick<OrderMessage, 'author_type' | 'author_name'>, brandName: string): string {
  if (m.author_type === 'client') return 'Tu';
  if (m.author_type === 'collaborator') return 'Topograful care lucrează comanda';
  return `Echipa ${brandName}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = any;

export async function listOrderMessages(orderId: string, admin: Admin = createAdminClient()): Promise<OrderMessage[]> {
  const { data, error } = await admin
    .from('order_messages')
    .select('id, author_type, author_name, body, attachments, created_at, read_by_client_at, read_by_staff_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) {
    console.error('[messages] list error:', error.message);
    return [];
  }
  return (data ?? []) as OrderMessage[];
}

/** Marks the OTHER side's messages as read by this viewer. */
export async function markOrderMessagesRead(
  orderId: string,
  viewer: MessageViewer,
  admin: Admin = createAdminClient()
): Promise<void> {
  const now = new Date().toISOString();
  const q = admin.from('order_messages');
  const { error } =
    viewer === 'client'
      ? await q.update({ read_by_client_at: now }).eq('order_id', orderId).neq('author_type', 'client').is('read_by_client_at', null)
      : await q.update({ read_by_staff_at: now }).eq('order_id', orderId).eq('author_type', 'client').is('read_by_staff_at', null);
  if (error) console.error('[messages] mark read error:', error.message);
}

/** Short-lived download links for the attachments (staff views only). */
export async function withAttachmentUrls(
  messages: OrderMessage[]
): Promise<Array<OrderMessage & { attachments: Array<ClientFile & { url?: string }> }>> {
  return Promise.all(
    messages.map(async (m) => ({
      ...m,
      attachments: await Promise.all(
        (m.attachments ?? []).map(async (a) => {
          try {
            return { ...a, url: await getDownloadUrl(a.key, 900) };
          } catch {
            return a;
          }
        })
      ),
    }))
  );
}

interface PostInput {
  orderId: string;
  authorType: MessageAuthorType;
  authorId?: string | null;
  authorName: string;
  body: string;
  attachments?: unknown;
}

export type PostResult =
  | { ok: true; message: OrderMessage; emailed: string[] }
  | { ok: false; error: string; status: number };

/**
 * Stores a message and notifies the other side. Email failures never undo
 * the message — it is on the order either way.
 */
export async function postOrderMessage(input: PostInput): Promise<PostResult> {
  const body = input.body.trim();
  if (!body) return { ok: false, error: 'Scrie mesajul', status: 400 };
  if (body.length > MESSAGE_MAX_LENGTH) {
    return { ok: false, error: `Mesajul are maxim ${MESSAGE_MAX_LENGTH} caractere`, status: 400 };
  }
  // Only the client attaches files (acts); the team delivers documents
  // through the normal upload.
  const attachments = input.authorType === 'client' ? sanitizeClientFiles(input.orderId, input.attachments) : [];

  const admin: Admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('id, friendly_order_id, status, customer_data, platform, service_id, assigned_collaborator_id, services:service_id(name, slug)')
    .eq('id', input.orderId)
    .single();
  if (!order) return { ok: false, error: 'Comanda nu există', status: 404 };

  const { data: message, error } = await admin
    .from('order_messages')
    .insert({
      order_id: input.orderId,
      author_type: input.authorType,
      author_id: input.authorId ?? null,
      author_name: input.authorName.slice(0, 120),
      body,
      attachments,
      // The author has obviously read their own message.
      ...(input.authorType === 'client'
        ? { read_by_client_at: new Date().toISOString() }
        : { read_by_staff_at: new Date().toISOString() }),
    })
    .select('id, author_type, author_name, body, attachments, created_at, read_by_client_at, read_by_staff_at')
    .single();
  if (error || !message) {
    console.error('[messages] insert error:', error?.message);
    return { ok: false, error: 'Mesajul nu a putut fi salvat', status: 500 };
  }

  // Trace in the order history (event_type is CHECK-constrained).
  const who =
    input.authorType === 'client' ? 'client' : input.authorType === 'collaborator' ? `colaborator: ${input.authorName}` : input.authorName;
  await admin.from('order_history').insert({
    order_id: input.orderId,
    event_type: 'note_added',
    changed_by: who,
    notes:
      input.authorType === 'client'
        ? `Mesaj de la client${attachments.length ? ` (${attachments.length} atașament${attachments.length > 1 ? 'e' : ''})` : ''}: ${body.slice(0, 300)}`
        : `Mesaj trimis clientului: ${body.slice(0, 300)}`,
  });

  const emailed = await notify(admin, order, message as OrderMessage).catch((e) => {
    console.error('[messages] notify error:', e instanceof Error ? e.message : e);
    return [] as string[];
  });

  return { ok: true, message: message as OrderMessage, emailed };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function notify(admin: Admin, order: any, message: OrderMessage): Promise<string[]> {
  const svc = Array.isArray(order.services) ? order.services[0] : order.services;
  const serviceName: string = svc?.name ?? 'comanda ta';
  const friendly: string = order.friendly_order_id ?? order.id;
  const brand = brandForOrder(order);
  const sent: string[] = [];

  if (message.author_type !== 'client') {
    const email: string | undefined = order.customer_data?.contact?.email;
    if (!email) return sent;
    const appUrl = appBaseForOrder(order);
    const mail = renderOrderMessageToClientEmail({
      brand,
      friendlyOrderId: friendly,
      serviceName,
      authorLabel: clientFacingAuthor(message, brand.name),
      body: message.body,
      viewUrl: `${appUrl}/comanda/status/?order=${encodeURIComponent(friendly)}&email=${encodeURIComponent(email)}#mesaje`,
    });
    const result = await sendEmail({
      to: email,
      from: brand.emailFrom,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      idempotencyKey: `order-message-${message.id}`,
    });
    if (!result.skipped) sent.push(email);
    return sent;
  }

  // Client replied → the brand's inbox + the topograph(s) working the order.
  const nameParts = identifiableName(order.customer_data);
  const clientName = nameParts ? formatPersonName(nameParts.lastName, nameParts.firstName) : order.customer_data?.contact?.email ?? '';
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';

  const recipients: Array<{ to: string; url: string }> = [
    { to: brand.contactEmail, url: `${base}/admin/orders/${order.id}` },
  ];
  const collaboratorIds = new Set<string>();
  if (order.assigned_collaborator_id) collaboratorIds.add(order.assigned_collaborator_id);
  if (order.service_id) {
    const { data: assignments } = await admin
      .from('collaborator_service_assignments')
      .select('collaborator_id')
      .eq('service_id', order.service_id);
    for (const a of assignments ?? []) collaboratorIds.add(a.collaborator_id);
  }
  for (const id of collaboratorIds) {
    const { data: authUser } = await admin.auth.admin.getUserById(id);
    const email = authUser?.user?.email;
    if (email) recipients.push({ to: email, url: `${base}/colaborator/orders/${order.id}` });
  }

  for (const r of recipients) {
    try {
      const mail = renderOrderMessageToStaffEmail({
        friendlyOrderId: friendly,
        serviceName,
        clientName,
        body: message.body,
        attachmentCount: message.attachments?.length ?? 0,
        orderUrl: r.url,
      });
      const result = await sendEmail({
        to: r.to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        replyTo: order.customer_data?.contact?.email || undefined,
        idempotencyKey: `order-message-${message.id}-${r.to}`,
      });
      if (!result.skipped) sent.push(r.to);
    } catch (e) {
      console.error('[messages] staff email error:', e instanceof Error ? e.message : e);
    }
  }
  return sent;
}

/** Unread client replies per order, for list badges. */
export async function unreadClientMessageCounts(
  orderIds: string[],
  admin: Admin = createAdminClient()
): Promise<Record<string, number>> {
  if (!orderIds.length) return {};
  const { data } = await admin
    .from('order_messages')
    .select('order_id')
    .in('order_id', orderIds)
    .eq('author_type', 'client')
    .is('read_by_staff_at', null);
  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.order_id] = (out[row.order_id] ?? 0) + 1;
  return out;
}
