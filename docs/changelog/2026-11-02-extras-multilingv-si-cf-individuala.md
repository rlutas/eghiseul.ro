# 02.11.2026 — Extrasul multilingv nu mai întreabă de certificatul pierdut; „Extras de Carte Funciară Individuală"
<!-- categorie: comenzi -->

## Pentru echipă

- La **extrasul multilingv** (naștere și căsătorie) formularul nu mai întreabă „Vechiul certificat mi-a fost: Pierdut / Deteriorat…". Extrasul se poate cere oricând, chiar de două ori într-o lună, iar întrebarea îi obliga pe clienți să bifeze „pierdut" fără motiv.
- La certificatele de naștere și căsătorie (duplicat) întrebarea rămâne.
- Serviciul „Extras Carte Funciară" se numește acum **„Extras de Carte Funciară Individuală"**: în formular, în emailuri și pe factură. Așa se vede clar diferența față de „Extras de Carte Funciară Colectivă".
- Adresa paginii și meniul site-ului rămân la fel.

Ambele au fost cerute din Ghid (01.10 și 08.10).

---

## Tehnic

- Migrarea 197: `services.verification_config.civilStatus.fields.oldCertificateReason = false` pe `extras-multilingv-certificat-nastere` și `-casatorie` (2 rânduri). Cererea ANEXA 4 nu folosește câmpul.
- Migrarea 198: `services.name` → „Extras de Carte Funciară Individuală” pentru `extras-carte-funciara` (1 rând). Slug, URL-uri și texte SEO neschimbate; etichetele scurte din `services-nav.ts`, footer și homepage rămân „Extras Carte Funciară”.
- Ambele aplicate în producție pe 02.11.2026.
