/**
 * Services navigation structure — single source of truth for the header
 * mega-menu and any grouped service listing. Grouped by DB category, in
 * display order. Hrefs are CANONICAL (via `serviceUrl`), so links never go
 * through a 301 redirect.
 */
import {
  Scale,
  ShieldCheck,
  Car,
  Ticket,
  Home,
  Baby,
  Heart,
  UserRound,
  Building2,
  Receipt,
  type LucideIcon,
} from 'lucide-react';
import { serviceUrl } from '@/lib/seo/constants';

export interface ServiceNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface ServiceNavGroup {
  category: string;
  items: ServiceNavItem[];
}

export const SERVICES_NAV: ServiceNavGroup[] = [
  {
    category: 'Juridice',
    items: [
      { name: 'Cazier Judiciar', href: serviceUrl('cazier-judiciar'), icon: Scale },
      { name: 'Certificat Integritate', href: serviceUrl('certificat-integritate'), icon: ShieldCheck },
    ],
  },
  {
    category: 'Auto',
    items: [
      { name: 'Cazier Auto', href: serviceUrl('cazier-auto'), icon: Car },
      // Points to the verification tool (widget + the high-traffic /tools URL),
      // not the order page — that's what users searching "verificare rovinietă" want.
      { name: 'Verificare Rovinietă', href: '/tools/verificare-rovinieta-online/', icon: Ticket },
    ],
  },
  {
    category: 'Personale',
    items: [
      { name: 'Certificat Naștere', href: serviceUrl('certificat-nastere'), icon: Baby },
      { name: 'Certificat Căsătorie', href: serviceUrl('certificat-casatorie'), icon: Heart },
      { name: 'Certificat Celibat', href: serviceUrl('certificat-celibat'), icon: UserRound },
    ],
  },
  {
    category: 'Imobiliare',
    items: [
      { name: 'Extras Carte Funciară', href: serviceUrl('extras-carte-funciara'), icon: Home },
    ],
  },
  {
    category: 'Comerciale',
    items: [
      { name: 'Certificat Constatator', href: serviceUrl('certificat-constatator'), icon: Building2 },
    ],
  },
  {
    category: 'Fiscale',
    items: [
      { name: 'Cazier Fiscal', href: serviceUrl('cazier-fiscal'), icon: Receipt },
    ],
  },
];
