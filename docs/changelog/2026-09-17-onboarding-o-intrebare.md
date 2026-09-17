# 17.09.2026 — Contul întreabă o singură dată ce te interesează
<!-- categorie: clienti -->

## Pentru echipă

La prima intrare în cont, clientul primește **o singură întrebare**: ce servicii
te interesează? Poate bifa mai multe sau poate sări peste. Răspunsul are exact un
rol — decide dacă i se mai cere sau nu act de identitate.

**Ce înseamnă pentru tine:**

- **Clientul care vrea doar extras de carte funciară sau certificat constatator
  nu mai e bătut la cap cu buletinul.** Pentru serviciile astea nu e nevoie de
  act — nici noi nu depunem act la ONRC sau la ANCPI. Până azi contul îi arăta
  „profil 80% complet" din cauza unui document pe care nimeni nu i l-ar fi cerut
  vreodată.
- **Cine vrea cazier, certificat de naștere sau de căsătorie primește același
  lucru ca înainte**: i se cere actul o dată, apoi rămâne salvat.
- **Dacă sare peste întrebare nu se schimbă nimic.** Contul cere exact ce cerea
  și înainte. Întrebarea nu blochează nimic și nu apare a doua oară.
- **Serviciile alese apar primele** în lista din cont, ca să nu mai caute.

Dacă te sună un client și spune „mi-a cerut buletinul degeaba", întreabă-l ce
servicii a bifat: dacă a bifat caziere sau stare civilă, actul chiar e necesar
acolo.

---

## Ce s-a livrat tehnic

Faza 2 din `docs/dashboard-client/PLAN.md`, decizia D5.

### Cifra din spatele întrebării

Din cele 31 de servicii active, **11 au `personalKyc.enabled` și 20 nu**.
Împărțirea pe cele patru răspunsuri:

| Răspuns | Categorii | Cere act |
|---|---|---|
| Caziere și certificate despre mine | juridice, fiscale, auto | da |
| Acte de stare civilă | personale | da |
| Acte despre un imobil sau un teren | imobiliare (19 servicii) | **nu** |
| Acte despre o firmă | comerciale | **nu** |

`src/lib/account/service-interests.ts` ține răspunsurile, iar
`tests/unit/lib/account/service-interests.test.ts` le verifică față de un
instantaneu al catalogului real (`tests/fixtures/active-services.json`): dacă un
serviciu își schimbă configurația sau apare o categorie nouă, pică testul în loc
să mintă întrebarea. Verificat și invers: fiecare categorie activă aparține
exact unui răspuns.

### Unde se vede răspunsul

- **Checklistul de profil** nu mai cere „Act de identitate" celui care a răspuns
  doar imobile/firmă — și nu mai raportează „80% complet" pentru un document pe
  care nu i-l cerem. Un act deja încărcat NU dispare niciodată din listă: cade
  doar *cererea*, nu documentul.
- **Tabul de identitate** spune explicit „Nu-ți cerem act de identitate", cu
  motivul, și lasă încărcarea posibilă pentru cine se răzgândește.
- **Catalogul din cont** pune întâi categoriile alese; sortarea e stabilă, deci
  restul păstrează `display_order`, iar fără răspuns nu se schimbă nimic.

Distincția care contează în cod: `NULL` = n-a fost întrebat, `{}` = a fost
întrebat și a sărit. Amândouă lasă contul exact cum era —
`interestsRequireIdentity()` întoarce `null`, nu `false`, fiindcă „nu știm nimic
despre omul ăsta" nu e același lucru cu „ne-a spus că nu-i trebuie act".

### Migrarea 173

`profiles.service_interests TEXT[]` + `profiles.onboarding_completed_at`, cu
CHECK pe cele patru id-uri, ca o scriere greșită să cadă zgomotos. Valorile
necunoscute sunt oricum aruncate la citire (`parseInterests`), deci un rând vechi
nu poate lărgi ce cere contul.

### Ecranul

Card în capul contului, nu modal și nu perete. Casete de bifat reale (nu butoane
cu `aria-pressed`: sunt răspunsuri la o întrebare), starea selectată dusă de
bifă + grosimea bordurii, nu doar de culoare, ținte de 56px pe carduri și 44px pe
butoane. După salvare cardul **nu dispare brusc**: arată ce s-a schimbat
(„pentru că ai ales X, contul nu-ți mai cere Y" — testul §3.6 din plan), iar
restul paginii se reîmprospătează abia când clientul închide confirmarea.

Build verde, 1894 de teste.

## Urmează

Faza 3: datele din actul scanat pot fi folosite și la facturare, cu un comutator,
implicit oprit.
