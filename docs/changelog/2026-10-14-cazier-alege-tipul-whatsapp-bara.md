# 14.10.2026 — Cazier judiciar: tipul se alege pe loc; WhatsApp ascuns pe telefon lângă butonul de comandă
<!-- categorie: comenzi -->

## Pentru echipă

- Pe pagina **cazierului judiciar**, butonul de sus („Comandă cazierul”) și bara de jos de pe telefon („Comandă”) nu mai derulează pagina până la cardurile „persoană fizică / firmă”. Se deschide o fereastră mică cu cele două variante, iar clientul intră direct în formularul potrivit. Mulți se pierdeau la derulare.
- Pe telefon, **butonul verde de WhatsApp nu mai apare** pe articole, calculatoare, unelte și paginile de servicii, unde stătea peste butonul „Comandă”. Pe calculator rămâne. Linkul de WhatsApp e în continuare în subsolul paginii.
- Pe articole, **bara de comandă de jos apare mai devreme**: după aproximativ un ecran de derulare, nu după o treime din articol.

---

## Tehnic

- `src/components/services/client-type-chooser.tsx`: `Dialog` cu opțiunile PF/PJ (linkuri reale spre `/comanda/cazier-judiciar-persoana-fizica/` și `-juridica/`). Folosit în hero-ul `servicii/cazier-judiciar-online` și de `MobileStickyCTA` prin prop nou `choices` (fără `choices` rămâne link simplu, pe celelalte 61 de utilizări). Fluxul combinat `cazier-judiciar` (tipul ales în wizard) există, dar are 0 comenzi plătite în 60 de zile față de 37 PF + 9 PJ, deci n-am mutat traficul pe el.
- `WhatsAppFloat`: `hidden lg:flex` pe `/calculator/*` și `/servicii/*`, `hidden xl:flex` pe articole și unelte (`contentKind`); pe calculatoare, pe desktop, rămâne ridicat peste bară.
- `ArticleStickyBar`: pragul = min(0,9 × înălțimea ecranului, 30% din pagină).
