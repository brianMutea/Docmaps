'use client';

import Link from 'next/link';
import { Logo } from '@docmaps/ui';

export function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo size="md" />
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Link
              href="/maps"
              className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <span className="hidden sm:inline">Browse Maps</span>
              <span className="sm:hidden">Browse</span>
            </Link>
            <Link
              href="/help"
              className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Help
            </Link>
            <Link
              href="http://localhost:3000"
              className="rounded-lg bg-blue-600 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
            >
              <span className="hidden sm:inline">Create Map</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
