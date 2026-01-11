"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Settings, LogOut, ChevronDown, User } from "lucide-react";

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
    router.push("/sign-in");
    router.refresh();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const displayText = displayName || email;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="avatar avatar-sm bg-gradient-to-br from-primary-500 to-accent-500 text-white">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayText}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="text-xs font-semibold">{initials}</span>
          )}
        </div>
        <span className="hidden sm:block max-w-[120px] truncate">
          {displayText}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu absolute right-0 mt-2 w-64 origin-top-right">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-accent-50 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="avatar avatar-md bg-gradient-to-br from-primary-500 to-accent-500 text-white">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayText}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <span className="text-sm font-semibold">{initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {displayText}
                </p>
                <p className="text-xs text-neutral-500 truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/editor/profile"
              onClick={() => setIsOpen(false)}
              className="dropdown-item"
            >
              <User className="h-4 w-4 text-neutral-400" />
              <span>Your Profile</span>
            </Link>
            <Link
              href="/editor/profile"
              onClick={() => setIsOpen(false)}
              className="dropdown-item"
            >
              <Settings className="h-4 w-4 text-neutral-400" />
              <span>Settings</span>
            </Link>

            <div className="dropdown-separator" />

            <button
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
              className="dropdown-item-danger w-full"
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
