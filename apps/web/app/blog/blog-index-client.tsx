'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { BlogSearch } from '@/components/blog/blog-search';
import type { Post, TagWithCount, CategoryWithCount } from '@/lib/blog/content';

interface BlogIndexClientProps {
  allPosts: Post[];
  allTags: TagWithCount[];
  allCategories: CategoryWithCount[];
  selectedTag?: string;
  selectedCategory?: string;
  sortOrder: 'newest' | 'oldest';
}

/**
 * Client-side component for blog index interactions
 * 
 * Handles:
 * - Search functionality
 * - Tag/category filtering
 * - Sort order toggling
 * - URL parameter updates
 */
export function BlogIndexClient({
  allPosts,
  allTags,
  allCategories,
  selectedTag,
  selectedCategory,
  sortOrder,
}: BlogIndexClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<Post[]>(allPosts);

  /**
   * Update URL with new filter/sort parameters
   */
  const updateUrl = (params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (params.tag !== undefined || params.category !== undefined || params.sort !== undefined) {
      newParams.delete('page');
    }

    router.push(`/blog?${newParams.toString()}`);
  };

  /**
   * Handle tag filter selection
   */
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      // Deselect if already selected
      updateUrl({ tag: undefined, category: undefined });
    } else {
      updateUrl({ tag, category: undefined });
    }
  };

  /**
   * Handle category filter selection
   */
  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      // Deselect if already selected
      updateUrl({ category: undefined, tag: undefined });
    } else {
      updateUrl({ category, tag: undefined });
    }
  };

  /**
   * Toggle sort order
   */
  const handleSortToggle = () => {
    const newSort = sortOrder === 'newest' ? 'oldest' : 'newest';
    updateUrl({ sort: newSort });
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    router.push('/blog');
  };

  const hasActiveFilters = selectedTag || selectedCategory;

  return (
    <div className="space-y-6">
      {/* Search and Controls Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <BlogSearch
              posts={allPosts}
              onSearchResults={setSearchResults}
              placeholder="Search posts by title, excerpt, or tags..."
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {/* Sort Button */}
            <button
              onClick={handleSortToggle}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              aria-label={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'} first`}
            >
              {sortOrder === 'newest' ? (
                <>
                  <SortDesc className="h-4 w-4" />
                  <span className="hidden sm:inline">Newest</span>
                </>
              ) : (
                <>
                  <SortAsc className="h-4 w-4" />
                  <span className="hidden sm:inline">Oldest</span>
                </>
              )}
            </button>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all shadow-sm ${
                showFilters || hasActiveFilters
                  ? 'text-blue-700 bg-blue-50 border-2 border-blue-300 hover:bg-blue-100'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
              aria-label="Toggle filters"
              aria-expanded={showFilters}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  1
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Active filters:</span>
            {selectedTag && (
              <button
                onClick={() => updateUrl({ tag: undefined })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-full hover:bg-blue-100 hover:border-blue-400 transition-all"
              >
                <span className="font-semibold">Tag:</span> {selectedTag}
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {selectedCategory && (
              <button
                onClick={() => updateUrl({ category: undefined })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-full hover:bg-blue-100 hover:border-blue-400 transition-all"
              >
                <span className="font-semibold">Category:</span> {selectedCategory}
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tags */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded"></span>
                Filter by Tag
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 20).map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedTag === tag.name
                        ? 'text-blue-700 bg-blue-50 border-2 border-blue-300 shadow-sm'
                        : 'text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {tag.name}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      selectedTag === tag.name ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tag.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded"></span>
                Filter by Category
              </h3>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedCategory === category.name
                        ? 'text-blue-700 bg-blue-50 border-2 border-blue-300 shadow-sm'
                        : 'text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {category.name}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      selectedCategory === category.name ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
