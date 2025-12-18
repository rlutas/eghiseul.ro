import { ClipboardList, CreditCard, FileCheck, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Completezi formularul',
    description: 'Alegi serviciul dorit și completezi datele necesare în doar 2 minute',
    color: 'bg-primary-100 text-primary-600',
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Plătești online securizat',
    description: 'Plată rapidă prin card sau transfer bancar, cu factură fiscală',
    color: 'bg-info-100 text-info-600',
  },
  {
    number: '03',
    icon: FileCheck,
    title: 'Noi procesăm cererea',
    description: 'Echipa noastră depune documentele și gestionează tot procesul',
    color: 'bg-success-100 text-success-600',
  },
  {
    number: '04',
    icon: Truck,
    title: 'Primești documentul',
    description: 'Livrare prin curier sau email în 24-48h, în toată România',
    color: 'bg-warning-100 text-warning-600',
  },
];

export function HowItWorksSection() {
  return (
    <section id="cum-functioneaza" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-[1100px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Proces simplu
          </span>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-secondary-900 mb-4">
            Cum funcționează?
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            4 pași simpli pentru a obține documentele de care ai nevoie
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-20 left-[10%] right-[10%] h-0.5 bg-neutral-200" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-neutral-50 rounded-2xl p-6 h-full border border-neutral-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300">
                  {/* Number Circle */}
                  <div className="relative z-10 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mb-6 shadow-[0_4px_12px_rgba(236,185,95,0.3)]">
                    <span className="text-secondary-900 font-extrabold text-lg">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 ${step.color} rounded-xl flex items-center justify-center mb-4`}>
                    <step.icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-secondary-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow - Mobile */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-4 lg:hidden">
                    <ArrowRight className="w-6 h-6 text-primary-500 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            asChild
            className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <Link href="/#servicii">
              Alege serviciul dorit
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
