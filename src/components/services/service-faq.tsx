import {
  ChevronDown,
  MessageCircle,
  Timer,
  CircleDollarSign,
  FileSignature,
  HelpCircle,
  Plane,
  Shield,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FAQ {
  q: string;
  a: string;
  /** Optional category label — drives section grouping + color accent. */
  category?: string;
}

/**
 * Icon registry — passing Lucide components as props across the
 * Server → Client boundary throws "Functions cannot be passed". We
 * accept a string key and resolve to the actual component here.
 */
const ICON_REGISTRY: Record<string, LucideIcon> = {
  Timer,
  CircleDollarSign,
  FileSignature,
  HelpCircle,
  Plane,
  Shield,
  Globe,
};

export type FAQCategoryIconName = keyof typeof ICON_REGISTRY;

export interface FAQCategory {
  /** Category key used by FAQ.category for grouping. */
  key: string;
  /** Display label shown above the group. */
  label: string;
  /** Icon name — resolved against ICON_REGISTRY internally. */
  icon: FAQCategoryIconName;
  /** Accent color theme — drives chevron + border highlight + header. */
  color: 'gold' | 'blue' | 'green' | 'purple' | 'rose' | 'teal';
}

interface ServiceFAQProps {
  faqs: FAQ[];
  title?: string;
  /**
   * Optional categories — when provided, FAQs are grouped by `faq.category`
   * matching `category.key`. Each group renders with its own header + color
   * accent. Without categories the component renders a flat list.
   */
  categories?: FAQCategory[];
  /** When true (default for ≥10 FAQs), render as 2 columns on lg+ screens. */
  twoColumns?: boolean;
}

/**
 * Tailwind color map per category — must be exhaustive so Tailwind's JIT
 * compiler picks all classes up at build time (no dynamic class strings).
 */
const COLOR_THEMES = {
  gold: {
    headerBg: 'bg-primary-100',
    headerText: 'text-primary-700',
    headerIcon: 'text-primary-600',
    openBorder: 'border-primary-300',
    openBorderVariant: 'open:border-primary-300',
    hoverBorder: 'hover:border-primary-200',
    chevron: 'text-primary-500',
  },
  blue: {
    headerBg: 'bg-blue-100',
    headerText: 'text-blue-700',
    headerIcon: 'text-blue-600',
    openBorder: 'border-blue-300',
    openBorderVariant: 'open:border-blue-300',
    hoverBorder: 'hover:border-blue-200',
    chevron: 'text-blue-500',
  },
  green: {
    headerBg: 'bg-green-100',
    headerText: 'text-green-700',
    headerIcon: 'text-green-600',
    openBorder: 'border-green-300',
    openBorderVariant: 'open:border-green-300',
    hoverBorder: 'hover:border-green-200',
    chevron: 'text-green-500',
  },
  purple: {
    headerBg: 'bg-purple-100',
    headerText: 'text-purple-700',
    headerIcon: 'text-purple-600',
    openBorder: 'border-purple-300',
    openBorderVariant: 'open:border-purple-300',
    hoverBorder: 'hover:border-purple-200',
    chevron: 'text-purple-500',
  },
  rose: {
    headerBg: 'bg-rose-100',
    headerText: 'text-rose-700',
    headerIcon: 'text-rose-600',
    openBorder: 'border-rose-300',
    openBorderVariant: 'open:border-rose-300',
    hoverBorder: 'hover:border-rose-200',
    chevron: 'text-rose-500',
  },
  teal: {
    headerBg: 'bg-teal-100',
    headerText: 'text-teal-700',
    headerIcon: 'text-teal-600',
    openBorder: 'border-teal-300',
    openBorderVariant: 'open:border-teal-300',
    hoverBorder: 'hover:border-teal-200',
    chevron: 'text-teal-500',
  },
} as const;

interface FAQItemProps {
  faq: FAQ;
  /** Deschis implicit (primul element) — restul se deschid la click. */
  defaultOpen?: boolean;
  /** Grup de acordeon: `name` identic = deschidere exclusivă, NATIV, fără JS. */
  groupName: string;
  theme: typeof COLOR_THEMES[keyof typeof COLOR_THEMES];
}

/**
 * Un element de FAQ, randat server-side cu `<details>`.
 *
 * Înainte era componentă client cu `useState`: întrebările și răspunsurile
 * ajungeau de două ori în pagină — o dată ca HTML, o dată serializate în
 * payload-ul RSC pentru hidratare (~11 KB per pagină doar FAQ-ul, măsurat la
 * auditul din 28.07.2026 pe /servicii/cazier-judiciar-online/). În plus,
 * conținutul depindea de JS, deci crawlerele AI care nu execută JS vedeau
 * întrebările, dar nu neapărat în forma finală.
 *
 * `<details name="...">` dă acordeon exclusiv nativ (un singur răspuns deschis
 * la un moment dat) în browserele moderne; unde `name` nu e suportat, pot rămâne
 * mai multe deschise — degradare acceptabilă, fără JS de întreținut.
 */
function FAQItem({ faq, defaultOpen, groupName, theme }: FAQItemProps) {
  return (
    <details
      name={groupName}
      open={defaultOpen}
      className={cn(
        'group bg-white rounded-2xl border transition-all duration-300 h-fit',
        'border-neutral-200',
        theme.hoverBorder,
        'open:shadow-lg',
        theme.openBorderVariant,
      )}
    >
      <summary
        className={cn(
          'w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer',
          'list-none [&::-webkit-details-marker]:hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-2xl',
        )}
      >
        <span className="text-base font-semibold text-secondary-900 pr-4">
          {faq.q}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 flex-shrink-0 transition-transform duration-200',
            theme.chevron,
            'group-open:rotate-180',
          )}
          aria-hidden="true"
        />
      </summary>
      <p className="px-6 pb-5 text-neutral-600 leading-relaxed">{faq.a}</p>
    </details>
  );
}

export function ServiceFAQ({
  faqs,
  title = 'Întrebări Frecvente',
  categories,
  twoColumns,
}: ServiceFAQProps) {
  // Auto-enable 2 columns for long FAQ sections unless caller forces single
  const useTwoCols = twoColumns ?? faqs.length >= 10;

  // Group FAQs by category if categories are provided
  const groups = categories
    ? categories
        .map((cat) => ({
          category: cat,
          items: faqs.filter((f) => f.category === cat.key),
        }))
        .filter((g) => g.items.length > 0)
    : null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section className="py-12 lg:py-20 bg-neutral-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div
        className={cn(
          'container mx-auto px-4',
          useTwoCols ? 'max-w-[1200px]' : 'max-w-[900px]',
        )}
      >
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Întrebări frecvente
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-secondary-900 mb-4">
            {title}
          </h2>
          <p className="text-neutral-600">
            Răspunsuri la cele mai comune întrebări — apasă pe oricare pentru detalii.
          </p>
        </div>

        {/* Grouped or flat FAQs */}
        {groups ? (
          <div className="space-y-10">
            {groups.map((group) => {
              const Icon = ICON_REGISTRY[group.category.icon] ?? HelpCircle;
              const theme = COLOR_THEMES[group.category.color];
              return (
                <div key={group.category.key}>
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', theme.headerBg)}>
                      <Icon className={cn('w-5 h-5', theme.headerIcon)} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className={cn('text-sm font-bold uppercase tracking-wide', theme.headerText)}>
                        {group.category.label}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {group.items.length} {group.items.length === 1 ? 'întrebare' : 'întrebări'}
                      </p>
                    </div>
                  </div>

                  {/* FAQ items within group */}
                  <div
                    className={cn(
                      'gap-3',
                      useTwoCols ? 'grid grid-cols-1 lg:grid-cols-2' : 'space-y-3',
                    )}
                  >
                    {group.items.map((faq, idx) => {
                      const itemKey = `${group.category.key}-${idx}`;
                      return (
                        <FAQItem
                          key={itemKey}
                          faq={faq}
                          groupName={`faq-${group.category.key}`}
                          defaultOpen={idx === 0}
                          theme={theme}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={cn(
              'gap-3',
              useTwoCols ? 'grid grid-cols-1 lg:grid-cols-2' : 'space-y-3',
            )}
          >
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                groupName="faq"
                defaultOpen={index === 0}
                theme={COLOR_THEMES.gold}
              />
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-neutral-200">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-600" aria-hidden="true" />
            </div>
            <div className="text-left">
              <p className="text-sm text-neutral-500">Nu ai găsit răspunsul?</p>
              <a
                href="mailto:contact@eghiseul.ro"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Contactează-ne
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
