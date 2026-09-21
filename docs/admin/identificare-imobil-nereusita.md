# Identificare imobil: ce facem când topograful NU găsește imobilul

Procedura de echipă din 21.09.2026. Se aplică la „Identificare Imobil după
Adresă” și „Identificare Imobile după Proprietar”. Prețul serviciului devine
**298 lei** (schimbarea pe site vine odată cu butoanele noi din portal).

## Pe scurt

Când Mircea nu găsește imobilul în e-Terra, NU mai lăsăm comanda în „În
așteptare client” cu o notă. Depunem la OCPI o cerere oficială (serviciul
ANCPI cod **2.7.8**, 100 lei, răspuns în ~10 zile lucrătoare) și clientul
primește, orice ar ieși, un document:

- fie **certificatul cu numărul de carte funciară** și apoi extrasul CF (comanda
  se livrează normal);
- fie **certificatul negativ** de la OCPI („nu figurează înscris”) + raportul
  nostru, cu care merge la notar / la intabulare / la conversia cărții vechi,
  plus **un credit** pentru un extras CF după ce își înscrie imobilul.

## De ce nu apare imobilul (ce îi spunem clientului)

Două situații, așa cum le-a explicat Mircea:

1. **Imobilul nu este intabulat.** Nu a fost niciodată înscris în cartea
   funciară, deci nu există carte funciară și nu se poate elibera extras.
   Trebuie intabulat: documentație cadastrală făcută de o persoană autorizată
   + actele de proprietate, depuse la OCPI.
2. **Este intabulat pe sistemul vechi, pe hârtie**, iar coala funciară nu a
   fost încă convertită în format electronic. Până la conversie nu apare în
   căutări. Dacă clientul are un act cu număr de CF vechi sau număr topografic,
   cere la OCPI conversia cărții funciare.

Certificatul negativ de la OCPI e exact hârtia oficială de care are nevoie în
ambele situații. De asta îl depunem, nu doar îi spunem „nu l-am găsit”.

## Pașii, cine ce face

| Pas | Cine | Ce face în platformă |
|---|---|---|
| 1. Caută în e-Terra (adresă, hartă, proprietar) | Mircea | dacă găsește: „Am identificat imobilul” + CF → cerere extras → livrare, ca până acum |
| 2. Nu găsește | Mircea | depune la OCPI cererea 2.7.8 (după adresă) sau 2.7.6 (după proprietar, 125 lei); în comandă, la „Am depus cererea la OCPI”, salvează **nr. de înregistrare** și **costul (100 sau 125)**. Comanda trece pe „Trimis instituție”. Notă: „nu apare în e-Terra, depus 2.7.8” |
| 3. Anunță clientul | Echipa | trimite emailul de mai jos (până apare automat) |
| 4. Vine răspunsul OCPI | Mircea | îl încarcă în comandă. Dacă are CF: completează „Am identificat imobilul” cu CF-ul → cerere extras → livrare. Dacă e negativ: încarcă certificatul, notă „răspuns negativ, are credit”, marchează gata |
| 5. Răspuns negativ | Echipa | trimite clientului raportul (modelul din Knowledge Center, completat cu datele comenzii) + certificatul, și notează creditul pe comandă. Până la cuponul automat, creditul se dă din admin: cupon 100% pe „Extras Carte Funciară”, o folosire, pe emailul clientului |
| 6. Clientul revine cu nr. CF | Echipa | comandă de extras CF cu cuponul (0 lei), sau telefonic |

Ce NU mai facem: status „În așteptare client” pentru negăsire. Acela rămâne
doar când chiar lipsesc date de la client (adresă incompletă, fără număr).

## Emailul către client la depunerea 2.7.8 (de copiat)

> Bună ziua,
>
> Pentru comanda **[nr. comandă]** am căutat imobilul de la adresa
> **[adresa]** în baza de date e-Terra a ANCPI, după adresă și după
> proprietar, și nu figurează înregistrat electronic la adresa respectivă.
>
> Ca să avem un răspuns oficial, am depus la OCPI **[județ]** o cerere de
> certificat privind înscrierea imobilului în evidențele de cadastru și carte
> funciară (nr. înregistrare **[nr]**, din **[data]**). Răspunsul vine în
> aproximativ 10 zile lucrătoare.
>
> Dacă certificatul conține numărul de carte funciară, vă obținem extrasul și
> vi-l trimitem imediat. Dacă imobilul nu este înscris, primiți certificatul
> oficial de la OCPI și un raport al verificărilor noastre, cu pașii pe care îi
> puteți face, iar suma plătită rămâne ca credit pentru un extras de carte
> funciară după înscrierea imobilului.
>
> Cu stimă, echipa eGhișeul.ro

## Ce urmează în platformă (în lucru)

Buton „Nu am găsit imobilul” în portalul topografului, care generează cererea
2.7.8 din adresa clientului, pune statusul nou „Identificare nereușită —
certificat 2.7.8 depus la OCPI”, trimite emailul de mai sus automat și
recalculează termenul. La răspuns negativ: raportul PDF și cuponul-credit se
emit singure. Planul: `../plans/2026-09-21-identificare-imobil-nereusita-design.md`.

## Comenzile deja blocate (de triat)

La 21.09 sunt 12 comenzi de identificare în „În așteptare client” cu nota „nu
s-a putut identifica, are credit” și 4 blocate la instituție. Pentru fiecare:
verificați dacă s-a depus deja 2.7.8 (E-260728-VWFTT are depunere cu 100 lei);
unde nu, Mircea depune; unde a venit răspuns negativ, trimiteți raportul și
creditul.
