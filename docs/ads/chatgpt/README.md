# ChatGPT Ads (OpenAI) — index

Canal nou din **24.08.2026** (31 țări EU/EEA), self-serve în România din **31.08**. Deschis ca alternativă la
Google Ads (blocat pe politica documentelor guvernamentale, vezi `../README.md`) și la organicul căzut.

| Doc | Ce conține |
|---|---|
| [01-politica-openai.md](01-politica-openai.md) | politica de conținut v1.5 citată exact (legal services interzis în afara US, categoriile permise), disponibilitatea pe țări, specificațiile anunțului, cum funcționează targetarea (context hints), surse |
| [02-evaluare-si-plan.md](02-evaluare-si-plan.md) | de ce politica OpenAI e inversul Google, ce servicii sunt eligibile, aritmetica CPC vs marjă, planul de test |
| [03-audit-landing-constatator.md](03-audit-landing-constatator.md) | auditul paginii de constatator pe politica OpenAI, ce s-a schimbat (fișier + text), checklist reutilizabil pentru orice landing |
| [04-campanie-constatator.md](04-campanie-constatator.md) | **campania gata de introdus**: pașii de cont (Raul), structura, context hints, titluri/descrieri cu număr de caractere, UTM, imagini, licitare, măsurare, criteriile de decizie |
| [05-roadmap-servicii.md](05-roadmap-servicii.md) | ordinea serviciilor și ce le blochează (avocatul în flux = legal services) |
| [06-conversii-pixel-capi.md](06-conversii-pixel-capi.md) | **conversii**: pixel (data source) + eveniment `order_created` în Ads Manager, implementarea pe site (pixel consent-gated, pagina de succes, Conversions API din webhook-ul Stripe, `oppref` în atribuire), env-uri, verificare |
| `assets/` | logo 512×512 + favicon 128×128 pentru Ads Manager |

## Reguli fixe pe canalul ăsta

1. **Zero „avocat / juridic / consultanță / asistență juridică / Barou"** în anunț și pe landing. Pe OpenAI
   asta = *legal services*, interzis în afara US. (La Google e exact invers — nu amesteca cele două playbook-uri.)
2. Rămân regulile Google care sunt de bun-simț oriunde: **fără „oficial" lângă „document/certificat/act"**,
   preț final afișat cu taxa inclusă, disclaimer „serviciu privat, nu instituție" vizibil, nu promitem ce nu livrăm.
3. Verbele: „primești / depunem cererea / îl obținem pentru tine". NU „eliberăm / emitem" (emite instituția).
4. Categoria contului: servicii digitale/online. NU „legal", NU „government".
5. Un singur cont, pe **EDIGITALIZARE SRL**; un ban aici e pe firmă, deci NU trimitem trafic spre pagini cu avocat.
6. Orice campanie pornește cu UTM `utm_source=chatgpt` și se judecă pe `orders.attribution`, nu pe ce zice platforma.

## Stare

| Data | Ce |
|---|---|
| 02.09 | Politica verificată direct pe openai.com; România „Available" pe help.openai.com; landing constatator curățat (de comis + push); campania scrisă în 04. Contul exista deja; campania introdusă în Ads Manager (jurnal în 04), billing făcut de Raul. Anunț „Not serving" cu 4 motive: brand review în curs, cont în pregătire, **„Ad cannot serve in targeted countries — policy restrictions"** (⚠️ posibil clasificat într-o categorie permisă doar în US; de reverificat după review), anunț în review. Conversii setate (06): pixel + eveniment în Ads Manager, cod pe site. Conversion key creată + validată, env-urile în Vercel, evenimentul legat de campanie (checklist 1/2/4 ✓; 3 se bifează la primul eveniment real). **Stare: AȘTEPTĂM review-ul OpenAI (1–2 zile lucrătoare). Nimic de făcut până atunci.** Apoi: (1) status anunț — dacă rămâne „cannot serve in targeted countries" → contestație; (2) test UTM/oppref în incognito; (3) primele comenzi cu `utm_source=chatgpt` în DB. Opțional: numele afișat „EDIGITALIZARE SRL" → „eGhișeul.ro" în Settings, dacă nu cere re-verificare. ⚠️ Advertiserul apare ca „EDIGITALIZARE SRL" — de verificat dacă în Business information se poate afișa „eGhișeul.ro". ⚠️ OG-ul site-ului (`public/og/default.png`, tras automat de Ads Manager la primul anunț) zice „Documente oficiale online" — încalcă regula noastră; de refăcut separat. |
| 03.09 15:00 | Reverificat în Ads Manager: motivul de politică **„Ad cannot serve in targeted countries" a DISPĂRUT**. Rămân 2 motive, ambele fără acțiune din partea noastră: „Account brand review in progress" + „Getting your account ready — no further action is expected, 5-7 days". Campania/anunțul „Ad1 T1-D1 pe email" Active, 0 afișări, 0 spend. Conversions: data source `eghiseul.ro web` **Healthy, 2 evenimente** primite din browser (testul din 03.09 dimineața), conversion key `eghiseul-stripe-webhook` există; singurul warning „No recent server-to-server events" (normal — serverul trimite doar la comenzi cu `utm_source=chatgpt`/`oppref`; se stinge la prima comandă reală). DB: 0 comenzi atribuite chatgpt (nimic nu livrează încă); atribuirea în general merge (21/21 comenzi din ultimele 2 zile au `attribution`). **Următoarea verificare: 08–10.09** (5–7 zile) — vezi „Ce urmărim" în `../README.md`. |
