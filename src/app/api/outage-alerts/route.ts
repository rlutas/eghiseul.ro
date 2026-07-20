/**
 * POST /api/outage-alerts
 *
 * Înscriere la notificarea de revenire a unui serviciu extern picat
 * (ANCPI, ONRC etc.). Public, fără autentificare — se apelează din articolele
 * de outage.
 *
 * De ce există: articolul de outage aduce trafic cu intenție mare, dar singura
 * conversie era „comandă acum". Cine nu e gata să plătească pleacă fără urmă.
 * Aici capturăm exact publicul care vrea documentul dar așteaptă revenirea.
 *
 * Idempotent: o re-înscriere pe același (service, email) actualizează
 * atribuirea și consimțământul, fără să dubleze rândul și fără să reseteze
 * `notified_at` (dacă a fost deja anunțat, nu-l anunțăm de două ori).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Serviciile pentru care acceptăm înscrieri. Listă albă, ca un POST arbitrar
// să nu ne umple tabela cu valori inventate.
const ALLOWED_SERVICES = new Set(['ancpi', 'onrc']);

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const service = String(body?.service ?? '').trim().toLowerCase();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const marketingConsent = body?.marketingConsent === true;
    const sourcePage = typeof body?.sourcePage === 'string' ? body.sourcePage.slice(0, 300) : null;

    if (!ALLOWED_SERVICES.has(service)) {
      return NextResponse.json(
        { success: false, error: 'Serviciu necunoscut.' },
        { status: 400 }
      );
    }
    if (!EMAIL_RX.test(email) || email.length > 254) {
      return NextResponse.json(
        { success: false, error: 'Adresa de email nu pare validă.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Atribuire + audit GDPR (dovada momentului și contextului înscrierii).
    const referrer = request.headers.get('referer')?.slice(0, 500) ?? null;
    const userAgent = request.headers.get('user-agent')?.slice(0, 500) ?? null;
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = (supabase as any).from('outage_alerts');
    const { error } = await table.upsert(
      {
        service,
        email,
        source_page: sourcePage,
        referrer,
        utm: body?.utm && typeof body.utm === 'object' ? body.utm : null,
        marketing_consent: marketingConsent,
        ip,
        user_agent: userAgent,
      },
      { onConflict: 'service,email', ignoreDuplicates: false }
    );

    if (error) {
      console.error('[outage-alerts] upsert failed:', error);
      return NextResponse.json(
        { success: false, error: 'Nu am putut salva înscrierea. Încearcă din nou.' },
        { status: 500 }
      );
    }

    // Propagare în `contacts` DOAR cu consimțământ explicit pentru marketing.
    // Alerta punctuală nu e temei pentru comunicări comerciale.
    if (marketingConsent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contacts = (supabase as any).from('contacts');
      const { data: existing } = await contacts
        .select('id, sources')
        .eq('email', email)
        .maybeSingle();

      const sourceTag = `outage-alert-${service}`;
      if (existing) {
        const sources: string[] = Array.isArray(existing.sources) ? existing.sources : [];
        if (!sources.includes(sourceTag)) {
          await contacts
            .update({ sources: [...sources, sourceTag], last_activity_at: new Date().toISOString() })
            .eq('id', existing.id);
        }
      } else {
        await contacts.insert({
          email,
          sources: [sourceTag],
          services: [],
          marketing_status: 'subscribed',
          first_seen_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[outage-alerts] unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Eroare neașteptată.' },
      { status: 500 }
    );
  }
}
