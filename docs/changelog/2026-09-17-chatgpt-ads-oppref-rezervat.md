# 17.09.2026 — Reclama din ChatGPT: am aflat de ce nu se vedea nicio conversie
<!-- categorie: automatizari -->

## Pentru echipă

Reclama noastră din ChatGPT a început să ruleze pe 16 septembrie, prima dată după două
săptămâni de așteptare. A adus 23 de vizite, dar nicio comandă.

Am verificat dacă nu cumva pierdem comenzile pe drum. Nu le pierdem. Vizitele ajung pe site
corect etichetate, deci chiar n-a comandat nimeni dintre cei care au dat clic.

Cele două comenzi de certificat constatator plătite astăzi dimineață NU sunt din reclamă.
Sunt de la același client care a mai cumpărat de la noi în august. Dacă vă întreabă cineva
câte comenzi a adus ChatGPT până acum, răspunsul e zero.

Nu se schimbă nimic în felul în care lucrați.

---

## Ce s-a livrat

| Ce | Unde |
|---|---|
| `attribution.ts` acceptă `oai_ref` ca alias pentru `oppref` | `src/lib/analytics/attribution.ts` |
| Anunțul din Ads Manager trimite în plus `oai_ref={oppref}` | OpenAI Ads Manager, ad `Ad1 T1-D1 pe email` |
| Politica OpenAI recitită la zi (v1.6) + verdict pe servicii noi | `docs/ads/chatgpt/08-…`, `01-…` |

## De ce

Campania `OAI_Click_Constatator_2026-09` a intrat în difuzare pe 16.09, după 14 zile de
„Not serving". Pe 14 zile: 1.041 afișări, 23 clicuri, €13,19, 0 conversii.

Investigația a trecut prin două concluzii greșite până la cea corectă:

1. **„Lipsesc UTM-urile."** Fals. Coloana „URL" din tabelul de anunțuri arată doar câmpul
   `Link`. UTM-urile stau într-un câmp separat, `Tracking parameters`, vizibil doar în
   „Edit Ad", și erau puse corect de la început.
2. **„Lipsește `oppref={oppref}`."** Tot fals, și imposibil de reparat: la salvare, Ads
   Manager răspunde `Reserved query parameters are not supported: olref, oppref.` Parametrul
   e rezervat, OpenAI îl adaugă singur, advertiserul nu are voie să îl scrie. Macro-ul
   `{oppref}` din lista de placeholdere e menit să fie folosit ca VALOARE sub un nume propriu.
3. **Concluzia reală:** configurarea era completă. 23 de clicuri, zero comenzi începute.

## Modificarea de cod

`readCurrentTouch()` citea doar `?oppref=`. Acum citește `?oppref=` **sau** `?oai_ref=`, iar
anunțul trimite `oai_ref={oppref}` sub nume propriu. Rostul e strict diagnostic: dacă un draft
viitor are `oai_ref` dar nu `oppref`, știm că adăugarea automată a OpenAI nu ajunge până la noi;
dacă le are pe amândouă, lanțul de atribuire e complet și problema e doar de conversie.

Anunțul a rămas `Serving` după salvare, fără reintrare în review.

## Ce am mai găsit în cont

| Ce | Stare la 17.09 |
|---|---|
| Ad groups | doar AG1. AG2 „cu istoric" și AG3 din plan n-au fost create niciodată |
| Buget | €20/zi, start 02.09, fără dată de final |
| Pixel `eghiseul.ro web` | Healthy, 13 evenimente din browser |
| Event Quality Score | încă gol |
| Billing | €15,00 debitați 17.09, sold €10,63, prag €15 |

⚠️ Banii debitați sunt aproape dubli față de „Spend €13,19" din tabel, iar Avg CPC afișat e
€1,47 deși €13,19 / 23 = €0,57. Raportarea e marcată „Preliminary", de recitit peste 2–3 zile.

## Politica, la zi

Politica e acum **v1.6 (10.09.2026)**, cu un singur adaos: OpenAI poate refuza reclame care
intră în conflict cu „our advertising principles, business interests, or competitive position".
Interdicția pe legal services în afara SUA a rămas neschimbată, deci stare civilă și cazierele
rămân blocate. Analiza pe rovinietă și pe restul catalogului:
`docs/ads/chatgpt/08-eligibilitate-rovinieta-si-stare-civila.md`.
