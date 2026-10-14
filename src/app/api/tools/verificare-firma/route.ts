/**
 * GET /api/tools/verificare-firma?cui=14399840
 *
 * Public, free company check for /tools/verificare-firma-cui/. Validates the
 * CUI (checksum) and returns `fetchFirmReport()` (ANAF TVA register + balance
 * sheets). Best-effort per-IP limit so the tool cannot be used to hammer ANAF
 * (ANAF asks for max ~1 request/second).
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCUIFormat } from '@/lib/services/infocui';
import { fetchFirmReport } from '@/lib/company/firm-report';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (limited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Prea multe verificări într-un minut. Încearcă din nou puțin mai târziu.' },
      { status: 429 },
    );
  }

  const raw = request.nextUrl.searchParams.get('cui') ?? '';
  const check = validateCUIFormat(raw);
  if (!check.valid) {
    return NextResponse.json(
      { success: false, error: check.error || 'CUI invalid. Verifică cifrele (fără „RO” în față).' },
      { status: 400 },
    );
  }

  try {
    const report = await fetchFirmReport(check.cleanCUI);
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Nu am găsit nicio firmă cu acest CUI în evidența ANAF.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: report });
  } catch (e) {
    console.error('verificare-firma: ANAF lookup failed', e instanceof Error ? e.message : e);
    return NextResponse.json(
      { success: false, error: 'Serviciul ANAF nu răspunde acum. Încearcă din nou în câteva minute.' },
      { status: 503 },
    );
  }
}
