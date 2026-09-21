# Knowledge Center API (Ghid & noutăți): căutare, chatbot, rapoarte

Rutele din spatele `/admin/ghid` și `/colaborator/ghid`. Toate cer sesiune
Supabase; admin = orice rol de admin (`requireAdmin`), colaborator = rol
`collaborator` sau previzualizare de admin cu `?as=<collaboratorId>`.
Răspuns standard `{ success, data?, error? }`.

| Metodă | Rută | Cine | Ce face |
|---|---|---|---|
| GET | `/api/admin/knowledge/search?q=&scope=team\|all` | admin | căutare full-text; implicit pe corpusul echipei (`admin/`, `changelog/`, `registru-central/`) |
| GET | `/api/admin/knowledge/feed` | admin | livrările recente (badge în meniu) |
| GET | `/api/collaborator/knowledge/search?q=` | colaborator | căutare doar în documentele marcate `<!-- audienta: colaborator -->` |
| POST | `/api/admin/knowledge/chat` `{ question, history? }` | admin | chatbot peste corpusul echipei, răspuns **NDJSON în streaming** (`{"t":"delta","text"}`… apoi `{"t":"done","result"}` sau `{"t":"error","message"}`); 503 fără `ANTHROPIC_API_KEY` |
| POST | `/api/collaborator/knowledge/chat` | colaborator | idem, doar peste documentele marcate `<!-- audienta: colaborator -->` |
| POST | `/api/admin/knowledge/reports` `{ kind, message, context? }` | admin | raport (problemă / sugestie) |
| POST | `/api/collaborator/knowledge/reports` | colaborator | idem |
| GET | `/api/admin/knowledge/reports` | admin | lista rapoartelor |
| PATCH | `/api/admin/knowledge/reports/[id]` `{ status, note? }` | `settings.manage` | nou → in_lucru → rezolvat |

## Chat: cum se construiește răspunsul (`src/lib/knowledge/chat.ts`)

- Model `claude-sonnet-5` (decizie Raul 21.09: Opus e prea scump pentru
  întrebări de procedură), `client.messages.stream`, `thinking: disabled`,
  `effort: low`, `max_tokens` 1500. Răspunsul e text + subsol fix
  (`SURSE:`, `DOCUMENTAT:`, `DE_DOCUMENTAT:`) parsat de `parseAnswerFooter`;
  subsolul nu ajunge la client. Măsurat: 2,9–6,8 s total, primul text < 1 s.
  Latența e în generare (300–470 tokeni), nu în thinking (testat: dezactivat,
  aceiași timpi fără streaming).
- System prompt = reguli + **nucleul** (`CORE_DOCS` din `chat-context.ts`:
  catalog A→Z, statusuri, pagina comenzii; pentru colaborator fișele lui) cu
  `cache_control` de 1 oră.
- Mesajul utilizatorului = până la 6 documente găsite de căutarea lexicală
  din Ghid (`retrievedDocs`, tăiate la 14k caractere) + întrebarea; istoricul
  ultimelor 6 replici.
- Fiecare întrebare se loghează în `knowledge_chat_log` (tokeni, cache,
  `documented`); `documented=false` inserează automat un raport
  `intrebare-fara-raspuns` în `knowledge_reports`.
- Fără fallback la refuz (`fallbacks`): întrebările sunt de procedură internă,
  refuzul e improbabil; de adăugat dacă apare în log.

## Tabele (migrarea 184)

`knowledge_chat_log`, `knowledge_reports`: RLS activ, **fără politici** → doar
service role (rutele de mai sus). Statusuri raport: `nou`, `in_lucru`,
`rezolvat`; tipuri: `problema`, `sugestie`, `intrebare-fara-raspuns`.
