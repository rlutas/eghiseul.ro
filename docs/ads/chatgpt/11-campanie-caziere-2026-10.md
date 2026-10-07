# Campania ChatGPT Ads pe caziere (07.10.2026)

## Pe scurt

- Raul a cerut să încercăm caziere pe ChatGPT, deși politica OpenAI (v1.6, 10.09.2026) interzice în afara SUA „legal services”, inclusiv „document preparation”. Am rulat varianta **transparentă**: anunțul și pagina spun că avocatul obține actul. N-am ascuns avocatul ca să treacă de review.
- **Cazier judiciar: blocat imediat.** Statusul este „Ad cannot serve in targeted countries — This ad's policy category has no eligible countries”. OpenAI l-a clasificat ca serviciu juridic (doar SUA).
- **Cazier fiscal: blocat și el** la 07.10, ~09:40, cu același mesaj. Testul s-a încheiat: **cazierele nu pot rula pe ChatGPT Ads în România** cât timp serviciul trece prin avocat. Cost: 0 €.
- Nu facem apel pe „Wrong policy category?”: categoria e corectă, serviciul chiar trece prin avocat.

## Ce s-a creat

| | |
|---|---|
| Campanie | `OAI_Click_CazierJudiciar_2026-10`, Standard, obiectiv **Clicks**, România, toate platformele |
| Buget | **15 €/zi** (minimul platformei), 07.10 09:00 → **14.10 08:00**. Maximum 105 € pe tot testul |
| Conversie | `Order CreatedPurchase` (pixelul `eghiseul.ro web`, Healthy) |
| Text customization | **Off** (platforma nu rescrie singură textele) |
| AG1 `Cazier fara ghiseu` | Max CPC 1,95 €, landing `/servicii/cazier-judiciar-online/`, UTM la nivel de campanie: `utm_source=chatgpt&utm_medium=cpc&utm_campaign=cazier-judiciar-2026-10&utm_content=ag1&oai_ref={oppref}` |
| Anunț AG1 | „Cazier judiciar online” · „Avocatul îl obține pentru tine, fără drum la poliție. 198 lei, 3–5 zile.” · imagine `assets/ad-cazier-judiciar-1024.png` |
| AG2 `Cazier fiscal PF` | Max CPC 1,95 €, landing `/servicii/cazier-fiscal-online/`, UTM la nivel de grup: `utm_campaign=cazier-fiscal-2026-10&utm_content=ag2` (+ aceleași `utm_source`, `utm_medium`, `oai_ref`) |
| Anunț AG2 | „Cazier fiscal online” · „Fără SPV și fără drum la ANAF: avocatul îl obține pentru tine. 198 lei.” · imagine `assets/ad-cazier-fiscal-1024.png` |

Prețuri și termene luate din `services` (cazier judiciar 198 lei / 5 zile, cazier fiscal 198 lei / 3 zile). Imaginile sunt în stilul celor de constatator și extras CF: document stilizat, fără însemne ale Poliției sau ANAF.

⚠️ **Capcană în Ads Manager:** câmpul de descriere din „Create Ad” pierde litere la tastare („pentru” a ieșit „petru”, apoi „pntru”). Verifică previzualizarea înainte de „Create”; dacă lipsesc litere, valoarea se pune prin JavaScript.

## Tracking: verificat 07.10

| Verigă | Stare |
|---|---|
| Pagina de aterizare cu UTM + `oai_ref` → `localStorage.eg_attribution.last` | ✅ testat live pe cazier fiscal: `utm_source=chatgpt`, `utm_campaign`, `utm_content` și `oppref` salvate. Urma testului ștearsă din browser |
| Draftul copiază atribuirea în `orders.attribution` | ✅ deja dovedit în septembrie (3 comenzi cu `oppref`) |
| Pixel `eghiseul.ro web` | ✅ Healthy, 8 evenimente, EQS 42,9% |
| Conversia server-side la plată (webhook Stripe → OpenAI, doar comenzi cu `utm_source=chatgpt` / `oppref`) | ⚠️ încă niciun eveniment real: niciun client ChatGPT n-a plătit până acum. Avertismentul „No recent server-to-server events” e normal până la prima plată |
| Clasificarea canalului în admin (`/admin/marketing`, „Comenzi pe canal”) | ✅ `utm_medium=cpc` + `utm_source=chatgpt` → „ChatGPT Ads” |

## Ce urmărim

| Când | Ce | Unde |
|---|---|---|
| ~~08.10~~ | ~~Verdictul pe cazier fiscal~~: venit pe 07.10, blocat | — |
| zilnic, dacă difuzează | Afișări, clicuri, cost; comenzi începute și plătite cu `utm_campaign=cazier-fiscal-2026-10` | Ads Manager + `node scripts/check-chatgpt-ads.mjs` |
| 14.10 | Campania se oprește singură. Decizie: o comandă plătită la ≤ 60 lei cost = continuăm; zero comenzi la 100+ clicuri = oprim | acest fișier |

Dacă și cazierul fiscal e blocat: campania nu cheltuie nimic (nu difuzează), o lăsăm să expire pe 14.10. Rămâne opțiunea de a întreba suportul (`ads-support@openai.com`) dacă un serviciu de obținere a unui certificat prin avocat poate fi tratat altfel. Nu reformulăm anunțul ca să ascundă avocatul.

## Jurnal

| Data | Ce |
|---|---|
| 07.10 ~09:10 | Campania creată și publicată. Campaniile din septembrie (constatator, extras CF) erau deja oprite, fără afișări din 24.09 |
| 07.10 ~09:12 | AG1 cazier judiciar: „Ad cannot serve in targeted countries”, categorie fără țări eligibile |
| 07.10 ~09:15 | AG2 cazier fiscal: „In review” |
| 07.10 ~09:40 | AG2 cazier fiscal: „Ad cannot serve in targeted countries”. Ambele blocate, 0 afișări, 0 €. Campania rămâne pornită până expiră pe 14.10, fără cost; dacă OpenAI schimbă vreodată clasificarea, difuzează singură în limita de 15 €/zi |
