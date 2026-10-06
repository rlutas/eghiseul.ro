# 06.10.2026 — Curățenie în folderul de proiecte: tot ce s-a lucrat e pe live
<!-- categorie: infrastructura -->

## Pentru echipă

- Nu se schimbă nimic pentru voi: niciun buton, niciun ecran.
- Am verificat că tot ce s-a lucrat pe 05–06.10 pe eGhiseul, CazierJudiciarOnline și site-ul avocatei este publicat pe site-urile live. Nu a rămas nimic nepublicat.
- Pe calculatorul de lucru am șters copiile vechi ale proiectelor. Fiecare site are acum un singur folder.

---

## Ce s-a verificat

- `eghiseul.ro`, `cazierjudiciaronline.com`, `avocat-tarta-gabriela`: `main` = `origin/main`, fără commit-uri nepush-uite.
- Deploy: Vercel `success` pe HEAD (eghiseul `75ac9d2b`, CJO `c9dcc6b8`). Avocat (Netlify): modificarea din `eba5adc` se vede în pagina live.
- Verificat pe site-urile live: „Pe scurt” pe CJO și pe `/servicii/cazier-judiciar-online/`, „peste 470” recenzii pe CJO, ghidul PAD răspunde 200, robots cu roboții AI, `lastmod` 2026-10-06 în sitemap-urile celor 4 site-uri.

## Ce s-a curățat

- 23 de worktree-uri (`egh-wt-*`, `cjo-wt-*`, `avt-wt-cjolinks`, `cazierjudiciaronline.com-wt-winback`, plus cele din `.claude/worktrees/` în eghiseul și CJO). Înainte de ștergere: `git cherry origin/main` fără commit-uri lipsă și `status` curat. Au fost scoase cu `git worktree remove`, iar branch-urile cu `git branch -d`.
- Proiectele vecine:
  - angeloff-rebuild și rovinieta-online: 7 copii șterse, pentru că erau identice cu `main`, inclusiv `.env`.
  - 9 copii mutate cu `git worktree move` în `<repo>/.claude/worktrees/`, pentru că au `.env`/media proprii sau commit-uri nefinalizate.
  - angeloff-rebuild nu are remote.

## Regula de acum

Worktree-urile se fac doar în `<repo>/.claude/worktrees/<nume>`, nu ca foldere separate în `~/Projects`. După merge le ștergi cu `git worktree remove` + `git branch -d`.
