"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  Clock,
  ArrowUpAZ,
  ArrowRight,
  Eye,
  MousePointerClick,
  Lightbulb,
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
          {/* Background with gradient and pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
          
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-40">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="rgb(99, 102, 241)" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          {/* Gradient orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
            <div className="max-w-3xl">
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                Stop scrolling.
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Start understanding.
                </span>
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
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                >
                  Explore Maps
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="https://docmaps-editor.vercel.app/"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Create Your Map
                </Link>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-lg">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search platforms..."
                    className="w-full h-12 pl-11 pr-4 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      {isHomePage && (
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(229, 231, 235)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Three simple steps to master any platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <HowItWorksCard
                number="01"
                icon={<Eye className="h-6 w-6" />}
                title="Discover"
                description="Browse curated maps of popular platforms or search for the tools you're evaluating."
                color="blue"
              />
              <HowItWorksCard
                number="02"
                icon={<MousePointerClick className="h-6 w-6" />}
                title="Explore"
                description="Click components to see their details. Navigate relationships visually. Jump directly to relevant documentation."
                color="indigo"
              />
              <HowItWorksCard
                number="03"
                icon={<Lightbulb className="h-6 w-6" />}
                title="Understand"
                description="Get the full architecture in minutes. Make informed decisions faster. Integrate with confidence."
                color="violet"
              />
            </div>
          </div>
        </section>
      )}

      {/* Featured Maps Section */}
      {featuredMaps.length > 0 && isHomePage && (
        <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
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
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
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
        className={`py-16 sm:py-20 ${isHomePage ? "bg-white" : "pt-8 bg-gray-50"}`}
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
                  className="w-full h-10 pl-11 pr-4 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
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
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
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

function HowItWorksCard({
  number,
  icon,
  title,
  description,
  color,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "indigo" | "violet";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/25",
    violet: "from-violet-500 to-violet-600 shadow-violet-500/25",
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
      <div className="relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent transition-all duration-300">
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
            {icon}
          </div>
          <span className="text-5xl font-bold text-gray-100">{number}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
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
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
        }
      `}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}
