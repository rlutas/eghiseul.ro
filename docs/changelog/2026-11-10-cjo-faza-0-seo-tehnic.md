# 10.11.2026 — CJO: reparații tehnice SEO (Faza 0 din planul de creștere organică)
<!-- categorie: seo -->

## Pentru echipă

- Pe CazierJudiciarOnline.com, o adresă de oraș care nu există (de exemplu un oraș scris greșit) arată acum „Pagina nu există”, nu o pagină de cazier falsă. Cele 39 de orașe reale funcționează ca înainte.
- Meniurile „Servicii” și „Orașe” din bara de sus arată la fel, dar acum Google vede linkurile din ele.
- Adresa veche a ghidului pentru Oradea trimite direct pe pagina de Oradea, nu pe o eroare.
- Pagina „Verifică status comandă” funcționează ca înainte, dar nu mai apare în Google.
- Pe prima pagină, la ghiduri, s-au adăugat trei: călătoria cu minori în străinătate, verificarea cazierului fiscal și cazierul fiscal pentru străini.
- Textul paginilor de oraș nu s-a schimbat. Testul din 17.11 rămâne valabil.

Planul complet: [plan de creștere organică](../seo/2026-11-10-plan-crestere-organic/README.md).

---

Commit CJO `cd76eb27`. Punctele 0.1–0.7 din plan:

| # | Ce | Cum |
|---|---|---|
| 0.1 | 404 pe sluguri de oraș necunoscute | `dynamicParams = false` + `notFound()` în `src/app/cazier-judiciar-online/[city]/page.tsx`; `generateMetadata` întoarce `{}` pentru slug necunoscut. Verificat local: `xyzabc` și `bucuresti-sector-9` → 404, `iasi`/`constanta` → 200 |
| 0.2 | Meniurile desktop în HTML-ul de server | `Header.tsx`: dropdown-urile „Servicii” și „Orașe” sunt randate mereu, cu clasa `hidden` când sunt închise (înainte erau montate doar la click). Meniul mobil (Sheet) rămâne neschimbat |
| 0.3 | Oradea | `/cazier-judiciar-oradea-program-ghiseu-si-varianta-online` (cu și fără `/`) → `/cazier-judiciar-online/oradea`, permanent (308, ca restul redirecturilor din `next.config.ts`) |
| 0.4 | noindex | `/status-comanda`: `robots: { index: false, follow: true }`, scoasă din `sitemap.ts`. `/multumim` e deja blocată în `robots.txt`, deci un `noindex` acolo n-ar fi citit; rămâne așa |
| 0.5 | Spațiu în H1 | `{" "}` înaintea `<span className="block …">` din H1 pe 32 de fișiere (home, servicii, ghiduri, șablonul de oraș). Textul extras era „onlineprin”, „AutoOnline” |
| 0.6 | `dateModified` | **Nu s-a schimbat nimic.** Auditul spunea „bump global”, dar git arată pe fiecare pagină cu 02.11 o corectură reală de text în acea zi (scos „document oficial”, SPV fără semnătură calificată la PF, împuternicire avocațială la fiscal, prețuri de traducere). Datele sunt corecte după regula 3 |
| 0.7 | Linkuri spre paginile informaționale slabe | `GuidesHubSection` (home): `/conditii-de-calatorie-cu-minori`, `/verificare-cazier-fiscal-online`, `/cazier-fiscal-pentru-cetatean-strain` |

Indicatori de urmărit (3–4 săptămâni): pozițiile `/cazier-fiscal-online`, `/cazier-auto-online`, `/certificat-integritate-comportamentala` și ale celor trei ghiduri de la 0.7; în GSC, „Pagini” — URL-urile de oraș inventate ies din index ca 404.
