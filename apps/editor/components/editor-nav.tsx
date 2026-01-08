'use client';

import Link from 'next/link';
import { Logo } from '@docmaps/ui';
import { UserMenu } from './user-menu';

interface EditorNavProps {
  userEmail: string;
}

export function EditorNav({ userEmail }: EditorNavProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/editor/dashboard">
              <Logo />
            </Link>
            <Link
              href="/editor/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </Link>
          </div>

          <UserMenu email={userEmail} />
        </div>
      </div>
    </nav>
  );
}
