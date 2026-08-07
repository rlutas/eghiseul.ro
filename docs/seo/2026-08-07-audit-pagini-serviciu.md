# Audit pagini de serviciu + stare sitemap + pasul humanizer

**Data:** 2026-08-07 · 29 de pagini de serviciu verificate programatic (cuvinte, FAQ, H2, schema,
linkuri interne, imagine OG).

---

## 1. Verdictul scurt

Paginile de serviciu sunt, în ansamblu, **bine construite**: toate 29 au schema JSON-LD, toate au
FAQ (8–22 întrebări), toate au minimum 6 secțiuni H2. Nu există pagini subțiri de tip „un paragraf
și un buton". Problemele sunt de altă natură: imagini OG lipsă, linkuri interne puține pe grupul
cadastral și o singură pagină rămasă în urmă la conținut.

| Verificare | Rezultat |
|---|---|
| Schema JSON-LD | ✅ 29/29 |
| FAQ prezent | ✅ 29/29 |
| Sub 900 de cuvinte | ⚠️ 1 pagină (`rovinieta-online`, 989 — la limită) |
| Imagine OG proprie | ❌ **11/29** — restul folosesc `/og/default` |
| Linkuri interne | ⚠️ 14 pagini cadastrale au doar **2** fiecare |

## 2. Clasament pe conținut

| Pagină | Cuvinte | FAQ | H2 | Linkuri interne |
|---|---|---|---|---|
| cazier-judiciar-online | 4.246 | 20 | 11 | 10 |
| extras-de-carte-funciara | 2.571 | 22 | 13 | 8 |
| certificat-constatator-online | 2.072 | 17 | 10 | 10 |
| eliberare-certificat-de-nastere | 1.819 | 12 | 9 | 12 |
| cazier-auto-online | 1.750 | 12 | 10 | 6 |
| …14 pagini cadastrale | 1.319–1.552 | 8–9 | 6 | **2** |
| cazier-fiscal-online | 1.495 | 11 | 7 | 5 |
| extras-plan-cadastral | 1.243 | 10 | 6 | 3 |
| **rovinieta-online** | **989** | 6 | 5 | 3 |

## 3. Ce e de făcut, în ordinea impactului

### a) 18 pagini fără imagine OG proprie
Toate folosesc `/og/default`. Când cineva dă linkul pe WhatsApp sau Facebook, apare aceeași imagine
generică pentru 18 servicii diferite. Există deja convenția `/og/services/<nume>.png` (11 pagini o
folosesc). Lipsesc: `actualizare-adresa-cf`, `certificat-detineri-imobile`, `certificat-sarcini`,
`certificat-urbanism-informare`, `copie-arhiva-ocpi`, `copie-carte-funciara`,
`copie-contract-vanzare`, `copie-intabulare`, `copie-inventar-coordonate`, `copie-plan-cadastral`,
`copie-plan-incadrare`, `copie-releveu`, `extras-cf-colectiv`, `extras-plan-cadastral`,
`identificare-imobil`, `identificare-imobile-proprietar`, `plan-amplasament-delimitare`,
`rovinieta-online`.

Cele 14 cadastrale pot împărți 3–4 imagini tematice (plan, releveu, carte funciară, identificare) —
nu are rost câte una per pagină.

### b) Linkuri interne pe grupul cadastral
14 pagini cu doar 2 linkuri interne fiecare, în timp ce paginile care rankează bine au 8–12. Grupul
e izolat: nu primește greutate din restul site-ului și nu o pasează mai departe. Cea mai ieftină
reparație e tabelul „ce document îți trebuie" adăugat azi în articolul-far
`cum-aflam-numarul-carte-functionara-si-nr-cadastral` (98k expuneri), care acum trimite spre 5
dintre ele. De continuat cu linkuri reciproce între serviciile înrudite.

### c) `rovinieta-online`
Cea mai slabă pagină: 989 de cuvinte, 6 întrebări FAQ, 3 linkuri interne. În GSC: 8.724 expuneri,
**CTR 0,4 %**, poziția 10,5. Iar tool-ul gratuit `/tools/verificare-rovinieta-online/` are 866.032
de expuneri și 46.478 de clicuri. Puntea dintre cel mai vizitat tool al site-ului și serviciul plătit
corespunzător practic nu funcționează.

### d) Corectat azi
Pagina `cazier-fiscal-online` spunea că documentul atestă „lipsa datoriilor fiscale". Este definiția
certificatului de atestare fiscală, nu a cazierului, care atestă fapte sancționate. Reformulat și
legat de ghidul nou.

---

## 4. Sitemap — stare

**Complet, fără găuri.** Verificat programatic:

| Verificare | Rezultat |
|---|---|
| Slug-uri în registru fără pagină (ar da 404 în sitemap) | **0** |
| Pagini root existente și neincluse | **0** (cele 6 „lipsă" detectate inițial sunt în `STATIC_PAGES`) |
| `lastModified` sincronizat cu `DATE_MODIFIED` | ✅ testul `tests/unit/lib/seo/last-modified.test.ts` trece |

Adăugat azi în registre: `cazier-fiscal-persoana-fizica` în `HARDCODED_ARTICLE_SLUGS` și în
`PAGE_LAST_MODIFIED`; actualizat `cum-aflam-numarul-carte-functionara-si-nr-cadastral` la 2026-08-07.

⚠️ De reținut: testul de sincronizare cade dacă schimbi `DATE_MODIFIED` într-o pagină și uiți
registrul din `src/lib/seo/last-modified.ts`.

---

## 5. Humanizer — ce a ieșit la scanare

Am scanat toate cele 122 de pagini cu conținut după tiparele din Wikipedia „Signs of AI writing",
adaptate la română (rol crucial / peisaj / tapiserie, „nu doar… ci și", participii decorative de tip
„evidențiind", „subliniind", atribuiri vagi de tip „experții spun", concluzii generice).

**Vestea bună: tiparele semantice grele lipsesc aproape complet.** Pe tot site-ul: 2 apariții de
„nu doar… ci și", zero „joacă un rol crucial", zero „peisajul digital", zero „experții susțin",
zero concluzii de tip „viitorul se anunță".

Ce apare mult sunt două tipare de **formatare**, nu de conținut:

| Tipar | Unde |
|---|---|
| Liste cu antet îngroșat (`<li><strong>Titlu.</strong> text`) | 38 în politica de confidențialitate, 27 în `taxa-cazier-judiciar`, 14–23 în majoritatea calculatoarelor |
| Linii de pauză (—) în exces | 67 în `ancpi-nu-functioneaza`, 39 în politica de confidențialitate, 10–17 în calculatoare |

Pe paginile legale și pe calculatoare, lista cu antet îngroșat e o alegere de lizibilitate corectă,
nu slop — acolo o las. Pe articolele editoriale merită curățată.

**Trecut prin humanizer azi:** `cazier-fiscal-persoana-fizica` — liniile de pauză reduse de la 20 la
1, secțiunea de greșeli rescrisă din listă cu antete îngroșate în proză curgătoare, ritmul frazelor
variat.

**Următoarele candidate**, în ordine: `ancpi-nu-functioneaza` (67 de linii de pauză, 7.068 de clicuri
— merită), `extras-carte-funciara-gratuit`, `certificat-constatator-pentru-banca`,
`taxa-cazier-judiciar`.

Scanerul e refolosibil: `scripts/seo-ai-tells.py`.
