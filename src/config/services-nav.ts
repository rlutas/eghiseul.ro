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
  Globe,
  FileText,
  Map as MapIcon,
  type LucideIcon,
} from 'lucide-react';
import { serviceUrl } from '@/lib/seo/constants';

export interface ServiceNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Optional sub-items (e.g. Cazier Judiciar → Persoană Fizică / Juridică). */
  children?: ServiceNavItem[];
}

export interface ServiceNavGroup {
  category: string;
  items: ServiceNavItem[];
}

export const SERVICES_NAV: ServiceNavGroup[] = [
  {
    category: 'Juridice',
    items: [
      {
        name: 'Cazier Judiciar',
        href: serviceUrl('cazier-judiciar'),
        icon: Scale,
        children: [
          { name: 'Persoană Fizică', href: serviceUrl('cazier-judiciar-persoana-fizica'), icon: UserRound },
          { name: 'Persoană Juridică', href: serviceUrl('cazier-judiciar-persoana-juridica'), icon: Building2 },
        ],
      },
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
      { name: 'Rovinietă Online', href: '/servicii/rovinieta-online/', icon: Ticket },
    ],
  },
  {
    category: 'Personale',
    items: [
      {
        name: 'Certificat Naștere',
        href: serviceUrl('certificat-nastere'),
        icon: Baby,
        children: [
          { name: 'Extras Multilingv', href: '/servicii/extras-multilingv-certificat-nastere/', icon: Globe },
        ],
      },
      {
        name: 'Certificat Căsătorie',
        href: serviceUrl('certificat-casatorie'),
        icon: Heart,
        children: [
          { name: 'Extras Multilingv', href: '/servicii/extras-multilingv-certificat-casatorie/', icon: Globe },
        ],
      },
      { name: 'Certificat Celibat', href: serviceUrl('certificat-celibat'), icon: UserRound },
    ],
  },
  {
    category: 'Imobiliare',
    items: [
      // Identificare Imobil is intentionally NOT a top-level menu item — it's
      // surfaced inside the CF / Cadastral pages + order form as a fallback.
      { name: 'Extras Carte Funciară', href: serviceUrl('extras-carte-funciara'), icon: Home },
      { name: 'Extras Plan Cadastral', href: serviceUrl('extras-plan-cadastral'), icon: MapIcon },
    ],
  },
  {
    category: 'Comerciale',
    items: [
      {
        name: 'Certificat Constatator',
        href: serviceUrl('certificat-constatator'),
        icon: Building2,
        children: [
          { name: 'Firmă', href: serviceUrl('certificat-constatator'), icon: Building2 },
          { name: 'Persoană Fizică', href: serviceUrl('certificat-constatator'), icon: UserRound },
          { name: 'Cu Istoric', href: serviceUrl('certificat-constatator'), icon: FileText },
        ],
      },
    ],
  },
  {
    category: 'Fiscale',
    items: [
      { name: 'Cazier Fiscal', href: serviceUrl('cazier-fiscal'), icon: Receipt },
    ],
  },
];
