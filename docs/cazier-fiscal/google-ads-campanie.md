# Google Ads: prima campanie pentru cazierfiscal.com (16.11.2026)

## Decizia

Pe 16.11.2026 Raul a hotărât să încercăm o campanie pe cazier fiscal fără să mai așteptăm răspunsul la cererea „în afara politicii” trimisă pe 12.11 (termen ~26.11). Regula din jurnal spunea „nicio campanie până vine răspunsul”; decizia de azi o înlocuiește.

De ce e un test rezonabil: cazierul fiscal nu apare în lista politicii Google „Documente guvernamentale și servicii oficiale”, iar contul 933-520-0143 rulează doar acest serviciu. Formularul trimis pe 12.11 cere chiar domeniul anunțurilor respinse, deci un anunț respins nu strică cererea.

Campania e **publicată și pusă pe pauză**. Anunțul intră la examinare și așa, deci aflăm verdictul de politică fără să cheltuim. O pornește Raul.

Regula testului rămâne cea de la constatator: dacă anunțul e respins pe politică, nu rescriem textul ca să ascundem documentul și nu facem alt cont.

## Ce s-a făcut în cont (933-520-0143, login `r.lutas@yahoo.com`)

| Element | Valoare |
|---|---|
| Campanie | `Search-CazierFiscal-2026-11`, ID 24464724474 |
| Stare | Întreruptă (pusă pe pauză imediat după publicare) |
| Tip | Căutare; fără parteneri de căutare, fără Display |
| Licitare | Clicuri, CPC maxim 5 lei |
| Buget | 30 lei/zi |
| Locație | România, „Prezență” |
| AI Max, personalizarea textului, extinderea URL, potrivire amplă, elemente create automat | oprite (verificat în Setări după publicare) |
| Conversie | „Purchase”, categoria Achiziție, principală, valoare din tag, „Fiecare”, 90 de zile |
| Tag | `AW-18570965428`, eticheta de conversie `AW-18570965428/IxmXCOe8tLkdELTjqZdF` |

Rezumatul din asistentul de creare arăta „Toate țările și teritoriile” și „personalizarea textului activată”, deși setările erau puse corect. După publicare, pagina de Setări arată România și tot ce e automat oprit.

## Cuvinte cheie (un grup)

Potrivire expresie: „cazier fiscal online”, „certificat cazier fiscal”, „eliberare cazier fiscal”, „obtinere cazier fiscal”, „cazier fiscal persoana fizica”, „comanda cazier fiscal”, „cazier fiscal prin avocat”.

Potrivire exactă: [cazier fiscal], [cazier fiscal anaf], [certificat de cazier fiscal].

## Anunț RSA

URL final: `https://cazierfiscal.com/`.

Titluri: Certificat de cazier fiscal · Cazier fiscal online · Fără cont SPV, fără ghișeu · 198 lei, onorariu inclus · În 1–3 zile lucrătoare · Depunere prin avocat · Certificatul pe email · Serviciu privat, nu ANAF · Formular de pe telefon · Comandă cazierul fiscal.

Descrieri:
1. Completezi formularul pe telefon, avocatul depune cererea la ANAF, primești pe email.
2. 198 lei cu onorariul avocatului și TVA incluse. Vezi totalul înainte de plată.
3. Serviciu privat, nu suntem ANAF. Ne ocupăm de cerere și de ridicarea certificatului.
4. Fără cont SPV și fără drum la ghișeu. Termen: 1–3 zile lucrătoare.

Cuvinte ocolite, ca la constatator: „oficial”, „emis”, „portal”, „gratuit”, „urgent”.

## Pe site

`NEXT_PUBLIC_GOOGLE_ADS_ID_CAZIERFISCAL` și `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL_CAZIERFISCAL` sunt setate în Vercel (production) din 16.11. Intră în site la primul build cu modificare de cod.

## Ce a rămas de făcut

| Cine | Ce |
|---|---|
| Raul | verifică metoda de plată în cont (sold 0, nicio plată până acum) |
| Raul | acceptă „Condiții privind datele despre clienți” și pornește conversiile îmbunătățite (Obiective → Conversii → Setări) |
| Raul | pornește campania când e gata |
| Claude | cuvinte cheie negative la nivel de campanie: gratis, gratuit, model, formular, pdf, spv, cerere, ce este, ce inseamna, valabilitate, judiciar, auto, datorii, atestare |
| Claude | limba campaniei (română), dacă nu e deja setată |
| Claude | după build: verifică în browser că `AW-18570965428` se încarcă pe cazierfiscal.com după acordul de cookie-uri |
| Raul | o comandă de test plătită, ca la constatator, apoi rambursare |

## Jurnal

| Data | Ce s-a întâmplat |
|---|---|
| 16.11.2026 | Conversia „Purchase” creată; variabilele puse în Vercel; campania publicată și pusă pe pauză. Anunțul: „În examinare”. În cont, la Politică → Istoric: „No application history”; răspunsul la cererea din 12.11 vine pe email și nu a fost verificat. |
