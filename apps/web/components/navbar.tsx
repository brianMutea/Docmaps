"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@docmaps/ui";
import { Menu, X, Map, Plus, Heart } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSupportClick = () => {
    // Open Buy Me a Coffee direct link
    window.open('https://www.buymeacoffee.com/brianmk', '_blank');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Experimental badge */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Logo size="md" />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
              Experimental
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/maps" icon={<Map className="h-4 w-4" />}>
              Browse Maps
            </NavLink>
            <button
              onClick={handleSupportClick}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg transition-colors hover:text-gray-900 hover:bg-gray-100"
            >
              <Heart className="h-4 w-4" />
              Support
            </button>
            <div className="ml-2 pl-2 border-l border-gray-200">
              <Link
                href="https://docmaps-editor.vercel.app/"
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create Map
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
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
          <div className="md:hidden py-4 border-t border-gray-200/50">
            <nav className="flex flex-col gap-1">
              <MobileNavLink
                href="/maps"
                icon={<Map className="h-4 w-4" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Maps
              </MobileNavLink>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSupportClick();
                }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg transition-colors hover:bg-gray-100"
              >
                <Heart className="h-4 w-4" />
                Support
              </button>
              <div className="pt-3 mt-2 border-t border-gray-200/50">
                <Link
                  href="https://docmaps-editor.vercel.app/"
                  className="flex items-center justify-center gap-2 w-full h-10 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg transition-colors hover:text-gray-900 hover:bg-gray-100"
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
      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg transition-colors hover:bg-gray-100"
    >
      {icon}
      {children}
    </Link>
  );
}
