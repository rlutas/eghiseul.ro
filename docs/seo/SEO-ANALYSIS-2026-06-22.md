# Analiză SEO eghiseul.ro — ce rankează, ce merge, ce îmbunătățim (2026-06-22)

Bazat pe datele GSC (`gsc-data/.../2026-06-13`). **Context:** trafic-ul e pe site-ul WordPress live; rebuild-ul Next.js (Vercel) se pregătește de cutover. Scop: la go-live să **păstrăm rankingurile + urcăm underperformerii**.

## 0. Imaginea de ansamblu
- **~1,45M clickuri** / **27M impresii** total. Poziție medie 5,4 · CTR 5,4%.
- **Mobile = 83% din clickuri** (1,2M, CTR 6,57%, poz 5,04) vs desktop (247k, CTR 2,92%, poz 7,21). → **Mobile-first e obligatoriu**; performanța + snippet-ul pe mobil contează cel mai mult.
- **Diaspora semnificativă:** Germania 13,6k, Italia 10,8k, UK 10,7k, Spania 6,2k, Franța 4,7k. → conținut „din străinătate" (apostilă, cazier pt emigrare, transcriere, celibat pt căsătorie în străinătate) e valoros.

## 1. Ce RANKEAZĂ acum (top pagini, clickuri)
| Pagină | Clickuri | Impresii | CTR | Poz |
|---|---|---|---|---|
| calculator-impozit-auto | **443k** | 2,48M | 17,9% | 5,9 |
| verificare-rovinieta-online | **294k** | 4,13M | 7,1% | 6,0 |
| varsta-pensionare | 111k | 1,67M | 6,7% | 5,4 |
| salariu | 110k | **5,70M** | 1,9% | 5,1 |
| tabel-varsta-pensionare-anticipata-femei | 80k | 1,76M | 4,6% | 6,0 |
| pensie-invaliditate | 66k | 1,08M | 6,1% | 6,0 |
| indemnizatie-crestere-copil | 56k | 748k | 7,5% | 6,2 |
| homepage | 48k | 2,23M | 2,2% | 6,6 |

→ **Calculatoarele sunt motorul absolut.** „impozit auto 2026" domină (poz 1,68, CTR 47%). Pensii + salariu = volum uriaș.

## 2. Ce MERGE BINE (de păstrat la cutover cu orice preț)
- **calculator-impozit-auto** — poz 1,6 pe „impozit auto 2026" (116k cl), CTR 47-55%. **Cash cow.**
- **verificare rovinietă** — poz 3,3 pe „verificare rovinieta" (143k cl). Juggernaut.
- **calculator pensie invaliditate** — poz 2,66, CTR 51%.
- **calcul vârstă pensionare legea nouă** — poz 2,42 (21k cl).
- **certificat de integritate comportamentală** — poz 3,37, CTR 5,1% (58k imp).

## 3. Ce NU MERGE / OPORTUNITĂȚI (impresii mari, poziție/CTR mic)
🥇 **#1 — Calculatorul de salariu** (cea mai mare oportunitate nerealizată):
- „calculator salariu net" — **1,16M impresii, poz 4,16, CTR 1,69%**. + „calculator salariu" (588k imp), „calcul salariu net" (404k), „calculator salarii" (191k poz 3,28), „salariu brut" (161k). **Total ~2,5M+ impresii blocate la poz 4-5.** Urcarea în top 3 + titlu mai bun = **potențial +200-400k clickuri**.

Alte striking-distance (poz 4-12, impresii mari, CTR slab):
| Query | Impresii | Poz | CTR | Pagina |
|---|---|---|---|---|
| calculator tva | 174k | 4,4 | 1,6% | /calculator/tva/ |
| cazier judiciar online | 214k | 6,6 | 2,9% | hub cazier |
| extras (de) carte funciara | ~198k | 6,5 | ~0,9% | hub CF + 42 județe (noi) |
| certificat constatator online | 103k | 7,7 | 0,75% | hub ONRC + 4 use-case (noi) |
| rovinieta online | 130k | **10,2** | 0,6% | /servicii/rovinieta-online/ (nou) |
| cartea funciară | 109k | 4,6 | **0,1%** | CF — CTR catastrofal |

→ **Pattern cheie:** multe pagini rankează decent (poz 4-7) dar au **CTR mic** = **titlu/meta/snippet slab** sau lipsă rich snippet. Cel mai ieftin câștig = optimizare title + schema (FAQ/breadcrumb).

## 4. Brand „ghiseul"
- Lume caută „ghiseul" / „ghiseul.ro plata impozit" (748k + 164k impresii) — caută **site-ul oficial de stat**. Rankăm adiacent (poz 4-5). **Atenție:** NU impersona ghiseul.ro (legal + disclaimer existent). Oportunitate = conținut de **dezambiguizare** („ghiseul.ro oficial vs eghiseul.ro serviciu privat") — captezi intenția fără să induci în eroare.

## 5. Priorități strategice pentru go-live
1. 🔴 **Migrare fără regres** — paginile care aduc 443k+294k+111k... clickuri TREBUIE să rămână pe ACELEAȘI URL-uri în Next (redirects + paritate). Un 404 pe `calculator-impozit-auto` la cutover = dezastru. (Audit go-live separat în curs.)
2. 🥇 **Atac pe salariu** — îmbunătățește calculatorul + titlul + snippet ca să urce din poz 4 → top 3. Cel mai mare ROI single.
3. 🎯 **CTR quick-wins** — rescrie title/description pe underperformeri (salariu, tva, cazier, carte funciară, constatator) + schema rich snippet. Câștig fără a urca poziția.
4. 📍 **Paginile noi** (42 CF județe, ONRC use-case, stare civilă) țintesc exact long-tail-ul din clusterele de la poz 6-8 → ajută hub-urile să urce. Validare indexare GSC la ~3-4 săpt.
5. 📱 **Mobile + CWV** — 83% mobil; performanța paginilor grele de calculator pe mobil = direct ranking + CTR.
6. 🌍 **Diaspora** — clusterele „din străinătate" (apostilă, transcriere, cazier emigrare, celibat) deja construite parțial → de extins.

## 6. Plan de acțiune go-live (din audit — paritate 38/40 top earners OK)

### ✅ REZOLVAT (2026-06-22)
- 🔴 **3 ship-blockers sitemap:** scos `verificare-rovinieta-online` (redirecta) + `extras-multilingv-{nastere,casatorie}` (404) din `HARDCODED_SERVICE_SLUGS` → 301 redirects în next.config + linkuri interne moarte scoase.
- 🔴 **Pagina `/contact/`** construită (era în sitemap dar 404; WP `/contact` ranka 2.374 cl) — schema ContactPage + disclaimer brand.
- 🎯 **Titluri CTR** rescrise pe underperformeri: salariu, tva, pensie-invaliditate, carte-funciară, cazier-judiciar, certificat-constatator + homepage (brand „eGhișeul.ro" în față pt intenția „ghiseul"). Toate ≤62 char, cu an + gratuit/preț.

### ⏳ RĂMAS (înainte/la cutover)
1. **CWV/Lighthouse** pe `/calculator/salariu/` + `/calculator/calculator-impozit-auto/` (≈750k cl combinate) pe preview Vercel — target INP <200ms. Cel mai mare risc de regres.
2. **Internal linking** către paginile de serviciu de la poz 8-10 (extras-carte-funciară, certificat-constatator, cazier-judiciar) din articolele cu trafic + homepage → urcă poziția (au deja schema + content; lipsește autoritate/linking).
3. **Ziua cutover:** păstrează același domeniu (trailing-slash identic), submit `sitemap.xml` în GSC, request indexing pe cele 7 pagini cu titlu schimbat, monitorizează Coverage „404" + pozițiile top-10 timp de 2 săpt.
4. **Conținut (opțional):** construiește pagini dedicate `extras-multilingv-{nastere,casatorie}` (rankau pe WP, acum redirect) ca să recuperezi cele ~1.700 clickuri.
5. **Brand „ghiseul":** secțiune de dezambiguizare pe homepage („cauți să plătești impozite? acela e portalul oficial; noi îți obținem documentele") — captează intenția onest, NU impersona.

**Ultima actualizare:** 2026-06-22 · sursă GSC: export 2026-06-13.
