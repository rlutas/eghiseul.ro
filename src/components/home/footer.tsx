import Link from 'next/link';
import { Mail, Phone, MapPin, Shield, Clock, FileText } from 'lucide-react';

const services = [
  { name: 'Cazier Judiciar', href: '/services/cazier-judiciar' },
  { name: 'Cazier Fiscal', href: '/services/cazier-fiscal' },
  { name: 'Certificat Naștere', href: '/services/certificat-nastere' },
  { name: 'Extras Carte Funciară', href: '/services/extras-carte-funciara' },
  { name: 'Certificat Celibat', href: '/services/certificat-celibat' },
  { name: 'Vezi toate serviciile', href: '/services' },
];

const legalLinks = [
  { name: 'Termeni și Condiții', href: '/terms' },
  { name: 'Politica de Confidențialitate', href: '/privacy' },
  { name: 'GDPR', href: '/gdpr' },
  { name: 'Politica Cookies', href: '/cookies' },
];

export function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10 sm:py-12 lg:py-16 max-w-[1100px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Column 1: About & Logo */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(236,185,95,0.3)]">
                <span className="text-secondary-900 font-extrabold text-base">eG</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white leading-tight">
                  eGhișeul<span className="text-primary-500">.ro</span>
                </span>
              </div>
            </Link>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              Platforma digitală pentru obținerea documentelor oficiale românești, rapid și legal.
              Procesăm peste 200.000 de documente anual.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 rounded-lg">
                <Shield className="w-4 h-4 text-primary-500" />
                <span className="text-xs sm:text-sm text-white/70">SSL</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 rounded-lg">
                <FileText className="w-4 h-4 text-primary-500" />
                <span className="text-xs sm:text-sm text-white/70">GDPR</span>
              </div>
            </div>
          </div>

          {/* Column 2: Services */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-white font-bold text-base sm:text-lg">Servicii</h3>
            <ul className="space-y-2.5 sm:space-y-3 text-sm sm:text-base">
              {services.map((service, i) => (
                <li key={i}>
                  <Link
                    href={service.href}
                    className="text-white/70 hover:text-primary-500 transition-colors inline-block py-0.5"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-white font-bold text-base sm:text-lg">Legal</h3>
            <ul className="space-y-2.5 sm:space-y-3 text-sm sm:text-base">
              {legalLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-primary-500 transition-colors inline-block py-0.5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-white font-bold text-base sm:text-lg">Contact</h3>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Telefon</p>
                  <a href="tel:+40312299399" className="text-white hover:text-primary-500 transition-colors font-medium">
                    +40 312 299 399
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Email</p>
                  <a href="mailto:contact@eghiseul.ro" className="text-white hover:text-primary-500 transition-colors font-medium">
                    contact@eghiseul.ro
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Program</p>
                  <span className="text-white font-medium">Luni - Vineri: 09:00 - 18:00</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 sm:py-6 max-w-[1100px]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-sm">
            <p className="text-white/50 text-center md:text-left text-xs sm:text-sm">
              © 2025 eGhișeul.ro. Toate drepturile rezervate.
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FBBC04] fill-[#FBBC04]"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="text-white font-medium ml-1 text-xs sm:text-sm">4.9/5</span>
              <span className="text-white/50 text-xs sm:text-sm">pe Google</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
