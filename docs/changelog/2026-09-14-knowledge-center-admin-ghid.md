# 14.09.2026 — Knowledge Center în admin: „Ghid & noutăți”

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
- Căutare în ghid (nu există încă; lista e scurtă).
