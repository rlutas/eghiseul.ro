# Reguli de conținut și SEO

Scrise după Google August 2026 Spam Update, care a tăiat 78% din clicuri și 70%
din comenzi. Analiza completă: `docs/seo/2026-09-recuperare-spam-update/`.

## 1. Nicio pagină din șablon fără date proprii

Testul, înainte de a publica o pagină generată dintr-un template (locație,
variantă, tip de document):

> Maschează numele propriu (orașul, județul, tipul de act). Dacă pagina sună la
> fel ca surorile ei, nu se publică.

E test literal, nu metaforă: pe cele 90 de pagini de locație șterse, mascarea
numelor proprii **creștea** similaritatea (0,66 → 0,72). Singurul lucru care le
diferenția era numele locului.

Corolar: nu construi pagini la o granularitate pe care instituția nu o are.
Cazierul se emite la nivel de IPJ **județean** — 48 de pagini de oraș erau, prin
construcție, aceeași pagină.

## 2. Fără loturi

Maximum 1–2 pagini publice noi pe săptămână.

Nu pentru că Google penalizează cadența — nu o penalizează, iar John Mueller a
spus-o explicit (18.03.2024). Ci pentru că 92 de pagini într-o zi (22.06.2026,
40% din site) nu pot fi verificate calitativ de un om, și exact aia s-a văzut.

## 3. Zero date inventate

Nu se pune în pagină și nici în schema:
- rating sau număr de recenzii care nu vin dintr-o sursă reală și curentă;
- `aggregateRating` pe `Product` fără recenzii pentru ACEL produs, vizibile în
  pagină (și nici pe `Organization`, unde e self-serving);
- autori care nu sunt persoane reale, cu pagină proprie („Departamentul Juridic"
  era un nod `Person`);
- `datePublished` sau `dateModified` de umplutură (`2024-01-01` stătea identic pe
  12 articole);
- recenzii cu stampilă de timp care se învechește singură („acum 4 zile").

Sursa unică pentru dovada socială: `SOCIAL_PROOF` din `src/lib/seo/constants.ts`.
Autorul: `SITE_AUTHOR` din `src/lib/seo/author.ts`.

## 4. Sitemap curatoriat, nu generat din rute

Ce e subțire și nu se repară acum iese din sitemap și din index. Un sitemap care
insistă pe URL-uri pe care Google le refuză e semnal contradictoriu.

## 5. Linkurile interne contează cât conținutul

Coeziunea internă slabă a fost a doua cauză a demotării: pagina medie primea 5
linkuri interne, față de 38 pe site-ul soră neafectat.

- o pagină nouă fără linkuri din conținutul existent nu e publicată;
- **un `<select>` cu `router.push()` NU e link.** `ServiceSwitcher` arăta ca o
  legătură între servicii, dar pentru crawler nu exista — de-asta aveau paginile
  cadastrale ≤3 linkuri primite. Folosește `RelatedServicesLinks`;
- când ștergi sau consolidezi o pagină, scoate și linkurile către ea, și
  repointează-le direct pe țintă. Altfel plasa rămâne (cele 40 de pagini pe
  `noindex` aveau în continuare 49 de inlinkuri fiecare).

## 6. Ștergere vs consolidare

- **301 către părintele tematic** oriunde există inlinkuri, backlinkuri sau
  clicuri istorice;
- **410** doar când nu există niciunul dintre ele;
- niciodată ștergere hard pe o pagină cu backlinkuri reale;
- verifică lanțurile înainte: ținta nu are voie să fie ea însăși consolidată.

## 7. Disclosure

Suntem serviciu privat, nu instituție. Pe fiecare pagină publică: neafiliere,
datele firmei, ANPC/SOL. Inclusiv pe ecranele de comandă — footerul NU e în root
layout, deci wizardul, checkout-ul și pagina de succes au nevoie de
`OrderFlowDisclosure`.

Verbul contează: noi **obținem** documente, instituția le **eliberează**.

## 8. Măsurare

- expunerile pe clusterul `/servicii/` sunt primul semn de recuperare, nu
  clicurile;
- SERP-ul real se verifică doar cu `&pws=0`;
- exclude ANCPI din comparațiile pre/post: acolo a dispărut cererea (avaria s-a
  încheiat), nu poziția;
- la crawl-ul Screaming Frog, **bifează Crawl Analysis** — fără el, coloanele de
  near-duplicate și Link Score sunt goale.
