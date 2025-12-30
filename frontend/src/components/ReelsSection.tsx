'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface Reel {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string | null;
  instagram_reel_url: string | null;
  youtube_short_url: string | null;
}

interface ReelsSectionProps {
  reels: Reel[];
}

// Helper function to extract Instagram Reel ID from URL
function getInstagramReelId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

// Helper function to extract YouTube Video ID from URL
function getYouTubeVideoId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

export default function ReelsSection({ reels }: ReelsSectionProps) {
  const [visibleReels, setVisibleReels] = useState<Set<string>>(new Set());
  const reelRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const reelId = entry.target.getAttribute('data-reel-id');
          if (reelId) {
            if (entry.isIntersecting) {
              setVisibleReels((prev) => new Set(prev).add(reelId));
            } else {
              setVisibleReels((prev) => {
                const next = new Set(prev);
                next.delete(reelId);
                return next;
              });
            }
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the reel is visible for better auto-play
        rootMargin: '50px', // Start loading slightly before entering viewport
      }
    );

    reelRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      reelRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [reels]);

  if (reels.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="heading-serif-md mb-4">Reels</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Watch our latest Instagram reels and YouTube shorts
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {reels.map((reel) => {
          const instagramReelId = getInstagramReelId(reel.instagram_reel_url);
          const youtubeVideoId = getYouTubeVideoId(reel.youtube_short_url);
          const isVisible = visibleReels.has(reel.id);
          const hasVideo = instagramReelId || youtubeVideoId;

          return (
            <div
              key={reel.id}
              ref={(el) => {
                if (el) reelRefs.current.set(reel.id, el);
              }}
              data-reel-id={reel.id}
              className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-[9/16]"
            >
              {hasVideo ? (
                <Link href={`/stories/${reel.slug}`} className="block w-full h-full">
                  {instagramReelId && (
                    <div className="w-full h-full relative">
                      {isVisible ? (
                        <iframe
                          src={`https://www.instagram.com/reel/${instagramReelId}/embed/`}
                          title={reel.title}
                          className="w-full h-full border-0"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          scrolling="no"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          {reel.featured_image_url ? (
                            <Image
                              src={reel.featured_image_url}
                              alt={reel.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                          ) : (
                            <div className="text-gray-400 text-center p-4">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              <p className="text-sm">{reel.title}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {youtubeVideoId && !instagramReelId && (
                    <div className="w-full h-full relative">
                      {isVisible ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=1&modestbranding=1&rel=0&enablejsapi=1`}
                          title={reel.title}
                          className="w-full h-full border-0"
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          {reel.featured_image_url ? (
                            <Image
                              src={reel.featured_image_url}
                              alt={reel.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                          ) : (
                            <div className="text-gray-400 text-center p-4">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              <p className="text-sm">{reel.title}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              ) : (
                <Link href={`/stories/${reel.slug}`} className="block w-full h-full">
                  {reel.featured_image_url ? (
                    <Image
                      src={reel.featured_image_url}
                      alt={reel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <p className="text-sm text-center p-4">{reel.title}</p>
                    </div>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {reels.length > 0 && (
        <div className="text-center mt-12">
          <Link href="/stories" className="btn-outline">
            View All Reels
          </Link>
        </div>
      )}
    </section>
  );
}

