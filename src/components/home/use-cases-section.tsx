import { Briefcase, Plane, Home, GraduationCap, Heart, Building } from 'lucide-react';

const useCases = [
  {
    icon: Briefcase,
    title: 'Angajare nouă',
    description: 'Cazier judiciar și certificat de integritate pentru dosarul de angajare',
    highlight: 'Cel mai solicitat',
  },
  {
    icon: Plane,
    title: 'Emigrare / Viză',
    description: 'Cazier apostilat pentru vize de muncă sau rezidență în străinătate',
  },
  {
    icon: Home,
    title: 'Tranzacții imobiliare',
    description: 'Extras de carte funciară și certificat fiscal pentru vânzare/cumpărare',
  },
  {
    icon: GraduationCap,
    title: 'Studii în străinătate',
    description: 'Acte de stare civilă apostilate pentru facultăți din Europa',
  },
  {
    icon: Heart,
    title: 'Căsătorie în străinătate',
    description: 'Certificat de celibat și extras multilingv pentru căsătorie',
  },
  {
    icon: Building,
    title: 'Înființare firmă',
    description: 'Certificat constatator și cazier fiscal pentru SRL/PFA',
  },
];

export function UseCasesSection() {
  return (
    <section className="bg-neutral-50 py-16 lg:py-20">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-14">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-primary-500" aria-hidden="true" />
            <p className="text-sm font-bold uppercase tracking-wider text-primary-500">Situații frecvente</p>
            <span className="h-px w-8 bg-primary-500" aria-hidden="true" />
          </div>
          <h2 className="text-3xl lg:text-[2.25rem] font-extrabold text-secondary-900 leading-tight mb-4">
            Când ai nevoie de serviciile noastre?
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-[600px] mx-auto">
            Indiferent de situație, te ajutăm să obții actele necesare rapid și fără bătăi de cap.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="group relative flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:shadow-[0_14px_34px_-12px_rgba(6,16,31,0.2)]"
            >
              {useCase.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary-900 shadow-[0_4px_12px_rgba(236,185,95,0.4)]">
                  {useCase.highlight}
                </span>
              )}
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 shadow-[0_8px_18px_-6px_rgba(236,185,95,0.65)]">
                <useCase.icon className="h-7 w-7 text-secondary-900" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">{useCase.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-600">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
