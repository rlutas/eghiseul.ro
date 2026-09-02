# Conversii ChatGPT Ads — pixel + Conversions API (02.09.2026)

Fără conversii, Ads Manager nu poate raporta CPA și nu poate optimiza. Am setat ambele canale
oficiale (https://developers.openai.com/ads/measurement-pixel , https://developers.openai.com/ads/conversions-api).

## Ce e configurat în Ads Manager

| Obiect | Valoare |
|---|---|
| Data source (pixel) | **eghiseul.ro web** — Pixel ID `QzXwAbRL9bRrWomdusTNSY` (public, e în snippet) |
| Conversion event | **Order CreatedPurchase** (id `6a985f4f0e7c8196b93217e061820220`), base event `order_created`, fereastră click 30 zile |
| Conversion key (API) | ⚠️ **de creat de Raul**: Conversions → „Conversion keys" → Create new key → valoarea în Vercel ca `OPENAI_ADS_API_KEY` (production + preview) și în `.env.local`. Cheia se vede o singură dată. |
| Link event → campanie | doar pentru obiectivul Conversions; campania noastră e pe Clicks, raportarea merge pe `oppref` fără link |

## Cum funcționează pe site

```
click în ChatGPT → landing ?utm_source=chatgpt&…&oppref=<id OpenAI>
   │
   ├─ attribution.ts (localStorage, fără consimțământ — first-party, fără terți)
   │     salvează utm_* + oppref în first/last → ajunge în orders.attribution la draft
   │
   ├─ pixel oaiq (DOAR cu consimțământ de marketing, ca eticheta Google Ads)
   │     cookie-consent.tsx → loadOpenAiPixel(); pagina de succes → oaiq('measure','order_created', …, {event_id: order_number})
   │
   └─ webhook Stripe (payment_intent.succeeded / checkout.session.completed)
         openai-conversions.ts → POST bzr.openai.com/v1/events cu id=order_number, oppref, email/telefon SHA-256
         DOAR dacă atribuirea are oppref sau utm_source=chatgpt (minimizare date, GDPR)
```

Dedup: același `id` (numărul comenzii, ex. `E-260902-N8HLU`) pe pixel și pe API → OpenAI păstrează
primul, ignoră restul (inclusiv refresh pe pagina de succes și cele două webhook-uri Stripe).

## Fișiere

| Fișier | Ce face |
|---|---|
| `src/lib/analytics/attribution.ts` | `TouchPoint.oppref` capturat din `?oppref=`; contează ca sursă |
| `src/components/consent/cookie-consent.tsx` | `loadOpenAiPixel()` la consimțământ marketing (snippet oficial, `NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID`) |
| `src/app/comanda/success/[orderId]/page.tsx` | `oaiq('measure','order_created')` cu sumă în bani (minor units), RON, `event_id` |
| `src/lib/analytics/openai-conversions.ts` | senderul server-side (hash email/telefon după regulile OpenAI, timeout 5s, niciodată nu aruncă) |
| `src/app/api/webhooks/stripe/route.ts` | apel non-fatal după ce comanda e marcată plătită |

Env: `NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID` (pus în Vercel production+preview și `.env.local`),
`OPENAI_ADS_API_KEY` (**lipsă** până o creează Raul; fără ea, serverul nu trimite nimic — pixelul merge oricum).

## Verificare după deploy

1. Deschide în incognito `https://eghiseul.ro/servicii/certificat-constatator-online/?utm_source=chatgpt&utm_medium=cpc&utm_campaign=test&oppref=test123`,
   acceptă marketing în banner → în DevTools Network trebuie să apară `bzrcdn.openai.com/sdk/oaiq.min.js` și cookie `__oppref`.
2. Fă o comandă de test plătită → Ads Manager → Conversions → **Event Stream** trebuie să arate `order_created` (pixel) și,
   după cheia API, și evenimentul de la server (`integration_source: eghiseul-stripe-webhook`).
3. În DB: `select order_number, attribution->'last'->>'oppref' from orders order by created_at desc limit 5`.

## Ce NU trimitem

- Nimic pentru comenzile care n-au venit din ChatGPT (fără oppref/utm chatgpt).
- Date în clar: emailul și telefonul pleacă doar SHA-256, normalizate după docs.
- Evenimente de tip page_viewed / checkout_started — nu avem nevoie pentru raportare; se pot adăuga
  dacă trecem campania pe obiectiv Conversions (atunci și „Link event to a campaign").
