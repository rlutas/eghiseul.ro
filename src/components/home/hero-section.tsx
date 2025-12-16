import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, Lock } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Obtine Acte Oficiale{' '}
            <span className="text-blue-600">Rapid si Legal</span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-lg text-neutral-600 sm:text-xl lg:text-2xl">
            Cazier fiscal, extras carte funciara si alte documente oficiale in 24-48 ore,
            fara deplasari la ghiseu.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
              <Link href="#servicii">
                Vezi Toate Serviciile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 px-8 py-6 text-lg hover:bg-blue-50">
              <Link href="#cum-functioneaza">
                Cum Functioneaza?
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>100% Legal</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>24-48 ore</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              <span>Date Securizate</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
