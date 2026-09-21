# 21.09.2026 — documentero.ro: primele patru fotografii reale pe site
<!-- categorie: seo -->

## Pentru echipă

documentero.ro are de azi poze proprii (generate după prompturi, fără chipuri
care pretind că sunt echipa, fără text, fără mărci de curier): clienta în ușa
apartamentului cu certificatul, semnătura pe telefon, certificatul pe masă,
cuplul cu certificatul de căsătorie. Nimic de făcut pentru voi; dacă un
client întreabă „cine e în poză”, sunt persoane ilustrative, nu clienți reali.

---

## Ce s-a livrat

- `public/images/documentero/clienta-usa-certificat.webp` → acasă (hero + card
  „Naștere”), naștere (hero + OG), ghidul „procură din străinătate”.
- `semnatura-pe-telefon.webp` → acasă „Pasul 1” (a înlocuit `PhoneSignatureMock`).
- `certificat-pe-masa.webp` → naștere „Situații” (a înlocuit `CertificateMock`),
  ghidul „acte necesare” (copertă + OG).
- `cuplu-certificat-casatorie.webp` → căsătorie (hero + OG), acasă card
  „Căsătorie”.
- Conversie: `sharp`, `resize 1600`, WebP q82, 85–195 KB sursă; `next/image`
  servește variantele pe lățime.
- Poza cu „Cargus” pe plic (`client-acasa-certificat.webp`) nu mai e folosită;
  `curier-livrare-plic.webp` rămâne doar pe extras. `avocat-ghiseu-stare-civila`
  rămâne pe celibat, extras, ghidurile pierdut/apostilă până vin pozele 5–7.
- `docs/documentero/prompturi-poze.md`: tabel „ce lipsește, unde intră”, 1–4
  bifate, 5–11 de generat.
