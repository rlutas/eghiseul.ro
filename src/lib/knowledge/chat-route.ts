import { NextRequest, NextResponse } from 'next/server';
import { isChatConfigured, streamAnswer, type ChatTurn } from './chat';
import type { ChatAudience } from './chat-context';
import { asResponse, requireKnowledgeActor } from './request-auth';
import { createReport, isReportKind } from './reports';

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
