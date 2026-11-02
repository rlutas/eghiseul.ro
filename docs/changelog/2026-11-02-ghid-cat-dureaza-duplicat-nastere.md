# 02.11.2026 — Ghid nou pe documentero: cât durează duplicatul certificatului de naștere
<!-- categorie: seo -->

## Pentru echipă

- Pe documentero.ro e un ghid nou: „Cât durează duplicatul certificatului de naștere și se poate mai repede?”. Îl găsiți la Ghiduri și pe pagina certificatului de naștere.
- Dacă un client întreabă „cât durează?”, răspunsul corect e: la ghișeu, legea permite tipărirea pe loc dacă actul e deja în sistemul electronic; dacă primăria are de verificat ceva, până la 30 de zile; un act vechi, încă nescanat, se validează în 3 zile.
- „Urgența” nu există peste tot. O au doar primăriile care au aprobat o taxă locală (de exemplu Târgu Frumos: 3 ore sau 24 de ore; Târgu Ocna: a doua zi). Noi nu vindem regim de urgență la naștere; nu promiteți un termen scurt.
- Cifrele noastre, recalculate azi: jumătate din duplicatele de naștere au ajuns la client în cel mult 19 zile de la plată, 8 din 10 în cel mult 24. Depunerea se face în prima zi; partea care variază e timpul de la primărie (4–21 de zile).
- Buletinul expirat nu mai e motiv sigur de refuz: ofițerul de stare civilă poate verifica persoana în evidență; cere act nou doar dacă poza nu mai seamănă. Ghidurile vechi spuneau altfel și au fost corectate.

---

## Rezumat tehnic

**De ce subiectul ăsta.** GSC eghiseul.ro, 01.05–31.10.2026, interogări cu „nastere” pe intenții:
durată/urgență 1.274 de afișări (cea mai mare: „in cat timp se elibereaza certificatul de nastere
pierdut” 545, „certificat de nastere la urgente” 310, „cat dureaza eliberarea certificatului de nastere
duplicat” 154), cost 376, „alt oraș/străinătate” 279, programare 1.166 (aproape toată pe un singur oraș,
Timișoara, deci pagină de localitate; nu o facem). Pierdut, acte necesare și model vechi au deja ghid.
documentero nu are nicio afișare pe durată. infocazier are ghid „cât durează” (audit 02.11, `06-infocazier.md`).

**Pagina:** `/ghiduri/cat-dureaza-duplicat-certificat-de-nastere/` (`src/app/documentero/ghiduri/…/page.tsx`),
~1.800 de cuvinte în `<main>`, `Article` + `FAQPage` (5 întrebări luate din GSC), autor `SITE_AUTHOR`,
`datePublished`/`dateModified` 2026-11-02. Preț și opțiunea de urgență din `getServicePricing`
(`services`/`service_options`; `urgenta` e inactivă, deci pagina spune că nu o vindem). Termenele noastre
din `PROCESSING_STATS`.

**Fapte verificate (legislatie.just.ro, 280598):** H.G. 255/2024 Norme art. 162 alin. (2) (tipărire pe loc
sau până la 30 de zile dacă sunt necesare verificări), art. 28 alin. (3) (validare în 3 zile la cerere),
art. 158 alin. (1) (oricare SPCLEP/primărie și consulatele de carieră), alin. (4) (cererea se înregistrează),
alin. (5) (act de identitate expirat), art. 163 alin. (2). Urgență: Primăria Târgu Frumos (fișa de stare
civilă, 100 lei/3 h, 50 lei/24 h), Orașul Târgu Ocna H.C.L. 137/23.12.2025 anexa 3 lit. D (40 lei, a doua zi).

**`PROCESSING_STATS` recalculat la 02.11.2026** (aceeași metodă: `percentile_cont`, rotunjit, comenzi
plătite din 07.07.2026, `status='completed'`): naștere 14 comenzi, 19/24 zile (era 11, 19/23); căsătorie 6,
18/24 (era 4, 22/30); celibat 7, 15/22 (era 5, 19/24); extras naștere 17, 18/22 (era 12, 19/24); extras
căsătorie 5, 12/13 (era 3, 12/12). Nou: `phasesNastere` din `order_history` (plată → `submitted_to_institution`
sub 1 zi la toate 14; depunere → `shipped` 4–21 zile, mediana 12,5).

**Linkuri interne noi spre ghid (6 + index + llms.txt):** pagina de naștere (lista de ghiduri), acasă
(paragraful de ghiduri), ghidurile pierdut, acte necesare, model vechi, procură. Ghidul trimite spre
naștere, comandă, extras multilingv, pierdut, acte necesare, model vechi, procură.

**Corecturi din același commit:** „primăria nu primește cereri cu act de identitate expirat” (pierdut, acte
necesare) → regula din art. 158 alin. (5); „Din 2023” rămas în tabelul sectoarelor → „Din 2024”.

**Similaritate** (Jaccard, shingle-uri de 5 cuvinte, textul din `<main>` din build): față de celelalte 6
ghiduri și pagina de naștere, maximum 0,025 normal și 0,025 mascat (pierdut).

`DATE_MODIFIED`/sitemap → 2026-11-02 pe paginile atinse (acasă, ghiduri, model vechi, procură, valabilitate
celibat, care afișează cifrele recalculate).
