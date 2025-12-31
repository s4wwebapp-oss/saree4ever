'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export interface ComingSoonMedia {
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

export interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  media: ComingSoonMedia[];
}

interface DetailBlockEntry {
  text: string;
  href?: string; // Make href optional
}

const DEFAULT_POSTER_DETAILS = {
  headline: 'Welcome', // Edit this text to change the headline above the main title
  brandName: 'SAREE4EVER',
  dateLine: '4th Jan 2026',
  timeLine: '10 AM onwards',
  venue: [
    'Opp. to Asha Kirana Blind School, Kemmanahalli',
    'Chikkamagaluru - 577101, Karnataka',
  ],
  instagram: '@saree4ever',
  website: 'www.Saree4ever.com',
  contact: '+91 8088 393915',
};

// Event date: January 4, 2026 at 10:00 AM IST (UTC+5:30) = 04:30 UTC
const EVENT_DATE = new Date('2026-01-04T04:30:00.000Z');

// Counter start date: December 26, 2025 at 3:50 PM IST (UTC+5:30) = 10:20 UTC
const COUNTER_START_DATE = new Date('2025-12-26T10:20:00.000Z');

// Calculate time left - returns null if counter hasn't started yet
const getTimeLeft = () => {
  const now = Date.now();
  const startTime = COUNTER_START_DATE.getTime();
  const eventTime = EVENT_DATE.getTime();
  
  // If counter hasn't started yet, return null
  if (now < startTime) {
    return null;
  }
  
  // Calculate time remaining until event
  const diff = Math.max(eventTime - now, 0);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

// Get initial countdown value for SSR (server-side)
// This ensures server and client render the same initial value
const getInitialCountdown = () => {
  // On server, we can't know the exact time, so return zeros
  // The client will update it after hydration
  return { days: 0, hours: 0, minutes: 0, seconds: 0 };
};

export default function ComingSoon({ title = 'GRAND OPENING', subtitle = 'Soon Online Shopping will be on live', media = [] }: ComingSoonProps) {
  // Start with muted=true so videos can autoplay (browsers require muted videos for autoplay)
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // Initialize with fixed server-side value to avoid hydration mismatch
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(getInitialCountdown());
  const [isMounted, setIsMounted] = useState(false);


  // Filter active media
  const activeMedia = media.filter(m => m);
  const detailBlocks: { label: string; entries: DetailBlockEntry[] }[] = [ // Use the new interface here
    {
      label: 'Date & Time',
      entries: [
        { text: DEFAULT_POSTER_DETAILS.dateLine },
        { text: DEFAULT_POSTER_DETAILS.timeLine },
      ],
    },
    {
      label: 'Venue',
      entries: DEFAULT_POSTER_DETAILS.venue.map((line) => ({ text: line })),
    },
    {
      label: 'Follow',
      entries: [
        {
          text: `Instagram ${DEFAULT_POSTER_DETAILS.instagram}`,
          href: 'https://instagram.com/saree4ever',
        },
      ],
    },
    { label: 'Contact', entries: [{ text: DEFAULT_POSTER_DETAILS.contact }] },
  ];

  // Set initial countdown on client mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const timeLeft = getTimeLeft();
    setCountdown(timeLeft);
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (!isMounted) return;
    
    const interval = setInterval(() => {
      const timeLeft = getTimeLeft();
      setCountdown(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMounted]);

  useEffect(() => {
    document.body.classList.add('coming-soon-mode');
    return () => {
      document.body.classList.remove('coming-soon-mode');
    };
  }, []);

  useEffect(() => {
    // Initialize video refs array
    videoRefs.current = videoRefs.current.slice(0, activeMedia.length);
  }, [activeMedia.length]);

  // Auto-play videos on mount and when media changes
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        // Set muted state (required for autoplay)
        video.muted = isMuted;
        // Try to play immediately
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.log('Autoplay prevented:', err);
          });
        }
      }
    });
  }, [isMuted, activeMedia.length]);

  // Sync muted state when it changes
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });
  }, [isMuted]);

  // Toggle mute/unmute
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  if (activeMedia.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white py-20 px-4">
        <div className="text-center px-4 max-w-5xl w-full">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">{title}</h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8">{subtitle}</p>
          {countdown !== null ? (
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4 text-white/90">
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hours', value: countdown.hours },
                { label: 'Minutes', value: countdown.minutes },
                { label: 'Seconds', value: countdown.seconds },
              ].map((unit) => (
                <div key={unit.label} className="min-w-[60px] sm:min-w-[70px]">
                  <div className="text-2xl sm:text-3xl font-bold">{String(unit.value).padStart(2, '0')}</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/70">{unit.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 text-lg sm:text-xl text-white/90">
              Countdown starts on December 26, 2025 at 3:50 PM IST
            </div>
          )}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
            {detailBlocks.map((block) => (
              <div
                key={block.label}
                className="bg-white/10 border border-white/20 p-4 rounded-lg"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-2">
                  {block.label}
                </p>
                {block.entries.map((entry) => (
                  entry.href ? (
                    <p key={entry.text} className="text-sm sm:text-base leading-relaxed">
                      <a
                        href={entry.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                      >
                        {entry.text}
                      </a>
                    </p>
                  ) : (
                    <p key={entry.text} className="text-sm sm:text-base leading-relaxed">
                      {entry.text}
                    </p>
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black">
      {/* Mute/Unmute Button - Fixed Top Right - Always visible when videos are present */}
      {activeMedia.some(m => m.media_type === 'video') && (
        <button
          onClick={toggleMute}
          className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[100] p-1.5 sm:p-2 bg-black/30 hover:bg-black/50 rounded-full transition-all backdrop-blur-sm"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          style={{ pointerEvents: 'auto' }}
        >
          {isMuted ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      )}

      {/* Scrollable Media Sections */}
      {activeMedia.map((mediaItem, index) => (
        <section
          key={mediaItem.id || index}
          className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
        >
          {/* Media Background */}
          <div className="absolute inset-0 w-full h-full">
            {mediaItem.media_type === 'video' ? (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                  if (el) {
                    // Set muted state for autoplay to work
                    el.muted = isMuted;
                    // Try to play immediately when video element is ready
                    el.addEventListener('loadeddata', () => {
                      el.muted = isMuted;
                      el.play().catch(err => {
                        console.log('Autoplay prevented on load:', err);
                      });
                    });
                    // Also try to play if already loaded
                    if (el.readyState >= 2) {
                      el.muted = isMuted;
                      el.play().catch(err => {
                        console.log('Autoplay prevented:', err);
                      });
                    }
                  }
                }}
                src={mediaItem.media_url}
                autoPlay={mediaItem.autoplay !== false}
                muted={isMuted}
                loop={mediaItem.loop !== false}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={mediaItem.media_url}
                alt={mediaItem.title || 'Grand Opening'}
                fill
                className="object-cover"
                priority={index === 0}
              />
            )}
          </div>

          {/* Overlay with content - Only show on first media item or if media has title/description */}
          {(index === 0 || mediaItem.title || mediaItem.description) && (
            <div className="relative z-10 w-full min-h-screen flex items-center justify-center bg-black/35 px-4 py-16 sm:py-20">
              <div className="text-center text-white px-4 max-w-5xl w-full">
                <p className="text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.5em] text-white/70 mb-3 sm:mb-4">
                  {index === 0 ? DEFAULT_POSTER_DETAILS.headline : ''}
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 drop-shadow-2xl">
                  {mediaItem.title || (index === 0 ? (title || DEFAULT_POSTER_DETAILS.brandName) : '')}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl drop-shadow-lg max-w-3xl mx-auto">
                  {mediaItem.description || (index === 0 ? (subtitle || `${DEFAULT_POSTER_DETAILS.dateLine} · ${DEFAULT_POSTER_DETAILS.timeLine}`) : '')}
                </p>

                {/* Countdown Timer - Only show on first section */}
                {index === 0 && (
                  <>
                    {countdown !== null ? (
                      <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-white/90">
                        {[
                          { label: 'Days', value: countdown.days },
                          { label: 'Hours', value: countdown.hours },
                          { label: 'Minutes', value: countdown.minutes },
                          { label: 'Seconds', value: countdown.seconds },
                        ].map((unit) => (
                          <div key={unit.label} className="min-w-[60px] sm:min-w-[70px] text-center">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold">{String(unit.value).padStart(2, '0')}</div>
                            <div className="text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/70">{unit.label}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl text-white/90">
                        Countdown starts on December 26, 2025 at 3:50 PM IST
                      </div>
                    )}

                    {/* Detail Blocks - Only show on first section */}
                    <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                      {detailBlocks.map((block) => (
                        <div
                          key={block.label}
                          className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 sm:p-4 rounded-lg shadow-lg"
                        >
                          <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-2">
                            {block.label}
                          </p>
                          {block.entries.map((entry) => (
                            entry.href ? (
                              <p key={entry.text} className="text-sm sm:text-base md:text-lg leading-relaxed">
                                <a
                                  href={entry.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-white"
                                >
                                  {entry.text}
                                </a>
                              </p>
                            ) : (
                              <p key={entry.text} className="text-sm sm:text-base md:text-lg leading-relaxed">
                                {entry.text}
                              </p>
                            )
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
