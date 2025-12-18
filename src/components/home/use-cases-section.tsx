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
    description: 'Documente de stare civilă apostilate pentru facultăți din Europa',
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
    <section className="py-16 lg:py-24 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-[1100px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Situații frecvente
          </span>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-secondary-900 mb-4">
            Când ai nevoie de serviciile noastre?
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Indiferent de situație, te ajutăm să obții documentele necesare rapid și fără bătăi de cap
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="relative group bg-white rounded-2xl p-6 border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
            >
              {useCase.highlight && (
                <span className="absolute -top-3 right-4 px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full">
                  {useCase.highlight}
                </span>
              )}
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <useCase.icon className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">
                {useCase.title}
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
