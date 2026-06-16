# Plan de migrare & launch (WordPress → Next.js)

**Status:** PRE-LAUNCH (nu s-a făcut cutover) · **Domeniu țintă:** `eghiseul.ro` (acum WP) → Vercel (Next.js, acum pe `eghiseul-ro.vercel.app`)
**Ultima actualizare:** 2026-06-16

> Scop: să știm EXACT ce e gata, ce mai lipsește și ce trebuie făcut pe fiecare pagină înainte de a muta DNS-ul. **NU s-a creat încă niciun redirect nou** (doar documentăm).

---

## 1. GO / NO-GO — blocante înainte de cutover

| # | Blocant | Impact | Status |
|---|---|---|---|
| 🔴 1 | **Calculatoarele `/calculator/*` NU sunt construite**, dar sunt în `HARDCODED_CALCULATOR_SLUGS` și **sitemap-ul le emite** → 404 + sitemap cu URL-uri moarte. Pe WP calculatoarele aduceau trafic mare. | 404 masiv + pierdere trafic | ❌ DE FĂCUT |
| 🔴 2 | **`/contact` nu există** ca pagină (doar ancoră pe home). WP `/contact/` avea ~2.374 clicks. | 404 pe pagină cu trafic | ❌ DE FĂCUT (pagină sau redirect) |
| 🔴 3 | **Pagini legale lipsă**: `/termeni-si-conditii/`, `/politica-de-confidentialitate/`, `/cookies-policy/`. | 404 + lipsă conformitate/trust | ❌ DE FĂCUT |
| 🟠 4 | **Redirect-uri WP → Next neacoperite** pentru URL-urile vechi care își schimbă forma (vezi §3). | pierdere link equity | ⚠️ PARȚIAL (16 redirecturi există) |
| 🟠 5 | **Stripe LIVE keys + webhook pe domeniul nou**, Oblio, env vars producție pe Vercel. | plăți eșuate la lansare | ⚠️ DE VERIFICAT |
| 🟡 6 | **Buton global WhatsApp** (floating) — promis, încă nefăcut. | UX/conversie | ❌ DE FĂCUT |
| 🟡 7 | **Link real Google Business Profile** pentru badge-ul de recenzii (acum fallback search). | trust | ⚠️ DE ÎNLOCUIT (`src/config/contact.ts → GOOGLE_REVIEWS_URL`) |
| 🟡 8 | **OG images per-serviciu** (acum `/og/default.png` branded pentru toate). | social CTR | ⚪ nice-to-have |

**Regula:** nu facem cutover până nu sunt rezolvate 🔴 1-3 (altfel pierdem trafic pe 404). 🟠 4-5 obligatoriu de verificat. Restul pot urma după lansare.

---

## 2. Ce E GATA (live pe preview, prerendat static, build verde)

| Tip | Pagini | Status |
|---|---|---|
| **Servicii** (11) | extras-de-carte-funciara, identificare-imobil, extras-plan-cadastral, cazier-judiciar-online (+ PF/PJ), cazier-fiscal-online, cazier-auto-online, certificat-constatator-online, certificat-de-integritate-comportamentala, eliberare-certificat-de-{nastere,casatorie,celibat} | ✅ |
| **Articole** (16) | toate din `HARDCODED_ARTICLE_SLUGS` (root path, paritate WP) | ✅ |
| **Blog** | `/blog/` arhivă | ✅ |
| **Tool** | `/tools/verificare-rovinieta-online/` | ✅ |
| **Index** | `/`, `/servicii/` | ✅ |
| **Infra SEO** | sitemap, robots (AI crawlers ✓), schema @graph + FAQPage, canonical→eghiseul.ro | ✅ |

Fiecare pagină de serviciu are: hero + price card (split TVA) + sticky CTA mobil + OrderButton (hover arrow) + WhatsApp CTA + Google Reviews badge + schema completă.

---

## 3. Harta URL WP → Next + redirecturi

### 3a. Redirecturi DEJA în `next.config.ts` (16) — slug-uri DB/vechi → URL canonic
`/services/:slug` → `/servicii/:slug/`; `/servicii/<slug-DB>` → URL WP canonic (cazier-judiciar, extras-carte-funciara, cazier-fiscal, cazier-auto, certificat-{nastere,casatorie,celibat,constatator,integritate}); rovinieta-online → tool. ✅

### 3b. Redirecturi / pagini DE ADĂUGAT înainte de cutover
| URL vechi WP (cu trafic) | Acțiune | Status |
|---|---|---|
| `/calculator/calculator-impozit-auto/`, `/varsta-pensionare/`, `/salariu/`, `/tva/`, etc. | **Construiește paginile** (sunt deja în sitemap) SAU scoate-le din sitemap până sunt gata | ❌ |
| `/contact/` | Creează pagină `/contact` (formular + date firmă) sau redirect la `/#contact` | ❌ |
| `/termeni-si-conditii/`, `/termeni-si-conditii-rapidcert-srl/` | Creează pagină legală | ❌ |
| `/politica-de-confidentialitate/` (+ varianta webserv) | Creează pagină legală | ❌ |
| `/cookies-policy/` | Creează pagină legală | ❌ |
| `/magazin/`, `/contul-meu/` | Redirect → `/servicii/` resp. `/account` | ❌ |
| `/categorii_servicii/*`, `/category/*` | Redirect → `/servicii/` sau articolul relevant | ❌ |
| `/wp-content/uploads/*` (PDF-uri contract, imagini) | 410/redirect dacă nu mai există; verifică linkurile externe | ⚠️ |

> Articolele păstrează URL-ul WP la root (fără prefix) — **fără redirect necesar**. La fel serviciile cu pagină WP-slug.

---

## 4. Procedura de cutover (ziua Z)

**Pre (cu 24-48h înainte):**
1. Rezolvă blocantele 🔴 1-3.
2. Setează TTL DNS mic (300s) pe `eghiseul.ro`.
3. În Vercel: adaugă domeniile `eghiseul.ro` + `www.eghiseul.ro` la proiect.
4. Verifică env vars producție pe Vercel (Supabase, Stripe LIVE, Oblio, AWS S3, Resend, SMSLink, CRON_SECRET).
5. Export final GSC (baseline poziții/trafic) + backup WP (DB + fișiere).

**Cutover (fereastră trafic mic):**
6. Schimbă DNS A/CNAME → Vercel (conform Vercel Domains). Așteaptă propagare + SSL auto.
7. Verifică `https://eghiseul.ro` servește Next (nu WP) + `https://www.` → redirect la apex.

**Imediat după:**
8. GSC: adaugă/confirmă proprietatea `https://eghiseul.ro`, **submit `sitemap.xml`**, Request indexing pe top 20 pagini.
9. Bing Webmaster Tools: la fel.
10. `curl -I` pe 20-30 URL-uri vechi WP (servicii + articole + legal) → confirmă 200 sau 301 corect, **zero 404**.
11. Verifică plata end-to-end (o comandă reală test) + webhook Stripe + emitere factură Oblio.

---

## 5. QA post-launch (săpt. 1-2)
- GSC Coverage: monitorizează 404/redirect errors zilnic.
- GSC Core Web Vitals (field) începe să curgă — verifică INP/LCP/CLS.
- Verifică formularele de comandă pe fiecare serviciu (PF/PJ, stare civilă etc.).
- Verifică `robots.txt` live + `sitemap.xml` live (URL-uri eghiseul.ro).
- Analytics: confirmă tracking (GA/Plausible) pe domeniul nou.

## 6. Rollback
- Păstrează WP-ul intact (nu șterge) min. 30 zile. Dacă apare o problemă critică → revii DNS la WP (de aceea TTL mic). Backup DB + fișiere WP înainte.

---

## 7. Checklist sintetic înainte de „GO"
- [ ] 🔴 Calculatoare construite (sau scoase din sitemap).
- [ ] 🔴 Pagină `/contact`.
- [ ] 🔴 Pagini legale (termeni, confidențialitate, cookies).
- [ ] 🟠 Redirecturi WP→Next pentru categorii/magazin/cont/uploads.
- [ ] 🟠 Env vars producție + Stripe LIVE + webhook + Oblio testate.
- [ ] 🟡 Buton global WhatsApp.
- [ ] 🟡 `GOOGLE_REVIEWS_URL` real (GBP).
- [ ] DNS TTL mic setat, domenii adăugate în Vercel, backup WP.
- [ ] După cutover: sitemap submit GSC/Bing + indexare + QA 404 + test plată.

---

*Vezi și `docs/seo/seo-audit-and-ranking-plan.md` (audit tehnic + plan ranking/backlinks) și `docs/seo/competitor-analysis-extras-carte-funciara.md`.*
