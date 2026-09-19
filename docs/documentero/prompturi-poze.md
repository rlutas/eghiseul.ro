# Prompturi pentru pozele documentero.ro

Generate de Raul în ChatGPT (sau alt generator), apoi trimise mie. Reguli
valabile pentru toate:

- Fotografie realistă, stil editorial, lumină naturală, obiectiv 35–50 mm,
  profunzime mică, culori neutre. Nu ilustrație, nu 3D, nu stil de stoc.
- Context românesc credibil (bloc, primărie, birou, apartament), fără clișee.
- **Fără text lizibil, fără logo-uri, fără steaguri mari, fără mărci de
  curier.** Documentele apar ca hârtie cu rubrici, nu cu text real.
- Fără chipuri care pretind că sunt echipa sau avocata. Persoanele generate
  sunt clienți anonimi, ilustrativi.
- Export la minimum 1600 px pe latura lungă, PNG sau JPG la calitate maximă.
  Eu le convertesc în WebP și le pun în `public/images/documentero/`.
- Raport: 3:2 pentru benzi și carduri, 5:4 pentru hero, 1:1 unde scrie.

Prompturile de mai jos sunt în engleză, fiindcă generatoarele răspund mai bine.

## 1. Hero acasă (înlocuiește poza actuală, care are „Cargus” pe plic) — 5:4

> Editorial lifestyle photograph, natural window light, shallow depth of field. A Romanian woman in her mid-thirties, casual smart clothes, standing in the doorway of a modern apartment, smiling with relief as she holds an opened plain kraft envelope and a crisp A4 official certificate on watermarked paper. Warm neutral interior, plants, soft morning light. No visible text or logos on the envelope or document, no watermark, photorealistic, 50mm lens, candid, not posed like stock.

## 2. Pasul 1: semnătura pe telefon — 3:2

> Close-up editorial photograph of a person's hands holding a smartphone at a kitchen table, drawing a signature with a finger on a white signature pad on the screen; a cup of coffee and an ID card face down beside the phone. Soft daylight, shallow depth of field, 50mm lens, photorealistic. The phone screen shows only a blank signature box with a green button, no readable text, no logos.

## 3. Situații: certificatul pe masă — 3:2

> Top-down editorial still life on a light wooden table: a Romanian civil-status certificate on watermarked pale paper with a faint coat-of-arms pattern and printed rubric lines, an opened plain kraft envelope, a black pen, reading glasses. Natural side light, soft shadows, muted colors, photorealistic. No readable text, no logos, no flags.

## 4. Pagina de căsătorie: hero — 3:2

> Editorial photograph of a couple in their thirties at a home desk in a Romanian apartment, reviewing an official certificate together next to a laptop; she points at the document, he holds a passport. Warm afternoon light through a window, shallow depth of field, 35mm lens, candid, photorealistic. No readable text, no logos.

## 5. Pagina de extras multilingv: hero (diaspora) — 3:2

> Editorial photograph inside a bright European municipal office (Italy or Spain feel): a young Romanian woman hands a multilingual A4 form on pale paper to a clerk at a modern counter; a child's school backpack on her shoulder. Daylight, shallow depth of field, 35mm lens, candid, photorealistic. No readable text, no logos, no flags.

## 6. Pagina de celibat: hero (alternativă la avocata la ghișeu) — 3:2

> Editorial photograph of a Romanian man in his late twenties on a balcony abroad, video-calling on a laptop, a printed official certificate and a passport on the table beside him, city rooftops in soft focus behind. Golden hour light, 35mm lens, candid, photorealistic. No readable text, no logos.

## 7. Ghiduri: bandă pentru index și articole — 3:2

> Editorial still life on a desk: a stack of official documents on pale watermarked paper, a fountain pen, a rubber stamp lying on its side, a folded map of Romania under the stack, natural daylight from the left, muted green and cream tones, photorealistic, 50mm lens. No readable text, no logos.

## 8. Contact: biroul — 3:2

> Editorial photograph of a small, tidy office in Satu Mare, Romania: a desk with a laptop, a phone, a stack of document folders, a plant, morning light through a window with blinds. No people, no readable text, no logos, photorealistic, 35mm lens.

## 9. Curier la ușă (înlocuire, dacă vrei una fără bloc gri) — 3:2

> Editorial photograph at the entrance of a renovated apartment building in Romania, soft daylight. A courier in a plain dark jacket hands a padded A4 envelope to a woman in her forties holding the door; both relaxed. Shallow depth of field, 35mm lens, candid, photorealistic, no readable text, no brand marks on the jacket or envelope.

## Ce NU se generează

- Poza echipei eDigitalizare (Despre): fotografie reală la birou, pe orizontală, 3:2.
- Portretul avocatei: avem deja fotografia reală.
- Portretul autorului: avem deja fotografia de pe eghiseul.
- Chipurile din recenzii: nu punem chipuri; inițiale.

## Unde se pun

| Poză | Fișier | Pagini |
|---|---|---|
| 1 | `client-acasa-certificat.webp` | acasă (hero), mobil |
| 2 | `semnatura-pe-telefon.webp` | acasă pasul 1 (înlocuiește ilustrația desenată) |
| 3 | `certificat-pe-masa.webp` | acasă „situații” (înlocuiește certificatul desenat), ghiduri |
| 4 | `casatorie-hero.webp` | /certificat-de-casatorie/ |
| 5 | `extras-multilingv-hero.webp` | /extras-multilingv/ |
| 6 | `celibat-hero.webp` | /certificat-de-celibat/ (opțional; acum e avocata la ghișeu) |
| 7 | `ghiduri-banda.webp` | /ghiduri/, articole |
| 8 | `birou-satu-mare.webp` | /contact/ |
| 9 | `curier-livrare-plic.webp` | acasă pasul 3, căsătorie (înlocuire opțională) |
