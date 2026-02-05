'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Clock, ArrowUpAZ, ArrowRight, Sparkles } from 'lucide-react';
import { analytics } from '@docmaps/analytics';
import type { Map as MapType } from '@docmaps/database';
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-50 via-white to-info-50/30">
      {/* Hero Search Section */}
      <section className="relative overflow-hidden border-b border-neutral-200/60 bg-white/80 backdrop-blur-sm">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-info-100/40 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Discover Developer Product Mental Models
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Browse Maps
            </h1>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Explore interactive visual documentation maps of your cureated products
            </p>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search maps by title, product, or description..."
                className="w-full rounded-2xl border border-neutral-200 bg-white pl-14 pr-28 py-4 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-lg shadow-neutral-200/50 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white hover:from-primary-700 hover:to-primary-800 transition-all shadow-md shadow-primary-500/20"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Maps Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Maps'}
            </h2>
            <p className="text-sm text-neutral-500 mt-1 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                {totalCount}
              </span>
              {totalCount === 1 ? 'map' : 'maps'} found
            </p>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl">
            <button
              onClick={() => handleSortChange('views')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                initialSort === 'views'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Popular</span>
            </button>
            <button
              onClick={() => handleSortChange('date')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                initialSort === 'date'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Recent</span>
            </button>
            <button
              onClick={() => handleSortChange('title')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                initialSort === 'title'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
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
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 mb-6">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No maps found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
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
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
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
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Previous
              </Link>
            )}
            <div className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100">
              <span className="text-sm font-bold text-gray-900">{currentPage}</span>
              <span className="text-sm text-gray-400">of</span>
              <span className="text-sm font-bold text-gray-900">{totalPages}</span>
            </div>
            {currentPage < totalPages && (
              <Link
                href={`/maps?${new URLSearchParams({
                  ...(searchQuery && { q: searchQuery }),
                  ...(initialSort !== 'views' && { sort: initialSort }),
                  page: String(currentPage + 1),
                }).toString()}`}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
