'use client';

import { useState, useRef, useEffect } from 'react';

interface Video {
  id: string;
  video_url: string | null;
  video_file_path: string | null;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  display_order: number;
  video_orientation?: 'horizontal' | 'vertical';
}

interface LandingPageVideoSectionProps {
  videos: Video[];
}

export default function LandingPageVideoSection({ videos }: LandingPageVideoSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(videos.length > 1);
  const [videoOrientations, setVideoOrientations] = useState<Record<string, 'vertical' | 'horizontal'>>({});

  useEffect(() => {
    setShowControls(videos.length > 1);
  }, [videos.length]);

  const scrollToVideo = (index: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const videoElement = container.children[index] as HTMLElement;
    if (videoElement) {
      videoElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setCurrentIndex(index);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    
    // Calculate which video is in view based on scroll position
    let newIndex = 0;
    let closestDistance = Infinity;
    
    Array.from(container.children).forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const distance = Math.abs(rect.left - containerRect.left);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        newIndex = index;
      }
    });
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollNext = () => {
    if (currentIndex < videos.length - 1) {
      scrollToVideo(currentIndex + 1);
    }
  };

  const scrollPrev = () => {
    if (currentIndex > 0) {
      scrollToVideo(currentIndex - 1);
    }
  };

  if (videos.length === 0) {
    return null;
  }

  const getVideoUrl = (video: Video) => {
    // Prefer video_url if it exists (should be a full URL from backend)
    if (video.video_url) {
      // Ensure URL is absolute (starts with http:// or https://)
      if (video.video_url.startsWith('http://') || video.video_url.startsWith('https://')) {
        return video.video_url;
      }
      // If relative URL, make it absolute using current origin or API URL
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace('/api', '');
      return `${baseUrl}${video.video_url.startsWith('/') ? video.video_url : `/${video.video_url}`}`;
    }
    
    // Fallback: construct URL from video_file_path if available
    if (video.video_file_path) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        // Ensure Supabase URL doesn't have trailing slash
        const cleanSupabaseUrl = supabaseUrl.replace(/\/$/, '');
        return `${cleanSupabaseUrl}/storage/v1/object/public/landing-videos/${video.video_file_path}`;
      }
      // If Supabase URL not available, try to construct from API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const baseUrl = apiUrl.replace('/api', '');
      return `${baseUrl}/api/uploads/landing-videos/${video.video_file_path}`;
    }
    
    return null;
  };

  const getVideoEmbedInfo = (url: string, video: Video) => {
    // Use stored orientation preference if available, otherwise auto-detect
    const hasStoredOrientation = video.video_orientation !== undefined && video.video_orientation !== null;
    
    // Check if it's a YouTube URL (including Shorts)
    let videoId = null;
    let isShorts = false;
    // Try standard YouTube patterns first
    const standardMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (standardMatch) {
      videoId = standardMatch[1];
    } else {
      // Try YouTube Shorts pattern (shorts/VIDEO_ID)
      const shortsMatch = url.match(/youtube\.com\/shorts\/([^"&?\/\s]+)/);
      if (shortsMatch) {
        videoId = shortsMatch[1];
        isShorts = true;
      }
    }
    
    if (videoId) {
      // Use stored orientation if available, otherwise default to Shorts = vertical
      const isVertical = hasStoredOrientation 
        ? video.video_orientation === 'vertical'
        : isShorts;
      
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=${video.autoplay ? 1 : 0}&mute=${video.muted ? 1 : 0}&loop=${video.loop ? 1 : 0}&playlist=${video.loop ? videoId : ''}`,
        isVertical,
      };
    }

    // Check if it's a Vimeo URL
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(?:.*\/)?(\d+)/);
    if (vimeoMatch) {
      const vimeoId = vimeoMatch[1];
      // Use stored orientation if available, otherwise default to horizontal
      const isVertical = hasStoredOrientation 
        ? video.video_orientation === 'vertical'
        : false;
      
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=${video.autoplay ? 1 : 0}&muted=${video.muted ? 1 : 0}&loop=${video.loop ? 1 : 0}`,
        isVertical,
      };
    }

    // Direct video file - use stored orientation if available, otherwise detect from metadata
    const isVertical = hasStoredOrientation
      ? video.video_orientation === 'vertical'
      : videoOrientations[video.id] === 'vertical';
    
    return {
      type: 'direct',
      url: url,
      isVertical,
    };
  };

  const handleVideoLoadedMetadata = (video: Video, e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = e.currentTarget;
    const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
    const isVertical = aspectRatio < 1; // Height > Width (vertical/reel format)
    
    setVideoOrientations(prev => ({
      ...prev,
      [video.id]: isVertical ? 'vertical' : 'horizontal',
    }));
  };

  return (
    <section className="w-full py-8 md:py-12 bg-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide items-center"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {videos.map((video, index) => {
            const videoUrl = getVideoUrl(video);
            if (!videoUrl) return null;

            const embedInfo = getVideoEmbedInfo(videoUrl, video);

            // Determine aspect ratio based on video type and orientation
            const isVertical = embedInfo.isVertical || false;

            return (
              <div
                key={video.id}
                className={`flex-shrink-0 snap-center ${isVertical ? 'flex items-center justify-center min-h-[80vh] px-4' : 'w-full'}`}
              >
                <div className={`relative ${isVertical ? 'aspect-[9/16] w-[280px] sm:w-[320px] md:w-[400px] flex-shrink-0' : 'w-full aspect-video'} bg-black rounded-lg overflow-hidden`}>
                  {embedInfo.type === 'youtube' || embedInfo.type === 'vimeo' ? (
                    <iframe
                      src={embedInfo.embedUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ pointerEvents: 'auto' }}
                    />
                  ) : (
                    <video
                      src={embedInfo.url}
                      autoPlay={video.autoplay}
                      muted={video.muted}
                      loop={video.loop}
                      playsInline
                      className="w-full h-full object-cover"
                      controls={false}
                      crossOrigin="anonymous"
                      preload="metadata"
                      onLoadedMetadata={(e) => handleVideoLoadedMetadata(video, e)}
                      onError={(e) => {
                        console.error('Video loading error:', {
                          videoId: video.id,
                          url: embedInfo.url,
                          error: e
                        });
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Controls - Only show if more than 1 video */}
        {showControls && videos.length > 1 && (
          <>
            {/* Previous Button */}
            {currentIndex > 0 && (
              <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                aria-label="Previous video"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {currentIndex < videos.length - 1 && (
              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                aria-label="Next video"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToVideo(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? 'w-8 bg-black' : 'w-2 bg-gray-300'
                  }`}
                  aria-label={`Go to video ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}





