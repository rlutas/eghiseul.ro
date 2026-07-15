# Cookie Consent — spec & funcționare

**Status:** ✅ LIVE (2026-07-15). Plan inițial: [`../../plans/2026-07-14-cookie-consent-gdpr.md`](../../plans/2026-07-14-cookie-consent-gdpr.md) · Changelog: [`../../changelog/2026-07-15-cookie-consent-factura-extra.md`](../../changelog/2026-07-15-cookie-consent-factura-extra.md)

Banner propriu (fără CMP extern), conform GDPR + ePrivacy (Legea 506/2004): **nimic neesențial nu se încarcă înainte de opt-in**, alegerea e reversibilă dintr-un click, iar fiecare consimțământ e dovedibil (art. 7 GDPR) prin registrul de consent receipts.

---

## Arhitectura — 5 piese

| Piesă | Fișier | Rol |
|---|---|---|
| Starea de consimțământ | `src/lib/consent.ts` | cookie `eg_cookie_consent` (JSON, 6 luni, SameSite=Lax), read/write, evenimente, ștergere `_ga*`, `CONSENT_BANNER_VERSION` |
| Banner UI | `src/components/consent/cookie-consent.tsx` | banner jos (NU blochează pagina), Accept toate / Doar necesare / Personalizează; injectează GA doar la opt-in |
| Link setări | `src/components/consent/cookie-settings-link.tsx` | „Setări cookie-uri" — în footer + politica cookies; redeschide bannerul |
| Consent receipts | `POST /api/consent-log` + tabela `cookie_consent_log` (migrarea **118**) | dovada consimțământului (art. 7 GDPR) |
| Pagina publică | `src/app/politica-cookies/page.tsx` | „Ce urmărim / Ce NU urmărim", tabelul exact al cookie-urilor, temei legal |

Montare: `<CookieConsent />` în `src/app/layout.tsx` (root). **GA4 NU mai e în layout** — asta a fost fix-ul de conformitate (înainte se încărca necondiționat).

## Fluxul, pas cu pas

1. **Prima vizită** (fără cookie `eg_cookie_consent`): la mount, componenta setează stub-ul `gtag` + **Consent Mode v2 default `denied`** pe toate (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`), apoi arată bannerul. **gtag.js NU se încarcă.**
2. **Alegerea**:
   - „Accept toate" → analytics + marketing granted;
   - „Doar necesare" → totul rămâne denied;
   - „Personalizează" → toggle-uri pe categorii (Strict necesare = mereu on, disabled).
3. **La salvare** (`writeConsent`):
   - se scrie cookie-ul cu `{v, analytics, marketing, ts, id}` — `id` = UUID-ul consent receipt-ului;
   - `gtag('consent','update',...)` cu alegerile;
   - dacă analytics granted → **abia acum** se injectează `gtag.js` + `config`;
   - dacă analytics denied după un accept anterior → cookie-urile `_ga`, `_ga_*`, `_gid` sunt expirate (host + domain scope);
   - **fire-and-forget** `POST /api/consent-log` cu `{consentId, analytics, marketing, bannerVersion}` (keepalive; bannerul nu blochează pe el).
4. **Vizite ulterioare**: cookie-ul există → `applyConsent` direct (fără banner); GA se încarcă doar dacă analytics era granted.
5. **Schimbarea opțiunii**: „Setări cookie-uri" (footer / politica) → `CONSENT_OPEN_EVENT` → bannerul se redeschide pre-populat cu alegerile curente.

## Consent receipts (dovada GDPR art. 7)

- Tabela `cookie_consent_log`: `consent_id` (uuid, oglindit în cookie-ul vizitatorului), `analytics`, `marketing`, `banner_version`, `ip`, `user_agent`, `created_at`. **RLS activ fără politici = acces doar service-role.**
- La o plângere: ceri utilizatorului valoarea din cookie (sau o citești din browserul lui) → `select * from cookie_consent_log where consent_id = '<id>'` → dovada exactă: când, ce a ales, ce versiune de text a văzut.
- `CONSENT_BANNER_VERSION` (`src/lib/consent.ts`) — **OBLIGATORIU de incrementat** la orice schimbare de text/categorii în banner (ex. `v2-2026-09-01`); versiunea veche + textul ei rămân în git history = dovada a ce s-a afișat.

## Decizii de design (și de ce)

- **Banner jos, FĂRĂ blur/modal blocant**: cookie wall-ul invalidează consimțământul („freely given", EDPB Guidelines 05/2020); blocarea = dark pattern (EDPB 03/2022) + interstițial intruziv (SEO) + bounce pe paginile de comandă.
- **„Doar necesare" buton egal cu „Accept toate"** — proeminență egală (anti-dark-pattern).
- **Self-built, nu CMP** (CookieYes etc.): un singur vendor real (Google), zero cost, on-brand, fără script terț suplimentar.
- **Load-after-consent, nu doar Consent Mode**: mai curat juridic — fără acord, gtag.js nici nu există în pagină (Consent Mode rămâne ca plasă de siguranță).
- Categoria **Marketing** există în banner de pe acum (Google Ads measurement), chiar dacă azi nu setăm cookie-uri proprii de ads — future-proof.

## Cookie-urile de pe site (inventarul complet)

| Cookie | Emitent | Categorie | Durată |
|---|---|---|---|
| `eg_cookie_consent` | eGhișeul | strict necesar | 6 luni |
| `sb-*` | Supabase (auth) | strict necesar | sesiune |
| `__stripe_mid` / `__stripe_sid` | Stripe (checkout, antifraudă) | strict necesar | 1 an / 30 min |
| `_ga`, `_ga_*` | Google Analytics | analiză — **doar cu acord** | până la 2 ani |

Pixeli de retargetare (Facebook/TikTok): **NU există pe site** — dacă se adaugă vreodată, intră pe categoria Marketing + update politica + bump versiune banner.

## Cum testezi (manual, în incognito)

1. Deschide orice pagină → bannerul apare; în DevTools → Application → Cookies: **zero `_ga*`**, doar strict-necesare.
2. „Doar necesare" → bannerul dispare, tot zero `_ga*`; în Network nu există request la `googletagmanager.com`.
3. „Setări cookie-uri" din footer → redeschide; „Accept toate" → `gtag.js` se încarcă, apar `_ga*`, iar în `cookie_consent_log` apare rândul cu `consent_id`-ul din cookie.
4. Redeschide setările → debifează Analiză → Salvează → `_ga*` șterse.

## Extindere pe platformele soră (DE FĂCUT)

CJO + cfunciara au aceeași expunere (GA fără consimțământ). Componentele sunt copiabile aproape 1:1: `consent.ts` + `cookie-consent.tsx` + `cookie-settings-link.tsx` + ruta `/api/consent-log` + migrarea 118 (pe DB-ul fiecărei platforme) + scos GA din layout + link în footer. Atenție la numele cookie-ului (poate rămâne `eg_cookie_consent` sau per-brand) și la `CONSENT_BANNER_VERSION` separat per site.
