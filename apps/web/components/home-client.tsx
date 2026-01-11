"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  TrendingUp,
  Clock,
  ArrowUpAZ,
  ArrowRight,
  Sparkles,
  Map,
  Layers,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Map as MapType } from "@docmaps/database";
import Link from "next/link";

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
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      {isHomePage && (
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.4]">
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
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                Visual Documentation Made Simple
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight mb-6">
                Navigate Documentation
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Visually
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Explore interactive visual maps that transform complex
                documentation into intuitive, navigable experiences.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documentation maps..."
                    className="input input-lg pl-12 pr-4 shadow-lg shadow-neutral-200/50 border-neutral-200 focus:shadow-xl focus:shadow-primary-100/50"
                  />
                </div>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/maps"
                  className="btn btn-lg btn-primary shadow-lg shadow-primary-500/25"
                >
                  Browse All Maps
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="https://docmaps-editor.vercel.app/"
                  className="btn btn-lg btn-outline"
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
        <section className="py-16 bg-white border-y border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Map className="h-6 w-6" />}
                title="Visual Navigation"
                description="Transform dense documentation into interactive visual maps that are easy to explore."
              />
              <FeatureCard
                icon={<Layers className="h-6 w-6" />}
                title="Multi-View Support"
                description="Organize complex docs with multiple views - architecture, features, components, and more."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Quick Understanding"
                description="Grasp the big picture instantly. See how components connect and relate to each other."
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
        className={`py-16 sm:py-20 ${isHomePage ? "bg-neutral-50" : "pt-8"}`}
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
                  className="input pl-12"
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
            <div className="empty-state py-16">
              <div className="empty-state-icon">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="empty-state-title">No maps found</h3>
              <p className="empty-state-description">
                {initialQuery
                  ? "Try adjusting your search terms"
                  : "Be the first to create a documentation map!"}
              </p>
              <Link
                href="https://docmaps-editor.vercel.app/"
                className="btn btn-md btn-primary"
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
                  className="btn btn-md btn-secondary"
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
                  className="btn btn-md btn-secondary"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} DocMaps. Visual documentation made
              simple.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/maps"
                className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                Browse Maps
              </Link>
              <Link
                href="/help"
                className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                Help
              </Link>
              <Link
                href="https://docmaps-editor.vercel.app/"
                className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
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
      <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function MapCard({ map, featured = false }: { map: MapType; featured?: boolean }) {
  return (
    <Link
      href={`/maps/${map.slug}`}
      className="card-interactive p-6 group"
    >
      {/* Featured badge */}
      {featured && (
        <div className="absolute top-4 right-4">
          <span className="badge badge-primary">
            <Sparkles className="h-3 w-3" />
            Featured
          </span>
        </div>
      )}

      {/* Content */}
      <div className={featured ? "pr-24" : ""}>
        <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
          {map.title}
        </h3>
        <p className="text-sm font-medium text-primary-600 mb-2">
          {map.product_name}
        </p>
        {map.description && (
          <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
            {map.description}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-neutral-400 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <span>{map.view_count} views</span>
        </div>
        <span>
          {formatDistanceToNow(new Date(map.updated_at), { addSuffix: true })}
        </span>
      </div>

      {/* Hover indicator */}
      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
        View Map
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
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
