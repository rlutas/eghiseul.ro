import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/permissions';
import { searchDocs } from '@/lib/knowledge/docs';
import { parseSearchScope } from '@/lib/knowledge/corpus';

/**
 * GET /api/admin/knowledge/search?q=...&scope=team|all — căutare full-text
 * (titlu + conținut, fără diacritice obligatorii). Implicit pe corpusul
 * echipei (admin/, changelog/, registru-central/); `scope=all` acoperă toată
 * documentația din docs/, inclusiv specificațiile tehnice.
 * Răspuns: { results: [{ slug, title, relPath, snippetHtml, score }] }.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requireAdmin(user.id);
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    const q = (request.nextUrl.searchParams.get('q') || '').trim().slice(0, 200);
    if (q.length < 2) {
      return NextResponse.json({ success: true, data: { query: q, results: [] } });
    }
    const scope = parseSearchScope(request.nextUrl.searchParams.get('scope'));
    const results = await searchDocs(q, 30, scope);
    return NextResponse.json({ success: true, data: { query: q, scope, results } });
  } catch (err) {
    console.error('[knowledge/search] failed:', err);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}
