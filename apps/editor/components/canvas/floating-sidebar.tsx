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
      {/* Backdrop - subtle overlay */}
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <div
        className="fixed right-0 top-14 bottom-0 w-full sm:w-[420px] bg-white/95 backdrop-blur-md shadow-2xl z-50 flex flex-col border-l border-gray-200/50 animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
          <h2 id="sidebar-title" className="text-base font-semibold text-gray-900">
            {title || 'Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono text-[10px]">Esc</kbd> to close
          </p>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
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
        .animate-slide-in {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
