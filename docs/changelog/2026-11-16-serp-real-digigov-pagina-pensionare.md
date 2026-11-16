# 16.11.2026 — Cine ne-a luat locul în Google și prima pagină refăcută (vârsta de pensionare)
<!-- categorie: seo -->

## Pentru echipă

Am căutat efectiv în Google, fără personalizare, 10 dintre căutările care ne aduceau clienți. Un site concurent, digigov.ro, apare acum lângă noi sau peste noi pe aproape toate: calculatoare de pensii, impozit auto, cazier pe orașe, cazier fiscal, certificat constatator. Vinde aceleași servicii ca noi.

Pe pensii, paginile lor sunt de patru ori mai lungi decât ale noastre și răspund direct, cu cifre. Am refăcut prima noastră pagină, calculatorul de vârstă de pensionare: acum spune din prima propoziție la ce vârstă se iese la pensie anul acesta și are două tabele noi. Urmează, pe rând, celelalte pagini de pensii.

Pentru voi nu se schimbă nimic în lucrul cu comenzile.

---

## Ce am găsit (Google, `pws=0`, 16.11.2026)

| Căutare | Unde suntem noi | Cine e sus |
|---|---|---|
| calculator estimare pensie | nu apărem în primele 9 | cnpp.ro, expertulbanilor.ro, my.cnpp.ro, finzoom.ro, lapensie.com, digigov.ro |
| cand ies la pensie | nu apărem în primele 8 | my.cnpp.ro, digigov.ro, cnpp.ro |
| calculator varsta pensionare | nu apărem în primele 8 | my.cnpp.ro, cnpp.ro, digigov.ro |
| tabel varsta pensionare anticipata femei | nu apărem în primele 7 | my.cnpp.ro, mmuncii.gov.ro, cnpp.ro |
| impozit auto 2026 | eghiseul pe 2 | impozitauto.ro pe 1, digigov.ro pe 3 |
| cazier judiciar online | CJO pe 6 | hub.mai.gov.ro pe 1–2, caziere.ro pe 3; reclame: infocazier, obtinecazier, caziere |
| cazier iasi | CJO pe 3 | IPJ Iași pe 1, infocazier pe 2; digigov pe 6 |
| cazier craiova | CJO pe 3 | IPJ Dolj pe 1, digigov pe 2 |
| cazier fiscal online | CJO pe 6; cazierfiscal.com nu apare | anaf.ro pe 1–2, digigov pe 3 |
| certificat constatator online | nu apărem | myportal.onrc.ro pe 1, apoi certificatconstatator.ro, certificat-constatator-instant.ro, constatator-online.ro; digigov pe 7; 4 reclame |

Pe nicio căutare nu a apărut rezumat generat de AI.

## digigov.ro, pe scurt

- Domeniu înregistrat în 02.08.2023; paginile de pensii au data 27.09.2026, cele de cazier pe orașe 17.09.2026.
- 293 de adrese în sitemap: 145 de extras de carte funciară, 49 de cazier judiciar pe orașe, 43 de certificat constatator, 14 calculatoare, 15 articole.
- Lista de servicii e aceeași cu a noastră, până la copia inventarului de coordonate Stereo 70 și copia de releveu.
- Calculatorul lor de vârstă de pensionare: 5.286 de cuvinte. Al nostru avea 1.291. Calculatorul lor de pensie: 4.780, al nostru 1.277.
- Încep cu răspunsul și cu cifre („în 2026, femeile ies la pensie la 62 de ani și 6 luni sau la 62 de ani și 7 luni”), au tabel pe ani de naștere și titluri puse ca întrebări.

## Ce înseamnă pentru căderea din 17.10

Paginile noastre de pensii au pierdut afișările din 17.10, la trei săptămâni după ce digigov și-a publicat paginile, iar pe primul loc stă acum simulatorul oficial al Casei de Pensii (`my.cnpp.ro`). Explicația cea mai simplă e că am fost depășiți, nu penalizați. Ipoteza cu bara fixă de vânzare, pusă pe 14.10, rămâne neverificată și pare mai puțin probabilă.

Nu putem dovedi cauza doar din date; e concluzia cea mai plauzibilă după SERP și după comparația paginilor.

## Ce am schimbat: `/calculator/varsta-pensionare/`

- Rezumatul de sus spune vârsta de anul acesta, calculată din Anexa 5: „În 2026, femeile ies la pensie la 62 de ani și 6 luni sau la 62 de ani și 7 luni, iar bărbații la 65 de ani.”
- Tabel nou „Cine iese la pensie în 2026 și în 2027?”: lunile de naștere, vârsta standard și lunile de ieșire.
- Tabel nou pe ani de naștere pentru femei, 1960–1970: vârsta standard, stagiul complet, fereastra de ieșire. Înlocuiește tabelul vechi, care spunea doar „de la 57 spre 65 de ani”.
- Trei titluri puse ca întrebări. Data actualizării: 16.11.2026.

Toate cifrele se calculează din `src/lib/pensii-anexa5.ts` (datele din PDF-ul oficial al Anexei 5 la Legea 360/2023): `iesiriInAn()`, `tabelPeAnNastere()`, `formatAniLuni()`, `formatLunaAn()`. Anul se ia din data curentă, deci la 1 ianuarie pagina trece singură pe anul următor. Cifrele pentru 2026 coincid cu cele publicate de concurent, calculate independent.

Pagina are acum 1.750 de cuvinte. Nu am lungit-o artificial ca să ajung la 5.000.

Teste: `tests/unit/lib/pensii-anexa5-tabele.test.ts` (5).

## Ce urmează, pe rând

| Pagină | Ce îi lipsește |
|---|---|
| `/calculator/estimare-pensie/` | răspuns cu cifre în prima propoziție; tabel „ce pensie ai la 15–45 de ani de stagiu”; valoarea punctului de referință, verificată la sursă |
| `/tabel-varsta-pensionare-anticipata-femei/` | tabelul pe luni, din aceleași date |
| paginile de oraș CJO | verdictul din 17.11; pe „cazier craiova” digigov e deja peste noi |
| certificat-constatator-express.ro, cazierfiscal.com | sunt noi; pe căutările lor stau instituția și 3–4 site-uri de nișă mai vechi |

De observat: bara fixă de pe calculatoarele de pensii arată „Certificat de naștere online, 824,79 lei”, un produs fără legătură cu pagina. De hotărât separat dacă rămâne.

Regula „fără schimbări cât rulează actualizarea Google” din auditul de dimineață a fost depășită pentru această pagină: cauza e acum vizibilă, iar schimbarea adaugă date reale, nu mută titluri.
