# Test: căutările lungi din GSC puse ca subtitluri (11.11.2026)

Sursa sfatului: un clip TikTok (contul build_in_public, 11.11.2026). Verdictul
pe sfat e în [ce se discută în SEO](2026-11-11-ce-se-discuta-in-seo-noiembrie.md#sfaturi-din-clipuri-ce-e-real-și-cum-îl-testăm).
Metoda e descrisă în [playbook §9](playbook-site-de-nisa-un-serviciu.md).

## Ipoteza

O căutare de 4+ cuvinte pe care pagina o prinde deja (poziția 4–20), pusă
cuvânt cu cuvânt într-un H1/H2 sau în prima propoziție, urcă pagina și aduce
clicuri. Nu facem pagini noi pentru căutări (regula 1 din
`.claude/rules/content-and-seo.md`).

Căutările vin de pe CJO și eghiseul, unde avem date. Le-am folosit și pe
ecazier, documentero și cazierfiscal, care au prea puține date proprii.

## Ce s-a schimbat (11.11.2026)

| Site | Pagina | Schimbarea | Căutarea țintă |
|---|---|---|---|
| CJO | `/valabilitate-cazier-judiciar` | H1 „Cât este valabil cazierul judiciar?”; prima propoziție dă răspunsul (6 luni); scos „Ultima actualizare: Aprilie 2026”, care contrazicea data paginii | cat e/este valabil cazierul judiciar |
| CJO | `/cazier-fiscal-online` | H2-ul dublat „Când ai nevoie de cazier fiscal?” devine „Cazier fiscal pentru persoană fizică: când ți se cere”, cu cazul firmei | cazier fiscal persoana fizica / juridica |
| ecazier | `/cazier-auto` | H2 „Eliberarea cazierului auto online, pas cu pas”; întrebare nouă „De unde se scoate cazierul auto?”; răspunsurile vizibile, fără acordeon | eliberare cazier auto online, de unde se scoate cazierul auto |
| ecazier | `/cazier-fiscal` | H2 „Cazier fiscal pentru persoană fizică: cine are nevoie de el”; întrebarea despre firmă cu „persoană juridică”; răspunsuri vizibile | cazier fiscal persoana fizica / juridica |
| documentero | `/extras-multilingv/` | H2 „Certificat de naștere multilingv online: …” (oamenii caută „certificat”, nu „extras”) | certificat de nastere multilingv |
| documentero | `/certificat-de-casatorie/` | H2 „Certificat de căsătorie pierdut, cu divorț sau pentru străinătate: aceeași cerere” | certificat de casatorie pierdut |
| documentero | `/ghiduri/certificat-de-nastere-vechi-tipizat/` | H2 „Unde schimbi certificatul de naștere vechi cu unul nou” | schimbare certificat de nastere vechi in tip nou |
| cazierfiscal | `/` | H2 „Cazier fiscal pentru persoană fizică: acte necesare”; întrebarea despre firmă cu „persoană juridică” | cazier fiscal persoana fizica / juridica |

Commit-uri: CJO/ecazier `7f936a85` (repo cazierjudiciaronline.com); documentero
și cazierfiscal în acest repo, aceeași zi.

## Punctul de plecare: 28 de zile, 14.10–10.11.2026 (GSC, query+page)

| Pagina | Căutări | Afișări | Clicuri | Poziție medie |
|---|---|---|---|---|
| CJO valabilitate (căutări cu „valabil”) | 66 | 3.273 | 25 | 4,4 |
| CJO cazier fiscal (persoană/firmă/ANAF/certificat) | 54 | 2.393 | 22 | 8,4 |
| ecazier cazier auto (toate) | 15 | 299 | 2 | 16,1 |
| ecazier cazier fiscal (toate) | 33 | 275 | 2 | 29,9 |
| documentero extras multilingv | 18 | 30 | 0 | 22,8 |
| documentero certificat de căsătorie | 5 | 15 | 0 | 25,3 |
| documentero ghid certificat vechi | 20 | 142 | 4 | 6,9 |
| cazierfiscal `/` | 0 | 0 | 0 | — (site lansat 10.11) |

Căutările de referință, cu poziția de plecare:
- CJO: „cat este valabil cazierul judiciar” 321 afișări, 2 clicuri, poziția 3,9;
  „cazier fiscal persoana fizica” 573 / 8 / 7,0; „certificat de cazier fiscal” 239 / 0 / 9,0.
- ecazier: „eliberare cazier auto online” 60 / 0 / 16,9; „cazier fiscal persoana fizica” 20 / 0 / 20,7.
- documentero: „certificat de nastere vechi mai este valabil” 22 / 2 / 3,9.

## Când verificăm

- **09.12.2026**: aceleași filtre pe 12.11–09.12 față de tabelul de mai sus.
- **06.01.2027**: a doua citire, ca să vedem dacă se ține.

Rezultatul se trece aici și în tabelul de sfaturi din
[ce se discută în SEO](2026-11-11-ce-se-discuta-in-seo-noiembrie.md).

## Ce poate strica măsurătoarea

- **November 2026 core update** a pornit pe 10.11. O mișcare pe toate paginile,
  inclusiv pe cele neatinse, e de la update, nu de la test. Comparăm cu o pagină
  martor: CJO `/cazier-judiciar-gratuit` (neatinsă azi).
- Pe CJO au intrat pe 10.11 și schimbările din Faza 0/1
  ([jurnal și listă de urmărire](2026-11-10-plan-crestere-organic/README.md)).
- Pe ecazier, întrebările frecvente au devenit vizibile în aceeași zi (testul cu
  acordeonul). Pe ecazier nu putem separa cele două efecte.
- Cifrele mici (documentero, ecazier) pot varia mult fără nicio cauză.
  O schimbare de sub 20 de afișări nu spune nimic.
