# Google Ads pe documentero.ro — lansare și tracking (05.10.2026)

**Decizie Raul, 05.10:** cont Google Ads nou, pe **EDIGITALIZARE SRL**, cu trafic trimis pe **documentero.ro**. Începem cu serviciile pe care concurenții nu le promovează: **certificat de celibat**, apoi **cazier fiscal**, **certificat de naștere**, **certificat de căsătorie** și **extras multilingv**. Cazierul judiciar intră în faza 2.

**De ce acum.** Septembrie a adus circa 58.000 lei pe toate platformele: eghiseul 29,1k, cazierjudiciaronline 29,0k, ecazier 0, documentero 0. Organicul eghiseul e încă demotat după spam update. ecazier a murit când i s-au blocat reclamele. Starea completă e în memoria `situatie-vanzari-2026-10`.

**Ce știm deja (nu repetăm):**
- Planul de cont nou din 31.08: [`2026-08-31-cont-nou-lansare.md`](2026-08-31-cont-nou-lansare.md). Structura, CPA-urile maxime și RSA-urile pentru stare civilă și cazier fiscal sunt acolo.
- Economia pe serviciu: [`2026-08-18-analiza-cont-si-repornire.md`](2026-08-18-analiza-cont-si-repornire.md).
- Cine rulează azi reclame pe cazier și de ce le trec: memoria `concurenti-ads-cazier-2026-10`. Pe scurt, Google aplică regula inconsecvent; nu e un truc pe care să-l putem copia.
- Pachetul de campanii pentru documentero (cuvinte cheie, RSA-uri, negative, buget): [`2026-10-05-documentero-campanii.md`](2026-10-05-documentero-campanii.md).

---

## 1. Riscul, spus o dată

Politica Google „Government documents and official services” (support.google.com/adspolicy/answer/13156083) acoperă explicit certificatele de naștere și cazierul. Conturile noastre au fost respinse pe ea. Suportul a confirmat pe 01.09 că intermediarii privați nu se pot certifica.

Contul nou e pe aceeași firmă. Google îl poate lega de conturile respinse și îl poate respinge sau suspenda. Cât timp nicio reclamă Google nu rulează, nu avem ce pierde. Ce **nu** facem: pagină care ascunde oferta față de Google (ce face infocazier). Asta transformă o respingere obișnuită în suspendare pe viață, pentru toate conturile legate.

## 2. Setup cont (Raul, manual)

1. Cont Google dedicat documentero (de exemplu ads@documentero.ro sau un Gmail nou) → ads.google.com → **Switch to Expert Mode** → creezi contul **fără campanie**. Moneda RON, fusul orar București.
2. Plată pe EDIGITALIZARE SRL.
3. **Verificarea advertiserului** din prima zi: Facturare → Verificarea advertiserului.
4. **Auto-tagging pornit:** Admin → Setări cont → Etichetare automată. Pe 07.09 am găsit **0 comenzi cu gclid din 721**. Fără auto-tagging nu știm ce comenzi aduce o reclamă.
5. **Conversie:** Obiective → Conversii → Nouă → Site → manual: categorie „Achiziție”, valoare „Folosește valori diferite”, numărare „Una”, fereastră 30 de zile, model bazat pe date. Notezi ID-ul (`AW-XXXXXXXXXX`) și eticheta (`AW-XXXXXXXXXX/abcDEF…`).
6. **Enhanced conversions:** în setarea conversiei bifezi „Conversii îmbunătățite” cu metoda **Google tag**. Codul trimite deja email și telefon; vezi §3.
7. Trimiți ID-ul și eticheta. Le pun în Vercel (§4) și verific (§5).
8. Capcanele vechi rămân valabile:
   - wizardul Google NU salvează pasul cu anunțurile până la „Terminat” (memoria `google-ads-wizard-pierde-anuntul`);
   - sitelinkurile se pun **pe campanie**, niciodată pe cont (memoria `google-ads-sitelinkuri-cont-contamineaza`).

## 3. Cum funcționează tracking-ul (cod)

**Fără Google Tag Manager:** folosim gtag.js direct, încărcat din `src/components/consent/cookie-consent.tsx`. GTM ar dubla etichetele și ar ocoli bannerul de consimțământ, așa că nu-l adăugăm.

| Ce | Unde | Detalii |
|---|---|---|
| Consent Mode v2 | `cookie-consent.tsx` (`ensureGtagStub`, `applyConsent`) | Implicit totul `denied`; actualizat din banner. Modul de bază: eticheta Ads se încarcă **doar** cu consimțământ de marketing. |
| GA4 per brand | `NEXT_PUBLIC_GA_MEASUREMENT_ID_DOCUMENTERO` (`G-ND6HB81QXF`) | Proprietate separată din 21.09. |
| Google Ads per brand | `NEXT_PUBLIC_GOOGLE_ADS_ID_DOCUMENTERO` (nou, 05.10) | Pe documentero se încarcă **doar** contul documentero, fără fallback la contul eghiseul. Gol = fără etichetă Ads pe documentero. |
| Conversia „Purchase” | `src/app/(order)/comanda/success/[orderId]/page.tsx` | `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL_DOCUMENTERO` pe documentero; valoarea reală a comenzii, `transaction_id` = numărul comenzii (fără dubluri la refresh). |
| Enhanced conversions | aceeași pagină, `gtag('set','user_data', …)` | Email-ul (lowercase) și telefonul în E.164; gtag le hash-uiește și le trimite doar cu `ad_user_data` acordat. Config cu `allow_enhanced_conversions: true`. |
| gclid / gbraid / wbraid | `src/lib/analytics/attribution.ts` | Salvate în `orders.attribution` (`first`/`last`, `click_id`, `click_platform`). Baza pentru importul de conversii offline, dacă îl facem. |
| Meta Pixel, OpenAI pixel | `cookie-consent.tsx` | Neschimbate (comune ambelor branduri). |

**De decis mai târziu (nu e făcut):** Consent Mode **avansat**, adică eticheta Ads se încarcă și fără consimțământ, cu ping-uri anonime, iar Google modelează conversiile pierdute. Cu modul de bază, cine refuză cookie-urile nu se numără. Schimbarea atinge politica de cookies (`docs/technical/specs/cookie-consent.md`), deci e decizia lui Raul.

## 4. Variabile de mediu (Vercel, Production)

```
NEXT_PUBLIC_GOOGLE_ADS_ID_DOCUMENTERO=AW-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL_DOCUMENTERO=AW-XXXXXXXXXX/eticheta
```

Sunt `NEXT_PUBLIC_`, deci intră în bundle la build: după ce le setezi, faci redeploy. `NEXT_PUBLIC_GOOGLE_ADS_ID` și `…_PURCHASE_LABEL` rămân pentru contul eghiseul.

## 5. Verificare înainte de primul leu

1. Pe documentero.ro, cu „Accept toate” în banner: în **Tag Assistant** (tagassistant.google.com) apare `AW-…` al contului nou și `G-ND6HB81QXF`. **Nu** trebuie să apară `AW-11464910041`, eticheta contului vechi.
2. Intri pe `https://documentero.ro/certificat-de-celibat/?gclid=TEST123`, începi o comandă și verifici în DB `orders.attribution->'last'->>'click_id' = 'TEST123'`.
3. Comandă de test până la pagina de succes, după procedura din memoria `test-comanda-live-fara-plata` (plătit în DB + `invoice_number` fals, altfel pleacă factura în Oblio). În Tag Assistant: evenimentul `conversion` cu `send_to` = eticheta nouă, `value`, `transaction_id` și `user_data`.
4. În Google Ads, conversia trece din „Neverificată” în „Înregistrează conversii” în 24–48 de ore. Abia apoi pornești campaniile.
5. Ștergi comanda de test.

## 6. Ordinea campaniilor

| Fază | Ce | Landing | De ce |
|---|---|---|---|
| 1 | Certificat de celibat (RO + diaspora) | `/certificat-de-celibat/` (indexabilă) | Nimeni nu face reclamă; preț mare (698 lei); publicul e diaspora, care plătește pentru că nu poate veni în țară. |
| 1 | Cazier fiscal | `/cazier-fiscal-online/` (noindex, doar pentru reclame) | Un singur concurent (roghiseul.ro). Istoric pe contul vechi: CPC 1,45 lei, ROAS 3,37 (cel mai bun). |
| 2 | Certificat de naștere, căsătorie | `/certificat-de-nastere/`, `/certificat-de-casatorie/` | Fără concurență pe 31.08. ⚠️ Nu promitem termene scurte: livrăm în 16–18 zile în 67–73% din cazuri (tabelul din 18.08). |
| 2 | Extras multilingv | `/extras-multilingv/` | Diaspora UE. |
| 3 | Cazier judiciar | `/cazier-judiciar-online/` (noindex) | Patru concurenți activi, deci CPC mai mare; doar după ce avem conversii în cont. |

Paginile `/cazier-judiciar-online/` și `/cazier-fiscal-online/` de pe documentero sunt `noindex` permanent și lipsesc din sitemap, ca să nu concureze cu eghiseul și CJO în organic (changelog 05.10).

## 7. Starea contului 809-020-5311 (verificat 05.10)

| Ce | Stare | Ce mai e de făcut |
|---|---|---|
| Cont | **Documentero**, activ, creat 05.10 | — |
| Login | serviciiseonethut@gmail.com, **același login** ca ecazier.ro (885-622-8494, blocat pe politică) și „Cont Google Ads (Anulat)” 624-163-9688 | Google poate lega conturile prin utilizatorul comun. Nu se mai poate schimba; doar notăm. |
| Plătitor | **EDIGITALIZARE SRL**, profil de plăți nou 7925-6963-2887-1113 („Documentero”), Visa ••0827, plăți automate | Card de rezervă: recomandat, nu obligatoriu |
| Monedă / fus orar | RON / (GMT+03:00) Ora Europei de Est | — |
| Etichetare automată (gclid) | **Da** | — |
| Persoane de contact pentru protecția datelor | ⚠️ niciuna | Admin → Setări cont: un contact GDPR (cerut pentru UE) |
| Verificarea advertiserului | nu apare încă în meniu | Google o cere de obicei după primele anunțuri; o faci cu actele EDIGITALIZARE când apare |
| Conversii | ⚠️ **niciuna** | Conversia „Achiziție” cu enhanced conversions (§2.5–2.6), apoi ID + etichetă în Vercel (§4) |
| Campanii | niciuna | după verificarea din §5 |
| Aplicare automată a recomandărilor | dezactivată | lăsăm așa |

## 8. Reguli de oprire și KPI

- Prima săptămână: **plafon de 150 lei/zi** pe tot contul. CPC plafonat după `2026-08-18-strategie-licitare-decizie.md`.
- Oprim un grup dacă cheltuiește de **2× CPA-ul maxim** fără nicio comandă. CPA maxim: stare civilă 200 lei, cazier fiscal 70 lei (analiza din 18.08).
- Zilnic: comenzi `platform='documentero'` cu `attribution` Google, cost din cont, termenii de căutare (adăugăm negative).
- Dacă anunțurile sunt respinse: **o singură** contestație, cu captura paginii. Pagina nu se schimbă ca să ascundă oferta.
