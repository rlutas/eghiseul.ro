# Statusurile comenzii, de la plată la finalizare

Ce înseamnă fiecare status, în ce tab din **Comenzi** îl găsiți, cine îl
pune, ce vede clientul pe pagina lui de status și ce apăsați ca să meargă mai
departe. Scris pe 21.09.2026 din platformă. Butoanele în detaliu:
[Pagina comenzii](pagina-comenzii.md).

## Cele trei cozi de verificat zilnic

| Tabul | Ce e acolo | Ce faceți |
|---|---|---|
| **Așteptare plată** | comenzi pe transfer bancar, banii neconfirmați (chiar dacă lucrul a pornit pe dovadă) | comparați extrasul; **„Confirmă plata”** cu referința tranzacției. Pe dovadă: **„Dovadă verificată — pornește lucrul”**. Dacă banii nu vin: „Banii nu au venit — abandonează”. [Procedura](plata-transfer-bancar.md) |
| **Așteptare client** | comenzi oprite pentru că lipsește ceva de la client (acte cerute, date imobil) | sunați / scrieți; când a încărcat ce s-a cerut, comanda iese singură. Termenul e pe pauză cât stă aici |
| **Blocat instituție** | instituția e indisponibilă (ANCPI picat, registru închis); termen pe pauză, nu e vina clientului | nimic de apăsat; când revine instituția, cine lucrează comanda o scoate de aici |

Plus **„Plătite”** = comenzi la care nimeni nu a apăsat încă „Începe
procesarea” (sau pe care Mircea nu le-a preluat). O comandă care stă acolo o
zi lucrătoare e o comandă uitată.

## Statusurile, în ordine

| Status (în admin) | Tab | Cine îl pune | Clientul vede | Ce urmează |
|---|---|---|---|---|
| **Ciornă** | Neplătite | formularul, la primul pas | „Neterminată” | clientul continuă singur; din admin: „Copiază link continuare” (48 h), „Editează datele clientului” |
| **În așteptare (pending)** | Neplătite | formularul, la trimitere spre plată | „În așteptare” | plata; după 30 de minute fără plată devine Abandonată |
| **Așteptare plată (transfer bancar)** | Așteptare plată | clientul alege IBAN; sau voi, din dropdown, când spune la telefon că plătește prin bancă | „Așteptăm plata prin transfer” | „Dovadă verificată — pornește lucrul” → „Confirmă plata” |
| **Abandonată** | Neplătite | cronul, la 30 de minute | „Abandonată” | emailurile de recuperare (3 pași, cupon la al treilea) + Recuperare telefonică |
| **Plătită** | Plătite | Stripe / „Confirmă plata” | „Plata a intrat. Pregătim documentele.” | **„Începe procesarea”** |
| **În procesare** | În procesare | voi / Mircea „În lucru” / „Dovadă verificată” | „Lucrăm la comanda ta.” | verificați actele; **„Marchează documente generate”** |
| **Documente generate** | În procesare | voi | „Am pregătit actele necesare pentru depunere.” | **„Marchează depusă la IPJ”** (numele butonului e generic pentru orice instituție) |
| **Trimis instituție** | În procesare | voi / Mircea „Depusă la OCPI” | „Dosarul este la instituție. Așteptăm eliberarea.” | așteptați actul; **„Marchează document primit”** (încărcați scanul) |
| **Identificare nereușită — certificat OCPI depus** | În procesare (badge mov) | Mircea, „Nu am găsit” | „Certificat oficial cerut la OCPI”, ~10 zile lucrătoare | răspunsul OCPI; Mircea continuă |
| **Document primit** | În procesare | voi | „Am primit documentul de la instituție.” | **„Marchează gata de expediere”** sau statusurile de opțiuni |
| **Extras în lucru** | În procesare | voi | „Servicii suplimentare în lucru” | **„Marchează gata de expediere”** |
| **La traducere / La legalizare / Apostilă Notari / Apostilă Haga** | În procesare | voi, din dropdown | „La traducere”, „Apostilă Haga obținută” | următorul pas din lanț, apoi „Documentul este eliberat” |
| **Documentul este eliberat** | În procesare | voi / Mircea (la încărcare) / robotul ONRC | „Documentul este eliberat și urmează livrarea.” | email: pleacă singur; curier: **„Generează AWB”** |
| **Expediată** | Expediate | „Generează AWB” / AWB manual | „Coletul este la curier.” + urmărire | urmărirea rulează la 30 de minute |
| **Livrată** | Expediate | curierul (automat) / „Marchează livrat” | „Livrată” | Finalizată, automat |
| **Finalizată** | Finalizate | automat (email, curier confirmat) sau voi; cronul de siguranță la 06:00 după pragul curierului | „Finalizată” | emailurile de după (recenzie, expirare, cross-sell). Comenzile finalizate coboară sub cele vii în „Toate” |
| **Așteptare client (SLA pauzat)** | Așteptare client | „Solicită documente” (automat), Mircea „Problemă”, sau voi din dropdown | „Așteptăm un răspuns de la tine” | iese singură când clientul încarcă; altfel voi, din dropdown, înapoi la statusul de dinainte |
| **Blocat — instituție indisponibilă (SLA pauzat)** | Blocat instituție | voi / Mircea | „Blocată la instituție… termenul este pus pe pauză” | înapoi la lucru când revine instituția |
| **Anulare solicitată** | În procesare (banner roșu) | clientul, în primele 30 de minute | „Anulare în curs” | **„Procesează refund”** (70% + storno + factura de 30%); dispare de la Mircea. [Procedura](anulare-refund-70.md) |
| **Anulată** | (căutare) | voi, după refund / decizie | „Anulată” | nimic; numerele de Barou se eliberează în registru |
| **Rambursată** | (căutare) | voi, după refund integral | „Banii au fost returnați pe cardul folosit la plată.” | nimic |

Statusurile **nu se pun din dropdown** când există buton dedicat: „Plătită”
și „În procesare” pe o comandă cu IBAN se pun doar prin „Confirmă plata” /
„Dovadă verificată” (altfel nu se emite factura și nu se generează
documentele). Dropdown-ul e pentru corecții și pentru statusurile de
opțiuni.

## Termenul estimat

Se calculează la plată, pe **zile lucrătoare**, din serviciu + opțiuni +
curier; la stare civilă pe oficiul de înregistrare; la serviciile instant
(constatator, extras CF, plan cadastral) stă **pe pauză** cât e portalul
picat. „Așteptare client” și „Blocat instituție” **opresc ceasul**. În listă:
chip-urile „Depășite” și „Termen apropiat”. Clientul vede aceeași dată pe
pagina lui, și nu vede nicio dată cât timp comanda e pe pauză.

## Ce primește clientul pe email, fără să apăsați nimic

Confirmarea comenzii (cu linkul de status și factura), emailul de transfer
bancar (IBAN + dovada), cererea de documente, confirmarea că a încărcat,
„documentul e gata” cu fișierul, linkul de plată extra + reminder, anularea,
recuperarea coșului abandonat (3 pași), recenzia, reamintirea expirării,
cross-sell, reminderele de mașină din cont. Pe comenzile de pe
documentero.ro, toate pleacă pe brandul documentero.
