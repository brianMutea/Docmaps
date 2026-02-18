'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, X, Sparkles } from 'lucide-react';

export function GenerationSuccessBanner() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const generated = searchParams.get('generated');
    if (generated === 'true') {
      setShow(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShow(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 max-w-md">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Map generated successfully!</p>
          <p className="text-xs text-white/90 mt-0.5">
            You can now edit and customize your map
          </p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
