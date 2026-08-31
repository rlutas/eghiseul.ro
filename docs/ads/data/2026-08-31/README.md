# Export cont eGhiseul 677-995-5005 — 31.08.2026 (înainte de curățenie)

Datele istorice ale contului vechi, exportate ÎNAINTE de curățenia campaniilor moarte,
ca economia celor **2.089.538,89 RON cheltuiți / 962.647 clicuri / 7,42M afișări**
(toată perioada, 5 ian 2024 – 31 aug 2026) să rămână în proiect.

| Fișier | Ce conține |
|---|---|
| `termeni-cautare-agregat.csv` | top 400 termeni de căutare după conversii apoi cost, FILTRAT (≥5 clicuri sau conversii>0, fără termeni cu potențial PII — numere lungi, emailuri, fraze >6 cuvinte). Sursa brută are 53.069 termeni și stă NECOMISĂ în `../raw/` (gitignored) — poate conține nume căutate de utilizatori. |
| `cuvinte-cheie-toata-perioada.tsv` | toate cele ~640 cuvinte cheie cu statistici complete (QS, cotă afișări, conversii) |
| `anunturi-toata-perioada.tsv` | toate cele ~44 anunțuri cu textele și performanța lor |

Campaniile (nivel agregat) NU s-au putut exporta din UI (butonul de download a refuzat de
2 ori pe pagina Campanii); cifrele per campanie sunt în capturile din analiza
`../../2026-08-18-analiza-cont-si-repornire.md` și pot fi reconstruite din cele două TSV-uri.

## Cifrele care contează (din termeni)

| Termen | Clicuri | Cost | Conversii |
|---|---|---|---|
| cazier judiciar online | 135.045 | 308.062 RON | 2.988 |
| extras de carte funciara (+ variante) | ~35.000 | ~168.000 RON | ~3.840 |
| certificat constatator online (+onrc) | ~13.500 | ~120.000 RON | ~1.550 |
| cazier fiscal online | 16.411 | 28.344 RON | 772 |

Observație: conversiile istorice sunt „Purchase"-uri mixte (multe micro-conversii în
epoca WP) — valorile absolute nu se compară direct cu conversiile de azi; rapoartele
de valoare (valoare_conv) sunt 0 pe perioada veche pentru că valoarea s-a trimis abia
din 2026. Pentru economie per serviciu folosește tabelul de marje din analiza 18.08.
