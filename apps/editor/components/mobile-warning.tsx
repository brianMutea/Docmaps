'use client';

import { useEffect, useState } from 'react';
import { Monitor, X } from 'lucide-react';
import { Logo } from '@docmaps/ui';

export function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile || dismissed) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/95 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Monitor className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Desktop Required
        </h2>
        <p className="text-gray-600 text-center mb-6">
          The DocMaps editor requires a desktop browser for the best experience. 
          Please switch to a desktop device to create and edit maps.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setDismissed(true)}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Continue Anyway
          </button>
          <a
            href="/"
            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
          >
            Browse Maps Instead
          </a>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Minimum screen width: 1024px
        </p>
      </div>
    </div>
  );
}
