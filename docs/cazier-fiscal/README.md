# cazier-fiscal.ro: al treilea brand, doar cazier fiscal

**Stare (10.11.2026):** codul e gata pe branch-ul `feat/brand-cazier-fiscal`. Site-ul nu e încă live. Pentru lansare lipsesc trei lucruri, listate mai jos.

## De ce

Raul a decis pe 10.11.2026, după ce a văzut cazierauto.ro peste noi pe „cazier auto”. cazierauto.ro e un site mic cu un singur subiect: domeniu înregistrat pe 12.11.2025, live din iunie 2026, 8 pagini.

Pe căutările de cazier fiscal (GSC, 11.10–08.11.2026):

| Căutare | Afișări | CJO | eghiseul |
|---|---|---|---|
| cazier fiscal online | 1.730 | poz. 7,1 | poz. 61 |
| cazier fiscal | 983 | poz. 7,5 | poz. 11,5 (2 afișări) |
| cazier fiscal persoana fizica | 666 | poz. 9,0 | poz. 69 |
| anaf cazier fiscal online | 364 | poz. 7,4 | – |

Paginile de fiscal de pe CJO rămân. A decis Raul: le păstrăm până crește site-ul nou.

## Ce este

Același repo, același deploy Vercel, aceeași bază de date, același admin, același Stripe și aceeași avocată ca eghiseul.ro și documentero.ro. Mecanismul e cel din [`../technical/specs/multi-brand.md`](../technical/specs/multi-brand.md):

- brandul `cazierfiscal` în `src/lib/brand/brands.ts`, domeniul `cazier-fiscal.ro`, vinde doar `cazier-fiscal`;
- hostul e rescris spre `src/app/cazierfiscal/` (`next.config.ts`), iar calea internă dă 404 (`src/proxy.ts`);
- wizardul, plata, statusul și contul sunt partajate, cu header și paletă proprii;
- comenzile primesc `orders.platform = 'cazierfiscal'` (migrarea 204), iar în admin au filtru și badge „cazier-fiscal”;
- numerele din registrul Baroului se alocă pe platforma `eghiseul`, aceeași firmă și același Stripe; decontul avocatei le pune tot la eghiseul;
- designul refolosește componentele documentero (tokenii `d-*`); paleta e vinete `#2A1438` și coral `#FF8A5B`, în `globals.css` sub `[data-brand="cazierfiscal"]`.

## Pagini la lansare

`/` (pagina serviciului), `/despre/`, `/contact/`, `/ghiduri/` (gol la început), cele 4 pagini legale, `robots.txt`, `sitemap.xml`, `llms.txt`. Totul e `noindex` până când `CAZIERFISCAL_INDEXABLE = true` în `src/config/cazierfiscal-nav.ts`.

Reguli: [`../../.claude/rules/content-and-seo.md`](../../.claude/rules/content-and-seo.md). Maximum un ghid nou pe săptămână. Fără date inventate (fără „3.500 de comenzi” sau rating fără sursă). Fără FAQPage nou.

## Pași pentru lansare

1. **Migrarea 204** pe baza eghiseul. Fără ea, comanda de pe hostul nou cade la constrângerea `orders_platform_check`.
2. **Domeniul:** se adaugă `cazier-fiscal.ro` și `www.cazier-fiscal.ro` în proiectul Vercel `eghiseul-ro`; la registrar (cyberfolks) DNS-ul se pune spre Vercel.
3. **Resend:** se verifică domeniul `cazier-fiscal.ro` și se adaugă în `RESEND_VERIFIED_DOMAINS`. Până atunci emailurile pleacă de pe adresa eghiseul.
4. **Search Console:** proprietate Domain `cazier-fiscal.ro` (TXT în DNS) și acces pentru contul de serviciu claude-seo.
5. Merge pe `main`, apoi `CAZIERFISCAL_INDEXABLE = true`, trimiterea sitemap-ului și IndexNow (cheia e în `src/lib/seo/indexnow.ts`).
6. **Opțional:** stream GA4 propriu (`NEXT_PUBLIC_GA_MEASUREMENT_ID_CAZIERFISCAL`). Până atunci datele intră în streamul eghiseul, filtrabil pe hostname.

## Ce urmărim

- **Săptămâna 1–2:** indexarea paginii principale (GSC → Inspectare URL).
- **Săptămâna 3–6:** afișări pe „cazier fiscal online” și „cazier fiscal persoana fizica”. Pozițiile vin după afișări.
- **Comenzi** cu badge „cazier-fiscal” în admin. Le comparăm cu comenzile de fiscal de pe CJO, ca să vedem dacă se mută comenzi sau se adaugă.
