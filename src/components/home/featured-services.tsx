import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Ticket, MessageCircle } from 'lucide-react';

type Badge = 'popular' | 'nou' | null;
interface ServiceItem {
  name: string;
  href: string;
  img: string | null; // null → fallback icon (specimen lipsă)
  desc: string;
  badge: Badge;
}

const PF_SERVICES: ServiceItem[] = [
  { name: 'Cazier Judiciar Online', href: '/servicii/cazier-judiciar-online/', img: '/images/specimens/cazier-judiciar.png', badge: 'popular', desc: 'Cazier judiciar online pentru angajare, permis auto sau viză. Livrare în 24-48h, fără deplasare la ghișeu.' },
  { name: 'Certificat de Integritate Comportamentală', href: '/servicii/certificat-de-integritate-comportamentala/', img: '/images/specimens/certificat-integritate.png', badge: null, desc: 'Certificat de integritate comportamentală online pentru profesori, medici și personal care lucrează cu minori.' },
  { name: 'Cazier Fiscal Online', href: '/servicii/cazier-fiscal-online/', img: '/images/specimens/cazier-fiscal.png', badge: null, desc: 'Cazier fiscal online de la ANAF. Necesar pentru licitații publice, contracte cu statul și acte notariale.' },
  { name: 'Cazier Auto Online', href: '/servicii/cazier-auto-online/', img: '/images/specimens/cazier-auto.png', badge: null, desc: 'Cazier auto online cu istoricul sancțiunilor rutiere. Pentru angajare șofer profesionist, Uber, Bolt sau taxi.' },
  { name: 'Certificat de Naștere', href: '/servicii/eliberare-certificat-de-nastere/', img: '/images/specimens/certificat-nastere.png', badge: 'popular', desc: 'Eliberare certificat de naștere online — duplicat original trimis prin curier în România și străinătate.' },
  { name: 'Extras Multilingv Certificat Naștere', href: '/servicii/extras-multilingv-certificat-nastere/', img: '/images/specimens/extras-multilingv-nastere.webp', badge: null, desc: 'Extras multilingv naștere valabil în UE fără apostilă. Ideal pentru căsătorie sau muncă în străinătate.' },
  { name: 'Certificat de Căsătorie', href: '/servicii/eliberare-certificat-de-casatorie/', img: '/images/specimens/certificat-casatorie.png', badge: null, desc: 'Eliberare certificat de căsătorie online — duplicat oficial cu livrare prin curier oriunde în lume.' },
  { name: 'Extras Multilingv Certificat Căsătorie', href: '/servicii/extras-multilingv-certificat-casatorie/', img: '/images/specimens/extras-multilingv-casatorie.webp', badge: null, desc: 'Extras multilingv căsătorie recunoscut în UE. Fără traducere legalizată sau apostilă Haga.' },
  { name: 'Certificat de Celibat', href: '/servicii/eliberare-certificat-de-celibat/', img: '/images/specimens/certificat-celibat.png', badge: 'popular', desc: 'Certificat de celibat online pentru căsătorie în străinătate. Eliberare rapidă, livrare internațională.' },
  { name: 'Extras Carte Funciară', href: '/servicii/extras-de-carte-funciara/', img: '/images/specimens/extras-cf.png', badge: null, desc: 'Extras de carte funciară online de la ANCPI. Verifici proprietatea instant, livrare pe email în câteva minute.' },
  { name: 'Rovinieta Online', href: '/servicii/rovinieta-online/', img: '/images/specimens/rovinieta.webp', badge: 'nou', desc: 'Cumpără rovinieta online rapid și simplu. Valabilă imediat după plată, fără așteptare.' },
];

const PJ_SERVICES: ServiceItem[] = [
  { name: 'Certificat Constatator ONRC', href: '/servicii/certificat-constatator-online/', img: '/images/specimens/certificat-constatator.png', badge: null, desc: 'Certificat constatator online de la Registrul Comerțului. Date oficiale firmă pentru licitații și contracte.' },
  { name: 'Cazier Judiciar pentru Firme', href: '/servicii/cazier-judiciar-online/', img: '/images/specimens/cazier-judiciar.png', badge: null, desc: 'Cazier judiciar online pentru administratori, asociați și reprezentanți legali ai firmei.' },
  { name: 'Extras Carte Funciară', href: '/servicii/extras-de-carte-funciara/', img: '/images/specimens/extras-cf.png', badge: null, desc: 'Extras CF online pentru verificări imobiliare, due diligence și tranzacții comerciale.' },
  { name: 'Rovinieta pentru Flote Auto', href: '/servicii/rovinieta-online/', img: '/images/specimens/rovinieta.webp', badge: 'nou', desc: 'Rovinieta online pentru flote auto. Gestionează rovinietele pentru toate vehiculele companiei.' },
];

const WHATSAPP = 'https://wa.me/40757708181?text=' + encodeURIComponent('Bună ziua! Am o întrebare despre serviciile eGhișeul.ro.');

function ServiceCard({ s }: { s: ServiceItem }) {
  return (
    <Link
      href={s.href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 hover:border-primary-500 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(6,16,31,0.12)] transition-all duration-300"
    >
      <div className="relative w-full bg-white" style={{ paddingTop: '118%' }}>
        {s.badge && (
          <span
            className={`absolute top-3 right-3 z-10 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
              s.badge === 'popular' ? 'bg-primary-500 text-secondary-900' : 'bg-green-600 text-white'
            }`}
          >
            {s.badge === 'popular' ? 'Popular' : 'Nou'}
          </span>
        )}
        {s.img ? (
          <Image src={s.img} alt={s.name} fill sizes="(max-width:600px) 45vw, 280px" className="object-contain p-4" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-500/15">
              <Ticket className="h-10 w-10 text-primary-600" aria-hidden="true" />
            </span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h4 className="text-[15px] font-bold text-secondary-900 leading-snug mb-2">{s.name}</h4>
        <p className="flex-1 text-xs leading-relaxed text-neutral-500 mb-3">{s.desc}</p>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-600 group-hover:gap-2.5 transition-all">
          Aplică acum <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function Category({ num, title, items }: { num: string; title: string; items: ServiceItem[] }) {
  return (
    <div className="mb-12 last:mb-0">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-[28px] font-extrabold text-primary-500/60">{num}</span>
        <h3 className="text-xl sm:text-2xl font-bold text-secondary-900">{title}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {items.map((s) => (
          <ServiceCard key={s.name + s.href} s={s} />
        ))}
      </div>
    </div>
  );
}

export function FeaturedServices() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-10 mb-12">
          <div className="flex-1">
            <p className="text-sm font-bold uppercase tracking-wider text-primary-500 mb-3">Servicii disponibile</p>
            <h2 className="text-3xl lg:text-[2.25rem] font-extrabold text-secondary-900 leading-tight mb-4">
              Documente oficiale online pentru cetățenii români de pretutindeni
            </h2>
            <p className="text-base leading-relaxed text-neutral-600 mb-3 max-w-[650px]">
              Obține rapid <strong>cazier judiciar online</strong>, <strong>certificate de stare civilă</strong>,{' '}
              <strong>extras carte funciară</strong>, <strong>certificat constatator</strong> și alte documente
              oficiale — indiferent dacă ești în România sau în străinătate.
            </p>
            <p className="text-base leading-relaxed text-neutral-600 max-w-[650px]">
              Serviciile noastre sunt 100% online și elimină deplasările la ghișee. Documentele fizice ajung prin
              curier în 24-48 de ore, oriunde în lume, iar cele digitale (extras CF, certificat constatator,
              rovinietă) le primești instant pe email.
            </p>
          </div>
          <div className="w-full max-w-[280px] mx-auto lg:mx-0 flex-shrink-0">
            <Image
              src="/images/servicii-header.webp"
              alt="Documente oficiale online eGhișeul.ro"
              width={280}
              height={373}
              className="w-full h-auto rounded-2xl shadow-[0_10px_40px_rgba(6,16,31,0.12)]"
            />
          </div>
        </div>

        <Category num="01." title="Servicii pentru Persoane Fizice" items={PF_SERVICES} />
        <Category num="02." title="Servicii pentru Persoane Juridice" items={PJ_SERVICES} />

        {/* CTA WhatsApp */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl bg-gradient-to-br from-secondary-900 to-[#0C1A2F] p-8 sm:p-10 text-center sm:text-left">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Ai nevoie de ajutor sau nu găsești documentul?</h3>
            <p className="text-white/80">Contactează-ne pentru o consultație gratuită — suntem aici să te ajutăm!</p>
          </div>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="nofollow noopener"
            className="inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] px-7 py-3.5 font-bold text-white whitespace-nowrap hover:bg-[#20bd5a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,211,102,0.3)] transition-all"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Scrie-ne pe WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export function FeaturedServicesSkeleton() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="h-8 w-2/3 bg-neutral-100 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden">
              <div className="w-full bg-neutral-100 animate-pulse" style={{ paddingTop: '118%' }} />
              <div className="p-5 space-y-2">
                <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                <div className="h-3 bg-neutral-100 rounded animate-pulse w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
