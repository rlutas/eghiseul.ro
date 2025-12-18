import { X, Check, Clock, MapPin, FileX, AlertCircle } from 'lucide-react';

const painPoints = [
  {
    icon: Clock,
    problem: 'Ore pierdute la cozi',
    solution: 'Procesăm totul online în 24-48h',
  },
  {
    icon: MapPin,
    problem: 'Deplasări la ghișee',
    solution: 'Livrăm acasă sau la birou',
  },
  {
    icon: FileX,
    problem: 'Formulare complicate',
    solution: 'Formular simplu în 2 minute',
  },
  {
    icon: AlertCircle,
    problem: 'Risc de erori și respingeri',
    solution: 'Verificăm totul înainte de depunere',
  },
];

export function PainPointsSection() {
  return (
    <section className="py-16 lg:py-24 bg-secondary-900">
      <div className="container mx-auto px-4 max-w-[1100px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-400 text-sm font-semibold rounded-full mb-4">
            De ce eGhișeul.ro?
          </span>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-4">
            Uită de frustrările administrației publice
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Noi ne ocupăm de tot procesul birocratic în locul tău
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {painPoints.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:border-primary-500/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-error-500/20 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-error-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="w-5 h-5 text-error-400" />
                    <span className="text-white/60 font-medium line-through">
                      {item.problem}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success-400" />
                    <span className="text-white font-semibold">
                      {item.solution}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/60 text-sm mb-4">
            Alătură-te celor peste 150.000 de clienți care au ales calea simplă
          </p>
          <div className="flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-[#FBBC04] fill-[#FBBC04]"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span className="text-white font-bold ml-2">4.9/5</span>
            <span className="text-white/50 text-sm">pe Google Reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
