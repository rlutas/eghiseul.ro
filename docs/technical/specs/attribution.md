# Atribuirea comenzilor (de unde vine fiecare comandă)

Ultima actualizare: 06.10.2026. Același model e implementat și în repo-ul `cazierjudiciaronline.com` (CJO + ecazier).

## Ce se capturează

`src/lib/analytics/attribution.ts`, montat pe tot site-ul prin `AttributionTracker` din `src/app/layout.tsx` (deci și pe documentero, care folosește același root layout). La fiecare navigare se citesc:

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`;
- click ID-uri: `gclid` / `gbraid` / `wbraid` (Google), `msclkid` (Microsoft), `fbclid` (Meta), `ttclid` (TikTok), `li_fat_id` (LinkedIn);
- `oppref` / `oai_ref` (ChatGPT Ads);
- `document.referrer` (doar extern; întoarcerea de la Stripe / 3-D Secure / Oblio e ignorată din 06.10);
- pagina de aterizare și ora.

Stocare: `localStorage['eg_attribution']`, per host (eghiseul.ro și documentero.ro au fiecare a lui). `first` nu se suprascrie niciodată; `last` se schimbă doar la o sursă nouă reală sau după 30 de minute de pauză. După 90 de zile fără vizită se pornește de la zero. Nu conține date personale și nu pleacă la terți, deci nu depinde de consimțământul pentru cookie-uri de marketing (vezi `cookie-consent.md`).

## Unde ajunge

`POST /api/orders/draft` (crearea draftului) scrie `orders.attribution` o singură dată:

```json
{ "first": {…}, "last": {…}, "updated": "…", "channel": "organic_search", "source": "google" }
```

`channel` și `source` sunt adăugate din 06.10; comenzile vechi se clasifică la citire, cu aceeași funcție.

## Clasificarea

`src/lib/analytics/attribution-channel.ts` (`classifyAttribution`, pură, testată în `tests/unit/lib/analytics/attribution-channel.test.ts`). Ultima atingere cu sursă (`last`, apoi `first`), altfel direct. Ordinea regulilor:

1. UTM de email al nostru (`utm_medium` email/lifecycle/warmup/recovery/campaign sau `utm_source=email`) → `email`;
2. `oppref` sau ChatGPT cu medium plătit → `chatgpt_ads`;
3. click ID: Google → `google_ads`, Microsoft → `microsoft_ads`, TikTok (cu medium plătit) → `tiktok_ads`;
4. UTM plătit (cpc/ppc/paid…) fără click ID → Google / Microsoft / Meta / TikTok Ads după sursă;
5. `fbclid` fără medium plătit → `social` (Facebook îl pune și pe linkurile organice);
6. `utm_source` fără medium plătit: asistent AI (ChatGPT pune singur `utm_source=chatgpt.com`), social, motor de căutare, rețeaua noastră, altfel `referral`;
7. referrer: client de email (Gmail app/web, Outlook…) → `email`; asistent AI (chatgpt.com, perplexity.ai, copilot.microsoft.com, gemini.google.com, claude.ai…) → `ai_assistant`; motor de căutare (google.*, aplicația Google `android-app://com.google.android.googlequicksearchbox`, bing, duckduckgo, yahoo, yandex, ecosia, brave…) → `organic_search`; social (facebook, instagram, t.co/x, tiktok, linkedin, whatsapp, youtube…) → `social`; site-urile noastre (eghiseul, documentero, ecazier, cazierjudiciaronline, avocat-tarta) → `network`; altele → `referral`;
8. nimic → `direct`.

## Unde se vede

- `/admin/marketing` → cardul „KPI marketing”: tabelul „Comenzi plătite pe canal (toate sursele)”, pe site și sursă, pentru 7/30/90 de zile.
- Pagina comenzii (admin) → „Proveniență client”: linia „Canal: …”.

## Limite cunoscute

- „Direct” include adrese tastate, aplicații care ascund sursa (WhatsApp, Facebook in-app pe unele telefoane), linkuri de reluare fără UTM și clientul care își șterge datele browserului.
- Conversiile Google Ads (gtag, enhanced conversions) nu depind de acest mecanism.
