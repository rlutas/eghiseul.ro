# 14.10.2026 — Admin: Abandonuri, Comenzi și Recuperare telefonică se încarcă mai repede
<!-- categorie: admin -->

## Pentru echipă

- Listele din admin (Comenzi, Abandonuri, Recuperare telefonică) se încarcă mai repede. Nu se schimbă nimic din ce vedeți sau apăsați.
- Numărătorile de pe taburi (Toate, Plătite, Neplătite…) se pot actualiza cu până la 20 de secunde întârziere după ce mutați o comandă: se țin minte câteva secunde ca paginile să se încarce mai repede.
- Abandonurile erau cele mai lente (peste 5 secunde): câteva drafturi vechi aveau pozele actelor salvate direct în comandă, iar lista le trimitea de fiecare dată, deși afișa doar numele.

---

## Tehnic

- Măsurat live (Chrome, 14.10): `orders/list` pe `status=abandoned` 5,3 s / **795 KB** (2 drafturi pre-S3 cu `personal.uploadedDocuments[].base64`, ~1 MB); `orders/list` normal 2,0 s / 17 KB; `orders/priority-calls` 3,1 s; `orders/counts` 1,1 s (deja paralel, lăsat).
- **Rezultat live după deploy:** Abandonuri 5,3 s / 795 KB → **1,7 s / 8 KB**; Recuperare telefonică 3,1 s → **0,9 s**; Comenzi 2,0 s → **1,4 s** (prima încărcare după deploy 2,9 s, instanță rece).
- `src/lib/admin/slim-customer-data.ts`: înlocuiește `base64` și orice string > 2.000 caractere cu `[fișier]`, păstrând forma; aplicat pe răspunsul `GET /api/admin/orders/list`. Test în `tests/unit/lib/admin/`.
- `orders/list`: cele 6 interogări secundare (note, nr. Barou, ONRC, marcaj „Sunat”, avarii, mesaje necitite) rulează în paralel (`Promise.all`), nu una după alta; marcajul „Sunat” citește doar `customer_data->contact`, nu tot JSON-ul, pe până la 2.000 de comenzi.
- `orders/priority-calls`: coada, indexul plăților și lista „Recuperate” pornesc împreună; „Recuperate” citește doar contactul și numele (`customer_data->contact`, `->personal->>firstName`…), nu tot `customer_data` pe 1.000 de comenzi.
- `orders/counts` (22 de COUNT exacte): cache în memorie 20 s pe instanță, cheiat pe tot setul de filtre; autentificarea și permisiunea rulează la fiecare cerere.
- `knowledge/feed` (badge-ul „noutăți” din meniu, pe fiecare pagină din admin): changelog-ul se parsează o dată pe instanță (se schimbă doar la deploy) + `Cache-Control: private, max-age=300`.
- **Migrarea 193** `customer_data_list(orders)` (funcție SQL, câmp calculat PostgREST, doar `service_role`): `customer_data` fără `signature_metadata`/`signature` și fără `base64`/`dataUrl` din `personal(.Data).uploadedDocuments`. Folosită în `orders/list` și în coada `priority-calls` (`select=customer_data:customer_data_list`). Cauza reală: **103 drafturi** cu ~2,5 MB de poze inline fiecare; 300 de drafturi din coada de sunat: 20 MB / 1,8 s → 0,6 MB / 0,6 s.
- De investigat separat: un draft din 18.09 (E-260918-73NQJ) are încă poze base64 în `customer_data`, deci un pas din formular le mai salvează inline.
- **Măsurat live după migrarea 193:** Abandonuri 1,2 s / 7 KB (era 5,3 s / 795 KB), Comenzi 1,4–1,7 s, Recuperare telefonică ~1,0 s (era 3,1 s), noutăți Ghid 0,04 s (era 0,6–1,3 s), numărători 0,6 s din memorie. Ce rămâne pe fiecare cerere e verificarea contului (~0,4–0,5 s).
