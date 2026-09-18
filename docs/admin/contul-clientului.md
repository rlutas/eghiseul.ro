# Contul clientului — ce face, ce vede clientul, ce vedeți voi

Ghid pentru echipă, la zi cu livrările din 17–18.09.2026. Contul e la
`/account` și e opțional: orice comandă merge și fără cont.

## Cum apare contul

- **Din comandă**, pe pagina de succes după plată: clientul pune o parolă și
  contul preia datele comenzii plătite (nume, CNP, telefon, adresa, facturarea,
  actele încărcate).
- **Din pagina de înregistrare**, cu email + parolă + telefon (câmpul are
  selector de țară și verifică numărul).
- Comenzile făcute ca vizitator, cu același email, se leagă de cont automat la
  prima intrare.

## Ce vede clientul în cont, de sus în jos

1. **„Comandă mai repede data viitoare"** — un meniu cu patru rânduri:
   Telefon de contact, Date personale, Adresă de livrare, Date de facturare.
   Rând necompletat → se deschide un popup cu formularul. Rând completat → arată
   ce e salvat și duce în tabul unde se poate schimba. Când e totul gata,
   rămâne o singură linie: „Profilul tău e complet 100%".
   - În popup-ul „Date personale" clientul poate **fotografia buletinul sau
     pașaportul**: câmpurile se completează singure, iar poza se salvează în
     tabul „Act de identitate".
   - Popup-ul „Date de facturare" întreabă întâi **„le folosim și pe
     factură?"** cu datele din act; „Nu" duce la formularul persoană fizică /
     juridică (CUI → date de la ANAF).
2. **Cuponul de bun-venit** — 10% la prima comandă din cont, valabil 30 de
   zile, o singură folosire, doar pe contul lui. Se aplică singur când comanda
   pornește din „Ce pot comanda"; codul se vede și se poate copia.
3. **Comandă / Comenzi** și meniul **„Datele mele"** (Profil, Act identitate,
   Adrese, Facturare, Mașini). Un client cu comenzi aterizează pe Comenzi.
4. Conținutul tabului ales.

## Ce NU mai cere contul

- **Actul de identitate** nu e pas în cont. Se cere **doar în formularul de
  comandă**, cu selfie, la serviciile care au nevoie (caziere, stare civilă).
  Un client cu profil „100%" tot va fi întrebat de act la un cazier — e normal.
- **Întrebarea „Ce servicii te interesează?"** a dispărut.

## Ce se leagă automat

| Direcție | Ce se întâmplă |
|---|---|
| Cont → comandă | Email, telefon, nume, CNP, data nașterii intră singure în pașii 1–2. Adresele salvate și profilul de facturare se oferă la livrare / facturare. |
| Comandă → cont | La fiecare plată confirmată (card, transfer bancar confirmat de voi, „Marchează plătită", sync Stripe) comanda pune în cont adresa, profilul de facturare și actele, fără duplicate. Ce lipsea din profil (telefon, nume, CNP) se completează; ce era deja nu se suprascrie. |
| Comandă → admin | Pe comandă vedeți **„Client înregistrat"** + starea KYC a contului, sau „Comandă ca invitat". |

## Când clientul sună

- „Nu găsesc unde îmi schimb telefonul" → primul rând din cont, sau tabul
  Profil → Editează.
- „Mi-a cerut actul deși l-am pus în cont" → normal la caziere / stare civilă:
  actul se fotografiază la comandă, ca să fie proaspăt.
- „Cuponul nu merge" → e personal (doar contul lui), o singură dată, 30 de
  zile; se vede în `/admin/coupons` cu eticheta **Bun-venit**.
- „Am completat și nu apare" → reîncărcarea paginii; dacă tot nu apare,
  raportați cu emailul contului.

## Resetarea unui cont pentru test

Doar din bază, de către Raul: se golesc telefon / nume / CNP / date naștere,
adresele salvate, profilurile de facturare și actele. Emailul, parola și
comenzile rămân.
