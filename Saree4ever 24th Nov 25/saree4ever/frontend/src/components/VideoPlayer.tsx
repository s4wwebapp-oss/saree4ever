'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  title?: string;
  className?: string;
}

// Helper function to extract Instagram Reel ID from URL
function getInstagramReelId(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

// Helper function to extract YouTube Video ID from URL
function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

export default function VideoPlayer({ instagramUrl, youtubeUrl, title, className = '' }: VideoPlayerProps) {
  const [videoType, setVideoType] = useState<'instagram' | 'youtube' | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (instagramUrl) {
      const reelId = getInstagramReelId(instagramUrl);
      if (reelId) {
        setVideoType('instagram');
        setVideoId(reelId);
        // Instagram embed URL format
        setEmbedUrl(`https://www.instagram.com/reel/${reelId}/embed/`);
      }
    } else if (youtubeUrl) {
      const videoId = getYouTubeVideoId(youtubeUrl);
      if (videoId) {
        setVideoType('youtube');
        setVideoId(videoId);
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
      }
    }
  }, [instagramUrl, youtubeUrl]);

  if (!embedUrl || !videoType) {
    return null;
  }

  if (videoType === 'instagram') {
    return (
      <div className={`w-full ${className}`} ref={containerRef}>
        <div className="relative w-full" style={{ paddingBottom: '125%' }}>
          <iframe
            src={embedUrl}
            title={title || 'Instagram Reel'}
            className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
            allow="encrypted-media"
            allowFullScreen
            scrolling="no"
          />
        </div>
        {instagramUrl && (
          <div className="mt-4 text-center">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-black hover:underline inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
              </svg>
              Watch on Instagram
            </a>
          </div>
        )}
      </div>
    );
  }

  if (videoType === 'youtube') {
    return (
      <div className={`w-full ${className}`} ref={containerRef}>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={`${embedUrl}?rel=0&modestbranding=1`}
            title={title || 'YouTube Video'}
            className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {youtubeUrl && (
          <div className="mt-4 text-center">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-black hover:underline inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Watch on YouTube
            </a>
          </div>
        )}
      </div>
    );
  }

  return null;
}


