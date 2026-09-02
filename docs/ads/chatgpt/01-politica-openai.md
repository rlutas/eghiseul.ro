# Politica OpenAI Ads — ce contează pentru noi (verificat 02.09.2026)

Sursa: https://openai.com/policies/ad-policies/ — **v1.5, „Updated: 31 August 2026"**. Citit direct în browser
(site-ul dă 403 la fetch automat). Citatele de mai jos sunt exacte.

## 1. Categoriile permise acum

> During the initial test period, ads are primarily limited to consumer verticals such as lifestyle and
> household goods, **local services**, travel and experiences, and **digital products** or education. These
> categories may expand over time. We may approve ads from approved advertisers within the financial
> services, healthcare & medicine, and legal services categories. These categories are being rolled out
> gradually with approvals being reviewed manually on a case-by-case basis.
>
> All other categories are disallowed at launch […]

Noi intrăm doar ca **serviciu digital / local service**: formular online, plată, document pe email.

## 2. Legal services — capcana

> Ads for legal advice, representation, or legal services offered to individuals or businesses are permitted
> in the US only when the advertiser is licensed to practice law in the jurisdiction where the ad is shown.
> This includes services related to immigration, personal injury, legal claims, or **document preparation**.
>
> Ads for general legal education or media may be allowed where no legal services are offered.
>
> **Ads for legal services outside of the US are currently prohibited.**

Consecință: tot ce are **avocat în flux** (contract de asistență juridică, împuternicire avocațială) și îl
spune pe landing = legal services = interzis. Lista serviciilor cu avocat e în
`src/lib/documents/no-lawyer-services.ts` (`LAWYER_SERVICE_SLUGS`): cazier judiciar (toate), cazier auto,
**cazier fiscal**, certificat naștere/căsătorie/celibat, certificat integritate, extrase multilingve.
Certificatul constatator NU e în listă (flux automat prin API ONRC).

## 3. Ce NU există în politică

Nu există nicio categorie „government documents / official services" ca la Google. Singurele lucruri
apropiate:

- **Scams & fraud**: „ads that impersonate individuals, brands, official entities, or trusted services" —
  acoperit de disclaimerul „serviciu privat, nu instituție".
- **Misleading or deceptive ads**: „unfounded claims about capabilities, pricing, outcomes, affiliations" —
  preț final afișat, fără „garantat", fără „oficial".
- **Advertiser identity / Destination integrity**: landingul trebuie să reprezinte corect advertiserul și
  oferta; nu misreprezinta locația/eligibilitatea.
- **Required qualifications**: „Advertisers promoting products or services that require professional
  registrations, licenses […] must maintain those credentials" — pentru constatator nu e cazul.

## 4. Cum se face review-ul

> Advertisers: When advertisers sign up on our ads manager platform, we assess whether they are legitimate
> businesses […] Ad creative and landing pages: When an ad is uploaded, we review the title, copy, media,
> and landing page […] Most reviews are conducted through automated systems with human oversight […]
> We use machine learning systems, including LLMs and classifiers […]

Adică un LLM citește **landingul întreg**. De aceea am scos „avocatul colaborator" din pagina de constatator
(vezi 03) — nu era nici adevărat pentru serviciul ăsta.

## 5. Placement (unde apar reclamele)

Nu apar pe conversații sensibile (sănătate, politică, „sensitive user journeys" etc.). Din v1.1 (aprilie
2026), „legal advice contexts are no longer categorically blocked from ads by default" — deci o conversație
de tip „cum obțin certificat constatator" **poate** primi reclamă.

## 6. Disponibilitate

https://help.openai.com/en/articles/20001245-ads-manager-availability (actualizat 01.09): **Romania — Available**
(self-service). Cont pe https://ads.openai.com. Reclamele se văd doar la utilizatorii **Free și Go**; Plus/Pro/
Business/Enterprise nu văd reclame. În UE **nu există targetare personalizată** — doar contextul conversației +
locație aproximativă (GDPR).

## 7. Formatul anunțului (surse secundare, de confirmat în Ads Manager la primul anunț)

| Element | Limită tehnică | Ce se vede realist |
|---|---|---|
| Nume advertiser | — | „eGhișeul.ro" |
| Logo | 32×32 afișat; încarcă 128×128+ | `assets/eghiseul-favicon-128.png` |
| Titlu | ≤ 50 caractere | trunchiere la ~25–35 → esențialul în primele 24 |
| Descriere | ≤ 100 caractere | trunchiere la ~48 → esențialul în primele 48 |
| Imagine | pătrată, ≥ 256×256 (512 recomandat), PNG/JPG | `assets/eghiseul-logo-512.png` |
| Link | URL cu UTM | pagina de serviciu |

Un singur card „Sponsored" sub răspuns, un anunț per conversație. Fără video/carusel.

## 8. Targetare: context hints

Nu sunt cuvinte cheie licitate. La nivel de ad group scrii în limbaj natural **ce conversații** sunt relevante
(situații, întrebări); sistemul estimează relevanța față de conversația live folosind hints + landing + titlu +
copy. Se pot lipi și liste de cuvinte cheie ca hint. Obiective: **Reach (CPM)** și **Clicks (CPC)**; Conversions
(oCPC) + pixel OAIQ raportate în US, neconfirmate pentru self-serve UE → măsurăm noi.

## 9. Prețuri (surse secundare, US)

CPC recomandat 3–5 $, CPM 25–60 $. Fără buget minim. Unele surse: credit 500 $ la primii 500 $ cheltuiți
(de verificat la înscriere). Licitația e a noastră — putem plafona CPC-ul mult sub „recomandat".

## Surse

- Politica: https://openai.com/policies/ad-policies/
- Disponibilitate: https://help.openai.com/en/articles/20001245-ads-manager-availability
- Anunț EU: https://openai.com/index/chatgpt-ads-expands-across-europe/
- Self-serve EU (31.08): https://digiday.com/media-buying/openais-chatgpt-ads-business-hits-1-billion-run-rate-as-europe-gets-self-serve-access/
- Ghid RO: https://validsoftware.ro/chatgpt-ads-oficial-in-romania-ghid-pentru-firme/
- Context hints: https://hawksem.com/blog/chatgpt-ads-context-hints/ , https://www.adsmurai.com/en/articles/openai-ads-context-hints
- Specs: https://www.chatgptadlibrary.com/chatgpt-ad-specs , https://ioquery.fr/en/chatgpt-ads-chat-card-format
- Costuri: https://topgrowthmarketing.com/how-much-do-chatgpt-ads-cost/
