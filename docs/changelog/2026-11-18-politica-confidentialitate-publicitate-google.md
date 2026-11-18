# 18.11.2026 — Politica de confidențialitate: folosirea emailului pentru reclame Google
<!-- categorie: clienti -->

## Pentru echipă

Politica de confidențialitate de pe toate cele patru site-uri spune de azi că adresa de email și telefonul clienților pot fi folosite, în formă criptată, pentru reclame Google afișate celor care au mai comandat la noi.

Dacă un client scrie sau sună și cere să nu mai fie folosit pentru reclame, nu discutați: notați cererea pe contact și anunțați-l pe Raul în aceeași zi, ca adresa să fie scoasă din listă. Clientul nu trebuie să dea niciun motiv.

---

## Ce s-a schimbat în text

Pe eghiseul.ro, documentero.ro, cazierfiscal.com și certificat-constatator-express.ro, în `politica-de-confidentialitate`:

- Secțiunea 3 (scopuri): rând nou, „Publicitate către clienții noștri”.
- Secțiunea 4 (temei): publicitatea e trecută la interes legitim, cu drept de opoziție.
- Secțiunea 5: literă nouă, „d) Publicitate (Google Ads)”: ce date se folosesc (email și telefon, transformate în hash SHA-256), cui ajung (Google Ireland Limited), ce nu se trimite (acte, CNP, comenzi) și cum se opune clientul.
- Fraza „Nu vindem, nu închiriem și nu transferăm datele tale către terți în scopuri de marketing” a fost înlocuită: nu vindem și nu închiriem; singurul transfer în scop de marketing e cel de la litera d).
- Data actualizării: 18 noiembrie 2026.

## Context și limite

Decizia lui Raul din 18.11.2026: lista cumpărătorilor existenți se încarcă în Google Ads (Direcționare după lista de clienți), fără bifă nouă de acord la comandă.

De știut:

- În registrul de contacte, 72.559 de înregistrări sunt `soft_opt_in` și 35 `subscribed`. Nu există un câmp care să consemneze un acord pentru reclame.
- Schimbarea politicii informează clienții de acum înainte. Pentru cei din lista veche, temeiul rămâne interesul legitim declarat în politică, nu un acord dat.
- Lista pregătită: 21.033 de cumpărători, fără cei dezabonați sau blocați (356 scoși), cu emailul și telefonul în hash SHA-256. Fișierul nu se ține în repo.
- La încărcare, Google cere confirmarea că datele respectă politicile lui pentru lista de clienți și politica de consimțământ din UE. Confirmarea o dă Raul, în cont.

## Încărcarea, 18.11.2026

Lista a fost încărcată în contul Google Ads 881-388-1795 (constatator), cu numele „Cumparatori eghiseul 2026-11 (hash)”. Confirmarea de conformitate a fost dată de Raul; la al doilea pas al formularului, aceeași bifă a fost pusă la cererea lui.

Rezultatul afișat de Google:

- toate cele 21.033 de rânduri au fost formatate corect;
- rata de potrivire estimată: indisponibilă deocamdată; potrivirea durează până la 24 de ore;
- lista se poate folosi **doar pentru observare și pentru excluderi**, fără ajustări de licitare (limită a contului);
- ca să fie folosită, lista trebuie să ajungă la cel puțin 1.000 de persoane potrivite.

Lista nu e încă atașată la nicio campanie. Pas următor: după potrivire, se adaugă pe campania de constatator în modul „Observare”, ca să vedem cât din trafic sunt foști clienți.

## De făcut când se cere opoziția

Contactul se trece pe `unsubscribed` în registru; la următoarea generare a listei nu mai intră. Lista din Google se înlocuiește cu cea nouă.
