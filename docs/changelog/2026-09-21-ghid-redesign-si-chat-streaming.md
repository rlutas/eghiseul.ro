# 21.09.2026 — Ghid & noutăți refăcut: o singură casetă „caută sau întreabă”, răspuns care se scrie live, trei taburi
<!-- categorie: admin -->

## Pentru echipă

Pagina **Ghid & noutăți** e acum mai simplă:

- **O singură casetă sus**: cât scrieți, apar paginile din ghid care se
  potrivesc (click și ajungeți direct). Apăsați **Enter** sau „Întreabă” și
  chatbotul răspunde; **textul apare pe măsură ce se scrie**, nu mai
  așteptați 5–10 secunde cu ecranul gol. Sursele sunt sub răspuns, ca butoane.
- **Trei taburi**: „Proceduri” (ghidurile echipei, în grilă, plus ultimele 3
  noutăți), „Noutăți” (tot jurnalul, pe zile, cu filtre) și „Toată
  documentația” (folderele). Jurnalul nu mai stă în mijlocul paginii.
- „Raportează o problemă” e chiar sub casetă. „Rapoarte din Ghid” e sus, în
  dreapta, cu numărul celor deschise.

Răspunsurile sunt și mai scurte (cel mult 6 rânduri). Mircea are aceeași
casetă în „Ghid” din portalul lui.

---

## Tehnic

**Latența** nu venea din „gândire”: fără thinking și cu effort `low`,
timpii au rămas 4–9 s, pentru că Sonnet generează 300–470 de tokeni de
răspuns. Câștigul real: **streaming** + răspunsuri limitate la 6 rânduri.
Măsurat pe cele 3 întrebări de test: 2,9 / 4,8 / 6,8 s total, primul text
sub o secundă.

- `chat.ts`: `streamAnswer()` (generator async) cu `client.messages.stream`,
  `thinking: disabled`, `effort: low`, `max_tokens` 1500; fără structured
  outputs (zod scos): răspunsul e text + subsol fix `SURSE:` / `DOCUMENTAT:` /
  `DE_DOCUMENTAT:`, parsat de `parseAnswerFooter` (`chat-context.ts`, 5 teste
  noi); subsolul nu se trimite clientului (`safePrefixLength`).
- `chat-route.ts`: răspuns `application/x-ndjson`, un rând per eveniment
  (`delta` / `done` / `error`); logarea și raportul automat rămân server-side,
  la `done`.
- `GET /api/collaborator/knowledge/search` nou (căutare doar în ghidurile
  colaboratorului).
- `GhidAsk` (`src/components/knowledge/ghid-ask.tsx`) înlocuiește `GhidSearch`
  + `GhidChat`: căutare instant (200 ms debounce, 8 rezultate, bifa „și
  documentația tehnică” doar la echipă), Enter = chat, Markdown randat
  progresiv cu `marked` pe client, HTML-ul final de pe server; raportarea
  inline. Folosit în `/admin/ghid` și `/colaborator/ghid`.
- Pagina `/admin/ghid`: `?tab=proceduri|noutati|documentatie` (+ `?cat=` la
  noutăți), server-rendered, fără stare client. Cardul mare de versiune a
  devenit două rânduri în header.
