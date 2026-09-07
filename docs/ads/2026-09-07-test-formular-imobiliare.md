# 07.09.2026 — Testul formularului de comandă (servicii imobiliare)

Parcurs ca un client real pe `copie-inventar-coordonate` (216,59 lei), înainte de a porni
campanii noi. Structura e identică la PAD, care a strâns 3 comenzi abandonate din 3.

## Fluxul: 4 pași

`Date Contact → Date Imobil → Semnătură → Facturare`

**Ce e bine:**
- Prețul e vizibil de la primul pas, cu TVA inclus, plus termenul („4 zile lucrătoare").
- Identificarea imobilului are alternativă: buton **„Nu știu"** lângă „Nr. Carte Funciară”, deci
  cine n-are numărul poate continua.
- Salvare automată („Salvat acum”) + cod de comandă afișat, deci se poate relua.
- Județ/localitate din listă, nu text liber.

## Blocajul: pasul 2 cere actul de identitate al proprietarului

Secțiunea **„Date pentru angajamentul de execuție"** cere, obligatoriu:

| Câmp | Obligatoriu |
|---|---|
| Nume și prenume proprietar | ✅ |
| Domiciliul proprietarului | ✅ |
| **CNP proprietar** (13 cifre) | ✅ |
| **Serie CI** | ✅ |
| **Număr CI** | ✅ |

Textul de sub câmp spune explicit: *„Persoana din cartea funciară. Poate fi diferită de cine
plătește comanda."*

**De ce omoară conversia:** omul vine dintr-un click de reclamă, e la primul contact cu site-ul, și
înainte să plătească i se cer **CNP-ul și cartea de identitate ale altcuiva**. Dacă nu e chiar el
proprietarul — agent imobiliar, cumpărător, rudă, notar — pur și simplu **nu are datele**. Iar dacă
e proprietarul, tot e o barieră de încredere pe un site pe care tocmai a aterizat.

Comparație directă: **extras CF (89 lei) NU cere așa ceva** — doar numărul cadastral. Și se vinde
de 30 de ori pe trei săptămâni, din organic. Serviciile cu „angajament de execuție" (PAD,
coordonate, plan de încadrare, releveu) au toate acest pas — și toate au vândut zero din reclamă.

## Al doilea semnal, mai mic: banda roșie ANCPI

În dreapta, lângă preț, apare permanent: **„Funcționare cu întârzieri · Portal ANCPI: indisponibil
· Eliberare automată: indisponibil"**, cu buline roșii, „Indisponibil din 14 iulie”. Textul explică
mai jos că se poate comanda oricum și că termenul e de 2 zile, dar primul lucru pe care îl vede
omul lângă butonul de plată sunt două buline roșii cu „indisponibil”.

Onestitatea e corectă și trebuie păstrată — dar formularea poate fi pusă pe pozitiv
(„Depunem cererea la OCPI prin partener autorizat · termen 2 zile lucrătoare”), cu detaliul tehnic
în spatele unui link.

## Ce înseamnă pentru campaniile noi

Cele două ținte identificate în `2026-09-07-keyword-planner-imobiliare-si-competitie.md`
(certificat urbanism 1.600 căutări/lună, coordonate stereo 70 590/lună) trec **prin exact același
formular**. Dacă pornim bugetul înainte de a rezolva pasul 2, plătim clicuri care se lovesc de
același zid ca la PAD.

**Ordinea corectă:**
1. Datele proprietarului (CNP, serie/număr CI) se cer **după plată**, ca la KYC-ul de la celelalte
   servicii — comanda se plasează cu județ + localitate + nr. CF, restul se completează în contul
   clientului sau prin linkul din email. Angajamentul se generează la fel, doar mai târziu.
2. Abia apoi pornesc campaniile.

⚠️ De confirmat cu Mircea: are nevoie de CNP-ul proprietarului **la depunere** sau îi ajunge după?
Dacă îi trebuie la depunere, oricum îl poate cere prin sistem după plată — timpul de lucru rămâne
același, doar că nu mai pierdem clientul înainte de a plăti.

## Notă tehnică

Testul a creat un draft real (`E-260907-V9YDQ`), șters imediat după verificare.

**Certificatul de urbanism costă 943,50 lei** (nu 780 cum apare în master plan), cu termen
„cca. 30 de zile lucrătoare (termen legal primărie)". La un produs de 943 lei cu 30 de zile de
așteptare, rata de conversie din reclamă rece va fi mică indiferent de formular — de luat în calcul
la alegerea bugetului.
