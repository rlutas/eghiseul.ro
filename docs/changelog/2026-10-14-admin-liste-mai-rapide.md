# 14.10.2026 — Admin: Abandonuri, Comenzi și Recuperare telefonică se încarcă mai repede
<!-- categorie: admin -->

## Pentru echipă

- Listele din admin (Comenzi, Abandonuri, Recuperare telefonică) se încarcă mai repede. Nu se schimbă nimic din ce vedeți sau apăsați.
- Abandonurile erau cele mai lente (peste 5 secunde): câteva drafturi vechi aveau pozele actelor salvate direct în comandă, iar lista le trimitea de fiecare dată, deși afișa doar numele.

---

## Tehnic

- Măsurat live (Chrome, 14.10): `orders/list` pe `status=abandoned` 5,3 s / **795 KB** (2 drafturi pre-S3 cu `personal.uploadedDocuments[].base64`, ~1 MB); `orders/list` normal 2,0 s / 17 KB; `orders/priority-calls` 3,1 s; `orders/counts` 1,1 s (deja paralel, lăsat).
- `src/lib/admin/slim-customer-data.ts`: înlocuiește `base64` și orice string > 2.000 caractere cu `[fișier]`, păstrând forma; aplicat pe răspunsul `GET /api/admin/orders/list`. Test în `tests/unit/lib/admin/`.
- `orders/list`: cele 6 interogări secundare (note, nr. Barou, ONRC, marcaj „Sunat”, avarii, mesaje necitite) rulează în paralel (`Promise.all`), nu una după alta; marcajul „Sunat” citește doar `customer_data->contact`, nu tot JSON-ul, pe până la 2.000 de comenzi.
- `orders/priority-calls`: coada, indexul plăților și lista „Recuperate” pornesc împreună; „Recuperate” citește doar contactul și numele (`customer_data->contact`, `->personal->>firstName`…), nu tot `customer_data` pe 1.000 de comenzi.
