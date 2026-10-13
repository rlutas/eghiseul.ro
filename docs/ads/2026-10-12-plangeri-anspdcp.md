# Plângeri la ANSPDCP: cookie-uri fără consimțământ la concurenți (12.10.2026)

## Înainte de orice: site-urile noastre sunt curate

Verificat live pe 12.10.2026, ~12:30, în browser curat: **eghiseul.ro, documentero.ro, cazierjudiciaronline.com, ecazier.ro**: 0 cereri spre trackere și 0 cookie-uri de tracking până la alegere. CJO și ecazier au fost reparate azi (`changelog/2026-10-12-cjo-ecazier-banner-cookie.md`). Abia de acum putem reclama fără să ni se întoarcă plângerea.

## Legea, la zi (verificat 12.10.2026)

- **Legea 506/2004, art. 4 alin. (5):** stocarea de informații sau accesul la informații pe terminalul utilizatorului sunt permise numai dacă (a) utilizatorul și-a dat acordul și (b) a primit înainte informații clare și complete. Fac excepție doar cookie-urile strict necesare.
- **Sancțiunea:** contravenție, art. 13 lit. i) din Legea 506/2004. ANSPDCP amendează constant pe cookie-uri. Exemple publice: 68.500 lei (operatori de telecomunicații), 40.000 lei (Restart Energy, amendă rămasă definitivă la Curtea de Apel Timișoara), 30.000 lei (There's an AI for that, nov. 2025), 5.000 lei (Coral Travel, oct. 2025), 10.000 EUR (site-ul lui Călin Georgescu, iul. 2025).
- **GDPR art. 6 și 7:** acolo unde cookie-urile prelucrează date personale (ID-uri `_ga`, `_gcl_au`, înregistrarea sesiunii), consimțământul trebuie să fie prealabil, liber și dovedibil.
- **Ce se schimbă la nivel UE:** Regulamentul ePrivacy a fost retras pe 11.02.2026. Pachetul „Digital Omnibus” propune mutarea regulii despre cookie-uri (art. 88a GDPR sau o variantă a art. 5(3) ePrivacy), dar nu e adoptat; votul Coreper din 26.06.2026 a fost amânat. **Până la adoptare se aplică regulile de azi.** Nicio variantă discutată nu permite analiză și reclame fără acord.
- **Cine depune:** plângerea la ANSPDCP o face **persoana vizată**, adică o persoană fizică al cărei browser a primit cookie-urile, nu firma. Raul (sau un alt om din echipă) depune în nume propriu, ca vizitator al site-ului.
- **Cum se depune:** formularul electronic de pe dataprotection.ro, prin poștă sau la registratura ANSPDCP (B-dul G-ral Gheorghe Magheru nr. 28-30, sector 1, București). Ghidul ANSPDCP recomandă contactarea operatorului cu cel puțin 15 zile înainte (vezi mai jos).

Surse: [StartupCafe, Coral Travel](https://startupcafe.ro/agentie-online-de-turism-amendata-pentru-cookie-urile-de-pe-site-ce-lege-a-incalcat-88031) · [ANSPDCP, comunicat 16.07.2025](https://www.dataprotection.ro/?page=Comunicat_Presa_16.07.2025) · [ANSPDCP, comunicat cookies](https://www.dataprotection.ro/?page=Comunicat_Presa_cookies&lang=ro) · [ziare.com](https://ziare.com/tehnologie/amenda-platforma-date-personale-romania-1975115) · [JURIDICE.ro](https://www.juridice.ro/803202/operator-de-turism-sanctionat-de-anspdcp-din-cauza-modulelor-cookies.html) · [procedura de plângeri ANSPDCP](https://dataprotection.ro/servlet/ViewDocument?id=1491) · [Praxikon, Digital Omnibus](https://www.praxikon.com/en/avg/digital-omnibus) · [Osborne Clarke, Digital Omnibus](https://www.osborneclarke.com/insights/digital-omnibus-reshapes-eu-cookie-rules-leaves-banner-fatigue-largely-intact)

## Operatorii și dovezile (12.10.2026, 12:19 ora României)

Dovezile, pentru fiecare site: captură de ecran + JSON cu fiecare cerere și fiecare cookie, cu ora exactă, în `dovezi-cookie-2026-10-12/`. Le refaci în ziua depunerii cu:
`node scripts/cookie-evidence.mjs docs/ads/dovezi-cookie-AAAA-LL-ZZ https://caziere.ro/ https://roghiseul.ro/ https://obtinecazier.ro/ https://eliberarecazier.ro/`

| # | Site | Operator (ANAF) | Ce pornește fără acord | Forța cazului |
|---|---|---|---|---|
| 1 | caziere.ro | SERVICII COMPLETE ONLINE S.R.L., CUI 45406271, J22/4426/2021, Iași, Bd. Socola nr. 3, bl. D2, sc. A, et. 4, ap. 20 | Google Ads (AW-840657989), GA4 (G-2PGH8RBNKV), Microsoft Clarity; cookie-uri `_ga`, `_ga_2PGH8RBNKV`, `_gcl_au` (valabile 3–13 luni). Au banner Cookiebot, dar tagurile pornesc înainte de alegere. În plus, primul ecran al bannerului are doar „Allow all”, fără refuz, și e în engleză (dark pattern, EDPB 03/2022) | **puternic** |
| 2 | obtinecazier.ro | FLOWDOCS S.R.L., CUI 55458545, J2026050722000, com. Mălini, sat Poiana Mărului, str. Principală nr. 289, jud. Suceava | Google Ads (AW-17507123346) + **Inspectlet (înregistrarea sesiunii)**; cookie-uri `_gcl_au` și `__insp_*` (12 luni) | **puternic** (înregistrarea sesiunii e intruzivă) |
| 3 | eliberarecazier.ro | USETECH S.R.L., CUI RO47838209, J2023001846235, Voluntari, str. Vasile Alecsandri nr. 38, jud. Ilfov | GTM (GTM-56HVRR9S), Google Ads, Microsoft Clarity; cookie `_gcl_au` | puternic |
| 4 | roghiseul.ro | CENTRUL DE SOLUȚII ADMINISTRATIVE S.R.L., CUI 54898734, J2026038721005, Satu Mare, str. Ady Endre nr. 14A | Google Ads (AW-11550071415); cookie `_gcl_au`; **niciun banner de cookie** pe prima pagină | puternic |
| — | infocazier.ro | GROSU ALEXANDRU – CABINET DE AVOCAT, CIF 23224686, Iași | Google cu Consent Mode refuzat (G100, fără cookie-uri Google), dar Microsoft Clarity pornește | slab; **nu depunem** (cabinet de avocat; caz minor) |
| — | cfunciara.ro, constatator-online.ro | — | conforme | — |

## Pasul 1 (recomandat de ANSPDCP): emailul către operator

Trimis de persoana care depune, de pe emailul personal, către adresa de contact sau DPO de pe site. După 15 zile fără reparație, se depune plângerea. Dacă repară, terenul e egal oricum.

> Subiect: Cookie-uri plasate fără consimțământ pe [site]
>
> Bună ziua,
>
> Pe data de [data], la vizitarea site-ului [site], browserul meu a primit cookie-uri de analiză și publicitate ([lista]) și au fost trimise date către [Google Ads / Google Analytics / Microsoft Clarity / Inspectlet] înainte să îmi exprim vreo opțiune în bannerul de cookie-uri.
>
> Potrivit art. 4 alin. (5) din Legea nr. 506/2004, aceste cookie-uri pot fi plasate numai după acordul meu prealabil. Vă rog să încetați această practică și să ștergeți datele colectate astfel despre mine. În lipsa unei remedieri în 15 zile, voi sesiza Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal.
>
> Cu stimă,
> [nume, prenume]

## Pasul 2: plângerea la ANSPDCP (câte una pe operator)

Câmpuri: petent = persoana fizică (nume, prenume, adresă poștală, email); operator = denumire, CUI, sediu, din tabelul de mai sus; domeniu = comunicații electronice / cookie-uri. Text:

> **Obiectul plângerii:** plasarea de cookie-uri de analiză și publicitate și transmiterea de date către terți fără consimțământul meu prealabil, pe site-ul [site], operat de [operator, CUI].
>
> **Situația de fapt.** Pe data de [data], ora [ora], am accesat [site] dintr-un browser fără cookie-uri anterioare. Fără să interacționez în niciun fel cu bannerul de cookie-uri (fără „accept”, „refuz” sau „setări”), site-ul:
> - a încărcat scripturile [Google Ads AW-…, Google Analytics G-…, Microsoft Clarity, Inspectlet] și a trimis cereri către [domeniile din JSON];
> - a stocat în browserul meu cookie-urile [lista, cu durata de viață].
>
> Atașez capturile de ecran, cu bannerul încă neatins, și lista cererilor și a cookie-urilor, cu ora exactă.
>
> [Dacă e cazul: Am solicitat operatorului pe [data] încetarea acestei practici. Nu am primit răspuns / practica a continuat, verificat din nou pe [data].]
>
> **Temei legal.** Art. 4 alin. (5) din Legea nr. 506/2004: stocarea de informații sau accesul la informații pe echipamentul terminal sunt permise numai după acordul prealabil al utilizatorului, informat clar și complet. Cookie-urile de mai sus nu sunt strict necesare pentru serviciul cerut. Art. 6 alin. (1) lit. a) și art. 7 din Regulamentul (UE) 2016/679, pentru prelucrarea identificatorilor online care rezultă din aceste cookie-uri.
>
> **Solicit:** efectuarea unei investigații, constatarea contravenției prevăzute la art. 13 lit. i) din Legea nr. 506/2004, aplicarea sancțiunii corespunzătoare și obligarea operatorului să obțină consimțământul înainte de plasarea acestor cookie-uri.
>
> Anexe: capturi de ecran, fișierul cu cererile și cookie-urile, emailul către operator (dacă există).

## Ce așteptăm realist

- ANSPDCP soluționează în luni; sancțiunile pe cookie-uri sunt de regulă amenzi de 5.000–70.000 lei plus obligația de conformare.
- Concurenții vor pune un banner corect. Efectul asupra vânzărilor noastre e indirect: le scade puțin măsurarea reclamelor (Smart Bidding pe date incomplete). Nu ne repornește reclamele.
- Plângerea e o chestiune separată de dosarul Google Ads și nu o amestecăm în sesizările de concurență.

## Opțional: Google

Advertiserii din UE sunt obligați prin politica Google de consimțământ (EU User Consent Policy) să obțină acordul pentru cookie-urile de reclame. Putem adăuga în tichetul 6-4960000040774 că advertiserii care rulează pe cazier nici nu respectă această politică, cu aceleași dovezi. N-am verificat dacă Google are un formular separat de raportare pentru asta.

## Unde se trimite (verificat 12.10.2026)

**Plângerile la ANSPDCP:** formularul oficial de plângere se completează și se trimite la **plangere@dataprotection.ro**, cu anexele sub 15 MB în total ([formularul ANSPDCP](https://www.dataprotection.ro/servlet/ViewDocument?id=1548)). Adresa generală e anspdcp@dataprotection.ro, iar prin poștă sau la registratură: B-dul G-ral Gheorghe Magheru nr. 28-30, sector 1, București. Câte un email pe firmă, cu anexele ei.

**Emailurile prealabile către firme (opțional, cu 15 zile înainte):**

| Site | Adresa | De unde |
|---|---|---|
| caziere.ro | contact@caziere.ro | antetul site-ului + pagina de contact |
| obtinecazier.ro | contact@obtinecazier.ro | politica de confidențialitate și politica de cookie-uri |
| eliberarecazier.ro | dpo@eliberarecazier.ro (cc asistenta@eliberarecazier.ro) | politica de confidențialitate (DPO-ul lor) |
| roghiseul.ro | roghiseul24@gmail.com | politica de confidențialitate, termeni, contact |
