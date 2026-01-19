"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  Clock,
  ArrowUpAZ,
  ArrowRight,
  GitBranch,
  Clock3,
  Users,
} from "lucide-react";
import type { Map as MapType } from "@docmaps/database";
import Link from "next/link";
import { MapCard } from "./map-card";

interface HomeClientProps {
  maps: MapType[];
  featuredMaps: MapType[];
  query: string;
  sort: "views" | "date" | "title";
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function HomeClient({
  maps,
  featuredMaps,
  query: initialQuery,
  sort: initialSort,
  currentPage,
  totalPages,
  totalCount,
}: HomeClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (initialSort !== "views") params.set("sort", initialSort);
    router.push(`/?${params.toString()}`);
  };

  const handleSortChange = (newSort: "views" | "date" | "title") => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (newSort !== "views") params.set("sort", newSort);
    router.push(`/?${params.toString()}`);
  };

  const isHomePage = !initialQuery && currentPage === 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      {isHomePage && (
        <section className="relative overflow-hidden border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="max-w-3xl">
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                Stop scrolling.
                <br />
                Start understanding.
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                Visual architecture maps that show you what complex platforms
                actually offer—before you dive into the docs.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-12">
                <Link
                  href="/maps"
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Explore Maps
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="https://docmaps-editor.vercel.app/"
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Create Your Map
                </Link>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search platforms..."
                    className="w-full h-11 pl-11 pr-4 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Value Props Section */}
      {isHomePage && (
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <ValueProp
                icon={<Clock3 className="h-5 w-5" />}
                title="For Developers"
                description="Understand the full picture in 5 minutes instead of 5 hours. Make informed decisions faster."
              />
              <ValueProp
                icon={<Users className="h-5 w-5" />}
                title="For Documentation Teams"
                description="Show developers the big picture, then guide them to details. Reduce time-to-first-value."
              />
              <ValueProp
                icon={<GitBranch className="h-5 w-5" />}
                title="For Engineering Teams"
                description="New team members see the entire system structure instantly. Cut onboarding time in half."
              />
            </div>
          </div>
        </section>
      )}

      {/* Featured Maps Section */}
      {featuredMaps.length > 0 && isHomePage && (
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Featured Maps
                </h2>
                <p className="text-gray-600 mt-2">
                  Popular platforms visualized
                </p>
              </div>
              <Link
                href="/maps"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMaps.map((map) => (
                <MapCard key={map.id} map={map} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Maps Section */}
      <section
        className={`py-16 sm:py-20 ${isHomePage ? "bg-gray-50" : "pt-8"}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search bar for non-home pages */}
          {!isHomePage && (
            <form onSubmit={handleSearch} className="max-w-xl mb-8">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search maps..."
                  className="w-full h-10 pl-11 pr-4 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </form>
          )}

          {/* Header with filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {initialQuery ? `Results for "${initialQuery}"` : "All Maps"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} {totalCount === 1 ? "map" : "maps"}
              </p>
            </div>

            {/* Sort Buttons */}
            <div className="flex items-center gap-2">
              <SortButton
                active={initialSort === "views"}
                onClick={() => handleSortChange("views")}
                icon={<TrendingUp className="h-4 w-4" />}
              >
                Popular
              </SortButton>
              <SortButton
                active={initialSort === "date"}
                onClick={() => handleSortChange("date")}
                icon={<Clock className="h-4 w-4" />}
              >
                Recent
              </SortButton>
              <SortButton
                active={initialSort === "title"}
                onClick={() => handleSortChange("title")}
                icon={<ArrowUpAZ className="h-4 w-4" />}
              >
                A-Z
              </SortButton>
            </div>
          </div>

          {/* Maps Grid */}
          {maps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {maps.map((map) => (
                <MapCard key={map.id} map={map} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 mb-4 text-gray-300">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No maps found
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-sm">
                {initialQuery
                  ? "Try adjusting your search terms"
                  : "Be the first to create a documentation map"}
              </p>
              <Link
                href="https://docmaps-editor.vercel.app/"
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Create a Map
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              {currentPage > 1 && (
                <Link
                  href={`/?${new URLSearchParams({
                    ...(initialQuery && { q: initialQuery }),
                    ...(initialSort !== "views" && { sort: initialSort }),
                    page: String(currentPage - 1),
                  }).toString()}`}
                  className="inline-flex items-center h-9 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-gray-600 px-4">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/?${new URLSearchParams({
                    ...(initialQuery && { q: initialQuery }),
                    ...(initialSort !== "views" && { sort: initialSort }),
                    page: String(currentPage + 1),
                  }).toString()}`}
                  className="inline-flex items-center h-9 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} DocMaps
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/maps"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Browse Maps
              </Link>
              <Link
                href="https://docmaps-editor.vercel.app/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Create Map
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ValueProp({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex items-center justify-center text-gray-700">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function SortButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
        ${
          active
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}
