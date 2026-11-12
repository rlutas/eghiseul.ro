# 12.11.2026 — Previzualizarea contractului arată „pașaportul”, nu „CI”
<!-- categorie: documente -->

## Pentru echipă

Un client cu pașaport vedea în formular, la pasul de semnătură, contractul cu
„legitimat/ă cu CI seria …”, deși contractul salvat după semnare scria corect
„pașaportul”. De aici reclamația „încă apare doar CI”.

Acum și previzualizarea scrie „legitimat/ă cu pașaportul seria … nr. …”, plus
adresa de email, ca în contractul final.

- Clientul vede varianta corectă când redeschide formularul (linkul de
  continuare) și ajunge la semnătură.
- La o comandă neterminată nu aveți ce regenera din admin: contractul se face
  când clientul semnează.
- La comenzile deja semnate nu se schimbă nimic; acolo contractul era corect.

---

## Tehnic

`ContractPreview.tsx` trimitea la `/api/contracts/preview` doar seria, numărul
și emitentul actului, fără `idDocumentType` / `documentType`.
`idDocumentKindFrom()` cădea pe `'ci'`. Generarea reală (`auto-generate.ts`,
`generate-document`) citește actul din comandă și nu era afectată.

Verificat pe datele unei comenzi reale cu pașaport: cererea veche întoarce „cu
CI seria”, cea nouă „cu pașaportul”; contractul randat a fost privit în
browser.
