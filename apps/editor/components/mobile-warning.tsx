'use client';

import { useEffect, useState } from 'react';
import { Monitor, X, Smartphone, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/95 via-slate-900/95 to-blue-900/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header gradient */}
        <div className="h-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          
          {/* Floating icons */}
          <div className="absolute top-4 left-8 p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="absolute bottom-4 right-8 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Monitor className="h-6 w-6 text-white" />
          </div>
          
          {/* Arrow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <ArrowRight className="h-8 w-8 text-white/60" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Desktop Recommended
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The DocMaps editor works best on desktop browsers with larger screens. 
            For the optimal experience, please switch to a desktop device.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setDismissed(true)}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
            >
              Continue Anyway
            </button>
            <a
              href="/"
              className="block w-full rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all text-center"
            >
              Browse Maps Instead
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
            <Monitor className="h-3.5 w-3.5" />
            Minimum screen width: 1024px
          </p>
        </div>
      </div>
    </div>
  );
}
