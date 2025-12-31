'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [isComingSoonMode, setIsComingSoonMode] = useState(false);
  
  // Check if coming soon mode is active
  useEffect(() => {
    const checkComingSoonMode = () => {
      setIsComingSoonMode(document.body.classList.contains('coming-soon-mode'));
    };
    
    // Check initially
    checkComingSoonMode();
    
    // Watch for changes (when ComingSoon component mounts/unmounts)
    const observer = new MutationObserver(checkComingSoonMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Hide footer on admin routes or in Grand Opening mode
  if (pathname?.startsWith('/admin') || isComingSoonMode) {
    return null;
  }
  
  return <Footer />;
}


