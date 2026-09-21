# 21.09.2026 — Fișele serviciilor A→Z pentru echipă + căutarea stă pe ghidurile echipei + ghid în portalul topografului
<!-- categorie: admin -->

## Pentru echipă

În **Ghid & noutăți** aveți de azi, sus la „Proceduri pentru echipă”, trei
pagini noi și șase fișe:

- **„Serviciile noastre A→Z”**: toate cele 31 de servicii într-un tabel (preț,
  termen, urgență, dacă cere act + selfie, dacă trece prin avocată) și cine
  lucrează ce. De acolo intrați în fișa fiecărei familii: caziere și
  certificat de integritate, acte de stare civilă (și documentero.ro),
  certificat constatator, extras de carte funciară, serviciile prin topograf,
  opțiunile suplimentare (traducere pe limbă, apostile, urgență).
- **„Statusurile comenzii”**: cele trei cozi de verificat zilnic, fiecare
  status cu tabul lui, cine îl pune, ce vede clientul și ce apăsați mai
  departe.
- **„Pagina comenzii”**: card cu card, ce face fiecare buton.

Căutarea din Ghid caută acum **doar în ghidurile echipei și în noutăți**, nu
și în documentația tehnică (care dădea 30 de rezultate irelevante la „AWB”).
Dacă vreți totuși tot, bifați „Caută și în documentația tehnică”.

Mircea are în portalul lui un meniu nou, **„Ghid”**, cu fișele care îl privesc
(serviciile prin topograf, extrasul CF, identificarea nereușită). Nu are
acces la admin, deci era singurul care nu putea citi procedurile.

Fișele sunt scrise din ce e în platformă azi. Dacă vedeți ceva care nu se
potrivește cu ce faceți voi, spuneți: pagina se corectează, nu procedura.

---

## Context

Pasul 1 și 2 din planul „chatbot intern pentru echipă și colaboratori” (pasul
3 = chatbotul, peste corpusul de aici). Auditul de dinainte: 31 de servicii
active în DB, 10 cu folder în `docs/services/` (dev/SEO, prețuri din
23.06.2026, integritate la „250 RON” când e 198 în DB), 12 ghiduri curatoriate,
190 changelog-uri, căutare peste 583 de fișiere `.md` inclusiv arhivă și
jurnale de sesiune.

## Ce s-a livrat

**Docs (9 fișiere noi în `docs/admin/`)**, scrise din DB (`services`,
`service_options`, `admin_settings`), din codul admin (`status-options.ts`,
`orders-tabs.ts`, `customer-status.ts`, pagina comenzii) și din changelog:

- `admin/servicii/README.md` — catalog A→Z + cine lucrează ce + ce se întâmplă automat
- `admin/servicii/caziere-si-integritate.md`, `stare-civila.md`, `certificat-constatator.md`, `extras-carte-funciara.md`, `imobiliare-topograf.md`, `optiuni-suplimentare.md`
- `admin/statusuri-comenzi.md`, `admin/pagina-comenzii.md`

**Corpusul echipei** (`src/lib/knowledge/corpus.ts`): `TEAM_CORPUS_PREFIXES =
admin/, changelog/, registru-central/`; `searchDocs(q, limit, scope)` cu
`scope = team | all | collaborator`; API `GET /api/admin/knowledge/search?scope=all`
(implicit `team`); bifă în `GhidSearch` (+ `?scope=all` în URL).
`loadAllTeamDocs()` include `admin/servicii/`. Chatbotul (pasul 3) va citi
`filterCorpus(index, 'team')`.

**Audiență**: marker `<!-- audienta: colaborator -->` în capul documentului
(`explicitAudience`, `isCollaboratorDoc`). Pagini noi `/colaborator/ghid` +
`/colaborator/ghid/[...slug]` (gardă server `requireCollaboratorOrAdmin`,
doar documentele marcate; linkurile rescrise cu `renderMarkdown(md, path,
'/colaborator/ghid')`). Link „Ghid” în meniul portalului. Marcate: cele două
fișe imobiliare + `identificare-imobil-nereusita.md`.

**Curated**: 3 intrări noi în `CURATED_GUIDES`.

**Teste**: `tests/unit/lib/knowledge/corpus.test.ts` (8) + 3 smoke-uri noi în
`docs-smoke.test.ts` (căutarea implicită nu întoarce `technical/`, fișele
sunt listate o singură dată, colaboratorul nu poate deschide
`plata-transfer-bancar`). 55/55 verzi, `tsc` și `eslint` curate.

## Ce rămâne

- Pasul 3: chatbotul în `/admin/ghid` (+ `/colaborator/ghid`), Claude cu
  corpusul echipei în system prompt (prompt caching), răspuns cu citare la
  ghid; întrebările fără răspuns = lista de goluri din docs.
- `docs/services/*` rămân fișe dev/SEO; prețurile de acolo sunt vechi (banner
  adăugat în `docs/services/README.md`).
