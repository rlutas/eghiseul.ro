# 2026-07-13 — Colaborator (topograf): date complete pe comandă, decont cu încasări, costuri ANCPI informative

## Context
Pe comanda de identificare imobil (E-260710-EFNSH) topograful nu vedea adresa imobilului și motivul,
iar „Husaru" (doar nume de familie) nu ajunge pentru identificare. Plus: decontul lunar avea doar
onorariul, fără totalul încasat de la client (baza de calcul dintre părți).

## Livrat

### Pagina comenzii la colaborator (`/colaborator/orders/[id]`)
- Fix: adresa imobilului citea `property.address`, wizardul salvează `propertyAddress` → nu apărea NICIODATĂ
- Adăugate: „Motivul solicitării" + „Alte informații de la client"

### Wizard identificare imobil
- „Nume proprietar (opțional)" → „**Nume complet proprietar**" + helper („doar numele de familie nu e suficient")
- Câmp nou „**Alte informații utile**" (textarea: repere, vecinătăți, foste denumiri de stradă...) →
  `property.additionalInfo`, vizibil în admin (etichetat) + la colaborator

### Decont lunar (`/colaborator/decont` + API earnings)
- Coloană nouă per comandă: „**Încasat client (TVA incl.)**" (`orders.total_price`)
- Card nou: „**Încasat servicii (TVA incl.)**" — total lunar, lângă „Onorariu total"

### Costuri ANCPI informative (migrarea 109)
- `processing_config.ancpi_cost_ron` seedat pe 16 servicii cadastrale cu tarifele oficiale
  (Ordin 16/2019, sursă sj.ancpi.ro/tarife-servicii): extras CF 20 · identificare după adresă 100 (cod 2.7.8) ·
  după proprietar 10 (2.7.6) · plan cadastral 15 (2.7.7) · certificat sarcini 100 (2.7.4) · copii arhivă 25 (2.7.5) ·
  actualizare adresă 60 (2.6.3) · dețineri imobile 10 (2.7.9). PAD = fără seed (tarif variabil).
- Afișat la colaborator în `/colaborator/servicii` (coloana „Cost ANCPI (informativ)")
- **Editabil din admin** Settings → Servicii → Edit („Cost ANCPI informativ (lei)") — fără cod

### Email de alocare comandă (către topograf)
- Era HTML minimal pe 2 rânduri → arăta stricat și ateriza în spam la Yahoo (raportat de Mircea)
- Refăcut pe template-ul branded al comenzilor (`branded-layout.ts`): header navy + logo, rânduri
  Comandă/Serviciu, buton „Deschide comanda" către portal, footer legal, preheader; subiect cu numele serviciului
- Testat pe adresa reală: primit OK (13.07)

### Uniformizare TOATE emailurile pe template-ul branded
Audit complet al celor 12 puncte de trimitere email. Trecute pe shell-ul branded (header navy +
logo scut, card alb, buton auriu, footer legal, preheader):
- **recovery abandon** (cupon 10%), **plată suplimentară** (Modifică), **cerere anulare** (refund 70%),
  **mesaj contact** (intern), **„în procesare" ANCPI** și **„în procesare" ONRC** (erau 3 rânduri de HTML gol)
- + logo-ul scut adăugat la **confirmarea de comandă** (avea doar text în header)
Deja branded dinainte: document gata, reupload (×2), alocare colaborator. Verificate vizual toate (randate + screenshot).
