# Meta Ads 2026 — mecanica platformei pentru un test mic (€10–30/zi), România/UE

Raport de cercetare (agent web, 02.09.2026). Context: certificat constatator online, 89 RON, B2B.
Surse la final; unde sursa e unică sau de agenție, e marcat.

## 1. Setup de campanie 2026

**Advantage+ Sales (ASC) vs. manual.** Meta recomandă ASC ca implicit, dar agențiile sunt unanime:
sub ~€50/zi algoritmul n-are spațiu de explorare și ASC riscă să rămână blocat în învățare. La
buget mic: Advantage+ Audience activat, cu 1–2 sugestii de targetare (nu targetare „hard") ca
punct de plecare, nu ASC complet cu catalog.

**Andromeda (rollout complet oct. 2025).** Sistemul citește creativul, nu doar audiența, ca să
decidă cui arată anunțul — diversitatea creativă e principala pârghie de targetare. Recomandare
2026: 8–12 concepte distincte per campanie (nu variații de culoare), similaritate creativă sub
~40%. La €10–30/zi nu e realist tot volumul, dar principiul rămâne: **4–6 unghiuri diferite**
bat 4–6 variații ale aceluiași unghi.

**Broad vs. interese.** Meta a eliminat categorii granulare de interese (15 ian. 2026); broad +
creativ puternic bate stivuirea de interese, mai ales peste 50 conversii/săpt. Interesele mai
au sens pentru nișe (antreprenoriat/PFA/administrare firmă), conturi noi fără pixel matur, sau
ca variabilă de test. Pentru noi: **broad cu 1–2 sugestii de antreprenoriat/business**.

**Structură la buget mic:** 1 campanie, 1 ad set, 3–5 creative diverse, broad. Fragmentarea în
mai multe ad seturi e greșeala nr. 1: 5 ad seturi × €4/zi nu ating niciodată pragul de semnal.

**Pragul de 50 conversii/săptămână.** La €20/zi (~€140/săpt.) cu CPC RO ~0,16–0,50 € obții
300–900 clicuri/săpt. — insuficient pentru 50 achiziții. Practic: optimizezi inițial pe un
eveniment de funnel superior (Landing Page Views sau „a început formularul") ca proxy, apoi
treci spre Purchase pe măsură ce se adună istoric. Compromis, nu garanție.

## 2. Constrângeri UE

| Temă | Practic (2026) |
|---|---|
| **DMA — „less personalized ads"** | Din ian. 2026 fiecare utilizator UE alege explicit: reclame personalizate vs. cu date reduse. Afectează targetarea/optimizarea pe cei care aleg varianta redusă; impact necuantificat încă. |
| **GDPR + Pixel/CAPI** | Pixelul fără consimțământ = doar date agregate/modelate; date personale prin CAPI cer consimțământ explicit — CAPI NU ocolește GDPR, doar ad-blockerele. Implementare = consent mode legat de banner (avem deja pattern-ul pentru Google/OpenAI). |
| **AEM (Aggregated Event Measurement)** | Pentru neconsimțiți, Meta estimează conversiile statistic — funcționează, cu granularitate mai mică. |
| **Ad Library — beneficiary & payer** | Obligatoriu (DSA) pe orice reclamă UE, la nivel de ad set; public 1 an. Fără el anunțul nu se publică. |
| **Verificare business** | Meta a extins verificarea de identitate în 2026 (mai ales financiar/reglementat, 38 țări). Constatatorul nu e produs financiar; verificarea generală (CUI, act constitutiv, adresă) e bună practică și poate fi cerută la scalare. Nu s-a găsit vreo listă de restricții cu „company registry extracts". |

Nimic specific României peste GDPR/DSA/DMA.

## 3. Retargeting 2026

- Custom Audience vizitatori site: minim tehnic ~100 persoane, livrare stabilă de la ~150–1.000+.
  Ferestre: 7–30 zile pentru intenție mare (pagina de preț/checkout), 30–180 zile pentru vizitatori
  generali (plafon 180).
- La trafic mic, audiența de 30 zile nu ajunge repede la 1.000 → retargeting abia din săptămâna 2,
  cu fereastră scurtă (7–14 zile).
- Cei care resping trackingul nu intră (sau intră parțial/modelat) în audiențe → audiența reală e
  mult sub traficul din analytics.
- Listele de clienți: utile mai mult pentru **excludere** (nu retargeta cine a cumpărat).

## 4. Creativ pentru un serviciu „plictisitor", tranzacțional

- **Hook în primele 3 secunde** = beneficiul direct: „Certificat constatator online, fără drum la
  ONRC, în câteva minute".
- **Unghi problem-aware**: pornește de la situația concretă (banca/licitația/notarul cere
  documentul, n-ai timp) — nu de la brand.
- **Format**: static/carusel simplu bate video-ul lucios la tranzacțional B2B low-involvement;
  checklist-uri și „drum fizic vs. online" performează.
- **Copy scurt, CTA direct, preț afișat**: „Comandă online — 89 RON, livrare pe email" — prețul în
  anunț filtrează curioșii.
- **Landing = promisiunea din anunț** (preț, timp, pași); mismatch = bounce + CPM mai mare.
- 4–6 variante pe **unghiuri** (bancă, licitație, simplitate, preț fix), nu pe culori.

## 5. Benchmark-uri

| Zonă | CPM | CPC | CTR | CPA |
|---|---|---|---|---|
| Global, medie industrii (2026) | ~$11,5–15 | ~$0,77 | ~1,5–2,2% | ~$38 |
| **România** (o singură sursă, agenție — orientativ) | 15–45 RON | 0,80–2,50 RON | — | — |
| Servicii juridice/financiare (proxy) | CPM ~$18 | — | — | CVR ~10,5% |

Nu există benchmark public pentru „servicii administrative RO"; proxy = B2B/juridic-financiar:
CPM peste medie, CVR bun dacă nevoia e reală.

## 6. Lead ads vs. conversii pe site

Pentru 89 RON, 100% online: **conversii pe site (Purchase)**, nu lead ads. Instant forms dau
leaduri ieftine dar slabe și cer follow-up uman — noi n-avem. Excepție temporară: dacă în primele
zile nu e niciun semnal, Lead Ads ca proxy de volum („lasă emailul"), apoi retargeting spre checkout.

## 7. Moduri de eșec + cum judeci testul (€300 / 14 zile)

Greșeli: prea multe ad seturi; schimbări în timpul învățării (resetează); optimizare direct pe
Purchase fără istoric; fără CAPI; landing nealiniat (CTR bun, CVR slab → concluzie greșită).

Judecată: nu vei ieși din învățare la bugetul ăsta; judeci **tendința**, în cascadă
CPM → CTR → clic-spre-landing → inițiere checkout → CPA brut. CTR < 1% și CPM peste benchmark =
problema e creativul/targetarea; CTR ok dar conversie slabă = landing/preț. Continuare: CPA
observat sub ~50–60% din preț → scalezi +20–30% la 3–5 zile; peste preț sau fără date → iterezi
creativul înainte de buget.

## Surse

- https://bir.ch/blog/advantage-plus-sales-campaigns-guide
- https://www.conversios.io/blog/meta-advantage-audience-vs-detailed-targeting-2026-guide/
- https://segwise.ai/blog/meta-andromeda-update-creative-strategy-2026
- https://themtmagency.com/blog/meta-andromeda-october-2025-update-why-creative-diversity-now-defines-ad-performance
- https://adligator.com/blog/meta-broad-targeting-advantage-plus-audiences-2026
- https://www.wittelsbach.ai/post/does-interest-targeting-still-work-on-meta-ads-in-2026
- https://adlibrary.com/posts/meta-campaign-structure
- https://www.tryvizup.com/blog/how-many-ad-sets-per-campaign-in-meta-ads-2026
- https://adlibrary.com/posts/meta-ads-learning-phase-50-events-guide
- https://leadenforce.com/blog/what-happens-inside-metas-optimization-engine-after-50-conversions
- https://www.techbuzz.ai/articles/meta-bows-to-eu-pressure-with-new-ad-choice-model-for-2026
- https://sigma.world/news/meta-eu-ad-settings-2026/
- https://flexyconsent.com/blog/meta-pixel-facebook-conversions-api-consent-guide/
- https://secureprivacy.ai/blog/meta-consent-mode-explained-2025
- https://www.jonloomer.com/beneficiary-and-payer-requirements-for-meta-ads-in-the-european-union/
- https://www.auditsocials.com/blog/meta-restricted-financial-services-ads-policy-2026-country-licensing-authorization-disclosure
- https://benly.ai/learn/meta-ads/custom-audiences-guide
- https://tribeupacademy.com/meta-ads-retargeting-audience-too-small/
- https://rightsideup.com/growth-marketing-blog/facebook-ad-creative-best-practices/
- https://www.triplewhale.com/blog/facebook-ads-benchmarks
- https://www.wordstream.com/blog/facebook-ads-benchmarks-2025
- https://dafe.ro/en/blog/cpm-cpc-benchmark-romania
- https://adpartner.com.au/blog/meta-lead-ads-vs-website-forms/
- https://leadsync.me/blog/facebook-instant-forms-vs-website-forms/
- https://www.stackmatix.com/blog/facebook-ads-minimum-budget-requirements
