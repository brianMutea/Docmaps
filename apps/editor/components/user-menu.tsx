'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import type { Profile } from '@docmaps/database';

interface UserMenuProps {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export function UserMenu({ email, displayName, avatarUrl }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
    router.refresh();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayText = displayName || email;
  const initials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : email[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 rounded-full sm:rounded-md bg-gray-100 px-1 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
      >
        {/* Avatar */}
        <div className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayText}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="text-xs sm:text-sm">{initials}</span>
          )}
        </div>
        <span className="max-w-[80px] sm:max-w-[150px] truncate hidden sm:inline">
          {displayText}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform hidden sm:block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 rounded-lg border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayText}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <span className="text-sm">{initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayText}</p>
                <p className="text-xs text-gray-600 truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/editor/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-500" />
              <span>Profile Settings</span>
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
