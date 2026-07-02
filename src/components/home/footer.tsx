import Link from 'next/link';
import { Mail, Phone, Clock, MessageCircle, Send } from 'lucide-react';
import { serviceUrl } from '@/lib/seo/constants';

const WHATSAPP =
  'https://wa.me/40757708181?text=' +
  encodeURIComponent('Bună ziua! Aș dori informații despre serviciile eGhișeul.ro.');

interface FooterService {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
}

const CONSTATATOR = serviceUrl('certificat-constatator');

const serviceGroups: { title: string; items: FooterService[] }[] = [
  {
    title: 'Caziere',
    items: [
      {
        name: 'Cazier Judiciar',
        href: serviceUrl('cazier-judiciar'),
        children: [
          { name: 'Persoană Fizică', href: serviceUrl('cazier-judiciar-persoana-fizica') },
          { name: 'Persoană Juridică', href: serviceUrl('cazier-judiciar-persoana-juridica') },
        ],
      },
      { name: 'Cazier Fiscal', href: serviceUrl('cazier-fiscal') },
      { name: 'Cazier Auto', href: serviceUrl('cazier-auto') },
      { name: 'Certificat Integritate', href: serviceUrl('certificat-integritate') },
    ],
  },
  {
    title: 'Stare civilă',
    items: [
      {
        name: 'Certificat Naștere',
        href: serviceUrl('certificat-nastere'),
        children: [{ name: 'Extras Multilingv', href: '/servicii/extras-multilingv-certificat-nastere/' }],
      },
      {
        name: 'Certificat Căsătorie',
        href: serviceUrl('certificat-casatorie'),
        children: [{ name: 'Extras Multilingv', href: '/servicii/extras-multilingv-certificat-casatorie/' }],
      },
      { name: 'Certificat Celibat', href: serviceUrl('certificat-celibat') },
    ],
  },
  {
    title: 'Imobiliare & firme',
    items: [
      {
        name: 'Certificat Constatator',
        href: CONSTATATOR,
        children: [
          { name: 'Firmă', href: CONSTATATOR },
          { name: 'Persoană Fizică', href: CONSTATATOR },
          { name: 'Cu Istoric', href: CONSTATATOR },
        ],
      },
      { name: 'Extras Carte Funciară', href: serviceUrl('extras-carte-funciara') },
      { name: 'Extras Plan Cadastral', href: serviceUrl('extras-plan-cadastral') },
      { name: 'Copie Carte Funciară', href: serviceUrl('copie-carte-funciara') },
      { name: 'Certificat de Sarcini', href: serviceUrl('certificat-sarcini') },
      { name: 'Rovinietă Online', href: '/servicii/rovinieta-online/' },
    ],
  },
];

const legalLinks = [
  { name: 'Termeni și Condiții', href: '/termeni-si-conditii/' },
  { name: 'Confidențialitate', href: '/politica-de-confidentialitate/' },
  { name: 'GDPR', href: '/gdpr/' },
  { name: 'Cookies', href: '/politica-cookies/' },
];

export function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      {/* Mega top */}
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-[1200px]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Despre + plăți + trust */}
          <div className="col-span-2 md:col-span-3 lg:col-span-3 space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(236,185,95,0.3)]">
                <span className="text-secondary-900 font-extrabold text-base">eG</span>
              </div>
              <span className="text-xl font-extrabold text-white leading-tight">
                eGhișeul<span className="text-primary-500">.ro</span>
              </span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              Ne dedicăm simplificării proceselor birocratice pentru românii de pretutindeni: acces rapid și sigur la
              certificate de naștere, căsătorie și celibat, cazier judiciar și auto, traduceri legalizate, apostile
              și supralegalizări.
            </p>

            {/* Metode de plată — sub text */}
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/footer/payment-methods.webp"
                alt="Metode de plată acceptate: Visa, Mastercard, Apple Pay, Google Pay"
                width={900}
                height={172}
                className="h-11 w-auto"
                loading="lazy"
              />
            </div>

          </div>

          {/* Servicii — categorizate */}
          {serviceGroups.map((group) => (
            <div key={group.title} className="lg:col-span-2">
              <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-4">{group.title}</h3>
              <ul className="space-y-2.5 text-sm">
                {group.items.map((s) => (
                  <li key={s.name}>
                    <Link href={s.href} className="text-white/70 hover:text-primary-500 transition-colors inline-block py-0.5">
                      {s.name}
                    </Link>
                    {s.children && (
                      <ul className="mt-1.5 ml-1.5 space-y-1.5 border-l border-white/10 pl-3">
                        {s.children.map((c) => (
                          <li key={c.name}>
                            <Link href={c.href} className="text-white/55 hover:text-primary-500 transition-colors text-[13px]">
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact + ANPC */}
          <div className="col-span-2 md:col-span-3 lg:col-span-3">
            <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Send className="h-4 w-4 text-primary-500 flex-shrink-0" aria-hidden="true" />
                <Link href="/contact/" className="text-white/80 hover:text-primary-500 transition-colors">Formular de contact</Link>
              </li>
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

          {/* Copyright + firmă (stânga) + ANPC (dreapta) */}
          <div className="border-t border-white/10 pt-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-white/60 text-sm">© {new Date().getFullYear()} eGhișeul.ro. Toate drepturile rezervate.</p>
                <p className="text-white/40 text-[11px] mt-1">
                  eDigitalizare SRL · CUI RO49278701 · Reg. Com. J2023001097301 · Jud. Satu Mare, Com. Odoreu, Str. Salcâmilor nr. 2
                </p>
              </div>
              {/* Badge-uri ANPC — dreapta, sub recenzii */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="nofollow noopener" aria-label="ANPC — Soluționarea Alternativă a Litigiilor">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/footer/anpc-sal.svg" alt="ANPC SAL — Soluționarea Alternativă a Litigiilor" width={250} height={50} className="h-9 w-auto rounded" loading="lazy" />
                </a>
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="nofollow noopener" aria-label="ANPC — Soluționarea Online a Litigiilor (UE)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/footer/anpc-sol.svg" alt="ANPC SOL — Soluționarea Online a Litigiilor" width={250} height={50} className="h-9 w-auto rounded" loading="lazy" />
                </a>
              </div>
            </div>
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
