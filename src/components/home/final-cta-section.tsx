import Link from 'next/link';
import { ArrowRight, Phone, Mail, Shield, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
  return (
    <section id="contact" className="relative py-16 lg:py-24 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 max-w-[900px]">
        {/* Main Content */}
        <div className="text-center">
          <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
            Gata să scapi de cozi și birocrație?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Alătură-te celor peste 200.000 de români care au ales calea simplă pentru
            documentele oficiale.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              asChild
              className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Link href="/#servicii">
                Comandă Acum
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl transition-all duration-200"
            >
              <a href="tel:+40312299399">
                <Phone className="mr-2 w-5 h-5" />
                Sună-ne
              </a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8 mb-12">
            <div className="flex items-center gap-2 text-white/70">
              <Clock className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium">Livrare 24-48h</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Shield className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium">Plată securizată</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <CheckCircle className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium">Garanție rambursare</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <a
              href="tel:+40312299399"
              className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary-500/50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-500" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/50">Telefon suport</p>
                <p className="text-white font-semibold">+40 312 299 399</p>
              </div>
            </a>
            <a
              href="mailto:contact@eghiseul.ro"
              className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-xl border border-white/10 hover:border-primary-500/50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-500" />
              </div>
              <div className="text-left">
                <p className="text-xs text-white/50">Email</p>
                <p className="text-white font-semibold">contact@eghiseul.ro</p>
              </div>
            </a>
          </div>

          {/* Google Rating */}
          <div className="mt-10 pt-10 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-[#FBBC04] fill-[#FBBC04]"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="text-white font-bold">
              4.9/5 din 391 recenzii pe Google
            </p>
            <p className="text-white/50 text-sm mt-1">
              „Cel mai rapid mod de a obține documente oficiale!" — Client verificat
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
