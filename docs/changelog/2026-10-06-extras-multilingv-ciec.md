# 06.10.2026 — Extrasul multilingv, descris corect pe toate paginile
<!-- categorie: seo -->

## Pentru echipă

- Extrasul multilingv pe care îl obținem e cel din **Convenția CIEC nr. 16** (Viena, 1976), la care România a aderat în 2012. Nu e „formularul standard UE”, cum scria pe mai multe pagini.
- Diferența contează pentru client. Extrasul e acceptat fără traducere și fără apostilă în **23 de state**, între care Italia, Spania, Germania, Franța, Elveția, Turcia și Republica Moldova. **Nu** e recunoscut automat în Regatul Unit, Irlanda, țările nordice, Cehia, Ungaria sau Grecia, chiar dacă unele sunt în UE.
- În România extrasul nu se folosește; aici clientul are nevoie de certificat. Ca să obții extrasul **nu** ai nevoie de certificat, pentru că starea civilă îl eliberează după actul din registru.
- Când un client întreabă „merge în țara X?”, verifică lista din fișa de fapte (link mai jos). Dacă țara nu e pe listă, recomandă duplicatul certificatului, cu traducere și, în afara UE, cu apostilă.
- Fișa completă: [Extrasul multilingv: ce obținem de fapt](../documentero/extras-multilingv-fapte.md).

---

**Verdict.** The cerere template (`src/templates/extras-multilingv-certificat-*/cerere-eliberare-pf.docx`) is **Anexa 4 to HG 727/2013**, the norms implementing Convention CIEC no. 16. Romania acceded by **Legea nr. 65/2012**, in force for Romania since **05.06.2013** (CIEC status chart). The extract has the same probative force as the certificate, is used only before foreign authorities of the states parties (23 besides Romania), is accepted there without translation/legalisation, and cannot be used before Romanian authorities. The Reg. (EU) 2016/1191 multilingual standard form is a different, accessory translation aid attached to a certificate, EU-only.

**Pages aligned** (key claim before → after):
- documentero `/extras-multilingv/`: „formularul standard UE 2016/1191, acceptat în toată Uniunea” → „extrasul din Convenția CIEC nr. 16, acceptat în 23 de state”; country chips now list the 23 parties (Ireland, Greece, Sweden, Denmark, Hungary, Czechia removed); „24 de limbi” → rubrics in Romanian + French with translations on the back; „nu expiră” → „convenția nu îi stabilește un termen”; comparison table now says what we sell (CIEC) vs the EU form; title/meta updated; `dateModified` + sitemap 2026-10-06.
- documentero home, nav hint, `termeni-si-conditii`, `despre`, `llms.txt`, `certificat-de-nastere`, `certificat-de-casatorie`, `certificat-de-celibat`: „pentru UE / formularul UE” → „statele Convenției CIEC nr. 16”; „pentru UK, Elveția sau SUA rămâne duplicatul” → Elveția removed (it is a party), Irlanda added.
- documentero guides: `certificat-de-nastere-pierdut`, `procura-din-strainatate`, `certificat-de-nastere-vechi-tipizat`, `apostila-acte-stare-civila` (the extract paragraph now separates CIEC extract from the EU form; the „Pentru UE” card → „În statele Convenției CIEC”).
- eghiseul `/servicii/extras-multilingv-certificat-nastere/` and `-casatorie/`: title, meta, schema description, hero, badges, explanation, „Important” box (lists the 23 states), comparison cards, FAQ. Removed the false claim that the extract „nu înlocuiește certificatul / nu circulă singur / rămâne fără actul pe care îl traduce”.
- eghiseul duplicate pages (naștere, căsătorie), home `featured-services` + FAQ, `calculator-layout`, pension table page, cross-sell email copy.
- The eghiseul article `/cum-vor-arata-documentele-de-stare-civila-2025/` was already correct (CIEC vs EU form); unchanged.

**Ads doc** `docs/ads/2026-10-05-documentero-campanii.md`: product table row; C5 locations now exclude UK **and IE**; rationale rewritten; X1/X2 RSA headlines/descriptions „Acceptat în UE / Fără apostilă în statele UE / Formularul UE 2016/1191 / Extrasul nu expiră / Regulamentul UE 2016/1191 a scos traducerea” replaced (all ≤30/≤90, counts recomputed); X2 D3 (divorce mention) flagged as unverified; N1 D3 and M1 D4 cross-sell descriptions; two sitelink texts. C5 was not live.

**DB texts**: `supabase/migrations/191_extras_multilingv_ciec.sql` updates `services.description/short_description` for both extras services and the `extras_multilingv` option description shown in the wizard. **Written, not applied.**

**Sources**: Legea 65/2012, HG 727/2013 (as quoted in civil-status information sheets, e.g. Primăria Hațeg); ciec1.org Convention no. 16 status chart; Wikipedia article on the convention (languages, entry into force for Romania); e-Justice page on public documents.

**Open**: CIEC form B divorce mention; legal issuance term for extracts; whether any civil-status office (not only the one holding the act) can issue it.
