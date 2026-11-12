# 12.11.2026 — Site-urile de nișă iau comenzi doar pentru serviciul lor
<!-- categorie: clienti -->

## Pentru echipă

cazierfiscal.com, certificat-constatator-express.ro și documentero.ro au
același formular de comandă ca eghiseul. Până azi, formularul se deschidea
pentru orice serviciu pe oricare dintre ele, dacă cineva scria adresa de mână:
de exemplu, o comandă de cazier judiciar pe cazierfiscal.com.

Acum fiecare site deschide formularul doar pentru ce vinde:

- cazierfiscal.com: doar cazier fiscal;
- certificat-constatator-express.ro: doar certificat constatator;
- documentero.ro: acte de stare civilă, plus cazier judiciar persoană fizică și cazier fiscal;
- eghiseul.ro: tot, ca până acum.

Pentru alt serviciu, pagina răspunde „pagină negăsită”. Comenzile existente nu
sunt afectate: toate sunt pe servicii pe care site-ul lor le vinde.

---

## Tehnic

`src/app/(order)/comanda/[service]/page.tsx`: după `getService`, `notFound()`
dacă `brandSellsService(brand, slug)` e fals. Lista fiecărui brand e în
`src/lib/brand/brands.ts` (`*_SERVICE_SLUGS`).

Motivul imediat: cererea de excludere de la politica Google „Government
documents and services” pentru cazierfiscal.com cere garanția că domeniul nu
promovează documentele din listă, iar Google re-examinează domeniul.
Înainte de reparație, `/comanda/cazier-judiciar-persoana-fizica/`,
`/comanda/certificat-nastere/` și `/comanda/certificat-constatator/`
răspundeau 200 pe cazierfiscal.com.

Verificat în bază înainte: nicio comandă de pe un site de nișă nu e pe un
serviciu din afara listei lui.
