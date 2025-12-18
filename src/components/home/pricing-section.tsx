import { Check, Clock, Zap, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const pricingPlans = [
  {
    name: 'Standard',
    description: 'Pentru documente fără urgență',
    price: 49,
    originalPrice: null,
    delivery: '48-72 ore lucrătoare',
    features: [
      'Procesare completă',
      'Verificare documente',
      'Suport email',
      'Livrare curier standard',
      'Factură fiscală',
    ],
    popular: false,
    buttonText: 'Alege Standard',
  },
  {
    name: 'Urgent',
    description: 'Când ai nevoie repede',
    price: 89,
    originalPrice: null,
    delivery: '24 ore lucrătoare',
    badge: 'Cel mai ales',
    features: [
      'Procesare prioritară',
      'Verificare documente',
      'Suport telefonic dedicat',
      'Livrare curier express',
      'Factură fiscală',
      'Actualizări SMS în timp real',
    ],
    popular: true,
    buttonText: 'Alege Urgent',
  },
  {
    name: 'Express',
    description: 'Maximă urgență',
    price: 149,
    originalPrice: null,
    delivery: 'Aceeași zi (unde posibil)',
    features: [
      'Procesare imediată',
      'Verificare premium',
      'Suport prioritar 24/7',
      'Livrare curier same-day',
      'Factură fiscală',
      'Manager dedicat',
      'Garanție satisfacție',
    ],
    popular: false,
    buttonText: 'Alege Express',
  },
];

export function PricingSection() {
  return (
    <section className="py-16 lg:py-24 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-[1100px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Prețuri transparente
          </span>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-secondary-900 mb-4">
            Alege varianta potrivită pentru tine
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Prețuri fixe, fără costuri ascunse. Plătești doar ce vezi.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 ${
                plan.popular
                  ? 'border-2 border-primary-500 shadow-[0_10px_40px_rgba(236,185,95,0.2)]'
                  : 'border border-neutral-200 hover:border-primary-300'
              } hover:shadow-lg transition-all duration-300`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-secondary-900 text-sm font-bold rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-secondary-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-neutral-500">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl lg:text-5xl font-extrabold text-secondary-900">
                    {plan.price}
                  </span>
                  <span className="text-lg text-neutral-500">RON</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-neutral-600">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>{plan.delivery}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                asChild
                className={`w-full h-12 font-bold rounded-xl transition-all duration-200 ${
                  plan.popular
                    ? 'bg-primary-500 hover:bg-primary-600 text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)]'
                    : 'bg-secondary-900 hover:bg-secondary-800 text-white'
                }`}
              >
                <Link href="/#servicii">
                  {plan.buttonText}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Trust Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-neutral-200">
            <Shield className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-neutral-600">
              Garanție rambursare 100% dacă nu obții documentul
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
