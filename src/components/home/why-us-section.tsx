import Image from 'next/image';
import { Zap, ShieldCheck, MessageCircle, Globe, BadgeCheck } from 'lucide-react';

const BENEFITS = [
  {
    icon: Zap,
    title: 'Procesare rapidă 24-48h',
    desc: 'Documentele fizice ajung prin curier în 24-48 ore, iar cele digitale instant pe email.',
  },
  {
    icon: ShieldCheck,
    title: 'Avocat colaborator înscris în Barou',
    desc: 'Cererile sunt procesate de un avocat membru al Baroului din România. Datele tale sunt protejate de secretul profesional avocațial și GDPR.',
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
    <section className="relative overflow-hidden bg-neutral-50 py-16 lg:py-24">
      {/* glow decorativ */}
      <div
        className="pointer-events-none absolute -top-32 -left-40 h-[480px] w-[480px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(236,185,95,0.10) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 max-w-[1200px]">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Imagine + carduri plutitoare */}
          <div className="relative mx-auto w-full max-w-[460px] lg:mx-0">
            {/* blob gold în spate */}
            <div
              className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary-500/20 to-primary-500/0 blur-2xl"
              aria-hidden="true"
            />
            <Image
              src="/images/de-ce-eghiseul.webp"
              alt="Echipa eGhișeul.ro — servicii documente online"
              width={640}
              height={896}
              className="w-full h-auto rounded-[1.75rem] ring-1 ring-secondary-900/5 shadow-[0_30px_60px_-15px_rgba(6,16,31,0.35)]"
            />

            {/* chip verificat — sus dreapta */}
            <div className="absolute -top-4 right-4 flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-[0_10px_30px_rgba(6,16,31,0.15)] backdrop-blur">
              <BadgeCheck className="h-5 w-5 text-primary-500" aria-hidden="true" />
              <span className="text-sm font-bold text-secondary-900">Avocat în Barou</span>
            </div>

            {/* badge clienți — jos stânga, suprapus */}
            <div className="absolute -bottom-5 -left-4 sm:-left-6 rounded-2xl bg-gradient-to-br from-secondary-900 to-[#0C1A2F] px-6 py-4 sm:px-7 sm:py-5 shadow-[0_20px_40px_rgba(6,16,31,0.35)]">
              <div className="text-3xl sm:text-[38px] font-extrabold text-primary-500 leading-none">150k+</div>
              <div className="mt-1 text-[13px] sm:text-sm font-semibold text-white/90">Clienți mulțumiți</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-primary-500" aria-hidden="true" />
              <p className="text-sm font-bold uppercase tracking-wider text-primary-500">De ce să ne alegi</p>
            </div>
            <h2 className="text-3xl lg:text-[2.4rem] font-extrabold text-secondary-900 leading-[1.15] mb-5">
              Expertiză și încredere în obținerea documentelor oficiale
            </h2>
            <p className="text-base lg:text-[17px] leading-relaxed text-neutral-600 mb-8">
              Din 2023, oferim asistență profesională românilor din țară și din diaspora. Avocatul nostru colaborator,
              înscris în Barou, te reprezintă în fața autorităților pentru obținerea <strong className="text-secondary-900">cazierului
              judiciar</strong>, a <strong className="text-secondary-900">certificatelor de stare civilă</strong> și a altor documente
              oficiale — fără deplasări la ghișee.
            </p>

            <div className="space-y-3">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="group relative flex items-start gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-500/50 hover:shadow-[0_12px_30px_-10px_rgba(6,16,31,0.18)]"
                >
                  {/* accent gold stânga la hover */}
                  <span className="absolute left-0 top-5 h-[calc(100%-2.5rem)] w-1 origin-top scale-y-0 rounded-r bg-primary-500 transition-transform duration-300 group-hover:scale-y-100" aria-hidden="true" />
                  <span className="flex h-12 w-12 min-w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 shadow-[0_6px_16px_-4px_rgba(236,185,95,0.6)]">
                    <b.icon className="h-6 w-6 text-secondary-900" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[15px] sm:text-base font-bold text-secondary-900 mb-1">{b.title}</h3>
                    <p className="text-sm leading-relaxed text-neutral-600">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats — carduri */}
            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-neutral-200/80 bg-white px-2 py-4 text-center"
                >
                  <div className="text-2xl sm:text-[28px] font-extrabold text-primary-500 leading-none">{s.value}</div>
                  <div className="mt-1.5 text-[11px] sm:text-[13px] text-neutral-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
