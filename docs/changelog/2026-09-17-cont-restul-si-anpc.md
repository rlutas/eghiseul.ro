# 17.09.2026 — Expirarea documentului în cont, linkul ANPC și explicația pentru selfie
<!-- categorie: clienti -->

## Pentru echipă

Restul lucrurilor rămase la contul clientului, plus două chestiuni legale.

- **Contul spune când expiră documentul.** La comenzile finalizate scrie „Documentul
  e valabil până pe 6 martie 2027", iar când se apropie termenul sau a trecut,
  scrie asta și apare butonul **Comandă din nou**. Valabilitățile sunt cele
  legale: cazier judiciar și certificat de integritate 6 luni, cazier fiscal,
  cazier auto, certificat constatator și extras CF 30 de zile. Actele de stare
  civilă nu expiră, deci acolo nu scrie nimic.
- **Clientul care se autentifică ajunge direct la comenzile lui**, nu la catalog.
  Pe telefon, lista de comenzi e primul lucru de pe ecran; „Comandă mai repede
  data viitoare" a coborât sub ea. Cine n-are nicio comandă vede în continuare
  catalogul.
- **Clienții cu multe comenzi le văd pe toate.** Lista se oprea tăcut la 20; acum
  are „Vezi comenzile mai vechi".
- **Pe fiecare pagină apare acum linkul „PROTECȚIA CONSUMATORILOR - A.N.P.C."**
  și „Telefonul Consumatorului: 021 9551", inclusiv pe ecranele de comandă, care
  n-au footer. E o obligație care ne lipsea.
- **Lângă selfie scrie de ce îl cerem, cine compară fețele și cât îl păstrăm.**
  Dacă un client întreabă la telefon, răspunsul e pe ecran.

⚠️ **Ce trebuie decis de Raul:** politica noastră de confidențialitate promite că
ștergem actul și selfie-ul „în termen de 30 de zile de la livrare". Nu există
niciun mecanism care să facă asta. Detalii mai jos.

---

## Ce s-a livrat tehnic

### Expirarea documentului în cont

`src/lib/orders/document-validity.ts` (8 teste) citește aceeași tabelă pe care o
folosesc emailurile de expirare (`src/lib/lifecycle/rules.ts`), cu temeiul legal
scris lângă fiecare număr — Legea 290/2004 art. 27 pentru cazierul judiciar,
OG 39/2015 art. 11 pentru cel fiscal. Numărătoarea e în zile calendaristice, nu
în ore: un document care expiră azi mai târziu scrie „expiră astăzi", nu „mâine".
Serviciile fără valabilitate legală (stare civilă, copii din arhivă) nu primesc
dată — a inventa una ar împinge omul să recomande ceva ce nu-i trebuie.

`GET /api/orders` întoarce acum și `completedAt`.

### Ecranul de start și paginarea

Decizia D2 spunea „comenzile", dar toată lumea ateriza pe catalog. Acum
`initialTab` e `orders` pentru cine are comenzi și `services` pentru cine n-are.

Pe telefon, navigarea contului se desface în jurul conținutului: comutatorul
Comandă/Comenzi deasupra, grila „Datele mele" dedesubt. Înainte, primul ecran al
unui client care revenea era cinci linkuri de setări, cu comanda lui împinsă sub
fold.

Lista de comenzi cerea o singură pagină de 20 și nu mai cerea niciodată a doua.
Acum are buton de încărcare, iar lista albă de statusuri din `?status=` — care nu
conținea `draft`, `paid`, `standby` sau `shipped` — e acum lista reală a
operatorului, deci un filtru viitor nu mai cade tăcut pe „fără filtru".

### ANPC — Ordinul 72/2010 art. 2

**Obligația nu e nouă și nu eram conformi.** Ordinul ANPC 505/2026
(MO 749/04.09.2026) a înlocuit anexele Ordinului 72/2010, dar art. 2 — linkul
vizibil pe prima pagină, denumit exact „PROTECȚIA CONSUMATORILOR - A.N.P.C.",
către adresa oficială ANPC — există din 2010. Aveam doar badge-urile SAL și SOL,
care sunt altă obligație (Legea 363/2007, OG 38/2015, Reg. UE 524/2013) și duc în
subpagini.

Adăugat ca **text**, nu imagine, în footer (deci pe prima pagină) și în
`OrderFlowDisclosure`, fiindcă wizardul, checkout-ul și pagina de succes n-au
footer. Plus „Telefonul Consumatorului: 021 9551" din art. 1.

⚠️ Textul integral al Ordinului 505/2026 **nu a putut fi citit** — e în spatele
autentificării la Monitorul Oficial, iar forma consolidată de pe legislatie.just.ro
încă nu îl include. Titlul e confirmat din listingul MO. Datele comisariatului
județean (anexa 1, înlocuită) NU au fost adăugate: n-am citit anexa nouă și nu
punem contacte neverificate.

### Selfie-ul: de ce, cine compară, cât îl ținem

`SelfieLegalNotice`, montat sub uploaderul de selfie în ambele locuri, cu un
detaliu care conta: **cine compară fețele diferă**. În cont, comparația e
automată, printr-un serviciu Google (Gemini). În wizard, potrivirea automată a
fost scoasă pe 09.06.2026 și compară un coleg în admin. Componenta primește
varianta corectă, ca textul să nu declare un procesator extern acolo unde nu e
niciunul.

Ce NU scrie textul, deliberat: că temeiul ar fi consimțământul explicit
(GDPR art. 9(2)(a)). În flux nu există o bifă separată pentru biometrie —
singurele consimțăminte sunt pe pasul de review, bifate împreună cu termenii, și
vin *după* încărcarea selfie-ului.

Corectat tot acolo: caseta care promitea „la scanare se creează automat profilul
de facturare" — fals de la Faza 3, unde facturarea a devenit opt-in.

### 🔴 Contradicția de retenție, nerezolvată

Trei cifre care se bat cap în cap:

| Sursă | Ce spune |
|---|---|
| Politica de confidențialitate (pagina publică) | actul și selfie-ul **se șterg în 30 de zile de la livrare** |
| `docs/deployment/AWS_S3_SETUP.md` | regulă de lifecycle pe prefixul `kyc/` la **3 ani** |
| Codul | **nimic nu șterge nimic** |

`KYC_VALIDITY_DAYS = 90` e perioada de refolosire, nu de ștergere.
`deleteKycVerification()` există și n-are niciun apelant. `anonymize_expired_drafts`
atinge doar comenzile neplătite și rulează doar când apasă cineva butonul din
Setări — nu e pe niciun cron. Regula S3 de 3 ani e un pas manual din consola AWS
și nu a putut fi verificată de aici.

Nu am ales eu între „construim ștergerea" și „schimbăm textul politicii": prima
variantă înseamnă să ștergem dovezi la 30 de zile după livrare, inclusiv pe
comenzile cu litigiu sau retur, și e o decizie de business, nu de cod.

Build verde, 1926 de teste. Verificat pe telefon (390px) cu cont de test, șters
după.
