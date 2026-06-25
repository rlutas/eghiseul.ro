# 2026-06-25 — Fix KYC: act de identitate obligatoriu

## Bug (reprodus live cu Playwright)
La pasul 2 (Date Personale), ruta **„Completez manual"** amâna încărcarea actului „la pasul 4". Dar pasul KYC (`KYCDocumentsStep`) nu avea pentru cetățenii români nici zonă de upload pentru act, nici cerință în `isValid` (valida doar selfie + certificat domiciliu). → un client putea comanda **fără să încarce actul de identitate**.

## Fix
`KYCDocumentsStep`:
- `isValid` cere acum, pentru cetățenii români, un **act de identitate** prezent în `uploadedDocuments` (tipuri: `ci_front`/`ci_nou_front`/`ci_nou_back`/`ci_vechi`/`passport_opened`/`act_identitate`) — altfel blochează.
- Card nou **„Act de Identitate (obligatoriu)"** afișat doar când actul nu există deja (utilizatorii care au ales completarea manuală). Cei care au scanat la pasul 2 nu-l văd.
- Cont cu KYC verificat → short-circuit (refolosit, nu re-cere).
- Tip nou `DocumentType.act_identitate` + label admin „Act de identitate (manual)".

## Acoperire
Se aplică la TOATE cele 8 servicii cu KYC personal: cazier auto/fiscal/judiciar/judiciar-PF, certificat integritate, naștere, căsătorie, celibat. Serviciile fără identitate (judiciar-PJ = company KYC, constatator/ANCPI/rovinietă) corect NU cer act.

## Verificat
Build OK, lint 0 erori, **1084 teste pass**. (Testare funcțională end-to-end: echipa.)
