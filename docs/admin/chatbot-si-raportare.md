# Chatbotul din Ghid și raportarea problemelor

Din 21.09.2026, în **Ghid & noutăți** (admin) și în meniul **Ghid** din
portalul topografului există o singură casetă sus, „Caută în ghid sau
întreabă”, și linkul „Raportează o problemă” sub ea. Aici e ce fac și cum le
folosiți.

## Caută sau întreabă

Cât scrieți, sub casetă apar **paginile din ghid** care se potrivesc (click
și ajungeți direct). Apăsați **Enter** sau „Întreabă” și întrebarea merge la
chatbot. Scrieți-o ca la un coleg: „ce fac cu o comandă în Așteptare plată?”,
„cât durează certificatul de naștere la București?”, „clientul are permis din
străinătate, ce preț are cazierul auto?”. Răspunsul **se scrie sub ochii
voștri** (primul rând sub o secundă), iar la final apar sursele, ca butoane
spre pagina din ghid.

Reguli de știut:

- Răspunde **doar din procedurile scrise** (fișele serviciilor, statusurile,
  pagina comenzii, ghidurile echipei, noutățile). Nu inventează prețuri și nu
  știe nimic despre o comandă anume: nu are acces la comenzi.
- Când ceva **nu e documentat**, spune asta, iar întrebarea ajunge singură la
  Raul în lista de rapoarte. Așa aflăm ce lipsește din ghid.
- Puteți continua conversația (răspunsurile țin cont de ultimele întrebări).
- Răspunsurile sunt scurte intenționat (cel mult 6 rânduri): pentru detalii,
  deschideți pagina sursă.
- Topograful vede doar ghidurile lui (serviciile imobiliare, extrasul CF,
  identificarea), chatbotul lui răspunde doar din ele.
- Verificați în pagina sursă înainte să spuneți clientului un preț sau un
  termen: chatbotul rezumă, pagina are detaliile.

Dacă apare „Chatbotul nu este configurat încă”, lipsește cheia de acces pe
server; raportarea funcționează oricum.

## Raportează o problemă

Butonul **„Raportează o problemă”** (sau „Nu m-a ajutat” sub un răspuns)
deschide un formular scurt: problemă sau sugestie, descrierea, opțional
numărul comenzii. Ajunge la Raul, care o vede în **Rapoarte din Ghid**,
grupată pe „Nou / În lucru / Rezolvat”, cu cine a trimis-o și când.

Ce ajută la o raportare bună: ce ați apăsat, ce vă așteptați să se întâmple,
ce s-a întâmplat, numărul comenzii. „Nu merge AWB-ul” nu spune nimic;
„la E-260921-ABCDE, Generează AWB dă eroare roșie după 5 secunde, easybox
Satu Mare” spune tot.

## Pentru Raul: pagina de rapoarte

`/admin/ghid/rapoarte`: trei liste (Nou, În lucru, Rezolvat), fiecare raport
cu tipul (problemă / sugestie / întrebare fără răspuns), cine, de unde
(echipă sau colaborator), comanda, întrebarea și răspunsul chatbotului
(pliate). Butoane: „În lucru”, „Rezolvat” (cu notă opțională: ce ai făcut),
„Redeschide”. Întrebările fără răspuns se închid completând ghidul, nu
răspunzând în chat.
