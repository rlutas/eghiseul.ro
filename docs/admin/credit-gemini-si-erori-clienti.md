# Credit Gemini și Erori clienți: cum le citești

Două pagini din admin care ne spun din timp când citirea automată a actelor e în pericol și câți clienți se lovesc de o eroare în formular.

## De ce

Citirea automată a actelor (scanarea buletinului în formular și „Extrage date” din admin) folosește Google Gemini, plătit în avans din AI Studio. Același credit servește eghiseul, documentero, CazierJudiciarOnline și ecazier. Pe 23.10.2026 creditul s-a terminat și citirea a stat 10 zile fără să observe nimeni. Google nu arată soldul automat, așa că îl estimăm noi.

## Credit Gemini (meniul „Credit Gemini”)

Pagina e vizibilă pentru cine are acces la Setări.

- **Stare** — verde „Funcționează” dacă ultima citire a reușit; roșu „Ultimul apel a eșuat”, cu ora și codul erorii. Codul `402:credit_depleted` înseamnă credit terminat.
- **Credit rămas (estimat)** — totalul alimentărilor minus costul tuturor citirilor de la prima alimentare, pe toate site-urile.
- **Ajunge pentru** — câte zile mai ține creditul la consumul mediu din ultimele 7 zile.
- **Pe site / Pe tip de citire** — câte citiri, câte eșuate și cât au costat azi, în 7 și în 30 de zile.

### Cum treci o alimentare

1. Plătești în AI Studio (Billing, proiectul cheii Gemini).
2. În „Credit Gemini” → „Adaugă alimentare”: suma în dolari, exact ca pe factura Google, data plății și, opțional, o notă.
3. Apeși „Salvează alimentarea”. Estimarea se recalculează imediat.

Dacă ai greșit suma, ștergi rândul din „Alimentări înregistrate” (coșul de gunoi) și îl adaugi din nou.

> Până nu e trecută prima alimentare, pagina arată un avertisment galben și nu calculează creditul rămas. Prima alimentare de trecut: cea din 02.11.2026.

### Când primești alerta pe email

Emailul „Credit Gemini (OCR) aproape epuizat” vine o singură dată când creditul estimat scade sub prag (implicit 5 $; se schimbă din „Alertă pe email”) sau mai ajunge pentru mai puțin de 7 zile.

Ce faci:
1. Încarci credit în AI Studio.
2. Treci suma în „Adaugă alimentare”. Alerta se rearmează pentru data viitoare.

Separat, dacă Google refuză deja cererile, vine emailul „Citirea actelor (Gemini) nu funcționează”, o dată pe zi cât durează. Atunci e urgent: clienții completează datele de mână până revine.

Estimarea poate diferi puțin de AI Studio. O dată pe lună compară cu soldul din AI Studio și, dacă diferența e mare, corectează alimentările.

## Erori clienți (meniul „Erori clienți”)

Aici apar erorile pe care clienții le-au văzut în formular, înregistrate automat:

| Tip | Ce a văzut clientul |
|---|---|
| Poză nedecodificată | „Imaginea nu a putut fi decodificată” — de obicei iPhone vechi |
| Poză neprocesată | HEIC, fișier gol sau altă problemă de procesare |
| Comandă nesalvată | Salvarea a eșuat: de obicei semnal slab („NETWORK”). Comanda poate lipsi din „Comenzi”, codul din rând e cel văzut de client |
| Pas neîncărcat | Pasul nu s-a descărcat pe telefon. Pagina se reîncarcă singură când revine conexiunea, cu datele păstrate |
| Încărcare eșuată | format greșit, fișier prea mare, aceeași poză la două acte |
| CNP invalid | CNP-ul tastat nu trece verificarea (cu motivul: lungime, dată, cifra de control…) |
| Citire act eșuată | „Nu am putut extrage datele din document” |
| Verificare act eșuată | verificarea selfie ↔ act din cont |

- Sus alegi perioada (7 / 30 de zile), tipul și site-ul.
- **Pe zile** — câte erori de fiecare tip în fiecare zi. Un salt brusc înseamnă de obicei o problemă la noi, nu la clienți.
- **Pe comenzi** — comenzile cu erori; click pe număr deschide comanda. Util când un client sună: vezi ce mesaj a primit.
- **Dispozitiv** — telefonul și versiunea („iPhone iOS 15.8”).
- La „Poză nedecodificată” cu „fallback: original”, clientul **nu** a fost blocat: am trimis poza originală. Verifică doar că poza din comandă se vede bine.

Nu se salvează CNP-ul, numele, emailul sau poza clientului.

## Legat

- [Client blocat în formular sau cu probleme la act: ce faci](client-blocat-in-formular.md)
- [Pagina comenzii](pagina-comenzii.md)
