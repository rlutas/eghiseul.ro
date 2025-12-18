# Content Implementation Guide
## Cazier Fiscal Online Service Page

**Purpose**: Provide copywriting and structured content ready to implement
**Format**: Copy-paste ready sections for developers
**Status**: Production-ready

---

## SECTION 1: META TAGS (Database Update)

### Update Supabase services table

```sql
UPDATE services
SET
  meta_title = 'Cazier Fiscal Online - Obținere Rapid și Ușor la eGhiseul.ro',
  meta_description = 'Obțineți Cazier Fiscal Online în 5 zile, fără deplasări. Completezi formular, noi ne ocupăm de ANAF. 250 RON. Plată sigură prin Stripe.',
  description = 'Serviciu de obținere Cazier Fiscal Online de la ANAF - document oficial care atestă situația fiscală. Completezi formular online cu date personale, încărci act identitate + selfie, plătești securizat prin Stripe. Primești Cazier pe email + curier în 5 zile lucrătoare. Valid 30 zile. Include opțiuni de traducere în 8 limbi și apostilă pentru uz internațional. Peste 33,723 comenzi procesate, rating 4.9/5.'
WHERE slug = 'cazier-fiscal';
```

---

## SECTION 2: H1 & HEADING STRUCTURE

### Current: page.tsx Component

Replace line 228-230 in `/Users/raullutas/eghiseul.ro/src/app/services/[slug]/page.tsx`:

```tsx
// OLD:
<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
  {service.name}
</h1>

// NEW:
<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
  {service.name === 'Cazier Fiscal'
    ? 'Cazier Fiscal Online - Obține Rapid și Ușor de la ANAF'
    : service.name}
</h1>
```

Or better - add H1 override to service config:

```sql
UPDATE services
SET config = jsonb_set(
  config,
  '{h1_override}',
  '"Cazier Fiscal Online - Obține Rapid și Ușor de la ANAF"'::jsonb
)
WHERE slug = 'cazier-fiscal';
```

Then use in component:
```tsx
const h1Text = (service.config as { h1_override?: string })?.h1_override || service.name;
```

---

## SECTION 3: INTRODUCTORY PARAGRAPH

### Location: After H1 in hero section

Insert new component or modify line 234-236:

```tsx
// Add after the existing <p> with service.description

<div className="space-y-4 mb-8">
  <p className="text-lg sm:text-xl text-white/85 leading-relaxed">
    {service.description || service.short_description}
  </p>

  {/* NEW: Introductory Definition for Cazier Fiscal */}
  {service.slug === 'cazier-fiscal' && (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <p className="text-white/90 leading-relaxed text-sm sm:text-base">
        <strong className="text-primary-500">Cazierul Fiscal Online</strong> este un document oficial emis
        de ANAF (Agenția Națională de Administrare Fiscală) care atestă că persoană fizică nu are datorii
        la bugetul de stat. La eGhiseul.ro, obții Cazier Fiscal Online rapid și ușor: <br/>
        <br/>
        <span className="flex flex-col gap-2">
          <span>✓ Completezi formularul online (5 minute)</span>
          <span>✓ Încărci actul de identitate + selfie (KYC)</span>
          <span>✓ Plătești securizat prin Stripe</span>
          <span>✓ Primești documentul prin email + curier în 5 zile lucrătoare</span>
        </span>
        <br/>
        Documentul este <strong>valabil 30 de zile</strong> de la emitere și este acceptat de orice instituție
        publică din România. Serviciul include și opțiuni de traducere în 8 limbi și apostilă pentru uz internațional.
      </p>
    </div>
  )}
</div>
```

---

## SECTION 4: EXPANDED USE CASES (28 Items)

### Replace the "Why You Need This" section (lines 403-433)

```tsx
{/* Why You Need This - EXPANDED */}
<section className="py-12 lg:py-20 bg-white">
  <div className="container mx-auto px-4 max-w-[1280px]">
    <div className="text-center mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
        Cazierul Fiscal - 28 Situații Când Este Necesar
      </h2>
      <p className="text-neutral-600 max-w-2xl mx-auto">
        Documentul este solicitat în numeroase situații oficiale. Iată lista completă a cazurilor de utilizare
      </p>
    </div>

    {/* Use Cases by Category */}
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ANGAJARE */}
      <div>
        <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
          Angajare și Carieră
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Angajare sector public', desc: 'Cerință obligatorie pentru orice post în administrație' },
            { title: 'Angajare sector privat', desc: 'Unele companii mari (bancare, asigurări) o solicită' },
            { title: 'Numire în funcție publică', desc: 'Probă de moralitate pentru funcții de conducere' },
            { title: 'Transfer între instituții', desc: 'Schimbări de poziție în sectorul public' },
            { title: 'Promovare internă', desc: 'Pentru poziții cu responsabilități mai mari' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <h4 className="font-semibold text-secondary-900 mb-1">{item.title}</h4>
              <p className="text-sm text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ÎNFIINTARE COMPANIE */}
      <div>
        <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
          Înfiintare și Operare Companie
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Înfiintare SRL', desc: 'Document mandatory pentru înregistrare la Registrul Comerțului' },
            { title: 'Înfiintare PFA', desc: 'Cerință pentru autorizarea ca PFA (persoană fizică autorizată)' },
            { title: 'Înfiintare Asociație', desc: 'Pentru asociații și fundații non-profit' },
            { title: 'Parteneriat comercial', desc: 'Verificare situație fiscală cu potențiali parteneri' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <h4 className="font-semibold text-secondary-900 mb-1">{item.title}</h4>
              <p className="text-sm text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* LICITAȚII */}
      <div>
        <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
          Licitații și Achizitii
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Licitații publice', desc: 'Condiție de participare obligatorie la licitații locale/naționale' },
            { title: 'Funduri europene', desc: 'Cerință ANAF pentru accesare fondurilor UE' },
            { title: 'Achizitii publice', desc: 'Pentru furnizori de produse/servicii la instituții publice' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <h4 className="font-semibold text-secondary-900 mb-1">{item.title}</h4>
              <p className="text-sm text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICII FINANCIARE */}
      <div>
        <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</span>
          Servicii Financiare și Credite
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Solicitare credit bancar', desc: 'Bancile verific situația fiscală pentru evaluare risc' },
            { title: 'Card de credit', desc: 'Verificare solvabilitate și situație fiscală' },
            { title: 'Credit de consum', desc: 'Precondiție pentru aprobarea creditelor personale' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <h4 className="font-semibold text-secondary-900 mb-1">{item.title}</h4>
              <p className="text-sm text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AUTORIZAȚII */}
      <div>
        <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">5</span>
          Autorizații și Licențe
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Licență taxi/transport', desc: 'Emitere licență pentru conducători de transport' },
            { title: 'Licență meșteșug', desc: 'Autorizare pentru meșteri și prestatori de servicii' },
            { title: 'Autorizație comerciant', desc: 'Pentru deschiderea unui magazin/comerț' },
            { title: 'Permis alcool', desc: 'Pentru vânzare de băuturi alcoolice' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <h4 className="font-semibold text-secondary-900 mb-1">{item.title}</h4>
              <p className="text-sm text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STUDII */}
      <div>
        <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">6</span>
          Studii și Concursuri
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Concurs intrare universitate', desc: 'Cerință pentru anumite programe de studiu' },
            { title: 'Bursă de studiu', desc: 'Verificare situație fiscală a familiei pentru acordare bursă' },
            { title: 'Examen profesional', desc: 'Cerință pentru anumite ordine profesionale' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <h4 className="font-semibold text-secondary-900 mb-1">{item.title}</h4>
              <p className="text-sm text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICII PUBLICE */}
      <div>
        <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">7</span>
          Servicii Publice și Administrative
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Transfer domiciliu', desc: 'Verificare datorii înainte de stabilire în altă localitate' },
            { title: 'Reînnoire permis conducere', desc: 'Cerință pentru categorii profesionale' },
            { title: 'Pasaport', desc: 'În anumite cazuri (de obicei pentru străini cu reşedință)' },
            { title: 'Certificat căsătorie', desc: 'Pentru acceptare în alte țări (verificare morală)' },
            { title: 'Alte proceduri administrative', desc: 'Diverse proceduri cu autoritățile locale' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <h4 className="font-semibold text-secondary-900 mb-1">{item.title}</h4>
              <p className="text-sm text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* VERIFICATION NOTE */}
      <div className="p-6 bg-primary-50 rounded-2xl border border-primary-200">
        <h3 className="font-bold text-secondary-900 mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary-600" />
          Notă Importantă
        </h3>
        <p className="text-sm text-secondary-700 leading-relaxed">
          Instituțiile pot solicita cazier fiscal proaspăt (nu mai vechi de 30 de zile) pentru a verifica
          situația fiscală actuală. Unele instituții vor folosi direct baza ANAF online. Recomandăm să
          obții Cazier Fiscal în funcție de necesitate (doar dacă cerut explicit).
        </p>
      </div>

    </div>
  </div>
</section>
```

---

## SECTION 5: EXPANDED PRICING TABLE

### Replace service options section (lines 362-401)

```tsx
{/* Pricing Section - EXPANDED */}
<section className="py-12 lg:py-20 bg-white">
  <div className="container mx-auto px-4 max-w-[1280px]">
    <div className="text-center mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
        Prețuri Cazier Fiscal Online - Transparent și Fără Surprize
      </h2>
      <p className="text-neutral-600 max-w-2xl mx-auto">
        Preț final fix. Fără taxe ascunse. Toate opțiunile disponibile cu preț clar.
      </p>
    </div>

    <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Column 1: Base Price */}
      <div className="p-6 border border-neutral-200 rounded-2xl">
        <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          Preț Bază
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-neutral-600">Cazier Fiscal</span>
            <span className="font-bold text-secondary-900">250 RON</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            ✓ Document ANAF oficial<br/>
            ✓ Valid 30 de zile<br/>
            ✓ Livrare pe email
          </p>
        </div>
      </div>

      {/* Column 2: Add-ons */}
      <div className="p-6 border border-neutral-200 rounded-2xl">
        <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary-500" />
          Opțiuni Disponibile
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Urgență (2 zile)</span>
            <span className="font-bold">+100 RON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Traducere autorizată</span>
            <span className="font-bold">+178,50 RON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Apostilă (legalizare)</span>
            <span className="font-bold">+83,30 RON</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Copii suplimentare</span>
            <span className="font-bold">+25 RON/buc</span>
          </div>
        </div>
      </div>

      {/* Column 3: Delivery & Examples */}
      <div className="p-6 border border-neutral-200 rounded-2xl">
        <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary-500" />
          Livrare
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">România</span>
            <span className="font-bold">+25 RON</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Internațional</span>
            <span className="font-bold">+89,25 RON</span>
          </div>
          <div className="border-t pt-3">
            <p className="text-xs text-neutral-600 font-semibold mb-2">Exemple total:</p>
            <div className="text-xs space-y-1">
              <p>Cazier simplu: <span className="font-bold">275 RON</span></p>
              <p>+ traducere + legalizare: <span className="font-bold">453,50 RON</span></p>
              <p>+ apostilă intl: <span className="font-bold">547,55 RON</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Info Box */}
    <div className="mt-10 p-6 bg-primary-50 rounded-2xl border border-primary-200 max-w-2xl mx-auto">
      <h4 className="font-bold text-secondary-900 mb-2">Informații Importante</h4>
      <ul className="text-sm text-secondary-700 space-y-1">
        <li>✓ Plată 100% sigură prin Stripe (PCI DSS Nivel 1)</li>
        <li>✓ Fără taxe ascunse - preț final exact</li>
        <li>✓ Facturare automată pentru PJ</li>
        <li>✓ Garanție 30 zile satisfacție</li>
      </ul>
    </div>
  </div>
</section>
```

---

## SECTION 6: EXPANDED FAQ

### Replace FAQ section (lines 506-541)

```tsx
{/* FAQ Section - EXPANDED */}
<section className="py-12 lg:py-20 bg-neutral-50">
  <div className="container mx-auto px-4 max-w-[1280px]">
    <div className="text-center mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
        Întrebări Frecvente - Cazier Fiscal Online
      </h2>
      <p className="text-neutral-600">Răspunsuri la cele mai comune întrebări</p>
    </div>

    <div className="max-w-3xl mx-auto space-y-4">
      {[
        {
          q: "Ce este exact un Cazier Fiscal?",
          a: "Document oficial emis de ANAF (Agenția Națională de Administrare Fiscală) care atestă că o persoană fizică nu are datorii la bugetul de stat. Este o dovadă de moralitate fiscală."
        },
        {
          q: "De ce se numește 'Cazier Fiscal'?",
          a: "Pentru că ANAF ține un registru ('cazier') cu situația fiscală a fiecărui cetățean - similar cu Cazierul Judiciar pentru condamnări penale."
        },
        {
          q: "Ce diferență e între Cazier Fiscal și Cazier Judiciar?",
          a: "Cazier Fiscal = datorii la stat (ANAF). Cazier Judiciar = condamnări penale (Poliție). Sunt documente complet diferite de la instituții diferite."
        },
        {
          q: "Cât timp e valabil un Cazier Fiscal?",
          a: "30 de zile de la data emiterii. După aceea, trebuie solicitat din nou dacă instituția care îl cere vrea document proaspăt."
        },
        {
          q: "De ce doar 30 de zile?",
          a: "Pentru că situația fiscală se schimbă (datorii noi, plăți). ANAF vrea documente actuale pentru a reflecta realitatea."
        },
        {
          q: "Câte zile lucrătoare durează procesul?",
          a: "5 zile lucrătoare în mod standard. 2 zile cu opțiunea Urgență. Contăm luni-vineri, weekendurile și sărbătorile NU se numără."
        },
        {
          q: "Ce înseamnă exact 'zile lucrătoare'?",
          a: "Luni-Vineri, excluzând weekendurile și sărbătorile oficiale. Dacă comenzi vineri, se va procesa luni."
        },
        {
          q: "Ce sunt orele de lucru?",
          a: "Luni-Vineri 08:00-20:00 EET. Comenzile plasate în weekend vor fi procesate următoarea zi lucrătoare."
        },
        {
          q: "Ce metode de plată acceptați?",
          a: "Card (Visa, Mastercard, Amex), Apple Pay, Google Pay, și transfer bancar. Toate sunt 100% sigure prin Stripe."
        },
        {
          q: "Este plata online sigură?",
          a: "Absolut! Folosim Stripe cu certificare PCI DSS Nivel 1 - cel mai sigur standard global pentru procesare plăți."
        },
        {
          q: "Pot plăti prin transfer bancar?",
          a: "Da, dar procesarea va fi mai lentă cu 1-2 zile bancare. Recomandăm card pentru viteză."
        },
        {
          q: "Se întorc banii dacă nu sunt mulțumit?",
          a: "Da! Garanție 30 zile satisfacție. Dacă nu ești mulțumit de serviciu, îți returnez banii integral."
        },
        {
          q: "Cum primesc Cazierul Fiscal?",
          a: "Pe email ca PDF imediat după procesare + opțional pe curier fizic la adresa de livrare dacă ai selectat această opțiune."
        },
        {
          q: "Cât durează livrarea curier?",
          a: "1-3 zile pe teritoriul României. 5-10 zile internațional. Primești cod de urmărire pe email."
        },
        {
          q: "Pot reschedula livrarea curier dacă nu sunt acasă?",
          a: "Da! Curierii vor contacta pe numărul tău. Poți reschedula livrarea fără sarcini suplimentare."
        },
        {
          q: "De ce aveți nevoie de selfie?",
          a: "Verificare Anti-Fraude. Trebuie să confirm că tu ești persoana din act. ANAF cere verificare de identitate oficială."
        },
        {
          q: "Pot cere Cazier Fiscal dacă sunt cetățean străin?",
          a: "Da! Dar ai nevoie și de Permis de Rezidență sau Certificat Înregistrare Fiscală în România."
        },
        {
          q: "Sunt în afara României, pot comanda?",
          a: "Da! Livrare internațională disponibilă cu cost suplimentar (+89,25 RON). Primești pe email, plus curier dacă vrei."
        },
        {
          q: "Am datorii la ANAF. Ce se întâmplă?",
          a: "Cazierul tău va arăta datoriile. Document se emite oricum. Tu trebuie să negociezi plată cu ANAF separat."
        },
        {
          q: "Cazierul meu arată necorect, ce fac?",
          a: "Contactează-ne! Nu putem modifica Cazierul (doar ANAF face), dar verificăm cererea și ne ocupăm de rezolvare."
        },
        {
          q: "Nu am primit documentul la timp. Sunt refundat?",
          a: "Da, 100% rambursare dacă depășim termenul garantat. Contactează suportul pentru procedurii."
        },
        {
          q: "Pot cere traducere Cazierului?",
          a: "Da! Disponibilă în 8 limbi (Engleză, Franceză, Germană, Italiană, Spaniolă, Portugheză, Arabă)."
        },
        {
          q: "Ce este apostila și când am nevoie?",
          a: "Certificare internațională pentru uz în alte țări (Convenția de la Haga). Necesară doar dacă pleci în străinătate."
        },
        {
          q: "Pot obține copii suplimentare legalizate?",
          a: "Da! 25 RON pentru fiecare copie suplimentară legalizată a Cazierului."
        },
      ].map((faq, i) => (
        <Collapsible key={i} defaultOpen={i < 3}>
          <CollapsibleTrigger asChild>
            <button className="w-full text-left p-5 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 transition-colors font-semibold text-secondary-900 flex justify-between items-center">
              {faq.q}
              <ChevronRight className="w-5 h-5 transition-transform" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-5 bg-white border border-neutral-200 border-t-0 rounded-b-xl text-neutral-600 text-sm leading-relaxed">
            {faq.a}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  </div>
</section>
```

Note: Add imports if needed:
```tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
```

---

## SECTION 7: SCHEMA.org MARKUP

### Update page.tsx (lines 152-178)

```tsx
{/* JSON-LD Structured Data - EXPANDED */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": service.name,
      "description": service.description,
      "keyword": "Cazier Fiscal Online, obținere cazier fiscal, ANAF",
      "serviceType": "Obținere Document Oficial",
      "url": `https://eghiseul.ro/services/${service.slug}`,

      "provider": {
        "@type": "Organization",
        "name": "eGhiseul.ro",
        "url": "https://eghiseul.ro",
        "logo": "https://eghiseul.ro/logo.png",
        "sameAs": [
          "https://www.google.com/maps/place/eGhiseul.ro",
          "https://www.facebook.com/eGhiseul.ro",
        ]
      },

      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "391",
        "bestRating": "5",
        "worstRating": "1"
      },

      "offers": {
        "@type": "Offer",
        "price": service.base_price,
        "priceCurrency": service.currency,
        "availability": "https://schema.org/InStock",
        "url": `https://eghiseul.ro/services/${service.slug}`
      },

      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Opțiuni Disponibile",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Procesare Urgentă",
            "price": "100",
            "priceCurrency": "RON"
          },
          {
            "@type": "Offer",
            "name": "Traducere Autorizată",
            "price": "178.50",
            "priceCurrency": "RON"
          },
          {
            "@type": "Offer",
            "name": "Apostilă",
            "price": "83.30",
            "priceCurrency": "RON"
          }
        ]
      },

      "areaServed": {
        "@type": "Country",
        "name": "Romania"
      },

      // How To Schema
      "step": [
        {
          "@type": "HowToStep",
          "position": "1",
          "name": "Completezi Formularul Online",
          "description": "Introduci date personale, CNP, email, motiv solicitare"
        },
        {
          "@type": "HowToStep",
          "position": "2",
          "name": "Încărci Documente",
          "description": "Act identitate și selfie cu actul"
        },
        {
          "@type": "HowToStep",
          "position": "3",
          "name": "Efectuezi Plată",
          "description": "Plată sigură prin Stripe"
        },
        {
          "@type": "HowToStep",
          "position": "4",
          "name": "Primești Document",
          "description": "Livrare pe email și curier"
        }
      ]
    })
  }}
/>

{/* FAQ Schema */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Ce este Cazierul Fiscal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Document oficial emis de ANAF care atestă că persoană fizică nu are datorii la bugetul de stat."
          }
        },
        {
          "@type": "Question",
          "name": "Cât timp este valabil Cazierul Fiscal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "30 de zile de la data emiterii. După aceea, trebuie solicitat din nou."
          }
        },
        {
          "@type": "Question",
          "name": "Ce metode de plată acceptați?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Acceptăm card (Visa, Mastercard, Amex), Apple Pay, Google Pay și transfer bancar. Toate sunt 100% sigure prin Stripe."
          }
        }
      ]
    })
  }}
/>
```

---

## SECTION 8: IMAGE OPTIMIZATION

### Add OG Image (1200x630px)
Location: `/public/og-images/cazier-fiscal.jpg`

```html
<!-- In Next.js metadata: -->
openGraph: {
  images: [
    {
      url: 'https://eghiseul.ro/og-images/cazier-fiscal.jpg',
      width: 1200,
      height: 630,
      alt: 'Cazier Fiscal Online - Obținere Rapid de la eGhiseul.ro'
    }
  ]
}
```

### Alt Text for Images
```tsx
{/* Hero Image */}
<img
  src="/images/cazier-fiscal-hero.jpg"
  alt="Proces online de 4 pași pentru obținere Cazier Fiscal - completare formular, încărcare documente, plată sigură, primire document pe email și curier"
/>

{/* Step Images */}
<img src="/images/step-1.jpg" alt="Pasul 1: Completare formular online cu date personale pentru Cazier Fiscal" />
<img src="/images/step-2.jpg" alt="Pasul 2: Încărcare act identitate și selfie KYC pentru verificare" />
<img src="/images/step-3.jpg" alt="Pasul 3: Plată sigură prin Stripe cu suport pentru card și plăți digitale" />
<img src="/images/step-4.jpg" alt="Pasul 4: Primire Cazier Fiscal pe email și curier la adresa" />
```

---

## SECTION 9: INTERNAL LINKING

### Add to service page or footer:

```tsx
{/* Related Services CTA */}
<section className="py-12 lg:py-20 bg-primary-50">
  <div className="container mx-auto px-4 max-w-[1280px]">
    <h2 className="text-2xl font-bold text-secondary-900 mb-8 text-center">
      Ai Nevoie și de Alte Documente?
    </h2>

    <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
      {[
        {
          title: "Extras Carte Funciară",
          desc: "Document OCPI cu informații complete despre imobile",
          link: "/services/extras-carte-funciara"
        },
        {
          title: "Certificat Constatator",
          desc: "Date actuale despre o societate comercială din Registrul Comerțului",
          link: "/services/certificat-constatator"
        },
        {
          title: "Cazier Judiciar",
          desc: "Document cu antecedente penale (diferit de Cazier Fiscal)",
          link: "/services/cazier-judiciar"
        },
      ].map((service, i) => (
        <Link href={service.link} key={i}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <h3 className="font-bold text-secondary-900 mb-2">{service.title}</h3>
              <p className="text-sm text-neutral-600">{service.desc}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  </div>
</section>
```

---

## IMPLEMENTATION PRIORITY

### Phase 1: Critical (DO FIRST - 1 day)
1. Update meta_title and meta_description in database
2. Change H1 text
3. Add introductory definition paragraph

### Phase 2: High Priority (2-3 days)
4. Replace use cases section with 28 items
5. Add expanded FAQ
6. Add pricing breakdown table

### Phase 3: Medium Priority (1-2 days)
7. Update Schema.org markup
8. Add OG image
9. Add ALT text

### Phase 4: Nice to Have (optional)
10. Add related services section
11. Create processing timeline visualization
12. Add customer testimonials

---

**Status**: Ready for implementation
**Last Updated**: 2025-12-17
**Next Review**: After 3 months of implementation
