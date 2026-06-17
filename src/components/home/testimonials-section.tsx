'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REVIEWS } from '@/config/reviews';
import { GOOGLE_REVIEWS_URL } from '@/config/contact';

// Real Google reviews (config/reviews.ts) — name + relative time, verbatim text.
const testimonials = REVIEWS.map((r) => ({
  name: r.name,
  when: r.when,
  content: r.text,
  rating: r.rating,
  avatar: r.name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
}));

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.ceil(testimonials.length / 3) - 1 : prev - 1
    );
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex * 3,
    currentIndex * 3 + 3
  );

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-[1100px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Recenzii verificate
          </span>
          <h2 className="text-2xl lg:text-4xl font-extrabold text-secondary-900 mb-4">
            Ce spun clienții noștri
          </h2>
          <div className="flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-6 h-6 text-[#FBBC04] fill-[#FBBC04]"
              />
            ))}
            <span className="text-lg font-bold text-secondary-900 ml-2">4.9/5</span>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-primary-700 underline-offset-2 hover:underline transition-colors"
            >
              • 450+ recenzii pe Google
            </a>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Quote className="w-5 h-5 text-primary-600" />
              </div>

              {/* Content */}
              <p className="text-secondary-700 leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#FBBC04] fill-[#FBBC04]"
                  />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-secondary-900 font-bold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-secondary-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Recenzie Google • {testimonial.when}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-3 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="rounded-full border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-full border-neutral-200 hover:border-primary-300 hover:bg-primary-50"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
