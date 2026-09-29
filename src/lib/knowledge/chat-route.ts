import { NextRequest, NextResponse } from 'next/server';
import { isChatConfigured, streamAnswer, type ChatTurn } from './chat';
import type { ChatAudience } from './chat-context';
import { asResponse, requireKnowledgeActor } from './request-auth';
import { randomUUID } from 'crypto';
import { getUploadUrl } from '@/lib/aws/s3';
import {
  createReport,
  isReportKind,
  isReportSite,
  reportShotPrefix,
  REPORT_SHOT_MAX,
  REPORT_SHOT_MAX_BYTES,
  REPORT_SHOT_TYPES,
  type ReportAttachment,
} from './reports';

/**
 * Corpul comun al rutelor de chat (admin + colaborator). Răspunsul e un flux
 * NDJSON (`application/x-ndjson`): un rând per eveniment —
 * `{"t":"delta","text":"…"}` pe măsură ce vine textul, apoi
 * `{"t":"done","result":{…}}` sau `{"t":"error","message":"…"}`.
 */
export async function handleChat(request: NextRequest, audience: ChatAudience): Promise<Response> {
  try {
    const actor = await requireKnowledgeActor(request, audience);
    if (!isChatConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Chatbotul nu este configurat încă (lipsește cheia API). Raportarea de probleme funcționează.' },
        { status: 503 }
      );
    }
    const body = (await request.json().catch(() => ({}))) as { question?: unknown; history?: unknown };
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    if (question.length < 3) {
      return NextResponse.json({ success: false, error: 'Scrie o întrebare.' }, { status: 400 });
    }
    const history: ChatTurn[] = Array.isArray(body.history)
      ? body.history
          .filter(
            (t): t is ChatTurn =>
              !!t && typeof t === 'object' && (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string'
          )
          .slice(-6)
      : [];
    const encoder = new TextEncoder();
    const events = streamAnswer({ question, audience, history, user: { id: actor.id, role: actor.role } });
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { value, done } = await events.next();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(JSON.stringify(value) + '\n'));
      },
      async cancel() {
        await events.return(undefined);
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' },
    });
  } catch (e) {
    const r = asResponse(e);
    if (r) return r;
    console.error('[knowledge/chat] failed:', e);
    return NextResponse.json({ success: false, error: 'Chatbotul nu a putut răspunde acum. Încearcă din nou sau raportează problema.' }, { status: 500 });
  }
}

/** Corpul comun al rutelor de raportare (admin + colaborator). */
export async function handleCreateReport(request: NextRequest, audience: ChatAudience): Promise<Response> {
  try {
    const actor = await requireKnowledgeActor(request, audience);
    const body = (await request.json().catch(() => ({}))) as {
      kind?: unknown;
      message?: unknown;
      context?: unknown;
    };
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (message.length < 5) {
      return NextResponse.json({ success: false, error: 'Descrie problema în câteva cuvinte.' }, { status: 400 });
    }
    const kind = isReportKind(body.kind) ? body.kind : 'problema';
    const ctx = body.context && typeof body.context === 'object' ? (body.context as Record<string, unknown>) : {};
    const context = {
      page: typeof ctx.page === 'string' ? ctx.page.slice(0, 300) : undefined,
      question: typeof ctx.question === 'string' ? ctx.question.slice(0, 2000) : undefined,
      answer: typeof ctx.answer === 'string' ? ctx.answer.slice(0, 4000) : undefined,
      orderNumber: typeof ctx.orderNumber === 'string' ? ctx.orderNumber.trim().slice(0, 40) : undefined,
      sites: Array.isArray(ctx.sites) ? [...new Set(ctx.sites.filter(isReportSite))] : undefined,
      attachments: parseAttachments(ctx.attachments, actor.id),
    };
    const id = await createReport({
      reporter: { id: actor.id, role: actor.role, email: actor.email },
      audience,
      kind,
      message,
      context,
    });
    return NextResponse.json({ success: true, data: { id } });
  } catch (e) {
    const r = asResponse(e);
    if (r) return r;
    console.error('[knowledge/reports] failed:', e);
    return NextResponse.json({ success: false, error: 'Raportul nu s-a putut salva.' }, { status: 500 });
  }
}

/**
 * Capturile vin ca chei S3 urcate înainte prin `handleReportShotUpload`.
 * Acceptăm doar chei din folderul celui care raportează, ca nimeni să nu
 * atașeze (și apoi să primească link semnat la) un fișier străin.
 */
function parseAttachments(raw: unknown, reporterId: string): ReportAttachment[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const prefix = reportShotPrefix(reporterId);
  const out: ReportAttachment[] = [];
  for (const a of raw) {
    if (!a || typeof a !== 'object') continue;
    const { key, name, mimeType, size } = a as Record<string, unknown>;
    if (typeof key !== 'string' || !key.startsWith(prefix) || key.includes('..')) continue;
    if (typeof mimeType !== 'string' || !REPORT_SHOT_TYPES.includes(mimeType)) continue;
    out.push({
      key,
      name: typeof name === 'string' ? name.slice(0, 120) : 'captura',
      mimeType,
      size: typeof size === 'number' ? size : 0,
    });
    if (out.length >= REPORT_SHOT_MAX) break;
  }
  return out.length ? out : undefined;
}

/** POST { contentType, size, name } → URL semnat pentru o captură de ecran la raport. */
export async function handleReportShotUpload(request: NextRequest, audience: ChatAudience): Promise<Response> {
  try {
    const actor = await requireKnowledgeActor(request, audience);
    const body = (await request.json().catch(() => ({}))) as { contentType?: unknown; size?: unknown; name?: unknown };
    const contentType = typeof body.contentType === 'string' ? body.contentType : '';
    const size = typeof body.size === 'number' ? body.size : 0;
    if (!REPORT_SHOT_TYPES.includes(contentType)) {
      return NextResponse.json({ success: false, error: 'Doar poze: PNG, JPG sau WEBP.' }, { status: 400 });
    }
    if (size <= 0 || size > REPORT_SHOT_MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'Poza trebuie să aibă cel mult 8 MB.' }, { status: 400 });
    }
    const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    const key = `${reportShotPrefix(actor.id)}${randomUUID()}.${ext}`;
    const { url } = await getUploadUrl(key, {
      contentType,
      metadata: { 'reporter-id': actor.id, 'uploaded-at': new Date().toISOString() },
      expiresIn: 600,
    });
    return NextResponse.json({ success: true, data: { uploadUrl: url, key } });
  } catch (e) {
    const r = asResponse(e);
    if (r) return r;
    console.error('[knowledge/reports] shot presign failed:', e);
    return NextResponse.json({ success: false, error: 'Poza nu s-a putut încărca.' }, { status: 500 });
  }
}
