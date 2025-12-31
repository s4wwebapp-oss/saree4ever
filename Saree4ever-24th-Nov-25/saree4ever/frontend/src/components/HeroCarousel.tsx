'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  button_target: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (!mounted || !isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted, isAutoPlaying, slides.length]);

  if (!slides || slides.length === 0) {
    return null;
  }

  // Render static version during SSR to match initial client render
  if (!mounted) {
    return (
      <section className="relative w-full h-[40vh] md:h-[80vh] bg-black overflow-hidden">
        <div className="relative w-full h-full">
          {slides[0] && (
            <div className="absolute inset-0 opacity-100 z-10">
              <div className="relative w-full h-full">
                <Image
                  src={slides[0].image_url}
                  alt={slides[0].title || 'Hero slide'}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-4 max-w-4xl mx-auto z-20">
                    {slides[0].title && (
                      <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif text-white mb-2 md:mb-6">
                        {slides[0].title}
                      </h1>
                    )}
                    {slides[0].subtitle && (
                      <p className="text-sm md:text-lg lg:text-xl mb-4 md:mb-8 max-w-2xl mx-auto">
                        {slides[0].subtitle}
                      </p>
                    )}
                    {slides[0].button_text && slides[0].button_link && (
                      <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center">
                        <Link
                          href={slides[0].button_link}
                          target={slides[0].button_target || '_self'}
                          className="btn-primary text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
                        >
                          {slides[0].button_text}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false); // Pause auto-play when user manually selects
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="relative w-full h-[40vh] md:h-[80vh] bg-black overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.image_url}
                alt={slide.title || 'Hero slide'}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-4xl mx-auto z-20">
                  {slide.title && (
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif text-white mb-2 md:mb-6">
                      {slide.title}
                    </h1>
                  )}
                  {slide.subtitle && (
                    <p className="text-sm md:text-lg lg:text-xl mb-4 md:mb-8 max-w-2xl mx-auto">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.button_text && slide.button_link && (
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center">
                      <Link
                        href={slide.button_link}
                        target={slide.button_target || '_self'}
                        className="btn-primary text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
                      >
                        {slide.button_text}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-1.5 md:p-2 rounded-full transition-all"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-1.5 md:p-2 rounded-full transition-all"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-6 md:w-8 bg-white'
                  : 'w-1.5 md:w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

