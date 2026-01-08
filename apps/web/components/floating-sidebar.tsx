'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface FloatingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function FloatingSidebar({ isOpen, onClose, children, title }: FloatingSidebarProps) {
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Floating Sidebar - No backdrop, just the sidebar */}
      <div
        className={`fixed right-0 bottom-0 bg-white shadow-2xl z-50 flex flex-col transition-all duration-300 ease-out border-l border-gray-200 w-full sm:w-[480px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          top: '65px', // Align seamlessly below navbar (65px) + map viewer header (64px)
          animation: isOpen ? 'slideInBounce 0.4s ease-out' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title || 'Details'}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/80 transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Add bounce animation */}
      <style jsx>{`
        @keyframes slideInBounce {
          0% {
            transform: translateX(100%);
          }
          60% {
            transform: translateX(-10px);
          }
          80% {
            transform: translateX(5px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
