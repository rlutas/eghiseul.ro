# 06.10.2026 — eghiseul: scoase cifrele neverificabile din header și de pe prima pagină
<!-- categorie: seo -->

## Pentru echipă

- Pe toate paginile eghiseul, în bara de sus scria „Peste 200.000 documente procesate”. Acum scrie ratingul real de pe Google și numărul de recenzii, cu link spre profil.
- Pe prima pagină și la crearea contului au dispărut „150.000+ / 200.000+ clienți mulțumiți” și promisiunea „Livrare 24-48h” pusă ca termen al documentului. Acum se spune corect: curierul aduce documentul în 24-48 de ore după ce instituția îl eliberează, iar la cazierul judiciar termenul e 3-5 zile lucrătoare.
- Motivul: după penalizarea Google din august nu mai afișăm cifre pe care nu le putem dovedi (aceeași curățenie s-a făcut ieri pe cazierjudiciaronline.com).

---

- `src/components/shared/header.tsx`: top bar = `GOOGLE_RATING` + `SOCIAL_PROOF.roundedDown` reviews, linked to `GOOGLE_REVIEWS_URL`.
- `auth/register`: brand-neutral subtitle, rating from `SOCIAL_PROOF`, "24-48h" and "recunoscute de stat" replaced.
- Home: `hero-section` (H1 tail "Livrare prin Curier", badge "Avocat în Barou"), `why-us-section` (rating badge, courier wording), `testimonials-section` (no 150k stat), `featured-services` (cazier 3-5 zile, matches `services.estimated_days` = 5), `final-cta-section`.
- Removed unused `src/components/home/social-proof-section.tsx` (200,000+ / 150,000+ / 24-48h).
- Rule: `.claude/rules/content-and-seo.md` §3.
