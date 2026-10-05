# 05.10.2026 — ecazier.ro și documentero.ro: de ce nu urcă în organic

## Pe scurt

**Indexarea nu e problema pe niciunul dintre site-uri.** Google cunoaște și indexează aproape toate paginile. Ce lipsește e **încrederea Google în domeniu** (autoritate, linkuri, vechime), iar pe ecazier se adaugă **concurența cu propriul nostru site, cazierjudiciaronline**.

## ecazier.ro

| Ce | Valoare (07.09–02.10, API Search Console) |
|---|---|
| Pagini din sitemap indexate | **14 din 15**. `/ghid-alegere-tip-cazier` e „descoperită, neindexată”, deși are linkuri din prima pagină, din `/ghiduri` și din `/cazier-auto`. Cererea de indexare a fost refuzată azi pentru că s-a atins cota zilnică; se reface pe 06.10 |
| Expuneri, 28 de zile | **526**, 18 clicuri; 9 dintre ele pe numele brandului („e cazier”, „ecazier”) |
| Ce merge | **Coada lungă de cazier auto:** fișa de evidență (poziția 4,1), permis din străinătate (4,5), puncte de penalizare (4,8), Uber/Bolt (6,8), valabilitate (8,6) |
| Ce nu merge | **Cazier fiscal: poziția 28** pe „cazier fiscal online”. Pe aceeași căutare, cazierjudiciaronline e pe 5,9. Google alege CJO, nu ecazier. |

**Concluzie (corectată după decizia lui Raul, 05.10).** ecazier rămâne pe **toate cele trei servicii**: cazier judiciar, fiscal și auto. Auto e locul unde rankează deja (pozițiile 4–8), deci acolo vin primele rezultate. Pe judiciar și fiscal îl ajutăm la fel ca pe documentero:

- linkuri din site-urile noastre (eghiseul, CJO, avocat-tarta), puse în text și cu ancore variate, nu pe toate paginile;
- legături interne mai bune între ghiduri și paginile de serviciu.

Risc de știut: pe aceleași căutări, Google tinde să aleagă un singur site din grup, iar acum îl alege pe CJO.

**Ce facem** (punctele F din `2026-10-plan-a-z-vanzari.md`):

1. **Legături interne pe ecazier** (05.10, agent): fiecare ghid trimite spre serviciul lui și spre 1–2 ghiduri înrudite; serviciile trimit una spre alta; `/ghid-alegere-tip-cazier` primește cel puțin 3 linkuri.
2. **Linkuri din site-urile noastre** (05.10, agenți): CJO (3–5 în text, nu pe tot site-ul), eghiseul (footer + 2–3 în articole, nu din paginile `/servicii/`), avocat-tarta (footer + un articol).
3. Cerere de indexare pentru `/ghid-alegere-tip-cazier` (06.10).
4. Ghiduri noi pe toate cele trei servicii, 1–2 pe lună.
5. Pe 19.10 măsurăm expunerile pe fiecare serviciu.

## documentero.ro

| Ce | Valoare (19.09–02.10, interfața Search Console) |
|---|---|
| Vârsta site-ului | **12 zile** în Google (primele expuneri pe 21.09) |
| Expuneri pe zi | ~40–100, fără creștere clară în 12 zile |
| Clicuri | 12 în total |
| Pagini cu expuneri | extras multilingv (poziția 7,8, CTR 2,6%), celibat (7,4, CTR 0,8%), naștere pierdut (13,3), acte duplicat (13,7), căsătorie (10,1), naștere (18,3) |
| Raportul de indexare | se oprește la 21.09 (Google l-a actualizat ultima dată atunci): 9 indexate; cele 5 „noindex” sunt intenționate (inclusiv paginile de reclame) |
| Sitemap | Succes, 16 adrese (acum 18, cu ghidurile din 05.10) |

**Concluzie.** E un domeniu nou și se comportă ca unul nou. Primele 2–3 luni Google testează domeniul pe coada lungă, cu poziții de 7–15, iar asta vedem acum. Nu e o problemă tehnică. Ce grăbește lucrurile:

1. **Ritm constant de conținut:** 2 ghiduri pe săptămână (E1 și E2 au intrat pe 05.10).
2. **Linkuri:** din articolele de stare civilă de pe eghiseul (E4) și din cel puțin 2–3 surse externe reale.
3. **CTR:** celibat are 0,8% pe poziția 7,4; titlul și descrierea merită revizuite după ce trec 2 săptămâni de la schimbările din 05.10.
4. **Reclamele pe celibat** (pornesc 06.10) aduc trafic direct, cât crește organicul.

**Acces:** contul de serviciu al skill-ului SEO (`claude-seo@caziere.iam.gserviceaccount.com`) a fost adăugat de Raul și pe documentero (05.10). Verificat prin API: **18/18 pagini din sitemap sunt indexate**, inclusiv cele două ghiduri publicate pe 05.10.
