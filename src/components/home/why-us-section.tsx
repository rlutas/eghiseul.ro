import Image from 'next/image';
import { Zap, ShieldCheck, MessageCircle, Globe } from 'lucide-react';

const BENEFITS = [
  {
    icon: Zap,
    title: 'Procesare rapidă 24-48h',
    desc: 'Documentele fizice ajung prin curier în 24-48 ore, iar cele digitale instant pe email.',
  },
  {
    icon: ShieldCheck,
    title: 'Avocat colaborator înscris în Barou',
    desc: 'Toate cererile sunt procesate de un avocat colaborator, membru al Baroului din România, cu drept de exercitare. Datele tale sunt protejate de secretul profesional avocațial și GDPR.',
  },
  {
    icon: MessageCircle,
    title: 'Suport dedicat pe WhatsApp',
    desc: 'Echipa noastră îți răspunde rapid la orice întrebare sau nelămurire.',
  },
  {
    icon: Globe,
    title: 'Livrare în toată lumea',
    desc: 'Trimitem documentele oriunde te afli — România, UE sau internațional.',
  },
];

const STATS = [
  { value: '4.9/5', label: 'Rating Google' },
  { value: '400+', label: 'Recenzii' },
  { value: '24h', label: 'Timp răspuns' },
];

export function WhyUsSection() {
  return (
    <section className="bg-neutral-50 py-16 lg:py-20">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Imagine + badge */}
          <div className="relative w-full max-w-[500px] mx-auto lg:mx-0">
            <Image
              src="/images/de-ce-eghiseul.webp"
              alt="Echipa eGhișeul.ro — servicii documente online"
              width={640}
              height={896}
              className="w-full h-auto rounded-3xl shadow-[0_20px_50px_rgba(6,16,31,0.15)]"
            />
            <div className="absolute -bottom-5 right-4 sm:right-6 rounded-2xl bg-gradient-to-br from-secondary-900 to-[#0C1A2F] px-6 py-4 sm:px-7 sm:py-5 shadow-[0_10px_30px_rgba(6,16,31,0.3)]">
              <div className="text-3xl sm:text-[36px] font-extrabold text-primary-500 leading-none">150k+</div>
              <div className="mt-1 text-[13px] sm:text-sm font-semibold text-white/90">Clienți mulțumiți</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary-500 mb-3">De ce să ne alegi</p>
            <h2 className="text-3xl lg:text-[2.1rem] font-extrabold text-secondary-900 leading-tight mb-5">
              Expertiză și încredere în obținerea documentelor oficiale
            </h2>
            <p className="text-base leading-relaxed text-neutral-600 mb-7">
              Din 2023, oferim asistență profesională românilor din țară și din diaspora. Avocatul nostru colaborator,
              înscris în Barou, te reprezintă în fața autorităților pentru obținerea <strong>cazierului judiciar</strong>,
              a <strong>certificatelor de stare civilă</strong> și a altor <strong>documente oficiale</strong> — fără
              deplasări la ghișee.
            </p>

            <div className="flex flex-col gap-4">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 hover:border-primary-500 hover:translate-x-1.5 hover:shadow-[0_6px_20px_rgba(236,185,95,0.15)] transition-all duration-300"
                >
                  <span className="flex h-12 w-12 min-w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/15 to-primary-500/5">
                    <b.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-secondary-900 mb-1">{b.title}</h3>
                    <p className="text-sm leading-relaxed text-neutral-600">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-3 gap-5 border-t border-neutral-200 pt-7">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl sm:text-[28px] font-extrabold text-primary-500 leading-none">{s.value}</div>
                  <div className="mt-1.5 text-xs sm:text-[13px] text-neutral-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
