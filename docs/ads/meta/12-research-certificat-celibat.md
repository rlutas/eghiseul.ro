# Research: piața certificatului de celibat (diaspora)

Cercetare 07.09.2026, pentru campania Meta pe `certificat-celibat` (698 lei).

> ⏳ **Raport parțial.** Deocamdată e livrat doar capitolul de competiție, verificat prin browser
> real (Meta Ad Library + Google Ads Transparency Center), nu prin presupuneri. Restul (procedura
> oficială pe țări, durerea reală din forumuri, volumele de căutare, sezonalitatea, obiecțiile) e
> cerut și se adaugă aici.

---

## Competiția

### Banda de preț și termen

| Firmă | Preț | Termen | Unghi |
|---|---|---|---|
| LaGhiseu | 500 lei | 10–20 zile | — |
| GhișeuRapid | 650 lei | 10–20 zile | — |
| **noi (eghiseul.ro)** | **698 lei** | **15–30 zile** | — |
| **cazierjudiciarfirma.ro** (SC Web Clerk SRL, Iași; av. Chende Ciprian-Dumitru, Baroul Sălaj) | **999 lei „totul inclus"** · pachet internațional (apostilă + traducere + legalizare) **+500 lei** | **~5 zile lucrătoare** | „Certificat de Celibat Online, **obținut prin Avocat**" · preț fix afișat înainte de plată · **5,0/5 din 165 recenzii** |

Alți jucători, fără preț afișat: Inter Lexis, IB Legal Family (CA Ioana Bărbulescu),
Traduzioni-Servizi (Milano), cluster Moldova (documentexpert.md etc.).

🔴 **Suntem la mijloc pe preț, dar ULTIMII pe termen.** Concurentul cel mai scump (999 lei, +43%
față de noi) promite de 3–6 ori mai repede. **Termenul, nu prețul, e dezavantajul nostru vizibil.**
De verificat cu operațiunile dacă 15–30 de zile e termenul real sau doar marja de siguranță din
`services.estimated_days`.

### Reclame — verificat, nu presupus

**Meta Ad Library: ZERO reclame în nișă.**
- `certificat de celibat` → 14 rezultate, toate romane/ebook-uri franțuzești care conțin „mariage"
- `adeverinta de celibat` → 0
- `acte stare civila strainatate` → 0
- `certificat de cutuma` → 1 reclamă politică

**Terenul e complet gol pe Meta.** Detaliu interesant: Centrul de Vize T&B *a rulat* Meta ads
(procură auto Turcia, mai 2024 – oct. 2025) — deci există jucători din zonă cu cont și
infrastructură, dar **nimeni n-a atins vreodată certificatul de celibat**.

Nu e o piață saturată — e una pe care nimeni nu o cumpără. Riscul nu e concurența, e ca Meta să
clasifice greșit creativul (avem deja istoric cu C0 respins pe „forged goods").

**Google Ads: un singur advertiser** — cazierjudiciarfirma.ro, prezent top **și** bottom pe toate
head-terms-urile:

> Titlu: „**999 Lei, Totul Inclus – Comanzi Online în 3 Minute – Valabil 6 Luni**"
> Callout-uri: `Preț Fix 999 Lei` · `Curier Internațional` · `Răspuns pe WhatsApp`

Zero anunțuri pe `certificat de cutuma` — logic, e gratuit la consulat, n-are marjă.

### 🔥 Relevanță directă pentru conflictul cu Google

Anunțul lui **trece** politica Google pe exact categoria pe care noi suntem blocați („Documente
guvernamentale și servicii oficiale"), cu unghiul **„obținut prin Avocat" + preț fix afișat**.

Asta e dovadă concretă de tratament inegal pentru dosarul deschis la Google (tichet
1-6533000041865) — vezi `docs/ads/2026-09-07-raspuns-google-tratament-egal.md` și
`docs/ads/2026-09-07-dosar-google-pentru-avocat.pdf`. **De adăugat la escaladare.**

Și avem un argument pe care el nu-l are: **Legea 120/2026 — împuternicire avocațială fără procură
notarială.**

## Două corecții la strategia noastră de preț

1. **Add-on-ul nostru de apostilă (198 lei) e peste piață.**
   apostile.ro: 100 lei/24h, 150 lei urgent 4–6h · documentexpert.ro: 100 lei (Prefectura
   București) · LaGhiseu: 180 lei · GhișeuRapid: 150 lei.
   Vizibil dacă un client compară — și se adaugă peste observația că **apostila e oricum inutilă
   între statele UE** (Regulamentul UE 2016/1191).

2. **Frâna de conversie nr. 1 din SERP:**
   [toateactele.ro](https://toateactele.ro/proceduri/certificat-celibat-cutuma) rankează pe
   head-terms și scrie negru pe alb: *„Eliberarea documentului: **GRATUITĂ** — la toate
   consulatele"*. 5–7 din primele 10 rezultate organice sunt instituții (econsulat.ro,
   hub.mai.gov.ro, primării) sau forumuri.

   **Orice pagină comercială care nu răspunde din primul scroll la „de ce plătesc, dacă la consulat
   e gratis" pierde traficul.** Asta trebuie să fie primul lucru de pe landing page și trebuie să
   apară și în creative.

## Implicații pentru campanie

- **Unghiul demonstrat că trece la Google:** „prin avocat înscris în Barou" + preț fix afișat.
  Îl avem și noi.
- **Obiecția obligatorie de tratat:** „la consulat e gratis". Răspunsul nu e prețul, e programarea,
  drumul și timpul.
- **Punctul slab de reparat înainte de scalare:** termenul. Dacă putem promite realist sub 15 zile,
  se schimbă complet poziționarea față de concurentul de 999 lei.
- **Apostila:** ori coborâm add-on-ul la nivelul pieței, ori explicăm de ce nu e nevoie de ea în UE
  (a doua variantă e și mai onestă, și mai bună comercial).

---

## Termenul REAL, măsurat în baza noastră (nu estimat)

Interogat pe tot istoricul, `orders.payment_status='paid'`, durata de la plată la `completed`:

| Serviciu | Finalizate | Zile med. | Min | Max | În lucru |
|---|---|---|---|---|---|
| certificat-nastere | 9 | 20,7 | 13,8 | 31,7 | 5 |
| extras-multilingv-nastere | 9 | 24,9 | 12,9 | 55,8 | 4 |
| **certificat-celibat** | **5** | **18,9** | **8,6** | **28,0** | 1 |
| certificat-casatorie | 4 | 26,1 | 19,4 | 40,6 | 0 |
| extras-multilingv-casatorie | 2 | 9,1 | 6,6 | 11,7 | 1 |

Cele 6 comenzi de celibat, una câte una:

| Comandă | Status | Plătit | Zile |
|---|---|---|---|
| E-260810-3LHKF | completed | 09.08 | 23,7 |
| E-260802-B5VNY | completed | 01.08 | 8,6 |
| E-260726-FHD3D | completed | 25.07 | 15,0 |
| E-260716-RAFUG | completed | 15.07 | 28,0 |
| E-260714-TCQJV | completed | 13.07 | 19,4 |
| E-260711-TFVDH | **standby** | 10.07 | 24,8 (blocat pe client) |

### Ce înseamnă

- **Media reală e 18,9 zile calendaristice** (≈13–14 zile lucrătoare), nu 30. Cei 30 din
  `services.estimated_days` sunt marja de siguranță, nu realitatea.
- **Cel mai rapid am livrat în 8,6 zile.** Deci ~9 zile e posibil, dar s-a întâmplat o singură dată
  din cinci — **nu se poate promite**.
- **Nu putem concura pe viteză cu cele ~5 zile ale lui cazierjudiciarfirma.ro.** Nu am atins
  niciodată pragul ăsta. Orice anunț care promite „5 zile" ar fi un claim nesubstanțiat — exact ce
  declanșează verificarea obligatorie la Meta din martie 2026.
- Formularea onestă și totuși mai bună decât „30 de zile": **„de obicei în 2–4 săptămâni"** sau
  **„în medie ~3 săptămâni"**. E adevărată pe toate cele 5 comenzi finalizate.
- 1 din 6 comenzi a rămas în `standby` (așteaptă ceva de la client). La 17% rată de blocaj, un
  proces de follow-up mai strâns scurtează media mai mult decât orice optimizare de reclamă.

### Poziționarea care rezultă

Nu vindem viteza. Vindem:
1. **Preț** — 698 vs 999 la singurul concurent care face reclamă (−30%).
2. **Prin avocat înscris în Barou**, fără procură notarială (Legea 120/2026) — argument pe care
   concurentul nu îl are.
3. **Nu te întorci în România** — comparativ cu drumul, nu cu consulatul.

Și tratăm frontal obiecția „la consulat e gratis": răspunsul e programarea, drumul și timpul, nu
prețul.
