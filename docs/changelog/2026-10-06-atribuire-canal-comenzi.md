# 06.10.2026 — De unde vin comenzile: canalul pe fiecare comandă
<!-- categorie: infrastructura -->

## Pentru echipă

- În pagina comenzii, la „Proveniență client”, apare acum **Canalul**: Google (organic), Google Ads, Bing, Microsoft Ads, ChatGPT / alt asistent AI, Facebook / Instagram / WhatsApp, Email (al nostru), site-urile noastre, alt site sau Direct.
- În **Marketing → KPI marketing** e un tabel nou: câte comenzi plătite și cât venit a adus fiecare canal în ultimele 7, 30 sau 90 de zile, separat pe eghiseul și documentero.
- „Direct” înseamnă că nu știm sursa: client care a tastat adresa, a venit dintr-o aplicație care ascunde sursa sau din linkul de reluare.

---

- `src/lib/analytics/attribution-channel.ts` (nou): `classifyAttribution` / `classifyTouch`, pure, 14 teste. Canalele: `google_ads`, `microsoft_ads`, `meta_ads`, `tiktok_ads`, `chatgpt_ads`, `email`, `organic_search`, `ai_assistant`, `social`, `network`, `referral`, `direct`.
- `src/lib/analytics/attribution.ts`: capturează și `li_fat_id`; ignoră referrerul de întoarcere de la plată (Stripe, 3-D Secure, Oblio), care înainte devenea `last` (4 comenzi în 30 de zile aveau sursa „checkout.stripe.com”); atribuirea expiră după 90 de zile fără vizită.
- `POST /api/orders/draft`: salvează `channel` + `source` în `orders.attribution` la crearea draftului (forma veche `first`/`last` rămâne).
- `GET /api/admin/marketing/kpis`: `byChannel` (comenzi plătite pe site / canal / sursă), clasificat la citire.
- documentero: atribuirea NU lipsea (5/5 drafturi o au, tracker-ul e în root layout); toate 5 sunt „direct” (fără referrer și fără UTM).
- Spec: `docs/technical/specs/attribution.md`; `cookie-consent.md` listează `eg_attribution`.
- Ultimele 30 de zile, eghiseul (comenzi începute / plătite / lei): organic 93/32/8.229, direct 78/41/15.520, email 15/7/1.059, social 10/0, AI 8/4/2.201, ChatGPT Ads 3/0, Google Ads 2/2/178, referral 2/2/287, Meta Ads 1/0; documentero direct 5/0.
