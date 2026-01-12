"use client";

import Link from "next/link";
import { Logo } from "@docmaps/ui";
import { UserMenu } from "./user-menu";
import { LayoutDashboard, Plus, HelpCircle } from "lucide-react";

interface EditorNavProps {
  userEmail: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export function EditorNav({
  userEmail,
  displayName,
  avatarUrl,
}: EditorNavProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-2 sm:gap-6">
            <Link
              href="/editor/dashboard"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Logo size="md" />
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/editor/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/editor/help"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                Help
              </Link>
            </div>
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/editor/new"
              className="hidden sm:inline-flex items-center gap-2 h-8 px-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Map
            </Link>

            {/* Mobile new map button */}
            <Link
              href="/editor/new"
              className="sm:hidden flex items-center justify-center w-8 h-8 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="New Map"
            >
              <Plus className="h-4 w-4" />
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            <UserMenu
              email={userEmail}
              displayName={displayName}
              avatarUrl={avatarUrl}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
