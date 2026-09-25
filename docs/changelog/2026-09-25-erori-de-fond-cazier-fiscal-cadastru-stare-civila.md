# 25.09.2026 — Erori de fond reparate: cazierul fiscal, taxa de cadastru, locul de unde se cere duplicatul
<!-- categorie: seo -->

## Pentru echipă

- **Cazierul fiscal NU arată datoriile la stat.** Site-ul spunea în mai multe locuri (pagina serviciului, întrebările de pe prima pagină, cardul de pe pagina cazierului judiciar, descrierea din catalog) că „atestă lipsa datoriilor”. E greșit: cazierul fiscal arată doar faptele sancționate de legile fiscale, contabile și vamale. Datoriile apar în alt document, certificatul de atestare fiscală. Dacă un client întreabă, asta îi spuneți.
- **ANAF nu percepe taxă pentru cazierul fiscal.** Pagina spunea „plătim taxa” și „taxa ANAF inclusă în preț”. Am scos formulările.
- **Prima înregistrare în cadastru nu mai are taxă ANCPI din 7 aprilie 2025.** Tabelul de tarife ANCPI din admin și din portalul colaboratorului arăta încă 120 lei, iar calculatorul de cadastru avea un exemplu de urgență la 600 lei. Acum apare 0 lei. Clientul plătește doar topograful.
- **Duplicatul de naștere sau de căsătorie se poate cere de la orice primărie sau serviciu de stare civilă din țară**, nu doar de la cea din localitatea de naștere sau căsătorie (regula din 2024). Paginile spuneau invers.
- Nu se schimbă nimic la comenzi sau prețuri. Sunt doar corecturi de text.

---

## Tehnic

Corecturi punctuale, făcute în fereastra September 2026 Spam Update (24.09 → ~08.10), fără schimbări de structură. Vezi `docs/seo/2026-09-recuperare-spam-update/2026-09-25-ce-spun-expertii-recuperare.md`.

- **Cazier fiscal:**
  - `servicii/cazier-fiscal-online/page.tsx`: meta description, JSON-LD `description`, hero, blocul „Ce atestă”, caseta de valabilitate (+ „numai în scopul pentru care a fost eliberat”, OG 39/2015 art. 9 alin. (7)), 4 întrebări FAQ, pasul de plată fără „taxa ANAF”; `DATE_MODIFIED` 2026-09-25.
  - `components/home/faq-data.tsx` și cardul din `servicii/cazier-judiciar-online/page.tsx`.
  - Migrarea `189_cazier_fiscal_descriere_corecta.sql`: `services.description` și `short_description` pentru `cazier-fiscal`. Au dispărut și „document oficial” și „33,000 comenzi … 4.9/5”, cifră fără sursă curentă (regula 3 din `content-and-seo.md`).
  - Sursa faptelor: ghidul `/cazier-fiscal-fara-spv/`, verificat pe OG 39/2015 în lotul 2A.
- **Cadastru:**
  - `lib/ancpi/tarife-oficiale.ts`: codurile 2.1.1–2.1.4 la 0 lei (Ordin ANCPI 441/2025), cu tariful vechi în notă. Tabelul e folosit în `/admin/tarife-ancpi` și `/colaborator/tarife`.
  - `calculator/cost-cadastru-intabulare/page.tsx`: FAQ-ul de urgență (fără „600 lei (120 + 480)”), termenele pe Ordinul 1622/2025 (15 zile la prima înregistrare, 7/2 la intabulare), paragraful despre urgență.
  - `public/downloads/checklist-cadastru-intabulare.pdf` era deja curat (v2 din 14.07 a înlocuit tabelul de taxe cu prețurile noastre), deci nu am schimbat nimic.
- **Stare civilă (HG 255/2024 art. 158 și art. 162):**
  - `servicii/eliberare-certificat-de-nastere/page.tsx`: 5 locuri corectate; `DATE_MODIFIED` 2026-09-25.
  - `servicii/eliberare-certificat-de-casatorie/page.tsx`: 3 locuri; `DATE_MODIFIED` 2026-09-25.
  - `schimbare-certificat-de-nastere-vechi/page.tsx`: FAQ-ul despre duplicat; `DATE_MODIFIED` și `PAGE_LAST_MODIFIED` 2026-09-25.
- **Rămas, necorectat:** „oficial” în descrierea din DB la `identificare-imobil`, `certificat-integritate`, `rovinieta` și `certificat-celibat`, de verificat separat.
