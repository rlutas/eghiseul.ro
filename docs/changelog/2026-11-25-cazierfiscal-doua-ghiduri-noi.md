# 25.11.2026 — cazierfiscal.com: două ghiduri noi publicate
<!-- categorie: seo -->

## Pentru echipă

Pe cazierfiscal.com au apărut două ghiduri noi:

- **Valabilitate și conținut**: cât e valabil certificatul (30 de zile, doar pentru scopul cerut), ce fapte ajung în cazier și după cât timp se șterg.
- **Pentru administrator, firmă sau PFA**: când îl verifică singur Registrul Comerțului, când îl aduce clientul și cum îl blochează o firmă inactivă.

Dacă un client întreabă „cât e valabil cazierul fiscal” sau „îmi trebuie pentru SRL?”, îi puteți trimite linkul la ghidul potrivit. Pentru voi nu se schimbă nimic în comenzi. Al cincilea ghid (cazier fiscal sau certificat fiscal) iese pe 01.12.

---

## Ce s-a făcut

- `src/config/cazierfiscal-nav.ts`: `published: true` pe `/ghiduri/valabilitate-cazier-fiscal/` și `/ghiduri/cazier-fiscal-administrator-pfa/`, `updated` = 2026-11-25. Ghidurile intră automat în meniu, hub, footer, sitemap, llms.txt și „Citește și”.
- În pagini: `PUBLISHED`/`UPDATED` = 2026-11-25 (data reală a publicării, nu data planificată, conform regulii 3 din content-and-seo).
- Faptele recitite pe 25.11 pe textul consolidat al OG 39/2015 (legislatie.just.ro, cu modificarea din Legea 179/2025 la art. 6 lit. h): art. 4 alin. 1–7 și 12, art. 6 alin. 1–3, art. 7, art. 8 alin. 1–5, art. 9 alin. 2, 5, 7, art. 10–11. Totul corespunde. Două formulări strânse:
  - art. 6 alin. 1 lit. d: „amendă penală” → „amendă penală sau avertisment”, cum scrie legea;
  - art. 8 alin. 4: „nu ai cod fiscal în România” → „nu ești înregistrat fiscal în România”, termenul din lege.
- Linkul din ghidul de administrator spre ghidul de valabilitate devine activ (`GuideLink`). Linkul spre ghidul din 01.12 rămâne text până la publicarea acestuia.
- Ritm: 2 pagini noi în săptămâna 24–30.11, în limita de 1–2 pe săptămână (content-and-seo, regula 2). Ghidul planificat pe 17.11 a întârziat o săptămână.
- După deploy: IndexNow pe cele două URL-uri (cronul zilnic le-ar fi prins oricum din sitemap).
