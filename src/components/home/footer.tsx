import Link from 'next/link';
import { Mail, Phone, Clock, Shield, FileText, MessageCircle } from 'lucide-react';
import { serviceUrl } from '@/lib/seo/constants';

const WHATSAPP =
  'https://wa.me/40757708181?text=' +
  encodeURIComponent('Bună ziua! Aș dori informații despre serviciile eGhișeul.ro.');

const servicesA = [
  { name: 'Cazier Judiciar', href: serviceUrl('cazier-judiciar') },
  { name: 'Cazier Fiscal', href: serviceUrl('cazier-fiscal') },
  { name: 'Cazier Auto', href: serviceUrl('cazier-auto') },
  { name: 'Certificat Naștere', href: serviceUrl('certificat-nastere') },
  { name: 'Certificat Căsătorie', href: serviceUrl('certificat-casatorie') },
  { name: 'Certificat Celibat', href: serviceUrl('certificat-celibat') },
];

const servicesB = [
  { name: 'Extras Carte Funciară', href: serviceUrl('extras-carte-funciara') },
  { name: 'Certificat Constatator', href: serviceUrl('certificat-constatator') },
  { name: 'Extras Multilingv', href: '/servicii/extras-multilingv-certificat-nastere/' },
  { name: 'Rovinietă Online', href: '/servicii/rovinieta-online/' },
  { name: 'Calculatoare', href: '/calculator/' },
  { name: 'Toate serviciile', href: '/servicii/' },
];

const legalLinks = [
  { name: 'Termeni și Condiții', href: '/termeni-si-conditii/' },
  { name: 'Confidențialitate', href: '/politica-de-confidentialitate/' },
  { name: 'GDPR', href: '/gdpr/' },
  { name: 'Cookies', href: '/politica-cookies/' },
];

function ServiceLink({ name, href }: { name: string; href: string }) {
  return (
    <li>
      <Link href={href} className="text-white/70 hover:text-primary-500 transition-colors inline-block py-0.5">
        {name}
      </Link>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      {/* Mega top */}
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Despre */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(236,185,95,0.3)]">
                <span className="text-secondary-900 font-extrabold text-base">eG</span>
              </div>
              <span className="text-xl font-extrabold text-white leading-tight">
                eGhișeul<span className="text-primary-500">.ro</span>
              </span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              Ne dedicăm simplificării și eficientizării proceselor birocratice pentru românii de pretutindeni.
              Misiunea noastră este să oferim acces rapid și sigur la serviciile de obținere a documentelor
              esențiale: certificate de naștere, căsătorie și celibat, cazier judiciar și auto, traduceri
              legalizate, apostile și supralegalizări.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <span className="flex items-center gap-1.5 px-3 py-2 bg-white/5 rounded-lg">
                <Shield className="w-4 h-4 text-primary-500" aria-hidden="true" />
                <span className="text-xs text-white/70">SSL securizat</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-2 bg-white/5 rounded-lg">
                <FileText className="w-4 h-4 text-primary-500" aria-hidden="true" />
                <span className="text-xs text-white/70">GDPR</span>
              </span>
            </div>
          </div>

          {/* Servicii — 2 coloane */}
          <div className="lg:col-span-5">
            <h3 className="text-white font-bold text-lg mb-4">Servicii</h3>
            <div className="grid grid-cols-2 gap-x-6">
              <ul className="space-y-2.5 text-sm">
                {servicesA.map((s) => <ServiceLink key={s.name} {...s} />)}
              </ul>
              <ul className="space-y-2.5 text-sm">
                {servicesB.map((s) => <ServiceLink key={s.name} {...s} />)}
              </ul>
            </div>
          </div>

          {/* Contact — WhatsApp prioritar */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-[#25D366] flex-shrink-0" aria-hidden="true" />
                <a href={WHATSAPP} target="_blank" rel="nofollow noopener" className="text-white/80 hover:text-primary-500 transition-colors">WhatsApp (răspuns rapid)</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
                <a href="tel:+40757708181" className="text-white/80 hover:text-primary-500 transition-colors">+40 757 708 181</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
                <a href="mailto:contact@eghiseul.ro" className="text-white/80 hover:text-primary-500 transition-colors">contact@eghiseul.ro</a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
                <span className="text-white/80">Luni - Vineri: 08:00 - 16:00</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 max-w-[1200px]">
          {/* Strip compact: plăți (mic) + ANPC (mic) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 mb-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-white/50">Plăți securizate</span>
              <span className="inline-flex rounded-md bg-white px-2 py-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/footer/payment-methods.webp"
                  alt="Visa, Mastercard, Apple Pay, Google Pay"
                  width={900}
                  height={172}
                  className="h-4 w-auto"
                  loading="lazy"
                />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="nofollow noopener" aria-label="ANPC — Soluționarea Alternativă a Litigiilor">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/footer/anpc-sal.svg" alt="ANPC SAL" width={250} height={50} className="h-8 w-auto rounded" loading="lazy" />
              </a>
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="nofollow noopener" aria-label="ANPC — Soluționarea Online a Litigiilor (UE)">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/footer/anpc-sol.svg" alt="ANPC SOL" width={250} height={50} className="h-8 w-auto rounded" loading="lazy" />
              </a>
            </div>
          </div>

          {/* Linkuri legale + rating */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
              {legalLinks.map((l) => (
                <Link key={l.name} href={l.href} className="hover:text-primary-500 transition-colors">{l.name}</Link>
              ))}
            </nav>
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-[#FBBC04] fill-[#FBBC04]" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="text-white font-medium ml-1 text-sm">4.9/5</span>
              <span className="text-white/50 text-sm">pe Google</span>
            </div>
          </div>

          {/* Copyright + firmă */}
          <div className="border-t border-white/10 pt-5">
            <p className="text-white/60 text-sm">© {new Date().getFullYear()} eGhișeul.ro. Toate drepturile rezervate.</p>
            <p className="text-white/40 text-[11px] mt-1">
              eDigitalizare SRL · CUI RO49278701 · Reg. Com. J2023001097301 · Jud. Satu Mare, Com. Odoreu, Str. Salcâmilor nr. 2
            </p>

            {/* Disclaimer — sub copyright */}
            <p className="text-white/40 text-[11px] leading-relaxed mt-4">
              eGhișeul.ro este un serviciu privat de asistență la obținerea de documente. Nu suntem o instituție de
              stat și nu suntem afiliați cu vreun organ guvernamental. Documentele sunt emise exclusiv de
              autoritățile competente din România, iar procedurile sunt gestionate de un avocat colaborator înscris
              în Barou.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
