/**
 * GET /<key>.txt (rewritten here by next.config.ts) — the IndexNow key file.
 * Answers the key as plain text only when it is THIS host's key, so
 * documentero.ro and eghiseul.ro each prove ownership of their own key.
 */
import { NextRequest } from 'next/server';
import { keyForRequest } from '@/lib/seo/indexnow';

export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const value = keyForRequest(host, key);
  if (!value) return new Response('Not found', { status: 404 });
  return new Response(value, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
