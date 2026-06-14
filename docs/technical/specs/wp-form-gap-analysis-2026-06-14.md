# WP Form Gap Analysis — Certificate Stare Civilă (2026-06-14)

**Metodă:** Playwright pe formularele live WP (`eghiseul.ro`) vs. inventarul wizard-ului modular nou (`src/components/orders/`). Scop: ce colectează WordPress și **NU se face încă** în platforma nouă pentru certificat **naștere / căsătorie / celibat**.

> TL;DR: paginile SEO + de prezentare sunt gata (vezi `docs/seo/gsc-data/SERVICE-RANKING-PLAYBOOK-2026-06-13.md`), dar **wizard-ul de comandă pentru certificatele de stare civilă e minimal** (flux PF generic: contact → date personale/CNP → opțiuni → KYC → semnătură → livrare → facturare). WP-ul colectează un set mult mai bogat, specific stării civile. Acestea sunt lipsurile reale de implementat înainte de cutover.

---

## ✅ IMPLEMENTAT (2026-06-14) — modul „Date Stare Civilă" + preț

- **Preț:** naștere + căsătorie → **998 RON** (placeholder-ul 179 era greșit; real ~1190). Migrare `053_civil_status_module.sql`.
- **Modul nou de wizard `civil-status`** (step „Date Stare Civilă", după Date Personale), config-driven per serviciu via `verification_config.civilStatus`:
  - Tipuri: `src/types/verification-modules.ts` (`CivilStatusConfig`, `CivilStatusState`).
  - Step builder + registry + loader dinamic + getModuleConfig în wizard.
  - State în provider (`UPDATE_CIVIL_STATUS`, init, persistență în cache + `customer_data.civil_status` + restore).
  - Componentă `src/components/orders/modules/civil-status/CivilStatusStep.tsx` (câmpuri condiționale, branching istoric marital, accesibil).
- **Câmpuri activate per serviciu (P0 acoperit):**
  - **Naștere:** Minor/Adult, nume tată+mamă, nume de naștere, localitate înregistrare, scop, țară folosire.
  - **Căsătorie:** istoric marital (+count +divorț/deces), nume soț înainte de căsătorie, data căsătoriei, localitate, nume de naștere, părinți, scop, țară.
  - **Celibat:** stare civilă actuală, istoric marital, localitate, scop, țară.
- **Logică „străinătate" fidelă WPForms** (din `wpforms-form-export-06-14-2026.json`): „Nașterea/Căsătoria a avut loc în România/Străinătate" + ⚠️ avertismente de **transcriere** (dacă actul din străinătate nu e transcris în RO, nu se poate elibera); divorț în străinătate → trebuie recunoscut în RO; „Ați renunțat la cetățenia română?" → ℹ️ certificatul nu va mai avea CNP. NB: WP nu folosește un toggle generic „cetățean străin" la aceste servicii — folosește locul evenimentului + transcrierea.
- Verificat: build de producție verde, `tsc` 0 erori, `eslint` 0 erori.

**Rămas (P1/P2):** picker limbă traducere + țară apostilă (UI peste logica existentă), livrare internațională (Poșta/DHL + țară), upload „vechiul certificat" / acte părinți, upsell celibat→naștere, a 3-a declarație. Vezi tabelul de mai jos pentru detalii.

---

## 1. Structura formularelor WP (live)

Toate trei sunt **WPForms cu 7 pași**, cu logică condițională de stare civilă.

### Certificat de Naștere (7 pași)
1. **Contact:** Nume (first/last), Email, Telefon
2. **Date + stare civilă:** tip certificat · „Pentru cine se solicită" (Minor/Adult) · „Nașterea a avut loc în" (RO/Străinătate) · „Sunteți căsătorit(ă)?" · „Ați mai fost căsătorit(ă) anterior?" · „De câte ori?" · „Ultima căsătorie s-a încheiat prin" (Divorț/Deces) · **Numele complet al tatălui** · **Numele complet al mamei** · **Loc Naștere** · **Țara în care se folosește actul** · **Numele și Prenumele cu care v-ați născut** (nume de naștere) · **Scopul obținerii** · motiv (Pierdut)
3. **Add-on-uri:** Traducere autorizată (+select 12 limbi cu prețuri) · Legalizare traducere · Apostilă Haga · Apostilă Camera Notarilor · Extras Multilingv · „Țara"
4. **Livrare:** Electronic & la adresă · RO/Străinătate · **Poșta Română / DHL / Fan Courier** (internațional) · adresă completă
5. **Upload-uri:** document · selfie cu documentul · **Buletin/Pașaport Părinți** · Vechiul Certificat (opțional)
6. **Semnătură + 3 declarații:** Termeni · înțeleg serviciul · declar pe propria răspundere
7. **Facturare:** PF/PJ · CUI · Nume Firmă · Nume/Prenume · CNP · adresă · Cupon · Stripe

### Certificat de Căsătorie (7 pași) — diferențe față de naștere
- **Data căsătoriei** · **Numele complet al soțului/soției înainte de căsătorie** · „Oficiul care a înregistrat actul de căsătorie se află în localitatea" · „Ați renunțat vreodată la cetățenia română?" · istoric marital (ați mai fost căsătorit / de câte ori / cum s-a încheiat) · nume tată/mamă · nume de naștere · scop · țara folosirii.

### Certificat de Celibat (7 pași) — diferențe
- **Localitatea/Județul în care v-ați născut** · **„Care este starea civilă actuală?"** · istoric marital complet · „Mai dețineți vechiul certificat de căsătorie?" · „Solicitați certificatul în vederea încheierii căsătoriei în..." · **Naționalitatea** · scop · **„Dețineți certificatul de naștere nou (albastru)?"** · **„Doriți să vă ajutăm cu obținerea certificatului de naștere?"** (upsell) · țara folosirii.

---

## 2. Ce colectează wizard-ul NOU (modular)

Sursă: `step-builder.ts`, `PersonalDataStep.tsx`, `options-step.tsx`, `delivery-step.tsx`, `billing-step.tsx`. Toate 3 serviciile au **același `verification_config`** (copiat în migrarea 034) → wizard-ul nu știe diferențe per serviciu.

Colectează: email, telefon · nume/prenume · CNP (obligatoriu) · data nașterii + județ naștere (derivate din CNP) · adresă (OCR/manual) · cetățenie · tip+serie+număr act · **nume tată/mamă (doar OCR, nemandatoriu, neafișat ca field)** · upload KYC (act + selfie) · semnătură + 2 consimțăminte · 7 opțiuni (urgență, apostilă Haga, traducere, legalizare, apostilă notari + 2 ascunse) · livrare (metodă generică) · facturare (PF; CNP/CUI).

---

## 3. GAP — ce NU se face încă (de implementat)

| Câmp / logică WP | Naștere | Căsătorie | Celibat | Status nou |
|---|:-:|:-:|:-:|---|
| **Stare civilă actuală** | — | — | ✔ | ❌ lipsește |
| **Istoric marital** (ați mai fost căsătorit / de câte ori / cum s-a încheiat: divorț/deces) | ✔ | ✔ | ✔ | ❌ lipsește complet |
| **Nume soț/soție înainte de căsătorie** | — | ✔ | — | ❌ flag `enable_spouse_names` există, dar **fără UI** |
| **Data căsătoriei** | — | ✔ | — | ❌ lipsește |
| **Oficiul/localitatea înregistrării actului** | — | ✔ | ✔ | ❌ lipsește |
| **Nume de naștere** („cu care v-ați născut") | ✔ | ✔ | — | ❌ lipsește (field explicit) |
| **Nume tată/mamă ca field editabil** | ✔ (obligatoriu) | ✔ | — | ⚠️ doar OCR, neafișat/needitabil |
| **„Pentru cine" (Minor/Adult)** | ✔ | — | — | ❌ lipsește |
| **Scopul obținerii certificatului** | ✔ | ✔ | ✔ | ❌ exclus din `getPurposeOptionsForService` pentru certificate |
| **Țara în care se folosește actul** | ✔ | ✔ | ✔ | ❌ neafișat |
| **Renunțat la cetățenia română?** | — | ✔ | — | ❌ lipsește |
| **Naționalitatea** | — | — | ✔ | ❌ lipsește |
| **Picker limbă traducere** (12 limbi, prețuri) | ✔ | ✔ | ✔ | ⚠️ logică în `options-step.tsx` dar **fără UI** pentru certificate |
| **Picker țară apostilă** | ✔ | ✔ | ✔ | ⚠️ idem (metadata există, fără picker) |
| **Livrare internațională** (Poșta/DHL + țară) | ✔ | ✔ | ✔ | ❌ livrare generică, fără picker țară/curier internațional |
| **Upload „vechiul certificat"** | ✔ (opt) | ✔ (opt) | — | ❌ doar KYC act+selfie |
| **Upload buletin/pașaport PĂRINȚI** | ✔ | — | — | ❌ lipsește (specific naștere) |
| **Upsell „obținere certificat naștere"** | — | — | ✔ | ❌ lipsește |
| **A 3-a declarație** (pe propria răspundere) | ✔ | ✔ | ✔ | ⚠️ doar 2 consimțăminte |

### ⚠️ Discrepanță de preț de verificat
Formularul WP afișează tier-ul „**Simplu — 1.190,00 RON**" pentru naștere ȘI căsătorie, în timp ce DB-ul nostru are **179 RON**. De clarificat cu clientul care e prețul real (179 e cel din platforma nouă; 1190 pare stale sau alt pachet) — vezi și nota generală de prețuri.

---

## 4. Recomandare de prioritizare (înainte de cutover)

**P0 — blochează paritatea funcțională pentru căsătorie/celibat:**
1. Modul „stare civilă" condițional per serviciu: istoric marital (căsătorit? / de câte ori / cum s-a încheiat) + stare civilă actuală (celibat) + nume soț înainte de căsătorie + data căsătoriei.
2. Nume de naștere + nume tată/mamă ca câmpuri editabile (nu doar OCR), obligatorii la naștere.
3. Scopul obținerii + țara folosirii actului (toate 3).

**P1 — paritate add-on/livrare:**
4. Picker limbă traducere + picker țară apostilă (UI peste logica existentă din `options-step.tsx`).
5. Livrare internațională (Poșta/DHL + selecție țară) când livrarea e în străinătate.
6. Upload „vechiul certificat" + (naștere) upload acte părinți.

**P2 — fricțiune mică:**
7. „Pentru cine" (Minor/Adult) la naștere; a 3-a declarație pe propria răspundere; upsell celibat→naștere.

**Notă arhitectură:** toate 3 serviciile partajează acum un `verification_config` identic — paritatea cere **config per-serviciu** (sau un modul „civil-status" parametrizat pe slug), nu un singur flux PF generic.

---

*Sursă date formular: Playwright pe formularele WP live, 2026-06-14. Inventar wizard nou: `src/components/orders/` + migrarea 034.*
