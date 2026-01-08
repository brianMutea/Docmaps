'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, TrendingUp, Clock, ArrowUpAZ } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Map as MapType } from '@docmaps/database';
import Link from 'next/link';

interface HomeClientProps {
  maps: MapType[];
  featuredMaps: MapType[];
  query: string;
  sort: 'views' | 'date' | 'title';
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
    if (searchQuery) params.set('q', searchQuery);
    if (initialSort !== 'views') params.set('sort', initialSort);
    router.push(`/?${params.toString()}`);
  };

  const handleSortChange = (newSort: 'views' | 'date' | 'title') => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (newSort !== 'views') params.set('sort', newSort);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Subtle Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Visual Maps of
            <br />
            <span className="text-blue-600">
              Developer Documentation
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Explore interactive visual maps that make complex documentation easy to navigate and understand
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search maps..."
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Featured Maps Section */}
      {featuredMaps.length > 0 && !searchQuery && currentPage === 1 && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Maps</h2>
            </div>
            <p className="text-gray-600 ml-4">
              Handpicked documentation maps to help you get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMaps.map((map) => (
              <Link
                key={map.id}
                href={`/maps/${map.slug}`}
                className="group relative bg-white rounded-lg border border-blue-200 p-6 hover:shadow-lg hover:border-blue-400 transition-all"
              >
                {/* Featured Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                </div>

                <div className="flex items-start justify-between mb-3 pr-20">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {map.title}
                  </h3>
                </div>
                <p className="text-sm font-medium text-blue-600 mb-2">
                  {map.product_name}
                </p>
                {map.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {map.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{map.view_count} views</span>
                  </div>
                  <span>
                    Updated {formatDistanceToNow(new Date(map.updated_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    View Map →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Maps Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Maps'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {totalCount} {totalCount === 1 ? 'map' : 'maps'} found
            </p>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => handleSortChange('views')}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                initialSort === 'views'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Most Viewed</span>
              <span className="sm:hidden">Views</span>
            </button>
            <button
              onClick={() => handleSortChange('date')}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                initialSort === 'date'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Recently Updated</span>
              <span className="sm:hidden">Recent</span>
            </button>
            <button
              onClick={() => handleSortChange('title')}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                initialSort === 'title'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ArrowUpAZ className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              A-Z
            </button>
          </div>
        </div>

        {/* Maps Grid */}
        {maps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maps.map((map) => (
              <Link
                key={map.id}
                href={`/maps/${map.slug}`}
                className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {map.title}
                  </h3>
                </div>
                <p className="text-sm font-medium text-blue-600 mb-2">
                  {map.product_name}
                </p>
                {map.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {map.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{map.view_count} views</span>
                  </div>
                  <span>
                    Updated {formatDistanceToNow(new Date(map.updated_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    View Map →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No maps found</h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Be the first to create a map!'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {currentPage > 1 && (
              <Link
                href={`/?${new URLSearchParams({
                  ...(searchQuery && { q: searchQuery }),
                  ...(initialSort !== 'views' && { sort: initialSort }),
                  page: String(currentPage - 1),
                }).toString()}`}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-gray-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/?${new URLSearchParams({
                  ...(searchQuery && { q: searchQuery }),
                  ...(initialSort !== 'views' && { sort: initialSort }),
                  page: String(currentPage + 1),
                }).toString()}`}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 DocMaps. Visual maps of developer documentation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
