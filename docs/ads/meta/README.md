# Meta Ads (Facebook/Instagram) — index

Deschis 02.09.2026 ca posibil al doilea canal după ChatGPT Ads. Evaluarea scurtă inițială e în
`../2026-09-02-meta-ads-evaluare.md`; aici e dosarul complet.

| Doc | Ce conține |
|---|---|
| [01-research-us-uk.md](01-research-us-uk.md) | cercetare web: cum fac reclamă LegalZoom (10-K: 261 mil. $ S&M), ZenBusiness, RushMyPassport, formatorii UK; hook-uri, funnel, ce nu merge, benchmark-uri, incidente de politică — cu marcaj dovadă/opinie |
| [02-mecanica-meta-2026.md](02-mecanica-meta-2026.md) | platforma în 2026: Advantage+ vs manual, Andromeda (diversitate creativă), broad vs interese, pragul de 50 conversii, constrângeri UE (DMA, GDPR, DSA beneficiary/payer), retargeting, lead ads vs site, cum judeci un test de €300 |
| [03-ad-library-us-uk.md](03-ad-library-us-uk.md) | **ce rulează LIVE** în Ad Library US/UK/RO: citate din anunțuri, de când rulează (durata = proxy pentru „merge"), cine ține luni/ani (Texas Tower 22 luni, CFunciara 19 luni, UK Deed Poll 6+) |
| [04-playbook-ce-merge.md](04-playbook-ce-merge.md) | sinteza: ce merge / ce nu / ce e diferit la noi / ce aflăm doar testând |
| [05-plan-test-constatator.md](05-plan-test-constatator.md) | planul de test: precondiții tehnice (pixel consent-gated, evenimente, CAPI), structura, 4 creative scrise, măsurare în DB, praguri de decizie |

## Concluzia în 5 rânduri

1. Politica Meta nu ne blochează (n-are categoria „documente guvernamentale"). Regulile noastre rămân.
2. Nimeni, nicăieri, nu vinde **documentul** la rece pe Meta; se vinde momentul (înființare, călătorie)
   sau frica (greșeală, întârziere). La constatator singurul moment e **deadline-ul** cerut de bancă/
   licitație/notar → unghiul principal.
3. Ce funcționează dovedit: retargeting, lookalike din clienți plătitori, preț clar într-un card, durată.
4. Merită o încercare **mică** (≤ €300 / 14 zile) pe constatator, cu pixel + CAPI făcute ca lumea înainte.
5. Nu pornim nimic până nu vedem verdictul ChatGPT Ads (zile), ca să nu amestecăm semnalele.

## Stare

| Data | Ce |
|---|---|
| 02.09 | Cercetare + plan. Nimic implementat, nimic pornit. **Decizie Raul: așteptăm verdictul ChatGPT Ads, apoi vedem.** Praguri CPA corectate la 15/25 lei (marjă reală ~40 lei brut după TVA + taxa ONRC). |
| 03.09 | **Decizie Raul: facem testul acum.** Cod pe site (pixel consent-gated, InitiateCheckout, Purchase cu eventID, Conversions API din webhook). Meta: portofoliul existent **EGhiseul** (id 1519640196092128) → pagina **facebook.com/eghiseul** (id 221060767754377, 61 urmăritori) adăugată; pagina curățată: bio nou („Serviciu privat… Nu suntem instituție."), categorie Legal service → **Business service**, poză de profil (logo nou), copertă nouă (fără „servicii publice"); dataset/pixel **eghiseul.ro web** = `2319629835442431` (în Vercel + .env.local); cont de reclame **eGhiseul.ro Ads** = `1562160259035101` (RON, Europe/Bucharest). Token Conversions API generat (Events Manager → direct integration), pus în Vercel `META_CAPI_ACCESS_TOKEN` + `.env.local` fără să treacă prin chat, validat cu `test_event_code` → 200. Dataset legat de contul de reclame (Connected assets). ⚠️ Deploy: push-urile cu docs la vârf au fost anulate de `ignoreCommand` (vezi memoria `vercel-ignore-command-multi-commit-push`) → pixelul a intrat live abia prin `vercel --prod` din CLI. ⚠️ Rămase: card pe contul de reclame (Raul), campania în Ads Manager (adsmanager.facebook.com nu e permis în extensia Chrome — de autorizat sau o introduce Raul după `05`), numele paginii „EGhiseul" → „eGhișeul.ro" (se schimbă doar din facebook.com — domeniu neautorizat în extensie), mesajul neprimit de 38 săpt. în Inbox. |
