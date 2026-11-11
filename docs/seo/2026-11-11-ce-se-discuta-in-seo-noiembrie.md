# Ce se discută în SEO, august–noiembrie 2026 (și ce înseamnă pentru noi)

Cercetare din 11.11.2026, făcută la lansarea cazierfiscal.com. Separat: ce a confirmat Google/Bing, ce spun practicienii, ce am verificat la noi.

## Confirmat de Google și Bing

- **August 2026 spam update:** 18.08, 2 zile și 16 ore. E cel care a lovit eghiseul și CJO.
- **September 2026 spam update:** 24.09 – ~08.10, în două valuri (25–27.09 și 30.09).
- **November 2026 core update:** a pornit pe 10.11, chiar în ziua lansării cazierfiscal.com; durează cam două săptămâni. Google recomandă comparația la o săptămână după terminare, față de săptămâna dinainte de start. Datele 10–24.11 sunt zgomot.
- **FAQ rich results** retrase pe 07.05.2026, documentația scoasă pe 15.06. FAQ-ul vizibil rămâne util, schema FAQPage nu mai aduce nimic.
- **AI Overviews / AI Mode:** Google spune că nu există cerințe speciale, fișiere sau markup; pagina trebuie doar să fie indexată și să aibă voie la snippet. `llms.txt` nu e folosit de Google Search (notă din 15.06).
- **Ghidul despre conținut asistat de AI** (actualizat 01.10): verificare umană a faptelor, inclusiv title, meta description, schema și alt text. Trimite la secțiunile din ghidul evaluatorilor despre scaled content abuse și low effort.
- **John Mueller (07.09):** paginile programatice slabe pot face Google să „piardă încrederea” în tot site-ul, iar repararea durează.
- **Search Console:** raportul de performanță AI (AI Overviews + AI Mode) e global din 31.08; doar afișări, apare doar când sunt destule.
- **Bing:** raport AI Performance (citări în Copilot), Topics Portfolio (beta, 13.10); din 01.02.2027 preferințe separate pentru antrenare AI și „grounding” (citare). Google pregătește un token comun în robots.txt pentru 2027.

## Ce spun practicienii (opinie, neconfirmat)

- Glenn Gabe și Lily Ray: update-urile din aug–sep au lovit paginile din șablon la scară, umplutura AI și site-urile subțiri; site-urile lovite au căzut și în AI Overviews și ChatGPT. Recuperarea durează luni.
- Lily Ray: vizibilitatea în AI stă pe SEO clasic; evită conținut AI scalat, prospețime falsă (`dateModified` schimbat fără motiv), listicle autopromoționale, pagini de comparație la scară.
- Autor persoană: testul cel mai serios (Seer, 123 de pagini) a dat mai multe citări în Bing și niciun efect clar în AI Overviews. Neconcludent.
- Citările diferă mult între motoare (Kevin Indig: ~91% apar într-unul singur dintre ChatGPT, Perplexity, AI Overviews).

## Verificat pe cazierfiscal.com (11.11)

| Ce | Stare |
|---|---|
| Toate paginile 200, 404 real, `http` și `www` → 308 | ✅ |
| Googlebot și Bingbot primesc 200; `max-snippet:-1`, fără `nosnippet` | ✅ |
| Un H1 pe pagină, canonical corect, 0 mențiuni eghiseul | ✅ |
| Schema: Organization, WebSite, Breadcrumb, Service/Article; fără FAQPage | ✅ |
| Descrierea paginii principale avea 213 caractere | reparat, 151 |
| Titlul paginii de contact era doar „Contact” | reparat |
| Bing Webmaster Tools | adăugat + verificat (meta tag), sitemap și 6 URL-uri trimise |
| Ghidurile verificate de om pe textul legii | ✅ (agent separat, pe textul consolidat) |

## Ce facem

- **Nu judecăm lansarea până după core update** (măsurăm din ~01.12).
- **1 ghid pe săptămână**, fără pagini pe orașe sau comparații la scară. Coada: [`../cazier-fiscal/README.md`](../cazier-fiscal/README.md).
- **`dateModified`** se schimbă doar când se schimbă conținutul.
- **Bing:** urmărim AI Performance în Bing Webmaster după ce apar date.
- **Până la 01.02.2027:** decidem politica antrenare vs citare AI; recomandare: permitem citarea (grounding).

## Ce NU facem, deși apare în recomandări

- **Linkuri din eghiseul / CJO / documentero spre cazierfiscal.com.** Decizia lui Raul: site-ul nu se leagă de eghiseul.
- **Recenzor „verificat de avocat” pe ghiduri:** doar dacă avocata chiar citește textul și e de acord; de decis de Raul. Până atunci autorul rămâne brandul.
- **Muncă în plus pe `llms.txt`:** rămâne cum e, Google nu-l folosește.
