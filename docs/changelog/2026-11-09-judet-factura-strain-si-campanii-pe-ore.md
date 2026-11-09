# 09.11.2026 — Factura pentru clienți din străinătate iese cu orașul la „Județ”; campaniile trimit din oră în oră
<!-- categorie: plati -->

## Pentru echipă

- **Facturi pentru clienți din străinătate**: din 02.11 ieșeau cu „Județ: -”, iar voi corectați de mână înainte de SPV (EGH-0942 Carcassonne, EGH-0949 Sofia, EGH-0953 Berlin). De acum, factura iese direct cu regiunea, dacă clientul a completat-o, altfel cu orașul. Pe eghiseul, documentero și cazierjudiciaronline.
- **Încă de corectat de mână**: EGH-0955 (Marea Britanie, orașul scris „M”) și EGH-0979 (Derby) au fost emise înainte de fix și arată tot „Județ: -”. Corectați-le ca pe celelalte, dacă nu le-ați trimis deja.
- Dacă orașul are o singură literă sau seamănă cu un județ din România (de exemplu „Alba”), rămâne „-”, ca factura să nu plece în SPV cu un județ românesc.
- **Campaniile de email** se trimit acum din oră în oră, între 09:40 și 17:40. Limita pe zi rămâne cea din Marketing. Campaniile Black Friday au acum 360 de emailuri pe zi la cazier judiciar și 200 la extras CF, ca să ajungă la toată lista până pe 14.11, cu două zile înainte ca oferta să se încheie.

---

## Facturi: ce s-a întâmplat

`58631268` (02.11) a pus `state: '-'` la orice client străin. Motivul: o regiune scurtă („RC”, Reggio Calabria) a plecat în SPV ca județ românesc (EGH-0625, RO / RO-CT). PDF-ul afișa „Județ: -”, iar echipa a corectat fiecare factură în Oblio.

Verificat din Oblio pe 09.11:
- PDF-urile EGH-0942, 0949 și 0953 arată „Judet: Carcassonne / Sofia / Berlin”, corectate de echipă. EGH-0955 și 0979 arată „Judet: -”.
- XML-ul e-Factura are `CountrySubentity` = `FR-`, `BG-`, `DE-`, `GB-` pe toate, editate sau nu. Oblio nu pune textul județului în XML la țări străine, deci textul liber nu ajunge la ANAF. Codul județului românesc ajunge acolo doar când Oblio recunoaște textul ca județ românesc.
- `checkEinvoiceExport` a raportat „ok” pe toate, pentru că verifică doar că Oblio generează XML-ul. Eroarea pe care a văzut-o echipa la trimiterea în SPV nu a ajuns în Gmail și nici în DB. Nu e clar dacă SPV a refuzat „-” sau dacă echipa a corectat doar ce se vedea pe PDF.

**Fix:** `foreignInvoiceState(region, city)` pe ambele platforme (`src/lib/oblio/address.ts`). Ia regiunea, altfel orașul, fără diacritice. Sare peste ce are sub 4 litere și peste ce `canonicalCounty()` recunoaște ca județ românesc, iar dacă nu rămâne nimic folosește „-”. Pe eghiseul, regiunea nu se mai pune în localitate când a ajuns la județ. Codul scurt de regiune rămâne în localitate („Reggio Calabria, RC”).

Teste: eghiseul 2.435 trecute (address, build-client, invoice actualizate), CJO 633 trecute.

## Campanii

- `vercel.json`: `/api/cron/email-campaigns/` rulează `40 7-15 * * *` (UTC), în loc de o dată pe zi.
- `daily_batch_size` e acum plafon pe zi UTC, numărat din `email_campaign_sends.created_at`. Înainte era plafon pe rulare.
- DB, 09.11: `daily_batch_size` 250 → 360 (cazier judiciar) și 150 → 200 (extras CF). Rămâneau ~1.795 și ~980 de destinatari.
