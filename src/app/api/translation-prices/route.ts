import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  DEFAULT_TRANSLATION_PRICE_LIST,
  type TranslationPriceRow,
} from '@/config/translation-languages';

// ──────────────────────────────────────────────────────────────
// GET /api/translation-prices — public read of the translation language
// list (admin_settings.translation_price_list). Only NON-SENSITIVE fields
// are exposed: our negotiated costs stay server/admin-side. Consumers:
// the wizard + Modifică language dropdowns (rows with active=true).
// Fallback = static defaults when admin_settings is missing.
// ──────────────────────────────────────────────────────────────

interface PublicRow {
  language: string;
  group: string;
  active: boolean;
  clientPriceDoc: number | null;
}

function toPublic(rows: TranslationPriceRow[]): PublicRow[] {
  return rows.map(({ language, group, active, clientPriceDoc }) => ({
    language,
    group,
    active,
    clientPriceDoc,
  }));
}

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient: any = createAdminClient();
    const { data, error } = await adminClient
      .from('admin_settings')
      .select('value')
      .eq('key', 'translation_price_list')
      .maybeSingle();

    if (error || !Array.isArray(data?.value)) {
      return NextResponse.json({ success: true, data: toPublic(DEFAULT_TRANSLATION_PRICE_LIST) });
    }

    return NextResponse.json({ success: true, data: toPublic(data.value as TranslationPriceRow[]) });
  } catch {
    return NextResponse.json({ success: true, data: toPublic(DEFAULT_TRANSLATION_PRICE_LIST) });
  }
}
