'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Clock, ArrowUpAZ, ArrowRight } from 'lucide-react';
import { analytics } from '@docmaps/analytics';
import type { Map as MapType } from '@docmaps/database';
import { DarkHero, DarkSearchInput } from '@docmaps/ui';
import Link from 'next/link';
import { MapCard } from './map-card';
import { Footer } from './footer';

interface BrowseClientProps {
  maps: MapType[];
  query: string;
  sort: 'views' | 'date' | 'title';
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function BrowseClient({
  maps,
  query: initialQuery,
  sort: initialSort,
  currentPage,
  totalPages,
  totalCount,
}: BrowseClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery) {
      analytics.trackSearch(initialQuery, totalCount);
    }
  }, [initialQuery, totalCount]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (initialSort !== 'views') params.set('sort', initialSort);
    router.push(`/maps?${params.toString()}`);
  };

  const handleSortChange = (newSort: 'views' | 'date' | 'title') => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (newSort !== 'views') params.set('sort', newSort);
    analytics.trackFilterUsed(newSort);
    router.push(`/maps?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      {/* Hero Search Section */}
      <DarkHero>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
              Browse Documentation Maps
            </h1>
            <p className="text-lg text-neutral-300 mb-8">
              Explore interactive visual documentation maps of developer products
            </p>
          </div>
          
          {/* Search Bar */}
          <DarkSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Search maps by title, product, or description..."
            className="max-w-2xl"
          />
        </div>
      </DarkHero>

      {/* Maps Section */}
      <section className="relative overflow-hidden flex-1 py-10 sm:py-12 lg:py-16 bg-neutral-900">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="browse-maps-grid"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="rgb(148, 163, 184)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#browse-maps-grid)" />
          </svg>
        </div>

        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-primary-500/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-info-500/10 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Maps'}
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              {totalCount} {totalCount === 1 ? 'map' : 'maps'} found
            </p>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSortChange('views')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                initialSort === 'views'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Popular</span>
            </button>
            <button
              onClick={() => handleSortChange('date')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                initialSort === 'date'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Recent</span>
            </button>
            <button
              onClick={() => handleSortChange('title')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                initialSort === 'title'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600'
              }`}
            >
              <ArrowUpAZ className="h-4 w-4" />
              <span className="hidden sm:inline">A-Z</span>
            </button>
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
            <div className="w-12 h-12 mb-4 text-neutral-500">
              <Search className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No maps found</h3>
            <p className="text-sm text-neutral-400 mb-4 max-w-sm">
              {searchQuery
                ? 'Try adjusting your search terms or browse all maps'
                : 'Be the first to create a documentation map!'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  router.push('/maps');
                }}
                className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-neutral-300 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Clear search
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            {currentPage > 1 && (
              <Link
                href={`/maps?${new URLSearchParams({
                  ...(searchQuery && { q: searchQuery }),
                  ...(initialSort !== 'views' && { sort: initialSort }),
                  page: String(currentPage - 1),
                }).toString()}`}
                className="inline-flex items-center h-9 px-4 text-sm font-medium text-neutral-300 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-neutral-400 px-4">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/maps?${new URLSearchParams({
                  ...(searchQuery && { q: searchQuery }),
                  ...(initialSort !== 'views' && { sort: initialSort }),
                  page: String(currentPage + 1),
                }).toString()}`}
                className="inline-flex items-center h-9 px-4 text-sm font-medium text-neutral-300 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
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
