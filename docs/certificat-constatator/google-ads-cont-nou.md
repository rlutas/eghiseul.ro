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
