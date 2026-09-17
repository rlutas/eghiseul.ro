# 17.09.2026 — Datele din act ajung la facturare doar dacă cere clientul
<!-- categorie: clienti -->

## Pentru echipă

Când clientul își scanează actul în cont, poate bifa **„Folosește datele din act
și la facturare"**. Bifa e nebifată din start: dacă n-o atinge, actul rămâne
folosit doar pentru verificarea identității.

**De ce contează pentru tine:**

- **Până azi se întâmpla automat, fără să întrebe nimeni.** Iar dacă omul avea
  deja un profil de facturare completat corect de mână, scanarea îl **suprascria**
  cu datele din act. Dacă ți-a zis vreodată „păi eu scrisesem altceva la
  facturare", asta era.
- **Profilul salvat din act e acum complet** — cu stradă, localitate și județ
  separat, așa cum cere factura. Înainte se salva totul într-un singur rând de
  adresă, deci profilul arăta salvat și la comanda următoare i se cerea din nou
  tot.
- **Un profil de facturare existent nu mai e atins niciodată** de o scanare.
  Clientul îl schimbă singur, din secțiunea de facturare.
- **Adresa din act** se salvează în continuare separat, sub eticheta „Adresă din
  act", dar nu mai devine automat adresa implicită de livrare dacă omul avea deja
  una aleasă.

---

## Ce s-a livrat tehnic

Faza 3 din `docs/dashboard-client/PLAN.md`, decizia D8.

### Ce făcea înainte

`POST /api/user/kyc/save` crea sau actualiza profilul de facturare la **fiecare**
scanare a unui document care poartă date personale, fără ca cineva să ceară asta.
Două probleme suprapuse:

1. **suprascria** un profil PF existent, inclusiv unul completat manual;
2. scria forma plată — nume, CNP și o singură linie de adresă — exact forma pe
   care `isPfBillingComplete` o respinge. Deci o scanare putea transforma un
   profil de facturare funcțional în unul pe care comanda următoare îl refuză.

Aceeași mapare plată era și în `useBillingProfiles.createFromIdData` și în
`KYCTab.autoCreateUserData`, cu un al treilea comportament pe deasupra:
actualiza profilul găsit după CNP.

### Ce face acum

Maparea unică: `src/lib/account/id-data-to-profile.ts`, cu câmpuri structurate
(linie de stradă + localitate + județ canonic + cod poștal) și cu `null` când
documentul nu poartă destul — spatele CI-ului nou are adresa și niciun nume, iar
un profil care nu poate valida e mai rău decât niciunul. 8 teste.

Regulile scrierii:

| Ce | Când |
|---|---|
| Profil de facturare din act | doar dacă a bifat clientul **și** nu are deja unul |
| Profil de facturare existent | niciodată atins de o scanare |
| Adresă „din act" | se salvează în continuare; implicită doar dacă nu există altă adresă |
| Datele din profil (nume, CNP, dată naștere) | ca înainte — fiecare câmp scris doar dacă a fost citit |

Steagul `useIdDataForBilling` circulă explicit prin `useKycStatus.saveDocument` →
`POST /api/user/kyc/save` și e `false` implicit pe ambele capete, ca o cerere
veche fără câmpul acesta să nu reintroducă vechiul comportament.

Comutatorul apare deasupra încărcării, nu după, și dispare când clientul are deja
un profil de facturare — n-am avea ce face cu el oricum.

Build verde, 1902 de teste.

## Urmează

Faza 4: dashboardul propriu-zis — comenzile pe prima poziție, cu trei întrebări
pe card: unde e, trebuie să fac ceva, unde-mi sunt documentele. Decizia D4 (câte
stări vede clientul din cele 17 interne) se ia acolo.
