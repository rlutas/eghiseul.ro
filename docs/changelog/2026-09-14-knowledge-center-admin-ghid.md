# 14.09.2026 — Knowledge Center în admin: „Ghid & noutăți”
<!-- categorie: admin -->

## Pentru echipă

În meniul din admin ai acum **„Ghid & noutăți”** (`/admin/ghid`). Acolo vezi:

- **Ce s-a livrat**, pe zile: fiecare funcție nouă, reparație sau schimbare,
  cu un rezumat în limbajul nostru și, la „Detalii”, documentul complet.
- **Versiunea platformei**: numărul livrării, data ultimei livrări și build-ul
  care rulează acum în producție.
- **Procedurile de lucru**: plata prin transfer bancar, comenzile telefonice,
  ajutarea clientului blocat, modificarea unei comenzi plătite, storno,
  registrul Barou, roluri.

Când apare ceva nou, itemul din meniu primește un **badge cu numărul de livrări
pe care nu le-ai văzut**. Dispare când deschizi pagina. Nu mai trebuie să
aștepți mesaj pe WhatsApp la fiecare schimbare: intri acolo și citești.

**Căutare** în toată documentația (peste 500 de documente), din caseta de sus:
scrii „transfer bancar”, „AWB”, „storno”, „ONRC” și primești documentele cu
fragmentul în care apare cuvântul. Merge și fără diacritice („asteptare plata”
găsește „Așteptare plată”). Linkul cu căutarea se poate trimite unui coleg.

**Pe categorii**: deasupra listei ai filtre — Plăți & facturare, Livrare &
curieri, Documente & Barou, Automatizări ONRC/ANCPI/topograf, Clienți & email,
SEO & site, Comenzi & wizard, Admin & echipă, Infrastructură. Un click și vezi
tot istoricul acelei categorii, nu doar ultimele livrări. Procedurile din
dreapta sunt grupate la fel.

**Toată documentația**, pe foldere, în coloana din dreapta: changelog,
proceduri admin, specificații tehnice, SEO, reclame, deploy, securitate. Orice
folder se deschide și listează fișierele din el.

---

**Cerere (Raul):** „să documentezi tot și în admin să avem knowledge center cu
tot ce facem, toate feature-urile și îmbunătățirile, să poată echipa să verifice
acolo tot”, în loc de mesaje pe WhatsApp la fiecare livrare.

## Ce s-a livrat

### Sursa unică rămâne `docs/`

Nu există un al doilea loc de scris. Pagina citește la runtime:

- `docs/changelog/README.md` (tabelul de livrări) + fișierele detaliate din
  `docs/changelog/*.md`;
- `docs/admin/*.md`, `docs/admin/*/README.md`, `docs/registru-central/README.md`
  (procedurile).

Orice document din `docs/` se poate deschide la `/admin/ghid/<cale>/` (ex.
`/admin/ghid/admin/plata-transfer-bancar/`). Linkurile relative dintre
documente sunt rescrise ca să rămână în admin; fișierele non-markdown (png, csv)
rămân text simplu.

### Convenție nouă: `## Pentru echipă`

Fiecare intrare de changelog începe de acum cu o secțiune **`## Pentru
echipă`**, în limbaj de operator (ce se schimbă pentru mine, ce apăs, ce nu mai
fac). Cardul din Knowledge Center o arată pe ea; rezumatul tehnic din tabel
stă pliat sub „Rezumat tehnic”. Intrările vechi fără secțiune arată rezumatul
tehnic direct. Regula e în `.claude/rules/documentation.md`.

### Versiunea platformei

Nu ținem un număr de mână: `v<număr livrări din changelog> · <data ultimei
livrări>` (azi `v137 · 14.09.2026`), plus `VERCEL_GIT_COMMIT_SHA` și mesajul
commitului deployat, plus momentul build-ului (`NEXT_PUBLIC_BUILD_TIME`, setat
în `next.config.ts`).

### Categorii de business

`src/lib/knowledge/categories.ts` (pur, 10 teste): 9 categorii cu
cuvinte-cheie normalizate; scor = potriviri în tot textul + potriviri în
primele 120 de caractere (titlul cântărește dublu); la egalitate câștigă
ordinea din listă (plăți înaintea comenzilor — „comandă" e peste tot, semnal
slab). Override explicit: `<!-- categorie: plati -->` sub H1 în fișierul
detaliat (invizibil la randare). Pagina: chip-uri cu număr de livrări, `?cat=`
filtrează pe TOT jurnalul (până la 200), ghidurile curatoriate grupate pe
categorie. Regula de scriere: `.claude/rules/documentation.md` + secțiune nouă
în `CLAUDE.md`.

### Căutare full-text pe tot `docs/`

`GET /api/admin/knowledge/search?q=` — index în memorie peste toate fișierele
markdown din `docs/` (fără `EXPORT/`, `SCREAMINGFROG/`), construit o dată per
instanță (`loadSearchIndex`, ~7 MB). Text normalizat fără diacritice pe ambele
părți (comma-below și cedilla legacy → litera de bază), toate cuvintele
obligatorii, scor: titlu 50 + apariții (max 20) + bonus 5 pe `admin/` și
`changelog/`. Fragmentul e din textul original, HTML escapat, termenii în
`<mark>`, aliniat prin avans paralel original/normalizat (NFD schimbă
lungimea). Pur în `src/lib/knowledge/search.ts` (9 teste); UI client în
`src/app/admin/ghid/search.tsx` cu debounce 250 ms și `?q=` în URL.

### Navigare pe foldere

Coloana „Toată documentația" arată folderele de nivel 1 cu numărul de
documente. Viewerul, când calea e un folder, randează README-ul (dacă există)
și sub el fișierele și subfolderele (`listDirectory`); fișierele datate ies
cele mai noi primele. Breadcrumb clicabil pe fiecare segment.

### Badge „noutăți” în meniu

`GET /api/admin/knowledge/feed` întoarce datele ultimelor livrări; itemul din
meniu numără intrările mai noi decât data reținută în `localStorage` la ultima
vizită (fără vizită: livrările din ultimele 14 zile). Doar per browser, nu pe
server.

### Tehnic

- `src/lib/knowledge/parse.ts` — pur: parser tabel changelog (tolerant la
  rândurile strâmbe din istoric: spațiu înainte de `|`, dată lipsă din prima
  coloană, `commit \`abc\`` în loc de link, `|` în cod inline), extragere
  secțiune/titlu, normalizare slug (fără `..`), rescriere linkuri, versiune.
  18 teste.
- `src/lib/knowledge/docs.ts` — citire `docs/` (`fs`), ghiduri curatoriate.
- `src/lib/knowledge/render.ts` — `marked` (dependență nouă) cu rescrierea
  linkurilor; conținutul e al nostru, nu se sanitizează.
- `src/app/admin/ghid/page.tsx`, `src/app/admin/ghid/[...slug]/page.tsx` —
  server components, `requireAdmin` + middleware-ul existent pe `/admin`.
- `next.config.ts` — `outputFileTracingIncludes` cu `docs/**/*.md` (~7 MB) pe
  cele trei rute; fără el, Vercel nu împachetează `docs/` în funcție și totul
  dă 404 în producție deși merge local.
- Smoke test pe `docs/` real (`tests/unit/lib/knowledge/docs-smoke.test.ts`):
  changelog parsabil, ghiduri curatoriate existente, linkuri rescrise.

## Rămâne

- Intrările vechi nu au `## Pentru echipă`; se adaugă când se atinge fișierul.
