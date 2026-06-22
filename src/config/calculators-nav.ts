/**
 * Calculators navigation — single source of truth for the header mega-menu
 * (desktop + mobile). Grupat pe categorii, în ordine de afișare. Hrefs =
 * `/calculator/{slug}/`. Adaugă aici când construiești un calculator nou.
 */
import {
  Wallet,
  Briefcase,
  Stethoscope,
  UserMinus,
  Baby,
  CalendarClock,
  Plane,
  Percent,
  Car,
  Home,
  FileWarning,
  Stamp,
  ShieldCheck,
  TrafficCone,
  Calculator,
  Landmark,
  HeartHandshake,
  Gavel,
  type LucideIcon,
} from 'lucide-react';

export interface CalculatorNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface CalculatorNavGroup {
  category: string;
  items: CalculatorNavItem[];
}

export const CALCULATORS_NAV: CalculatorNavGroup[] = [
  {
    category: 'Salariu & muncă',
    items: [
      { name: 'Salariu net/brut', href: '/calculator/salariu/', icon: Wallet },
      { name: 'Contribuții PFA', href: '/calculator/contributii-pfa/', icon: Briefcase },
      { name: 'Concediu medical', href: '/calculator/concediu-medical/', icon: Stethoscope },
      { name: 'Indemnizație de șomaj', href: '/calculator/indemnizatie-somaj/', icon: UserMinus },
      { name: 'Indemnizație creștere copil', href: '/calculator/calculator-indemnizatie-crestere-copil/', icon: Baby },
      { name: 'Vechime în muncă', href: '/calculator/vechime-in-munca/', icon: CalendarClock },
      { name: 'Zile concediu de odihnă', href: '/calculator/zile-concediu-odihna/', icon: Plane },
    ],
  },
  {
    category: 'Fiscal',
    items: [
      { name: 'TVA', href: '/calculator/tva/', icon: Percent },
      { name: 'Impozit auto', href: '/calculator/calculator-impozit-auto/', icon: Car },
      { name: 'Impozit pe chirie', href: '/calculator/impozit-chirie/', icon: Home },
      { name: 'Penalități ANAF', href: '/calculator/penalitati-anaf/', icon: FileWarning },
    ],
  },
  {
    category: 'Juridic & altele',
    items: [
      { name: 'Taxe notariale', href: '/calculator/taxe-notariale/', icon: Landmark },
      { name: 'Pensie alimentară', href: '/calculator/pensie-alimentara/', icon: HeartHandshake },
      { name: 'Termene judiciare', href: '/calculator/termene-judiciare/', icon: Gavel },
      { name: 'Taxă judiciară de timbru', href: '/calculator/taxa-judiciara-de-timbru/', icon: Stamp },
      { name: 'Reabilitare cazier', href: '/calculator/reabilitare/', icon: ShieldCheck },
      { name: 'Amendă circulație + puncte', href: '/calculator/amenda-circulatie/', icon: TrafficCone },
      { name: 'Calculator procente', href: '/calculator/calculator-procente/', icon: Calculator },
    ],
  },
];
