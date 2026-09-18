# 18.09.2026 — De ce avem multe abandonuri și de ce emailurile aduc puțin

Analiză pe datele din producție (ultimele 30 de zile, fără comenzi de test),
la cererea lui Raul. Cifrele sunt din `orders`, `order_history`,
`lifecycle_emails`, `contacts` și din API-ul Resend.

## 1. Unde se pierd comenzile: în wizard, la pasul 2, nu la plată

| | 30 zile |
|---|---|
| Comenzi începute (au trecut de pasul 1: email + telefon) | 291 |
| Plătite | 116 (40%) |
| Neplătite | 175 |
| …din care oprite la **primul pas cu date** (`property-data` / `personal-data`) | **113 (65% din neplătite)** |
| …oprite la facturare (`billing`) | 37 |
| …altele (opțiuni, livrare, semnătură, acte) | 25 |

Ce au completat cei 113 opriți la pasul 2:

- **66 la date imobil** (extras CF, identificare imobil, plan cadastral):
  **0** au scris un număr de CF / cadastral, **0** o adresă. Au ajuns pe pas
  și au plecat fără să tasteze nimic.
- **47 la date personale** (cazier, certificat naștere, celibat, cazier auto):
  9 au scris CNP, 6 un nume, 3 au urcat un act. Restul nimic.

Deci nu e „am completat și m-am blocat la plată" — e **„am dat emailul și
telefonul, am văzut ce urmează și am plecat"**. Pasul 1 cere date de contact
înainte ca omul să vadă ce trebuie să facă; la pasul 2 vede că trebuie CF-ul /
poza buletinului / selfie și renunță (sau doar voia prețul).

Pe servicii, rata de plată din comenzile începute:

| Serviciu | Începute | Plătite | % |
|---|---|---|---|
| certificat-constatator | 33 | 23 | 70% |
| extras-carte-funciara | 85 | 39 | 46% |
| cazier-judiciar PF | 39 | 17 | 44% |
| identificare-imobil | 30 | 9 | 30% |
| cazier-auto | 13 | 3 | 23% |
| certificat-nastere | 22 | 3 | 14% |
| certificat-celibat | 11 | 0 | 0% |

Constatatorul (doar CUI, fără act) convertește dublu față de tot ce cere
buletin sau CF. Certificatele de stare civilă aproape deloc.

## 2. Emailurile de recovery: merg, dar nu pot recupera ce nu a început

- 202 emailuri trimise în 30 de zile, către 165 de comenzi; **10 plătite după
  email (6%)** — toate din emailul vechi, unic, cu cupon (înainte de 14.09).
- Secvența nouă în 3 pași (din 14.09): 31 de comenzi intrate, 12 au ajuns la
  pasul 3 (cupon), **0 plătite** până acum. Prea devreme pentru verdict (4
  zile), dar tendința nu e bună.
- Cupoanele RECOVERY: toate cu `times_used = 0` în ultimele zile.
- Livrare: 98/100 din ultimele emailuri Resend = `delivered`, 1 bounce, 1
  suppressed. Nu e problemă de livrare.
- **Nu știm dacă sunt deschise sau clicate**: `open_tracking` și
  `click_tracking` sunt **OFF** pe domeniul eghiseul.ro în Resend. Zero
  vizibilitate pe deschideri și clicuri, pentru toate emailurile.
- Motivul structural: emailul trimite omul înapoi la pasul unde a plecat
  („Reia comanda"). Pentru 65% dintre ei pasul ăla e exact motivul plecării
  (buletin/CF). Emailul reamintește obstacolul, nu-l scoate.

## 3. Lifecycle și warmup: trimit, nu produc (încă) nimic măsurabil

| Email | Trimise 30 zile | Comenzi plătite după |
|---|---|---|
| expiry_reminder (act expiră) | 157 | 0 |
| cross_sell | 125 | 0 |
| review_request | 32 | 0 (nu e scopul lui) |
| warmup „s-a schimbat de când ne-ai scris" | 125 (25/zi, 50/zi din 18.09) | 0 (1 comandă începută) |

Warmup: 72.292 contacte în coadă, 0 dezabonări, 0 bounce-uri până acum — bun
pentru reputație, dar la 50/zi coada durează 4 ani. Numele din subiect vin
uneori cu majuscule din import („TABAN, eGhișeul.ro…", „RAUL-CĂTĂLIN, …").

## 4. Ce recomand, în ordinea impactului

1. **Wizard: arată prețul și lista „ce ai nevoie" ÎNAINTE de a cere email +
   telefon**, pe pasul 1 (specimen + „ai nevoie de: poza buletinului, selfie,
   ~3 minute"). Cine vine doar pentru preț pleacă înainte să lase date; cine
   rămâne știe ce urmează. Se măsoară simplu: rata pas 1 → pas 2 completat.
2. **Pasul 2 fără fricțiune la intrare**: la imobiliare, întâi „nu știi
   CF-ul? te ajutăm după adresă" (identificare-imobil e deja serviciu); la
   cazier, permite continuarea fără poză (poza se cere la final, înainte de
   plată, sau după plată prin link — 23% din caziere auto plătesc, restul
   pleacă la poză).
3. **Recovery pentru cei opriți la pasul 2 = alt mesaj**: nu „reia comanda",
   ci „ce te-a oprit? răspunde cu 1/2/3: nu am CF-ul / nu am poza / voiam doar
   prețul" + WhatsApp. E singurul canal care poate afla motivul real; azi
   ghicim.
4. **Pornește tracking-ul în Resend** (deschideri + clicuri) pe eghiseul.ro —
   fără el nu putem spune dacă emailurile nu se deschid sau nu conving.
   Atenție: click tracking rescrie linkurile; de urmărit dacă scade
   livrabilitatea în prima săptămână.
5. Warmup: normalizează numele (Title Case) în subiect și crește lotul treptat
   (50 → 100 → 200) cât timp dezabonările stau sub 0,5%.
6. Instrumentare minimă în wizard: un eveniment „pas afișat / pas completat"
   per pas, ca să vedem drop-ul pe pas fără să deducem din drafturi.

## 5. Ce NU e problema

- Livrarea emailurilor (98% delivered).
- Cronurile (recovery la 15 min, lifecycle 07:20, warmup 07:00 rulează;
  secvența avansează 1 → 2 → 3 corect).
- Codul de resume (`?order=&email=`) — draftul se restaurează cross-device;
  linkul din email e corect construit.
