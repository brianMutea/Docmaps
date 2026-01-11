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
    <div
      className={`fixed right-0 bottom-0 bg-white/95 backdrop-blur-md shadow-2xl z-50 flex flex-col transition-all duration-300 ease-out border-l border-gray-200/80 w-full sm:w-[420px] lg:w-[480px] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        top: '65px',
        animation: isOpen ? 'slideInSmooth 0.3s ease-out' : 'none',
      }}
    >
      {/* Close button - floating */}
      <button
        onClick={onClose}
        className="absolute -left-10 top-4 hidden sm:flex items-center justify-center w-8 h-8 rounded-l-lg bg-white border border-r-0 border-gray-200 shadow-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Animation styles */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
}
