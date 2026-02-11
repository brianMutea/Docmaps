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
  const [searchResults, setSearchResults] = useState<Post[]>(allPosts);

  const updateUrl = (params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    if (params.tag !== undefined || params.category !== undefined || params.sort !== undefined) {
      newParams.delete('page');
    }

    router.push(`/blog?${newParams.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      updateUrl({ tag: undefined, category: undefined });
    } else {
      updateUrl({ tag, category: undefined });
    }
  };

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      updateUrl({ category: undefined, tag: undefined });
    } else {
      updateUrl({ category, tag: undefined });
    }
  };

  const handleSortToggle = () => {
    const newSort = sortOrder === 'newest' ? 'oldest' : 'newest';
    updateUrl({ sort: newSort });
  };

  const handleClearFilters = () => {
    router.push('/blog');
  };

  const hasActiveFilters = selectedTag || selectedCategory;

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Search Posts</h3>
        <BlogSearch
          posts={allPosts}
          onSearchResults={setSearchResults}
          placeholder="Search..."
        />
      </div>

      {/* Sort Section */}
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Sort By</h3>
        <button
          onClick={handleSortToggle}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-200 bg-neutral-700 border border-neutral-600 rounded-lg hover:bg-neutral-600 transition-all"
        >
          {sortOrder === 'newest' ? (
            <>
              <SortDesc className="h-4 w-4" />
              <span>Newest First</span>
            </>
          ) : (
            <>
              <SortAsc className="h-4 w-4" />
              <span>Oldest First</span>
            </>
          )}
        </button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Active Filters</h3>
            <button
              onClick={handleClearFilters}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTag && (
              <button
                onClick={() => updateUrl({ tag: undefined })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-300 bg-primary-900/30 border border-primary-700/50 rounded-lg hover:bg-primary-900/50 transition-all"
              >
                {selectedTag}
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {selectedCategory && (
              <button
                onClick={() => updateUrl({ category: undefined })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-300 bg-primary-900/30 border border-primary-700/50 rounded-lg hover:bg-primary-900/50 transition-all"
              >
                {selectedCategory}
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tags Section */}
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter by Tag
        </h3>
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {allTags.slice(0, 15).map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleTagClick(tag.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                selectedTag === tag.name
                  ? 'text-primary-300 bg-primary-900/50 border border-primary-700'
                  : 'text-neutral-300 bg-neutral-700 border border-neutral-600 hover:bg-neutral-600'
              }`}
            >
              {tag.name}
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                selectedTag === tag.name ? 'bg-primary-800 text-primary-200' : 'bg-neutral-600 text-neutral-400'
              }`}>
                {tag.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter by Category
        </h3>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                selectedCategory === category.name
                  ? 'text-primary-300 bg-primary-900/50 border border-primary-700'
                  : 'text-neutral-300 bg-neutral-700 border border-neutral-600 hover:bg-neutral-600'
              }`}
            >
              {category.name}
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                selectedCategory === category.name ? 'bg-primary-800 text-primary-200' : 'bg-neutral-600 text-neutral-400'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
