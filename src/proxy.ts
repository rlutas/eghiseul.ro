import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Cadavrele de WordPress: `/wp-admin/*`, `/wp-content/*`, `/wp-includes/*`,
 * `/wp-login.php`, `/xmlrpc.php`.
 *
 * După cutover-ul din iunie 2026 nu mai există nimic acolo, dar Google le ține
 * în index: 32 de URL-uri legacy încă primeau expuneri în GSC la 09.09.2026,
 * între care 6 PDF-uri de contract din `/wp-content/uploads/` (65 de expuneri
 * doar pe `/wp-admin/*`). Serverul răspundea **403** — semnalul greșit: „există,
 * dar n-ai voie", deci crawlerul revine. **410 Gone** e afirmația corectă și
 * scoate URL-ul din index mult mai repede.
 *
 * Verificat pe 09.09.2026: PDF-urile NU sunt accesibile public (nicio scurgere
 * de date), doar prost semnalizate.
 */
const WORDPRESS_GONE = /^\/(wp-admin|wp-content|wp-includes|wp-json)(\/|$)|^\/(wp-login\.php|xmlrpc\.php|wp-cron\.php)$/

export async function proxy(request: NextRequest) {
  if (WORDPRESS_GONE.test(request.nextUrl.pathname)) {
    return new NextResponse(null, {
      status: 410,
      headers: { 'X-Robots-Tag': 'noindex' },
    })
  }
  return await updateSession(request)
}

export const config = {
  /**
   * DOAR rutele care au nevoie de sesiune Supabase.
   *
   * Înainte matcher-ul era „tot ce nu e asset static", deci `updateSession()` —
   * care apelează `supabase.auth.getUser()` — rula la FIECARE cerere, inclusiv
   * pe homepage, cele 40+ de calculatoare, articole, `/servicii/*`,
   * `sitemap.xml` și `llms.txt`. Adică muncă de autentificare pe ~toate cele
   * 54.000 de vizite organice lunare, cu rezultatul aruncat: paginile publice
   * nu citesc niciodată sesiunea.
   *
   * Context: TTFB-ul s-a degradat +19,9% în 6 luni (CrUX, 222→266 ms) — audit
   * 28.07.2026, docs/seo/audit-2026-07-28/.
   *
   * ⚠️ Dacă adaugi o zonă nouă care depinde de sesiune (server components care
   * citesc cookie-urile de auth, redirect pentru neautentificați), adaug-o AICI,
   * altfel utilizatorul apare delogat acolo.
   *
   * `/api` rămâne inclus: rutele își fac propriul client, dar refresh-ul de
   * cookie de aici le ține tokenul proaspăt (wizardul salvează draft-uri des).
   */
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/kyc/:path*',
    '/orders/:path*',
    '/auth/:path*',
    '/colaborator/:path*',
    '/comanda/:path*',
    '/completare/:path*',
    '/reincarca-poza/:path*',
    '/api/:path*',
    // Rutele moarte de WordPress — prinse ca să răspundă 410, nu 403.
    '/wp-admin/:path*',
    '/wp-content/:path*',
    '/wp-includes/:path*',
    '/wp-json/:path*',
    '/wp-login.php',
    '/xmlrpc.php',
    '/wp-cron.php',
  ],
}
