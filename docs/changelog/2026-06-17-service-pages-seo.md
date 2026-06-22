# Changelog & checklist de verificare — 2026-06-17

Sumar al modificărilor din sesiune, ca să poți verifica rapid pe site (după deploy Vercel).
Commits pe `main`: `2d02b3f`, `27710df`, `470b50a`, `4e87813`, `1bd5cf1`, `e04256f`.

---

## 1. Design — toate paginile servicii la același tipar (commit `2d02b3f`)
Referință: `/servicii/extras-de-carte-funciara/`. Toate paginile au acum: Trust strip
după hero, secțiune de recenzii, carduri cu tile gradient + hover, alternanță strictă
a fundalurilor (fără două secțiuni la fel lipite).

**De verificat:** deschide fiecare pagină din `/servicii/` și compară structura cu CF.
Ghid: `docs/design/SERVICE-PAGE-DESIGN-GUIDE.md`.

## 2. Contact — telefon + program corecte (commit `e04256f`)
- **Telefon: +40 757 708 181** (același cu WhatsApp; WhatsApp rămâne canalul preferat).
  Înlocuit peste tot numerele greșite (era +40 312 299 399 / +40 770 194 101).
- **Program: Luni–Vineri 08:00–16:00** (era 09:00–18:00) — în header și footer.

**De verificat:** header (bara de sus), footer, secțiunea CTA de pe homepage, paginile
legale (termeni/politică), pagina cazier judiciar (jos). Telefonul = +40 757 708 181.

## 3. SEO on-page — toate cele 11 pagini servicii (commits `27710df` wave 1 + `4e87813` wave 2)
Pe baza datelor Google Search Console (cuvinte-cheie pe poziții 5-20 cu impresii).
Detalii complete: `docs/seo/service-pages-onpage-optimization-2026-06-17.md`.

Pentru fiecare pagină s-a făcut:
- **Titlu + meta description** rescrise pentru CTR (toate meta erau prea lungi și se
  trunchiau în Google).
- **Conținut nou** țintit pe întrebările căutate (adăugat fără să strice designul).
- **FAQ extins** (apare și ca date structurate FAQ în Google).
- **Linkuri interne** către articolele de blog relevante (ca să nu concureze cu ele).

**De verificat (în Google, caută numele paginii):** titlul afișat în rezultate + textul
de sub el (meta) trebuie să fie cele noi, scurte și clare. Pe pagină: secțiunile noi de
text + FAQ-urile noi.

### Câștiguri SEO notabile
- `localizare teren după număr cadastral` (49.000 impresii, poz. 5) → identificare-imobil.
- Cluster „harta cadastru / cadastru online" (~68.000 impresii, fără pagină dedicată)
  → captat onest pe extras-plan-cadastral.
- Constatator: avea CTR 0,27% (meta de 233 caractere, trunchiată) — rescris.

---

## De făcut / de discutat (NU urgent)
- **Re-verificare Google Search Console peste 2-3 săptămâni** — schimbările de titlu/meta
  pe paginile cu sute de mii de impresii pot mișca pozițiile; vedem ce a funcționat.
- Pagini servicii rămase din wave-uri: TOATE cele 11 sunt acum optimizate. ✅
