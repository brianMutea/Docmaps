'use client';

import Link from 'next/link';
import { Logo } from '@docmaps/ui';
import { UserMenu } from './user-menu';
import { LayoutDashboard } from 'lucide-react';

interface EditorNavProps {
  userEmail: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export function EditorNav({ userEmail, displayName, avatarUrl }: EditorNavProps) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
            <Link href="/editor/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Logo size="md" />
            </Link>
            <Link
              href="/editor/dashboard"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>

          {/* Right side - User Menu */}
          <UserMenu email={userEmail} displayName={displayName} avatarUrl={avatarUrl} />
        </div>
      </div>
    </nav>
  );
}
