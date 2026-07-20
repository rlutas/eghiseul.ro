# Categoria „Contracte" pe eghiseul.ro — plan de implementare

**Data:** 2026-07-20
**Status:** 📋 PLAN — aprobat conceptual (Raul: „rămâne așa"), implementare NEPORNITĂ, blocată de verificarea juridică
**Research-ul din spate:** `2026-07-20-produse-noi-auto-teren-contracte.md`

---

## 1. Ce construim

Categorie nouă de servicii, **`contracte`**, cu primul produs **„Dosar vânzare-cumpărare auto"**. Structura e gândită să accepte contracte noi fără muncă de arhitectură — fiecare adăugare ulterioară = un fișier Word + un rând în DB.

**Poziționare: nu „generator de contracte", ci „tot ce-ți trebuie ca să vinzi/cumperi legal".** Competiția vinde o hârtie; noi vindem dosarul complet + termenele + reamintirile.

---

## 2. De ce pe eghiseul (recapitulare decizie)

Motorul de documente e deja aici, complet: `docxtemplater` (Word cu etichete → document completat), `signature-inserter` (semnătura desenată injectată în DOCX), `docx-to-pdf` + `pdf-compress`, **OCR Gemini** (`src/lib/services/document-ocr.ts`), wizard modular configurat din DB, Stripe, Oblio, S3, cont client, audit legal de contract.

Pe erovinieta există doar `pdf-lib` (desenezi PDF-ul linie cu linie) și **zero OCR** — ar însemna reconstruit de la capăt.

**Împărțirea rolurilor:** erovinieta aduce oamenii (13–15k vizite/lună pe zona auto, 6k abonați), eghiseul face documentul. Articol + buton pe erovinieta → comandă pe eghiseul. RCA-ul rămâne pe erovinieta, unde e deja 90% construit.

---

## 3. Prețul

**Context — praguri reale în DB azi:**

| Categorie | Servicii | Preț min | Preț max |
|---|---|---|---|
| imobiliare | 18 | 89 | 780 |
| personale | 5 | 698 | 998 |
| juridice | 4 | 198 | 198 |
| auto | 2 | 0 (rovinietă) | 198 |
| comerciale | 1 | 89 | 89 |
| fiscale | 1 | 198 | 198 |

Cel mai ieftin serviciu real de pe platformă e **89 lei**.

**Piața contractelor auto:** media 25–27,99 lei (car-docs 29,99 · econtractauto 25 **cu OCR** · concreto 25 + 5/add-on · actele.ro 25,99 · AutoX 19,99 în app / 49,99 web) — plus **doi jucători complet gratuiți** (cvc.faraamenda, dosar-auto.ro) care trăiesc din comision RCA.

**Recomandare — două trepte:**

| Produs | Preț | Ce conține | De ce |
|---|---|---|---|
| **Contract simplu** | **29 lei** | Contract ITL-054 completat (5 exemplare) + checklist cu termene | Paritate cu car-docs, peste podeaua pieței. Rol de ancoră, nu de profit |
| **Dosar complet** ⭐ | **69 lei** | Contract + toate cererile aferente (certificat fiscal ×2, scoatere din evidență, transcriere, rovinietă) + checklist personalizat pe județ + **remindere automate 30/60/80 zile** | **Aici vrem conversia.** Nimeni din piață nu are echivalent — nu se compară cu 29 de lei ai altuia |

**Argumentul pentru 69, nu 49:** produsul nu concurează cu un PDF de 29 de lei, ci cu riscul de a rămâne cu un act nul (OUG 7/2026), cu amenzi de 70–696 lei pentru termene ratate și cu 1.000–2.000 lei pentru circulat fără RCA. La 69 de lei rămâne sub pragul psihologic de 100 și sub cel mai ieftin serviciu al platformei (89), deci nu strică percepția de preț a categoriilor existente.

**Ce NU facem:** nu coborâm sub 25 ca să concurăm cu gratuitul. Pe preț nu-i batem niciodată — îi batem pe corectitudine juridică și pe faptul că livrăm dosarul, nu hârtia.

**De reevaluat după 90 de zile:** dacă rata de atașare a „dosarului complet" trece de 35%, prețul e corect. Dacă e sub 15%, diferența de valoare nu se vede și trebuie schimbat mesajul, nu prețul.

---

## 4. Ce facem diferit față de competiție

Din analiza a 13 site-uri:

| Slăbiciunea lor | Ce facem noi |
|---|---|
| Vând contractul, nu procedura (car-docs: doar PDF) | **Dosarul complet** — toate cererile din flux |
| Zero remindere pe termenele de 30/30/90 zile | **Remindere automate** — infrastructura există |
| Conținut SEO copiat reciproc, cu erori amplificate | **Checklist verificat pe surse oficiale**, actualizat la OUG 7/2026 |
| OCR-ul a devenit banal (3 jucători îl au) | **Precompletare** + OCR, ca paritate |
| Wizard pe 5 pași la car-docs | **Maximum 3 pași** (toți ceilalți au 3) |
| Fără cont, contractul nu se recuperează | Cont client + **contract editabil 30 de zile** (doar AutoX are) |
| Fără facturare → zero B2B | **Factură Oblio automată** → parcuri auto, dealeri, contabili |
| Trust fragil (car-docs: Gmail ca email de firmă, fără politică de retenție pentru pozele cu CI) | Firmă reală, ANPC/SOL, politică GDPR, audit trail |

---

## 5. Baza legală — verificată, cu rezerve

**Confirmat din surse oficiale:**
- **OUG 7/2026** (MO nr. 146 / 25.02.2026, aplicare 02.03.2026) modifică art. 159 Cod procedură fiscală: **și cumpărătorul** trebuie să prezinte certificat de atestare fiscală, altfel actul e **nul de drept**. CAF gratuit, 2 zile lucrătoare, valabil 30 de zile.
- **Contract ITL-054** (Model 2016, Ordin MDRAP/MFP 1069/2016), **5 exemplare** cu destinație fixă, **dublă viză REMTII** (organul fiscal al vânzătorului + al cumpărătorului).
- **RAR Auto-Pass** obligatoriu din 01.12.2024 (Legea 142/2023), 42 lei, valabil 60 de zile.
- **Termene:** 30 zile scoatere din rol · 30 zile declarare la primărie · 90 zile transcriere (depășire = înmatriculare suspendată de drept) · RCA fără perioadă de grație (1.000–2.000 lei + plăcuțe).

**⚠️ BLOCANT înainte de a scrie template-ul** — 6 incertitudini, cea majoră:

> Documentația formularului ITL-054 spune că **viza REMTII înlocuiește certificatul fiscal** (regula pre-2026), ceea ce pare să contrazică OUG 7/2026. Nu există text care să armonizeze cele două regimuri.

**Acțiune:** telefon la 2–3 direcții de impozite locale (București + un oraș mediu) — ce cer efectiv la ghișeu în iulie 2026. **Dacă generăm contractul după regula greșită, clientul rămâne cu un act refuzat — costă mai mult decât aduce produsul.**

Celelalte 5 (amenda exactă la depășirea celor 90 de zile, sancțiunea pentru lipsa RAR Auto-Pass, ITP obligatoriu la transcriere, regimul donațiilor, costul schimbării numărului la rovinietă) — nu punem în checklist cifre neconfirmate.

---

## 6. Implementare

### 6.1 Migrare DB (obligatorie — constrângere)

`services.category` are **CHECK constraint pe 6 valori fixe**:
```
CHECK (category IN ('fiscale','juridice','imobiliare','comerciale','auto','personale'))
```
Categoria nouă **nu se poate adăuga din admin** — cere migrare:
```sql
ALTER TABLE services DROP CONSTRAINT services_category_check;
ALTER TABLE services ADD CONSTRAINT services_category_check
  CHECK (category IN ('fiscale','juridice','imobiliare','comerciale','auto','personale','contracte'));
```
**Lista e hardcodată și în cod — 8 fișiere de actualizat** (căutare pe `'imobiliare'`):
`src/types/services.ts` (tipul de bază) · `src/app/comanda/[service]/page.tsx` · `src/app/api/services/route.ts` · `src/components/servicii/services-filter.tsx` (filtrul din listă) · `src/lib/oblio/ensure-invoice.ts` (⚠️ **facturare** — de verificat ce face cu o categorie necunoscută) · `src/lib/services/imobiliare.ts` · `src/app/api/admin/collaborators/route.ts` + `.../orders/route.ts` (scoping colaboratori).

Cel mai riscant e `ensure-invoice.ts`: dacă mapează categoria la ceva în factura Oblio, o valoare nouă poate rupe facturarea. **De citit înainte de migrare, nu după.**

### 6.2 Template-uri Word

`src/templates/contract-auto/` (convenția existentă: `src/templates/{service-slug}/{nume}.docx`):
- `contract-itl-054.docx` — contractul, cu etichete `{nume_vanzator}`, `{cnp_vanzator}`, `{marca}`, `{serie_sasiu}`, `{pret_litere}` etc.
- `cerere-caf-pf.docx` (ITL-010) · `declaratie-scoatere-evidenta.docx` · `cerere-transcriere.docx` (DGPCI) · `cerere-rovinieta.docx` (CNAIR) · `proces-verbal-predare.docx`

Sursele oficiale ale formularelor sunt în research (§4.3 din doc-ul de research).

### 6.3 Configurare serviciu

Rând nou în `services` + `service_options`, pe modelul celor 31 existente. Pași de wizard specifici: date vehicul (marcă, model, VIN, serie CIV, nr. înmatriculare, cilindree), date tranzacție (preț în cifre + litere, dată, loc), părți (vânzător/cumpărător — PF sau PJ).

**Reutilizabile fără cod nou:** modulul `personal-kyc` pentru datele + OCR-ul buletinului; billing-ul PF/PJ cu lookup ANAF.

### 6.4 Ce e efectiv de scris

- Modul de wizard pentru datele vehiculului (nu există unul azi — cazier auto cere doar numărul permisului)
- OCR pe **talon** (azi extrage doar CI/pașaport) — extindere `document-ocr.ts` cu un prompt nou
- Generarea checklistului personalizat (județ + tip părți) — logică de conținut, nu de infrastructură
- Reminderele pe termene — cron nou pe modelul celor existente

**Estimare:** zile, nu luni. Partea grea (motor, OCR, plăți, email, cont, audit) e făcută.

---

## 7. SEO și distribuție

- **Pagină de serviciu** `/servicii/contract-vanzare-cumparare-auto/` după SERVICE-PAGE-DESIGN-GUIDE.md.
- **Pagini de comparație** cu competitorii (skill `seo-competitor-pages`) — unghi: „ce primești la noi vs. la un generator de PDF". Are sens **după** ce produsul e live.
- **Articol-cluster** „acte necesare vânzare mașină 2026" cu OUG 7/2026 — subiect pe care competiția îl tratează greșit sau învechit.
- **Buton pe erovinieta** → comandă pe eghiseul.
- ⚠️ **Copy fără „documente oficiale"** — politica Google Ads governmental-documents (vezi memoria proiectului).

---

## 8. Extensibilitate

Categoria acceptă produse noi fără muncă de arhitectură. Candidați, în ordinea potrivirii:

1. **Contract comodat auto PF→PJ** — SEO nerevendicat (SERP-ul e Scribd și PDF-uri de primării), marjă identică, aceleași date
2. **Contract vânzare-cumpărare teren** — leagă de extras CF + certificat urbanism (ambele existente)
3. **Contestație amendă rutieră** — singurul avantaj structural necopiabil (rol `avocat` + semnătură + contract de asistență, unde competiția operează în zona gri a Legii 51/1995). **Cere discuție cu avocata înainte.**

**NU** contracte generice (închiriere, împrumut): piața plătește 0–1,5 €, gratuitul abundă, iar oamenii plătesc notarul pentru efectul juridic, nu template-ul.

---

## 9. Ordinea de execuție

1. **⛔ Verificare juridică** — 2–3 direcții de impozite pe contradicția ITL-054 / OUG 7/2026. **Blochează tot ce urmează.**
2. Migrare DB (categoria `contracte`) + căutat unde e hardcodată lista de categorii
3. Template Word pentru contract + config serviciu → **primul PDF generat end-to-end**
4. Modul wizard date vehicul + OCR talon
5. Restul formularelor (dosarul complet) + checklist personalizat
6. Remindere pe termene
7. Pagină de serviciu + articol + buton pe erovinieta
8. Pagini de comparație cu competitorii

**Măsurare la 90 de zile:** rata de atașare a „dosarului complet" (țintă >35%), conversie vizitator→plată (țintă 6–8%), CPA din Ads sub 15 lei, cross-sell cazier auto ≥3%.
