'use client';

import { X } from 'lucide-react';

interface FloatingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function FloatingSidebar({ isOpen, onClose, children }: FloatingSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile/Tablet overlay */}
      <div
        className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed z-50 flex flex-col bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-300 ease-out border-l border-gray-200/80
          inset-x-0 bottom-0 top-auto max-h-[80vh] rounded-t-2xl border-l-0
          lg:top-[65px] lg:right-0 lg:bottom-0 lg:left-auto lg:w-[500px] xl:w-[560px] lg:max-h-none lg:rounded-none lg:border-l ${
            isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full'
          }`}
        style={{
          animation: isOpen ? 'slideInSmooth 0.3s ease-out' : 'none',
        }}
      >
        {/* Mobile drag indicator */}
        <div className="lg:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />

        {/* Close button - floating (desktop) */}
        <button
          onClick={onClose}
          className="absolute -left-10 top-4 hidden lg:flex items-center justify-center w-8 h-8 rounded-l-lg bg-white border border-r-0 border-gray-200 shadow-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 z-10 p-2 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideInSmooth {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @media (min-width: 1024px) {
          @keyframes slideInSmooth {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
        }
      `}</style>
    </>
  );
}
