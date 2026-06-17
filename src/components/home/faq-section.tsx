'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HOMEPAGE_FAQS } from './faq-data';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="intrebari" className="py-16 lg:py-24 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-[900px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Întrebări frecvente
          </span>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-secondary-900 mb-4">
            Ai întrebări? Avem răspunsuri!
          </h2>
          <p className="text-lg text-neutral-600">
            Cele mai frecvente întrebări despre serviciile noastre
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {HOMEPAGE_FAQS.map((faq, index) => (
            <div
              key={index}
              className={cn(
                'bg-white rounded-2xl border transition-all duration-300',
                openIndex === index
                  ? 'border-primary-300 shadow-lg'
                  : 'border-neutral-200 hover:border-primary-200'
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="text-base font-semibold text-secondary-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-primary-500 flex-shrink-0 transition-transform duration-200',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                )}
              >
                <p className="px-6 pb-5 text-neutral-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-neutral-200">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="text-sm text-neutral-500">Nu ai găsit răspunsul?</p>
              <a
                href="mailto:contact@eghiseul.ro"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Contactează-ne
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
