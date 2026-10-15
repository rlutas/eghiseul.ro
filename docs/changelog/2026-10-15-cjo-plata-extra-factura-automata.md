# 15.10.2026 — CJO: plata extra primește mereu proformă și factură, cu reîncercare automată
<!-- categorie: plati -->

## Pentru echipă

- Contabilul a întrebat de o plată din decontarea Stripe din 11.09: **250 lei pe comanda CJO-20260901-27360**. Factura comenzii (EGH-0577) era încasată pe 03.09. Cei 250 lei erau altă plată: **taxa de livrare cu DHL**, plătită separat pe 08.09 din linkul de plată extra. Pentru ea **nu s-a emis factură** și nimeni nu a fost anunțat.
- **Rezolvat azi:** factura **EGH-0873** pentru cei 250 lei, încasată cu cardul. În Decontări, plata din 11.09 apare acum cu EGH-0873, iar EGH-0577 rămâne doar pe încasarea din 04.09. Adresa clientului (Italia) a fost corectată pe comandă: era salvată greșit „București, Sector 1”.
- **De acum, pe cazierjudiciaronline.com e la fel ca pe eghiseul:**
  1. când trimiteți un link de plată extra din „Modifică”, se emite automat **proforma** (seria PEGH);
  2. după plată se emite automat **factura** din proformă;
  3. dacă factura nu se emite, sistemul **reîncearcă din oră în oră**;
  4. cât timp lipsește factura vedeți un **avertisment roșu** pe pagina comenzii și pe dashboard-ul admin CJO, iar pe Slack vine o alertă.
- Ce faceți dacă avertismentul rămâne peste o zi: [Plată extra încasată fără factură](../admin/factura-plata-extra-neemisa.md).

---

## Tehnic

Cod în repo-ul CJO, commit `f84e407b`.

- **Proforma nu se emitea deloc pe CJO**: `OBLIO_PROFORMA_SERIES` nu era setată pe producție, iar toate cele 6 intrări `extra_billing` din 14.07 încoace aveau `proforma: null`. `getProformaSeries()` are acum valoarea implicită `PEGH` (aceeași firmă Oblio EDIGITALIZARE ca eghiseul); variabila de mediu are prioritate dacă e setată.
- **Reîncercare**: `healUnbilledExtras()` (`src/lib/oblio/extra-billing.ts`), apelată din `cron/health-check` (din oră în oră), maximum 10 comenzi pe rulare, aceeași regulă ca webhook-ul (fără comenzile SmartBill). La succes: factura se scrie în `extra_billing[i].invoice` și se adaugă o notă în istoric. La eșec: `invoiceError`/`invoiceErrorAt` pe intrare, nota în istoric doar când eroarea se schimbă, plus alertă pe Slack.
- **Avertismente**: `unbilledExtras` în `GET /api/admin/stats` (caseta de pe `/admin`) și banner pe pagina comenzii. Ambele folosesc `listUnbilledExtras()` din `extra-billing-shared.ts`, un fișier pur, sigur în componentele client.
- **Webhook**: intrarea salvează acum `description` (eticheta din „Modifică”), folosită de reîncercare, și eroarea Oblio.
- 🔴 **Notele din `order_status_history` se pierdeau în tăcere**: webhook-ul de plată extra și ruta `reissue-invoice` (3 locuri) nu trimiteau `new_status`, care e NOT NULL. Din iulie, „FACTURA NEEMISĂ — verifică Oblio” nu a ajuns niciodată în istoricul comenzii.
- Verificat pe producție după reparație: 0 plăți extra nefacturate pe CJO. Cauza exactă a eșecului din 08.09 nu se mai poate afla, pentru că jurnalele Vercel din septembrie au expirat.
- Teste: `tests/unit/lib/extra-billing.test.ts` (6).
