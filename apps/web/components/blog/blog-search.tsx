'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import type { Post } from '@/lib/blog/content';

interface BlogSearchProps {
  /** All posts to search through */
  posts: Post[];
  /** Callback when search results change */
  onSearchResults: (results: Post[]) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
}

/**
 * BlogSearch component provides client-side search functionality
 * 
 * Features:
 * - Real-time search filtering by title, excerpt, and tags
 * - Debounced input to avoid excessive filtering
 * - Search results count display
 * - Clear button to reset search
 * - Accessible keyboard navigation
 * - Matches DocMaps design system
 * 
 * The search is case-insensitive and searches across:
 * - Post title
 * - Post excerpt
 * - Post tags
 * 
 * @param posts - Array of all posts to search through
 * @param onSearchResults - Callback function called with filtered results
 * @param placeholder - Custom placeholder text (optional)
 * @param debounceMs - Debounce delay in milliseconds (optional, default: 300)
 */
export function BlogSearch({
  posts,
  onSearchResults,
  placeholder = 'Search posts...',
  debounceMs = 300,
}: BlogSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [resultsCount, setResultsCount] = useState(posts.length);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Filter posts based on debounced query
  const filterPosts = useCallback(
    (searchQuery: string): Post[] => {
      if (!searchQuery.trim()) {
        return posts;
      }

      const normalizedQuery = searchQuery.toLowerCase().trim();

      return posts.filter((post) => {
        const { title, excerpt, tags } = post.frontmatter;

        // Search in title
        if (title.toLowerCase().includes(normalizedQuery)) {
          return true;
        }

        // Search in excerpt
        if (excerpt.toLowerCase().includes(normalizedQuery)) {
          return true;
        }

        // Search in tags
        if (tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))) {
          return true;
        }

        return false;
      });
    },
    [posts]
  );

  // Update search results when debounced query changes
  useEffect(() => {
    const results = filterPosts(debouncedQuery);
    setResultsCount(results.length);
    onSearchResults(results);
  }, [debouncedQuery, filterPosts, onSearchResults]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle clear button click
  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear on Escape key
    if (e.key === 'Escape') {
      handleClear();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-label="Search blog posts"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Count */}
      {debouncedQuery && (
        <div className="mt-2 text-sm text-gray-600">
          {resultsCount === 0 ? (
            <span>No posts found for &quot;{debouncedQuery}&quot;</span>
          ) : resultsCount === 1 ? (
            <span>Found 1 post</span>
          ) : (
            <span>Found {resultsCount} posts</span>
          )}
        </div>
      )}
    </div>
  );
}
