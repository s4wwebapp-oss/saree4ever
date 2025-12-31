'use client';

import Link from 'next/link';
import { CSSProperties } from 'react';

interface LogoCssProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | { width: number; height: number };
  backgroundColor?: string;
  link?: boolean;
  href?: string;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  color?: string; // Golden color override
}

const sizePresets = {
  small: { width: 160, height: 40, fontSize: '0.75rem', lineHeight: 1.2 },
  medium: { width: 200, height: 50, fontSize: '1rem', lineHeight: 1.3 },
  large: { width: 280, height: 60, fontSize: '1.2rem', lineHeight: 1.4 },
  xlarge: { width: 360, height: 72, fontSize: '1.5rem', lineHeight: 1.5 },
};

export default function LogoCss({
  size = 'medium',
  backgroundColor = 'transparent',
  link = true,
  href = '/',
  className = '',
  style = {},
  hover = true,
  color = '#D4AF37', // Golden color
}: LogoCssProps) {
  const preset = typeof size === 'string' ? sizePresets[size] : {
    width: size.width,
    height: size.height,
    fontSize: `${size.width / 16}rem`,
    lineHeight: 1.3,
  };

  const containerStyle: CSSProperties = {
    width: preset.width,
    height: preset.height,
    backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...style,
  };

  const logoElement = (
    <div
      className={`logo-css-container ${hover ? 'logo-css-hover' : ''} ${className}`}
      style={containerStyle}
    >
      {/* Main horizontal layout: SAREE 4EVER */}
      <div
        className="logo-main"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontSize: preset.fontSize,
          lineHeight: preset.lineHeight,
          fontWeight: 700,
          color: color,
          textShadow: `0 2px 6px rgba(0, 0, 0, 0.3), 0 0 12px ${color}60`,
          gap: `calc(${preset.fontSize} * 0.2)`,
        }}
      >
        {/* AREE text - inline with S */}
        <span
          className="logo-aree"
          style={{
            fontSize: `calc(${preset.fontSize} * 0.5)`,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: color,
            textTransform: 'uppercase',
            textShadow: `0 2px 4px rgba(0, 0, 0, 0.2), 0 0 8px ${color}40`,
            alignSelf: 'flex-start',
            paddingTop: `calc(${preset.fontSize} * 0.15)`,
          }}
        >
          AREE
        </span>

        {/* Ornate S */}
        <span
          className="logo-s"
          style={{
            fontSize: `calc(${preset.fontSize} * 1.6)`,
            fontFamily: 'serif',
            fontWeight: 900,
            fontStyle: 'italic',
            display: 'inline-block',
            transform: 'rotate(-5deg)',
            background: `linear-gradient(135deg, ${color}, #FFD700, ${color})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
            lineHeight: 1,
          }}
        >
          S
        </span>

        {/* 4EVER */}
        <span
          className="logo-4ever"
          style={{
            fontSize: `calc(${preset.fontSize} * 1.1)`,
            fontFamily: 'serif',
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: `linear-gradient(135deg, ${color}, #FFD700, ${color})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
            lineHeight: 1,
          }}
        >
          4EVER
        </span>
      </div>

      {/* Bottom tagline: Drape Your Dreams - smaller and closer */}
      <div
        className="logo-tagline"
        style={{
          fontSize: `calc(${preset.fontSize} * 0.3)`,
          fontWeight: 400,
          letterSpacing: '0.1em',
          color: color,
          textTransform: 'none',
          lineHeight: 1.2,
          marginTop: `calc(${preset.fontSize} * 0.05)`,
          fontStyle: 'italic',
          textShadow: `0 1px 3px rgba(0, 0, 0, 0.2), 0 0 6px ${color}40`,
        }}
      >
        Drape Your Dreams
      </div>
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

