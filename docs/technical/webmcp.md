# WebMCP pe eGhișeul.ro — cum funcționează, status, verdict

> **TL;DR onest (iunie 2026):** WebMCP e real și bine specificat tehnic, dar **early-stage, doar Chromium, Apple/WebKit se OPUN formal, zero agenți mainstream care îl consumă, zero trafic azi.** Pentru noi: **niciun beneficiu SEO/trafic acum**, doar un pariu ieftin pe viitor. **Ținem versiunea minimală feature-detected (deja implementată), nu investim mai mult, reevaluăm ~mijloc 2027.** Bugetul de „vizibilitate AI" merge în **GEO** (content structurat, schema, llms.txt), nu aici.

---

## Ce este WebMCP

Permite unei pagini web să înregistreze **tools** tipizate, apelabile, pe care un agent AI din browser le poate invoca direct — în loc să „citească" DOM-ul și să simuleze click-uri. Pagina devine practic un **„server MCP în pagină"**.

Reutilizează **primitiva `tools` din MCP** (Model Context Protocol, Anthropic) — `name/description/inputSchema/content-results` — dar e un **API web nativ distinct**, nu MCP pe sârmă. Browserul traduce tool-urile WebMCP în format MCP pentru agentul conectat.

**Distincție crucială (pentru SEO):**
- **WebMCP = ACȚIUNI** (agentul *face* ceva pe pagină prin tool-uri).
- **GEO / AI Overviews / llms.txt = EXTRAGERE & CITARE** (a fi *citit/citat* în răspunsuri AI). Pipeline complet separat. **WebMCP nu ajută la apariția în răspunsurile AI.**

## API-ul (forma curentă, verificată pe spec)

```javascript
const controller = new AbortController();
await document.modelContext.registerTool({   // namespace neașezat: și navigator.modelContext apare
  name: 'add-todo',
  description: 'Add a new item to the todo list',
  inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  annotations: { readOnlyHint: true },        // pt calculatoare: readOnly
  async execute({ text }) {
    return { content: [{ type: 'text', text: `Added: ${text}` }] };
  },
}, { signal: controller.signal });            // dezînregistrare: controller.abort()
```

- Dezînregistrare = **AbortSignal** (NU un handle cu `.unregister()`). Mai există `unregisterTool(name)` și `provideContext({tools:[...]})` (înlocuiește atomic tot setul). API-ul e în schimbare.
- **Permissions Policy `"tools"`**, default `['self']`; `[SecureContext]` → doar HTTPS.
- **API declarativ HTML** (fără JS): adnotezi un `<form>` cu `toolname`/`tooldescription` + inputs cu `toolparamdescription`; browserul sintetizează schema; `SubmitEvent.respondWith()` întoarce rezultat fără navigare.

## Status & cine e în spate

- **Repo:** github.com/webmachinelearning/webmcp — W3C **Web ML Community Group**. Spec: webmachinelearning.github.io/webmcp/
- **Status:** doar **W3C Community Group Draft Report** — *„not a W3C Standard nor on the Standards Track"* (publicat 13 aug 2025). TAG review OPEN, netriajat; secțiunile Security/Privacy nebifate.
- **Susținători: Google + Microsoft** (editori de la Chrome + Edge). Două motoare din trei.
- **Apple/WebKit se OPUN formal** (issue #670): un agent ar trebui să opereze site-ul „ca userul", fără ca site-ul să-l identifice. Apple propune un workshop W3C la TPAC 2026.
- **Mozilla: sceptic, înclină spre „neutral"** — vrea dovezi, semnalează risc de prompt-injection, nume înșelător.

## Cum îl consumă cineva azi (realitatea)

- **Doar extensia Chrome „Model Context Tool Inspector".** Pui propria cheie Google AI Studio → Gemini alege/completează/apelează tool-ul tău.
- **„Gemini in Chrome" NU apelează încă tool-uri WebMCP pe site-uri live** — „coming soon".
- Niciun agent mainstream (ChatGPT Operator, Claude, Perplexity) nu apelează `modelContext` pe site-uri live; folosesc tot DOM scraping.
- **Zero adopție în teren:** un dev a scanat 111.076 site-uri top → **0** cu WebMCP shipping.

## Implementarea noastră

- `src/components/calculators/webmcp-tools.tsx` — expune 4 calculatoare ca tools: `calculeaza_tva`, `calculeaza_dividende`, `calculeaza_rata_credit`, `calculeaza_procent`.
- **Feature-detected** (`document.modelContext || navigator.modelContext`): no-op pe ~99% din browsere → zero risc, zero impact pe useri.
- Dezînregistrare prin `AbortController` (forma corectă din spec). `annotations: { readOnlyHint: true }` (onest pentru calculatoare).
- Montat o dată în `CalculatorLayout` → activ pe toate paginile de calculator.

## Cum să-l vezi funcționând (5 pași)

1. **Chrome 149+** (sau Canary). `chrome://flags/#enable-webmcp-testing` → **Enabled** → relaunch.
2. Instalează extensia **„Model Context Tool Inspector"** (Chrome Web Store sau repo GoogleChromeLabs/webmcp-tools).
3. Deschide o pagină de calculator (ex. `/calculator/tva/`). Inspector-ul ar trebui să listeze tool-urile noastre (`calculeaza_tva` etc.).
4. **Test manual:** alege `calculeaza_tva`, pune args JSON `{"suma":1000,"cota":21}`, **Execute Tool** → vezi rezultatul.
5. **Test cu agent:** pune cheia ta Google AI Studio în extensie, scrie „Cât e TVA-ul la 1000 de lei?" → Gemini selectează tool-ul, completează args, arată apelul + rezultatul.

## Verdict & ce facem

- **Ținem versiunea minimală** (cost ~0, progressive enhancement, ne ține spec-aware). **Nu investim mai mult acum.**
- **Niciun beneficiu de trafic/SEO/discovery în 2026** — nu există mecanism de descoperire pre-vizită, niciun semnal de ranking, niciun agent consumator. Pentru un calculator, valoarea de execuție e oricum marginală (agentul poate face aritmetica singur).
- **Reevaluăm ~Chrome 157 / mijloc 2027**, sau mai devreme dacă Gemini-in-Chrome anunță consum live de `modelContext`.
- **Pentru vizibilitate AI reală AZI → GEO**: content structurat, schema (avem), llms.txt (avem), citabilitate — afectează AI Overviews/ChatGPT/Perplexity acum.

## Surse
- Chrome docs: https://developer.chrome.com/docs/ai/webmcp · Securitate: https://developer.chrome.com/docs/ai/webmcp/secure-tools
- Spec/repo: https://github.com/webmachinelearning/webmcp · https://webmachinelearning.github.io/webmcp/
- Apple oppose: https://github.com/WebKit/standards-positions/issues/670 · Mozilla: https://github.com/mozilla/standards-positions/issues/1412
- Adopție zero (field report): https://www.freecodecamp.org/news/a-developers-guide-to-webmcp/
- Demos + inspector: https://github.com/GoogleChromeLabs/webmcp-tools

**Ultima verificare:** iunie 2026.
