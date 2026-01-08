'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, TrendingUp, Clock, ArrowUpAZ } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { analytics } from '@/lib/analytics';
import type { Map as MapType } from '@docmaps/database';
import Link from 'next/link';

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

  // Track search when query changes
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
    
    // Track filter usage
    analytics.trackFilterUsed(newSort);
    
    router.push(`/maps?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Search Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Maps</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch}>
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search maps by title, product, or description..."
                className="w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Maps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              className={`flex items-center gap-1.5 sm:gap-2 rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                initialSort === 'views'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Most Viewed</span>
              <span className="sm:hidden">Views</span>
            </button>
            <button
              onClick={() => handleSortChange('date')}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                initialSort === 'date'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Recently Updated</span>
              <span className="sm:hidden">Recent</span>
            </button>
            <button
              onClick={() => handleSortChange('title')}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                initialSort === 'title'
                  ? 'bg-blue-600 text-white'
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
                href={`/maps?${new URLSearchParams({
                  ...(searchQuery && { q: searchQuery }),
                  ...(initialSort !== 'views' && { sort: initialSort }),
                  page: String(currentPage - 1),
                }).toString()}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/maps?${new URLSearchParams({
                  ...(searchQuery && { q: searchQuery }),
                  ...(initialSort !== 'views' && { sort: initialSort }),
                  page: String(currentPage + 1),
                }).toString()}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 DocMaps. Visual maps of developer documentation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
