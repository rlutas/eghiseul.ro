# 06.10.2026 — Cazierul fiscal se livrează ca cel judiciar: scan pe email, originalul prin curier
<!-- categorie: documente -->

## Pentru echipă

- Site-ul spunea că prin noi clientul primește cazierul fiscal ca PDF semnat electronic de ANAF. **Nu e adevărat**, iar textele au fost corectate.
- Cazierul fiscal merge exact ca cazierul judiciar: ANAF eliberează certificatul **pe hârtie**, avocata îl ridică, clientul primește **scanul pe email** și **originalul prin curier** (în țară sau în străinătate), dacă a ales livrarea.
- Ce le spuneți clienților: „Vă trimitem scanul pe email imediat ce e eliberat; originalul vine prin curier. Dacă instituția cere documentul electronic semnat de ANAF, acela se ia doar din contul SPV, de dumneavoastră.”
- Dacă un client a citit pe site că primește un PDF semnat și reclamă că a primit un scan: textul vechi era greșit, explicați-i ca mai sus.
- Aceeași corectură la cazierul judiciar (persoană fizică și firmă) și la certificatul de integritate: și acolo site-ul spunea „PDF semnat electronic”, dar livrăm scan + original.

---

## Rezumat tehnic

Afirmația falsă „PDF semnat electronic (ANAF / IGPR / eIDAS), livrat pe email” scoasă de pe paginile publice. Corect: certificat pe hârtie de la instituție, scan pe email, original prin curier. Rămân corecte și neatinse mențiunile că SPV / hub.mai cer semnătura electronică a clientului și că din SPV vine un PDF semnat de ANAF.

| Pagină | Ce s-a schimbat |
|---|---|
| `/servicii/cazier-fiscal-online/` | descriere, statistici, carduri, pași, FAQ (inclusiv întrebarea „vine ca PDF semnat?”), JSON-LD |
| documentero `/cazier-fiscal-online/` | `DESCRIPTION`, `UPDATED`, intro, fapte, pasul final, lista „ce primești” |
| `/cazier-fiscal-fara-spv/` | calea prin împuternicit: scan pe email + original prin curier |
| `/servicii/cazier-judiciar-online/persoana-fizica/` și `/persoana-juridica/` | cardul „ce primești”, rândul „Semnătură electronică eIDAS” din tabelul comparativ devine „Originalul prin curier, și în străinătate”; la firmă, lista de pregătit cere semnătura pe împuternicire, nu semnătură electronică |
| `/taxa-cazier-judiciar/` | „ți-l trimite semnat electronic” → scan + original |
| `/servicii/certificat-de-integritate-comportamentala/` | eticheta specimenului, statistica, introducerea specimenului, două carduri, FAQ „email sau hârtie” |

Baza de date verificată (doar citire): `services` și `service_options` pentru cazier fiscal, judiciar și integritate nu conțin texte despre PDF semnat electronic. Nu e nevoie de migrare.

Neatinse: pagina generică `/servicii/[slug]` are în lista de încredere „Semnătură electronică eIDAS” (se referă la semnătura clientului pe contract, dar e ambiguă); extrasul CF și certificatul constatator chiar vin semnate electronic de ANCPI / ONRC.

Același fix pe cazierjudiciaronline.com și ecazier.ro (repo separat, ramura `fix/fiscal-not-esigned`).
