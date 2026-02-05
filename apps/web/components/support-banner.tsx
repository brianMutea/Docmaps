'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Heart } from 'lucide-react';
import Link from 'next/link';

export function SupportBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Show on landing page and browse maps page (both have navbar)
  const shouldShow = pathname === '/' || pathname === '/maps';

  useEffect(() => {
    if (!shouldShow) return;

    // Show banner after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [shouldShow]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!shouldShow || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-blue-50/80 backdrop-blur-sm animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <Heart className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-gray-900 text-center">
              <span className="font-medium">Found this useful?</span> DocMaps is an early experiment.{' '}
              <Link
                href="https://docmaps.canny.io/feature-requests"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
              >
               Your feedback
              </Link>
              <span>or support helps shape and validate what gets built next</span>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-blue-100/50 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
