# SEO & Pre-Launch Status — 2026-06-21

Status consolidat al lucrului SEO (stare civilă + location engine) și ce mai e de făcut spre lansare. Pentru detalii: `docs/plans/2026-06-19-location-seo-engine.md`, `docs/seo/keywords/`, `docs/seo/REBUILD-QUEUE.md`.

---

## ✅ Livrat (live pe eghiseul.ro)

### Cluster stare civilă (ghiduri, ArticleLayout)
- `/certificat-de-nastere-pierdut` — cluster „pierdut" (2.130 vol)
- `/schimbare-certificat-de-nastere-vechi` (480 vol)
- `/acte-necesare-certificat-de-nastere` (710+ vol)
- `/transcriere-certificat-de-casatorie` (110 vol, diaspora)
- `/model-certificat-de-casatorie` (~390 vol)
- Toate: design brandat, OG branded, internal linking ↔ hub, **listate în Blog** (config/articles).

### Location engine — cazier judiciar pe orașe
- Engine reutilizabil: `src/lib/seo/locations/` (registru tipat + quality gate anti-thin + `buildLocationPageGraph`).
- Rută SSG `/servicii/cazier-judiciar-online/[oras]`.
- Componentă `CazierLocationPage` — conținut bogat ~2.500 cuvinte (ce este+valabilitate, situații, acte PF/PJ, preț+durată, online vs ghișeu, pași, **reabilitare**, **diaspora**, FAQ extins, surse oficiale), butoane PF/PJ direct la formular, date IPJ reale.
- **5 orașe live** (date IPJ verificate): Cluj-Napoca, Timișoara, Iași, Constanța, Brașov.
- Discoverability: sitemap segmentat + secțiune „Cazier judiciar pe orașe" în hub + internal links.

### Fix-uri pre-lansare (2026-06-21)
- Ghidurile noi → adăugate în `config/articles` (apar în Blog) + câmp `image` cu fallback (fără thumbnail rupt).
- **Sitemap curățat de 404-uri:** `HARDCODED_CALCULATOR_SLUGS` golit (paginile nu existau, trimiteau 404 la Google). Se re-adaugă pe măsură ce se construiesc.

---

## 📊 Acoperire orașe (cazier judiciar)
| Sursă | Orașe |
|---|---|
| **Noi** | **37** (toate capitalele de județ + sectoare în hub) |
| caziere.ro | 10 |
| cazierjudiciaronline.com | 39 |

**Acoperire completă** — depășim caziere.ro și egalăm practic cazierjudiciaronline.com. Toate orașele cu date IPJ reale verificate + conținut ~2.500 cuvinte. (Update 2026-06-21.)

**Calculatoare:** 12 live (vezi `calculator-formulas-2026.md`).

---

## 🔜 De făcut (roadmap spre lansare)

### 1. Acoperire orașe (decizie de scope deschisă)
- Opțiuni: (a) închidem gap-ul caziere.ro — Craiova/Sibiu/Oradea/Arad (+ București special); (b) top 10; (c) toate 39.
- Fiecare oraș = un obiect în `cities.ts` cu **date IPJ reale** (cercetare per oraș, anti-thin). Conținutul apare automat.
- **București** = pagină dedicată cu model „oricare secție" (n-are ghișeu unic).

### 2. Calculatoare (migrare din WP) — BATCH 3 în REBUILD-QUEUE
- **NU sunt construite** (nu există `/calculator/`). Volume uriașe: impozit-auto 434k, vârstă-pensionare 111k, salariu 104k...
- 11 calculatoare de construit one-by-one, cu verificarea formulelor (rate 2026):
  impozit-auto, varsta-pensionare, salariu (net/brut, CAS 25/CASS 10/impozit 10), pensie-invaliditate,
  indemnizatie-crestere-copil, tva, termene-judiciare, calculator-procente, reabilitare, taxa-judiciara-de-timbru.
- La fiecare construit: re-adaugă slug-ul în `HARDCODED_CALCULATOR_SLUGS` (sitemap).

### 3. Ghiduri stare civilă — extindere conținut (opțional)
- Acum ~900-1.300 cuvinte; pot fi duse la ~2.500 ca paginile pe orașe.

### 4. Keyword research rămas
- Celibat (lipsește export Semrush) → apoi cluster celibat ca naștere/căsătorie.
- Căsătorie: pagină model/PDF gata; rămâne „cu mențiune de divorț".

---

## Note de disciplină (nu schimba)
- Anti-thin: niciun oraș fără date IPJ reale (quality gate blochează build-ul).
- Schema location: `Organization+Service(areaServed:City)`, **fără LocalBusiness**, fără FAQPage (convenția proiectului).
- Rollout orașe în batch-uri + validare GSC (>60% indexare) înainte de scalare. NU bulk.
- Sitemap: doar pagini care există (fără 404-uri).
