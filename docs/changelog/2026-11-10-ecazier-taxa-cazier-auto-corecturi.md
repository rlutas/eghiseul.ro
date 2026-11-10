# 10.11.2026 — ecazier: ghid nou despre taxa pentru cazierul auto; corecturi pe CJO despre cazierul auto
<!-- categorie: seo -->

## Pentru echipă

- Pe ecazier.ro a apărut un ghid nou: „Cât costă cazierul auto?”. Răspunde la căutările „taxa cazier auto” și „taxa cazier pentru școala de șoferi”, pe care nu le acoperea niciun site de-al nostru.
- Ghidul spune deschis că, la Poliție și online, cazierul auto e gratuit. Explică apoi când merită să-l obțină pentru client avocatul: fără cont, din străinătate sau pe hârtie.
- **Informație nouă pentru telefon:** din 13 mai 2026, la examenul pentru permis nu se mai depune cazier judiciar. Serviciul de permise îl verifică singur. Școala de șoferi poate cere, la înscriere, cazier sau o declarație pe propria răspundere.
- Am corectat greșeli de pe CazierJudiciarOnline.com:
  - cazierul auto îl eliberează **Poliția Rutieră**, nu DRPCIV;
  - cazierul auto **nu are un termen legal de valabilitate de 6 luni**; decide cine îl cere;
  - pe ecazier scria că nu există o variantă online gratuită, dar ea există (hub.mai.gov.ro, ghiseul.ro).
- Dacă un client întreabă „de ce să plătesc, dacă e gratuit?”, răspunsul e în ghid: plătește asistența avocatului, nu o taxă.

---

Commit-uri CJO: `1fa7ea98` (corecturi), `7a820a2b` (ghid).

## Fapte verificate (10.11.2026)

| Fapt | Sursă |
|---|---|
| Istoricul sancțiunilor rutiere e gratuit, la orice serviciu rutier sau online cu cont validat | `hub.mai.gov.ro/index.php/serviciu/view?id=63` (actualizat 09.04.2026) |
| Varianta online există din 18.05.2023 și e valabilă doar în format electronic; contul hub se validează o dată la poliție, cel de ghiseul.ro fără drum | `mai.gov.ro/comunicat-de-presa-785` |
| Cazierul judiciar e gratuit | `hub.mai.gov.ro/serviciu/view?id=88` (06.10.2026) |
| Din 13.05.2026, cazierul judiciar nu mai e în dosarul de examen auto; SPCRPCIV îl verifică automat, cu acordul candidatului | Ordinul MAI 69/2026 (MO 406/13.05.2026), modifică OMAI 268/2010 |
| Cazierul auto nu e cerut cursanților; apare opțional doar la instructori | OMT 733/2013, Anexa 2, art. 8 |

Ce nu s-a putut verifica și deci nu apare în pagină: sumele pentru permis, fișa medicală și avizul psihologic; „istoric pe 5 ani”; „eliberat pe loc” la ghișeu. Termenul de 15 zile vine din FAQ-ul politiaromana.ro, citit doar ca snippet.

## Corecturi pe CJO (`1fa7ea98`)

- „DRPCIV” ca emitent apărea pe `comparatie-servicii` (tabel, text, surse), `valabilitate-cazier-fiscal`, `cazier-judiciar-pentru-angajare`, `cazier-auto-online` (OG și bara mobilă), `termeni-si-conditii`, `politica-de-confidentialitate`. Acum scrie Poliția Rutieră. Pe cele două pagini legale e corectat doar numele autorității; obligațiile nu s-au schimbat.
- „Cazier auto valabil 6 luni”, pe `valabilitate-cazier-judiciar` (text și meta), `comparatie-servicii`, `valabilitate-cazier-fiscal`, `blog`: înlocuit cu „fără termen legal; decide cine îl cere”, ca pe ecazier.
- Pe ghidul de oraș (`CityGuideView`, cele 4 orașe din testul de pe 17.11) s-a schimbat o singură propoziție: școala de șoferi nu mai e dată ca motiv pentru cazierul auto. E o corectură de fapt și nu afectează testul.
- ecazier `puncte-penalizare-cazier-auto`: „nu există portal public” era fals și a fost corectat. `fisa-evidenta-conducator-auto` menționează acum și varianta gratuită online.

## Ghidul nou (`7a820a2b`)

`ecazier.ro/taxa-cazier-auto`. Schema e Article + BreadcrumbList, fără FAQPage: Google nu mai afișează rezultate FAQ din 07.05.2026. Pagina primește link din `/ghiduri`, `/acte-necesare-cazier-auto` și `/fisa-evidenta-conducator-auto` și e în sitemap. Pe 10.11 au fost făcute: sitemap retrimis în GSC, „Solicită indexarea”, IndexNow.

Indicator: poziția pe „taxa cazier auto” (ecazier pe 15, CJO pe 9,3 cu home) și pe „taxa cazier pentru scoala de soferi” (ecazier 23). Verificare pe 01.12.
