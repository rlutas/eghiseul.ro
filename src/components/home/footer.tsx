import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Column 1: About & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                eG
              </div>
              <span className="text-xl font-bold text-white">eGhiseul.ro</span>
            </div>
            <p className="text-sm leading-relaxed">
              Platforma digitala pentru obtinerea documentelor oficiale romanesti, rapid si legal.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Link-uri Rapide</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#servicii" className="hover:text-blue-400 transition-colors">
                  Servicii
                </Link>
              </li>
              <li>
                <Link href="#cum-functioneaza" className="hover:text-blue-400 transition-colors">
                  Cum Functioneaza
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-400 transition-colors">
                  Contul Meu
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-400 transition-colors">
                  Inregistrare
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Legal */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-blue-400" />
                <a href="mailto:contact@eghiseul.ro" className="hover:text-blue-400 transition-colors">
                  contact@eghiseul.ro
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-blue-400" />
                <a href="tel:+40740123456" className="hover:text-blue-400 transition-colors">
                  +40 740 123 456
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-blue-400" />
                <span>Bucuresti, Romania</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; 2025 eGhiseul.ro. Toate drepturile rezervate.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-blue-400 transition-colors">
              Termeni si Conditii
            </Link>
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">
              Politica de Confidentialitate
            </Link>
            <Link href="/gdpr" className="hover:text-blue-400 transition-colors">
              GDPR
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
