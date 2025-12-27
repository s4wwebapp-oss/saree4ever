'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CSSProperties } from 'react';

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
  const dimensions = typeof size === 'string' ? sizePresets[size] : size;
  
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

