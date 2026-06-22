# Status livrări — Calculatoare, Pagini pe orașe, Ghiduri, Formulare (2026-06-22)

Recapitulare practică: ce e construit, unde îl găsești și cum îl testezi. Tot e **live pe eghiseul.ro**, pe GitHub (branch `main`), CI verde.

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

*Docs conexe: `docs/seo/SEO-STATUS-2026-06-21.md` (status SEO general), `docs/seo/calculator-formulas-2026.md` (formule verificate), `docs/seo/keywords/` (keyword research per serviciu).*
