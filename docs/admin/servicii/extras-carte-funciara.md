# Extras de carte funciară și extras de plan cadastral: fișa pentru echipă
<!-- audienta: colaborator -->

Cele două documente ANCPI „instant” ale platformei. Au fost livrate de un
robot până pe 20.08.2026; de atunci le lucrează **Mircea (topograf)** din
portalul lui, iar promisiunea de pe pagină e „de regulă în aceeași zi
lucrătoare, maximum 2 zile lucrătoare”. Fișă scrisă pe 21.09.2026; prețul viu
e în **Setări → Servicii**.

## Ce e și cât costă

| Document | Preț | Taxa ANCPI pe care o plătim | Ce e |
|---|--:|--:|---|
| Extras de carte funciară pentru informare | 89 | 20 / imobil | situația juridică a imobilului: proprietar, suprafață, sarcini (ipoteci, interdicții); PDF semnat electronic de OCPI |
| Imobil în plus în aceeași comandă | +49,99 / imobil | 20 / imobil | fiecare imobil = un extras separat |
| Extras de plan cadastral (pe ortofotoplan) | 89 | 15 | conturul imobilului pe hartă, cu vecinătățile |

Fără urgență, fără opțiuni, fără act de identitate, fără semnătură. Nu e
serviciu cu avocat (doar contract de prestări). Livrare doar pe email.

## Ce completează clientul

1. Contact.
2. **Date imobil**: un singur identificator e de ajuns, pe taburi: **numărul de carte funciară** (implicit), **numărul cadastral** sau **adresa**; plus **județul și localitatea (UAT)** din nomenclatorul ANCPI (nu se poate scrie greșit). Butonul **„Nu știu”** îl trimite la serviciul „Identificare imobil după adresă” (298 lei), cu datele păstrate.
3. Facturare, apoi plata.

Clientul vede în formular și pe pagină starea portalului ANCPI (badge roșu
„indisponibil”, și pe telefon, și la checkout).

## Cum merge acum (din 20.08.2026, manual prin Mircea)

1. Plata intră. **Mircea primește email** cu comanda (Yahoo, prima dată verificați spamul) și o vede în portalul lui.
2. Platforma **generează singură cererea** pentru OCPI (Anexa 6 la extras CF; derivatul Anexei 1.30 la plan cadastral), **o cerere per imobil**, cu numele fișierului în convenția lui (`cf <nr> - <localitate>-<județ>.pdf`). El doar o semnează electronic.
3. Mircea obține extrasul: **direct online** (cont de profesionist) sau **la ghișeu**, caz în care salvează în portal numărul de înregistrare OCPI (căutabil apoi în listă).
4. Apasă **„Încarcă PDF și trimite clientului”**: extrasul pleacă pe email, comanda trece singură pe „Documentul este eliberat” / „Finalizată”, iar **taxa ANCPI se înregistrează singură** ca cost intern (20 lei × imobile, 15 la plan).

Voi nu apăsați nimic pe drumul normal. Vă uitați dacă o comandă stă mai mult
de o zi lucrătoare în „Plătită” pe serviciile astea: înseamnă că Mircea nu a
preluat-o.

## Cum mergea cu robotul (și de ce nu mai merge)

Robotul ANCPI plasa comanda pe ePay ANCPI, plătea din punctele preplătite și
încărca PDF-ul + chitanța în minute; starea lui e în `/admin/ancpi` (aceleași
stări ca la ONRC: În așteptare, Preluat, Comandă plasată + plătită, Așteaptă
documentul, Verificare document, Eliberat, Necesită operator).

Cronologie de știut la telefon:

- **13.07.2026**: atac cibernetic la ANCPI, e-Terra picat; comenzile s-au adunat plătite (87 nelivrate pe 14.08). Clienții au primit email de update pe 22.07. Există pagina `/ancpi-nu-functioneaza/` pentru clienți și formularul „anunță-mă când revine”.
- **19–24.08.2026**: extrasul CF, planul cadastral și identificările au fost alocate lui Mircea, cu cereri generate automat.
- **20.08.2026**: ultimul job reușit al robotului. Pe 17.09 s-a confirmat că **ANCPI a scos din DNS adresele portalului**: robotul n-are unde să se conecteze și nu se repară cu deploy. Pagina de verificare a documentului de la ANCPI nu mai există nici ea.
- **17.09.2026**: pagina și formularul spun termenul real (aceeași zi, maximum 2 zile lucrătoare). Nu se mai promit „minute”.

## Problemele frecvente

| Situație | Ce faceți |
|---|---|
| Clientul a plătit noaptea / în weekend și întreabă | cererea pleacă în prima zi lucrătoare; termenul e maximum 2 zile lucrătoare. Nu promiteți minute. |
| Numărul de CF nu există în localitatea aleasă | Mircea pune comanda pe „Problemă — informații de la client” (intră în „Așteptare client”); îl sunați, corectați datele din admin, comanda revine la el. |
| Clientul nu știe CF-ul și nici cadastralul | e serviciul de identificare (298 lei), nu extrasul: vezi [Servicii imobiliare prin topograf](imobiliare-topograf.md). |
| Vrea extras pentru mai multe imobile | fiecare imobil e un extras: „extras suplimentar” 49,99 în aceeași comandă. |
| Vrea extras „de autentificare” (pentru notar, la vânzare) | noi livrăm **extrasul pentru informare**; cel de autentificare îl cere notarul. Îi spuneți clar. |
| Comanda stă în „Plătită” a doua zi | Mircea nu a preluat-o: verificați că i-a plecat emailul (istoricul comenzii) și îi scrieți. |
| Portalul ANCPI e picat iar | badge-ul roșu apare singur pe pagini; Mircea pune comenzile pe „Blocat instituție”; clientul vede „termenul este pus pe pauză”. |
| Clientul vrea PDF-ul din nou | îi trimiteți linkul de status (documentul e acolo) sau descărcați PDF-ul din comandă și i-l trimiteți pe email. |

## Ce îi spuneți clientului

- Primește **PDF-ul oficial OCPI, semnat electronic**, valabil oriunde se cere extras pentru informare.
- Termen: de regulă în aceeași zi lucrătoare, maximum două. Un topograf autorizat obține extrasul pentru el.
- Nu suntem ANCPI. Clientul îl poate lua și singur de pe ePay ANCPI, cu cont și cu 20 lei; noi vindem drumul și verificarea.
