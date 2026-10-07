# 07.10.2026 — Pagina pentru diaspora de pe cazierjudiciaronline spune acum procesul real
<!-- categorie: comenzi -->

## Pentru echipă

- Pagina de cazier judiciar pentru diaspora (cazierjudiciaronline.com) promitea lucruri pe care nu le facem: „procură electronică”, livrare prin FedEx, livrare pe WhatsApp și prețuri vechi. Acum spune exact ce facem.
- Ce scrie acum: clientul semnează pe telefon împuternicirea avocațială. Avocata depune cererea și ridică certificatul pe hârtie. Clientul primește scanul pe email în 3–5 zile lucrătoare, iar originalul prin DHL Express (250 lei, 1–3 zile de la expediere) sau prin Poșta Română (100 lei, 7–15 zile).
- Prețurile de pe pagină sunt cele din formular: apostilă 198 lei, traducere 178,50 lei pe limbă, cetățean străin 317 lei.
- Dacă un client din străinătate întreabă de FedEx, de WhatsApp sau de un preț vechi, înseamnă că a citit varianta veche. Prețul corect e cel din formular.

---

**Tehnic (repo CJO, commit `3cf4ef25`).** `src/app/cazier-judiciar-diaspora/page.tsx`: FAQ, tabelul de prețuri, textele pe țări (UK, DE, IT, ES, FR, MD) și CTA-ul final corectate pe valorile din `src/config/addons.ts` (`apostila_haga` 198, `traducere` 178,50, `courier_dhl` 250, `courier_posta` 100), `cabinet-judiciar.config.ts` (`cetatean_strain` 317) și `delivery-calculator.ts` (DHL 1–3 zile, Poșta 7–15 zile). Scoase: FedEx, „procura electronică”, „depunem la IGPR”, livrarea pe WhatsApp. `sitemap-dates.ts` → 07.10. Punctul H11 din planul A–Z.
