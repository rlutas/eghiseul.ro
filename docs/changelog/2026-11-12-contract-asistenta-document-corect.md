# 12.11.2026 — Contractul de asistență juridică numește documentul corect
<!-- categorie: documente -->

## Pentru echipă

În contractul de asistență juridică, după punctul 4.7, scria la toate
comenzile „Contractul se încheie pe durata obținerii **cazierului judiciar**”,
inclusiv la certificat de celibat, naștere, căsătorie, cazier fiscal sau auto.
Un client a semnalat-o pe o comandă de certificat de celibat.

De acum fraza ia documentul comenzii: „…pe durata obținerii certificatului de
celibat”, „…cazierului fiscal” și așa mai departe.

Ce faceți:

- **Comenzi noi:** nimic, contractul iese corect singur.
- **Clientul care a semnalat** (și oricine mai cere): deschideți comanda →
  Documente → generați din nou „Contract asistență juridică”. Numărul de
  contract rămâne același; data de pe contract devine data de azi.
- Contractele vechi nu se schimbă singure. Dacă avocata vrea refăcute și
  altele, se regenerează la fel, comandă cu comandă.

---

## Tehnic

**Cauza.** Fraza era text fix în `shared/contract-asistenta.docx`,
`shared/contract-complet.docx` și copia din `cazier-judiciar/`. Șablonul e
comun tuturor serviciilor cu avocat (`LAWYER_SERVICE_SLUGS`), deci 10 din 11
sluguri primeau alt document decât al lor. Articolul 1.1 (obiectul) enumeră
toate documentele și nu a fost atins.

**Ce s-a livrat**

- `src/lib/documents/contract-document-name.ts`: `contractDocumentGenitive(slug)`,
  cu varianta neutră „documentului solicitat” pentru un slug fără intrare.
- `{{DOCUMENT_GENITIV}}` în cele trei șabloane și în `buildPlaceholderData`.
- `tests/unit/lib/documents/contract-document-name.test.ts`: șabloanele nu mai
  au document fix în frază; fiecare slug din `LAWYER_SERVICE_SLUGS` are
  intrare (un serviciu nou cu avocat fără nume pică testul); contractul randat
  pe 6 servicii.

**Amploare.** În ultimele 120 de zile, aproximativ 157 de contracte de
asistență pe alte servicii decât cazierul judiciar au fraza greșită (4 pe
comenzi încă deschise). Nu au fost regenerate.
