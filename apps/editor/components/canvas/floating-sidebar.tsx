'use client';

import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface FloatingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function FloatingSidebar({ isOpen, onClose, children, title }: FloatingSidebarProps) {
  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div
        className="fixed z-40 flex flex-col bg-white shadow-2xl animate-slide-in
          inset-x-0 bottom-0 top-auto max-h-[85vh] rounded-t-2xl
          lg:inset-auto lg:right-0 lg:top-[57px] lg:bottom-0 lg:w-[420px] lg:max-h-none lg:rounded-none lg:border-l lg:border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        {/* Mobile drag indicator */}
        <div className="lg:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 id="sidebar-title" className="text-base font-semibold text-gray-900">
            {title || 'Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Footer hint - desktop only */}
        <div className="hidden lg:block px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono text-[10px]">Esc</kbd> to close
          </p>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @media (min-width: 1024px) {
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        }
        .animate-slide-in {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
