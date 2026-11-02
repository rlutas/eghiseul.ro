# 02.11.2026 — Fapte corectate pe site: taxa de timbru, anexele cererii de cazier, Hub MAI
<!-- categorie: seo -->

## Pentru echipă

- La certificatele de naștere, căsătorie și celibat, site-ul nu mai spune că la Starea Civilă „plătești doar taxa de timbru” sau „gratuit, cu taxă minimă”. Taxa de timbru nu mai există din februarie 2017. Unele primării cer doar o taxă locală dacă vrei certificatul în regim de urgență.
- Dacă un client întreabă „ce taxe de stat sunt incluse în preț”: nu există taxe de stat la aceste certificate. Prețul nostru e prețul serviciului (avocat, depunere, ridicare, livrare).
- Pe cazierjudiciaronline.com: cetățenii străini nu sunt „verificați prin Interpol”; Poliția cere extrasul din cazierul țării lor printr-un sistem european (ECRIS), de aceea durează mai mult (până la 20 de zile lucrătoare pentru răspuns, plus cel mult 10 zile).
- Tot pe CJO: cazierul gratuit online de pe hub.mai.gov.ro NU cere semnătură electronică calificată. E nevoie doar de un cont validat (prin ghiseul.ro, buletinul electronic, aplicația ROeID sau la ghișeu). Clienții care pot face asta îl obțin gratuit; noi rămânem utili pentru original pe hârtie, apostilă, traducere sau străinătate.
- Clientul nu „semnează o procură cu cod OTP” la noi: semnează electronic, în formular, contractul, iar avocata depune cererea cu împuternicirea avocațială. Spuneți așa și la telefon.
- Formularele de cazier: pentru persoane fizice e Anexa 22, pentru firme Anexa 35 (pe formularele Poliției apar ca „Anexa nr. 7”, respectiv „Anexa nr. 10”), împuternicirea firmei e Anexa 38. PFA-urile primesc cazier de persoană fizică.

---

## Rezumat tehnic

### eghiseul.ro — stare civilă

| Pagină | Era | Acum |
|---|---|---|
| `/servicii/eliberare-certificat-de-nastere/` | „plătești doar taxa de timbru” | fără taxă de timbru (abrogată din 02.2017); unele primării au taxă locală de urgență |
| `/servicii/eliberare-certificat-de-casatorie/` | „gratuit (cu taxă minimă)”, „cu taxele incluse” | „fără taxă de timbru”, „preț final” |
| `/servicii/eliberare-certificat-de-celibat/` | meta + FAQ „cu taxele incluse” | „preț final” + fără taxă de timbru la ghișeu |

`DATE_MODIFIED` → `2026-11-02` pe cele trei pagini și în `src/lib/seo/last-modified.ts`
(lastmod sitemap). Paginile documentero (naștere, căsătorie, celibat, ghidul
„certificat pierdut”, homepage) spuneau deja „0 lei taxă de stat” — corecte,
neatinse. Paginile de extras multilingv nu aveau afirmația.

Rămase neschimbate, de decis separat: insigna „TAXE INCLUSE” / „Taxe incluse”
din hero-ul paginilor de serviciu (șablon comun); „din localitatea de
înregistrare” (căsătorie) și „din localitatea de domiciliu” (celibat) — de
verificat față de regula „orice primărie din 2023” folosită pe documentero.

### cazierjudiciaronline.com (repo separat)

- Commit `23b5041c` (anterior, aceeași zi): taxa de timbru de 20 RON / ~10 RON
  scoasă de pe toate paginile de cazier judiciar; IGPR: „fără a fi percepute
  taxe”. Doc: `docs/seo/2026-11-02-taxa-timbru-corectata.md` în CJO.
- Commit `a8ff862b`: ECRIS în loc de Interpol/SIS II; anexele HG 345/2010
  (PF = Anexa 22, formular „Anexa nr. 7”; PJ = Anexa 35, formular „Anexa nr. 10”;
  împuternicire PJ = Anexa 38; dispărut „Anexa 8”); PFA/II/IF fără personalitate
  juridică; minori sub 14 ani prin părinte; Hub MAI fără semnătură calificată;
  semnarea în formular (contract, semnătură electronică simplă, fără OTP) +
  împuternicire avocațială. Pagini: `/acte-necesare-cazier-judiciar`,
  `/eliberare-cazier-judiciar-online`, `/cerere-cazier-judiciar-model`,
  `/cazier-judiciar-gratuit`, `/cazier-judiciar-urgent`,
  `/cazier-fiscal-vs-cazier-judiciar`, `/cazier-fiscal-online`, blocul de
  intenție de pe homepage. Doc: `docs/seo/2026-11-02-fapte-corectate.md` în CJO.

### Surse (verificate 02.11.2026)

- Legea nr. 1/2017, art. VI — abrogă Legea nr. 117/1999 privind taxele
  extrajudiciare de timbru; în vigoare 01.02.2017:
  https://legislatie.just.ro/Public/DetaliiDocument/185507
- OUG nr. 41/2016 scutise deja de taxa de timbru eliberarea certificatelor de
  stare civilă în locul celor pierdute/deteriorate (SPCLEP Galați):
  https://www.primariagalati.ro/portal/act/comspclep_18072016.pdf
- Taxă locală de urgență, exemplu (Primăria Târgu Frumos, 100 lei / 3 ore,
  50 lei / 24 ore):
  https://primariatgfrumos.ro/wp-content/uploads/2023/01/Eliberare-la-cerere-a-certificatelor-de-nastere-1.pdf
- IGPR, cazier PF (străini, ECRIS, împuternicire avocațială, minori, fără taxe):
  https://politiaromana.ro/ro/utile/documente-eliberari-acte/cazier-judiciar/informatii-utile-cazier-judiciar-certificate-integritate-comportamentala/obtinerea-certificatului-de-cazier-judiciar-persoane-fizice-&page=1
- IGPR, cazier PJ (Anexa 35, Anexa 38, PFA fără personalitate juridică):
  https://politiaromana.ro/ro/utile/documente-eliberari-acte/cazier-judiciar/informatii-utile-cazier-judiciar-certificate-integritate-comportamentala/obtinerea-certificatului-de-cazier-judiciar-persoane-juridice-&page=1
- IGPR, cazier electronic (gratuit, cont validat în Hub: direct, ghiseul.ro, CEI, ROeID):
  https://politiaromana.ro/ro/utile/documente-eliberari-acte/cazier-judiciar/informatii-utile-cazier-judiciar-certificate-integritate-comportamentala/obtinerea-certificatului-de-cazier-judiciar-in-format-electronic-&page=1
- Hub MAI, validarea contului: https://hub.mai.gov.ro/site/despre-validare-cont
- Formularele Poliției: https://politiaromana.ro/files/subpages_files/pf_cerere_certificat_cu_timpi.doc
  („Anexa nr. 7 de modificare și înlocuire a Anexei nr. 22”),
  https://gl.politiaromana.ro/files/userfiles/IPJ_Galati/pj_cerere_certificat_CJ.doc
  („Anexa nr. 10 … a Anexei nr. 35 din HG 345/2010”),
  https://gl.politiaromana.ro/files/userfiles/IPJ_Galati/pj_model_imputernicire.doc (Anexa 38)
