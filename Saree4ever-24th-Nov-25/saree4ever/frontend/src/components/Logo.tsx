'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CSSProperties } from 'react';

interface LogoProps {
  /**
   * Size preset: 'small' | 'medium' | 'large' | 'xlarge'
   * Or provide custom dimensions: { width: number, height: number }
   */
  size?: 'small' | 'medium' | 'large' | 'xlarge' | { width: number; height: number };
  
  /**
   * Background color - can be any valid CSS color
   * Examples: 'white', '#000000', 'transparent', 'rgb(255, 255, 255)'
   * Default: 'white'
   */
  backgroundColor?: string;
  
  /**
   * Whether to show as a link (default: true)
   */
  link?: boolean;
  
  /**
   * Custom href for the link (default: '/')
   */
  href?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Custom inline styles
   */
  style?: CSSProperties;
  
  /**
   * Whether to show hover effects (default: true)
   */
  hover?: boolean;
  
  /**
   * Logo image source (default: '/saree4ever-logo.png')
   */
  src?: string;
  
  /**
   * Alt text for the logo
   */
  alt?: string;
}

const sizePresets = {
  small: { width: 128, height: 48 },    // Mobile/compact
  medium: { width: 200, height: 75 },   // Standard
  large: { width: 256, height: 96 },    // Desktop header
  xlarge: { width: 320, height: 120 },  // Hero/landing
};

export default function Logo({
  size = 'medium',
  backgroundColor = 'transparent',
  link = true,
  href = '/',
  className = '',
  style = {},
  hover = true,
  src = '/saree4ever-logo.png',
  alt = 'Saree4ever - Drape Your Dreams',
}: LogoProps) {
  // Determine dimensions
  const dimensions = typeof size === 'object' 
    ? size 
    : sizePresets[size];

  // Build container styles
  const containerStyle: CSSProperties = {
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    backgroundColor: backgroundColor,
    ...style,
  };

  // Build container classes
  const containerClasses = [
    'logo-container',
    'relative',
    'flex',
    'items-center',
    'justify-center',
    hover ? 'logo-hover' : '',
    className,
  ].filter(Boolean).join(' ');

  const logoContent = (
    <div 
      className={containerClasses}
      style={containerStyle}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain logo-image"
        priority
        sizes={`${dimensions.width}px`}
        style={{ background: 'transparent' }}
        unoptimized
      />
    </div>
  );

  if (link) {
    return (
      <Link 
        href={href} 
        className="inline-block hover:opacity-90 transition-opacity"
        aria-label={alt}
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
