import { Zap, Lock, Shield } from 'lucide-react';

interface TrustFeatureProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
}

function TrustFeature({ icon, iconColor, iconBgColor, title, description }: TrustFeatureProps) {
  return (
    <div className="text-center space-y-4">
      {/* Icon */}
      <div className={`w-16 h-16 mx-auto ${iconBgColor} rounded-2xl flex items-center justify-center`}>
        <div className={iconColor}>
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-neutral-900">
        {title}
      </h3>

      {/* Description */}
      <p className="text-neutral-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function TrustSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            De Ce eGhiseul.ro?
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Peste 10,000 de clienti multumiti ne-au ales pentru simplitate si siguranta
          </p>
        </div>

        {/* Trust Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Feature 1: Fast */}
          <TrustFeature
            icon={<Zap className="h-8 w-8" />}
            title="Rapid"
            description="Primesti documentele in 24-48 ore, fara cozi si deplasari. Procesare automata si livrare prin email."
            iconColor="text-amber-500"
            iconBgColor="bg-amber-50"
          />

          {/* Feature 2: Secure */}
          <TrustFeature
            icon={<Lock className="h-8 w-8" />}
            title="Securizat"
            description="Datele tale sunt criptate si protejate conform GDPR. Stocare securizata pe AWS si autentificare in doi pasi."
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />

          {/* Feature 3: Legal */}
          <TrustFeature
            icon={<Shield className="h-8 w-8" />}
            title="100% Legal"
            description="Colaboram direct cu institutiile statului. Toate documentele sunt oficiale si au valabilitate juridica."
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
          />
        </div>
      </div>
    </section>
  );
}
