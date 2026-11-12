# Google Ads: cont nou pentru certificat-constatator-express.ro (11.11.2026)

## Decizia

Pe 11.11.2026 Raul a ales un cont Google Ads nou, separat, pentru certificat-constatator-express.ro. Scopul e un test: vedem dacă anunțurile trec de politica Google.

Riscul era cunoscut și a fost acceptat explicit:

- Pe 19.08 Google a respins campaniile de constatator din contul eghiseul, pe politica „Documente guvernamentale și servicii oficiale”.
- Pe 01.09 contul nou 243-638-4990 a primit pe loc „Este obligatoriu un CERTIFICAT”.
- Pe 04.11 regula scrisă era „fără cont nou”, din cauza riscului de „circumventing systems”. Riscul atinge și conturile legate, inclusiv 677-995-5005.

Surse: [`../ads/2026-08-18-campanii-live-status.md`](../ads/2026-08-18-campanii-live-status.md), [`../ads/2026-08-31-cont-nou-lansare.md`](../ads/2026-08-31-cont-nou-lansare.md), [`../ads/2026-11-04-ce-putem-rula-acum.md`](../ads/2026-11-04-ce-putem-rula-acum.md).

Regula testului: dacă anunțul primește „Respins / certificat obligatoriu”, **nu** rescriem textul ca să ascundem documentul. Nu facem nici altă campanie sau alt cont. Ne oprim și decidem.

## 0. Crearea contului (Raul, manual)

1. ads.google.com → „Începeți acum”, cu loginul ales pentru constatator.
2. Treci în **Modul expert** și alege „Creați un cont fără campanie” (link mic, jos).
3. **Monedă RON, fus orar (GMT+02:00) București.** Ambele sunt definitive.
4. Facturarea: firma EDIGITALIZARE SRL și cardul se introduc de către Raul.
5. Verificarea advertiserului, când o cere Google: tot de către Raul.

## 1. Setări campanie

| Setare | Valoare |
|---|---|
| Tip | Search, fără Display Network, fără parteneri de căutare |
| Obiectiv | Vânzări, conversia „Purchase” (creată la pasul 4) |
| Licitare | Clicuri, CPC max **6 lei**; după ≥15 conversii, tCPA 30 lei |
| Buget | 50 lei/zi, test de 14 zile |
| Locații | România, „Prezență: persoane din locații” |
| Limbă | română |
| AI Max / extindere URL final | oprite |
| Recomandări automate | oprite |
| Elemente (sitelinkuri, explicații) | doar la nivel de **campanie**, niciodată de cont |

## 2. Cuvinte cheie (un grup, „Constatator firmă”)

Potrivire expresie:

- „certificat constatator online”
- „certificat constatator firma”
- „eliberare certificat constatator”
- „obtinere certificat constatator”
- „certificat constatator pfa”
- „certificat constatator urgent”
- „certificat constatator rapid”
- „comanda certificat constatator”

Potrivire exactă:

- [certificat constatator]
- [certificat constatator onrc]

Negative (nivel de campanie): gratis, gratuit, model, formular, pdf, exemplu, ce este, ce inseamna, cat este valabil, agent, daune, proces verbal, nastere, deces, myportal, portal, recom, termene, listafirme, anaf, cazier.

## 3. Anunț RSA (lungimile verificate: titluri ≤30, descrieri ≤90)

URL final: `https://certificat-constatator-express.ro/`. Cale afișată: `/certificat/constatator`.

Titluri:
1. Certificat constatator online
2. Certificat constatator firmă
3. Pe email, de obicei în minute
4. Preț final 89 lei
5. Taxa ONRC inclusă în preț
6. Doar CUI-ul firmei
7. Fără cont, fără drum la ghișeu
8. Factură pe firmă
9. Pentru PFA, II și SRL
10. Pentru bancă sau licitație
11. Serviciu privat, nu ONRC
12. Plată cu cardul, 2 minute
13. Comandă certificatul acum

Descrieri:
1. Completezi CUI-ul, plătești cu cardul și primești certificatul pe email, ca PDF.
2. Preț final 89 lei, cu taxa ONRC și TVA incluse. Factură pe firma ta.
3. Serviciu privat: depunem cererea la ONRC în locul tău. Nu suntem ONRC.
4. Certificatul de bază pentru firmă vine de obicei în câteva minute de la plată.

Cuvinte care **nu** apar, pentru că au omorât anunțuri pe 19.08: „oficial”, „emis”, „portal”, „ghișeul statului”, „gratuit”, „24/7”.

## 4. Conversia

1. Obiective → Conversii → Nouă → Site web → manual, cu cod: „Purchase”, categoria Achiziție, valoare din tag (rezervă 89 RON), numărare „Una”, fereastra de 30 de zile. Enhanced conversions sunt pornite, prin Google tag.
2. Din fragmentul de eveniment notezi `AW-…` și eticheta. Le pui în Vercel (production): `NEXT_PUBLIC_GOOGLE_ADS_ID_CONSTATATOR` și `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL_CONSTATATOR`. Apoi un build nou.
3. Leagă GA4 563726213 de cont. „purchase” din GA4 rămâne conversie **secundară**.
4. Test: o comandă reală cu acord la cookie-uri, verificată în Tag Assistant, apoi rambursată.

## 5. Ce urmărim

- Primele 72 de ore: starea de politică a anunțului (Eligibil, Limitat sau Respins) și textul exact al motivului. Se trece în tabelul de mai jos.
- După 7 zile: CPC real, CTR, conversii, CPA. Pragul de rentabilitate e CPA ≈ 41 lei (marja de pe comanda de bază).

| Data | Ce s-a întâmplat |
|---|---|
| 11.11.2026 | Decizie cont nou; pachetul de campanie pregătit. |
| 11.11.2026 | Cont creat: **881-388-1795** (RON, București, facturare de Raul, oferta de 1.500 RON credit la 1.500 RON cheltuiți până pe 10.01.2027). Conversia „Purchase” (Achiziție, principală, valoare din tag, rezervă 89 RON, „Fiecare”, 90 de zile). `NEXT_PUBLIC_GOOGLE_ADS_ID_CONSTATATOR = AW-18568994286` și `..._PURCHASE_LABEL_CONSTATATOR = AW-18568994286/4JMLCJCZorYdEO67sZZF` setate în Vercel. Conversiile optimizate cer acceptarea condițiilor de prelucrare a datelor: o face Raul. |
| 11.11.2026 | La cuvinte cheie, editorul campaniei a marcat **doar** „certificat constatator urgent”, pe politica „Government Documents and Official Services”. Celelalte 9 cuvinte au trecut. Am scos „urgent” și nu am cerut excepție. |
| 11.11.2026 | Campania **Search-Constatator-Firma-2026-11** (ID 24460904128) e publicată: Activată, „Eligibilă (învăță)”, 50 lei/zi, CPC max 6 lei, România, doar Căutare, AI Max / personalizarea textului / extinderea URL oprite. Are 9 cuvinte cheie, 21 de negative la nivel de campanie și un RSA cu 13 titluri și 4 descrieri. Anunțul e „În examinare”. |
| 11.11.2026 | ⚠️ Pe site lipsește încă eticheta Ads: în bundle-ul live apare `G-X5Q7NDPHPL`, dar nu `AW-18568994286`. Variabilele au fost puse după ultimul build, iar push-urile cu doar documentație nu pornesc build (`ignoreCommand` din `vercel.json` ignoră `docs/` și `*.md`). Trebuie un redeploy de producție. Până atunci conversiile din reclame nu se înregistrează. |
| 11.11.2026 | Eticheta Ads e live. Redeploy-ul a fost anulat de `ignoreCommand` (același commit), așa că Raul a făcut deploy direct din worktree (`vercel deploy --prod`, fără `.git`). Verificat în bundle: `AW-18568994286` se încarcă pe site, iar `AW-18568994286/4JMLCJCZorYdEO67sZZF` e în chunk-ul paginii de succes. De aici, conversiile se măsoară după acordul pentru cookie-uri de marketing. |
| 12.11.2026 | **Rezultatul testului:** contul 881-388-1795 e activ, **nu suspendat**. Singurul anunț e „Respins — Neeligibil: Documente guvernamentale și servicii oficiale”. Cuvintele cheie sunt eligibile, cardul e acceptat, cost 0. Cauza e politica pe conținut, nu facturarea, firma sau vechimea contului. |
| 12.11.2026 | **Politica, citită din sursă** (support.google.com/adspolicy/answer/13156083 și 17260489, în vigoare din 05.10.2026): constatatorul intră la „Business identifiers” („obtaining proof of government-certified business identification”). Regiuni exceptate la această categorie: Columbia, Franța, India, Peru; România nu. „Authorized provider” = domeniu **legat de pe un site guvernamental public și numit explicit ca autorizat**; licențele, contractele comerciale și înscrierile în registre nu sunt acceptate. Încălcările repetate duc la suspendare, cu avertisment de minimum 7 zile. **Rovinieta e în afara politicii**: „except vignettes/e-vignettes, used across Europe”. |
| 12.11.2026 | **Concurența rulează azi** pe „certificat constatator online” (verificat cu `pws=0`): certificatconstatator.ro, constatator-online.ro, constatatoronline.com, onrc.info.ro. În Centrul de transparență, constatator-online.ro apare pe OPENCODE SRL, advertiser „Confirmat”, cu „mai multe conturi de advertiser” pe același domeniu. Nu știm pe ce bază trec (certificare, excepție sau neaplicare). |
| 12.11.2026 | **Decizie de luat de Raul.** Regula testului se aplică: nu rescriem anunțul, nu facem alt cont, nu folosim contul altei firme (erovinieta / Nethut Digital) și nici cont pe persoană fizică. Ar fi „circumventing systems” și ar pune în pericol toate conturile legate, inclusiv 677-995-5005 și contul de rovinietă, care azi e în afara politicii. |
| 12.11.2026 | **Ipoteza „EDIGITALIZARE SRL e blocată ca firmă”, verificată.** Contra: (1) în 677-995-5005, pe EDIGITALIZARE, perioada 13.09–12.10 are 202 clicuri și 266 lei (campaniile imobiliare), iar acum bannerul spune „campaniile sunt întrerupte sau eliminate”, adică oprite de noi, nu de Google; (2) ecazier a fost blocat în august cu advertiser verificat „Cabinet de Avocat Țarța”, înainte de orice schimbare de plătitor; (3) motivul respingerii numește politica, nu contul sau plata. Ce e totuși la nivel de cont: **certificatul Google** pentru această politică se aplică pe cont + domeniu. Formularul oficial (`support.google.com/adspolicy/contact/godos_certification`) are patru opțiuni: guvern, furnizor autorizat, excepție regională/de business, „în afara politicii”. Pentru constatator nu am depus niciodată formularul. |
| 12.11.2026 | **Formularul de certificare, citit câmp cu câmp; nu am depus nimic.** Pentru constatator nicio opțiune nu se poate completa cu adevărul: „furnizor autorizat” cere adresa unui site guvernamental care leagă și numește domeniul nostru (nu există); „excepție regională” nu include România la „Business identifiers”; „în afara politicii” cere o **garanție** că niciun anunț nu promovează documente guvernamentale „as outlined in the policy”, iar constatatorul e exact „proof of government-certified business identification”. Formularul avertizează că o declarație falsă poate duce la descalificarea de la publicitate. Opțiunea „în afara politicii” rămâne posibilă, cinstit, doar pentru serviciile care nu apar în listă (cazier fiscal, celibat, căsătorie), pe eghiseul.ro / documentero.ro; ciorna din 04.11 e în `docs/ads/2026-11-04-ce-putem-rula-acum.md`. |
| 12.11.2026 | **Detaliul respingerii, citit din cont:** „Documente guvernamentale și servicii oficiale — Este obligatoriu un certificat”. **Contestația din cont** (Anunțuri → stare → „Contestați”) are două motive: „Am făcut modificări pentru a respecta politica” și „Contestarea deciziei”, plus o bifă: „confirm că am citit și am înțeles politica și consider cu bună credință că informațiile sunt corecte și justificabile”. Fără câmp de text. Google avertizează că prea multe contestații pe anunțuri neremediate limitează dreptul de a contesta. Bifa e o declarație a firmei, deci contestația o trimite Raul, o singură dată, cu „Contestarea deciziei”. Rezultatul se trece aici. |
