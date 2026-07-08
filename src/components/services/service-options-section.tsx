import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Globe,
  Languages,
  ScrollText,
  Stamp,
  Copy,
  ShieldCheck,
  FilePlus2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

interface OptionRow {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  price: number | string;
  is_required?: boolean | null;
}

/** Icon per option code — falls back to Sparkles for unknown codes. */
const OPTION_ICONS: Record<string, LucideIcon> = {
  urgenta: Zap,
  extras_multilingv: Globe,
  traducere: Languages,
  legalizare: ScrollText,
  apostila_haga: Stamp,
  apostila_notari: Stamp,
  copii_suplimentare: Copy,
  extras_suplimentar: Copy,
  verificare_expert: ShieldCheck,
  certificat_pachet: FilePlus2,
  cetatean_strain: Globe,
};

/** Generic fallback so no card ever renders without a description. */
const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  urgenta: 'Comanda ta intră prioritar în lucru și primești documentul în termenul urgent afișat.',
  traducere: 'Traducere realizată de un traducător autorizat de Ministerul Justiției, în limba de care ai nevoie.',
  legalizare: 'Legalizarea notarială a traducerii autorizate — cerută frecvent la dosarele oficiale din străinătate.',
  apostila_haga: 'Apostila de la Haga aplicată pe document — obligatorie pentru folosirea în afara UE.',
  apostila_notari: 'Apostila Camerei Notarilor aplicată pe traducerea legalizată — cerută de anumite state.',
  copii_suplimentare: 'Exemplare suplimentare ale documentului, utile când depui mai multe dosare.',
  extras_suplimentar: 'Un exemplar suplimentar al extrasului, pentru dosare multiple.',
  verificare_expert: 'Un specialist verifică suplimentar corectitudinea datelor înainte de depunere.',
  certificat_pachet: 'Primești și certificatul (duplicat) împreună cu extrasul — mai avantajos la pachet.',
};

/**
 * „Opțiuni Disponibile" — shared section for all service pages. Wide layout
 * (max-w-6xl, 3 columns on desktop), equal-height cards with icon, always a
 * description (DB text with per-code fallback) and the price pinned bottom.
 */
export function ServiceOptionsSection({ options }: { options: OptionRow[] }) {
  if (!options || options.length === 0) return null;
  return (
    <section className="py-12 lg:py-20 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Personalizare
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">Opțiuni Disponibile</h2>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Adaugă servicii extra pentru comanda ta — le bifezi direct în formular, la pasul „Opțiuni”.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => {
            const code = option.code || '';
            const Icon = OPTION_ICONS[code] ?? Sparkles;
            const description =
              (option.description && option.description.trim()) || FALLBACK_DESCRIPTIONS[code] || '';
            return (
              <Card
                key={option.id}
                className="border-2 border-neutral-200 transition-all hover:border-primary-400 hover:shadow-lg hover:-translate-y-0.5"
              >
                <CardContent className="flex h-full flex-col p-5 lg:p-6">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {option.is_required && (
                      <Badge className="bg-secondary-900 text-[10px] text-white">Obligatoriu</Badge>
                    )}
                  </div>
                  <h3 className="mb-1.5 font-bold text-secondary-900">{option.name}</h3>
                  {description && (
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-600">{description}</p>
                  )}
                  <div className="mt-auto border-t border-neutral-100 pt-3">
                    <span className="text-lg font-extrabold text-primary-600">
                      +{Number(option.price).toFixed(Number(option.price) % 1 ? 2 : 0)} RON
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
