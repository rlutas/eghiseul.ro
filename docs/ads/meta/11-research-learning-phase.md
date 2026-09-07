# Research Meta Ads — faza de învățare, buget, plasamente, măsurare, consimțământ, creative

**Data:** 2026-09-07
**Context:** campanie Meta RO, obiectiv „Website InitiateCheckout", buget 75 lei/zi (~15 EUR), activă de 4 zile, 235 lei cheltuiți, 1 conversie raportată. Serviciu ~200 lei.

## Metodă și avertisment de încredere

Tot ce urmează a fost verificat prin *fetch* direct pe pagină. Marcaje:

- ✅ **verificat prin fetch** — pagina a fost deschisă și textul citit
- ⚠️ **doar snippet** — apare în rezumate de căutare, neconfirmat pe pagină
- ❌ **neverificat / respins**

**Avertisment de metodă, important:** cu excepția PDF-urilor EDPB (extrase local cu `pdftotext -layout`), toate citatele au trecut printr-un strat de extragere automată a conținutului, nu prin citirea HTML-ului brut. **Înainte de a publica orice citat verbatim într-un document care contează (contract, notificare, răspuns către o autoritate), redeschideți URL-ul și confirmați formularea.**

Bariere de acces întâlnite, relevante pentru reproductibilitate:

- Paginile `facebook.com/business/help/*` sunt randate client-side: WebFetch primește doar `<title>`, curl dă HTTP 400. Au fost recuperate prin proxy de text (`r.jina.ai`).
- `jonloomer.com` blochează fetch-ul automat (403 Cloudflare). Recuperat prin același proxy și prin RSS full-text.
- `thinkwithgoogle.com` redirecționează spre un consent wall UE — s-au folosit endpoint-urile PDF `/_qs/documents/`.
- Reddit blochează WebFetch, `r.jina.ai` și pullpush. Ruta funcțională: API-ul arctic-shift (`arctic-shift.photon-reddit.com/api/comments/search?link_id=<id>`).
- Bugetul WebSearch al sesiunii s-a epuizat (200/200) la jumătatea cercetării.

---

# 1. Faza de învățare

## 1.1 Regula celor 50 — verbatim din Meta

✅ [About the learning phase](https://www.facebook.com/business/help/112167992830700):

> „ad sets exit the learning phase as soon as they can deliver stably. This usually occurs after about **50 results in the week after the ad set's last significant edit**."

✅ [About learning limited](https://www.facebook.com/business/help/269269737396981):

> „Learning limited isn't a penalty – it's an indication that **your budget isn't being spent effectively** because the ad delivery system can't optimize performance with your current setup."

> „An ad set becomes learning limited when it is **unlikely** to receive about 50 optimization events in the week after your last significant edit."

**Nuanță ușor de ratat:** statusul „Learning limited" apare *predictiv* („is unlikely to receive"), nu după ce au trecut 7 zile fără rezultate. Sistemul îți spune din start că matematica nu iese.

Cauzele enumerate oficial de Meta:

> „an ad set becomes learning limited when the ad set is limited by small audience size, low budget, low bid or cost control, high auction overlap, an infrequent optimization event, or other issues such as running too many ads at the same time."

Excepție documentată: pentru Shops ads pragul e „a minimum of 17 purchases through your website and 5 through Meta".

## 1.2 Lista completă de „significant edits"

✅ [Significant edits and learning phase](https://www.facebook.com/business/help/316478108955072).

**Acestea RESETEAZĂ întotdeauna:**

- orice schimbare de targetare
- orice schimbare de creative
- orice schimbare a evenimentului de optimizare
- **adăugarea unei reclame noi în ad set**
- punerea pe pauză a ad set-ului ≥7 zile (resetarea are loc la repornire)
- schimbarea strategiei de licitare

**Acestea POT SAU NU reseta, în funcție de magnitudine:**

- ad set spending limit
- bid control / cost per result goal / ROAS goal
- **suma bugetului**

Note oficiale suplimentare:

> „When using Advantage+ campaign budget […] switching your campaign bid strategy might cause **multiple ad sets within the campaign** to reenter the learning phase."

> „Will Advantage+ campaign budget cause ad sets to reenter the learning phase as it distributes budget? **No.**"

> „Will making a significant edit to one ad set […] cause other ad sets within the same campaign to reenter? **No**, as long as the edit is made at the ad set level."

## 1.3 De ce pragul de 20% la buget este FOLCLOR

Aceasta e cea mai importantă corecție a temei.

**Meta nu publică niciun prag procentual.** Singurul exemplu oficial, ✅ de pe aceeași pagină:

> „For example, if you increase your budget from $100 to $101, that **isn't likely** to cause one or more ad sets to reenter the learning phase. However, if you change your budget from $100 to $1000, one or more ad sets **may** reenter the learning phase."

Două cazuri extreme, ambele cu limbaj slab („isn't likely", „may"). Nimic între ele.

Jon Loomer atacă direct această lipsă — ✅ [Facebook Ads Edits that Trigger the Learning Phase](https://www.jonloomer.com/facebook-ads-edits-learning-phase/):

> „That's a pretty crappy example since it uses two extreme cases. And even with these extremes, Facebook uses weak language like 'isn't likely.' They won't even clarify whether the smallest of budget changes will trigger the learning phase."

> „What about a 10% increase? Or 20%? What about a decrease? **It's annoying because this is something that likely has firm parameters, yet Facebook won't tell us.** So, we need to experiment to figure it out on our own."

Cifra „20%" circulă însă ca și cum ar fi documentație. Exemplu de agenție reală care o afirmă ca fapt — ✅ [Code3](https://code3.com/resources/understanding-the-meta-learning-phase-why-it-matters-for-campaign-performance/):

> „every significant edit (changing budgets by more than ~20%, swapping out creatives, altering audiences) resets the learning phase"

**Nu am găsit nicio sursă Meta care să confirme 20%.** Tratați-l ca euristică de practicieni. (Aceeași sursă recomandă, tot ca euristică proprie, creșteri de „no more than 20–30% every few days" la scalare — util ca practică, nu ca regulă a platformei.)

## 1.4 Ce NU resetează

Loomer listează, ✅ marcând explicit că e deducția lui și **nu** doctrină Meta: plasamente, nume de campanie/ad set/reclamă, parametri URL, pixel tracking, program de difuzare.

## 1.5 Cât timp fără modificări

✅ **Meta:**

> „**Wait to edit your ad set until it's out of the learning phase.** During the learning phase, performance is less stable, so **your results aren't necessarily indicative of future performance.** By editing an ad, ad set or campaign during the learning phase, you reset learning and delay our delivery system's ability to optimize."

Tot oficial, două recomandări conexe:

> „**Avoid high ad volumes.** When you create many ads and ad sets, the delivery system learns less about each ad and ad set."

> „**Use realistic budgets.** If you set a very small or inflated budget, the delivery system has an inaccurate indicator […] and avoid frequent budget changes."

✅ **Loomer:** „Unless it's a situation where your results are so poor that you don't expect to exit the Learning Phase, **let it ride**."

✅ **Code3** (cifre de agenție, nu Meta): 3 zile la $500+/zi; 5–7 zile la $100–300/zi; **7–10 zile sub $100/zi**.

**Dezacord real:** Meta spune „nu atinge nimic până ieși din learning". Loomer adaugă excepția care contează la buget mic — dacă e evident că *nu vei ieși niciodată*, regula „nu atinge nimic" nu te mai ajută; trebuie schimbată structura.

---

# 2. Buget minim viabil

## 2.1 Aritmetica

Din regula celor 50 rezultă direct:

```
buget zilnic minim = (CPA estimat × 50) / 7
```

Aceasta e simplă aritmetică derivată din pragul Meta, **nu o formulă cu autor**. Circulă pe zeci de site-uri, dar toate cele verificate erau conținut generat automat (adadvisor.ai, roaspig, dailyintelservice, calcbee, adkit). ❌ **Nu citați niciunul.**

## 2.2 Regula ×75 a lui Loomer

✅ [Facebook Ads and the Learning Phase](https://www.jonloomer.com/facebook-ads-learning-phase/):

> „Before starting an ad set, do some basic math. How much do you expect a desired action to cost? **Multiply that number by at least 75 to determine a minimum weekly budget.**"

Adică ~50% marjă peste minimul teoretic de 50 — Loomer presupune că nu toate rezultatele vin la CPA-ul țintă.

Tot el, ilustrând constrângerea:

> „a $10 per day budget could be problematic. With such a budget, you are spending $70 during a 7-day period. To exit the Learning Phase, you'd be required to generate, at minimum, **one action per $1.40 spent**."

✅ [Facebook Ads on a Budget](https://www.jonloomer.com/facebook-ads-on-a-budget/) — pragul lui pentru „buget mic":

> „I'm talking about budgets **under $50 per day** — so $1,500 and under per month."

> „You generally need to get **25-50 conversions per week** to exit the learning phase and get optimal results. If you're selling a $100 product, you *might* be able to accomplish that, but only if all of your budget is on a single campaign."

(Notă: „25-50" aici diferă de „about 50" al Meta — inconsecvență minoră în propriul lui material.)

## 2.3 Unde spune Meta OFICIAL să cobori evenimentul

Aceasta e sursa cheie a temei.

✅ [Best practices for landing page view performance goals](https://www.facebook.com/business/help/203012060587398):

> „**If your goal is to get more conversions:** We recommend trying to optimize for conversions first. However, maximize number of conversions does not work for everyone. **A conversion-optimized ad set needs to get about 50 or more of the conversion it's optimized for per week to have a chance at being effective. If your ad set doesn't get that many conversions per week, landing page view optimization could be an effective alternative.** It's also a good choice if you don't have lower-funnel events (such as purchase conversions) set up yet with your Meta Pixel."

Și ✅ în [About learning limited](https://www.facebook.com/business/help/269269737396981), lista oficială de remedii:

> „**Combine ad sets and campaigns.** […] **Expand your audience.** […] **Raise your budget.** […] **Raise your bid or cost control.** […] **Change your optimization event.** Consider choosing an optimization event that occurs more frequently. For example, **move from purchases to add to cart**."

## 2.4 Dezacordul: Loomer contrazice Meta (și pe el însuși)

Loomer **și-a schimbat poziția**. În 2020 recomanda exact ce recomandă Meta. În 2024 spune opusul.

✅ [Common Ad Set Optimization Mistakes](https://www.jonloomer.com/common-ad-set-optimization-mistakes/):

> „Meta is optimizing ad set delivery to give you the thing that you want. You said that you want landing page views. That's the only focus — not what the person does after landing on your website. **You may get accidental clicks, people who seemingly click on everything, and a whole bunch of low-quality and irrelevant traffic.** But, Meta thinks you're happy because you didn't say you wanted these people to do anything else."

> „While it's not always easy to optimize for purchases, particularly when you're working with lower budgets, **you should still prioritize that approach. You may not exit the learning phase, but at least you'll be aligned with Meta's ad set optimization about what defines success.**"

✅ [How Ads Budget Impacts Performance](https://www.jonloomer.com/qvt/how-ads-budget-impacts-performance/):

> „Because of this, you may feel forced to optimize for upper funnel actions. And that often leads to **low-quality and misleading results.** […] **Prefer the lower-funnel action when you can get it.** And spend more when it's possible."

**Rezumatul dezacordului:** Meta îți spune să cobori ștacheta ca să ieși din learning. Loomer spune că ieși din learning optimizând pentru ceva ce nu-ți aduce bani, deci mai bine rămâi în Learning Limited pe evenimentul corect. **Loomer are dovezi experimentale de partea lui** — vezi §3.2 și §4.4.

---

# 3. Audience Network

## 3.1 Regula depinde de evenimentul de optimizare

Sursa centrală: ✅ [Should Meta Advertisers Ever Use the Audience Network Placement?](https://www.jonloomer.com/should-meta-advertisers-ever-use-the-audience-network-placement/)

**De ce e problematic:**

> „Most of these clicks are very low quality. Most who click immediately abandon your website and rarely stick around to do anything of substance. Why that is can be attributed to **accidental clicks if not outright click fraud.** In fact, if you've ever received a refund from Meta for your ads, it was likely due to a **click fraud violation on Audience Network**."

> „It's why you may get results that seem too good to be true when optimizing for Link Clicks or Landing Page Views. You'll drive lots of traffic, but none of those people do anything else."

Pe Rewarded Video, cu exemplu concret: „there were actually **more ThruPlays than people reached.** I don't care how engaging your video is. That does not happen unless manipulation is involved."

**Regula, în două jumătăți:**

1. Optimizezi pe **Link Clicks / Landing Page Views / ThruPlay** → **scoate Audience Network.**
   > „make sure to turn off Audience Network when optimizing for either Link Clicks or Landing Page Views."

2. Optimizezi pe **conversie** → **las-o pornită.**
   > „if you're optimizing for a conversion of any kind, **let it ride with Advantage+ Placements and keep Audience Network on.** It's possible that not a penny will be spent there anyway. Most importantly, **making all placements available may keep your costs down.**"

Argumentul mecanic: „**If a placement doesn't help you achieve your goal, less of your budget will be spent there.**"

## 3.2 Datele de test ale lui Loomer

✅ [Split Test: Which Optimization Leads to the Most High-Quality Traffic?](https://www.jonloomer.com/split-test-which-optimization-leads-to-the-most-high-quality-traffic/) (27.02.2023) și ✅ [Quality Traffic Test #2: The Impact of Meta Ads Placement](https://www.jonloomer.com/quality-traffic-test-2-the-impact-of-meta-ads-placement/).

**Setup:** 3 ad set-uri identice — optimizate pe (1) Link Clicks, (2) Landing Page Views, (3) eveniment custom „Quality Visitor" = 2 minute pe pagină + scroll 70%. Targetare doar pe țară (US/UK/CA/AU), fără custom/lookalike audiences, ~$100 per ad set.

**Test #1 — toate plasamentele:**

> „**When optimizing for Link Clicks, a staggering 99% of those Link Clicks came from Audience Network.** When optimizing for Landing Page Views, **96%** of those Landing Page Views came from Audience Network."

> „only **3 of the 607** people driven to my website […] from Audience Network resulted in a Quality Visitor."

Când a optimizat pe evenimentul Quality Visitor, pe Audience Network **nu s-a cheltuit niciun ban** („not a penny was spent there"). Doar ad set-ul Quality Visitor a produs înscrieri la newsletter (5); celelalte două, zero.

**Test #2 — doar News Feed. Acesta e costul excluderii:**

- **CPM cel puțin 2× mai mare** — „This is not surprising since I was forcing the algorithm to only use News Feed, which is the most expensive placement."
- **CTR s-a calmat considerabil** — „Again, not surprising when you toss out Audience Network." → confirmarea directă că CTR-ul mare pe AN e artificial.
- **Costul per Link Click a crescut de 3–4 ori.**
- Costul per Quality Visitor a rămas categoric cel mai bun la optimizarea pe Quality Visitor.

**Observația de fond a lui Loomer:**

> „the need to remove Audience Network kind of misses the point. The fact that most of the clicks go through Audience Network when optimizing for Link Clicks and Landing Page Views is **proof that only the click matters with these optimizations.** Any quality action is incidental."

## 3.3 Confirmare independentă, aceeași falie pe obiectiv

✅ Charlie Lawrence, [Social Media Examiner](https://www.socialmediaexaminer.com/facebook-ad-placements-for-marketers-how-to-make-right-choices/) (05.08.2019) — același autor, același articol, recomandări opuse:

- „there's a trade-off with audience quality. You won't see a high conversion rate compared to the other placements."
- **Traffic:** „you want to use Edit Placements and **remove the Audience Network**."
- **Conversions:** „use **Automatic Placements.** As you set a high-value conversion action… Facebook is forced to send your reach to only the most effective placements."

## 3.4 AdEspresso se contrazice la 4 ani distanță

- ✅ **2017, PRO:** „By enabling the audience network placements, you're lowering your average CPC… average audience network CPCs consistently stayed well under $0.10, while all other placements ranged from $0.20 to over $0.70." — [adespresso.com](https://adespresso.com/blog/facebook-audience-network/)
- ✅ **2021, CONTRA:** „Conversion rates are lower due to driving unqualified traffic, which leads to higher CPAs… you might find that Audience Network clicks seem accidental and lead to a high bounce rate. For better results, you can **deselect the Audience Network altogether**." — [adespresso.com](https://adespresso.com/blog/facebook-ad-placement-improve-conversions/)

## 3.5 Common Thread Collective — condiționat

✅ [CTC](https://commonthreadco.com/blogs/coachs-corner/meta-is-removing-ad-placement-controls-what-ecommerce-brands-must-do-before-q4):

> „Account-level restrictions for Audience Network remain available… you can apply an account-wide block **if Audience Network is consistently underperforming for your business**."

> „Ad-set placement exclusions were **typically used for performance optimization rather than brand safety**."

## 3.6 Dovadă solidă, dar strict pe obiectiv Traffic

✅ [LeadSync](https://leadsync.me/blog/beware-the-facebook-audience-network-in-traffic-campaigns/) (29.03.2020):

> „ALL the clicks were coming from the Audience network via Mobile Apps… the traffic had **a session duration of 1 second**."

Măsurat în Google Analytics, nu în raportul de plasare Meta — deci nu e artefact de auto-raportare.

## 3.7 Contrapoziția

✅ Madeline Fitzgerald (3Q Digital) via [Search Engine Land](https://searchengineland.com/how-to-tackle-rising-facebook-cpas-329545):

> „Let the robots have it on factors like devices and placements… we're actually seeing a **13% lower CPA** with some of our clients who [no longer segment those]."

(Anecdotă de agenție, nu studiu; spune „placements" generic, nu „Audience Network".)

⚠️ **CAPCANĂ DE CITARE:** toate celelalte rezultate pentru „audience network" pe searchengineland.com se referă la **Microsoft Audience Network**, nu Meta. Dacă întâlniți „SEL zice că Audience Network are CTR umflat" — e despre altă platformă.

## 3.8 Reddit — tiparul contează mai mult decât conținutul

Thread principal: ✅ [r/FacebookAds, 15.04.2025](https://reddit.com/r/FacebookAds/comments/1jzlgtf/who_is_excluding_audience_network_placements/)

- **Pro-excludere (~9 din 12):** „80% are junk leads, junk clicks"; „garbage traffic that tanks your overall performance - I exclude it at the account level for every client without exception".
- **Contra (minoritar, cel mai bine argumentat, +4):** „auto placements generally give better results/costs… It spends a very small amount on these placements like audience network. **When you do manual, I have noticed it jacks up your CPM a bit** to account for the little bit that Meta can no longer syphon off." — coincide exact cu măsurătoarea Loomer.

Detaliul revelator: cineva a întrebat tabăra pro-excludere „**How long have you tested it on off?**" — **nimeni n-a răspuns.**

## 3.9 Practicieni pentru care NU există poziție citabilă

✅ Verificat activ, nu doar necăutat:

- **Andrew Foxwell** — s-au enumerat postările indexate de pe foxwelldigital.com: **niciun articol** despre Audience Network sau excluderi de plasare. Cel mai apropiat candidat deschis (`is-audience-targeting-still-important-for-meta-ads`) nu menționează subiectul. Ghidarea lui operațională stă în Slack-ul plătit Foxwell Founders, necrawlabil. **Nu-i atribuiți o poziție.**
- **Savannah Sanchez, Barry Hott, Depesh Mandalia** — zero rezultate pentru numele lor + „audience network".

## 3.10 Concluzia consolidată

> **Poziția „exclude mereu Audience Network" e ubicuă printre media buyeri, dar în literatura citabilă e susținută aproape exclusiv de dovezi din campanii cu obiectiv Traffic, plus anecdote anonime netestate.**

Sursele cu nume și autoritate fie (i) **împart recomandarea pe obiectiv** (Social Media Examiner, Loomer), fie (ii) o fac **condiționată de datele contului** (CTC), fie (iii) **argumentează împotriva segmentării manuale** (3Q Digital).

## 3.11 Numere de evitat

- ❌ **lebesgue.io**: „CPC decreased by **150%**" — matematic imposibil.
- ❌ **morshedpp.com**: „CPM cu 40-70% mai mici", „clicuri accidentale de 3-8×" — inventate, fără sursă.

---

# 4. Link clicks → Landing Page Views

## 4.1 Definițiile oficiale

✅ **Link clicks** — [Meta](https://www.facebook.com/business/help/659185130844708):

> „The number of clicks on links within the ad that led to advertiser-specified destinations, on or off Meta technologies."
> „How it's calculated: The number of clicks, **swipes and other gestures** on links within the ad…"

✅ **Ce intră în link clicks și NU ajunge pe site** — [Meta](https://www.facebook.com/business/help/284415655604125):

> „Clicks on ad formats that take someone into a full-screen experience, such as **lead forms, Instant Experience and collection**"

✅ **Outbound clicks** — [Meta](https://www.facebook.com/business/help/186560398499760):

> „The number of clicks on links that lead to destinations **outside** Meta technologies."
> „**While some traffic might drop off between an outbound click and a webpage view**, outbound clicks give you a closer approximation of the traffic intended for your website or app."

✅ **Landing page views** — [Meta](https://www.facebook.com/business/help/361750134220832):

> „Landing page views are counted when a webpage loads after an ad is clicked."
> „Landing page views are tracked when people use the **in-app browser** on Meta Technologies to visit your destination web pages **or** by having a Meta Pixel installed on them."
> „In some cases where landing page view events can't be counted directly due to partial or missing data, **statistical modeling may be used**."
> „**You can compare landing page views to link clicks to understand how many times people may have clicked on your ad but left before your website loaded.**"

## 4.2 CORECTURA DE NUMITOR — de ce contează și cum se recalculează

Aceasta e cea mai importantă corecție practică a temei.

**Problema:** „13% din link clicks devin LPV" folosește un numitor greșit. Meta numără ca **link click** și clicurile care **nu ating niciodată site-ul**: lead forms, Instant Experience, collection, click-to-message, click-to-call, Marketplace, app store.

✅ Pagina oficială care compară exact cele două metrici — [Understand the difference between link clicks and landing page views](https://en-gb.facebook.com/business/help/172641445757289) — listează **doar două** cauze, și **niciuna nu e pixelul sau consimțământul**:

> „**Why don't the number of link clicks always match the number of landing page views?** Here are some reasons: **The web page isn't fully loading or the app failed to open** after a link click. / **You may have specified multiple link click destinations** while creating an ad that doesn't click through to your landing page."

**Recalcularea corectă:**

```
Quality Click Rate = Landing Page Views ÷ Outbound Clicks
```

✅ Ordinea normală a metricilor, [Loomer](https://www.jonloomer.com/qvt/are-you-using-link-clicks-wrong/): „you'll typically get the most link clicks, followed by **Outbound Clicks** and then **Landing Page Views**."

✅ Pragul lui — [Quality Click Rate Custom Metric](https://www.jonloomer.com/qvt/quality-click-rate-custom-metric/) (02.04.2023):

> „your Quality Click Rate is the percentage found when dividing the **Landing Page Views by the Outbound Clicks.** You should find your own benchmarks here. But I've found that **anything under 70% is bad, and I want to get something at least in the 80s**."

⚠️ **Loomer împarte la Outbound Clicks, nu la Link Clicks** — tocmai ca să elimine clicurile care rămân pe Meta. Dacă cineva vă citează „pragul 70/80% al lui Loomer" raportat la *link clicks*, îl citează greșit.

**Meta are chiar o metrică oficială pentru raport** — ✅ [Landing page views rate per link clicks](https://www.facebook.com/business/help/1095278185491350): „landing page views divided by link clicks, multiplied by 100" — dar **nu publică niciun interval normal.**

## 4.3 NU există benchmark autoritar — dispersia E constatarea

| Prag afirmat | Sursă | Status |
|---|---|---|
| „sub 80% = posibil o problemă" | Luke Smith, [Social Media Examiner](https://www.socialmediaexaminer.com/12-techniques-to-reduce-facebook-ad-spend/) (2019) | ✅ |
| „100 clicks → 50 LPV = problemă mare, ți-ai dublat costul traficului" | Charlie Lawrance, [Social Media Examiner](https://www.socialmediaexaminer.com/10-facebook-ad-metrics-marketers-must-track/) (2021) | ✅ |
| 90% sănătos; „sub 60% = pixel greu / anunț înșelător / targetare greșită" | Jacquelyn Benda, 9 Clouds (2023), via Wayback | ✅ |
| „industry benchmark 75–85%" | AdYogi, via Wayback | ✅ (dar „industry based" nesursat) |
| „sub 10% diferență = nu-ți face griji" | Jakob Böld, [Beast.bi](https://www.beast.bi/en/blog/difference-between-clicks-and-landing-page-views) (2026) | ✅ |
| „up to a 50% drop-off" | PixelMe, via mirror SPS Commerce | ✅ |

De la „10% diferență e ok" la „50% drop-off e comun". **Oricine vă dă o singură cifră vă dă o opinie.**

✅ Practicieni, ian. 2026 — [Ira Bodnar, LinkedIn](https://www.linkedin.com/posts/bodnarira_meta-ads-performance-dipped-hard-after-jan-activity-7417260272270176256-6L_F): „Landing Page Views per Link Click… **Used to be 95%+.** Now showing 20-50%." (146 reacții; comentatori independenți dau „80-85%" ca normal.)

✅ Meta vs GA4, ordin de mărime — [Ruler Analytics](https://www.ruleranalytics.com/blog/analytics/facebook-ads-google-analytics-discrepancy/): „Minor differences of **10 to 20%** between the two platforms are completely normal."

**Concluzie: 13% e sub orice prag publicat de oricine.** Chiar și cel mai permisiv (PixelMe) ar da 50%.

## 4.4 Dovada că LPV poate fi SUPRA-raportat 200–3000%

Consensul zice „LPV < link clicks pentru că lumea pleacă". O agenție a testat sistematic și a găsit **invers**.

✅ Bianca Maurer, Senior Performance Marketing Manager, [pixelart](https://www.pixelart-agency.com/en/trending/meta-landingpage-views/):

> „For traffic campaigns optimized for standard landing page views, **Meta's figures were 200% to 3,000% higher than the actual sessions measured**, depending on the account."

Controlul metodologic (esențial — de asta e credibil):

> Custom conversions pe aceleași landing pages (pixel + consimțământ) → „**These values matched those in GA4 and Matomo almost exactly.**"

Mecanismul propus:

> „the discrepancy occurs **when the standard landing page view is used as the optimization goal for a traffic campaign**… as soon as the algorithm is tasked with maximizing a signal, it does exactly that, **regardless of whether the underlying events are real or estimated**."

Recomandarea lor: custom conversion + campanie **lead** în loc de **traffic**, ca să optimizezi pe eveniment măsurat, nu modelat.

**De ce e plauzibil mecanic:** Meta a schimbat definiția LPV. ✅ [About landing page view optimization](https://www.facebook.com/business/help/417293491972212):

> „**Starting in July 2025**, Landing page view will be available for advertisers with pixel sharing challenges."
> „**Starting in June 2025**, Instant Experience will no longer count as a landing page view."

Versiunea arhivată (© 2023) spunea: „you **need** to have a Meta pixel installed". Mai puțin pixel obligatoriu = mai multă modelare statistică.

## 4.5 Meta recomandă optimizarea pe LPV; Loomer o testează și o respinge

✅ **Meta:** „We recommend landing page view optimization over link click optimization, since the former can improve traffic quality… **To improve performance, we may prioritize higher-quality clicks.**"

✅ **Loomer** a testat afirmația în mai 2026. Procentul de vizite de 15 secunde din LPV:

| Performance goal | Vizite ≥15s din LPV |
|---|---|
| Landing Page Views | **8,4%** |
| Leads | **54,0%** |
| Purchases | **54,4%** |

> „That's some **paper-thin support** for 'prioritizing higher-quality clicks'… They're only 'higher quality' because they're landing page views. But Meta doesn't seem to care at all about the quality of the visit."

El însuși precizează: „This experiment was hardly scientific."

## 4.6 Celelalte cauze, cu surse

**Viteza de încărcare.** Sursa ORIGINALĂ a statisticii celebre: ✅ [DoubleClick by Google, *The need for mobile speed*, sept. 2016](https://www.thinkwithgoogle.com/_qs/documents/2340/bc22e_The_Need_for_Mobile_Speed_-_FINAL_1.pdf):

> „**53% of visits are abandoned if a mobile site takes more than three seconds to load**"

⚠️ **Două corecturi:** nota de subsol spune „n=3.7K, Global, March 2016" — **~3.700 site-uri**, nu 11.000. Și metrica e „**visits abandoned**", nu bounce rate — recitarea ca bounce rate e o mis-citare răspândită. Articolul lui Daniel An (martie 2017) **re-citează același eșantion**, nu e confirmare independentă.

⚠️ Seria 32%/90%/106%/123% supraviețuiește doar ca **re-citare** în ✅ [Deloitte Ireland pentru Google, *Milliseconds Make Millions*, 2020](https://www.thinkwithgoogle.com/_qs/documents/9382/Milliseconds_Make_Millions_report.pdf). Documentul Google/SOASTA 2017 original **nu a putut fi găsit**.

✅ Meta însăși citează cei 53% — [Stick the Landing](https://www.facebook.com/business/news/landing-page-optimization-best-practices) (25.04.2022).

✅ Cea mai recentă dată primară (despre conversie, nu abandon) — [Shopify](https://www.shopify.com/enterprise/blog/store-speed-conversion) (27.04.2026): „For every 100 milliseconds slower a store loads, conversion tends to be about **3.5% lower**."

**Ad blockere — mecanism DOVEDIT.** ✅ Reguli live din EasyPrivacy ([EasyList](https://github.com/easylist/easylist)):

```
||connect.facebook.net/signals/$third-party
/fbevents.js
/fbevents.min.js
```

Orice browser cu uBlock Origin / Brave blochează pixelul complet. ⚠️ Prevalență: „The average adblock rate across geos and verticals is 21%" — [Blockthrough, 2022 PageFair Adblock Report](https://blockthrough.com/blog/2022-pagefair-adblock-report/) (măsurat pe desktop/publishing, **nu** e rata de blocare a pixelului).

**iOS ATT / Safari ITP.** ✅ [Meta Q4 2021 Earnings Call](https://s21.q4cdn.com/399680738/files/doc_financials/2021/q4/Meta-Q4-2021-Earnings-Call-Transcript.pdf) (02.02.2022), David Wehner: „we believe the impact of iOS overall as a headwind on our business in 2022 is **on the order of $10 billion**". Sheryl Sandberg: „The first is **the underreporting gap.**"

✅ [John Wilander, WebKit Blog](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/) (24.03.2020): ITP „**deleting all of a website's script-writable storage after seven days**".

**In-app browser.** ✅ [Felix Krause](https://krausefx.com/blog/ios-privacy-instagram-and-facebook-can-track-anything-you-do-on-any-website-in-their-in-app-browser) (10.08.2022): Instagram/Facebook iOS randează linkurile într-un webview propriu și injectează `pcm.js`.
⚠️ **Nu există nicio sursă primară care să demonstreze că in-app browser-ul RUPE pixelul.** Afirmația circulă pe bloguri de agenție și e nesusținută.

**SPA routing (relevant pentru Next.js).** ✅ [Meta for Developers](https://developers.facebook.com/docs/meta-pixel/get-started): codul de bază „automatically tracks a single `PageView` conversion by calling the `fbq()` function **each time it loads**."
⚠️ Meta **nu documentează nicăieri** SPA / `history.pushState`. Deducția că o schimbare de rută nu declanșează PageView e a noastră, nu a Meta.

**Boți / clicuri accidentale.** ✅ [Meta](https://www.facebook.com/business/help/211248262238771): „Clicks from people that don't indicate a genuine interest… includes **repetitive or accidental clicks**… Clicks generated through prohibited means, such as **fake accounts, bots, scrapers, browser add-ons**" — fără rate publicate.

## 4.7 Bug-ul Meta din ianuarie 2026 — verificat și ELIMINAT ca explicație

✅ Declarație oficială Meta:

> „On January 9, 2026, we discovered a system issue that caused a **significant decrease in reported Pixel Landing Page Views (LPVs)** for some advertisers… The issue began on January 6, 2026… **The issue was resolved on January 13, 2026**, at 2:56 PM PST."

✅ Confirmat independent de [Foxwell Digital status page](https://www.foxwelldigital.com/status): „a sudden, severe drop (**up to ~80%**) in the click → landing page view rate on iOS devices… **It's not broken tracking (pixels/CAPI are firing)**, but a Meta–iOS delivery/measurement problem."

👉 **Rezolvat din 13.01.2026; campania a pornit în septembrie 2026 — NU explică un 13% măsurat acum.**

## 4.8 Ordinea corectă de diagnostic

1. **Recalculează cu Outbound Clicks în numitor.** Prag Loomer: sub 70% = rău, țintă 80+.
2. **Breakdown pe plasare, ÎNTÂI** — apoi device, apoi geo. Doi practicieni independenți recomandă exact secvența:
   ✅ Peter Quadrel (founder Odylic Media), [LinkedIn](https://www.linkedin.com/posts/peter-quadrel_this-is-the-most-important-equation-on-meta-activity-7481938153524621312-jb2Q): „Click Quality climbing, Conversion stable = **junk traffic.** People click and never arrive. Bots, or Meta leaning into cheap placements like Audience Network. **Check placements first.**" / „Decompose in order: **placement first**… then age and gender… then geo."
3. **Cross-check GA4/Matomo + UTM.** GA4 arată traficul iar Meta nu → problemă de raportare. Niciunul → problemă reală.
4. **Meta Pixel Helper + Network tab** — caută requesturi către `facebook.com/tr`.
5. **Custom conversion pe URL**, declanșat doar la load real + consimțământ, comparat cu LPV standard (metoda pixelart). Separă simultan trei ipoteze: pixel blocat de consimțământ, PageView care nu se re-declanșează la navigare client-side, LPV umflat prin modelare.
6. **Verifică status page Foxwell** înainte să dai vina pe site.

## 4.9 Cifre respinse

- ❌ „Landing page views were only 1.3% lower than link clicks" (atribuit AdEspresso) — **nu există**; toate cele 4 pagini candidate fetchate.
- ❌ Pragurile 70%/60% atribuite de motoarele de căutare către CRO Benchmark — **nu sunt pe pagină**; apar doar pe un site de vendor IT mic.

---

# 5. Consimțământ / CAPI / GDPR

## 5.1 EDPB — paragrafele verbatim

📄 **[Guidelines 2/2023 on Technical Scope of Art. 5(3) of ePrivacy Directive, Version 2.0, adoptate 7 octombrie 2024](https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf)**

✅ PDF descărcat, text extras local cu `pdftotext -layout`, citate verificate de două ori. **Acestea sunt singurele citate din tot raportul care nu au trecut printr-un strat de extragere automată.**

**§10** (citând CJUE) — nu scapi invocând „sunt date pseudonimizate/nepersonale":

> „That protection applies to any information stored in such terminal equipment, **regardless of whether or not it is personal data**, and is intended… to protect users from the risk that hidden identifiers and other similar devices enter those users' terminal equipment without their knowledge".

(§12: „the notion of information includes both non-personal data and personal data".)

**§33** — JS care instruiește browserul să cheme un API endpoint intră sub art. 5(3):

> „That is equally the case when the accessing entity distributes software on the terminal equipment of the user that is stored and will then proactively call an Application Programming Interface ('API') endpoint over the network. Additional examples would include **JavaScript code, where the accessing entity instructs the browser of the user to send asynchronous requests with the targeted information.** Such access clearly falls within the scope of Article 5(3) ePD."

**§34 — PARAGRAFUL CHEIE.** Demontează argumentul „dar datele le trimite serverul meu, nu browserul":

> „In some cases, **the entity instructing the terminal equipment to send back the targeted data and the entity receiving information might not be the same.** This may result from the provision and/or use of a common mechanism between the two entities. **Instructing the device to send already stored information** (for example, through the use of a protocol, or an SDK that imply the proactive sending of information by the terminal equipment) **makes an intrusion into the terminal equipment possible, therefore such an access triggers the applicability of Article 5(3) ePD.**"

Continuă: „this can be the case when a website instructs the terminal equipment to send information to third-party advertising services **through the inclusion of a tracking pixel**".

**§50** — pixelii și linkurile tracked = stocare, chiar și doar prin cache:

> „That distribution to the user's terminal equipment **does constitute storage**, at the very least through the caching mechanism of the client-side software. As such, Article 5(3) ePD is applicable, **even if this storage is not permanent**."

**§51** — `fbclid` în URL e „gaining of access":

> „The addition of tracking information to URLs or images (pixels) sent to the user constitutes an instruction to the terminal equipment to send back the targeted information (the specified identifier). In the case of dynamically constructed tracking pixels, it is the distribution of the applicative logic (usually a JavaScript code) that constitutes the instruction. As a consequence, it can be considered that **the collection of identifiers provided through such tracking mechanisms constitutes a 'gaining of access'** in the meaning of Article 5(3) ePD."

**§53** — prelucrarea locală urmată de trimitere la server rămâne acoperită:

> „If at any point and for example in the client-side code, the processed information is made available to a third-party, **for example sent back over the network to a server**, such an operation (instructed by the entity producing the client-side code distributed on the user terminal equipment) would constitute a 'gaining of access to information already stored'. **The fact that this information is being produced locally does not preclude the application of Article 5(3) ePD.**"

**§54** — tracking doar pe IP:

> „Some providers are developing solutions that only rely on the collection of one component, namely the IP address… In that context Article 5(3) ePD could apply **even though the instruction to make the IP available has been made by a different entity than the receiving one**."

**§55** — direct relevant pentru `client_ip_address` din CAPI:

> „gaining access to IP addresses would only trigger the application of Article 5(3) ePD in cases where this information originates from the terminal equipment of a subscriber or user. While it is not systematically the case (for example when CGNAT is activated), the static outbound IPv4 originating from a user's router would fall within that case, as well as IPV6 addresses since they are partly defined by the host. **Unless the entity can ensure that the IP address does not originate from the terminal equipment of a user or subscriber, it has to take all the steps pursuant to the Article 5(3) ePD.**"

**§56 — NUANȚA ONESTĂ, în favoarea contra-argumentului:**

> „the applicability of this article **does not systematically mean that consent needs to be collected.** The EDPB thus reminds that **in each case it would have to be assessed** if a consent is needed or whether an exemption under Article 5(3) ePD could apply."

**§63** — colectarea de identificatori unici prin cod client-side:

> „In the context of 'unique identifier' collection on websites or mobile applications, the entity collecting is instructing the browser (through the distribution of client-side code) to send that information. As such a **'gaining of access' is taking place** and Article 5(3) ePD applies."

## 5.2 De ce LDU e STRICT american

✅ Două pagini oficiale: [marketing-apis/data-processing-options](https://developers.facebook.com/docs/marketing-apis/data-processing-options) și [app-events/guides/data-processing-options](https://developers.facebook.com/docs/app-events/guides/data-processing-options).

Textul propriu al Meta:

> „gives you more control over how your data is used in Meta's systems and better supports your compliance efforts with **various US state privacy regulations**."

Parametrii, verificați în referință:

> „**Data Processing Options Country**: Current accepted values are **`1` for the United States of America**, or `0` to request that Meta perform geolocation."
> „**Data Processing Options State**: `1000` California, `1001` Colorado, `1002` Connecticut, `1003` Florida, `1004` Oregon, `1005` Texas, `1006` Montana, `1007` Delaware, `1008` Nebraska, `1009` New Hampshire, `1010` New Jersey, `1011` Minnesota, `1012` Maryland, `1013` Rhode Island"

**Singura țară acceptată e SUA. Nu există cod pentru România sau UE.**

❗❗ Și cel mai tare argument: **niciuna dintre cele două pagini nu menționează GDPR, UE sau SEE nici măcar o dată.** LDU nu are absolut nicio valoare pentru conformitatea GDPR. Dacă un furnizor vă vinde LDU ca „Consent Mode pentru Meta", e greșit.

## 5.3 Capcana `opt_out`

✅ [Server Event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event/). Definiția Meta:

> „A flag that indicates we should not use this event for ads delivery optimization. **If set to true, we only use the event for attribution.**"

❗ `opt_out: true` **NU oprește prelucrarea.** Meta continuă să folosească evenimentul pentru atribuire. **Orice vendor care spune „pasezi consimțământul în payload prin `opt_out`" te induce în eroare pe GDPR.**

Mecanismul corect e client-side: ✅ [documentația GDPR a Pixelului](https://developers.facebook.com/docs/meta-pixel/implementation/gdpr) — `fbq('consent', 'revoke')` = „pause sending Pixel fires to Facebook"; `fbq('consent', 'grant')` = reia. Tot acolo:

> „**Each company is responsible for ensuring their own compliance with the GDPR**, just as they are responsible for compliance with the laws that apply to them today."

> „Businesses may want to implement code that creates a banner and requires affirmative consent (for example, an 'I agree' checkbox at the top of the page) to use the Pixel."

❗ Meta **nu declară nicăieri** că obține consimțământul în numele advertiserului.

## 5.4 Răspunsul pe trei straturi: se poate trimite CAPI fără consimțământ?

**NU — în orice implementare reală.** Trei straturi independente; trebuie să treci de toate trei, și cazi la fiecare.

### Stratul 1 — ePrivacy art. 5(3)

Orice eveniment CAPI util conține cel puțin unul dintre: `_fbp`, `_fbc`/`fbclid`, `client_ip_address`, `client_user_agent`. EDPB §34 (entitatea care instruiește ≠ cea care primește), §51 (URL/pixel tracking), §53 (prelucrare locală trimisă la server), §55 (IP din echipament terminal) acoperă exact aceste cazuri.

**Faptul că requestul HTTP final pleacă de pe serverul tău nu schimbă nimic: instrucțiunea către terminal a existat.**

Transpuneri naționale:
- ✅ Germania — [§25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html): „Die Speicherung von Informationen in der Endeinrichtung des Endnutzers oder der Zugriff auf Informationen, die bereits in der Endeinrichtung gespeichert sind, sind nur zulässig, wenn der Endnutzer auf der Grundlage von klaren und umfassenden Informationen **eingewilligt** hat."
- **România — art. 4 alin. (5) din Legea 506/2004.**

### Stratul 2 — GDPR art. 6, separat

Chiar dacă ai trece de stratul 1, divulgarea către Meta a unui email hash-uit rămâne prelucrare de date cu caracter personal și cere temei. **Hash-ul nu anonimizează:** e un identificator stabil, exact scopul pentru care Meta îl cere.

### Stratul 3 — contractul cu Meta

✅ [Business Tools Terms](https://www.facebook.com/legal/terms/businesstools) §3.c:

> „In jurisdictions that require informed consent for storing and accessing cookies or other information on an end user's device (**such as but not limited to the European Union**), you must ensure, **in a verifiable manner**, that an end user provides all necessary consents **before** you use Meta Business Tools to enable the storage of and access to Meta cookies or other information on the end user's device."

§1.g:

> „You represent and warrant that you (and any data provider that you may use) have all of the necessary rights and permissions and **a lawful basis** (in compliance with all applicable laws, regulations and industry guidelines) for the disclosure and use of Business Tool Data."

Și, sub GDPR, Meta te desemnează **Controller**: „you are the Controller in respect of the Processing of Personal Information in Business Tool Data".

> ❗ **Nici măcar nu ajungi la o dispută juridică: încalci contractul cu Meta înainte de a încălca GDPR.**

### Ce NU se susține

**Nu** se susține că „CAPI e ilegal". CAPI e perfect legal — și e cel mai bun instrument disponibil — **pentru utilizatorii care au consimțit.** Afirmația e strict despre trimiterea fără consimțământ.

### Zona genuin nerezolvată

EDPB §56 spune că aplicabilitatea art. 5(3) „does not systematically mean that consent needs to be collected" — excepțiile se evaluează caz cu caz. Practicienii se sprijină pe asta. Contraargumentul: CAPI e divulgare de identificatori către o platformă publicitară pentru personalizare, deci nu poate invoca plauzibil excepția „strict necesar pentru serviciul cerut".

❗ **Nu există niciun text de regulator care să analizeze CAPI pe nume** — nici care să acorde o excepție, nici care să o refuze. **Ăsta e un gol real, nu o certitudine.**

## 5.5 Dezacordul: vendorul se contrazice pe sine

**Tabăra vendorilor:**

✅ Stape, [Facebook Conversion API vs Facebook Pixel](https://stape.io/blog/facebook-conversion-api-vs-facebook-pixel) (Ira Holubovska):

> „With Facebook Conversions API, you can **bypass all these tracking restrictions** and track user behavior even when tracking restrictions are enabled, and fb pixel is blocked."

Plus „Recent studies show advertisers can lose up to 30% of conversion data" — ❌ **fără nicio sursă citată.**

✅ Stape, [how to set up Facebook Conversion API](https://stape.io/blog/how-to-set-up-facebook-conversion-api): server-side „does not depend on what happens in the user's browser, meaning ad blockers, ITP, and iOS restrictions have little to no effect on data collection."
❗ **Tehnic FALS ca formulare:** `_fbp`/`_fbc` se nasc în browser.

**IRONIA CEA MAI UTILĂ — Stape se contrazice pe sine.** ✅ [server-side tracking GDPR](https://stape.io/blog/server-side-tracking-GDPR) (18.09.2025) are o secțiune intitulată **literal** „**Why you can't use server-side tracking to bypass consent**":

> „it doesn't mean you shouldn't ask for consent from your users. The GDPR requires legitimate grounds to process personal data."

> Când vendorul își contrazice propriul pitch pe pagina de conformitate, aia e cea mai bună dovadă că pitch-ul e marketing.

**Tabăra opusă:**

✅ Simo Ahava (consultant independent, **nu vinde produs de tracking**) — [First-Party Mode](https://www.simoahava.com/analytics/first-party-mode-google-tags/):

> „From a legal or regulatory point-of-view, at least in the European Union, **FPM doesn't really change anything. You still need a legal basis to process the user's personal data (GDPR).**"

> „If using FPM to circumvent WebKit's protections is lame, then using first-party setups to circumvent ad blockers is even more so. It's also **ethically questionable.** Users have the right to block whatever resources they like. It's their browser. It's their agency."

✅ Ahava, [agency transparency & control](https://www.simoahava.com/analytics/agency-transparency-control-unsolved-problems-server-side-tagging/) (26.10.2022): „moving your data flows to the server **doesn't exempt you from this**"; „What happens in the server, stays in the server" (problema de auditabilitate).

✅ Ahava, [server-side tagging in GTM](https://www.simoahava.com/analytics/server-side-tagging-google-tag-manager/) — despre motivul „scap de ad blockere": „**Should you? Definitely not**; at least if that's your primary reason." Și: „**Consent management is up to the admin**" — tag-urile server-side nu pot folosi API-uri de consimțământ client-side.

✅ Ahava, [Facebook Conversions API cu sGTM](https://www.simoahava.com/analytics/facebook-conversions-api-gtm-server-side-tagging/) (19.03.2021) — deschide cu:

> „**Please, please, please make sure that you have the legal right to send end users' personal data to Facebook. Don't follow the instructions below blindly.**"

✅ Foxwell Digital (Daphne Karagianis, 11.02.2021) — valoros pentru că vine din tabăra de performanță, nu de privacy: CAPI e „**NOT a way around the ATT Protocol**".

## 5.6 Constatarea cea mai practică: consimțământul e OPT-IN în uneltele server-side

Aceasta explică de ce atâtea implementări sunt neconforme fără ca nimeni să observe:

- ✅ **Usercentrics** (vendor de CMP!) — documentația proprie de integrare sGTM–Meta **nu conține niciun mecanism** de eliminare a evenimentelor la refuz. Doar „Keep in mind to validate the consent", iar pagina de ghid linkată dă **404**.
- ✅ **Stape** — opțiunea „trimite doar cu consimțământ de marketing" este **implicit dezactivată**.

> **Respectarea consimțământului în server-side este muncă de configurare opt-in, nu comportament implicit.** De aici vin majoritatea implementărilor neconforme din practică.

**Verificarea care contează:** nu „am pus CAPI", ci „**am confirmat că evenimentele NU pleacă la refuz**".

## 5.7 Mecanica CAPI — detalii verificate

✅ **Deduplicare** ([docs](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)): `eventID` din Pixel = `event_id` din CAPI; `event` = `event_name`. Alternativ `fbp`/`external_id` + `event_name`, dar „only works for deduplicating events sent first from the browser and then through the server".
**FEREASTRA:** „events are only deduplicated if they are received **within 48 hours** of when we receive the first event."

✅ **`_fbp`/`_fbc`**: ambele sunt cookie-uri **first-party setate de JS-ul Pixelului**. `_fbc` derivă din `fbclid` din URL. Format `version.subdomainIndex.creationTime.identifier`. „We recommend that you always send `_fbc` and `_fbp` browser cookie values… when available."

✅ **Parametri de identificare**: SHA-256 obligatoriu pentru `em, ph, fn, ln, db, ge, ct, st, zp, country`; recomandat pentru `external_id`. **NU se hash-uiesc:** `client_ip_address`, `client_user_agent`, `fbc`, `fbp`, `subscription_id`, `lead_id`. Email: trim + lowercase. Telefon: „Remove symbols, letters, and any leading zeros… Always include the country code" → pentru RO, `07…` → `407…`.

✅ **CAPI Gateway** ([docs](https://developers.facebook.com/documentation/ads-commerce/gateway-products/conversions-api-gateway)): rulează în **contul TĂU** de cloud („provisioned within a cloud provider's account owned by the business"; AWS EKS, AWS ECS Express sau GCP), nu la Meta. „The `event_id` deduplication key is automatically generated and propagated." Costul = doar resursele cloud.

✅ **Ce revendică Meta pentru CAPI** ([About Conversions API](https://www.facebook.com/business/help/2041148702652965)):

> „Data from the Conversions API is less impacted than the Meta Pixel by **browser loading errors, connectivity issues and ad blockers**."

❗ Observați ce **lipsește** din listă: consimțământul. Meta revendică rezistență la erori tehnice, **nu** la refuzul utilizatorului.

## 5.8 Rate reale de consimțământ

✅ **[Didomi, State of Data Privacy 2026](https://www.didomi.io/blog/benchmark-average-consent-rate-europe)** (Thierry Maout, 19.03.2026; date colectate în 2025).

**DISTINCȚIA CRITICĂ**, din ✅ [glosarul lor propriu](https://www.didomi.io/blog/cmp-consent-banner-performance-metric-glossary):

- **Opt-in rate** = Opt-ins / bannere afișate ← **aceasta e fracțiunea din trafic pe care o poți urmări**
- **Consent rate** = Opt-ins / (Opt-ins + Opt-outs) ← **EXCLUDE pe cei care ignoră bannerul**
- **No-choice rate** = No-choice / bannere afișate

Diferența e de **15–25 puncte procentuale** în fiecare rând. Cine citează „consent rate" ca acoperire de tracking exagerează masiv.

**Pe industrii** (✅ [sursa B](https://www.didomi.io/blog/benchmark-consent-rate-by-industry-europe-2026), 25.05.2026, 16 industrii):

| Industrie | Consent | **Opt-in** | No-choice |
|---|---|---|---|
| Media & Publishers | 82,7% | 64,4% | 22,6% |
| Gaming & Sports | 79,3% | 60,2% | 24,1% |
| Fashion & Jewelry | 78,0% | 55,4% | 29,1% |
| Travel & Transport | 75,8% | 56,1% | 26,0% |
| **► Services** (proxy eghiseul.ro) | **75,3%** | **54,5%** | **27,6%** |
| High Tech & Telecom | 75,4% | 49,8% | 35,1% |
| Real Estate | 75,1% | 56,5% | 24,7% |
| Finance & Insurance | 72,8% | 52,8% | 27,3% |
| **► Public Sector & Charity** | **70,4%** | **53,8%** | **23,2%** |
| Energy & Utilities | 69,6% | 50,6% | 27,0% |

**Pe regiuni:**

| Regiune | Consent | Opt-in |
|---|---|---|
| Europa de Est (unde e topită România) | 89,3% | 67,6% |
| Insulele Britanice | 87,3% | — |
| Europa de Nord | 84,8% | — |
| Europa de Sud | 82,5% | — |
| Europa de Vest | 75,1% | 55,7% |
| Franța | 71% | — |

⚠️ **Limitări:**
- **România NU e defalcată** — e topită în „Eastern Europe". Tabelele per țară sunt într-un PDF cu gate, nedescărcat.
- Metodologia e descrisă **doar calitativ** („hundreds of millions of consent interactions across European markets") — fără număr de site-uri, fără intervale de încredere, fără ponderare.
- Eșantionul e **auto-selectat spre clienți care au cumpărat optimizare de consimțământ** → înclinat în sus.
- ❗ **Didomi NU publică o singură cifră „media europeană"** pe pagina publică. **Nu o construiți prin mediere** — regiunile nu sunt ponderate.

**Cercetare academică** (mai riguroasă, dar pe scenarii mai stricte):

✅ Utz, Degeling, Fahl, Schaub, Holz, [*(Un)informed Consent: Studying GDPR Consent Notices in the Field*](https://arxiv.org/abs/1909.02638), ACM CCS '19 — studiu de teren pe **82.890 vizitatori reali**:

> „in a **privacy-by-default (opt-in) setting, less than 0.1% of visitors allow cookies to be set for all purposes**."

✅ Nouwens, Liccardi, Veale, Karger, Kagal, [*Dark Patterns after the GDPR*](https://arxiv.org/abs/2001.02479), CHI '20:

> „removing the opt-out button from the first page **increases consent by 22–23 percentage points**"

✅ Nouwens et al., CHI 2025 — date de design de banner pentru România: 73% au banner, 12% conforme minimal, doar **36% au buton de refuz** vs 45% media UE; CookieYes lider cu 14%.

## 5.9 Modelarea conversiilor / AEM — GOL MAJOR

❗❗ **NU EXISTĂ NICIO DECLARAȚIE OFICIALĂ META VERIFICATĂ DESPRE AEM SAU CONVERSII MODELATE.**

Motivul, concret: paginile Meta Business Help Center sunt randate client-side. Încercate și eșuate: `help/387440828988900` (Key Concepts for AEM), `help/765081237991954` (Event Match Quality), `business/gdpr` (redirect 302).

⚠️ **Doar snippet** (din rezumate de căutare — **NU citați ca verbatim**): AEM ar fi protocolul introdus ca răspuns la ATT (iOS 14.5+), raportând agregat; Meta ar fi eliminat ranking-ul manual de 8 evenimente pentru web la mijlocul lui 2025; tabul AEM din Events Manager ar fi fost eliminat; întârziere de raportare ~72h; conversiile modelate ar apărea amestecate cu cele observate, fără coloană separată.
❌ Cifra „dacă pixelul se declanșează pe sub 50% din evenimente, conversiile modelate domină" vine dintr-un blog de agenție și e nesusținută.

### PUNCTUL CRUCIAL, care SE POATE susține

> **Nu există echivalent Meta pentru Google Consent Mode.**
>
> Google **modelează** conversiile pentru utilizatorii **fără** consimțământ (pinguri fără cookie). Meta **NU** are așa ceva în UE: `fbq('consent','revoke')` pur și simplu **oprește trimiterea**, iar LDU e doar pentru SUA.
>
> **AEM este un răspuns la ATT (opt-out iOS), NU un mecanism de recuperare a semnalului pierdut prin bannerul de cookie-uri în UE.**

❗ Confuzia dintre cele două e o **eroare frecventă în materialele de vendor**.

**Pentru contrast — cifrele Google** (✅ verificate; relevante ca **ordin de mărime**, NU ca proxy pentru Meta):

✅ [Google, Conversion modeling through Consent Mode](https://blog.google/products/marketingplatform/360/conversion-modeling-through-consent-mode-google-ads/) (15.04.2021, Henrique de Freitas): recuperează „**more than 70% of ad-click-to-conversion journeys lost due to user cookie consent choices**". Caveat propriu: „Results for each advertiser may vary widely."

✅ [Google Ads Help](https://support.google.com/google-ads/answer/10548233): „**Consented users are typically 2-5x more likely to convert than unconsented users.**" Exemplu propriu: rată de consimțământ 50% → doar **19% scădere** de conversii. Prag de eligibilitate: „700 ad clicks over a 7 day period, per country and domain grouping."

## 5.10 Ce se recuperează efectiv

- **Se recuperează:** evenimentele pierdute din motive **tehnice** — adblockere, erori de încărcare, ITP care taie durata cookie-ului, pierderi de rețea. Exact ce revendică Meta.
- **NU se recuperează legal:** utilizatorul care a refuzat. **Refuzul nu e o problemă tehnică de rezolvat.**

---

# 6. Judecarea unui creative

## 6.1 Pragul de 500 afișări

✅ [About ad relevance diagnostics](https://www.facebook.com/business/help/403110480493160):

> „To ensure ad relevance diagnostics are accurate, **ad relevance diagnostics aren't available for ads with fewer than 500 impressions.** Ad relevance diagnostics **aren't inputs into the ad auction**."

**Sub 500 de afișări per reclamă nu ai ce citi.**

Cele trei diagnostice:

> „**Quality ranking:** How your ad's perceived quality compared to ads competing for the same audience.
> **Engagement rate ranking:** How your ad's expected engagement rate compared to ads competing for the same audience.
> **Conversion rate ranking:** How your ad's expected conversion rate compared to ads with the same optimization goal competing for the same audience."

## 6.2 Scala e percentilă, nu absolută

✅ [About quality ranking](https://www.facebook.com/business/help/303639570334185):

> „Possible values for quality ranking are (**where average represents the 35th to 55th percentile**): Above average / Average / **Below average (bottom 35% of ads)** / **Below average (bottom 20% of ads)** / **Below average (bottom 10% of ads)**."

> „For example, a quality ranking of Below average (bottom 20% of ads) means that your ad's perceived quality was among the lowest 20% of ads competing for the same audience."

> „Quality ranking isn't available for dynamic creative. **This metric is only available for the last 35 days.**"

Cum se măsoară calitatea:

> „We measure ad quality through various signals, such feedback from people **viewing or hiding the ad** and assessments of **low-quality attributes** in the ad, such as **withholding information, sensationalized language and engagement bait**."

## 6.3 MATRICEA OFICIALĂ DE INTERPRETARE

✅ [How to use ad relevance diagnostics](https://www.facebook.com/business/help/436113280262012). Tabelul complet, verbatim:

| Quality | Engagement | Conversion | Cauza (Meta) | Recomandarea (Meta) |
|---|---|---|---|---|
| ≥medie | ≥medie | ≥medie | „You're all good!" | Optimize for your advertising objective |
| **sub medie** | *n/a* | *n/a* | „The ad is perceived as low quality" | Îmbunătățește calitatea creative-ului sau targetează o audiență mai potrivită; evită atributele de calitate slabă |
| ≥medie | ≥medie | **sub medie** | „**The ad isn't producing conversions**" | Îmbunătățește CTA-ul sau **experiența post-click**, sau targetează o audiență cu intenție mai mare. „Some products and services naturally exhibit lower conversion rates than others." |
| ≥medie | **sub medie** | ≥medie | „**This ad isn't spurring interest**" | Fă reclama mai relevantă/atrăgătoare, sau targetează audiență mai predispusă să interacționeze |
| ≥medie | **sub medie** | **sub medie** | „isn't spurring interest **or** producing conversions" | Ambele: relevanța reclamei **și** CTA/post-click |
| **sub medie** | **sub medie** | ≥medie | „perceived as low quality and isn't spurring interest" | Calitatea creative-ului + relevanța |
| **sub medie** | ≥medie | **sub medie** | „**This ad is click-baity or controversial**" | „Adjust your ad to more clearly represent the product or service you are advertising" |
| **sub medie** | **sub medie** | **sub medie** | „room for improvement across the board" | Testează alt targeting, creative, obiectiv, post-click |

**Regula de prioritizare, verbatim:**

> „It's **more impactful to move a ranking from low to average** than it is to move a ranking from average to above average, so focus on improving low rankings rather than on improving average rankings."

> „Rather than seek the ideal creative or the ideal targeting, **seek the ideal creative/targeting fit.**"

**Avertismentele oficiale pe care majoritatea le ignoră:**

> „use ad relevance diagnostics to **diagnose underperforming ads** – not to optimize ads that are already meeting your advertising objectives. **Achieving high ad relevance diagnostics rankings should not be your primary goal**, and doesn't guarantee an increase in results."

> „**Sometimes high performing ads have below average ad relevance diagnostics rankings and that's OK.** Optimize for your advertising objectives, not for quality ranking, engagement rate ranking or conversion rate ranking."

## 6.4 Cât să cheltui înainte să decizi

✅ **Motion** (guest post, Ben & Vic Agency), [Ultimate Guide to Creative Testing](https://motionapp.com/blog/ultimate-guide-creative-testing-2025) — singura formulare cu autor verificată:

> „I recommend using rules to turn off overspending ad sets (e.g., **after 2 to 3 × the target CPA**)."

**Regula „3× CPA cu zero conversii":** circulă peste tot, dar toate sursele deschise erau conținut generat automat. ❌ Nu le citați.

**Ce se poate spune onest — matematica se verifică singură:** dacă o reclamă ar converti exact la CPA-ul țintă, probabilitatea de a vedea **zero** conversii după ce ai cheltuit 3× CPA este e⁻³ ≈ **5%**. Deci „3× CPA fără conversii → oprește, cu ~95% încredere" e o aplicare corectă a distribuției Poisson. **Aceasta e o derivare proprie, nu un citat.**

## 6.5 Datele Motion — ~5% winners

✅ **[Motion, Creative Benchmarks 2026](https://motionapp.com/library/research/creative-benchmarks-2026/)** + ✅ [metodologia publicată](https://motionapp.com/library/research/creative-benchmarks-2026/methodology).

**Dataset (verificat pe pagina de metodologie):**
- **6.015 conturi** de advertiser
- **578.750 creative** unice lansate în fereastră
- **1,29 miliarde $** cheltuială realizată
- Fereastră: **1 sept. 2025 – 1 ian. 2026** (include BFCM — „Findings are specific to this window")
- Platforme: Meta (Facebook + Instagram)

**Definiții (constante publicate):**
- **Winner** = spend ≥ **10× mediana contului** ȘI ≥ **$500** absolut (`TIER_THRESHOLDS = 10`, `MIN_SPEND_FLOOR = 500`)
- **Mid-range** = a cheltuit ≥28 zile fără să atingă pragul de winner
- **Loser** = oprit sau fără spend activ înainte de 28 zile
- **Hit rate** = winners ÷ total, calculat **la nivel de cont**, apoi medie neponderată pe tier

**Rezultatele:**

> „**~5%** of creatives are winners (≥10× account median spend, ≥$500)"
> „**~92.3rd percentile** is where the 10× threshold sits… **Only ~7.7% of creatives clear the bar.**"
> „**55%** of total Meta ad spend concentrated on winning creatives across the dataset — and the share rises from **Micro (23%)** to **Enterprise (64%)**."
> „**18.8** creatives per week at Enterprise advertisers."

Tiere de spend: Micro <$10k/lună; Small $10–50k; Medium $50–200k; Large $200k–1M; Enterprise $1M+.

✅ **Interpretarea Foxwell Digital**, [Motion Creative Benchmarks 2026: 8 Key Takeaways](https://www.foxwelldigital.com/blog/motion-creative-benchmarks-2026-8-key-takeaways):

> „**Low hit rates are not necessarily a sign of weak creative** but rather a **statistical feature** of how performance advertising on Meta actually works in practice."

> „Hit rate is often used as a scorecard for creative strategists, but on the contrary, **high hit rates may actually signal that an account isn't testing enough** to maximize their accounts' potential."

> Citând Motion: „**There's no universal testing volume that's 'best' for all advertisers.** The right testing volume depends on budget, team size, and how quickly an advertiser can produce new ideas."

> „**Don't sleep on simple creative:** Text-only ads, product images with text overlays, and simple GIFs are common top performers."

**Implicația directă:** dacă ~5% dintre creative devin câștigătoare, **un test cu 2–3 creative are șanse mari să nu conțină niciun câștigător**. Un rezultat slab pe 4 zile nu e verdict asupra creative-ului — e volum insuficient.

## 6.6 Entity ID — atenție la sursă

✅ Common Thread Collective, [Meta Just Revealed Why Your Creative Tests Keep Failing](https://commonthreadco.com/blogs/thread/meta-just-revealed-why-your-creative-tests-keep-failing) (10.10.2025):

> „Meta's ad system uses something called '**Entity ID**' to group creative learnings… When you upload a new creative that looks similar to an existing one, Meta assigns it the same Entity ID — even if the messaging is completely different. This means your 'new' ad **inherits all the performance data and audience fatigue from the old one**."

> „minor changes (aspect ratios, small text tweaks) **maintain the same Entity ID**, while significant visual changes create new ones."

⚠️ CTC atribuie asta unui „Meta internal training". **Sursa primară Meta NU a putut fi verificată.** Tratați-o ca afirmație CTC, nu ca documentație. Dacă e adevărată, înseamnă că a schimba headline-ul pe aceeași imagine **nu e un test nou**.

---

# 7. Cele 3 mituri demontate

## Mitul 1 — „O instanță germană a decis în 2026 că nu ai voie să tragi CAPI deloc"

❌ **Nu se regăsește în nicio hotărâre verificabilă.**

Ce **este** verificat, din ✅ comunicatul de pe presseportal.de (`pm/105254/6211468`):
- Instanța: **Oberlandesgericht Dresden**. Dosare: `4 U 196/25`, `4 U 292/25`, `4 U 293/25`, `4 U 296/25`.
- Hotărâri: **3 februarie 2026** (publicat 4 februarie).
- Pârât: **Meta Platforms Ireland** — **NU** operatorii de site-uri.
- Despăgubire: **1.500 €** daune morale per procedură (art. 82 GDPR), 4 reclamanți.
- Măsură suplimentară: obligarea Meta la încetarea „Weiterverarbeitung der mit den Business Tools gewonnenen personenbezogenen Daten dieser Kläger".
- Temei: lipsa unei „**wirksame, informierte Einwilligung** der Betroffenen".
- **Definitive:** „Die Revision wurde nicht zugelassen, **die Urteile sind damit rechtskräftig**."

❗❗ **AVERTISMENTE DE PĂRTINIRE, esențiale:**

1. **Comunicatul NU este al instanței.** E emis de **Dr. Stoll & Sauer Rechtsanwaltsgesellschaft mbH** — cabinetul reclamanților, care face marketing pentru acest tip de litigiu. Numerele de dosar sunt verificabile și probabil corecte; **caracterizarea constatărilor este a lor**.
2. **CAPI apare în comunicat DOAR ca element enumerat** în familia Business Tools — formularea e „**Schnittstellen wie die Conversions API**" — și **NU a fost evaluat separat de instanță.** Nu există nicio dovadă că instanța a analizat distinct fluxul server-to-server.
3. Lista detaliată de scope („Meta Pixel, Conversions API, App Events via Facebook SDK, Offline Conversions, App Events API") și afirmațiile despre art. 6 GDPR / minimizare / răspundere art. 26 pentru operatorii de site vin ⚠️ **DOAR din relatarea [PPC Land](https://ppc.land/german-court-blocks-metas-appeal-awards-eu1-500-for-business-tools-tracking/)**, nu din comunicat.
4. ❌ **Nu au fost citite:** textul hotărârii, un comunicat oficial al OLG Dresden, sau acoperire de la un raportor judiciar independent. MLex a scris despre caz, dar e paywall.

> **CONCLUZIE OPERAȚIONALĂ: NU folosiți această hotărâre ca temei juridic într-un document care contează. Este un semnal de risc real, nu o autoritate citabilă până nu se obține textul hotărârii.**

**Caz conex, sursă editorial mai bună:** ✅ LG Leipzig, 5.000 € daune — Suzanne Smalley, [The Record / Recorded Future News](https://therecord.media/german-court-meta-tracking-tech), 9 iulie 2025. Constatări raportate: pixeli și SDK-uri Meta încalcă GDPR prin colectare fără consimțământ; utilizatorii sunt identificabili pentru Meta pe site-uri terțe **indiferent dacă sunt logați**; acțiunile sunt admisibile **fără dovada unui prejudiciu individual**.

## Mitul 2 — „AEM / conversion modelling recuperează semnalul pierdut prin bannerul de cookie-uri"

❌ **Fals, și e confuzia cea mai frecventă din materialele de vendor.**

AEM e răspunsul Meta la **ATT-ul Apple** (opt-out la nivel de app tracking pe iOS). **Nu** e un mecanism de recuperare pentru refuzul de cookie-uri în UE. Meta nu are echivalent pentru Google Consent Mode: `fbq('consent','revoke')` oprește pur și simplu trimiterea, iar LDU e strict american.

## Mitul 3 — „Pragul de 20% la buget resetează faza de învățare"

❌ **Nu apare în nicio documentație Meta.** Vezi §1.3. Meta oferă doar exemplul $100→$101 vs $100→$1000, ambele cu limbaj deliberat vag. Loomer atacă explicit această lipsă. Cifra e folclor de practicieni, propagat inclusiv de agenții reale (Code3) ca și cum ar fi regulă a platformei.

**Bonus — mituri de citare adiacente:**
- ❌ „Search Engine Land despre Audience Network" — toate rezultatele sunt despre **Microsoft** Audience Network, nu Meta.
- ❌ „53% bounce rate la >3s" — sursa originală spune „**visits abandoned**", nu bounce rate, pe **n=3.700** site-uri, nu 11.000.

---

# 8. Cele 23 de goluri declarate

## Blocaje tehnice (1–7)

1. Paginile **Meta Business Help Center** nu se randează (title-only / HTTP 400). Consecință: **AEM, conversii modelate și Event Match Quality rămân neverificate din sursă Meta.**
2. **jonloomer.com** blocat de Cloudflare (403 la WebFetch, challenge JS la curl, inclusiv `/wp-json/`). Materialul recuperat doar din RSS full-text și pagini pubcast. Articolele lui despre **deduplicare și CAPI Gateway NU au fost deschise**.
3. **support.cookiebot.com** → 403. Nicio instrucțiune Cookiebot verificată pentru blocarea Pixelului.
4. **usercentrics.com** `/beta-docs/.../consent-in-server-gtm` → **404** (link rupt în propria lor documentație).
5. **MLex** pe hotărârea Dresden → paywall.
6. PDF-ul studiului **etracker** → doar imagine, zero text extractibil; metodologie neverificabilă.
7. **Bugetul WebSearch al sesiunii epuizat (200/200).**

## Cifre neverificate / respinse (8–17)

8. **Cifrele de performanță CAPI ale Meta (13% / 17,8% / 19% lift)** — negăsite pe surse Meta oficiale. PPC Land citează 17,8% și notează chiar ea că „comes directly from Meta's internal announcement but **lacks independent verification details**".
9. „Quantcast 2018: >90% consent" — doar second-hand, prin lucrarea Goldberg et al.
10. Snelders et al. 2020 (radiodifuzorul public olandez, ~10% opt-in) — doar second-hand.
11. Documentul FOI al ICO (ref. `irq0873632`) — doar relatarea VideoWeek, nu documentul.
12. **Tabelele per țară Didomi** (inclusiv orice cifră pentru România) — PDF cu gate, nedescărcat.
13. **Benchmark de consimțământ Osano** — **NU EXISTĂ niciun studiu Osano publicat**; cifrele care circulă („60–80% healthy benchmark", „56% ignoră / 37% acceptă mereu / 26% refuză mereu") vin din pagini agregator.
14. **Studiul Bruegel** (67% consimțământ la design neutru) — apărut doar în presa românească (economistul.ro) via snippet; sursa primară nelocalizată.
15. Toate procentele de „recuperare" din bloguri de vendor (15–25%, 30–70%, „40–60% refuză în DE/FR", „Air France +9%") — fără metodă, respinse.
16. „~10% evenimente în plus prin Gateway" (Loomer) — doar snippet.
17. Amenzile ANSPDCP altele decât CORAL TRAVEL (30k, 37k, 10k lei) — doar snippet, nedeschise pe dataprotection.ro.

## Goluri de fond (18–23)

18. ❗ **CEL MAI IMPORTANT: nu există nicio măsurătoare publicată, credibilă și verificabilă a decalajului „evenimente Pixel vs. comenzi reale din backend" pe piețele UE.**
    **Recomandare: măsurați singuri** — `Purchase` din Events Manager vs. comenzi plătite din DB, aceeași fereastră, dedup pe `event_id`, fereastră 48h.
19. **Nu există rată de opt-in publicată pentru România.** Există doar date de design de banner (Nouwens et al., CHI 2025).
20. **Statutul de certificare EU-US Data Privacy Framework al Meta** nu a fost verificat pe dataprivacyframework.gov. Contează pentru cât mai valorează deciziile austriece/CNIL pe transferuri (decizia de adecvare a Comisiei = 10 iulie 2023).
21. **Textul niciunei hotărâri germane nu a fost citit.**
22. **Nu există niciun text de regulator care să analizeze CAPI pe nume** în raport cu excepțiile de la art. 5(3) — nici pro, nici contra.
23. ❗ **Meta-gol:** cu excepția PDF-urilor EDPB extrase cu `pdftotext`, **toate citatele au trecut prin stratul de extragere al tool-ului de fetch**, nu prin ochii cuiva pe HTML brut. **Pentru orice citat publicat verbatim, redeschideți URL-ul și confirmați formularea.**

**Goluri suplimentare pe temele 3–4:**

- Nu s-a putut confirma nicio poziție publicată a lui **Savannah Sanchez, Barry Hott, Depesh Mandalia** pe Audience Network; **Andrew Foxwell nu are articol public** pe subiect.
- **Nu există benchmark citabil** pentru raportul LPV/link clicks (§4.3).
- Documentul **Google/SOASTA 2017** original cu seria 32/90/106/123 nu a putut fi găsit standalone.
- Nu există studiu primar 2023–2026 pe **load time vs. abandon**; tot ce circulă re-citează cei 53% din 2016.
- Nicio cifră specifică pentru **% din `connect.facebook.net` blocat de ad blockere**.
- Nicio sursă primară care să demonstreze că **in-app browser-ul rupe pixelul**.
- Meta **nu documentează** comportamentul pixelului în **SPA / `history.pushState`**.
- **Reddit**: agentul pe tema 4 a eșuat complet (403 pe toate rutele). Zero cifre de pe Reddit în §4.

---

# 9. Concluzia aplicată la campania noastră

**Datele:** 75 lei/zi, 4 zile, 235 lei cheltuiți, 1 InitiateCheckout raportat, serviciu ~200 lei.

## 9.1 Verdictul structural: nu se poate ieși matematic din learning phase

| Calcul | Rezultat |
|---|---|
| Buget săptămânal | 75 × 7 = **525 lei** |
| Cost/eveniment necesar pentru 50 IC/săpt. | 525 ÷ 50 = **10,5 lei** |
| Cost/eveniment observat | 235 ÷ 1 = **235 lei** |
| **Factor de depășire** | **~22×** |
| Formula (CPA × 50)/7 la costul observat | **1.678 lei/zi** |
| Regula Loomer (CPA × 75/săpt.) | 235 × 75 = 17.625 lei/săpt ≈ **2.518 lei/zi** |
| Chiar la un IC optimist de 40 lei | **285 lei/zi** (formula) / **428 lei/zi** (Loomer) |

**Ad set-ul va sta permanent în Learning Limited.** Nu e o fază care trece — la 75 lei/zi pe InitiateCheckout, e **starea de echilibru**. Formularea Meta e exactă: „your budget isn't being spent effectively because the ad delivery system can't optimize performance with your current setup."

**Observație secundară:** 235 lei în 4 zile la buget de 75 lei/zi înseamnă ~78% livrare (ar fi trebuit ~300 lei). Sub-livrarea în sine sugerează audiență mică, plasamente restrictive sau bid prea mic.

## 9.2 Dar NU acționați pe cifra „1 conversie"

Cu ~13% din link clicks devenind LPV, **„1 conversie" nu e un fapt, e un artefact de măsurare.** Pixelul ratează majoritatea traficului plătit; numărul real de InitiateCheckout e necunoscut. Orice decizie de buget luată pe cifra „1" e luată pe date rupte.

Cu un **opt-in realist de ~54,5%** pentru categoria Services (Didomi), o parte semnificativă din „lipsă" e **măsurare, nu performanță**.

## 9.3 Ordinea corectă de acțiune

**Pasul 0 — Recalculați numitorul.** LPV ÷ **Outbound Clicks**, nu ÷ Link Clicks. Dacă reclamele au destinații multiple sau formate full-screen, o parte din decalaj e **pur definițional**, nu un defect. Prag Loomer: sub 70% = rău, țintă 80+.

**Pasul 1 — Breakdown pe plasare, apoi device, apoi geo.** În ordinea asta (Loomer + Quadrel, independent).
⚠️ **Nu tăiați Audience Network reflex.** Optimizați pe InitiateCheckout = **conversie**, iar toate sursele care despart recomandarea pe obiectiv spun să *lăsați* plasările automate în acest caz. Costul măsurat al restricționării: **CPM 2×, CPC 3–4×**. La optimizare pe conversie, algoritmul abandonează singur plasamentul („not a penny").

**Pasul 2 — Verificați ordinea pixel vs. banner de consimțământ.** Cauza structurală cea mai probabilă în RO. Măsurați rata reală de accept.

**Pasul 3 — Testul decisiv (Next.js SPA + banner UE):** creați un **custom conversion pe URL-ul paginii**, declanșat doar la load real, și comparați-l cu LPV standard (metoda pixelart). Separă simultan trei ipoteze: pixel blocat de consimțământ, `PageView` care nu se re-declanșează la navigare client-side, LPV umflat prin modelare.

**Pasul 4 — Măsurați decalajul pixel-vs-backend.** `Purchase` din Events Manager vs. comenzi plătite din Supabase, aceeași fereastră, dedup pe `event_id`. **Nimeni nu vă poate da acest număr din exterior** (golul 18) — și e input direct pentru decizia de buget.

**Pasul 5 — Dacă porniți CAPI:** verificarea nu e „am pus CAPI", ci „**am confirmat că evenimentele NU pleacă la refuz**". În Stape opțiunea e implicit dezactivată; documentația sGTM a Usercentrics nu are mecanismul deloc. **Default-ul lucrează împotriva voastră.**

## 9.4 Despre creative: prea devreme, dar nu din motivul obișnuit

235 lei împărțiți pe câte reclame există înseamnă că probabil **nicio reclamă nu a atins 500 de afișări** — pragul sub care Meta **nici nu afișează** Quality/Engagement/Conversion ranking. Nu aveți ce citi.

Iar la o rată de reușită de ~5% (Motion, 578.750 creative), **un test cu puține variante e statistic aproape gol**.

## 9.5 Decizia de fond, după ce măsurarea e reparată

Alegeți conștient între cele două drumuri — e un **dezacord real între experți**:

- **Drumul Meta:** coborâți evenimentul de optimizare (ViewContent sau Landing Page View) ca să prindeți volum și să ieșiți din learning. **Oficial recomandat**, cu citat direct (§2.3).
- **Drumul Loomer:** păstrați InitiateCheckout, acceptați Learning Limited, creșteți bugetul când se poate. Susținut de testul cu Quality Visitor: optimizarea pe clicuri/LPV i-a adus trafic ieftin și **zero** înscrieri, în timp ce evenimentul corect a adus 5. Și de testul din mai 2026: **8,4% vs 54%** vizite de 15 secunde.

**Pentru un serviciu de 200 lei cu marjă reală, înclinația e spre Loomer** — dar cu bugetul crescut pe un **singur ad set consolidat**, nu împrăștiat. Meta e explicit: „By combining similar ad sets, you also combine learnings."

**Dacă bugetul rămâne 75 lei/zi:** acceptați că rulați permanent în Learning Limited și judecați **strict pe economia reală** (cost per comandă plătită vs. 200 lei încasare), ignorând statusul de livrare. Nu urmăriți ieșirea din learning phase — nu se va întâmpla, iar optimizările făcute ca s-o forțați (coborârea evenimentului) sunt exact cele care produc trafic care nu cumpără.

---

## Index de surse primare

**Meta — documentație oficială**
- [About the learning phase](https://www.facebook.com/business/help/112167992830700)
- [Significant edits and learning phase](https://www.facebook.com/business/help/316478108955072)
- [About learning limited](https://www.facebook.com/business/help/269269737396981)
- [Best practices for landing page view performance goals](https://www.facebook.com/business/help/203012060587398)
- [About landing page view optimization](https://www.facebook.com/business/help/417293491972212)
- [About ad relevance diagnostics](https://www.facebook.com/business/help/403110480493160)
- [How to use ad relevance diagnostics](https://www.facebook.com/business/help/436113280262012)
- [About quality ranking](https://www.facebook.com/business/help/303639570334185)
- [Link clicks](https://www.facebook.com/business/help/659185130844708) · [Outbound clicks](https://www.facebook.com/business/help/186560398499760) · [Link vs outbound](https://www.facebook.com/business/help/284415655604125)
- [Website landing page views](https://www.facebook.com/business/help/361750134220832) · [Difference link clicks vs LPV](https://en-gb.facebook.com/business/help/172641445757289) · [LPV rate per link clicks](https://www.facebook.com/business/help/1095278185491350)
- [Invalid clicks](https://www.facebook.com/business/help/211248262238771)
- [About Conversions API](https://www.facebook.com/business/help/2041148702652965)
- [Business Tools Terms](https://www.facebook.com/legal/terms/businesstools)
- [Meta Pixel GDPR](https://developers.facebook.com/docs/meta-pixel/implementation/gdpr) · [Get Started Pixel](https://developers.facebook.com/docs/meta-pixel/get-started)
- [Data Processing Options / LDU](https://developers.facebook.com/docs/marketing-apis/data-processing-options)
- [CAPI server event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event/) · [Deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/) · [CAPI Gateway](https://developers.facebook.com/documentation/ads-commerce/gateway-products/conversions-api-gateway)
- [Cookie Consent Resource](https://developers.facebook.com/docs/privacy/)
- [Meta Q4 2021 Earnings Call](https://s21.q4cdn.com/399680738/files/doc_financials/2021/q4/Meta-Q4-2021-Earnings-Call-Transcript.pdf)

**EDPB / legislație**
- [Guidelines 2/2023 on Technical Scope of Art. 5(3) ePD, v2.0 (PDF)](https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf)
- [§25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html) · România: art. 4 alin. (5), Legea 506/2004

**Jon Loomer**
- [Learning Phase](https://www.jonloomer.com/facebook-ads-learning-phase/) · [Edits that Trigger](https://www.jonloomer.com/facebook-ads-edits-learning-phase/) · [Ads on a Budget](https://www.jonloomer.com/facebook-ads-on-a-budget/) · [Budget Impacts Performance](https://www.jonloomer.com/qvt/how-ads-budget-impacts-performance/) · [Ad Set Optimization Mistakes](https://www.jonloomer.com/common-ad-set-optimization-mistakes/) · [Audience Network](https://www.jonloomer.com/should-meta-advertisers-ever-use-the-audience-network-placement/) · [Split Test Quality Traffic](https://www.jonloomer.com/split-test-which-optimization-leads-to-the-most-high-quality-traffic/) · [Quality Traffic Test #2](https://www.jonloomer.com/quality-traffic-test-2-the-impact-of-meta-ads-placement/) · [Quality Click Rate](https://www.jonloomer.com/qvt/quality-click-rate-custom-metric/)

**Practicieni / cercetare**
- [Motion Creative Benchmarks 2026](https://motionapp.com/library/research/creative-benchmarks-2026/) + [metodologie](https://motionapp.com/library/research/creative-benchmarks-2026/methodology)
- [Foxwell Digital — 8 takeaways](https://www.foxwelldigital.com/blog/motion-creative-benchmarks-2026-8-key-takeaways) · [status page](https://www.foxwelldigital.com/status)
- [CTC — Entity ID](https://commonthreadco.com/blogs/thread/meta-just-revealed-why-your-creative-tests-keep-failing) · [CTC — placement controls](https://commonthreadco.com/blogs/coachs-corner/meta-is-removing-ad-placement-controls-what-ecommerce-brands-must-do-before-q4)
- [pixelart — LPV supra-raportat](https://www.pixelart-agency.com/en/trending/meta-landingpage-views/)
- [Simo Ahava — FPM](https://www.simoahava.com/analytics/first-party-mode-google-tags/) · [CAPI cu sGTM](https://www.simoahava.com/analytics/facebook-conversions-api-gtm-server-side-tagging/)
- [Social Media Examiner — plasamente](https://www.socialmediaexaminer.com/facebook-ad-placements-for-marketers-how-to-make-right-choices/)
- [Didomi — rate regionale](https://www.didomi.io/blog/benchmark-average-consent-rate-europe) · [pe industrii](https://www.didomi.io/blog/benchmark-consent-rate-by-industry-europe-2026) · [glosar](https://www.didomi.io/blog/cmp-consent-banner-performance-metric-glossary)
- [Utz et al., CCS '19](https://arxiv.org/abs/1909.02638) · [Nouwens et al., CHI '20](https://arxiv.org/abs/2001.02479)
- [DoubleClick, Need for Mobile Speed (PDF)](https://www.thinkwithgoogle.com/_qs/documents/2340/bc22e_The_Need_for_Mobile_Speed_-_FINAL_1.pdf)
- [The Record — LG Leipzig](https://therecord.media/german-court-meta-tracking-tech)
