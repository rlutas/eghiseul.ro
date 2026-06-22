# Status livrări — Calculatoare, Pagini pe orașe, Ghiduri, Formulare (2026-06-22)

Recapitulare practică: ce e construit, unde îl găsești și cum îl testezi. Tot e **live pe eghiseul.ro**, pe GitHub (branch `main`), CI verde.

---

## 🟢 STARE FINALĂ (22 iunie 2026, seara) — citește ăsta primul

**36 de calculatoare** live, fiecare validat față de sursă oficială + concurență, cu research legal/fiscal 2026 dedicat. Toate în **mega-meniu** (desktop + mobil, 3 categorii) + **index categorizat** cu iconițe (`/calculator/`) + sitemap + OG dinamic.

**Lista completă (36) pe categorii:**
- **Salariu & muncă (15):** salariu net/brut, contribuții PFA, concediu medical, indemnizație șomaj, indemnizație creștere copil, vechime în muncă, zile concediu de odihnă, impozit pe pensie, diurnă, concediu maternitate, concediu paternal, spor noapte/ore supl., vârstă de pensionare, estimare pensie, pensie de invaliditate.
- **Fiscal (11):** TVA, dividende, taxe SRL, impozit auto, impozit chirie, penalități ANAF, rambursare anticipată, inflație, impozit pe casă, credit ipotecar, grad de îndatorare.
- **Juridic & altele (10):** taxe notariale, pensie alimentară, termene judiciare, taxă judiciară de timbru, reabilitare cazier, amendă circulație, dobândă legală, zile lucrătoare, calculator dată, procente.

**Plus:** pagină `/curs-valutar` (convertor + variație ▲/▼ + grafice 10 zile, live BNR).

**Validări cheie (vs surse oficiale/concurență):** taxe notariale = notariate.ro la leu; termene = calculator-termene.ro; estimare pensie 35 ani → 3.341 lei; vârstă pensionare = Anexa 5 (din PDF, parsat automat); dividende 16% (nu 10%); credit ipotecar 1.933 lei; dobândă legală BNR 6,5%.

**Conținut SEO:** toate paginile au content bogat (600–850+ cuvinte) — exemple numerice pas cu pas, tabele, greșeli frecvente, context legal, FAQ. Cele subțiri (3 pensii + 8 noi + originale) îmbogățite prin workflow (19 agenți).

**GEO / AI Overviews (audit `/seo`):** content best-in-class (figuri datate, surse legale citate). Adăugat la nivel de template (toate 36): `dateModified` în schema, linie „Actualizat: iunie 2026", breadcrumb complet, WebApplication îmbogățit.

**Research-ul a prevenit erori reale:** dividend 16% (nu 10%), CASS nou pe pensii, dobândă BNR 6,5%, VPR 81 înghețat, grila notarială nouă OMJ 177/C/2024, mitul civil/penal la termene.

**Rămas (opțional, GEO):** bloc TL;DR per pagină (necesită workflow), atribuire autor/reviewer E-E-A-T (necesită decizie: cine e reviewer-ul editorial).

---

> **Update 22 iunie (după-amiază) — adăugat la calculatoare:**
> - **Mega-meniu „Calculatoare"** (desktop + mobil, ca la Servicii) — `src/config/calculators-nav.ts` + `src/components/shared/calculators-mega-menu.tsx`, 15 grupate în 3 categorii.
> - **QA corectitudine:** toate 15 testate cu valori reale în browser, fiecare verificat contra formulei → corecte.
> - **Conținut îmbogățit** pe toate 15 (workflow 15 agenți): +3-4 secțiuni (exemplu numeric, tabele, greșeli frecvente) + 3-4 FAQ + linkuri interne fiecare.
> - **Pop-up captare email** (lead-gen, GDPR) pe paginile de calculator → tabel `newsletter_subscribers` (migrare 074) + `/api/newsletter` + `src/components/calculators/newsletter-popup.tsx`. Incentive: „alerte fiscale + ghiduri"; trigger scroll 50%.
> - **Imagini OG dinamice brandate** per calculator: rută edge `src/app/api/og/calculator/route.tsx` (next/og, 1200×630, font Liberation pt diacritice); toate 15 `ogImage → /api/og/calculator?title=${TITLE}`.
> - **ANCPI worker — fix login** (repo separat `~/Projects/worker-ancpi`): vezi secțiunea 7 de mai jos.

> **Update 22 iunie (seara) — extindere majoră:**
> - **25 calculatoare** acum (de la 15). Noi: taxe notariale (4 tab-uri, credit ipotecar + Noua Casă), pensie alimentară, termene judiciare, dividende, taxe SRL, rambursare anticipată, impozit pensie, inflație, diurnă, impozit casă. **Fiecare validat** față de sursă oficială + concurență (notariate.ro / calculator-termene.ro / estimez.ro), cu research legal/fiscal 2026 dedicat.
> - **Pagină `/curs-valutar`** — convertor valutar + variație zilnică ▲/▼ + grafice evoluție 10 zile (SVG) + tabel toate valutele, live din feed-ul oficial BNR (`lib/bnr.ts`, `/api/bnr-rate`). Reutilizabil în calculatoarele cu €.
> - **Header responsive** — comutare desktop/mobil mutată la `xl` (1280) ca să nu mai dea overflow pe tabletă/laptop mic.
> - **Conținut îmbogățit** și pe cele 10 calculatoare noi (workflow 10 agenți): exemple numerice, tabele, greșeli frecvente, FAQ.
> - **Toate 25 în mega-meniu** (desktop + mobil, 3 categorii) + sitemap + index + OG dinamic. Verificat vizual.
> - **Research-ul a prevenit erori reale:** impozit dividende 16% (nu 10%), CASS nou pe pensii 2026, grila notarială nouă OMJ 177/C/2024 (nu vechea 46/2011).
>
> **Roadmap calculatoare (din gap analysis vs estimez.ro/eghiseul.ro):**
> - 🟢 În lucru: credit ipotecar, zile lucrătoare, calculator dată (matematică pură)
> - 🟡 După research: concediu maternitate, dobândă legală, grad îndatorare (DTI), concediu paternal, spor noapte/weekend
> - 🔴 Blocat pe date: estimare pensie + migrare vârstă-pensionare/invaliditate (din WP vechi) — necesită Anexa 5 Legea 360/2023

---

## 1. Calculatoare (15 — toate verificate legal)

**Navigare:** meniu **Calculatoare** (header) + footer · index: `/calculator/`

| Calculator | URL | Ce calculează | Sursă legală 2026 |
|---|---|---|---|
| Salariu net/brut | `/calculator/salariu/` | brut↔net (CAS 25%, CASS 10%, impozit 10%, deducere) | Cod Fiscal |
| Impozit auto | `/calculator/calculator-impozit-auto/` | taxa auto anuală (cmc × normă Euro) | Legea 239/2025 |
| Amendă circulație + puncte | `/calculator/amenda-circulatie/` | amendă pe clase + puncte + plată redusă | OUG 195/2002 |
| Concediu medical | `/calculator/concediu-medical/` | indemnizația (% progresiv, prima zi neplătită) | OUG 158/2005 |
| Contribuții PFA | `/calculator/contributii-pfa/` | CASS/CAS/impozit pentru Declarația Unică | Cod Fiscal |
| Indemnizație creștere copil | `/calculator/calculator-indemnizatie-crestere-copil/` | ICC 85%, min 1.650 / max 8.500 | OUG 111/2010 |
| Indemnizație șomaj | `/calculator/indemnizatie-somaj/` | 75% ISR + supliment stagiu, durată, CASS | Legea 76/2002 |
| Impozit pe chirie | `/calculator/impozit-chirie/` | 10% pe venit net (deducere 20%) + CASS | Cod Fiscal |
| Penalități ANAF | `/calculator/penalitati-anaf/` | dobânzi + penalități întârziere/nedeclarare | Legea 207/2015 |
| Vechime în muncă | `/calculator/vechime-in-munca/` | sumă perioade → ani/luni/zile | date |
| Zile concediu de odihnă | `/calculator/zile-concediu-odihna/` | proporțional cu lunile lucrate | Codul Muncii |
| TVA | `/calculator/tva/` | adaugă/extrage TVA (21% / 11%) | Legea 141/2025 |
| Taxă judiciară de timbru | `/calculator/taxa-judiciara-de-timbru/` | taxa pe tranșe + taxe fixe | OUG 80/2013 |
| Reabilitare cazier | `/calculator/reabilitare/` | când se șterge condamnarea (3/4/5/7 ani) | Cod Penal 165-167 |
| Procente | `/calculator/calculator-procente/` | X% din Y, cât %, variație | — |

**Notă corectitudine:** formulele au fost verificate prin research dedicat (vezi `docs/seo/calculator-formulas-2026.md`); cele care depind de praguri municipale (impozit auto) sau de norme în clarificare (concediu medical) au disclaimer „orientativ".

**Cum testezi:** intri pe oricare URL → completezi câmpurile → rezultatul apare live (fără submit). Exemplu verificat: salariu 5.000 brut → **2.967 net** (S1 2026).

**Rămase (cu blocaj):** vârstă pensionare (necesită tabelul Anexa 5 lunar — PDF MMSS), pensie invaliditate (cere punctaj contributivitate), termene judiciare (off-by-one de validat).

---

## 2. Pagini pe orașe — Cazier judiciar (37, acoperire completă)

**URL:** `/servicii/cazier-judiciar-online/{oraș}/` · **navigare:** secțiune „Cazier judiciar pe orașe" în hub-ul de cazier + sitemap + internal links între orașe (NU în meniul principal — corect pentru programmatic SEO).

Fiecare oraș are **date IPJ reale verificate** (adresă, program, telefon unde e public) + conținut ~2.500 cuvinte (ce este, situații, acte PF/PJ, preț, online vs ghișeu, reabilitare, diaspora, FAQ).

**Cele 37:** București, Cluj-Napoca, Timișoara, Iași, Constanța, Brașov, Craiova, Sibiu, Oradea, Arad, Galați, Ploiești, Bacău, Pitești, Baia Mare, Suceava, Târgu Mureș, Buzău, Reșița, Drobeta-Turnu Severin, Zalău, Slobozia, Călărași, Giurgiu, Alexandria, Sfântu Gheorghe, Miercurea Ciuc, Brăila, Botoșani, Vaslui, Râmnicu Vâlcea, Deva, Alba Iulia, Bistrița, Focșani, Tulcea, Târgoviște.

**Cum testezi:** `/servicii/cazier-judiciar-online/cluj-napoca/` (oraș normal) și `/servicii/cazier-judiciar-online/bucuresti/` (model special „oricare secție").

---

## 3. Ghiduri stare civilă (5 — în meniul Blog)

**Navigare:** meniu **Blog** → articol. URL la rădăcină.

| Ghid | URL |
|---|---|
| Certificat naștere pierdut | `/certificat-de-nastere-pierdut/` |
| Schimbare certificat vechi | `/schimbare-certificat-de-nastere-vechi/` |
| Acte necesare certificat naștere | `/acte-necesare-certificat-de-nastere/` |
| Transcriere certificat căsătorie | `/transcriere-certificat-de-casatorie/` |
| Model certificat căsătorie | `/model-certificat-de-casatorie/` |

---

## 4. Formulare de comandă (stare civilă) — paritate atinsă

Wizard-ul de comandă pentru **naștere / căsătorie / celibat** e complet față de vechiul WP (verificat 2026-06-21 în cod — vezi `docs/technical/specs/wp-form-gap-analysis-2026-06-14.md`):
- ✅ Modul **`civil-status`**: istoric marital, stare civilă actuală, nume soț/de naștere, nume părinți, data căsătoriei, localitate, Minor/Adult, scop, țară folosire, motiv vechi certificat.
- ✅ **Picker limbă traducere** + **țară apostilă** (în pasul Opțiuni).
- ✅ **Livrare internațională** (DHL / Poșta Română + selecție țară).
- ✅ Semnătură-ca-consimțământ (eIDAS Art. 25).
- ⏳ Rămas P2-minor (nu blochează lansarea): upload opțional „vechiul certificat"/acte părinți, upsell celibat→naștere.

**Cum testezi:** `/comanda/cazier-judiciar-persoana-fizica/` (flux generic) și pornește o comandă de naștere/căsătorie/celibat din pagina serviciului respectiv pentru a vedea pasul „Date Stare Civilă".

---

## 5. Navigare — ce am actualizat

**Header (meniu principal):** Acasă · Servicii · **Calculatoare** (adăugat) · Blog · Status comandă · Contact.
**Footer:** coloana Servicii include acum **Calculatoare**.
- Calculatoarele → în meniu + footer + index `/calculator/`.
- Ghidurile → în meniul **Blog**.
- Paginile pe orașe → în hub-ul de cazier + sitemap (nu în meniu, intenționat).

---

## 6. Cum verifici că totul e indexabil
- **Sitemap:** `/sitemap.xml` — include toate calculatoarele, orașele, ghidurile, serviciile (fără 404-uri; calculatoarele neconstruite au fost scoase).
- **CI:** verde pe `main` (lint + tsc).

---

## 7. ANCPI worker — fix login (22 iunie)

Repo separat: `~/Projects/worker-ancpi` (NU în acest repo). Detalii complete în memorie `ancpi-worker-status` + `docs/technical/specs/ancpi-automation-plan.md`.

**Problema:** comenzi EXTRAS_CF eșuau repetat cu „Login did not reach the authenticated account page." (ex. E-260622-RPGN8, CF 151420-C1-U33 Satu Mare).

**Cauza:** după login OpenAM, workerul făcea un `goto epay LogIn.action` suplimentar; un GET la `LogIn.action` fără sesiune validă întoarce o pagină „40x - client error" → verificarea „Contul meu" pica. Pagina de login + credențialele erau OK.

**Fix** (`src/ancpi/session.ts`): verifică întâi pagina pe care a aterizat după login (evită goto-ul 40x-prone), cu goto doar ca fallback + eroare diagnostic (mentenanță / rămas-pe-login / 40x / neașteptat + URL). Commit `a14973f`.

**⚠️ Deploy:** worker-ul se deployează cu **`railway up` din `~/Projects/worker-ancpi`** (Railway CLI) — **git push NU deployează** (repo neconectat la auto-deploy). După deploy, comanda E-260622-RPGN8 s-a plasat + plătit automat (ePay 10077906, status PROCESSING).

---

*Docs conexe: `docs/seo/SEO-STATUS-2026-06-21.md` (status SEO general), `docs/seo/calculator-formulas-2026.md` (formule verificate), `docs/seo/keywords/` (keyword research per serviciu).*
