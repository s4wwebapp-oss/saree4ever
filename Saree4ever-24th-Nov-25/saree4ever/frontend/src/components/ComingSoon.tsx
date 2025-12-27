'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ComingSoonMedia {
  id: string;
  media_type: 'video' | 'image';
  media_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  media: ComingSoonMedia[];
}

export default function ComingSoon({ title = 'Coming Soon', subtitle = 'We are working on something amazing!', media = [] }: ComingSoonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter active media
  const activeMedia = media.filter(m => m);

  useEffect(() => {
    // Initialize video refs array
    videoRefs.current = videoRefs.current.slice(0, activeMedia.length);
  }, [activeMedia.length]);

  useEffect(() => {
    // Auto-play current video
    if (activeMedia.length > 0 && activeMedia[currentIndex]?.media_type === 'video') {
      const video = videoRefs.current[currentIndex];
      if (video) {
        video.currentTime = 0;
        video.play().catch(err => {
          console.log('Autoplay prevented:', err);
        });
      }
    }

    // Pause other videos
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex) {
        video.pause();
      }
    });
  }, [currentIndex, activeMedia]);

  // Handle scroll to change media
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollStartY = 0;
    let isScrolling = false;

    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return;

      const deltaY = e.deltaY;
      const threshold = 50; // Minimum scroll distance

      if (Math.abs(deltaY) > threshold) {
        isScrolling = true;
        setIsScrolling(true);

        if (deltaY > 0 && currentIndex < activeMedia.length - 1) {
          // Scroll down - next media
          setCurrentIndex(prev => prev + 1);
        } else if (deltaY < 0 && currentIndex > 0) {
          // Scroll up - previous media
          setCurrentIndex(prev => prev - 1);
        }

        // Reset scrolling flag after animation
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          isScrolling = false;
          setIsScrolling(false);
        }, 800);
      }

      e.preventDefault();
    };

    const handleTouchStart = (e: TouchEvent) => {
      scrollStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrolling) return;

      const touchY = e.touches[0].clientY;
      const deltaY = scrollStartY - touchY;
      const threshold = 50;

      if (Math.abs(deltaY) > threshold) {
        isScrolling = true;
        setIsScrolling(true);

        if (deltaY > 0 && currentIndex < activeMedia.length - 1) {
          // Swipe up - next media
          setCurrentIndex(prev => prev + 1);
        } else if (deltaY < 0 && currentIndex > 0) {
          // Swipe down - previous media
          setCurrentIndex(prev => prev - 1);
        }

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          isScrolling = false;
          setIsScrolling(false);
        }, 800);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentIndex, activeMedia.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return;

      if (e.key === 'ArrowDown' && currentIndex < activeMedia.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeMedia.length, isScrolling]);

  if (activeMedia.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
          <p className="text-xl md:text-2xl">{subtitle}</p>
        </div>
      </div>
    );
  }

  const currentMedia = activeMedia[currentIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      {/* Media Display */}
      <div className="absolute inset-0">
        {currentMedia.media_type === 'video' ? (
          <video
            ref={(el) => {
              videoRefs.current[currentIndex] = el;
            }}
            src={currentMedia.media_url}
            autoPlay={currentMedia.autoplay !== false}
            muted={currentMedia.muted !== false}
            loop={currentMedia.loop !== false}
            playsInline
            className="w-full h-full object-cover"
            onEnded={() => {
              // Auto-advance to next media when video ends (if not looping)
              if (!currentMedia.loop && currentIndex < activeMedia.length - 1) {
                setTimeout(() => setCurrentIndex(prev => prev + 1), 500);
              }
            }}
          />
        ) : (
          <Image
            src={currentMedia.media_url}
            alt={currentMedia.title || 'Coming Soon'}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Overlay with title and subtitle */}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
        <div className="text-center text-white px-4">
          {currentMedia.title && (
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-4 drop-shadow-2xl">
              {currentMedia.title}
            </h1>
          )}
          {currentMedia.description && (
            <p className="text-xl md:text-2xl lg:text-3xl drop-shadow-lg max-w-3xl mx-auto">
              {currentMedia.description}
            </p>
          )}
          {!currentMedia.title && !currentMedia.description && (
            <>
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-4 drop-shadow-2xl">
                {title}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl drop-shadow-lg">
                {subtitle}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Navigation Indicators */}
      {activeMedia.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {activeMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      {activeMedia.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 text-white/70 text-sm animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span>Scroll to navigate</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
