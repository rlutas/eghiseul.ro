# 07.10.2026 — Emailurile întoarse nu mai strică lista de warm-up
<!-- categorie: automatizari -->

## Pentru echipă

- Pe contact@ nu mai vin alerte „BOUNCE” pentru emailurile de warm-up sau de pe celelalte site-uri. Alerta vine doar când adresa întoarsă are o comandă: atunci sunați clientul pentru adresa corectă, ca până acum.
- O adresă care întoarce definitiv emailul sau îl marchează spam nu mai primește niciun email de marketing (warm-up, campanii, emailuri după comandă).
- Warm-up-ul sare peste adresele scrise greșit (gamil.com, gmail.con) și peste domeniile care nu primesc email. Le vedeți ca „sărite”, nu ca „trimise”.
- Warm-up-ul urcă de la 300 la 600 de emailuri pe zi.

---

**Cauza.** Pe 06.10 warm-up-ul a avut 5,6% emailuri întoarse pe lead-urile vechi din WP (prag 3%). Webhook-ul Resend al eghiseul era **dezactivat din 14.07**: endpoint-ul fusese salvat fără slash final, `trailingSlash` îl redirecționa cu 308 și Resend l-a oprit. Deci nici steagul `email_bounced_at` pe comenzi nu se mai punea din iulie.

**Ce s-a schimbat**
- `api/webhooks/resend`: hard bounce (orice `bounce.type` ≠ `Transient`) sau plângere → `contacts.marketing_status='suppressed'` (nu atinge `unsubscribed`). Alerta pe contact@ pleacă doar când există o comandă în ultimele 60 de zile.
- `api/cron/warmup-campaign`: înainte de trimitere, skip cu motiv `suspicious address` (`isSuspiciousEmail`), `domain typo` (`isLikelyProviderTypo`, nou în `lib/email-typo.ts`: doar greșeli ale furnizorilor mari; `suggestEmailCorrection` singur „corecta” și `libero.it`, `gmx.net`, `uaic.ro`) și `no mx` (`emailDomainAcceptsMail`, fail-open, cache per domeniu). Pe coada actuală: 355 de adrese cu greșeală de tipar + 25 suspecte.
- Webhook-ul Resend reactivat pe `https://eghiseul.ro/api/webhooks/resend/` (cu slash).
- Backfill: 33 de adrese întoarse definitiv din 14.09 → 16 contacte eghiseul pe `suppressed`, 33 în `email_suppressions` pe CJO.
- `admin_settings.warmup_campaign.dailyBatchSize`: 300 → 600 (decizie Raul, 07.10).
- Teste: `tests/unit/api/webhook-resend.test.ts` (nou), `cron-warmup-campaign.test.ts`, `email-typo.test.ts`.
