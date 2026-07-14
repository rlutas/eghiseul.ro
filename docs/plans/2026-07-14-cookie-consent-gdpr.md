# Plan: Cookie consent banner + conformare GDPR/ePrivacy

**Status:** PLAN (cerut de Raul 2026-07-14) — de implementat. Nu avem banner de cookies azi.

## Situația actuală (auditată 2026-07-14)

| Ce se încarcă | Unde | Categorie | Problema |
|---|---|---|---|
| Google Analytics 4 (`gtag.js`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`) | `src/app/layout.tsx` + eveniment purchase în `comanda/success` | **Analitice** | Se încarcă NECONDIȚIONAT, înainte de orice consimțământ → neconform ePrivacy/GDPR |
| Stripe.js | checkout | Necesare (plată) | OK fără consimțământ (strict necesar) |
| Supabase auth cookies | tot site-ul | Necesare | OK |
| Google Ads (cont activ, conversii?) | de verificat în GTM/gtag | **Marketing** | Dacă tragem conversii Ads → consimțământ obligatoriu + Consent Mode |
| Pagina `/politica-cookies/` | există în footer | — | De actualizat cu lista reală de cookies după implementare |

Riscul practic: ANSPDCP amendează pentru analytics fără consimțământ; și Google Ads cere **Consent Mode v2** pentru conversii în EEA din martie 2024 — fără el pierdem și date de conversie.

## Decizia recomandată: self-built, NU CMP extern

Un CMP SaaS (CookieYes/Cookiebot) = script extern, cost lunar, design generic. Avem un singur vendor real (Google) — un banner propriu e o zi de lucru și rămâne pe brand:

1. **Componentă `CookieConsent`** (client, în layout): banner jos, 3 acțiuni — „Accept tot", „Doar necesare", „Personalizează" (toggle Analitice / Marketing). Stocare: cookie `cookie_consent` (JSON, 6 luni) + localStorage mirror. Fără bannere care blochează tot ecranul (dark pattern).
2. **Google Consent Mode v2**: în layout, ÎNAINTE de gtag: `gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})`. La accept → `gtag('consent','update',...)`. GA se poate încărca mereu (cookieless ping) SAU îl încărcăm doar după consimțământ — recomand varianta a doua (mai curat juridic): `<Script>` GA montat condiționat de starea de consimțământ.
3. **Buton „Setări cookies" persistent** în footer (relink la banner) — cerință ePrivacy (retragerea consimțământului la fel de ușoară ca acordarea).
4. **Purchase event** din `comanda/success` — gated pe consimțământ analytics.
5. **Actualizare `/politica-cookies/`**: tabel real (nume cookie, scop, durată, vendor) — `_ga`, `_ga_*`, `cookie_consent`, cookies Supabase (`sb-*`), Stripe (`__stripe_mid/sid`).
6. **Verificare**: incognito → zero cookies `_ga*` înainte de consimțământ; după „Doar necesare" → la fel; după „Accept tot" → GA activ; retragere → cookies șterse (document.cookie expire) la următorul pageview.

## Estimare & ordine

- Componenta + consent mode + gating GA: ~o jumătate de zi.
- Politica cookies actualizată + buton footer: ~1-2 ore.
- Bonus (opțional): stocăm și un log de consimțământ (timestamp+versiune text) în localStorage pentru dovadă.

## De decis cu Raul înainte de implementare

1. Vrem și categoria Marketing acum (Google Ads conversion tracking activ?) sau doar Analitice?
2. Bannerul și pe CJO + cfunciara (aceleași riscuri)? Recomand: da, componentă copiabilă.
