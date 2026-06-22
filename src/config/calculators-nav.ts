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
  Coins,
  Building2,
  PiggyBank,
  HandCoins,
  TrendingUp,
  MapPin,
  House,
  Banknote,
  CalendarDays,
  CalendarRange,
  HeartPulse,
  Scale,
  Gauge,
  UserRound,
  Moon,
  Hourglass,
  CircleDollarSign,
  Accessibility,
  type LucideIcon,
} from 'lucide-react';

export interface CalculatorNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Apare în mega-meniu (subset curat). Toate apar oricum pe pagina /calculator/. */
  popular?: boolean;
}

export interface CalculatorNavGroup {
  category: string;
  items: CalculatorNavItem[];
}

export const CALCULATORS_NAV: CalculatorNavGroup[] = [
  {
    category: 'Salariu & muncă',
    items: [
      { name: 'Salariu net/brut', href: '/calculator/salariu/', icon: Wallet, popular: true },
      { name: 'Contribuții PFA', href: '/calculator/contributii-pfa/', icon: Briefcase },
      { name: 'Concediu medical', href: '/calculator/concediu-medical/', icon: Stethoscope, popular: true },
      { name: 'Indemnizație de șomaj', href: '/calculator/indemnizatie-somaj/', icon: UserMinus, popular: true },
      { name: 'Indemnizație creștere copil', href: '/calculator/calculator-indemnizatie-crestere-copil/', icon: Baby },
      { name: 'Vechime în muncă', href: '/calculator/vechime-in-munca/', icon: CalendarClock },
      { name: 'Zile concediu de odihnă', href: '/calculator/zile-concediu-odihna/', icon: Plane },
      { name: 'Impozit pe pensie', href: '/calculator/impozit-pensie/', icon: HandCoins },
      { name: 'Diurnă', href: '/calculator/diurna/', icon: MapPin },
      { name: 'Concediu maternitate', href: '/calculator/concediu-maternitate/', icon: HeartPulse },
      { name: 'Concediu paternal', href: '/calculator/concediu-paternal/', icon: UserRound },
      { name: 'Spor noapte / ore supl.', href: '/calculator/spor-salarial/', icon: Moon },
      { name: 'Vârstă de pensionare', href: '/calculator/varsta-pensionare/', icon: Hourglass, popular: true },
      { name: 'Estimare pensie', href: '/calculator/estimare-pensie/', icon: CircleDollarSign, popular: true },
      { name: 'Pensie de invaliditate', href: '/calculator/pensie-invaliditate/', icon: Accessibility },
    ],
  },
  {
    category: 'Fiscal',
    items: [
      { name: 'TVA', href: '/calculator/tva/', icon: Percent, popular: true },
      { name: 'Dividende', href: '/calculator/dividende/', icon: Coins, popular: true },
      { name: 'Taxe SRL', href: '/calculator/taxe-srl/', icon: Building2 },
      { name: 'Impozit auto', href: '/calculator/calculator-impozit-auto/', icon: Car, popular: true },
      { name: 'Impozit pe chirie', href: '/calculator/impozit-chirie/', icon: Home, popular: true },
      { name: 'Penalități ANAF', href: '/calculator/penalitati-anaf/', icon: FileWarning },
      { name: 'Rambursare anticipată', href: '/calculator/rambursare-anticipata/', icon: PiggyBank },
      { name: 'Inflație', href: '/calculator/inflatie/', icon: TrendingUp },
      { name: 'Impozit pe casă', href: '/calculator/impozit-casa/', icon: House },
      { name: 'Credit ipotecar', href: '/calculator/credit-ipotecar/', icon: Banknote, popular: true },
      { name: 'Grad de îndatorare', href: '/calculator/grad-indatorare/', icon: Gauge },
    ],
  },
  {
    category: 'Juridic & altele',
    items: [
      { name: 'Taxe notariale', href: '/calculator/taxe-notariale/', icon: Landmark, popular: true },
      { name: 'Pensie alimentară', href: '/calculator/pensie-alimentara/', icon: HeartHandshake, popular: true },
      { name: 'Termene judiciare', href: '/calculator/termene-judiciare/', icon: Gavel, popular: true },
      { name: 'Taxă judiciară de timbru', href: '/calculator/taxa-judiciara-de-timbru/', icon: Stamp },
      { name: 'Reabilitare cazier', href: '/calculator/reabilitare/', icon: ShieldCheck },
      { name: 'Amendă circulație + puncte', href: '/calculator/amenda-circulatie/', icon: TrafficCone, popular: true },
      { name: 'Dobândă legală', href: '/calculator/dobanda-legala/', icon: Scale },
      { name: 'Zile lucrătoare', href: '/calculator/zile-lucratoare/', icon: CalendarDays },
      { name: 'Calculator dată', href: '/calculator/calculator-data/', icon: CalendarRange },
      { name: 'Calculator procente', href: '/calculator/calculator-procente/', icon: Calculator, popular: true },
    ],
  },
];
