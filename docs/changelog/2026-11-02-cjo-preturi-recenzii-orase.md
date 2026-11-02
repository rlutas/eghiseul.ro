# 02.11.2026 — CJO: aceleași prețuri ca pe eghiseul, recenzii reale, pagini noi pentru Iași, Brașov, Timișoara
<!-- categorie: seo -->

## Pentru echipă

- **Prețurile pe cazierjudiciaronline.com sunt acum identice cu eghiseul.ro:** cazier judiciar, auto și integritate 198 lei (3–5 zile lucrătoare), urgent 278 lei (1–2 zile), cetățean străin 298 lei; cazier fiscal 198 lei (1–3 zile). Integritatea adăugată la cazier costă 100 lei.
- **Reducerea ONLINE10 nu se mai aplică singură.** Prețul afișat e prețul plătit. Cuponul există în continuare: dacă un client îl tastează, primește 10%.
- **Comenzile vechi** își păstrează în admin prețul plătit atunci (de exemplu 270 la urgent).
- **Recenziile inventate de pe CJO au fost scoase.** În locul lor sunt recenzii reale de pe profilul Google eGhișeul.ro, cu mențiunea că e aceeași firmă.
- **Paginile de cazier pentru Iași, Brașov și Timișoara** încep acum cu adresele și programul tuturor ghișeelor din oraș, verificate pe site-urile Poliției, apoi cu butonul „Comandă online”. Dacă un client întreabă de program, răspunsul e acolo.

---

## Tehnic

Totul în repo-ul CJO (`cazierjudiciaronline.com`), pe `main`.

- **Recenzii** (`5c665293`): `TestimonialsSection` cu 5 recenzii 5★ verbatim (cazier/integritate) din profilul Google eGhișeul.ro, citite pe 19.09.2026, cu sursa în pagină și link. Scoasă schema `Review` de pe 5 noduri `Product` (homepage, auto, fiscal, integritate, diaspora); „441 recenzii” → „peste 470” pe 2 pagini. Regula 3 din `.claude/rules/content-and-seo.md`.
- **Prețuri** (`7dfec72e`, `9054f56b`): `service-configs.ts`, `auto.config.ts`, `fiscal.config.ts`, `integritate.config.ts` fără `autoDiscountPct`; `sheet-price.ts` păstrează prețul istoric pentru comenzile create înainte de `BMR_ONLINE10_RETIRED_AT` (02.11.2026 08:50 UTC). Texte, FAQ, schema și `llms.txt` actualizate. Efect pe ecazier: integritate cetățean străin 317 → 298 (config comun). Decizie: `docs/decisions/2026-11-02-preturi-identice-eghiseul.md` (CJO).
- **Pagini de oraș** (`a15dcb99`): `src/config/city-guides.ts` + `CityGuideView.tsx` pentru Iași, Brașov, Timișoara. Title „Cazier judiciar <Oraș> — program ghișee, adrese, online”, „Pe scurt” + CTA în primul ecran mobil, toate ghișeele (surse Poliție, verificate 02.11), 8 FAQ locale, `GovernmentOffice` cu `OpeningHoursSpecification`, linkuri spre județele vecine în locul blocului de 38 de orașe. Similaritate între cele 3: 0,15–0,16 normal, 0,17–0,18 mascat. De urmărit 2 săptămâni: formularele începute pe cele 3 pagini; la scădere de peste 25%, formularul revine sub „Pe scurt”. Detalii: `docs/seo/2026-11-02-orase-pe-scurt-iasi-brasov-timisoara.md` (CJO).
- Analiza care a dus aici: concurenții pe organic (caziere.ro, cazierul-judiciar-online.ro, infocazier.ro), 02.11.2026.
