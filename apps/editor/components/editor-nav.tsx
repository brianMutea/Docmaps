"use client";

import Link from "next/link";
import { Logo } from "@docmaps/ui";
import { UserMenu } from "./user-menu";
import { LayoutDashboard, Plus } from "lucide-react";

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
    <nav className="sticky top-0 z-sticky glass border-b border-neutral-200/50">
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
              <NavLink href="/editor/dashboard" active>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
            </div>
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/editor/new"
              className="btn btn-sm btn-primary hidden sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              New Map
            </Link>

            {/* Mobile new map button */}
            <Link
              href="/editor/new"
              className="btn btn-sm btn-primary btn-icon sm:hidden"
              aria-label="New Map"
            >
              <Plus className="h-4 w-4" />
            </Link>

            <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

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

function NavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors
        ${
          active
            ? "text-primary-700 bg-primary-50"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
        }
      `}
    >
      {children}
    </Link>
  );
}
