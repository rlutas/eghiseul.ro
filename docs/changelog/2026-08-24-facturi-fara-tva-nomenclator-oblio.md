# 2026-08-24 — 129 de facturi emise cu TVA 0% și blocajul SPV pe CNP invalid

Semnalat de contabil pe jurnalele de vânzări SAGA pentru iunie și iulie 2026
(`JV IUNIE.pdf`, `JV IULIE.pdf`): apar facturi cu **Valoare T.V.A. 0.00** și
referință **cod 17 — „Livrari scutite fara drept de deducere"**, deși
EDIGITALIZARE S.R.L. (RO49278701) e plătitoare de TVA.

## Ce arată jurnalele

| Lună | Facturi 0% | Brut încasat | TVA nefacturat (21/121) |
|---|---|---|---|
| iunie 2026 | 108 | 27.144,34 | **4.711,00** |
| iulie 2026 (1–7) | 21 | 5.136,95 | **891,54** |
| **Total** | **129** | **32.281,29** | **5.602,28** |

Cifra pe iunie se potrivește la leu cu totalurile din jurnal:
cod 12 (697,75) + cod 16 (228,00) + cod 17 (26.218,59) = 27.144,34.

Listă per factură (nr, dată, client, CIF, total, TVA datorat, produse):
`facturi-fara-TVA-iunie-iulie-2026.csv` (nu se comite — conține date de client).

## Cauza: nomenclatorul Oblio, nu cota din cod

Facturile afectate au liniile cu `vatName: "Scutita"`, `vatPercentage: 0` și
un `code` de forma `prod_UcsRah0DqJg4rJ` — **ID-uri de produs Stripe**. În
nomenclatorul Oblio existau 28 de produse cu exact aceste coduri, toate
memorate pe „0% - Scutita":

```
prod_UcsRah0DqJg4rJ  Cazier Judiciar Online - PF     0%  Scutita
prod_UcsRPKMbXY8Wmh  Onorariu Avocat                 0%  Scutita
prod_Uj10Y3VP4MxMww  Apostila Haga - România         0%  Scutita
...
```

Oblio cheiază nomenclatorul pe `code` și, la potrivire, aplică **TVA-ul
memorat pe produs**, ignorând cota trimisă în request. Aceeași mecanică ne
mușcase deja pe denumiri (E-260728-YFHH2, „Apostilă de la Haga — Chile" pe o
comandă pentru Brazilia) — vezi `docs/changelog/` și comentariile din
`src/lib/oblio/invoice.ts`.

Produsele au fost create de fluxul vechi Stripe→Oblio de pe WordPress
(facturile au `mentions: "Comanda Stripe #ch_..."`). A rulat **01.06 – 07.07.2026**
și s-a oprit exact la cutover-ul pe aplicație. Confirmat prin scanarea
întregului cont Oblio: zero facturi cu linii 0% în tot 2025 și în ian–mai 2026,
zero după 07.07 (singura apariție în august e stornoul EGH-0297, care oglindește
o factură veche).

Facturile emise de aplicație (seria **EGH**) au fost mereu 21%. Nicio comandă
plătită din platformă nu e nefacturată (verificat: 0 comenzi `paid` fără
`invoice_number`).

## Ce s-a schimbat în cod

1. **`vatName: 'Normala'` pe fiecare linie** (`invoice.ts`, `proforma.ts`).
   Trimisă explicit, cota din nomenclator nu mai poate suprascrie nimic —
   indiferent ce `code` ajunge pe linie. Test: fiecare produs din payload
   (serviciu, onorariu, opțiuni, livrare, reducere) trebuie să aibă
   `vatName: 'Normala'` + `vatPercentage: 21`.

2. **CNP invalid → 13 zerouri** (`sanitizePfCnp`). Facturile `EGH-0438` și
   `EGH-0524` stăteau blocate cu *„Pentru a putea trimite Factura in SPV,
   editeaza Factura: Introdu un CNP valid Clientului tau"* — clientul tastase
   greșit CNP-ul. Un CNP care pică cifra de control devine acum
   `0000000000000` (identificatorul ANAF pentru cumpărător fără CNP valid), ca
   factura să plece oricum în SPV. Un CNP **lipsă** rămâne gol (Oblio acceptă
   PF fără CNP; nu inventăm zerouri unde nu e cazul).

   Efect colateral util: fixture-urile din teste aveau CNP-uri inventate cu
   cifra de control greșită — au fost corectate.

## Straturi suplimentare (a doua trecere, aceeași zi)

Politica e simplă: firma (EDIGITALIZARE S.R.L.) e plătitoare de TVA — TOT ce se
emite are 21% Normala, fără excepții. Trei straturi o impun, pe AMBELE
platforme (eghiseul + cazierjudiciaronline/ecazier — toate facturează pe
aceeași firmă):

1. **`vatName: 'Normala'` pe fiecare linie** (pasul 1, deja descris mai sus) —
   portat și pe CJO (`src/lib/oblio/client.ts` avea deja vatName pe liniile
   principale; acum și liniile de plăți extra din `proforma.ts`).
2. **`assertVatOnAllLines()`** (`src/lib/oblio/vat.ts` pe ambele repo-uri) —
   rulează înainte de fiecare POST care creează document (factură, proformă,
   factură extra). O linie fără 21% Normala = documentul NU se emite, eroarea
   ajunge în fluxul normal de „comandă plătită fără factură" (vizibil, spre
   deosebire de o factură emisă greșit).
3. **`auditIssuedInvoiceVat()`** în cronul orar de health-check (ambele
   platforme) — citește din Oblio facturile emise în ultimele 3 zile și
   alertează pe Slack dacă vreo linie e în afara cotei. Verifică ce a MEMORAT
   Oblio, nu ce am trimis — singurul strat care ar fi prins bug-ul original.
   Storno-urile sunt excluse (oglindesc cota documentului anulat).

## Verificat (24.08, a doua trecere)

- **Nomenclator Oblio**: toate cele 522 de produse sunt pe „21% - Normala"
  (28 corectate manual de Raul + prin UI). Zero rămase pe 0%.
- **Integrarea nativă Oblio↔Stripe**: încă conectată (raportul vede plățile),
  dar **„Generare facturi din Stripe" e DEBIFAT** → nu mai poate emite nimic,
  nici dublu peste aplicație. În configurarea ei: „Tip TVA 0% = Scutita" +
  seria EGI2024 — exact amprenta celor 129 de facturi. NU rebifa opțiunea.
- **Audit pe 90 de zile** prin API: singurele facturi cu linii ≠21% sunt lotul
  istoric iunie–iulie (corecția contabilului); ultimele 3 zile: zero.
- **0 comenzi plătite fără factură** în DB.

## Ce rămâne de făcut manual

- **Corecția fiscală** a celor 129 de facturi — o face contabilul din
  contabilitate (D300/D394 rectificativ pe iunie și iulie). Facturile au
  `indexUpload`, deci au ajuns în SPV.
- **EGH-0438 / EGH-0524**: CNP-ul se corectează în Oblio pe factura deja
  emisă, apoi „Trimite în SPV". Fixul din cod acoperă doar facturile viitoare.
