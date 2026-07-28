# 2026-07-28 — Facturi blocate în SPV + împuternicirea add-on-ului

**Sursa:** raport echipă (27.07.2026, WhatsApp) — 5 facturi refuzate la „Trimite în SPV" plus o împuternicire greșită.

---

## Partea 1 — de ce cădeau facturile în SPV

Mesajele Oblio, reproduse 1:1 prin API (nu ghicite):

| Factură | Comandă | Emisă | Mesajul Oblio | Cauză în cod |
|---|---|---|---|---|
| EGH-0013 | E-260708-YQM7S | 8 iul | „Adauga Localitatea Clientului" | `billing.city = ''`, fără adresă KYC de rezervă |
| EGH-0028 | E-260712-VQ3WA | 12 iul | „Selecteaza un Judet valid Clientului tau" | billing avea doar `lastName: "Papa"` (comandă de dinainte de guard-ul din 12 iul) |
| EGH-0048 | E-260714-GDWBL | 14 iul | „judetul clientului este Bucuresti → Localitate de forma Sector 1, 2..." | **amestec de adrese**: județ „București" din facturare + localitate „Ditrau" (Harghita) din KYC |
| EGH-0172 | E-260725-9BGGD | 25 iul | „Adauga Tara Clientului" | „Marea Britanie" nu există în lista de țări a Oblio |
| EGI2024-24312 | (CJO) | 9 iul | „Selecteaza un Judet valid" | aceeași clasă de bug, **pe cazierjudiciaronline** — de portat |

Sweep complet pe 60 de zile (145 facturi): **141 OK, 4 blocate** — exact cele raportate pe eghiseul, niciuna ascunsă.

### Cauza rădăcină #1 — adresă amestecată din două locuri diferite

`buildOblioClient` lua fiecare câmp separat: `billing.city || kyc.city`, `billing.county || kyc.county`. Când clientul completa județul dar nu localitatea, ieșea o adresă care nu există: **județ București (facturare) + localitate Ditrau, Harghita (KYC)** — EGH-0048.

`resolveInvoiceAddress` (`src/lib/oblio/address.ts`) decide acum după **contradicție**:

1. bloc de facturare complet → se folosește el;
2. blocurile **se contrazic** (județe diferite) → NU se amestecă: se ia întreg blocul complet (KYC, dacă facturarea e incompletă);
3. altfel → completare câmp-cu-câmp, facturarea prioritară.

Regula 3 e importantă: prima versiune interzicea orice amestec, iar auditul pe istoric a arătat imediat că ar fi rupt cazul frecvent și corect „județ Constanța în facturare, localitatea doar în KYC" (EGH-0078/0095/0152) — factura ar fi plecat fără localitate, adică tot blocată în SPV. Județele identice sau unul gol = completare sigură.

### Cauza rădăcină #2 — București fără sector

ANAF cere ca la județul București „Localitate" să fie exact „Sector 1".."Sector 6". Wizard-ul oferea lista brută de localități, care conține „Municipiul Bucuresti" — alegere validă în UI, refuzată în SPV.

- wizard: la județul București dropdown-ul de localitate are acum **doar** cele 6 sectoare;
- prefill din CI: „București, Sector 5" / „Sectorul 5" / sector separat din OCR → normalizat la „Sector 5" (înainte prefill-ul nu se potrivea cu nicio opțiune și se pierdea);
- la emitere: orice formă de sector din localitate/județ/stradă → „Sector N"; fără sector identificabil localitatea pleacă goală, ca guard-ul să o ceară explicit (mai bine blocat la submit decât blocat în SPV).

### Cauza rădăcină #3 — denumirea țării

Lista de țări din wizard e în română cu diacritice („Franța", „Marea Britanie"). Lista Oblio e în română **fără diacritice**, iar UK se numește altfel — dovada e chiar nomenclatorul nostru de clienți (5.250 de clienți): valorile care au trecut sunt `Franta`, `Elvetia`, `Cehia`, `Olanda`, `Regatul Unit (UK)`.

`countryForOblio()` trimite denumirea fără diacritice + tabel de excepții (`Marea Britanie → Regatul Unit (UK)`, `Țările de Jos → Olanda`, `Republica Moldova → Moldova`, ...). **NU trimitem coduri ISO** — Oblio nu le acceptă la e-Factura.

### Guard-ul de la submit, aliniat la ce refuză ANAF

`getMissingInvoiceClientFields` verifica doar „gol/nu e gol". Acum verifică și: județ dintre cele **42**, localitate „Sector N" când județul e București, țară la clienții străini. Mesajele sunt în română, afișate direct clientului la pasul „Facturare".

### Detecție automată (partea care lipsea complet)

Oblio **emite** factura chiar dacă ANAF o va refuza; blocajul apărea doar când apăsa cineva manual „Trimite în SPV" — de aici facturi din 8, 10, 12, 14 și 25 iulie descoperite toate pe 27.

- `checkEinvoiceExport()` (`src/lib/oblio/einvoice-check.ts`) cere linkul e-Factura al facturii: XML = OK, HTML cu `<error>` = blocat, cu exact mesajul din interfață. Fail-open la erori de rețea.
- rulează **imediat după emitere** (`ensureInvoiceForPaidOrder`) și **orar** în cron `invoice-health-check` (40 facturi/rulare, 30 de zile, re-verifică și cele blocate ca să treacă pe „ok" după corectură).
- rezultatul se salvează pe comandă (migrarea 138: `invoice_spv_status` / `invoice_spv_error` / `invoice_spv_checked_at`), apare ca **banner roșu în admin** pe cardul de facturare, notă în istoric la prima detectare și alertă Slack când e configurat `SLACK_WEBHOOK_URL`.
- backfill rulat pe cele 145 de facturi din ultimele 60 de zile → cele 4 blocate sunt deja marcate în admin.

### Ce trebuie făcut manual în Oblio (API-ul Oblio nu permite editarea unei facturi emise)

| Factură | Ce completați |
|---|---|
| EGH-0172 (Vâlceanu) | Țara = **Regatul Unit (UK)** (din dropdown), Localitate = Slough, Județ = `-` |
| EGH-0048 (Dugaia) | Județ rămâne **București**, Localitate = **Sector 6** dacă adresa corectă e „str. Lujerului nr. 2" (Militari, Sector 6) — de confirmat cu clienta, fiindcă în KYC apare o cu totul altă adresă (Ditrău, Harghita) |
| EGH-0013 (Costea) | Județ Vaslui e completat, dar **localitatea lipsește din comandă** — de cerut clientului |
| EGH-0028 (Papa) | Comanda nu are nici nume complet, nici adresă — de cerut clientului tot |

După corectură: Editează Client → Previzualizare Factură → Trimite în SPV. Verificarea automată trece comanda pe „ok" în maxim o oră.

---

## Partea 2 — împuternicirea add-on-ului ieșea identică

E-260725-9BGGD (cazier judiciar + add-on certificat de integritate) are două împuterniciri, cu numere de delegație diferite (SM007426, SM007427), dar **același text**:

> „să se prezinte la IPJ SATU MARE, în vederea ridicării **Cazier Judiciar**. Motivul solicitării: D.G.A.S.P.C."

Cauza: `buildInstitutie()` primea doar slug-ul serviciului **principal**. Numărul de delegație, numele fișierului și metadata erau per add-on — doar textul activităților nu.

Fix: `DocumentContext.delegation_service_type` (codul pentru care s-a alocat delegația) ajunge la generator, iar `buildInstitutie` are hartă per add-on:

| service_type | Text |
|---|---|
| `addon_certificat_integritate` | IPJ SATU MARE — ridicării Certificat de Integritate Comportamentală |
| `addon_cazier_fiscal` | ANAF SATU MARE — ridicării Cazier Fiscal |
| `addon_certificat_nastere/casatorie/celibat` | OFICIUL DE STARE CIVILĂ — certificatul respectiv |
| `cazier_secundar` | IPJ SATU MARE — Cazier Judiciar |
| `apostila_haga` | INSTITUȚIA PREFECTULUI - JUDEȚUL SATU MARE — **aplicării** Apostilei de la Haga |
| `bundled:...:<slug>:apostila_haga` | ... „aplicării Apostilei de la Haga **pe** \<documentul serviciului bundled\>" |

Delegația serviciului principal și codurile necunoscute păstrează textul de azi (fallback).

⚠️ **De confirmat cu Raul:** formularea pentru apostilă („INSTITUȚIA PREFECTULUI - JUDEȚUL SATU MARE", „în vederea aplicării Apostilei de la Haga") — restul hărții e preluat din `INSTITUTIE_MAP`, care era deja validat.

**De refăcut după deploy:** împuternicirea SM007427 de pe E-260725-9BGGD (Regenerează în admin — numărul de delegație e idempotent per `service_type`, deci se refolosește, nu se consumă altul).

---

## Fișiere

- `src/lib/oblio/address.ts` (nou) — județe canonice, sectoare, denumiri de țară Oblio, `resolveInvoiceAddress`
- `src/lib/oblio/einvoice-check.ts` (nou) — verificarea exportului e-Factura
- `src/lib/oblio/invoice.ts` — client Oblio pe adresa normalizată + guard aliniat la ANAF
- `src/lib/oblio/ensure-invoice.ts` — verificare SPV imediat după emitere
- `src/app/api/cron/invoice-health-check/route.ts` — sweep SPV orar + alertă Slack
- `src/app/admin/orders/[id]/page.tsx` — banner roșu „Factura NU se poate trimite în SPV"
- `src/components/orders/steps-modular/billing-step.tsx` — sectoare la București + prefill normalizat
- `src/lib/documents/generator.ts` — `buildInstitutie` per add-on
- `src/app/api/admin/orders/[id]/generate-document/route.ts` — pasează `service_type`
- `supabase/migrations/138_invoice_spv_check.sql`
- `scripts/check-spv-invoices-2026-07-28.ts`, `scripts/audit-invoice-spv-2026-07-28.ts`
- teste: `tests/unit/lib/oblio/address.test.ts` (49), `invoice.test.ts` (+4), `generator.test.ts` (+9)

## Rămas

- **CJO/ecazier**: EGI2024-24312 e pe cazierjudiciaronline, care are copia lui `buildOblioClient` — de portat `address.ts` + `einvoice-check.ts` + guard-ul acolo.
- Denumirile de țară pentru care nu avem dovadă în nomenclator (ex. „Statele Unite ale Americii") pot să nu existe în lista Oblio; verificarea automată le prinde acum la prima factură, în loc să treacă neobservate.
