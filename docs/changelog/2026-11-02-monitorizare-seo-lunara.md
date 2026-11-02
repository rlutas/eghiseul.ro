# 02.11.2026 — Monitorizare SEO lunară pe cele 4 site-uri
<!-- categorie: seo -->

## Pentru echipă

- O dată pe lună iese un raport cu ce a urcat și ce a coborât în Google pe eghiseul, documentero, CazierJudiciarOnline și ecazier: clicuri, afișări, poziție, față de luna trecută.
- Raportul arată și „Semnale”: căutări sau pagini care au pierdut mult. Acolo ne uităm întâi.
- Pozițiile concurenților (infocazier și ceilalți) se completează de mână: raportul are lista de linkuri Google de deschis într-o fereastră privată și un tabel de completat.
- Primul raport (noiembrie) e punctul de plecare. CazierJudiciarOnline a scăzut pe zi cu aproape jumătate față de a doua jumătate a lui septembrie; eGhiseul −28%, în principal pe calculatoare.
- Nu trebuie să faceți nimic altceva; raportul îl rulează Raul sau Claude.

---

## Tehnic

- `scripts/seo/monitor-lunar.py`: GSC Search Analytics prin contul de serviciu `claude-seo` (credențiale în `~/.config/claude-seo/`, neafișate), ultimele 28 de zile (sfârșit = azi − 3) vs 28 anterioare, pe `https://eghiseul.ro/`, `sc-domain:documentero.ro`, `sc-domain:cazierjudiciaronline.com`, `sc-domain:ecazier.ro`.
- 22 de interogări urmărite (potrivire exactă cu regex RE2 tolerant la diacritice și la „de”), 5 clustere, pagini-cheie per site, top 10 interogări/pagini după Δ clicuri + top 5 pagini per site, zile cu date per perioadă (comparația pe zi când istoricul e scurt).
- Ieșire: `docs/seo/monitorizare/YYYY-MM.md` + `.csv`; refuză suprascrierea fără `--force` (secțiunea de concurenți e completată de mână).
- Concurenți: SERP-ul nu se scoate automat (ToS Google); tabel cu linkuri `pws=0&gl=ro&hl=ro` + Ads Transparency pentru advertiserul infocazier `AR04106916843048927233`.
- Rulare: `~/.claude/skills/seo/.venv/bin/python -I scripts/seo/monitor-lunar.py`. Praguri și procedură: `docs/seo/monitorizare/README.md`.
- Baseline: `docs/seo/monitorizare/2026-11.md` (03.10–30.10 vs 05.09–02.10).
