"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@docmaps/ui";
import { Menu, X, Map, HelpCircle, Plus } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-sticky glass border-b border-neutral-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/maps" icon={<Map className="h-4 w-4" />}>
              Browse Maps
            </NavLink>
            <NavLink href="/help" icon={<HelpCircle className="h-4 w-4" />}>
              Help
            </NavLink>
            <div className="ml-2 pl-2 border-l border-neutral-200">
              <Link
                href="https://docmaps-editor.vercel.app/"
                className="btn btn-md btn-primary"
              >
                <Plus className="h-4 w-4" />
                Create Map
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden btn btn-ghost btn-icon btn-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200/50 animate-slide-down">
            <nav className="flex flex-col gap-1">
              <MobileNavLink
                href="/maps"
                icon={<Map className="h-4 w-4" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Maps
              </MobileNavLink>
              <MobileNavLink
                href="/help"
                icon={<HelpCircle className="h-4 w-4" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                Help
              </MobileNavLink>
              <div className="pt-3 mt-2 border-t border-neutral-200/50">
                <Link
                  href="https://docmaps-editor.vercel.app/"
                  className="btn btn-md btn-primary w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus className="h-4 w-4" />
                  Create Map
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 rounded-lg transition-colors hover:text-neutral-900 hover:bg-neutral-100"
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 rounded-lg transition-colors hover:bg-neutral-100"
    >
      {icon}
      {children}
    </Link>
  );
}
