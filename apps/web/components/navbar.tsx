"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@docmaps/ui";
import { Menu, X, Map, Plus, Heart, ChevronDown, Coffee, MessageSquare } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSupportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePayPalClick = () => {
    window.open(
      'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=briankmutea@gmail.com&currency_code=USD',
      '_blank'
    );
    setSupportDropdownOpen(false);
  };

  const handleBuyMeCoffeeClick = () => {
    window.open('https://www.buymeacoffee.com/brianmk', '_blank');
    setSupportDropdownOpen(false);
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
            <NavLink href="https://docmaps.canny.io/feature-requests" icon={<MessageSquare className="h-4 w-4" />} external>
              Feedback
            </NavLink>
            
            {/* Support Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setSupportDropdownOpen(!supportDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg transition-colors hover:text-gray-900 hover:bg-gray-100"
              >
                <Heart className="h-4 w-4" />
                Support
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${supportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {supportDropdownOpen && (
                <div className="absolute top-full mt-1 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handlePayPalClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 0 1-.794.68H7.72a.483.483 0 0 1-.477-.558L7.418 21h1.518l.95-6.02h1.385c4.678 0 7.75-2.203 8.796-6.502zm-2.96-5.09c.762.868.983 2.156.66 3.837-.743 3.896-3.202 5.775-7.308 5.775H7.832a.483.483 0 0 1-.477-.558l.958-6.086.041-.22a.805.805 0 0 1 .794-.68h2.196c1.586 0 2.746.328 3.562.995.44.36.752.792.935 1.287.09-.04.18-.082.267-.127.61-.32 1.076-.82 1.39-1.485.186-.394.293-.84.293-1.332 0-.124-.01-.244-.028-.362z"/>
                    </svg>
                    PayPal
                  </button>
                  <button
                    onClick={handleBuyMeCoffeeClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Coffee className="h-4 w-4" />
                    Buy Me a Coffee
                  </button>
                </div>
              )}
            </div>

            <div className="ml-2 pl-2 border-l border-gray-200">
              <Link
                href="https://docmaps-editor.vercel.app/"
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Try Mapping
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
              <MobileNavLink
                href="https://docmaps.canny.io/feature-requests"
                icon={<MessageSquare className="h-4 w-4" />}
                onClick={() => setMobileMenuOpen(false)}
                external
              >
                Feedback
              </MobileNavLink>
              
              {/* Mobile Support Section */}
              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Support
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handlePayPalClick();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 0 1-.794.68H7.72a.483.483 0 0 1-.477-.558L7.418 21h1.518l.95-6.02h1.385c4.678 0 7.75-2.203 8.796-6.502zm-2.96-5.09c.762.868.983 2.156.66 3.837-.743 3.896-3.202 5.775-7.308 5.775H7.832a.483.483 0 0 1-.477-.558l.958-6.086.041-.22a.805.805 0 0 1 .794-.68h2.196c1.586 0 2.746.328 3.562.995.44.36.752.792.935 1.287.09-.04.18-.082.267-.127.61-.32 1.076-.82 1.39-1.485.186-.394.293-.84.293-1.332 0-.124-.01-.244-.028-.362z"/>
                    </svg>
                    PayPal
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleBuyMeCoffeeClick();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <Coffee className="h-4 w-4" />
                    Buy Me a Coffee
                  </button>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-gray-200/50">
                <Link
                  href="https://docmaps-editor.vercel.app/"
                  className="flex items-center justify-center gap-2 w-full h-10 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus className="h-4 w-4" />
                  Try Mapping
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
  external,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  external?: boolean;
}) {
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href}
      {...linkProps}
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
  external,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  external?: boolean;
}) {
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href}
      onClick={onClick}
      {...linkProps}
      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg transition-colors hover:bg-gray-100"
    >
      {icon}
      {children}
    </Link>
  );
}
