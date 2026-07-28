import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
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
  ],
}
