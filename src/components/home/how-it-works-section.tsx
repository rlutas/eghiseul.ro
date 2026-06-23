import { Check, Users, CalendarDays, Star } from 'lucide-react';

const STEPS = [
  {
    number: '1',
    title: 'Alegi documentul și completezi cererea',
    desc: (
      <>
        Selectează serviciul dorit — <strong>cazier judiciar online</strong>, <strong>certificat de integritate</strong>,{' '}
        <strong>cazier fiscal</strong>, <strong>cazier auto</strong> sau certificat de stare civilă. Completezi
        formularul în doar 2 minute.
      </>
    ),
    benefits: ['Formular simplu, pași clari', 'Disponibil 24/7'],
  },
  {
    number: '2',
    title: 'Avocatul colaborator preia cererea ta',
    desc: (
      <>
        Plătești online cu cardul în siguranță (criptare SSL). Avocatul nostru colaborator, înscris în Barou, depune
        cererea în numele tău la instituțiile competente pentru <strong>certificate de naștere</strong>,{' '}
        <strong>căsătorie</strong>, <strong>celibat</strong> sau alte <strong>acte</strong>.
      </>
    ),
    benefits: ['Protecție date GDPR', 'Verificare automată a erorilor'],
  },
  {
    number: '3',
    title: 'Primești documentul acasă sau pe email',
    desc: (
      <>
        <strong>Cazierul judiciar</strong>, <strong>certificatele de naștere</strong>, <strong>căsătorie</strong>,{' '}
        <strong>celibat</strong> și <strong>cazierul fiscal/auto</strong> ajung la tine prin curier în 24-48h.
        Extrasul de carte funciară, certificatul constatator și rovinieta le primești instant pe email.
      </>
    ),
    benefits: ['Livrare națională și internațională', 'Tracking și notificare email'],
  },
];

const TRUST = [
  { icon: Users, value: '200.000+', label: 'Proceduri' },
  { icon: CalendarDays, value: 'Din 2023', label: 'Experiență' },
  { icon: Star, value: '4.9 / 5', label: 'Rating Google' },
];

export function HowItWorksSection() {
  return (
    <section id="cum-functioneaza" className="bg-neutral-50 py-16 lg:py-20">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-14">
          <h2 className="text-3xl lg:text-[2.25rem] font-extrabold text-secondary-900 leading-tight mb-4">
            Cum obții <span className="text-primary-500">documente online</span> în 3 pași
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-[650px] mx-auto">
            Cazier judiciar, certificate de stare civilă, extras carte funciară și alte acte — direct la
            tine acasă, fără cozi la ghișee.
          </p>
        </div>

        {/* Pași */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-[500px] lg:max-w-none mx-auto mb-10">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative rounded-2xl bg-white p-7 lg:p-8 shadow-[0_4px_14px_rgba(6,16,31,0.06)] border border-transparent hover:border-primary-500/40 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(6,16,31,0.1)] transition-all duration-300"
            >
              {/* Accent gold sus-stânga */}
              <span className="absolute top-0 left-7 h-[3px] w-10 rounded-b bg-primary-500" aria-hidden="true" />

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/15">
                <span className="text-[22px] font-extrabold text-primary-600">{step.number}</span>
              </div>

              <h3 className="text-xl font-bold text-secondary-900 leading-snug mb-3.5">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-neutral-600 mb-4">{step.desc}</p>

              <ul className="border-t border-neutral-100 pt-4 space-y-1.5">
                {step.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-[13px] text-neutral-600">
                    <Check className="h-4 w-4 flex-shrink-0 text-primary-500" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 rounded-2xl bg-white px-6 sm:px-10 py-6 shadow-[0_4px_14px_rgba(6,16,31,0.06)] max-w-[760px] mx-auto">
          {TRUST.map((t, i) => (
            <div key={t.label} className="flex items-center gap-x-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary-500/15">
                  <t.icon className="h-[22px] w-[22px] text-primary-600" aria-hidden="true" />
                </div>
                <div>
                  <strong className="block text-lg font-bold text-secondary-900 leading-tight">{t.value}</strong>
                  <span className="text-[13px] text-neutral-600">{t.label}</span>
                </div>
              </div>
              {i < TRUST.length - 1 && <span className="hidden sm:block h-10 w-px bg-neutral-200" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
