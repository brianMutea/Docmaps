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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section */}
      {isHomePage && (
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50" />

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-40">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgb(99, 102, 241)"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Floating shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                Visual Documentation Simplified!
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Navigate Documentation
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Visually
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Explore interactive visual architecture maps of developer platforms,
                see what they offer, how compoonents connect and jump into the details.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documentation maps..."
                    className="w-full h-12 pl-12 pr-4 text-base bg-white border border-gray-200 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/maps"
                  className="inline-flex items-center gap-2 h-12 px-6 text-base font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
                >
                  Browse All Maps
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="https://docmaps-editor.vercel.app/"
                  className="inline-flex items-center gap-2 h-12 px-6 text-base font-medium text-gray-700 bg-transparent border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  Create Your Own
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section (only on home) */}
      {isHomePage && (
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Eye className="h-6 w-6" />}
                title="Discover"
                description="Browse curated maps of popular platforms or search for the tools you're evaluating."
              />
              <FeatureCard
                icon={<MousePointerClick className="h-6 w-6" />}
                title="Explore"
                description="Click components to see their details. Navigate relationships visually. Jump directly to relevant documentation."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Understand"
                description="Get the full architecture in minutes. Make informed AI chats in the docs. Integrate with confidence."
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
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Featured Maps
                </h2>
                <p className="text-gray-500">
                  Handpicked documentation maps to get you started
                </p>
              </div>
              <Link
                href="/maps"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
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
        className={`flex-1 py-16 sm:py-20 ${isHomePage ? "bg-gray-50" : "pt-8"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search bar for non-home pages */}
          {!isHomePage && (
            <form onSubmit={handleSearch} className="max-w-xl mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search maps..."
                  className="w-full h-10 pl-12 pr-4 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              <p className="text-sm text-gray-500 mt-1">
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
              <div className="w-12 h-12 mb-4 text-gray-300">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No maps found</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-sm">
                {initialQuery
                  ? "Try adjusting your search terms"
                  : "Be the first to create a documentation map!"}
              </p>
              <Link
                href="https://docmaps-editor.vercel.app/"
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
                  className="inline-flex items-center h-9 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-gray-500 px-4">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/?${new URLSearchParams({
                    ...(initialQuery && { q: initialQuery }),
                    ...(initialSort !== "views" && { sort: initialSort }),
                    page: String(currentPage + 1),
                  }).toString()}`}
                  className="inline-flex items-center h-9 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
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
            ? "bg-blue-600 text-white shadow-sm"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
        }
      `}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}
