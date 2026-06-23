# Changelog — 2026-06-23 · Redesign homepage + Google Ads compliance

Homepage-ul Next.js a fost reconstruit secțiune-cu-secțiune după design-ul de pe eghiseul.ro
(WP live), plus o curățare globală a sintagmei „documente oficiale" pentru politica Google Ads.

---

## 1. Homepage — secțiuni refăcute (design WP)
Ordinea finală a homepage-ului (`src/app/page.tsx`):

1. Hero
2. **Cum funcționează în 3 pași** (`how-it-works-section`) — mutat sub hero; 3 carduri + bară trust.
3. **Servicii Disponibile** (`featured-services`) — header 2-col cu poză, categorii PF (12) / PJ (4),
   carduri cu imaginea-specimen a documentului + badge Popular/Nou, CTA WhatsApp.
4. **De ce eGhișeul** (`why-us-section`) — redesign premium: glow gold, chip plutitor „Avocat în
   Barou", badge „150k+", icon-tiles gradient, stats în carduri.
5. **Recenzii Google** (`testimonials-section`) — fundal dark + pattern, 6 recenzii reale din
   `config/reviews.ts`, stats, CTA dublu (lasă recenzie / vezi toate). Fără plugin Trustindex.
6. **Situații frecvente** (`use-cases-section`) — refăcut în stil premium (eyebrow cu linii gold,
   icon-tiles gradient).
7. **FAQ** (`faq-section` + `faq-data.tsx`) — extins la 15 întrebări cu răspunsuri bogate (liste +
   **linkuri interne** către hub-uri = bonus SEO). `HOMEPAGE_FAQS` derivat (plain) pentru FAQPage schema.
8. **Articole** (`articles-section`).
9. **CTA final** (`final-cta-section`) — redesign: gradient + glow-uri + trust badges.

**Scoase:** `PricingSection` („Alege varianta potrivită") + `PainPointsSection` („Uită de
frustrările administrației publice") + `social-proof-section` + `trust-section` (orfane, șterse).

### Imagini noi (luate de pe eghiseul.ro → webp optimizat)
`public/images/specimens/{rovinieta,extras-multilingv-nastere,extras-multilingv-casatorie}.webp`,
`public/images/servicii-header.webp`, `public/images/de-ce-eghiseul.webp`.

### Alternanță fundaluri (fix)
`articles-section` mutat pe `bg-neutral-50` ca să nu fie două secțiuni albe lipite (FAQ + Articole).
Schemă finală: dark · n50 · white · n50 · dark · n50 · white · n50 · dark.

## 2. Google Ads — eliminat „documente oficiale" (politica governmental documents)
Un account manager Google Ads a confirmat că sintagma **„documente/acte oficiale"** declanșează
politica „governmental documents and official services" și limitează contul. Am scos adjectivul
„oficiale/oficial" de lângă document/act în **tot `src`** (~119 apariții, 55 fișiere), păstrând
„documente"/„acte" + numele concrete (cazier, certificat, extras) pentru SEO.

- Title homepage: „Documente **Oficiale** Online…" → „Documente Online: Cazier, Carte Funciară".
- Păstrate intenționat (NU sunt „documente oficiale"): „taxa oficială", „platforma oficială"
  (= portalul guvernamental, util pentru dezambiguizare), „înregistrate oficial" (adverb),
  disclaimer „documentul rămâne gratuit și oficial".

**De verificat la cutover:** după go-live, trece landing-page-urile de Ads prin Google Ads policy
checker. Memoria proiectului: [[google-ads-documente-oficiale]].

## 3. Meniu
Adăugate `extras-multilingv-{nastere,casatorie}` în mega-meniul Servicii (categoria Personale).
Card „Certificat Constatator Persoană Fizică" (după CNP) la PF.
