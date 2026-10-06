import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/home/footer';
import { MobileStickyCTA } from '@/components/services/mobile-sticky-cta';
import { ServiceAnswerBlock } from '@/components/services/service-answer-block';
import { PrivateServiceNotice } from '@/components/services/private-service-notice';
import { ServiceFAQ, type FAQ } from '@/components/services/service-faq';
import { ReviewsSection } from '@/components/services/reviews-section';
import { GoogleReviewsBadge } from '@/components/services/google-reviews-badge';
import { buildPageMetadata, buildServicePageGraph, BASE_URL } from '@/lib/seo';
import { SITE_AUTHOR } from '@/lib/seo/author';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  User,
  Building2,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  ChevronRight,
  Phone,
  Mail,
  Scale,
  FileText,
  CreditCard,
  Truck,
  Award,
  Globe,
  Briefcase,
  GraduationCap,
  Heart,
  Plane,
  Gavel,
  MapPin,
  Bell,
  Languages,
} from 'lucide-react';

// =============================================================================
// METADATA + SCHEMA
// =============================================================================

const PAGE_PATH = '/servicii/cazier-judiciar-online/';
// Root layout appends „ | eGhiseul.ro", so keep this under ~50 characters.
const TITLE = 'Cazier Judiciar Online: 198 lei, 3-5 Zile';
const DESCRIPTION =
  'Poliția eliberează cazierul, noi îl obținem prin avocat. Persoane fizice, firme, străini. ' +
  'Scan pe email, originalul prin curier, și în diaspora.';

const DATE_PUBLISHED = '2026-04-16';
const DATE_MODIFIED = '2026-10-06';
const DATE_MODIFIED_DISPLAY = '6 octombrie 2026';

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PAGE_PATH,
  ogImage: '/og/services/cazier-judiciar.png',
});

const jsonLdGraph = buildServicePageGraph({
  slug: 'cazier-judiciar-online',
  name: 'Cazier Judiciar Online',
  description:
    'Serviciu privat de obținere a certificatului de cazier judiciar pentru persoane fizice, ' +
    'firme și cetățeni străini. Certificatul îl eliberează Poliția Română (Legea 290/2004); ' +
    'cererea o depune un avocat, pe bază de împuternicire avocațială. Scan pe email, original prin curier.',
  serviceType: 'Document Processing — Legal',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  breadcrumb: [
    { name: 'Acasă', url: `${BASE_URL}/` },
    { name: 'Servicii', url: `${BASE_URL}/servicii/` },
    { name: 'Cazier Judiciar Online', url: `${BASE_URL}${PAGE_PATH}` },
  ],
  offers: [
    {
      name: 'Cazier Judiciar — Persoană Fizică (Standard 3-5 zile)',
      price: 198,
      url: `${BASE_URL}/servicii/cazier-judiciar-online/persoana-fizica/`,
    },
    {
      name: 'Cazier Judiciar — Persoană Fizică (Urgent 1-2 zile)',
      price: 278,
      url: `${BASE_URL}/servicii/cazier-judiciar-online/persoana-fizica/`,
    },
    {
      name: 'Cazier Judiciar — Persoană Juridică (Standard 3-5 zile)',
      price: 198,
      url: `${BASE_URL}/servicii/cazier-judiciar-online/persoana-juridica/`,
    },
    {
      name: 'Cazier Judiciar — Persoană Juridică (Urgent 1-2 zile)',
      price: 278,
      url: `${BASE_URL}/servicii/cazier-judiciar-online/persoana-juridica/`,
    },
  ],
});

// =============================================================================
// CÂND ȚI SE CERE — doar situații în care cazierul e cerut efectiv
// (scoase 06.10.2026: renunțare la cetățenie, repatriere, custodie la divorț,
// acreditări ANAF/ANRE/ANCOM, Erasmus — nesusținute)
// =============================================================================

const USE_CASE_CATEGORIES = [
  {
    icon: Briefcase,
    title: 'Angajare',
    iconBg: 'bg-gradient-to-br from-primary-100 to-primary-200',
    iconColor: 'text-primary-600',
    borderHover: 'hover:border-primary-300',
    cases: [
      'Concurs pentru o funcție publică sau un post în instituții (MAI, justiție, administrație)',
      'Posturi cu acces la informații clasificate',
      'Agent de pază (atestatul cere lipsa anumitor condamnări)',
      'Angajatori privați care îl cer prin fișa postului: bănci, curierat, transport de valori',
    ],
  },
  {
    icon: Plane,
    title: 'Vize și rezidență în afara UE',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderHover: 'hover:border-blue-300',
    cases: [
      'Viză de imigrant sau rezidență permanentă: SUA, Canada, Australia, Noua Zeelandă',
      'Anumite vize de muncă, mai ales pentru posturi în sănătate și educație',
      'Reîntregirea familiei, unde statul gazdă cere cazierul tuturor adulților',
    ],
  },
  {
    icon: Heart,
    title: 'Familie și copii',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    borderHover: 'hover:border-rose-300',
    cases: [
      'Adopție, în dosarul de la DGASPC',
      'Asistent maternal profesionist',
      'Tutelă sau curatelă pentru un minor',
      'Orice post cu copii: aici se cere, de regulă, și certificatul de integritate',
    ],
  },
  {
    icon: Shield,
    title: 'Permise și autorizații',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderHover: 'hover:border-purple-300',
    cases: [
      'Permis de armă (vânătoare, apărare)',
      'Licență de detectiv particular',
      'Manager de transport (onorabilitatea se dovedește cu cazierul)',
    ],
  },
  {
    icon: GraduationCap,
    title: 'Profesii cu colegiu sau barou',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    borderHover: 'hover:border-teal-300',
    cases: [
      'Înscriere în Colegiul Medicilor, al Medicilor Dentiști, al Farmaciștilor',
      'Înscriere în barou, la notari sau la executori judecătorești',
      'Echivalarea diplomei și dreptul de practică într-un alt stat',
    ],
  },
  {
    icon: Building2,
    title: 'Firme',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    borderHover: 'hover:border-green-300',
    cases: [
      'Licitații publice: se cer cazierul firmei și al celor din conducerea ei',
      'Proiecte cu fonduri europene, la depunere sau la contractare',
      'Contracte cu clienți mari, unde e condiție de eligibilitate',
    ],
  },
];

// =============================================================================
// FAQ — fiecare întrebare apare doar aici (setul repetat pe 18 pagini a ieșit)
// ⚠️ ServiceFAQ randează `a` ca text simplu: fără HTML în răspunsuri.
// =============================================================================

const FAQ_ITEMS: FAQ[] = [
  {
    category: 'procesare',
    q: 'În câte zile primesc cazierul judiciar comandat online?',
    a: 'În 3-5 zile lucrătoare de la plată, sau 1-2 zile cu procesare urgentă (+80 lei). Pentru cetățenii străini termenul e de 7-15 zile lucrătoare, pentru că poliția face verificări suplimentare, și urgența nu se poate adăuga. Scanul îl trimitem pe email în ziua în care avocatul ridică certificatul; originalul pleacă prin curier, dacă l-ai ales.',
  },
  {
    category: 'procesare',
    q: 'Cine depune cererea la poliție, dacă eu nu merg?',
    a: 'Un avocat din Baroul Satu Mare, cu care lucrăm. După plată se generează împuternicirea avocațială și contractul de asistență juridică, pe care le semnezi în formular. Avocatul depune cererea la ghișeul de cazier al poliției și ridică certificatul. Noi nu suntem instituție și nu emitem nimic: certificatul îl eliberează poliția, exact ca atunci când mergi personal.',
  },
  {
    category: 'documente',
    q: 'Ce încarc în formular?',
    a: 'Actul de identitate (față și verso, sau pașaportul), un selfie în care ții actul în mână și semnătura, pe care o desenezi pe ecran. Pentru persoane fizice se cer și prenumele părinților, pentru că apar în cerere. Actul expirat nu e acceptat. Pentru firmă: CUI-ul, din care datele vin direct de la ANAF, și datele reprezentantului legal.',
  },
  {
    category: 'utilizare',
    q: 'Cât timp e valabil certificatul de cazier judiciar?',
    a: 'Șase luni de la data eliberării, conform Legii 290/2004. Instituția care ți-l cere poate fi mai strictă: unele ambasade sau angajatori acceptă doar certificate de cel mult 30 sau 90 de zile, așa că întreabă înainte. Dacă îl comanzi prin noi, primești un email de reamintire înainte să expire.',
  },
  {
    category: 'utilizare',
    q: 'Primesc certificatul pe email sau pe hârtie?',
    a: 'Certificatul eliberat la ghișeu e pe hârtie. Îți trimitem pe email scanul lui, de obicei suficient ca să vezi rezultatul și să-l arăți informal. Dacă instituția cere originalul, alege livrarea prin curier: Fan Courier sau Sameday în țară, Poșta Română (100 lei) sau DHL (250 lei) în străinătate.',
  },
  {
    category: 'utilizare',
    q: 'Ce apare și ce nu apare pe cazierul judiciar?',
    a: 'Apar doar condamnările din hotărâri judecătorești definitive. Nu apar dosarele penale aflate încă în anchetă sau în judecată, amenzile contravenționale (cele de la poliția rutieră, de exemplu) și condamnările scoase din evidență prin reabilitare, amnistie sau dezincriminare. Dacă nu ai nimic înscris, certificatul spune că nu figurezi în cazierul judiciar.',
  },
  {
    category: 'altele',
    q: 'După cât timp dispare o condamnare de pe cazier?',
    a: 'După reabilitare. Pentru amendă penală, închisoare de cel mult 2 ani sau pedeapsă cu suspendare sub supraveghere, reabilitarea vine de drept, dacă în 3 ani nu ai comis altă infracțiune (Codul penal, art. 165). Pentru pedepse mai mari se cere instanței, după 4, 5, 7 sau 10 ani, în funcție de mărimea pedepsei (art. 166). Termenele curg de la executarea pedepsei, nu de la condamnare.',
  },
  {
    category: 'strainatate',
    q: 'Locuiesc în străinătate. Ce variante am?',
    a: 'Poți cere cazierul la consulatul României din țara în care stai. Termenul și eventualele taxe diferă de la un consulat la altul, așa că întreabă-i direct. A doua variantă e o persoană din țară care îl ridică pentru tine, cu procură. Prin noi plătești 198 lei și nu mergi nicăieri, iar originalul îți vine prin curier internațional. Apostila și traducerea se fac în aceeași comandă, dacă le bifezi.',
  },
  {
    category: 'strainatate',
    q: 'Îmi trebuie apostilă Haga sau supralegalizare?',
    a: 'Apostila de la Haga, dacă țara în care îl folosești a semnat Convenția de la Haga: toate statele UE, SUA, Marea Britanie, Canada, Australia și multe altele. Pentru statele care nu au semnat-o se face supralegalizare, prin ministerul de externe și ambasada statului respectiv; pe aceasta nu o facem. Apostila Haga costă 198 lei la noi și adaugă 3 zile lucrătoare.',
  },
  {
    category: 'pret',
    q: 'De ce plătesc 198 lei dacă la poliție e gratuit?',
    a: 'Pentru că nu plătești certificatul, plătești drumul. Taxa de eliberare și timbrul fiscal au fost eliminate la 1 februarie 2017, iar la ghișeu primești certificatul gratuit, de regulă pe loc. Cei 198 de lei, cu TVA, acoperă avocatul care depune și ridică actul, verificarea dosarului, scanul pe email și factura. Dacă poți merge la ghișeu, mergi: e mai ieftin și mai rapid.',
  },
  {
    category: 'pret',
    q: 'Pot renunța la comandă după ce am plătit?',
    a: 'În primele 30 de minute anulezi singur, din pagina de status a comenzii, și primești înapoi 70% din sumă. După aceea, avocatul a primit deja împuternicirea și cererea e în lucru; scrie-ne și vedem caz cu caz ce se mai poate opri.',
  },
  {
    category: 'altele',
    q: 'Am PFA. Iau cazier de persoană fizică sau de firmă?',
    a: 'De persoană fizică. PFA, întreprinderea individuală și cea familială nu sunt persoane juridice, iar cazierul se eliberează pe titular. Formularul de firmă recunoaște forma juridică din CUI și te trimite pe fluxul corect. Cazierul de firmă există doar pentru SRL, SA, ONG și celelalte persoane juridice.',
  },
  {
    category: 'altele',
    q: 'Pot comanda cazierul pentru altcineva?',
    a: 'Doar dacă persoana respectivă completează formularul: ea încarcă actul de identitate și selfie-ul și semnează împuternicirea pentru avocat. Plata și facturarea pot fi pe numele tău sau pe firma ta. Fără semnătura titularului, cererea nu poate fi depusă.',
  },
];

// =============================================================================
// PAGE
// =============================================================================

const linkClass =
  'text-primary-600 font-semibold underline underline-offset-2 hover:text-primary-700';

export default function CazierJudiciarHubPage() {
  return (
    <>
      {/* JSON-LD @graph (Organization + WebSite + BreadcrumbList + Service + Offers) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />

      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px] pb-24 lg:pb-0">
        {/* ──────────────── HERO ──────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-16 lg:pb-24">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4 max-w-[1280px]">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-8" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/servicii/" className="hover:text-primary-500 transition-colors">Servicii</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">Cazier Judiciar Online</span>
            </nav>

            <div className="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 lg:gap-12">
              {/* Left: content */}
              <div className="flex-1 max-w-[700px]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary-500 text-secondary-900 font-bold px-3 py-1">
                    <Scale className="h-3.5 w-3.5 mr-1" />
                    {/* NU „Serviciu Juridic Oficial" — „oficial" despre serviciu (nu despre
                        document) declanșează politica Google Ads „Documente guvernamentale
                        și servicii oficiale" (vezi memoria google-ads-documente-oficiale). */}
                    Asistență prin avocat în barou
                  </Badge>
                  <Badge className="bg-green-600 text-white font-bold px-3 py-1">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    3-5 zile (1-2 urgent)
                  </Badge>
                  <Badge variant="outline" className="text-white/80 border-white/30 px-3 py-1">
                    <Award className="h-3.5 w-3.5 mr-1" />
                    Eliberat de Poliția Română
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
                  Cazier Judiciar{' '}
                  <span className="block text-primary-500">Online</span>
                </h1>

                <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                  Certificatul de cazier judiciar îl eliberează <strong className="text-primary-500">Poliția Română</strong>.
                  Noi îl obținem în locul tău: un avocat depune cererea pe bază de împuternicire și ridică actul,
                  iar tu îl primești <strong>în 3-5 zile lucrătoare</strong>, fără să mergi la ghișeu.
                  Pentru <strong>persoane fizice, firme și cetățeni străini</strong>.
                </p>

                {/* USP — diaspora */}
                <div className="flex items-start gap-3 rounded-xl bg-primary-500/15 border border-primary-500/40 p-4 mb-6">
                  <Globe className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                    Ești în <strong className="text-primary-500">străinătate</strong>? Nu ai nevoie de consulat
                    sau de o rudă cu procură. Originalul îl trimitem prin curier internațional, cu apostila și
                    traducerea făcute în aceeași comandă.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <strong className="text-primary-500">Ce faci tu</strong> durează cam 10 minute:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-white/85 text-sm">
                    {[
                      'Alegi: persoană fizică sau firmă',
                      'Încarci actul de identitate și un selfie cu el',
                      'Semnezi pe ecran împuternicirea pentru avocat',
                      'Plătești 198 lei, cu TVA (card, Apple Pay, Google Pay sau transfer)',
                    ].map((step) => (
                      <li key={step} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: price card */}
              <div className="lg:w-[360px] flex-shrink-0 lg:self-center">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
                  <div className="relative bg-gradient-to-br from-secondary-900 via-secondary-800 to-[#0C1A2F] p-6 text-center">
                    <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-3">
                      PREȚ FINAL
                    </span>
                    <div className="flex items-baseline justify-center gap-1">
                      {/* 198 RON cu TVA ÷ 1,21 = 163,64 RON fără TVA */}
                      <span className="text-5xl lg:text-6xl font-black text-white">163,64</span>
                      <span className="text-xl font-bold text-white/70">RON</span>
                    </div>
                    <p className="text-white/70 text-sm mt-2">
                      + TVA 21% · <span className="font-semibold text-white">198 RON</span> cu TVA
                    </p>
                    <p className="text-white/50 text-xs mt-1">Persoană fizică sau firmă, același preț</p>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">3-5 zile lucrătoare</p>
                        <p className="text-xs text-neutral-500">1-2 zile cu urgență, +80 lei</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm">Scan pe email, original prin curier</p>
                        <p className="text-xs text-neutral-500">Curierul se alege separat, în țară sau în străinătate</p>
                      </div>
                    </div>

                    <a
                      href="#alege-tip"
                      className="flex items-center justify-center gap-2 w-full mt-4 px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    >
                      Alege tipul și comandă
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    <GoogleReviewsBadge variant="bar" className="mt-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServiceAnswerBlock
          updated={DATE_MODIFIED}
          facts={[
            { label: 'Cine îl eliberează', value: 'Poliția Română (IPJ / DCPI)' },
            { label: 'Preț', value: '198 lei cu TVA; urgent 278 lei' },
            { label: 'Termen', value: '3-5 zile lucrătoare; urgent 1-2' },
            { label: 'Primești', value: 'Scan pe email, originalul prin curier' },
          ]}
        >
          Certificatul de cazier judiciar îl eliberează Poliția Română, gratuit la ghișeu sau online pe hub.mai.gov.ro.
          Dacă nu poți merge, îl obținem noi: un avocat depune cererea pe bază de împuternicire avocațială, pentru
          persoane fizice, firme și cetățeni străini, inclusiv când stai în străinătate. Certificatul e valabil 6 luni de
          la eliberare.
        </ServiceAnswerBlock>

        <PrivateServiceNotice
          institutionLabel="gratuit, la ghișeul IPJ sau online pe hub.mai.gov.ro"
          institutionUrl="https://hub.mai.gov.ro"
        />

        {/* ──────────────── ALEGE TIPUL DE CAZIER ──────────────── */}
        <section id="alege-tip" className="py-12 lg:py-20 bg-white scroll-mt-24">
          <div className="container mx-auto px-4 max-w-[1000px]">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cazier judiciar pentru persoană fizică sau juridică
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                Sunt două certificate diferite: cazierul firmei nu spune nimic despre administrator,
                iar al tău nu spune nimic despre firmă. Ambele costă 198 lei.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              <Link href="/comanda/cazier-judiciar-persoana-fizica/" className="group">
                <Card className="h-full border-2 border-neutral-200 hover:border-primary-500 transition-all hover:shadow-xl cursor-pointer">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex flex-col h-full">
                      <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary-500 group-hover:scale-110 transition-all">
                        <User className="w-8 h-8 text-primary-600 group-hover:text-secondary-900" />
                      </div>
                      <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-3">
                        Persoană fizică
                      </h3>
                      <p className="text-neutral-600 mb-5 flex-1">
                        Cazierul tău, pe CNP. Tot aici intră titularii de PFA, întreprindere individuală
                        sau familială, care nu au cazier separat de firmă.
                      </p>
                      <div className="space-y-2 mb-6">
                        {[
                          'Buletin, carte de identitate sau pașaport, neexpirate',
                          'Selfie cu actul în mână',
                          'Cetățeni străini: +100 lei, 7-15 zile',
                          'Certificat de integritate în aceeași comandă: +100 lei',
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-5 border-t border-neutral-200">
                        <div>
                          <span className="text-3xl font-black text-secondary-900">198</span>
                          <span className="text-lg font-bold text-neutral-500 ml-1">RON</span>
                          <p className="text-xs text-neutral-500">TVA inclus</p>
                        </div>
                        <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:text-primary-700">
                          Comandă
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/comanda/cazier-judiciar-persoana-juridica/" className="group">
                <Card className="h-full border-2 border-neutral-200 hover:border-primary-500 transition-all hover:shadow-xl cursor-pointer">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex flex-col h-full">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary-500 group-hover:scale-110 transition-all">
                        <Building2 className="w-8 h-8 text-blue-600 group-hover:text-secondary-900" />
                      </div>
                      <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mb-3">
                        Persoană juridică (firmă)
                      </h3>
                      <p className="text-neutral-600 mb-5 flex-1">
                        Cazierul societății, pe CUI: SRL, SA, ONG, cooperativă. Îl cer de regulă licitațiile
                        publice și proiectele cu fonduri europene.
                      </p>
                      <div className="space-y-2 mb-6">
                        {[
                          'Datele firmei vin din CUI, direct de la ANAF',
                          'Actul de identitate al reprezentantului legal',
                          'Firmele radiate sau dizolvate nu pot comanda',
                          'PFA, II și IF sunt trimise pe fluxul de persoană fizică',
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-5 border-t border-neutral-200">
                        <div>
                          <span className="text-3xl font-black text-secondary-900">198</span>
                          <span className="text-lg font-bold text-neutral-500 ml-1">RON</span>
                          <p className="text-xs text-neutral-500">TVA inclus</p>
                        </div>
                        <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:text-primary-700">
                          Comandă
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-600">
              Detalii pe fiecare variantă:{' '}
              <Link href="/servicii/cazier-judiciar-online/persoana-fizica/" className={linkClass}>
                cazier judiciar pentru persoană fizică
              </Link>{' '}
              și{' '}
              <Link href="/servicii/cazier-judiciar-online/persoana-juridica/" className={linkClass}>
                cazier judiciar pentru firmă
              </Link>
              .
            </p>

            <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200 flex items-center justify-center gap-4">
              <Zap className="w-6 h-6 text-primary-600 flex-shrink-0" />
              <p className="text-secondary-900">
                <strong>Procesare urgentă:</strong> 1-2 zile lucrătoare, cu +80 lei
                (total <strong>278 lei</strong>). Se poate adăuga și după plată. Nu există pentru cetățenii străini.
              </p>
            </div>
          </div>
        </section>

        {/* ──────────────── CE ESTE + CE APARE ──────────────── */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-6 text-center">
              Ce scrie pe cazierul judiciar și ce nu scrie
            </h2>

            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-neutral-200 space-y-4 text-neutral-700 leading-relaxed">
              <p>
                Certificatul de cazier judiciar e emis de poliție din evidența ținută după{' '}
                <strong className="text-secondary-900">Legea nr. 290/2004</strong>. Pe el se trec{' '}
                <strong>condamnările din hotărâri judecătorești definitive</strong>: instanța, fapta,
                pedeapsa. Dacă nu ai nimic înscris, certificatul spune că nu figurezi în cazierul judiciar.
                Asta e situația pentru marea majoritate a celor care îl cer.
              </p>

              <p>Câteva lucruri pe care oamenii se tem să le vadă și care <strong>nu apar</strong>:</p>
              <ul className="space-y-2 pl-1">
                {[
                  'Un dosar penal în care ești cercetat sau judecat, dar fără hotărâre definitivă.',
                  'Amenzile contravenționale: de circulație, de la primărie, de la ITM. Nu sunt pedepse penale.',
                  'Abaterile rutiere și punctele de penalizare. Acelea sunt în cazierul auto, alt document.',
                  'Condamnările scoase din evidență prin reabilitare, amnistie sau pentru că fapta nu mai e infracțiune.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-bold text-secondary-900 pt-2">Când iese o condamnare de pe cazier</h3>
              <p>
                Prin reabilitare. Pentru amendă penală, închisoare de cel mult 2 ani sau pedeapsă cu suspendare
                sub supraveghere, reabilitarea vine <strong>de drept după 3 ani</strong> fără o nouă infracțiune
                (Codul penal, art. 165). Pentru pedepse mai mari, o ceri instanței după{' '}
                <strong>4, 5, 7 sau 10 ani</strong>, în funcție de pedeapsă (art. 166). Termenele se numără de la
                terminarea executării, nu de la data condamnării. Dacă ai o condamnare veche și nu știi dacă mai
                apare, cel mai simplu e să ceri certificatul și să vezi.
              </p>

              <h3 className="text-lg font-bold text-secondary-900 pt-2">Cât e valabil cazierul judiciar</h3>
              <p>
                <strong>Șase luni de la eliberare</strong> (Legea 290/2004, art. 27). Asta e regula legii; instituția
                care ți-l cere poate pretinde unul mai recent, iar ambasadele și angajatorii din străinătate o fac des.
                Întreabă înainte de comandă cât de nou trebuie să fie.
              </p>

              <div className="bg-primary-50/50 border-l-4 border-primary-500 p-4 rounded-r-lg mt-6">
                <p className="text-sm">
                  <strong className="text-secondary-900">Nu îl confunda cu certificatul de integritate comportamentală.</strong>{' '}
                  Acela verifică doar registrul persoanelor condamnate pentru infracțiuni sexuale, de exploatare
                  sau asupra minorilor (Legea 118/2019) și se cere la orice post cu copii. Multe școli cer ambele.
                  Diferențele le-am pus una lângă alta în{' '}
                  <Link href="/cazier-judiciar-vs-certificat-integritate-comportamentala/" className={linkClass}>
                    cazier judiciar vs certificat de integritate
                  </Link>
                  , iar pentru profesori în{' '}
                  <Link href="/cazier-si-certificat-de-integritate-pentru-profesori/" className={linkClass}>
                    ghidul pentru cadre didactice
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────── SPECIMEN + ONLINE VS GHIȘEU ──────────────── */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cazier judiciar online sau la ghișeu
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Certificatul e același, indiferent cine depune cererea. Diferă doar drumul până la el.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Specimen image */}
              <div className="relative bg-neutral-50 rounded-2xl p-4 border border-neutral-200 shadow-sm">
                <Image
                  src="/images/cazier-judiciar-specimen.webp"
                  alt="Specimen de certificat de cazier judiciar eliberat de Poliția Română, cu datele personale anonimizate"
                  width={1414}
                  height={2000}
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 600px"
                />
                <p className="text-xs text-neutral-500 mt-3 text-center italic">
                  Exemplu, cu datele personale anonimizate.
                </p>
              </div>

              {/* Online vs Ghișeu comparison — table on desktop, stacked cards on mobile */}
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Prin noi sau la ghișeul poliției
                </h3>

                {(() => {
                  const ROWS = [
                    { label: 'Cost', us: '198 lei', them: 'Gratuit', usWin: false },
                    { label: 'Termen', us: '3-5 zile lucrătoare', them: 'Pe loc sau în cel mult 3 zile', usWin: false },
                    { label: 'Deplasare', us: 'Nu', them: 'Da, în programul ghișeului', usWin: true },
                    { label: 'Din străinătate', us: 'Da, original prin curier', them: 'Doar prin consulat sau cu procură', usWin: true },
                    { label: 'Traducere și apostilă', us: 'În aceeași comandă', them: 'Le faci tu, separat', usWin: true },
                  ];
                  return (
                    <>
                      {/* Desktop: table */}
                      <div className="hidden sm:block">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-neutral-300">
                              <th className="text-left py-3 font-semibold text-secondary-900"></th>
                              <th className="text-center py-3 font-semibold text-primary-600">eGhișeul.ro</th>
                              <th className="text-center py-3 font-semibold text-neutral-600">La ghișeu</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ROWS.map((row) => (
                              <tr key={row.label} className="border-b border-neutral-200 last:border-0">
                                <td className="py-3 text-neutral-700 font-medium">{row.label}</td>
                                <td className={cn(
                                  'py-3 text-center font-semibold',
                                  row.usWin ? 'text-green-700' : 'text-secondary-900',
                                )}>
                                  {row.us}
                                </td>
                                <td className={cn(
                                  'py-3 text-center',
                                  row.usWin ? 'text-neutral-600' : 'text-green-700 font-semibold',
                                )}>
                                  {row.them}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile: stacked compact cards (no horizontal scroll) */}
                      <div className="sm:hidden space-y-2.5">
                        {ROWS.map((row) => (
                          <div key={row.label} className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                            <p className="text-xs font-semibold text-secondary-900 mb-2">{row.label}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wide mb-0.5">eGhișeul</p>
                                <p className="text-secondary-900 font-semibold">{row.us}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide mb-0.5">La ghișeu</p>
                                <p className="text-neutral-600">{row.them}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}

                <p className="text-sm text-neutral-600 mt-4 leading-relaxed">
                  Dacă ești în același oraș cu un ghișeu de cazier și ai o oră liberă în timpul
                  programului, mergi singur. Nu plătești nimic și pleci, de cele mai multe ori, cu certificatul în
                  mână. Serviciul nostru are sens când ești în altă localitate, în altă țară sau ai nevoie și de
                  traducere și apostilă. Cum s-a ajuns la „gratuit” găsești în{' '}
                  <Link href="/taxa-cazier-judiciar/" className={linkClass}>
                    ghidul despre taxa de cazier judiciar
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────── REVIEWS (component, neutral-50) ──────────────── */}
        <ReviewsSection />

        {/* ──────────────── CÂND ȚI SE CERE ──────────────── */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Cine îți cere cazierul judiciar
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Situațiile pentru care ni se comandă cel mai des. La cele din străinătate, verifică întâi dacă
                îți trebuie și traducere și apostilă: se pot adăuga în aceeași comandă.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {USE_CASE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.title}
                    className={cn(
                      'bg-white rounded-2xl p-6 border-2 border-neutral-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
                      category.borderHover,
                    )}
                  >
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', category.iconBg)}>
                      <Icon className={cn('w-6 h-6', category.iconColor)} aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900 mb-3">{category.title}</h3>
                    <ul className="space-y-2">
                      {category.cases.map((useCase) => (
                        <li key={useCase} className="flex items-start gap-2 text-sm text-neutral-700 leading-relaxed">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <span>{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────────────── DIASPORA ──────────────── */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[900px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-6 text-center">
              Cazier judiciar din străinătate
            </h2>
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-neutral-200 space-y-4 text-neutral-700 leading-relaxed">
              <p>Ai trei drumuri, și doar unul trece prin noi:</p>
              <ol className="space-y-3 list-decimal pl-5">
                <li>
                  <strong className="text-secondary-900">Consulatul României.</strong> Mergi personal la consulat.
                  Termenul și eventualele taxe diferă de la un consulat la altul, așa că întreabă-i înainte.
                </li>
                <li>
                  <strong className="text-secondary-900">Cineva din țară, cu procură.</strong> La ghișeu e gratuit,
                  dar procura notarială făcută în străinătate costă, iar originalul trebuie apoi trimis la tine.
                </li>
                <li>
                  <strong className="text-secondary-900">Prin noi, 198 lei.</strong> Semnezi împuternicirea pe ecran,
                  avocatul ridică certificatul din țară, iar originalul pleacă prin Poșta Română (100 lei) sau
                  DHL (250 lei, mai rapid).
                </li>
              </ol>

              <h3 className="text-lg font-bold text-secondary-900 pt-2">Traducere și apostilă: în ce ordine</h3>
              <p>
                Majoritatea autorităților străine cer certificatul <strong>apostilat</strong> și{' '}
                <strong>tradus autorizat</strong>. Ordinea contează: apostila de la Haga se pune pe original, la
                prefectură, iar traducerea se face după, ca să cuprindă și textul apostilei. Dacă instituția îți cere
                traducere legalizată, înseamnă traducere autorizată plus legalizare notarială, două opțiuni separate.
                Pentru statele care nu au semnat Convenția de la Haga e nevoie de supralegalizare, pe care nu o facem.
              </p>
              <p className="text-sm text-neutral-600">
                <Languages className="inline w-4 h-4 mr-1 text-primary-600" aria-hidden="true" />
                Traducem din română în 20 de limbi. Prețul depinde de limbă, vezi tabelul de mai jos.
              </p>
            </div>
          </div>
        </section>

        {/* ──────────────── CUM FUNCȚIONEAZĂ ──────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] py-14 lg:py-24">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="relative container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3">Cât durează: ce se întâmplă după plată</h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Termenul de 3-5 zile lucrătoare (1-2 cu urgență) se numără de la plată. Fiecare pas îl vezi pe
                pagina de status a comenzii și primești email la fiecare schimbare.
              </p>
            </div>
            <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" aria-hidden="true" />
              {[
                { step: 1, icon: FileText, title: 'Verificăm dosarul', desc: 'Actul, selfie-ul și datele. Dacă ceva lipsește sau nu se vede, îți scriem și încarci din nou, fără să plătești iar.' },
                { step: 2, icon: Gavel, title: 'Avocatul depune', desc: 'Împuternicirea avocațială și cererea ajung la ghișeul de cazier al poliției.' },
                { step: 3, icon: Mail, title: 'Primești scanul', desc: 'Pe email, în ziua în care certificatul e ridicat. Traducerea și apostila, dacă le-ai ales, urmează după.' },
                { step: 4, icon: Truck, title: 'Originalul, prin curier', desc: 'Dacă ai ales livrare: în țară cu Fan Courier sau Sameday, în străinătate cu Poșta Română sau DHL.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="relative text-center">
                    <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-secondary-900 shadow-[0_8px_24px_rgba(236,185,95,0.35)]">
                      <Icon className="h-7 w-7" aria-hidden="true" />
                      <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-extrabold text-secondary-900 shadow-md">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-white/65 leading-relaxed max-w-[240px] mx-auto">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────────────── PRICING TABLE ──────────────── */}
        {/* Prețuri = Setări → Servicii (service_options), verificate în DB pe 06.10.2026. */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1000px]">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Preț cazier judiciar online, cu opțiuni
              </h2>
              <p className="text-neutral-600">
                Prețuri cu TVA 21%. Vezi totalul exact înainte de plată, iar opțiunile se pot adăuga și după.
              </p>
            </div>

            {(() => {
              const PRICING_BASE = [
                { service: 'Persoană fizică', termen: '3-5 zile lucrătoare', pret: '198 lei' },
                { service: 'Persoană fizică, urgent', termen: '1-2 zile lucrătoare', pret: '278 lei' },
                { service: 'Firmă (persoană juridică)', termen: '3-5 zile lucrătoare', pret: '198 lei' },
                { service: 'Firmă, urgent', termen: '1-2 zile lucrătoare', pret: '278 lei' },
                { service: 'Cetățean străin', termen: '7-15 zile lucrătoare, fără urgență', pret: '298 lei' },
              ];
              const PRICING_ADDONS = [
                { name: 'Certificat de integritate', desc: 'În aceeași comandă, cu împuternicire separată', pret: '100 lei', icon: Shield },
                { name: 'Apostilă de la Haga', desc: 'Pe original, la prefectură; +3 zile lucrătoare', pret: '198 lei' },
                { name: 'Traducere autorizată', desc: 'Engleză, franceză, germană, italiană, spaniolă și alte limbi uzuale', pret: '178,50 lei' },
                { name: 'Traducere autorizată', desc: 'Rusă, greacă, poloneză, ucraineană, bulgară, cehă, slovacă', pret: '249 lei' },
                { name: 'Traducere autorizată', desc: 'Norvegiană, suedeză, daneză', pret: '349 lei' },
                { name: 'Legalizare notarială', desc: 'Pentru „traducere legalizată”', pret: '99 lei' },
                { name: 'Apostilă notari', desc: 'Pe traducere, la Camera Notarilor; +3 zile lucrătoare', pret: '83,30 lei' },
                { name: 'Copie suplimentară', desc: 'Per bucată', pret: '25 lei' },
                { name: 'Curier internațional', desc: 'Poșta Română / DHL', pret: '100 / 250 lei', icon: Globe },
              ];
              return (
            <div className="bg-neutral-50 rounded-2xl p-5 sm:p-6 lg:p-8 border border-neutral-200">
              <h3 className="font-bold text-secondary-900 mb-4 text-lg">Certificatul</h3>

              {/* Desktop: table */}
              <div className="hidden sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-300">
                      <th className="text-left py-3 font-semibold text-secondary-900">Pentru</th>
                      <th className="text-left py-3 font-semibold text-secondary-900">Termen</th>
                      <th className="text-right py-3 font-semibold text-secondary-900">Preț</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRICING_BASE.map((row) => (
                      <tr key={row.service} className="border-b border-neutral-200 last:border-0">
                        <td className="py-3 text-neutral-700">{row.service}</td>
                        <td className="py-3 text-neutral-600">{row.termen}</td>
                        <td className="py-3 text-right font-bold text-secondary-900 tabular-nums">{row.pret}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked cards (no horizontal scroll) */}
              <div className="sm:hidden space-y-2.5">
                {PRICING_BASE.map((row) => (
                  <div key={row.service} className="flex items-center justify-between gap-3 bg-white rounded-lg p-3 border border-neutral-200">
                    <div className="min-w-0">
                      <p className="font-semibold text-secondary-900 text-sm">{row.service}</p>
                      <p className="text-xs text-neutral-500">{row.termen}</p>
                    </div>
                    <p className="font-bold text-secondary-900 text-base tabular-nums whitespace-nowrap">{row.pret}</p>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-secondary-900 mb-4 text-lg mt-8">
                Opțiuni
              </h3>

              {/* Desktop: table */}
              <div className="hidden sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-300">
                      <th className="text-left py-3 font-semibold text-secondary-900">Opțiune</th>
                      <th className="text-left py-3 font-semibold text-secondary-900">Detalii</th>
                      <th className="text-right py-3 font-semibold text-secondary-900">Preț</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRICING_ADDONS.map((row) => {
                      const Icon = row.icon;
                      return (
                        <tr key={row.name + row.pret} className="border-b border-neutral-200 last:border-0">
                          <td className="py-3 text-neutral-700">
                            {Icon ? <Icon className="inline w-4 h-4 mr-1" aria-hidden="true" /> : null}
                            {row.name}
                          </td>
                          <td className="py-3 text-neutral-600">{row.desc}</td>
                          <td className="py-3 text-right font-bold text-secondary-900 tabular-nums whitespace-nowrap">{row.pret}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked cards for addons */}
              <div className="sm:hidden space-y-2.5">
                {PRICING_ADDONS.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.name + row.pret} className="flex items-center justify-between gap-3 bg-white rounded-lg p-3 border border-neutral-200">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-secondary-900 text-sm flex items-center gap-1.5">
                          {Icon ? <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" /> : null}
                          <span>{row.name}</span>
                        </p>
                        <p className="text-xs text-neutral-500 leading-tight mt-0.5">{row.desc}</p>
                      </div>
                      <p className="font-bold text-secondary-900 text-sm tabular-nums whitespace-nowrap">{row.pret}</p>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
                Livrarea în țară (Fan Courier, Sameday, easybox) se calculează la comandă, după adresă.
                Traducerea adaugă 2 zile lucrătoare la termen.
              </p>
            </div>
              );
            })()}
          </div>
        </section>

        {/* ──────────────── DE CE NOI ──────────────── */}
        <section className="py-12 lg:py-20 bg-neutral-50">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Ce primești în plus față de ghișeu
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: Gavel,
                  title: 'Avocat cu împuternicire',
                  desc: 'Cererea o depune un avocat din Baroul Satu Mare, pe împuternicire avocațială cu număr din registrul baroului. Contractul de asistență îl primești pe email.',
                  iconBg: 'bg-gradient-to-br from-primary-100 to-primary-200',
                  iconColor: 'text-primary-600',
                  hoverBorder: 'hover:border-primary-300',
                  accent: 'before:bg-primary-500',
                },
                {
                  icon: Clock,
                  title: 'Termen numărat de la plată',
                  desc: 'Pagina de status arată unde e dosarul: la verificare, la poliție, la traducere, la curier. La fiecare pas primești email.',
                  iconBg: 'bg-green-100',
                  iconColor: 'text-green-600',
                  hoverBorder: 'hover:border-green-300',
                  accent: 'before:bg-green-500',
                },
                {
                  icon: Globe,
                  title: 'Livrare oriunde',
                  desc: 'În țară cu Fan Courier, Sameday sau easybox. În străinătate cu Poșta Română (100 lei) sau DHL (250 lei).',
                  iconBg: 'bg-teal-100',
                  iconColor: 'text-teal-600',
                  hoverBorder: 'hover:border-teal-300',
                  accent: 'before:bg-teal-500',
                },
                {
                  icon: Languages,
                  title: 'Traducere și apostilă în aceeași comandă',
                  desc: 'Nu mai cauți separat traducător, notar și prefectură. Le bifezi în formular și primești actul gata de depus în străinătate.',
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                  hoverBorder: 'hover:border-blue-300',
                  accent: 'before:bg-blue-500',
                },
                {
                  icon: CreditCard,
                  title: 'Plată cu cardul sau prin transfer',
                  desc: 'Card, Apple Pay, Google Pay sau transfer bancar. Factura vine pe email, pe persoană fizică sau pe firmă.',
                  iconBg: 'bg-purple-100',
                  iconColor: 'text-purple-600',
                  hoverBorder: 'hover:border-purple-300',
                  accent: 'before:bg-purple-500',
                },
                {
                  icon: Bell,
                  title: 'Reamintire înainte să expire',
                  desc: 'Certificatul e valabil 6 luni. Îți scriem înainte de expirare, ca să nu afli la ghișeul altei instituții că nu mai e bun.',
                  iconBg: 'bg-rose-100',
                  iconColor: 'text-rose-600',
                  hoverBorder: 'hover:border-rose-300',
                  accent: 'before:bg-rose-500',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={cn(
                      'relative bg-white rounded-2xl p-6 border-2 border-neutral-200 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
                      'before:absolute before:left-0 before:top-6 before:bottom-6 before:w-1 before:rounded-r-full',
                      item.hoverBorder,
                      item.accent,
                    )}
                  >
                    <div className={cn('inline-flex w-12 h-12 rounded-xl items-center justify-center mb-4', item.iconBg)}>
                      <Icon className={cn('w-6 h-6', item.iconColor)} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-secondary-900 mb-2 text-lg">{item.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────────────── SERVICII CONEXE — INTERNAL LINKS ──────────────── */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">
                Alte caziere, alte instituții
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Fiecare are evidența lui. Cazierul judiciar nu le înlocuiește pe celelalte.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  href: '/servicii/certificat-de-integritate-comportamentala/',
                  icon: Shield,
                  title: 'Certificat de integritate comportamentală',
                  desc: 'Registrul infracțiunilor sexuale, de exploatare și asupra minorilor. Cerut la orice post cu copii. +100 lei dacă îl iei cu cazierul.',
                },
                {
                  href: '/servicii/cazier-fiscal-online/',
                  icon: FileText,
                  title: 'Cazier fiscal',
                  desc: 'De la ANAF, pentru persoane fizice: faptele sancționate de legislația fiscală. Valabil 30 de zile.',
                },
                {
                  href: '/servicii/cazier-auto-online/',
                  icon: MapPin,
                  title: 'Cazier auto',
                  desc: 'Fișa șoferului de la Poliția Rutieră: sancțiuni, puncte de penalizare, suspendări ale permisului.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="group">
                    <Card className="h-full border-2 border-neutral-200 hover:border-primary-500 hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500 transition-colors">
                          <Icon className="w-6 h-6 text-primary-600 group-hover:text-secondary-900" />
                        </div>
                        <h3 className="font-bold text-secondary-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-neutral-600 mb-3">{item.desc}</p>
                        <span className="text-primary-600 font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          Vezi serviciul <ArrowRight className="w-4 h-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────────────── EDITORIAL NOTE — E-E-A-T ──────────────── */}
        <section className="py-8 bg-white border-t border-neutral-200">
          <div className="container mx-auto px-4 max-w-[900px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-neutral-600 bg-neutral-50 rounded-xl p-4 border border-neutral-200">
              <Award className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <div>
                <p>
                  Scris de{' '}
                  <Link href={SITE_AUTHOR.path} className="font-semibold text-secondary-900 underline underline-offset-2">
                    {SITE_AUTHOR.name}
                  </Link>
                  , {SITE_AUTHOR.jobTitle.toLowerCase()}, din procedura pe care o urmăm la fiecare comandă.
                </p>
                <p className="text-xs mt-1 text-neutral-500">
                  Ultima actualizare:{' '}
                  <time dateTime={DATE_MODIFIED}>{DATE_MODIFIED_DISPLAY}</time> &middot;
                  Surse: Legea 290/2004 privind cazierul judiciar, Codul penal (art. 165-166), Legea 118/2019
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────── FAQ ──────────────── */}
        <ServiceFAQ
          faqs={FAQ_ITEMS}
          title="Întrebări despre cazierul judiciar"
        />

        {/* ──────────────── FINAL CTA ──────────────── */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4 max-w-[1000px]">
            <div className="text-center">
              <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
                Comandă cazierul judiciar
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                198 lei, 3-5 zile lucrătoare. Ai o întrebare înainte? Sună sau scrie-ne.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
                <Link
                  href="/comanda/cazier-judiciar-persoana-fizica/"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  Comandă pentru persoană fizică
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/comanda/cazier-judiciar-persoana-juridica/"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-colors"
                >
                  <Building2 className="w-5 h-5" />
                  Comandă pentru firmă (PJ)
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <a
                  href="tel:+40757708181"
                  className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary-500/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/50">Telefon</p>
                    <p className="text-white font-semibold">+40 757 708 181</p>
                  </div>
                </a>
                <a
                  href="mailto:contact@eghiseul.ro"
                  className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary-500/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/50">Email</p>
                    <p className="text-white font-semibold">contact@eghiseul.ro</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MobileStickyCTA href="#alege-tip" basePrice={198} ctaLabel="Alege tipul" />

      <Footer />
    </>
  );
}
