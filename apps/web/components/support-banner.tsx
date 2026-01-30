'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Heart } from 'lucide-react';

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
    <div className="bg-white shadow-lg animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Heart className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-gray-900 truncate sm:whitespace-normal">
              <span className="font-medium">Found this useful?</span> Support us in reaching $500 to keep the servers running and make improvements.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
