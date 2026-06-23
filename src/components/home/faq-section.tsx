'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HOMEPAGE_FAQ_ITEMS } from './faq-data';

const WHATSAPP =
  'https://wa.me/40757708181?text=' +
  encodeURIComponent('Bună ziua! Am o întrebare despre serviciile eGhișeul.ro.');

const ANSWER_PROSE =
  'text-[15px] leading-relaxed text-neutral-600 [&_p]:mb-3 [&_p:last-child]:mb-0 ' +
  '[&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_li]:pl-1 ' +
  '[&_strong]:text-secondary-900 [&_strong]:font-semibold';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="intrebari" className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 max-w-[900px]">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-wider text-primary-500 mb-3">Întrebări frecvente</p>
          <h2 className="text-3xl lg:text-[2.25rem] font-extrabold text-secondary-900 leading-tight mb-4">
            Ai întrebări? Avem răspunsuri
          </h2>
          <p className="text-lg text-neutral-600 max-w-[600px] mx-auto">
            Află tot ce trebuie să știi despre obținerea documentelor online prin eGhișeul.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {HOMEPAGE_FAQ_ITEMS.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={faq.question}
                className={cn(
                  'rounded-2xl border bg-neutral-50 transition-all duration-300',
                  open ? 'border-primary-500 shadow-[0_6px_20px_rgba(236,185,95,0.15)]' : 'border-neutral-200 hover:border-primary-300'
                )}
              >
                <button
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <h3 className="text-base sm:text-[17px] font-bold text-secondary-900 leading-snug">{faq.question}</h3>
                  <span
                    className={cn(
                      'flex h-8 w-8 min-w-8 items-center justify-center rounded-lg transition-all duration-300',
                      open ? 'bg-primary-500' : 'bg-primary-500/15'
                    )}
                  >
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform duration-300', open ? 'rotate-180 text-secondary-900' : 'text-primary-600')}
                    />
                  </span>
                </button>
                {open && <div className={cn('px-6 pb-6', ANSWER_PROSE)}>{faq.answer}</div>}
              </div>
            );
          })}
        </div>

        {/* CTA WhatsApp */}
        <div className="mt-12 rounded-3xl border border-neutral-200 bg-neutral-50 p-8 sm:p-10 text-center">
          <p className="text-[17px] text-neutral-600 mb-5">Nu ai găsit răspunsul? Scrie-ne și te ajutăm imediat!</p>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="nofollow noopener"
            className="inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] px-7 py-3.5 font-bold text-white hover:bg-[#20bd5a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,211,102,0.3)] transition-all"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Întreabă pe WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
