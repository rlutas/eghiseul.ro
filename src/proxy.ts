import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isOrderPathBlockedOnHost } from '@/lib/brand/order-guard'

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

/**
 * `src/app/documentero/` is the documentero.ro route group, reached ONLY via
 * the host rewrite in next.config.ts (documentero.ro/x → /documentero/x).
 * Typed literally — on eghiseul.ro (a duplicate of the other site) or on
 * documentero.ro (the same page under two URLs) — it does not exist.
 * Middleware sees the path as the user sent it, before the rewrite, so this
 * never touches the rewritten requests.
 */
const BRAND_INTERNAL = /^\/(documentero|cazierfiscal|constatator)(\/|$)/  // + cazierfiscal.com (2026-11-10), certificat-constatator-express.ro (2026-11-11)
/**
 * The only files under `/documentero/` that must stay reachable: the icons
 * Next.js emits from `src/app/documentero/icon.png` and `apple-icon.png`
 * (their <link> href is the segment path, `/documentero/icon.png?<hash>`).
 * Without this the documentero tab showed eghiseul's favicon (19.09.2026).
 */
const BRAND_STATIC_ICON = /^\/(documentero|cazierfiscal|constatator)\/(icon|apple-icon)\d*\.(png|svg|ico)$/

export async function proxy(request: NextRequest) {
  if (WORDPRESS_GONE.test(request.nextUrl.pathname)) {
    return new NextResponse(null, {
      status: 410,
      headers: { 'X-Robots-Tag': 'noindex' },
    })
  }
  if (
    BRAND_INTERNAL.test(request.nextUrl.pathname) &&
    !BRAND_STATIC_ICON.test(request.nextUrl.pathname)
  ) {
    return new NextResponse(null, {
      status: 404,
      headers: { 'X-Robots-Tag': 'noindex' },
    })
  }
  // A single-topic site takes orders only for what it sells — a real 404, not
  // the streamed not-found the page falls back to (see order-guard.ts).
  if (isOrderPathBlockedOnHost(request.headers.get('host'), request.nextUrl.pathname)) {
    return new NextResponse(null, {
      status: 404,
      headers: { 'X-Robots-Tag': 'noindex' },
    })
  }
  try {
    return await updateSession(request)
  } catch (error) {
    // The session refresh is a convenience: every API route builds its own
    // client and checks the user itself. Letting a Supabase Auth hiccup throw
    // here turned a wizard autosave into an empty 500 (E-261104-W9VR4,
    // 04.11.2026, no log line). Pass API and public requests on instead.
    // Pages behind a login go to the login page rather than open unchecked.
    console.error('[proxy] updateSession failed:', error)
    const path = request.nextUrl.pathname
    const needsLogin =
      ['/account', '/kyc', '/admin'].some((p) => path.startsWith(p)) ||
      (path.startsWith('/orders') && !path.startsWith('/orders/new'))
    if (needsLogin && !path.startsWith('/admin/invite')) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }
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
    // Grupul intern documentero — literal, nu prin rewrite-ul de host.
    '/documentero',
    '/documentero/:path*',
    '/cazierfiscal',
    '/cazierfiscal/:path*',
    '/constatator',
    '/constatator/:path*',
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
