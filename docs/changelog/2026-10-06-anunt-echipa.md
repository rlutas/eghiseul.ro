# 06.10.2026 — Anunțuri fixate în Ghid + procedura de recuperare telefonică
<!-- categorie: admin -->

## Pentru echipă

- Sus în **Ghid** apare acum un **anunț** pe fundal galben cu ce s-a schimbat și ce aveți de făcut. După ce îl citiți, apăsați **„Am citit”** și se strânge într-un rând; îl puteți redeschide oricând.
- Primul anunț: **sunați zilnic coada de recuperare**, pe eGhiseul și acum și pe CazierJudiciarOnline, plus ce emailuri primesc clienții CJO, facturile din Decontări și ce le spunem clienților despre extrasul multilingv, cazierul fiscal și planul de amplasament.
- Procedură nouă în Ghid: **„Recuperare telefonică: sunăm zilnic clienții care n-au plătit”**, pas cu pas.

---

- `loadAnnouncements()` in `src/lib/knowledge/docs.ts`: newest file(s) from `docs/admin/anunturi/YYYY-MM-DD-<slug>.md`; title from H1, date from the filename. Under `admin/`, so already in search and the chatbot team corpus.
- `src/app/(eghiseul)/admin/ghid/announcement.tsx`: pinned block on `/admin/ghid` (above the ask box), body rendered with `renderMarkdown` without the H1; „Am citit” stored per browser in `localStorage` (`eghiseul_ghid_anunt_citit_<id>`, try/catch; blocked storage keeps it open).
- New docs: `docs/admin/anunturi/2026-10-06-ce-s-a-schimbat.md`, `docs/admin/recuperare-telefonica.md` (added first in `CURATED_GUIDES`).
- To publish a new announcement: add a dated file in `docs/admin/anunturi/`; the newest one replaces the pinned block.
