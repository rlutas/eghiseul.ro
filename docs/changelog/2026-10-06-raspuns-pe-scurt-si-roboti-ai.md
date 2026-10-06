# 06.10.2026 — „Pe scurt” pe paginile de vânzare și acces pentru toți roboții AI
<!-- categorie: seo -->

## Pentru echipă

- Pe 7 pagini de serviciu eGhiseul (cazier judiciar, cazier fiscal, extras de carte funciară, certificat constatator, certificat de naștere, certificat de celibat, extras multilingv) apare acum, imediat sub prima secțiune, o casetă „Pe scurt”: cine eliberează documentul, ce facem noi, prețul, termenul și data ultimei actualizări.
- Pe documentero, casetele „Pe scurt” de la celibat, naștere, căsătorie și extras multilingv spun acum și prețul.
- Motivul: ChatGPT, Copilot, Gemini și Google citează exact astfel de răspunsuri scurte. Cifrele (preț, termen) vin din aceeași sursă ca restul paginii, deci nu pot ieși diferit.
- Toți roboții de inteligență artificială pot citi site-urile; asistenții (ChatGPT, Claude, Perplexity) pot deschide și primul pas al formularului de comandă, ca să trimită clientul direct acolo. Plata, statusul și pagina de confirmare rămân închise.

---

- `src/components/services/service-answer-block.tsx` (new): „Pe scurt” card with facts + visible „Actualizat la <dată>” (`<time>`), fed by each page's `DATE_MODIFIED`, the same constant as `dateModified` in JSON-LD. Text written per service (max 5-word-shingle Jaccard between the 11 answer blocks: 0.215).
- eghiseul pages: price from `service.base_price`, term from `formatEstimatedDays(service)` (constatator: „câteva minute, 24/7”, cazier judiciar: 198/278 lei, 3-5 / 1-2 zile as in the page table). `DATE_MODIFIED` → 2026-10-06 on the 6 pages that were older.
- documentero `QuickAnswer` on 4 pages: price sentence via `getServicePricing`; `DATE_MODIFIED` → 2026-10-06.
- robots: `src/lib/seo/ai-bots.ts` lists AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, Claude-Web, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, meta-externalagent, Amazonbot, DuckAssistBot, cohere-ai) and assistant fetchers (ChatGPT-User, Claude-User, Perplexity-User, MistralAI-User). eghiseul `src/app/robots.ts` and documentero `robots.txt/route.ts` emit explicit groups; fetchers get `/comanda/` minus `/comanda/checkout/`, `/comanda/success/`, `/comanda/status/`.
- Note: `/comanda/<serviciu>/` currently renders `<meta name="robots" content="index, follow">` (prod too); crawlers are still kept out by `Disallow: /comanda/`.
