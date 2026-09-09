# Politicile de spam Google — checklist operațional pentru eghiseul.ro

> Sursă primară: [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies) (developers.google.com). Toate citatele din acest document sunt preluate verbatim din paginile oficiale Google listate în secțiunea Surse. Data extragerii: **2026-09-09**.
>
> Context: acest document e partea 02 din cercetarea pentru `docs/seo/2026-09-recuperare-spam-update/` — folosit ca referință *canonică* pentru orice audit ulterior al site-ului (nu conține el însuși un audit al site-ului; unde nu putem determina aplicabilitatea doar din text, coloana e marcată **DE VERIFICAT**).
>
> Convenție: termenii tehnici rămân în engleză (așa cum apar în documentația Google); glosele sunt în română. Unde Google nu spune ceva explicit, scriem clar **„nu e în documentație"** — nu speculăm.

---

## 0. Ce sunt Search Essentials (cadrul general)

De pe [Search Essentials](https://developers.google.com/search/docs/essentials):

> "The Google Search Essentials make up the core parts of what makes your web-based content [...] eligible to appear and perform well on Google Search: **Technical requirements** [...] **Spam policies** [...] **Key best practices**"

Cele trei piese:
1. **Technical requirements** — minimul tehnic ca Google să poată arăta o pagină (crawl/index) — „most sites pass [...] without even realizing it".
2. **Spam policies** — comportamentele care duc la ranking mai slab sau eliminare completă din rezultate — obiectul acestui document.
3. **Key best practices** — ce ajută efectiv ranking-ul:
   - „Create helpful, reliable, people-first content."
   - Cuvintele cu care oamenii caută, plasate în locuri proeminente (title, heading, alt text, link text).
   - Linkuri crawlable ca Google să găsească restul site-ului.
   - Promovare activă în comunități relevante.
   - Best practices pentru imagini, video, structured data, JavaScript.
   - Activarea search feature-urilor relevante + control asupra a ce apare în rezultate.

Notă importantă, citată verbatim: **"It doesn't cost any money to appear in Google Search results, no matter what anyone tries to tell you."**

---

## 1. Tabel — toate politicile de spam

Sursă: pagina [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies), secțiune cu secțiune, ordinea din pagina originală.

Introducerea paginii, verbatim: *"In the context of Google Search, spam refers to techniques used to deceive users or manipulate our Search systems into featuring content prominently [...] Our spam policies help protect users and improve the quality of Search results."* Detectarea se face *"both through automated systems and, as needed, human review that can result in a manual action."* Consecința: *"Sites that violate our policies may rank lower in results or not appear in results at all."*

| Politică (EN) | Politică (RO) | Ce spune Google (citat scurt) | Cum arată în practică | Ne aplică? |
|---|---|---|---|---|
| **Cloaking** | Cloaking / mascare de conținut | "Presenting different content to users and search engines with the intent to manipulate search rankings and mislead users." | Conținut diferit servit crawler-ului vs. utilizatorului (ex. pagină turism pentru crawler, pagină medicamente pentru user); text/keyword inserate doar când user-agent-ul e un bot. Excepție explicită: paywall/gating NU e cloaking dacă Google vede conținutul complet ca un abonat plătitor. | DE VERIFICAT — nu avem paywall; de verificat orice diferență server-side rendering vs. ce vede Googlebot (SSR/hydration issues nu sunt cloaking intenționat, dar merită verificate tehnic). |
| **Doorway abuse** | Pagini-portal (doorway) | "Sites or pages are created to rank for specific, similar search queries. They lead users to intermediate pages that aren't as useful as the final destination." | Site-uri/pagini multiple aproape identice care doar redirecționează/canalizează spre altă pagină „reală"; domenii multiple pe oraș/regiune care duc utilizatorul spre aceeași pagină finală. | DE VERIFICAT — site-ul are pagini de locație (județ) pentru unele servicii (vezi memoria `location-seo-scope`); trebuie verificat pe fiecare tip dacă pagina de locație are conținut/utilitate proprie sau doar canalizează spre pagina de serviciu fără valoare adăugată. Vezi secțiunea 2. |
| **Expired domain abuse** | Abuz de domeniu expirat | "An expired domain name is purchased and repurposed primarily to manipulate search rankings by hosting content that provides little to no value to users." | Cumperi un domeniu vechi (ex. fost ONG/școală) și pui conținut comercial fără legătură, mizând pe reputația veche a domeniului. | NU — eghiseul.ro nu e domeniu expirat repurpusat; e domeniu propriu, folosit continuu pentru propriul business (migrat din WordPress, nu preluat de la altcineva). |
| **Hacked content** | Conținut din hack | "Any content placed on a site without permission, due to vulnerabilities in a site's security." Include code injection, page injection, content injection, redirects malițioase. | Pagini spam create de un atacator, JS malițios injectat, redirecturi condiționate de referrer/device. | DE VERIFICAT — de rutină, verifică Search Console → Security Issues; nu există semnal cunoscut de hack activ. |
| **Hidden text and link abuse** | Text/linkuri ascunse | "Placing content on a page in a way solely to manipulate search engines and not to be easily viewable by human visitors." | Text alb pe fundal alb, text ascuns în spatele unei imagini, poziționare CSS off-screen, font-size/opacity 0, link ascuns într-un singur caracter. **Excepție explicită**: accordion/tabs, slideshow, tooltip, text doar pentru screen reader NU încalcă politica. | DE VERIFICAT — de verificat pattern-urile de accordion/FAQ din wizard și paginile de serviciu (probabil în regulă, dar merită un pass tehnic ca să confirmi că nu ai text SEO "umplut" ascuns permanent, diferit de accordion legitim). |
| **Keyword stuffing** | Umplere cu cuvinte-cheie | "Filling a web page with keywords or numbers in an attempt to manipulate rankings [...] Often these keywords appear in a list or group, unnaturally, or out of context." | Liste de numere de telefon fără valoare, blocuri de text cu liste de orașe/regiuni, repetare nenaturală a acelorași cuvinte. | DE VERIFICAT — paginile de locație/județ (programmatic SEO) sunt zona de risc clasică pentru acest pattern; verifică dacă textul variază real per județ sau e doar find-and-replace pe nume de oraș. |
| **Link spam** | Link spam | "Creating links to or from a site primarily for the purpose of manipulating search rankings." Include cumpărarea/vânzarea de linkuri, exchange excesiv, linkuri automate, native advertising/advertorial cu anchor text optimizat fără `rel="nofollow"`/`rel="sponsored"`, directoare de calitate slabă, widget-uri cu linkuri ascunse, linkuri în footer/template distribuite pe mai multe site-uri, comentarii de forum cu linkuri optimizate. **Permis explicit**: cumpărarea/vânzarea de linkuri e ok dacă sunt calificate cu `rel="nofollow"` sau `rel="sponsored"`. | DA — memoria `backlinks-pachet-cumparat` documentează un pachet de 6 publicații cumpărat (31.07.2026) pentru backlink-uri. Trebuie verificat explicit dacă linkurile din acele articole sunt calificate `rel="sponsored"`/`nofollow` sau trec ranking credit necalificat — dacă nu sunt calificate, se încadrează literal la exemplul „exchanging money for links, or posts that contain links". |
| **Machine-generated traffic** | Trafic generat automat | "Sending automated queries to Google. This includes scraping results for rank-checking purposes or other types of automated access to Google Search conducted without express permission." | Tool-uri de rank-tracking care fac scraping direct pe Google (nu API oficial), crawling automat neautorizat al SERP-urilor. | DE VERIFICAT — dacă echipa/agențiile SEO folosesc tool-uri de verificare poziții, verifică dacă trec prin API-uri oficiale/parteneri sau fac scraping direct pe google.com. |
| **Malicious practices** | Practici malițioase | "Create a mismatch between user expectations and the actual outcome [...] malware, unwanted software, back button hijacking." | Software care schimbă homepage-ul fără consimțământ, app-uri care scurg date personal, interferență cu butonul back al browserului. | NU — nu există niciun semnal sau motiv să credem că site-ul distribuie malware/unwanted software sau manipulează navigarea browserului. |
| **Misleading functionality** | Funcționalitate înșelătoare | "Intentionally creating sites that trick users into thinking they would be able to access some content or services but in reality can't." | Generator fals de credite, pagini care promit un serviciu (PDF merge, timer) dar duc la reclame înșelătoare. | NU — serviciile de pe eghiseul.ro sunt livrate efectiv (comandă → procesare → livrare document); nu există „funcționalitate falsă" în acest sens. |
| **Scaled content abuse** | Abuz de conținut generat la scară | "Many pages are generated for the primary purpose of manipulating search rankings and not helping users [...] no matter how it's created" (automat, uman, sau mix). | AI/tool-uri generând multe pagini fără valoare, scraping de feed/SERP cu transformări automate (sinonime, traducere, obfuscare), stitching de conținut din mai multe pagini, site-uri multiple care ascund natura scalată, pagini cu conținut fără sens dar cu keyword-uri. | DE VERIFICAT — zona critică pentru eghiseul.ro dat fiind volumul de pagini de locație/servicii/articole produse programatic sau asistat de AI (vezi memoriile despre articole backlink, pagini de locație, cluster content). Vezi analiza detaliată în secțiunea 2. |
| **Scraping** | Scraping / preluare de conținut | "Taking content from other sites, often through automated means, and hosting it with the purpose of manipulating search rankings." | Republicare fără conținut/valoare originală sau fără citarea sursei, copiere cu sinonime, reproducere de feed-uri fără beneficiu unic, compilare de video/imagini fără valoare adăugată substanțială. | NU — conținutul de serviciu (proceduri, prețuri, termene) e scris propriu pentru eghiseul.ro, nu preluat automat de pe alte site-uri. |
| **Site reputation policy** (fostă "site reputation abuse" / parasite SEO) | Politica reputației site-ului | Conținut third-party publicat pe un host site *"mainly because of that host's already-established ranking signals"*, cu scopul ca respectivul conținut *"to rank better than it could otherwise on its own."* | Site educațional care găzduiește recenzii sponsorizate despre credite, distribuite identic pe alte site-uri; site medical cu pagină de cazinouri neintegrată, pusă acolo doar pentru autoritatea domeniului. **NU se aplică**: wire services, presă sindicalizată, forumuri/comentarii user-generated, coloane de opinie, advertorial/native advertising direcționat către cititorii proprii (nu pentru manipulare de ranking), afiliere cu linkuri tratate corespunzător. | NU — eghiseul.ro nu găzduiește conținut third-party al altcuiva pe domeniul propriu pentru a-i „împrumuta" autoritate; e opusul modelului descris (dacă ceva, eghiseul e cel care ar putea apărea ca guest pe alte domenii prin pachetul de backlink-uri — asta ține de Link spam, nu de Site reputation policy). |
| **Sneaky redirects** | Redirecturi înșelătoare | "Sending a visitor to a different URL than the one they initially requested [...] maliciously in order to either show users and search engines different content or show users unexpected content." | Conținut diferit pentru crawler vs. user, redirect diferit desktop vs. mobil către un domeniu spam. **Legitim, explicit**: mutarea site-ului, consolidarea paginilor, redirect la login. | DE VERIFICAT — de audit tehnic (deja există fișier `audit-tehnic-complet.md` / memoria `audit-tehnic-seo-2026-08-07` care menționează lanțuri de redirect 2→1 hop reparate); merită re-verificat că toate redirecturile actuale sunt din categoria „legitimă". |
| **Thin affiliation** | Conținut afiliat subțire (thin affiliate) | "Publishing content with product affiliate links where the product descriptions and reviews are copied directly from the original merchant without any original content or added value." | Site-uri cookie-cutter cu conținut replicat identic pe mai multe domenii/limbi. **Bun**, explicit: informații de preț, recenzii originale, testare riguroasă, comparații de produse. | NU — eghiseul.ro nu e un site de afiliere de produse (nu face redirect către comercianți cu linkuri afiliate); vinde direct servicii de intermediere pentru documente oficiale. |
| **User-generated spam** | Spam generat de utilizatori | "Spammy content added to a site by users through a channel intended for user content." | Conturi spam pe servicii de hosting deschise publicului, postări de forum, comentarii spam pe blog, fișiere spam încărcate. | NU — site-ul nu are forumuri, secțiune de comentarii publice sau upload public de fișiere expus (upload-urile KYC sunt private, per comandă, nu publice/indexabile). |

### Alte practici care duc la demotare/eliminare (nu sunt „politici de spam" per se, dar sunt în aceeași pagină)

| Practică | Ce spune Google | Ne aplică? |
|---|---|---|
| **Legal removals** | Volum semnificativ de cereri valide de eliminare pentru copyright/defăimare/contrafacere/hotărâri judecătorești → demotare a restului conținutului site-ului. CSAM se elimină mereu. | NU — nu există niciun semnal de acest tip. |
| **Personal information removals** | Volum semnificativ de cereri de eliminare a informațiilor personale (practici de eliminare exploatatoare, doxxing, imagini explicite non-consensuale) → demotare. | DE VERIFICAT — site-ul procesează date personale sensibile (CNP, acte de identitate) pentru documente oficiale; relevant mai ales prin prisma GDPR/consimțământ (vezi `docs/technical/specs/cookie-consent.md`), nu neapărat prin cereri de eliminare — de menținut pe radar. |
| **Policy circumvention** | Continuarea încălcărilor prin subdomenii/subdirectoare/site-uri noi → restricționare de features (Top Stories, Discover) + acțiune mai largă. | NU — nu există istoric de acțiune manuală de circumvenit. |
| **Scam and fraud** | Impersonarea unui business oficial, informații false intenționat, atragere pe pretexte false. | NU — memoria `google-ads-smecheria-competitorilor` arată de fapt grijă opusă: disclaimer explicit de neafiliere cu instituțiile statului + prețuri vizibile, exact ca să nu existe percepție de impersonare. |

---

## 2. Zoom pe cele 3 care ne privesc direct

### 2.1 Scaled content abuse

**Definiție verbatim** (spam-policies + blogul din martie 2024):

> "Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings and not helping users. This abusive practice is typically focused on creating large amounts of unoriginal content that provides little to no value to users, no matter how it's created."

> "This new policy builds on our previous spam policy about automatically-generated content, ensuring that we can take action on scaled content abuse as needed, no matter whether content is produced through automation, human efforts, or some combination of human and automated processes."

Punct-cheie din FAQ-ul blogului (martie 2024), citat verbatim: *"Is this a change in how Google views AI content in terms of spam? [...] Our long-standing spam policy has been that use of automation, including generative AI, is spam **if the primary purpose is manipulating ranking** in Search results."* — deci **nu** faptul că e generat cu AI e problema; problema e scopul (manipulare de ranking) și lipsa de valoare, indiferent de metoda de producție (inclusiv 100% uman, dacă e "la scară" și fără valoare).

**Exemple date de Google** (verbatim, listă din pagina de politici):
- "Using generative AI tools or other similar tools to generate many pages without adding value for users"
- "Scraping feeds, search results, or other content to generate many pages (including through automated transformations like synonymizing, translating, or other obfuscation techniques), where little value is provided to users"
- "Stitching or combining content from different web pages without adding value"
- "Creating multiple sites with the intent of hiding the scaled nature of the content"
- "Creating many pages where the content makes little or no sense to a reader but contains search keywords"

**Edge case / cum se distinge de conținut legitim la scară**: Google nu spune nicăieri că volumul mare de pagini e prin el însuși o problemă (companii mari, e-commerce, cataloage au mii de pagini legitime). Testul e "primary purpose... and not helping users" + "little to no value to users" — deci criteriul e *valoarea per pagină pentru cititor*, nu numărul de pagini. Nu există prag numeric în documentație — **nu e în documentație** un „x pagini/zi = spam".

**Relevanță pentru eghiseul.ro**: risc direct pe (a) pagini de locație/județ generate programatic pentru servicii (cazier auto, CF etc. — vezi memoria `location-seo-scope`), (b) articole de blog produse cu asistență AI la volum (vezi `article-migration-architecture`, `seo-page-build-workflow`), (c) clustere de conținut (`seo-cluster` skill, planuri de cluster din `2026-07-14-cluster-construire-cadastru.md`). Testul de auto-verificare: fiecare pagină de locație are conținut specific locului (preț local, termen local, birou/partener local, date reale) sau e template cu doar numele orașului schimbat?

### 2.2 Doorway pages / Doorway abuse

**Definiție verbatim:**

> "Doorway abuse is when sites or pages are created to rank for specific, similar search queries. They lead users to intermediate pages that aren't as useful as the final destination."

**Exemple date de Google (verbatim):**
- "Having multiple websites with slight variations to the URL and home page to maximize their reach for any specific query"
- "Having multiple domain names or pages targeted at specific regions or cities that funnel users to one page"
- "Generating pages to funnel visitors into the actual usable or relevant portion of a site"
- "Creating substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy"

**Edge case — când o pagină de locație e legitimă vs. doorway:** Google nu dă un test explicit „dacă X atunci legitim" pe această pagină anume, dar criteriul reiese din contrastul cu politica de scaled content abuse și cu ghidul de helpful content: o pagină de locație e problematică specific când (1) e „substantially similar" cu alte pagini de locație — adică doar numele orașului diferă — și (2) e „closer to search results than a clearly defined, browseable hierarchy", adică utilizatorul ajunge pe ea din SERP dar nu poate naviga la ea normal din site (nu apare în meniu/breadcrumb), semn că a fost creată *pentru crawler*, nu pentru navigare. O pagină de locație legitimă, prin contrast (inferență din principiile generale de helpful content, nu citat direct): oferă informație specifică locului (termen de procesare local, birou fizic, preț/context regional real), e accesibilă din navigarea normală a site-ului, și ar avea sens să existe chiar dacă Google n-ar exista.

**Nu e în documentație**: un număr minim de cuvinte, un procent de conținut unic necesar, sau o listă albă de „tipuri de pagini de locație acceptate". Google nu dă praguri cuantificabile aici.

**Relevanță pentru eghiseul.ro**: memoria `location-seo-scope` arată că echipa deja face o distincție deliberată — nu toate serviciile primesc pagini de locație (stare civilă, ONRC, fiscal NU primesc; cazier judiciar/auto, CF pe județ DA). Asta e exact alinierea corectă cu politica — dar merită verificat concret, pagină cu pagină, dacă cele existente trec testul „substantially similar" + „browseable hierarchy" de mai sus.

### 2.3 Thin content / low value content

**Atenție la precizie terminologică**: Google **nu are o politică de spam numită literal „thin content"**. Există:
- **„Thin affiliation"** — politică de spam explicită, dar specifică conținutului afiliat cu linkuri de produs copiate de la comerciant (vezi tabelul din secțiunea 1). Nu se aplică unui site care nu face afiliere de produse.
- **Conținut de calitate scăzută / „not helpful"** — nu e tratat ca politică de spam separată, ci ca parte a modului în care **sistemele de ranking** (nu „spam policies" per se) evaluează calitatea, documentat în [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Diferența contează: încălcarea unei spam policy poate duce la manual action; conținutul slab calitativ dar nemanipulativ e pur și simplu retrogradat algoritmic, fără a fi „spam" tehnic.

**Întrebările de auto-evaluare, verbatim, grupate exact cum apar în pagina Google:**

*Content and quality questions:*
- "Does the content provide original information, reporting, research, or analysis?"
- "Does the content provide a substantial, complete, or comprehensive description of the topic?"
- "Does the content provide insightful analysis or interesting information that is beyond the obvious?"
- "If the content draws on other sources, does it avoid simply copying or rewriting those sources, and instead provide substantial additional value and originality?"
- "Does the main heading or page title provide a descriptive, helpful summary of the content?"
- "Does the main heading or page title avoid exaggerating or being shocking in nature?"
- "Is this the sort of page you'd want to bookmark, share with a friend, or recommend?"
- "Would you expect to see this content in or referenced by a printed magazine, encyclopedia, or book?"
- "Does the content provide substantial value when compared to other pages in search results?"
- "Does the content have any spelling or stylistic issues?"
- "Is the content produced well, or does it appear sloppy or hastily produced?"
- "Is the content mass-produced by or outsourced to a large number of creators, or spread across a large network of sites, so that individual pages or sites don't get as much attention or care?"

*Expertise questions:*
- "Does the content present information in a way that makes you want to trust it, such as clear sourcing, evidence of the expertise involved, background about the author or the site that publishes it, such as through links to an author page or a site's About page?"
- "If someone researched the site producing the content, would they come away with an impression that it is well-trusted or widely-recognized as an authority on its topic?"
- "Is this content written or reviewed by an expert or enthusiast who demonstrably knows the topic well?"
- "Does the content have any easily-verified factual errors?"

*People-first content ("da" la astea = pe drumul bun):*
- "Do you have an existing or intended audience for your business or site that would find the content useful if they came directly to you?"
- "Does your content clearly demonstrate first-hand expertise and a depth of knowledge (for example, expertise that comes from having actually used a product or service, or visiting a place)?"
- "Does your site have a primary purpose or focus?"
- "After reading your content, will someone leave feeling they've learned enough about a topic to help achieve their goal?"
- "Will someone reading your content leave feeling like they've had a satisfying experience?"

*Search engine-first content (semnale de alarmă — „da" la astea = probleme):*
- "Is the content primarily made to attract visits from search engines?"
- "Are you producing lots of content on many different topics in hopes that some of it might perform well in search results?"
- "Are you using extensive automation to produce content on many topics?"
- "Are you mainly summarizing what others have to say without adding much value?"
- "Are you writing about things simply because they seem trending and not because you'd write about them otherwise for your existing audience?"
- "Does your content leave readers feeling like they need to search again to get better information from other sources?"
- "Are you writing to a particular word count because you've heard or read that Google has a preferred word count? (No, we don't.)"
- "Did you decide to enter some niche topic area without any real expertise, but instead mainly because you thought you'd get search traffic?"
- "Does your content promise to answer a question that actually has no answer, such as suggesting there's a release date for a product, movie, or TV show when one isn't confirmed?"
- "Are you changing the date of pages to make them seem fresh when the content has not substantially changed?"
- "Are you adding a lot of new content or removing a lot of older content primarily because you believe it will help your search rankings overall by somehow making your site seem 'fresh?' (No, it won't)"

**Framework Who/How/Why (verbatim, cu glosă RO):**

- **Who** ("cine a creat conținutul"): *"Is it self-evident to your visitors who authored your content? Do pages carry a byline, where one might be expected? Do bylines lead to further information about the author or authors involved, giving background about them and the areas they write about?"* → recomandare explicită: *"We strongly encourage adding accurate authorship information, such as bylines to content where readers might expect it."*
- **How** ("cum a fost creat"): pentru automatizare/AI — *"Is the use of automation, including AI-generation, self-evident to visitors through disclosures or in other ways? Are you providing background about how automation or AI-generation was used to create content? Are you explaining why automation or AI was seen as useful to produce content?"*
- **Why** ("de ce a fost creat" — cea mai importantă, spune Google explicit): *"The 'why' should be that you're creating content primarily to help people, content that is useful to visitors if they come to your site directly. [...] If the 'why' is that you're primarily making content to attract search engine visits, that's not aligned with what our systems seek to reward. If you use automation, including AI-generation, to produce content for the primary purpose of manipulating search rankings, that's a violation of our spam policies."*

---

## 3. E-E-A-T și YMYL — relevanță pentru eghiseul.ro

Din [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content):

> "Of these aspects, trust is most important. The others contribute to trust, but content doesn't necessarily have to demonstrate all of them."

> "Our systems give even more weight to content that aligns with strong E-E-A-T for topics that could significantly impact the health, financial stability, or safety of people, or the welfare or well-being of society. We call these 'Your Money or Your Life' topics, or YMYL for short."

**Statut oficial al E-E-A-T**: *"While E-E-A-T itself isn't a specific ranking factor"* — nu e un factor de ranking distinct, ci un concept folosit de search quality raters pentru a evalua dacă algoritmii funcționează bine: *"Search raters have no control over how pages rank. Rater data is not used directly in our ranking algorithms."* Din blogul din decembrie 2022 despre update-ul E-E-A-T: *"these guidelines are what are used by our search raters to help evaluate the performance of our various search ranking systems, and they don't directly influence ranking."*

**Cele 4 componente** (blog decembrie 2022, "E-A-T gets an extra E for Experience"):
- **Experience** (nou adăugat): *"Does content also demonstrate that it was produced with some degree of experience, such as with actual use of a product, having actually visited a place or communicating what a person experienced?"*
- **Expertise, Authoritativeness, Trustworthiness** — conceptele originale E-A-T.

Exemplul dat de Google pentru diferența Experience vs. Expertise e relevant structural pentru eghiseul.ro: *"if you're looking for information on how to correctly fill out your tax returns, that's probably a situation where you want to see content produced by an expert in the field of accounting."* — adică pentru subiecte de tip proceduri oficiale/administrative (exact ce face eghiseul.ro: cazier, CF, stare civilă), Google se așteaptă la **expertiză** demonstrabilă, nu doar experiență anecdotică.

**YMYL — este eghiseul.ro YMYL?** Documentația developer nu definește exhaustiv ce intră la YMYL dincolo de *"topics that could significantly impact the health, financial stability, or safety of people, or the welfare or well-being of society"*. Serviciile eghiseul.ro (obținere cazier judiciar, extrase CF, certificate de stare civilă) sunt tranzacții cu bani reali, în numele clientului, către instituții ale statului, cu potențial impact asupra unor situații legale/oficiale ale oamenilor. **Nu e explicit clasificat de Google ca YMYL în vreo listă publicată** (nu există o listă oficială developer-facing) — **DE VERIFICAT / interpretare rezonabilă, nu certitudine din documentație**: e prudent să tratăm site-ul ca YMYL-adiacent (financiar + posibil impact asupra bunăstării/statutului legal al oamenilor) și să aplicăm standardul „even more weight... E-E-A-T" ca linie de bază.

**„Who is responsible for the content" / pagini About** — singura mențiune explicită găsită în documentația developer (nu în QRG-ul complet, care e un PDF separat de sute de pagini, nefolosit ca sursă aici) e din întrebările de auto-evaluare de mai sus: *"...background about the author or the site that publishes it, such as through links to an author page or a site's About page"*. Nu există alt text developer-facing citabil despre pagini About dincolo de asta — **nu extindem cu conținut din QRG-ul complet, ne limităm la ce confirmă sursele oficiale folosite.**

---

## 4. Checklist operațional

Fiecare item e verificabil direct pe site (DA/NU), nu un principiu vag. Grupare pe 4 zone.

### A. Conținut

1. Fiecare pagină de serviciu conține informație originală (preț, termen, pași) scrisă pentru eghiseul.ro, nu copiată de pe alt site sau de pe instituția oficială? (DA/NU)
2. Există pagini publicate 100% sau majoritar generate de AI fără verificare/editare umană și fără adăugare de valoare unică? (DA/NU — dacă DA, risc scaled content abuse)
3. Articolele de blog citează sursa quando preiau informație de la alt site, în loc să o reformuleze fără atribuire? (DA/NU)
4. Titlurile (`<title>`/H1) descriu corect conținutul, fără exagerare/clickbait? (DA/NU)
5. Există pagini cu text vizibil umplut nenatural cu nume de orașe/cuvinte-cheie repetate ("cazier judiciar Cluj cazier judiciar Cluj-Napoca cazier judiciar acte Cluj...")? (DA/NU — dacă DA, keyword stuffing)
6. Datele de publicare/actualizare ale articolelor sunt schimbate doar când conținutul chiar s-a schimbat substanțial? (DA/NU)
7. Conținutul e scris pentru un public real care ar căuta direct site-ul, nu doar „pentru că e trending"? (DA/NU)

### B. Structură / pagini de locație

8. Fiecare pagină de județ/oraș e accesibilă din navigarea normală a site-ului (meniu, listă de județe, breadcrumb), nu doar din sitemap/link intern ascuns? (DA/NU)
9. Paginile de locație conțin cel puțin un element specific locului real (termen local, birou/partener local, particularitate legală locală), nu doar find-and-replace pe numele orașului? (DA/NU)
10. Nu există domenii/subdomenii multiple aproape identice țintind aceeași interogare cu variații minore de URL? (DA/NU)
11. Serviciile care NU au pagini de locație în strategie (stare civilă, ONRC, fiscal — conform `location-seo-scope`) chiar nu au pagini de locație generate accidental (ex. din sitemap auto sau CMS)? (DA/NU)
12. Nu există pagini „portal" create doar ca să apară în SERP și să redirecționeze imediat spre altă pagină, fără conținut propriu? (DA/NU)

### C. Semnale de încredere (About / contact / autor)

13. Site-ul are o pagină „Despre noi" accesibilă din footer/meniu, cu informații despre companie (CUI, sediu, echipă)? (DA/NU)
14. Articolele de blog au un autor identificat (byline), nu „Echipa eghiseul" generic fără nicio informație suplimentară? (DA/NU)
15. Byline-urile duc la o pagină de autor cu context (cine e, ce experiență are pe subiect)? (DA/NU)
16. Există pagină de contact funcțională, cu date de contact reale verificabile (telefon, email, adresă)? (DA/NU)
17. Unde se folosește automatizare/AI substanțial în producerea conținutului, există vreo formă de disclosure (chiar minimală) — sau cel puțin verificare/editare umană documentată intern? (DA/NU)
18. Paginile de servicii clarifică cine e responsabil legal de conținut/serviciu (firma, nu o entitate anonimă)? (DA/NU)

### D. Tehnic

19. Toate redirecturile din site duc la conținut echivalent/relevant, nu la conținut diferit pentru mobil vs. desktop? (DA/NU)
20. Nu există text ascuns (font-size 0, opacity 0, poziționare off-screen, culoare identică cu fundalul) în afara elementelor UI legitime (accordion, tabs, tooltip, screen-reader-only)? (DA/NU)
21. Google Search Console nu arată "Security Issues" active (hacked content, malware)? (DA/NU)
22. Linkurile din articolele de backlink cumpărate (pachetul din 31.07.2026, vezi `backlinks-pachet-cumparat`) sunt calificate cu `rel="sponsored"` sau `rel="nofollow"` acolo unde plata a fost pentru linkul în sine? (DA/NU)
23. Nu există conținut third-party (advertorial, guest post plătit) găzduit pe eghiseul.ro doar pentru a „împrumuta" autoritatea domeniului, fără integrare editorială reală? (DA/NU)
24. Tool-urile interne/agențiile de rank-tracking nu fac scraping direct al paginilor google.com fără API oficial? (DA/NU)
25. Nu există manual action activă în Search Console (Security & Manual Actions)? (DA/NU)

---

## 5. Ce NU e în politici (mituri)

Lucruri pe care oamenii le cred penalizări, dar Google spune explicit că NU sunt:

| Mit | Ce spune Google, verbatim |
|---|---|
| „Trebuie să plătești ca să apari în Search" | "It doesn't cost any money to appear in Google Search results, no matter what anyone tries to tell you." |
| „Există un număr minim/optim de cuvinte pe care Google îl preferă" | "Are you writing to a particular word count because you've heard or read that Google has a preferred word count? **(No, we don't.)**" |
| „Actualizarea frecventă a datei de publicare ajută rankingul chiar dacă textul nu s-a schimbat" | "Are you adding a lot of new content or removing a lot of older content primarily because you believe it will help your search rankings overall by somehow making your site seem 'fresh?' **(No, it won't)**" |
| „Orice conținut generat cu AI e automat spam" | "Our long-standing spam policy has been that use of automation, including generative AI, is spam **if the primary purpose is manipulating ranking** in Search results." — nu automatizarea în sine, ci scopul manipulativ + lipsa de valoare. |
| „Orice conținut third-party (guest post, advertorial, sindicalizare) găzduit pe site e o încălcare" | Explicit exclus din site reputation policy: "Wire service or press release service sites", "News publications that have syndicated news content", "Sites designed to allow user-generated content", "Columns, opinion pieces, articles, and other work of an editorial nature", advertorial/native advertising direcționat cititorilor proprii. |
| „E-E-A-T e un factor de ranking pe care îl poți «optimiza» direct" | "While E-E-A-T itself isn't a specific ranking factor" — e un concept folosit de raters pentru calibrare, nu un semnal introdus direct în algoritm: "Rater data is not used directly in our ranking algorithms." |
| „O acțiune manuală (site reputation policy) în afara UE îți afectează și rankingul din UE" | FAQ explicit: "No. Manual actions involving the site reputation policy outside the EEA only affect results shown to users outside the EEA, and not those shown to users within the EEA." |
| „Cumpărarea/vânzarea de linkuri e mereu interzisă" | Nu e interzisă per se: "It's not a violation of our policies to have such links as long as they are qualified with a `rel="nofollow"` or `rel="sponsored"` attribute value." Problema e linkul necalificat care trece „ranking credit". |
| „Redirecturile sunt un semnal negativ per se" | Există categorie explicită de redirecturi legitime: mutarea site-ului, consolidarea paginilor, redirect la login. Doar cele "malicious" / cu intenție de a arăta conținut diferit sunt spam. |
| „SEO (optimizarea tehnică pentru motoare) e prin definiție «search engine-first» și deci rău" | "SEO can be a helpful activity when it is applied to people-first content, rather than search engine-first content." |

---

## 6. Surse (Google, oficiale)

Toate accesate/verificate pe **2026-09-09**, prin fetch direct al HTML-ului paginii (nu cache/rezumat terță parte):

1. [Spam policies for Google web search](https://developers.google.com/search/docs/essentials/spam-policies) — developers.google.com — sursa primară, folosită pentru §1, §2.
2. [Google Search Essentials](https://developers.google.com/search/docs/essentials) — developers.google.com — folosită pentru §0.
3. [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) — developers.google.com — folosită pentru §2.3, §3.
4. [What web creators should know about our March 2024 core update and new spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies) — Google Search Central Blog, postat 5 martie 2026 (retroactiv 2024), autor Chris Nelson pe numele echipei Google Search Quality — folosită pentru §2.1, definițiile scaled content abuse / expired domain abuse / site reputation abuse, inclusiv FAQ-ul din pagină (secțiunile despre "coupon area" și despre EEA).
5. [Our latest update to the quality rater guidelines: E-A-T gets an extra E for Experience](https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t) — Google Search Central Blog, 15 decembrie 2022, autor Elizabeth Tucker — folosită pentru §3.

**Surse consultate dar NEfolosite ca citat** (motiv: conțin doar shell de navigare la fetch prin unelte automate, sau redirect către pagină diferită de cea căutată — nu am inclus conținut din ele ca să nu risc citate greșite):
- `support.google.com/webmasters/answer/2721312` (pagina veche „Doorway pages") — redirecționează acum către `developers.google.com/search/docs/advanced/guidelines/scraped-content`, care nu corespunde conținutului căutat; **conținutul curent despre doorway pages e integrat în pagina de Spam Policies (§1, „Doorway abuse")**, nu mai există ca pagină separată.
- Search Quality Rater Guidelines (PDF complet, ~170+ pagini, `guidelines.raterhub.com`) — **nu a fost citit/citat în acest document**. Orice afirmație despre secțiuni specifice ale QRG (About pages, "who is responsible for the content" ca secțiune QRG dedicată) dincolo de ce confirmă sursele 3 și 5 de mai sus **nu e în documentație** în sensul acestui raport — dacă e nevoie de detalii QRG suplimentare, necesită un pass separat de citire a PDF-ului oficial.

---

## 7. Ce rămâne de făcut (nu în scopul acestui document)

Acest document e **checklist-ul de referință**, nu auditul propriu-zis. Pasul următor logic (alt fișier `research/03-...` sau `audit`) e să parcurgă efectiv cele 25 de întrebări din §4 pe site-ul live și să documenteze răspunsurile DA/NU cu dovezi (screenshot, URL, cod sursă), în special pe cele marcate DE VERIFICAT în §1: link spam (backlink pachet), scaled content abuse (pagini de locație + articole AI-asistate), doorway abuse (paginile de județ existente).
