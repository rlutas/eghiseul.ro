import Link from 'next/link';
import { FileText, Zap, MessageCircle, ShieldCheck, Clock, Star } from 'lucide-react';

const WHATSAPP =
  'https://wa.me/40757708181?text=' +
  encodeURIComponent('Bună ziua! Aș dori informații despre serviciile eGhișeul.ro.');

const TRUST = [
  { icon: ShieldCheck, label: 'Avocat înscris în Barou' },
  { icon: FileText, label: 'Documente emise de autorități' },
  { icon: Clock, label: 'Livrare 24-48h' },
  { icon: Star, label: '4.9/5 din 400+ recenzii' },
];

export function FinalCTASection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden py-20 lg:py-24"
      style={{ background: 'linear-gradient(135deg, #06101F 0%, #0a1628 50%, #06101F 100%)' }}
    >
      {/* Glow-uri decorative */}
      <div
        className="pointer-events-none absolute -top-1/2 -left-[20%] h-[500px] w-[500px]"
        style={{ background: 'radial-gradient(circle, rgba(236,185,95,0.08) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-1/2 -right-[20%] h-[600px] w-[600px]"
        style={{ background: 'radial-gradient(circle, rgba(236,185,95,0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 max-w-[800px] text-center">
        {/* Icon */}
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[20px] bg-gradient-to-br from-primary-500/20 to-primary-500/5">
          <FileText className="h-10 w-10 text-primary-500" aria-hidden="true" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white leading-tight mb-5">
          Obține documentele oficiale <span className="text-primary-500">rapid și simplu</span>
        </h2>
        <p className="mx-auto mb-10 max-w-[600px] text-lg leading-relaxed text-white/80">
          Nu mai pierde timp la cozi! Completează cererea online în 2 minute și primești documentele acasă sau pe
          email, oriunde te-ai afla în lume.
        </p>

        {/* Butoane */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/#servicii"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-primary-500 px-9 py-4 text-base font-bold text-secondary-900 hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(236,185,95,0.3)] transition-all"
          >
            <Zap className="h-5 w-5" aria-hidden="true" /> Începe acum
          </Link>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="nofollow noopener"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border-2 border-white/30 px-9 py-4 text-base font-bold text-white hover:bg-white/10 hover:border-white/50 transition-all"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Contactează-ne
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-10 sm:flex sm:flex-wrap sm:justify-center sm:gap-8">
          {TRUST.map((t) => (
            <div key={t.label} className="flex items-center gap-2.5 text-sm text-white/70 text-left sm:text-center">
              <t.icon className="h-5 w-5 flex-shrink-0 text-primary-500" aria-hidden="true" />
              {t.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
