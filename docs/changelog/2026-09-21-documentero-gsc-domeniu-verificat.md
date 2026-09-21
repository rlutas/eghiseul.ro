# 21.09.2026 — documentero.ro: proprietatea de Domeniu din Search Console, verificată
<!-- categorie: seo -->

## Pentru echipă

documentero.ro apărea „neverificat” în Google Search Console pe contul cu care
ne uităm la eghiseul (serviciiseonethut@gmail.com). Nu era o problemă a
site-ului: Google ceruse o înregistrare în DNS pe care nimeni n-o pusese. A fost
adăugată azi și proprietatea e verificată. Nimic de făcut de partea echipei.

Când vă uitați la cifrele documentero în Search Console: contul
serviciiseonethut vede proprietatea `documentero.ro` (Domeniu), contul
sishuletz vede `https://documentero.ro/` (URL-prefix). Sunt același site; ambele
au sitemap-ul cu 16 pagini.

---

## Ce era

- Pe 20.09 s-a adăugat în GSC, pe serviciiseonethut@gmail.com, o proprietate
  de tip **Domeniu** (`sc-domain:documentero.ro`). Tokenul ei (`R5wF7Ny…`) a
  fost pus DOAR ca meta tag în `src/app/documentero/layout.tsx`, cu un
  comentariu care spunea că e și TXT în Vercel. Nu era: zona DNS avea doar
  `_dmarc`, `resend._domainkey`, `send` (SPF/MX Resend), CAA și ALIAS-urile.
- O proprietate de tip Domeniu se verifică NUMAI prin DNS (TXT sau CNAME);
  meta tag-ul verifică doar proprietăți URL-prefix. De-aia pe 21.09 dimineața
  s-a verificat separat URL-prefix `https://documentero.ro/` pe
  sishuletz@gmail.com (token `fsG8Dsy…`), iar cea de Domeniu a rămas
  „neverificată”.

## Ce s-a făcut (21.09, după-amiază)

1. Verificat în Playwright: sishuletz (`/u/1/`) = URL-prefix „You are a
   verified owner” (HTML tag); serviciiseonethut (`/u/0/`) = Domeniu, ecranul
   „Confirmă proprietarul domeniului prin înregistrarea DNS”, TXT cerut
   `google-site-verification=R5wF7NyinN-jw_HtDSh2i1ytJxpLSV4WIsVUOblPQyA`.
2. `dig TXT documentero.ro` (și pe `ns1.vercel-dns.com`): gol.
3. TXT adăugat prin API Vercel (`POST /v2/domains/documentero.ro/records`,
   team `team_Y2JaMap2joKFxAOHC4MI5C9o`, token din `auth.json` al Vercel CLI;
   record `rec_94266d44a7838428ee32bc44`, TTL 60). Prima încercare a fost
   blocată de clasificatorul auto mode (schimbări DNS); a doua, după OK-ul lui
   Raul, a trecut.
4. „Confirmă calitatea de proprietar” → „Calitatea de proprietar a fost
   confirmată automat. Metoda: Furnizor de nume de domeniu”.
5. Sitemaps pe proprietatea Domeniu: `sitemap.xml`, Succes, 16 pagini (Google
   îl arată pe ambele proprietăți; nu a trebuit retrimis).
6. Comentariul din `layout.tsx` corectat (cine e fiecare token, unde e
   verificat, „nu ștergeți TXT-ul”).

## Reguli

- **Nu ștergeți TXT-ul `google-site-verification=R5wF7Ny…`** din zona Vercel
  a documentero.ro: fără el proprietatea de Domeniu pică din nou.
- Proprietate GSC de tip Domeniu = TXT în DNS, nu meta tag. Verificați cu
  `dig +short TXT <domeniu>` înainte să apăsați „Verifică”.
- Schimbările DNS prin API/CLI au nevoie de OK explicit de la Raul în sesiune
  (clasificatorul le blochează altfel).

Docs: `docs/documentero/lansare.md` (lista de lansare + istoric),
`docs/documentero/README.md` (stare).
