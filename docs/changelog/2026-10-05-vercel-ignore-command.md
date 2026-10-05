# 05.10.2026 — Deploy-ul nu mai sare codul când ultimul commit e de documentație
<!-- categorie: infrastructura -->

## Pentru echipă

- Uneori modificările de pe site nu ajungeau live, deși erau trimise: Vercel anula build-ul dacă ultima modificare din grup era doar de documentație.
- De azi, Vercel compară cu ultima versiune publicată cu succes, deci nu mai pierde codul din mijloc.

---

## Rezumat tehnic

`vercel.json` → `ignoreCommand`: `git diff HEAD^ HEAD` → `git diff ${VERCEL_GIT_PREVIOUS_SHA:-HEAD^} HEAD` (aceleași excluderi: `docs`, `*.md`, `supabase/migrations`, `.claude`). `VERCEL_GIT_PREVIOUS_SHA` = SHA-ul ultimului deploy reușit. Dacă lipsește din clona superficială, `git diff` dă eroare, adică exit diferit de 0, deci build-ul pornește (mod sigur). Declanșator: 05.10, merge-ul `ff944323` (linkuri spre ecazier) cu un commit de docs deasupra, care a dat „Canceled” pe producție; memoria `vercel-ignore-command-multi-commit-push`.
