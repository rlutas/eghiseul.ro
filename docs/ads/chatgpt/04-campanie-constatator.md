# Campania constatator — gata de introdus în Ads Manager

## A. Contul (Raul, manual — Claude nu introduce date de firmă/card)

1. https://ads.openai.com → Sign up cu un email al firmei (recomand `contact@eghiseul.ro` sau
   `eghiseul@gmail.com` — cel pe care vrei să vină notificările de review).
2. Business: **EDIGITALIZARE SRL**, CUI-ul firmei, adresa sediului, site `https://eghiseul.ro`.
3. Categoria/industria: alege cea mai apropiată de **„Online services / Digital services / Business
   services"**. NU „Legal", NU „Government/Public sector". Dacă câmpul e liber: „online document
   ordering service for companies".
4. Metoda de plată: card firmă. Verifică dacă apare oferta de credit (500 $ la 500 $ cheltuiți).
5. Salvează: ID cont, moneda contului (probabil USD — bugetele de mai jos sunt în RON, convertește la
   ~4,6), email-ul de notificări. Trece-le în `README.md` → Stare.

## B. Structura

```
Campanie: OAI_Click_Constatator_2026-09   (obiectiv: Clicks | geo: România)
  buget: 100 RON/zi (~22 $/zi) | durată: 14 zile | max CPC: 1,2 $ (istoric: 3 $)
  ├── AG1  Firmă / de bază       — T1+D1 (rezervă T2+D2, T3+D3)   landing: /servicii/certificat-constatator-online/
  ├── AG2  Cu istoric            — T5+D5                          landing: aceeași pagină
  └── AG3  Scop: bancă/licitație — T6+D4 (rezervă T1+D6)          landing: aceeași pagină
```

## C. Context hints (se lipesc la nivel de ad group, în română; sunt situații, nu cuvinte cheie)

**AG1 — Firmă / de bază**
```
Utilizatorul întreabă cum obține un certificat constatator pentru firma lui (SRL, PFA, II) sau ce este
certificatul constatator ONRC. Întreabă ce acte îi trebuie, cât costă, cât durează, dacă se poate online,
dacă are nevoie de cont pe portalul ONRC sau de semnătură electronică. Întreabă cum verifică o firmă la
Registrul Comerțului: cine e administrator, asociați, sediu, coduri CAEN, dacă firma e activă sau radiată.
Întreabă ce document dovedește că firma există legal. Cuvinte: certificat constatator, ONRC, Registrul
Comerțului, RECOM, CUI, extras ONRC, date firmă, verificare firmă, furnizor, partener.
```

**AG2 — Cu istoric**
```
Utilizatorul întreabă cum obține un certificat constatator cu istoric (toate mențiunile firmei de la
înființare), pentru due diligence, litigiu, executare silită, verificarea unui fost administrator sau a
istoricului asociaților. Întreabă ce diferență e între certificatul constatator de bază și cel cu istoric,
cât costă istoricul la ONRC, cât durează. Cuvinte: certificat constatator cu istoric, istoric firmă ONRC,
mențiuni Registrul Comerțului, foști asociați, foști administratori, due diligence firmă.
```

**AG3 — Scop: bancă / licitație / notar / fonduri**
```
Utilizatorul întreabă ce documente îi cere banca pentru credit sau deschidere de cont pe firmă, ce acte
trebuie la o licitație SEAP/SICAP sau la un dosar de fonduri europene, ce acte cere notarul pentru a semna
în numele firmei (vânzare, împrumut, procură). Menționează „certificat constatator nu mai vechi de 30 de
zile", „certificat constatator la zi", „certificat ONRC pentru bancă/notar/licitație". Cuvinte: credit
firmă acte, cont firmă documente, licitație documente calificare, fonduri europene dosar, notar acte firmă.
```

## D. Anunțuri (titlu ≤ 50, descriere ≤ 100; esențialul în primele 24 / 48 caractere)

Titluri:

| # | Text | Caractere |
|---|---|---|
| T1 | Certificat constatator pe email | 31 |
| T2 | Certificat constatator în minute | 32 |
| T3 | Constatator ONRC, 89 lei, online | 32 |
| T4 | Certificat constatator, 24/7 | 28 |
| T5 | Constatator cu istoric, online | 30 |
| T6 | Verifici o firmă? Certificat ONRC | 33 |

Descrieri:

| # | Text | Caractere |
|---|---|---|
| D1 | Completezi CUI-ul, plătești, primești PDF-ul ONRC pe email. Serviciu privat, taxe incluse. | 90 |
| D2 | Doar cu CUI. PDF semnat electronic de ONRC, în câteva minute. 89 lei, taxe incluse. | 83 |
| D3 | Fără cont ONRC, fără semnătură electronică. Primești certificatul pe email, 24/7. Serviciu privat. | 98 |
| D4 | Pentru bancă, licitație sau notar. Certificat ONRC pe email în minute. Preț final 89 lei. | 89 |
| D5 | Toate mențiunile firmei de la înființare. PDF ONRC pe email, 487 lei taxe incluse. Serviciu privat. | 99 |
| D6 | Vezi asociați, administratori, CAEN și stare. PDF ONRC pe email în minute. 89 lei, taxe incluse. | 96 |

Nume advertiser: **eGhișeul.ro**.

Interzis în orice variantă viitoare: oficial, avocat, juridic, garantat, instant, „cel mai", „gratuit"
(taxa există), „eliberăm/emitem". Prețul din anunț = prețul de pe pagină (89 / 487).

## E. Imagini

- Logo (favicon) în cont: `assets/eghiseul-favicon-128.png` (128×128, din `src/app/icon.png`).
- Imagine anunț: `assets/eghiseul-logo-512.png` (512×512). Runda 2: o imagine pătrată cu specimenul
  certificatului (din `public/images/specimens/certificat-constatator.png`, decupat pătrat, fără text
  mărunt) — de testat contra logo-ului.

## F. URL-uri finale (cu UTM)

```
AG1: https://eghiseul.ro/servicii/certificat-constatator-online/?utm_source=chatgpt&utm_medium=cpc&utm_campaign=constatator-2026-09&utm_content=ag1-firma
AG2: https://eghiseul.ro/servicii/certificat-constatator-online/?utm_source=chatgpt&utm_medium=cpc&utm_campaign=constatator-2026-09&utm_content=ag2-istoric
AG3: https://eghiseul.ro/servicii/certificat-constatator-online/?utm_source=chatgpt&utm_medium=cpc&utm_campaign=constatator-2026-09&utm_content=ag3-scop
```

Domeniul e `eghiseul.ro` (nu `www`, nu `eghiseul-ro.vercel.app` — SSO wall), cu slash final
(`trailingSlash: true`, altfel 308).

## G. Licitare & buget

- Obiectiv **Clicks** (CPC). Plan inițial: max CPC 1,2 $ — dar Ads Manager marchează sub ~€1,95 „May not deliver" (preț de rezervă, nu concurență pe nișă: licităm pe slotul din conversație contra oricui targetează conversații de business în română). Pornit la **€1,95** (~9,7 RON) pe AG1; după 3 zile cu livrare coborâm la €1,50 și vedem dacă mai livrează. AG2 (istoric) poate merge la €3.
- Dacă după 3 zile AG1 are 0 afișări → bid 2 $ pentru încă 3 zile; dacă tot nimic → concluzie „la marja
  noastră nu se livrează pe de bază", păstrăm doar AG2.
- Buget zilnic 100 RON. Nu creștem în primele 7 zile indiferent de rezultate.

## H. Măsurare

Zilnic, în DB — nu în platformă:

```sql
select order_number, status, total_price,
       attribution->'last'->>'utm_content'  as ad_group,
       attribution->'last'->>'landing'      as landing,
       created_at
from orders
where attribution->'last'->>'utm_source' = 'chatgpt'
   or attribution->'first'->>'utm_source' = 'chatgpt'
order by created_at desc;
```

KPI: cost / comenzi plătite (`status` ≠ pending/draft/abandoned/cancelled). Clicurile și costul se iau
din Ads Manager; GA4 doar ca sanity check pe sesiuni cu `utm_source=chatgpt`.

Înainte de lansare: deschide URL-ul AG1 în incognito, pornește o comandă (până la pasul 2), verifică în
`/admin/orders` că draftul are `attribution.last.utm_source = chatgpt`.

## I. Decizia la ziua 14

| CPA (lei / comandă plătită) | Acțiune |
|---|---|
| ≤ 15 | scalăm: buget 200 RON/zi, adăugăm rovinieta (05) |
| 15–25 | continuăm 14 zile doar AG2 (istoric, marjă mare) + AG3; urmărim clienții recurenți |
| > 25 sau 0 conversii la ≥ 150 clicuri | oprim de bază; AG2 încă 7 zile; concluzie scrisă aici |

Aritmetica (corectată 02.09): 89 lei cu TVA → 73,55 net − 30 ONRC − 3 procesare ≈ **40 lei brut**; la CPC €1,95 (~9,7 RON) trebuie conversie ≥ 40 % ca să nu pierdem pe prima comandă → de bază e test de repeat/B2B, istoricul (487 lei) e unde e marja.

## J. Jurnal

| Data | Ce s-a întâmplat |
|---|---|
| 02.09 | Campania scrisă; landing curățat și pushat (commit 5043331) |
| 02.09 seara | Cont EXISTA deja (EDIGITALIZARE SRL, `adacct_6a9803d500b88196a0106a3aba6413b5`, monedă **EUR**). Introdus în onboarding: campanie `OAI_Click_Constatator_2026-09`, Clicks, România, **€20/zi**, Text customization **Off** (altfel AI-ul rescrie/traduce anunțul fără review); AG1 cu URL constatator + UTM + context hints; **Max CPC €1,95** — la €1,10 și €1,50 Ads Manager arată „May not deliver", la €1,95 „Strong Delivery" (probabil preț de rezervă; coborâm după 3 zile); anunț T „Certificat constatator online" (29) + D1 (90); imagine `assets/ad-constatator-1024.png` (document stilizat + logo, FĂRĂ siglele ONRC/Ministerului — risc „impersonate official entities"). Billing + termeni: Raul. |
| 02.09 noapte | Billing OK (Revolut, hold 100 USD). Imaginea înlocuită în anunț cu documentul stilizat. Status anunț: **Not serving** — brand review în curs / cont în pregătire / „Ad cannot serve in targeted countries (policy restrictions)" / ad in review. Conversii: data source + eveniment `order_created` create; implementare pe site (vezi 06). Lipsă: Conversion key (Raul). |
| 17.09 12:15 | **PRIMA LIVRARE.** Ads Manager (14 zile): 1.041 afișări, 23 clicuri, €13,19, **CPC €0,57** — o treime din bidul de €1,95, deci nu plătim prețul de rezervă. Toată livrarea e pe 16–17.09; înainte, zero. **Conversii atribuite: 0.** Verificat în DB: de la 16.09 ora 00:00 nu există nicio comandă și niciun draft cu `utm_source=chatgpt`, `utm_content=ag1-firma` sau `oppref` — singurele două cu UTM sunt din Meta (`fb`, campania celibat). Cele 2 comenzi de constatator plătite azi (`E-260917-KJYNS` 10:13, `E-260917-CTAZM` 10:19) sunt de la **același client care revine**, `office@europal-nin.ro`: `attribution.first.at = 2026-08-20T10:07`, fără UTM, fără referrer, landing `/`. A treia (`E-260916-H7A53`) vine din aplicația Gmail. Niciuna nu e din ChatGPT, deci Conversions API corect n-a trimis nimic. Istoric: **niciun `oppref` n-a intrat vreodată în DB**; există 13 comenzi cu referrer/UTM `chatgpt.com` (organic, iulie–septembrie), nici acelea cu `oppref`. Landingul verificat cu curl: URL-ul AG1 cu UTM + `oppref` întoarce 200 fără redirect, iar varianta fără slash final dă 308 care păstrează query-ul. |
| 17.09 12:40 | **Verificat direct în Ads Manager** (browser, contul EDIGITALIZARE SRL). Campanie `Serving`, buget €20/zi, start 02.09, fără dată de final; un singur ad group, `AG1 Firma - de baza`, Billing Event `Click`, Bid strategy `Manual`. **AG2 și AG3 din secțiunea B n-au fost create niciodată.** ⚠️ **Corecție la nota de la 12:15:** UTM-urile NU lipsesc. Ads Manager are două câmpuri separate, iar coloana „URL" din tabel arată doar primul: `Link` = `https://eghiseul.ro/servicii/certificat-constatator-online/`, iar `Tracking parameters` = `utm_source=chatgpt&utm_medium=cpc&utm_campaign=constatator-2026-09&utm_content=ag1-firma`. Deci clicurile aterizează etichetate corect, iar cele 23 de clicuri chiar n-au început nicio comandă. **Ce lipsește cu adevărat: `oppref={oppref}`.** Câmpul acceptă macro-uri (`{campaign_id}`, `{ad_group_id}`, `{ad_id}`, `{ad_account_id}`, `{oppref}`) și **`oppref` nu se adaugă singur** — de-aia n-a intrat niciodată în `orders.attribution`. Fără el, atribuirea pe clic a OpenAI nu se închide nici dacă cineva cumpără; Conversions API tot ar trimite, dar doar pe `utm_source=chatgpt`, cu potrivire mai slabă. Conversions → data source `eghiseul.ro web` **Healthy, 13 evenimente** (pixelul din browser funcționează pe comenzi reale), EQS încă `—`, un singur warning, „No recent server-to-server events", normal. Billing OK: €15,00 debitați pe 17.09 (Visa ••••0827), sold curent €10,63, prag €15. ⚠️ Banii ieșiți (~€25,6) sunt aproape dubli față de „Spend €13,19" din tabel, iar Billing → Activity e gol; raportarea e marcată „Preliminary data for Sep 17", deci de recitit peste 2–3 zile înainte de orice concluzie de cost. Tot de urmărit: tabelul dă Avg CPC €1,47, dar €13,19 / 23 clicuri = €0,57, deci probabil doar ~9 clicuri sunt facturabile. |
| 03.09 15:00 | Reverificat în Ads Manager: motivul de politică **„Ad cannot serve in targeted countries" a DISPĂRUT**. Rămân 2 motive, ambele fără acțiune din partea noastră: „Account brand review in progress" + „Getting your account ready — no further action is expected, 5-7 days". Campania/anunțul „Ad1 T1-D1 pe email" Active, 0 afișări, 0 spend. Conversions: data source `eghiseul.ro web` **Healthy, 2 evenimente** primite din browser (testul din 03.09 dimineața), conversion key `eghiseul-stripe-webhook` există; singurul warning „No recent server-to-server events" (normal — serverul trimite doar la comenzi cu `utm_source=chatgpt`/`oppref`; se stinge la prima comandă reală). DB: 0 comenzi atribuite chatgpt (nimic nu livrează încă); atribuirea în general merge (21/21 comenzi din ultimele 2 zile au `attribution`). **Următoarea verificare: 08–10.09** (5–7 zile) — vezi „Ce urmărim" în `../README.md`. |
