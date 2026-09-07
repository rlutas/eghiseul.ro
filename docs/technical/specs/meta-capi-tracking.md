# Meta Conversions API — tracking server-side

**Status:** LIVE (Purchase din 03.09.2026, InitiateCheckout din 07.09.2026)

## Problema pe care o rezolvă

Pixelul Meta din browser se încarcă **doar după consimțământul de marketing**
(`src/components/consent/cookie-consent.tsx` → `loadMetaPixel`, apelat din `applyConsent`
când `state.marketing === true`). Bannerul de cookies e o bară jos, neblocantă, deci în
practică majoritatea vizitatorilor nu apasă niciodată „Accept toate".

Măsurat pe campania Meta din 03–07.09.2026: **191 de clicuri pe link → 25 de vizualizări de
pagină raportate (13%)**. Benchmark normal: 60–80%. Nu pagina era lentă — evenimentele pur și
simplu nu se declanșau.

Consecința gravă: `InitiateCheckout` — **chiar evenimentul pe care optimiza campania** — era la
fel de sub-raportat. Algoritmul Meta nu avea semnal pe care să învețe, așa că livra pe cel mai
ieftin inventar disponibil (Audience Network). Vezi `docs/ads/meta/08-verificare-campanie-07-09.md`.

## Ce trimitem

| Eveniment | Când | De unde | `event_id` |
|---|---|---|---|
| `InitiateCheckout` | la CREAREA draftului (nu la update) | `POST /api/orders/draft` | `ic_<friendly_order_id>` |
| `Purchase` | după ce comanda e marcată plătită | webhook Stripe | `<order_number>` |

Ambele pleacă **și** din pixel (browser) **și** din server, cu **același `event_id`** — Meta
face dedup și păstrează un singur eveniment. Dacă utilizatorul n-a acceptat cookie-urile,
pixelul nu trimite nimic și rămâne doar canalul server: numărătoarea e corectă în ambele cazuri.

## Fișiere

| Fișier | Rol |
|---|---|
| `src/lib/analytics/meta-conversions.ts` | clientul CAPI: `sendMetaInitiateCheckoutEvent`, `sendMetaPurchaseEvent`, `cameFromMeta` |
| `src/app/api/orders/draft/route.ts` | `fireMetaInitiateCheckout()` — fire-and-forget după insert (calea principală + calea de retry la coliziune de ID) |
| `src/app/api/webhooks/stripe/route.ts` | apelul de `Purchase` |
| `src/providers/modular-wizard-provider.tsx` | pixelul din browser: `InitiateCheckout` cu `eventID`, **doar la HTTP 201** (draft creat), nu la 200 (draft actualizat) |
| `src/lib/analytics/meta-pixel.ts` | `trackMeta(event, params, eventId)` — no-op dacă `fbq` lipsește |

## Reguli respectate

1. **Minimizarea datelor (GDPR).** Trimitem **doar** pentru comenzile care chiar vin din Meta —
   `cameFromMeta()` cere `click_platform === 'meta'` cu `click_id`, sau `utm_source` în
   {meta, facebook, instagram, fb, ig}. Pentru restul traficului nu pleacă nimic.
2. **Hash-uri conform Meta.** email lowercase+trim → SHA-256; telefon doar cifre, prefix de țară,
   fără `+` → SHA-256. `fbc` reconstruit ca `fb.1.<timestamp>.<fbclid>`.
3. **Nu blochează nimic.** `fireMetaInitiateCheckout` e `void (async () => {...})()` — răspunsul
   către client nu așteaptă Meta. `postEvent` are timeout 5s și nu aruncă niciodată.
4. **No-op tăcut** fără `NEXT_PUBLIC_META_PIXEL_ID` sau `META_CAPI_ACCESS_TOKEN`.

## Cum verifici că merge

1. Events Manager → pixelul eGhiseul → **Test Events**: pune codul de test și fă o comandă cu
   `?fbclid=test123` în URL. Trebuie să vezi `InitiateCheckout` cu sursa **Server**.
2. Events Manager → **Overview** → coloana „Event Deduplication": după 24–48h trebuie să apară
   evenimente primite pe ambele canale și deduplicate.
3. În loguri: `[meta-conversions] InitiateCheckout <ORDER> sent`.

⚠️ Dacă vezi evenimentul **de două ori** (nededuplicat), `event_id` nu se potrivește: verifică
prefixul `ic_` pe ambele canale.

## Ce NU acoperă

- `PageView` și `ViewContent` rămân doar pe pixel (deci tot gated pe consimțământ). `LandingPageView`
  e o metrică derivată de Meta din `PageView`, deci și ea rămâne sub-raportată.
- Consecință pentru campanii: **nu optimiza pe Landing Page View** — optimizează pe
  `InitiateCheckout`, care acum are canal server-side complet.
