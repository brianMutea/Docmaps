"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  Clock,
  ArrowUpAZ,
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  MousePointerClick,
} from "lucide-react";
import type { Map as MapType } from "@docmaps/database";
import Link from "next/link";
import { MapCard } from "./map-card";
import { Footer } from "./footer";

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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Hero Section - Compact */}
      {isHomePage && (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs sm:text-sm font-medium mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Visual Documentation
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
                Interactive mental models of your favorite developer products
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-info-600 bg-clip-text text-transparent">
                  from their documentation.
                </span>
              </h1>

              {/* Subheadline with structured list */}
              <div className="mb-8 max-w-2xl mx-auto">
                <p className="text-sm sm:text-base text-neutral-600 mb-4 leading-relaxed">
                  Understand architecture at a glance:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="text-xs sm:text-sm text-neutral-600">Core concepts</div>
                  <div className="text-xs sm:text-sm text-neutral-600">Features</div>
                  <div className="text-xs sm:text-sm text-neutral-600">Connections</div>
                  <div className="text-xs sm:text-sm text-neutral-600">Dependencies</div>
                </div>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-6">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search maps..."
                    className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-neutral-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/maps"
                  className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20"
                >
                  Browse Maps
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="https://docmaps-editor.vercel.app/"
                  className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                >
                  Create One
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Subtle (only on home) */}
      {isHomePage && (
        <section className="py-8 sm:py-10 bg-neutral-50/50 border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCard
                icon={<Eye className="h-5 w-5" />}
                title="Discover"
                description="Browse curated maps or search for tools you're evaluating."
              />
              <FeatureCard
                icon={<MousePointerClick className="h-5 w-5" />}
                title="Explore"
                description="Click components to see details. Navigate relationships visually."
              />
              <FeatureCard
                icon={<Zap className="h-5 w-5" />}
                title="Understand"
                description="Get full architecture in minutes. Integrate with confidence."
              />
            </div>
          </div>
        </section>
      )}

      {/* Featured Maps Section */}
      {featuredMaps.length > 0 && isHomePage && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                  Featured Maps
                </h2>
                <p className="text-neutral-500">
                  Handpicked documentation maps to get you started
                </p>
              </div>
              <Link
                href="/maps"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
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
        className={`flex-1 py-16 sm:py-20 ${isHomePage ? "bg-neutral-50" : "pt-8"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search bar for non-home pages */}
          {!isHomePage && (
            <form onSubmit={handleSearch} className="max-w-xl mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search maps..."
                  className="w-full h-10 pl-12 pr-4 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </form>
          )}

          {/* Header with filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                {initialQuery ? `Results for "${initialQuery}"` : "All Maps"}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {totalCount} {totalCount === 1 ? "map" : "maps"} found
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
              <div className="w-12 h-12 mb-4 text-neutral-300">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">No maps found</h3>
              <p className="text-sm text-neutral-500 mb-4 max-w-sm">
                {initialQuery
                  ? "Try adjusting your search terms"
                  : "Be the first to create a documentation map!"}
              </p>
              <Link
                href="https://docmaps-editor.vercel.app/"
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
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
                  className="inline-flex items-center h-9 px-4 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-neutral-500 px-4">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/?${new URLSearchParams({
                    ...(initialQuery && { q: initialQuery }),
                    ...(initialSort !== "views" && { sort: initialSort }),
                    page: String(currentPage + 1),
                  }).toString()}`}
                  className="inline-flex items-center h-9 px-4 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1.5">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
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
            ? "bg-primary-600 text-white shadow-sm"
            : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
        }
      `}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}
