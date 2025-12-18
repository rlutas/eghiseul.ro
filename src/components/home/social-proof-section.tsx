import { Users, FileText, Star, Clock, Shield, Award } from 'lucide-react';

const stats = [
  {
    icon: FileText,
    value: '200,000+',
    label: 'Documente procesate',
    description: 'Din 2023 până în prezent',
  },
  {
    icon: Users,
    value: '150,000+',
    label: 'Clienți mulțumiți',
    description: 'Persoane fizice și juridice',
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'Rating Google',
    description: 'Peste 391 recenzii',
  },
  {
    icon: Clock,
    value: '24-48h',
    label: 'Timp de livrare',
    description: 'Pentru majoritatea documentelor',
  },
];

const trustBadges = [
  { icon: Shield, label: 'SSL Securizat' },
  { icon: Award, label: 'GDPR Compliant' },
  { icon: FileText, label: 'Documente Oficiale' },
];

export function SocialProofSection() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-[1100px]">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center">
                <stat.icon className="w-7 h-7 text-primary-600" />
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-secondary-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-secondary-700 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-neutral-500">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 lg:gap-8">
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-5 py-3 bg-secondary-900/5 rounded-full"
            >
              <badge.icon className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-secondary-700">
                {badge.label}
              </span>
            </div>
          ))}
        </div>

        {/* Client Logos / Partners */}
        <div className="mt-12 pt-12 border-t border-neutral-200">
          <p className="text-center text-sm text-neutral-500 mb-8 font-medium">
            Documente recunoscute și acceptate de instituțiile statului român
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
            {['MAI', 'ANAF', 'ANCPI', 'DEPABD', 'Primării'].map((partner, i) => (
              <div
                key={i}
                className="px-6 py-3 bg-neutral-100 rounded-lg text-secondary-900 font-bold text-sm"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
