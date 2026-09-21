# 21.09.2026 — Chatbotul din Ghid („Întreabă ghidul”) + raportarea problemelor către Raul
<!-- categorie: admin -->

## Pentru echipă

În **Ghid & noutăți** aveți o casetă nouă, **„Întreabă ghidul”**: scrieți
întrebarea ca unui coleg („ce fac cu o comandă în Așteptare plată?”, „cât
durează certificatul de naștere la București?”) și primiți răspunsul din
procedurile scrise, cu link la pagina din ghid. Nu inventează și nu vede
comenzile; când ceva nu e documentat, spune și trimite întrebarea la Raul.

Butonul **„Raportează o problemă”** (sau „Nu m-a ajutat” sub un răspuns)
trimite lui Raul ce nu merge sau ce lipsește, cu numărul comenzii dacă e
cazul. Le vede grupate pe Nou / În lucru / Rezolvat și le închide după ce
repară. Scrieți concret: ce ați apăsat, ce vă așteptați, ce s-a întâmplat.

Mircea are aceleași două lucruri în meniul **Ghid** din portalul lui, doar
peste ghidurile care îl privesc.

Până Raul pune cheia de acces pe server, chatul arată „nu este configurat”;
raportarea merge de acum. Ghidul complet: [Chatbotul din Ghid și raportarea
problemelor](../admin/chatbot-si-raportare.md).

---

## Ce s-a livrat (pasul 3 din planul „chatbot intern”)

**DB (migrarea 184, aplicată):** `knowledge_chat_log` (întrebare, răspuns,
surse, `documented`, tokeni, eroare) și `knowledge_reports` (`kind`
problema|sugestie|intrebare-fara-raspuns, `status` nou|in_lucru|rezolvat,
`context` {page, question, answer, orderNumber}, rezolvare). RLS activ,
fără politici → doar service role.

**Chat (`src/lib/knowledge/chat.ts` + `chat-context.ts`):** Claude Sonnet 5 (Raul: Opus prea scump) prin
`@anthropic-ai/sdk` 0.127 (`messages.parse` + `zodOutputFormat`, effort
`medium`, `max_tokens` 4000). Nucleu cached 1h (`CORE_DOCS`: catalog A→Z,
statusuri, pagina comenzii; la colaborator fișele lui) + până la 6 documente
din căutarea lexicală (`retrievedDocs`, 14k caractere fiecare) + ultimele 6
replici. `documented=false` → raport automat `intrebare-fara-raspuns`.
Fără `ANTHROPIC_API_KEY` ruta răspunde 503 cu mesaj de configurare.

**Rute:** `POST /api/admin/knowledge/chat`, `POST /api/collaborator/knowledge/chat`,
`POST|GET /api/admin/knowledge/reports`, `POST /api/collaborator/knowledge/reports`,
`PATCH /api/admin/knowledge/reports/[id]` (`settings.manage`). Auth comun în
`request-auth.ts` (admin: `requireAdmin`; colaborator: `resolveCollaboratorContext`,
deci previzualizarea `?as=` merge). Detalii: `docs/technical/api/knowledge-api.md`.

**UI:** `GhidChat` (`src/components/knowledge/ghid-chat.tsx`) în `/admin/ghid`
și `/colaborator/ghid`; pagina `/admin/ghid/rapoarte` (grupare pe status,
`ReportActions`: În lucru / Rezolvat cu notă / Redeschide); link „Rapoarte
din Ghid · N deschise” în cardul de versiune.

**Docs:** `docs/admin/chatbot-si-raportare.md` (curated), API doc,
`ANTHROPIC_API_KEY` în `.env.example` + regula de mediu; fișele corectate
după Raul (avocata depune fizic fiscal, judiciar PF/PJ, integritate și toate
certificatele de stare civilă; „Verificare de expert” nu mai există ca
serviciu, dar e încă opțiune activă în DB pe 6 servicii: de dezactivat).

**Teste:** `chat-context.test.ts` (8); suita completă verde; `tsc` + `eslint`
curate. **Verificat live (21.09, cheie locală):** 3 întrebări (așteptare plată,
cazier auto cu permis străin, „nu găsesc imobilul” ca topograf) → răspunsuri
corecte cu sursa potrivită, 5–9 s, ~3k tokeni de intrare + nucleul din cache
(11k tokeni citiți din cache la a doua întrebare).
