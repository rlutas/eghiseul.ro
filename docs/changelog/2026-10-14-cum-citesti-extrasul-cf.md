# 14.10.2026 — Cum citești extrasul CF, pe specimen; specimenul anonimizat
<!-- categorie: seo -->

## Pentru echipă

- **Specimenul de extras CF era un extras real**, cu numele proprietarilor, notarul, adresa și codul de verificare. Apărea în formular, pe pagina de serviciu și în articole. Acum e anonimizat (bare închise la culoare peste datele personale) peste tot. Dacă trimiteți clienților poze cu extrase, acoperiți la fel datele.
- Articolul „Cum afli numărul cadastral și numărul de CF” are acum secțiunea **„Cum se citește un extras de carte funciară, rând cu rând”**: specimenul cu 12 zone numerotate, ce înseamnă B5, C3, A1.1, „Referințe”, capcana notărilor din Partea a II-a, glosar și ce verifici înainte să cumperi. Îl puteți trimite clienților care întreabă „ce scrie aici”.

---

## Tehnic

- Imagini anonimizate și **redenumite** (cache-ul `/_next/image` și CDN-ul păstrau versiunea veche sub același URL): `specimens/extras-cf-anonim.png`, `images/extras-cf-specimen-anonim.webp`, `og/services/extras-cf-anonim.png`, `specimens/specimen-cf-antet-anonim.png`; referințele din 7 fișiere actualizate. Originalele rămân în istoricul git (repo public) — decizie deschisă.
- `src/components/articole/cf-specimen-annotated.tsx`: specimen + 12 markere poziționate procentual + legendă text (accesibilitate, crawlere fără JS).
- `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/`: secțiune `#cum-se-citeste` rescrisă (~1.000 cuvinte), 4 FAQ noi, titlu „… unde le găsești și cum citești extrasul”, `DATE_MODIFIED` 2026-10-14. Declanșator: tucamaria.ro pe pagina 1 cu un articol fără document; GSC: „cum arată cartea funciară / un CF” deja aterizează aici (poz. 5–8). Criteriu de split într-o pagină separată: expuneri pe „citești/explicații/partea” la poz. 8–20 în 4–6 săptămâni.
- Linkuri spre `#cum-se-citeste` din pagina de serviciu extras CF (unde „vecinătăți” din Partea I a fost corectat) și din `/valabilitate-extras-de-carte-funciara/`.
- Text verificat cu `clean-user-facing-text`: 0 caractere invizibile, stylometry 0,03.
