# 12.10.2026 — Situația vânzărilor, documentul pentru echipă și demersurile (Google, Poliție, ANSPDCP)
<!-- categorie: comenzi -->

## Pentru echipă

- În 1–12 octombrie am încasat ~10.100 lei, față de ~24.800 lei în 1–12 septembrie (−59%). Plata funcționează, iar clienții care ajung la plată plătesc. Problema e că vin mai puțini oameni din Google.
- Fiecare client care a început o comandă contează. Sunați zilnic din **Recuperare telefonică** (eGhiseul și CazierJudiciarOnline), iar pe CazierJudiciarOnline și din **Abandonuri**, începând cu pașii 5–6. Marcați fiecare apel cu o notă.
- Documentul complet pentru echipă (cifre, ce face fiecare, cum sunăm): `docs/admin/2026-10-12-situatia-vanzari-echipa.pdf`.
- Reclamele Google pe caziere rămân blocate. Raul a depus plângeri oficiale (vezi mai jos), dar rezultatul durează luni.

---

## Ce s-a făcut pe 12.10

**Verificarea vânzărilor** (toate platformele, din DB):
- 1–12 sept. vs 1–12 oct.: eghiseul 11.264 → 6.740 lei; CJO 13.560 → 3.192; ecazier 0 → 198; documentero 0.
- Pe CJO, raportul dintre formularele începute și clicurile din GSC a revenit la ~10% după reparația din 08.10, deci pagina convertește din nou. Lipsesc afișările și clicurile din Google: pe 09.10, 282 de clicuri, față de ~550.
- Stripe: nicio plată pierdută; webhook-ul funcționează.
- Recuperarea telefonică: pe CJO 0 apeluri marcate de la lansare (06.10). Coada CJO nu include sesiunile de la pașii 3–6, care apar doar la „Abandonuri”: 277 de sesiuni cu telefon în 14 zile.
- Detalii: jurnalul din 12.10 din `2026-10-plan-a-z-vanzari.md`.

**Demersurile** (registrul complet: `ads/registru-demersuri.md`):
- Răspunsul IGPR nr. 407.976 (cerere 544 prin avocata Țarța): confirmă calea prin avocat (art. 31, L. 290/2004, doar PF; la PJ, Anexa 38 din HG 345/2010). Nu spune explicit că nu există un regim de autorizare pentru firme. Ciornă de precizare cu cerința Google citată: `ads/2026-10-12-cerere-544-igpr-precizare.txt`.
- Al treilea răspuns către Google (tichetul 6-4960000040774), ciornă cu termen 26.10: `ads/2026-10-12-email-google-raspuns-3.txt`.
- Cookie-uri fără acord: test în browser curat pe 11 site-uri. CJO și ecazier au fost reparate întâi (`2026-10-12-cjo-ecazier-banner-cookie.md`). Apoi **4 plângeri ANSPDCP trimise** de Raul (caziere.ro, obtinecazier.ro, eliberarecazier.ro, roghiseul.ro). Dovezile: `ads/dovezi-cookie-2026-10-12/` (rapoarte PDF din `scripts/cookie-evidence.mjs`).
- Pașii următori după 26.10: mediere P2B prin CEDR, plângere DSA la ANCOM, sesizare la Consiliul Concurenței.
