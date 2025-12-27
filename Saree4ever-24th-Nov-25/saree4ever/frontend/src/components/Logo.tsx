'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CSSProperties, useEffect } from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | { width: number; height: number };
  backgroundColor?: string;
  link?: boolean;
  href?: string;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  src?: string;
  alt?: string;
}

// Reference size: 256x96px (2.667:1 aspect ratio, 8:3 ratio)
// This matches the recommended logo aspect ratio from LOGO_SIZE_RECOMMENDATIONS.md
const sizePresets = {
  small: { width: 128, height: 48 }, // 2.667:1 ratio
  medium: { width: 200, height: 75 }, // 2.667:1 ratio
  large: { width: 256, height: 96 }, // 2.667:1 ratio (reference size)
  xlarge: { width: 320, height: 120 }, // 2.667:1 ratio
};

export default function Logo({
  size = 'medium',
  backgroundColor = 'white',
  link = true,
  href = '/',
  className = '',
  style = {},
  hover = true,
  src = '/saree4ever-logo.png',
  alt = 'Saree4ever - Drape Your Dreams',
}: LogoProps) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Logo.tsx:28',message:'Logo component render',data:{src,size,backgroundColor,windowLocation:typeof window !== 'undefined' ? window.location.href : 'SSR'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const dimensions = typeof size === 'string' ? sizePresets[size] : size;
  
  useEffect(() => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Logo.tsx:35',message:'Logo component mounted',data:{src,baseUrl:window.location.origin,expectedUrl:`${window.location.origin}${src}`,imageOptimizerUrl:`${window.location.origin}/_next/image?url=${encodeURIComponent(src)}&w=${dimensions.width}&q=75`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion
  }, [src, dimensions.width]);
  
  const containerStyle: CSSProperties = {
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: backgroundColor || 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const logoElement = (
    <div
      className={`logo-container ${hover ? 'logo-hover' : ''} ${className}`}
      style={containerStyle}
    >
      <Image
        src={src}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        className="logo-image"
        priority
        unoptimized={true}
        onLoad={(e) => {
          // #region agent log
          const img = e.currentTarget;
          fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Logo.tsx:56',message:'Image onLoad event',data:{src:img.src,currentSrc:img.currentSrc,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,complete:img.complete,unoptimized:true},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
        }}
        onError={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Logo.tsx:63',message:'Image onError event',data:{src},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        }}
        onLoadingComplete={(img) => {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Logo.tsx:69',message:'Image onLoadingComplete',data:{src:img.src,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,unoptimized:true},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
        }}
        style={{
          objectFit: 'contain',
          width: '100%',
          height: '100%',
          backgroundColor: backgroundColor || 'white',
        }}
      />
    </div>
  );

  if (link) {
    return (
      <Link href={href} style={{ display: 'inline-block', textDecoration: 'none' }}>
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}

