# Identificare imobil: procesul complet, de la comandă la documentul final
<!-- audienta: colaborator -->

Procesul confirmat cu topograful (Mircea) pe **25.09.2026**. Se aplică la
„Identificare Imobil după Adresă” și „Identificare Imobile după Proprietar”,
ambele **298 lei**, termen afișat **1–3 zile lucrătoare**.

> PDF-ul vechi `identificare-imobil-ghid.pdf` (21.09) descrie varianta în care
> după răspunsul OCPI scoteam și extrasul inclus. Nu mai e valabil: regula
> corectă e cea de mai jos.

## Pe scurt

1. **Pasul 1 — topograful caută imobilul** pe cele 3 platforme. Dacă îl găsește:
   extrasul de carte funciară, în **1–3 zile lucrătoare**. Extrasul e dovada că
   serviciul e complet.
2. **Pasul 2 — nu îl găsește** (după adresă sau după proprietar): depune cerere
   la **OCPI**, care caută în arhivă, de regulă în **până la 10 zile lucrătoare**
   (uneori mai mult, alteori mai puțin). Termenul dat de OCPI apare clientului în
   pagina comenzii.
   - **OCPI găsește cartea funciară**: o digitalizează și trimite un document care
     o confirmă, cu numărul ei. Clientul îl descarcă din platformă. **Serviciul se
     încheie aici.** Extrasul CF nu mai e inclus (cei 100 de lei au mers pe cererea
     la OCPI); dacă îl vrea, face o comandă nouă de extras CF.
   - **OCPI nu o găsește**: trimite un document care spune asta. Clientul îl
     descarcă și poate lua legătura cu un topograf din zona lui pentru înscrierea
     imobilului în cartea funciară.

Nu dăm credit, nu dăm extras gratuit după pasul 2.

## După proprietar, cu mai multe imobile

Dacă Mircea găsește **un** imobil, scoate extrasul direct. Dacă găsește **mai
multe**, îi scrie clientului lista din portal (secțiunea „Mesaje cu clientul”,
butonul „Mai multe imobile găsite” completează textul). Clientul alege **unul**,
răspunde din pagina comenzii, iar pentru acela scoatem extrasul inclus în preț.
Pentru celelalte poate comanda separat câte un extras CF (89 lei).

## Actele clientului

La comandă, clientul e întrebat **„Ai un act care ne ajută să găsim imobilul?”**
(Da / Nu). La „Da” încarcă poze sau PDF: extras CF vechi, titlu de proprietate,
contract de vânzare-cumpărare, certificat de moștenitor. Pe ele apar numărul
vechi de CF și numărul topografic, după care imobilul se găsește mult mai repede.

- **Mircea** le vede în portal, în „Date pentru lucrare” → „Acte trimise de client”.
- **Echipa** le vede în admin, pe comandă, la „Date imobil” → „Acte trimise de client”.
- Dacă actul apare mai târziu, clientul îl atașează la un mesaj din pagina comenzii.

## Pașii în platformă, cine ce face

| Pas | Cine | Ce face |
|---|---|---|
| 1. Caută imobilul | Mircea | Deschide comanda din portal, citește actele clientului dacă există |
| 2a. L-a găsit | Mircea | „Am identificat imobilul” (județ, UAT, CF) → cererea de extras → depunere → „Încarcă PDF și trimite clientului” |
| 2b. Are o întrebare (adresă neclară, act lipsă, mai multe imobile) | Mircea | Scrie în **„Mesaje cu clientul”**. Clientul primește email, răspunde din pagina comenzii; Mircea și echipa primesc email înapoi |
| 3. Nu l-a găsit | Mircea | „Nu am găsit — depun certificat la OCPI”: comanda trece pe „Certificat oficial cerut la OCPI”, clientul primește emailul automat |
| 4. Depune la OCPI | Mircea | „Am depus cererea la OCPI”: nr. de înregistrare, **termenul dat de OCPI** (data de pe dovadă) și costul (100 lei după adresă, 125 după proprietar). Clientul vede termenul în pagina comenzii |
| 5. Vine răspunsul OCPI | Mircea | Încarcă documentul OCPI („Încarcă PDF și trimite clientului”). Pozitiv sau negativ, documentul e livrarea |
| 6. Clientul vrea extrasul după pasul 2 | Echipa | Comandă nouă de extras CF, cu numărul din documentul OCPI |

„În așteptare client” (standby) rămâne doar când lipsesc date de la client și
comanda nu poate merge mai departe. Întrebarea în sine se pune prin mesaje.

## Ce vede clientul

- **În pagina comenzii** (`/comanda/status`): statusul, termenul (la pasul 2:
  „Termen dat de OCPI: …, cererea nr. …”), documentele gata și secțiunea
  **„Mesaje despre comandă”**, unde citește și răspunde, cu poze atașate.
- **Pe email**: confirmarea comenzii; la fiecare mesaj de la noi, emailul „Ai un
  mesaj nou” cu textul întreg și butonul spre pagina comenzii; la pasul 2, emailul
  „Imobilul nu apare online”; la final, documentul.

## Ce spuneți la telefon

- Pasul 1 durează de obicei 1–3 zile lucrătoare.
- Dacă imobilul nu apare online, cerem noi la OCPI, fără cost în plus; răspunsul
  vine de regulă în până la 10 zile lucrătoare, iar termenul exact e în pagina comenzii.
- După răspunsul OCPI, extrasul CF e o comandă separată.
- Dacă nici OCPI nu găsește imobilul, clientul are nevoie de un topograf din
  zona lui pentru înscrierea în cartea funciară.

## De ce nu apare un imobil online

1. **Nu a fost intabulat niciodată**: nu există carte funciară, deci nici extras.
   Trebuie înscris: documentație cadastrală de la un topograf autorizat + actele de
   proprietate, depuse la OCPI.
2. **E pe cartea funciară veche, pe hârtie**, iar coala nu a fost încă digitalizată.
   OCPI o găsește în arhivă și o digitalizează la cererea noastră.

## Emailul de rezervă (dacă trebuie scris de mână)

> Bună ziua,
>
> Pentru comanda **[nr. comandă]** am căutat imobilul de la **[adresa / proprietarul]**
> în evidențele ANCPI și nu apare înregistrat electronic.
>
> Am depus la OCPI **[județ]** cererea ca imobilul să fie căutat în arhivă
> (nr. **[nr]**, termen dat de OCPI: **[data]**). Dacă OCPI găsește cartea funciară,
> o digitalizează și vă trimitem documentul care o confirmă; extrasul de carte
> funciară îl puteți comanda apoi separat. Dacă nu o găsește, primiți documentul
> oficial care confirmă asta, cu care un topograf din zona dumneavoastră poate face
> înscrierea în cartea funciară.
>
> Cu stimă, echipa eGhișeul.ro

Vezi și: [Mesajele cu clientul pe comandă](mesaje-client.md).
