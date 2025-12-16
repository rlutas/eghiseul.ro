import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Upload, CreditCard, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function ProcessStep({ number, title, description, icon }: ProcessStepProps) {
  return (
    <div className="relative flex flex-col items-center text-center space-y-4">
      {/* Step Number Circle */}
      <div className="relative z-10 w-20 h-20 bg-blue-600 rounded-full flex flex-col items-center justify-center text-white shadow-lg">
        <div className="text-xs font-semibold uppercase tracking-wide opacity-80">Pasul</div>
        <div className="text-2xl font-bold">{number}</div>
      </div>

      {/* Icon */}
      <div className="w-12 h-12 bg-white border-2 border-blue-200 rounded-lg flex items-center justify-center text-blue-600">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-neutral-900">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-neutral-600 leading-relaxed max-w-[200px]">
        {description}
      </p>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="cum-functioneaza" className="py-16 lg:py-24 bg-neutral-50">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Cum Functioneaza?
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            4 pasi simpli pentru a-ti obtine documentele oficiale
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connection Line (desktop only) */}
            <div
              className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-blue-200"
              style={{ zIndex: 0 }}
            />

            {/* Step 1 */}
            <ProcessStep
              number="1"
              title="Alege Serviciul"
              description="Selecteaza documentul oficial de care ai nevoie din catalogul nostru"
              icon={<Search className="h-6 w-6" />}
            />

            {/* Step 2 */}
            <ProcessStep
              number="2"
              title="Completeaza Datele"
              description="Incarca actele necesare si completeaza formularul online"
              icon={<Upload className="h-6 w-6" />}
            />

            {/* Step 3 */}
            <ProcessStep
              number="3"
              title="Plateste Securizat"
              description="Efectueaza plata prin card sau transfer bancar"
              icon={<CreditCard className="h-6 w-6" />}
            />

            {/* Step 4 */}
            <ProcessStep
              number="4"
              title="Primesti Documentul"
              description="Documentul oficial iti este livrat prin email in 24-48 ore"
              icon={<CheckCircle className="h-6 w-6" />}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            <Link href="#servicii">
              Incepe Acum
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
