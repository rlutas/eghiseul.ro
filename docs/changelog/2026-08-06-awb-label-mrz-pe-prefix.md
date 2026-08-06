# 2026-08-06 — Etichetă AWB Fan Courier · prefix MRZ „PE" în nume · audit facturi duplicate Oblio · AWB manual → expediat

## 1. 🔴 „Printează eticheta" (Fan Courier) dădea eroare

**Simptom:** AWB-ul se genera corect, dar butonul *Printează eticheta* din `/admin/orders/[id]` arunca eroare.

**Cauza:** `getAwbLabel()` construia un URL cu token în query string:

```
https://api.fancourier.ro/awb/label?clientId=…&awbs[]=…&pdf=1&token=<TOKEN>
```

Fan Courier **nu acceptă `?token=`**. Testat live pe AWB real `7000157989243`:

| variantă | rezultat |
|---|---|
| `/awb/label` + `?token=` | **401** `"These credentials do not match our records."` |
| `/awb/label` + header `Authorization: Bearer` | **200**, PDF 29.984 B |
| `/reports/awb/label` (orice auth) | 404 |

Path-ul era corect; doar autentificarea nu. Generarea AWB mergea pentru că trece prin `apiRequest()`, care pune header-ul Bearer — **doar eticheta ocolea helperul**.

**Fix:**
- `src/lib/services/courier/fancourier.ts` — `getAwbLabel()` nu mai întoarce URL semnat (Fan nu are așa ceva); descarcă eticheta server-side cu `Authorization: Bearer` și întoarce `{ body, contentType }`. Eșecul aruncă `CourierError` cu status + corpul răspunsului.
- `src/app/api/admin/orders/[id]/awb-label/route.ts` — streamează bufferul; eroarea reală urcă în mesaj în loc de „Failed to fetch label: 401".
- `src/app/admin/orders/[id]/page.tsx` — scos fallback-ul „deschide URL în tab nou" (returna un link care oricum dădea 401).

Sameday neatins. CJO nu are printare etichetă Fan → nimic de portat.

## 2. 🔴 Prefixul MRZ „PEROU" reapărea în numele de familie (E-260805-AX99C)

Continuarea incidentului din [2026-07-28](2026-07-28-imputernicire-apostila-si-nume.md) — dar **cauză nouă**, nu regresie a fix-ului vechi.

**Descoperire:** pașaportul acestei cliente are tipul actului **„PE"**, deci MRZ-ul chiar începe cu `PEROU` (PE = tip act, ROU = țara), nu cu `P<ROU`. În plus, modelul a returnat linia 1 **reconstruită din propria citire greșită**:

```
line1: P<ROU + PEROU<NUME> << <PRENUME> <<<…   (prefixul canonic pus PESTE numele deja contaminat)
```

Lanțul de procesare tăia **un singur** prefix → rămânea numele cu prefixul „PEROU" lipit în față. Mai rău: `parseGeminiOCRResponse` curăța deja numele prin `stripMrzCountryPrefix`, dar `correctNamesFromMrz` rula **după** el și rescria numele din MRZ-ul contaminat, anulând curățarea.

Pagina de date a pașaportului confirmă: **Numele/Surname = numele real, fără prefix**.

**Fix (două straturi), `src/lib/services/document-ocr.ts`:**
1. `recoverNamesFromMrz()` — după tăierea prefixului canonic, taie **repetat** formele cunoscute (`MRZ_NAME_PREFIX`) cât timp rămâne un nume de ≥2 caractere.
2. `correctNamesFromMrz()` — trece numele final prin `stripMrzCountryPrefix()` înainte de scriere, ca rescrierea din MRZ să nu mai poată reintroduce prefixul.

Test: `tests/unit/lib/services/document-ocr-passport-name-prefix.test.ts` — cazul real + garda „un nume care începe cu ROU (ex. ROUA) rămâne intact". 29 teste verzi.

**Date afectate:** 2 comenzi, aceeași persoană — `E-260805-AX99C` (activă, `submitted_to_institution`) și `E-260804-XMMDB` (abandonată). Script de corecție: `scripts/fix-mrz-prefix-2026-08-06.ts` (atinge doar `personal.lastName` + `billing.lastName`; `ocrResults[].extractedData` rămâne scanul brut).

⚠️ **Documentele generate pe E-260805-AX99C poartă numele greșit** — contract prestări + asistență (05.08) și împuternicire + cerere eliberare PF (06.08, dimineața). Trebuie regenerate după corecția numelui.

⚠️ **Și factura**: `EGH-0284` (05.08, 808,20 RON) e emisă pe numele contaminat („…**PEROU**STANCIU"). În plus, clientul a fost salvat cu numele greșit în nomenclatorul Oblio (`clientId` 50231713, CNP-ul clientei) — orice factură viitoare pe același CNP îl reia. De corectat fișa clientului din Oblio UI (API-ul nu poate redenumi) și de decis dacă factura se stornează + reemite (`OBLIO_REISSUE_ENABLED`) sau rămâne așa. Emailul clientei confirmă numele real.

## 3. Program WhatsApp pe pagina de status

`src/components/orders/help-contact-card.tsx`: „Răspundem rapid pe WhatsApp în zilele lucrătoare 09–17" → **„Răspundem pe WhatsApp în zilele lucrătoare, între 08:00 și 16:00"**. Se contrazicea cu pagina Contact, care zicea deja „Luni – Vineri: 08:00 – 16:00".

## 4. 🔵 Investigație WP-260707-99959 (dump WordPress 3,5 GB)

Comanda din import: `friendly_order_id = WP-260707-99959`, în DB `order_number = WP-199959` (de-aia căutarea după ID-ul complet nu întoarce nimic nici în dump, nici în DB). Corespunde entry WPForms **199959**, form **10274**.

- clienta comenzii `WP-260707-99959`, Italia — Extras Multilingv Certificat de Căsătorie 799 + DHL internațional 250 = **1.049 RON**, plătit pe WP la 07.07 14:56, factura EGI2024-24314.
- Migrarea a fost **completă**: câmpuri formular + toate 3 fișierele (act, selfie, semnătură) sunt în S3.
- Entry-ul 199956 (14:21, aceeași clientă, fără livrare) e o tentativă abandonată — **nu e dublă plată**.
- **Problema e operațională:** comanda stă în `submitted_to_institution` din 08.07 (29 de zile), fără document final, fără AWB și fără dată estimată. Ultima mișcare: notă „whatsapp" pe 16.07.

Rezumat complet, pentru operațional: comanda are nevoie de verificare la Starea Civilă București + contactarea clientei.

## 5. 🔵 Audit facturi duplicate în Oblio (fereastra cutover-ului WP)

Pornit de la observația că clienta comenzii `WP-260707-99959` avea 2 facturi în Oblio deși a plătit o dată. Reconciliate **371 de facturi** emise din 01.07 (CIF 49278701 — firma e comună cu CJO, care folosește aceleași serii EGH/EGI2024) față de comenzile din **ambele** platforme: 323 au comandă, **48 nu**.

**Mecanismul:** la cutover-ul de pe WordPress (6-8 iulie) au rulat în paralel două căi de facturare — integrarea Stripe→Oblio de pe WP-ul vechi și aplicația nouă — și au facturat aceeași plată.

Numărul real de plăți a fost verificat în Stripe-ul de producție (`acct_1OFE2wHGb8JBHhcl` — eGhiseul / EDIGITALIZARE SRL; cheia din `.env.local` e de pe alt cont, ultima tranzacție acolo 25 iunie — de luat în seamă la orice verificare viitoare).

**Duplicate reale confirmate (2 clienți):**

| Client | Facturi | Plăți Stripe | Rezolvare |
|---|---|---|---|
| comanda `WP-260707-99959` | EGI2024-24311 (07.07, 1049) + EGH-0009 (08.07, 1049) + EGI2024-24314 (12.07, **998**) | **1** × 1049 (`ch_3TqaQ1…`) | ✅ stornate 06.08: EGH-0295 (−998) + EGH-0296 (−1049) → net 1.049, corect. ⏳ rămâne de relegat `orders.invoice_number` (arată încă spre EGI2024-24314, cea stornată) |
| comanda `E-260707-KC7PS` | EGI2024-24312 (07.07) + EGH-0001 (07.07) | **1** × 376,50 (`ch_3TqbqR…`) | ✅ stornată 06.08: EGH-0297 (−376,50). Rămâne validă EGH-0001, cea legată de comandă |

**Fals pozitiv:** un client cu 2 facturi de 350 pe 06.07 — Stripe arată **două plăți reale** (cazier judiciar, form 7876, 15:47 + certificat integritate, form 7990, 15:55). Facturile sunt corecte, nu se stornează nimic.

Comanda WP a primit și o **a treia** factură pe 12.07, de 998 RON (`base_price`, fără livrarea de 250) — emisă de cron-ul de „heal" al facturilor pe o comandă care avea deja factură din altă sursă. `orders.invoice_number` pentru WP-199959 arată spre EGI2024-24314, adică exact factura stornată azi → trebuie relegată la cea rămasă validă.

**Verificate și declarate în regulă** (păreau duplicate, sunt comenzi distincte plătite separat): 12 grupuri „același client + aceeași sumă" — toate comenzi distincte, plătite separat (unul avea deja stornarea EGH-0008; două erau plăți extra, nu duplicate).

⚠️ Stornarea unei facturi încasate detașează încasarea și lasă „credit client" fantomă în Oblio — vezi cazul din 03.08; după storno trebuie curățate încasările nealocate din fișa clientului.

### Gardă nouă în cod: liniile facturii trebuie să dea suma încasată

A treia factură a comenzii WP (998 lei, cu încasare de 1.049) n-a venit din cutover, ci dintr-un **bug care putea lovi oricând**: comanda importată avea `base_price` 998 și `delivery_price` 0, deși totalul plătit era 1.049. Nimic nu verifica asta — Oblio a emis o factură al cărei total nu corespundea cu `collect`, iar facturile emise nu pot fi editate prin API.

`findInvoiceTotalsMismatch()` (`src/lib/oblio/invoice.ts`) recalculează `base + opțiuni + livrare − discount` și îl compară cu `total_price`. Aplicată pe toate cele 3 căi de emitere: `ensure-invoice.ts` (automat), `verify-payment` și `reissue-invoice` (admin; verificarea rulează **înainte** de storno, altfel am anula factura veche și am refuza-o pe cea nouă). La nepotrivire factura NU se emite, eroarea intră în `order_history` și comanda rămâne vizibilă în cron-ul de health-check.

Verificat pe cele 206 comenzi plătite din 01.06: singura care ar fi fost blocată la emitere e chiar `WP-260707-99959`. Celelalte 3 nepotriviri de azi sunt comenzi cărora li s-au adăugat opțiuni DUPĂ facturare (plăți extra, facturate separat) — la momentul emiterii totalurile erau corecte. Teste: `tests/unit/lib/oblio/invoice-totals-guard.test.ts`.

## 6. 🔴 AWB manual (DHL/Poșta) nu trecea comanda pe „expediată"

Generarea automată Fan/Sameday seta `status = 'shipped'` + `shipped_at`; AWB-ul introdus manual — DHL, Poșta, sau unul emis din contul curierului — doar salva numărul. Comenzile rămâneau în starea veche deși coletul plecase, iar echipa le muta de mână.

`POST /api/admin/orders/[id]/set-awb` face acum aceeași tranziție. Decizia stă în `shouldMarkShippedOnAwb()` (`src/lib/orders/shipping-status.ts`), pe **listă neagră**: `draft`, `abandoned`, `cancelled`, `refunded` (moarte) + `shipped`, `completed` (deja la/după expediere). Orice altă stare de lucru — inclusiv `standby` sau stările adăugate ulterior — devine `shipped`. O listă albă ar rata stări noi și ar bloca tăcut tranziția, exact ca regresia din 21.07 cu secțiunea „Procesare comandă".

**Bug colateral găsit și reparat:** `generate-awb` scria istoricul cu `event_type: 'status_change'`, dar constrângerea `order_history_event_type_check` acceptă doar `status_changed` — inserarea eșua tăcut (fără `await` pe eroare). În DB: **0 rânduri** `status_change` față de 21 `awb_created`, deci nicio comandă cu AWB generat n-avea tranziția în timeline. Verificat direct pe producție, într-o tranzacție cu ROLLBACK: singularul e respins, pluralul trece. Tot acolo, `old_value`/`new_value` se scriu acum ca obiecte jsonb (convenția din `/process`), nu ca string-uri JSON.

Teste: `tests/unit/lib/orders/shipping-status.test.ts`.
