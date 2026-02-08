import { Suspense } from 'react';
import { getAllPosts, getAllTags, getAllCategories } from '@/lib/blog/content';
import { blogConfig } from '@/lib/blog/config';
import { PostCard } from '@/components/blog/post-card';
import { BlogSearch } from '@/components/blog/blog-search';
import { Pagination } from '@/components/blog/pagination';
import { calculatePagination } from '@/lib/blog/pagination-utils';
import { BlogIndexClient } from './blog-index-client';

interface BlogPageProps {
  searchParams: {
    page?: string;
    tag?: string;
    category?: string;
    sort?: 'newest' | 'oldest';
  };
}

/**
 * Blog Index Page
 * 
 * Features:
 * - Paginated list of published posts
 * - Featured posts section at the top
 * - Client-side search functionality
 * - Filter by tag/category
 * - Sort options (newest/oldest)
 * - Handles draft posts based on environment
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */
export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Parse search params
  const currentPage = parseInt(searchParams.page || '1', 10);
  const selectedTag = searchParams.tag;
  const selectedCategory = searchParams.category;
  const sortOrder = searchParams.sort || 'newest';

  // Determine if we should include drafts (only in development)
  const includeDrafts = process.env.NODE_ENV === 'development';

  // Fetch all posts with appropriate filters
  const allPosts = await getAllPosts({
    includeDrafts,
    sortBy: 'date',
    sortOrder: sortOrder === 'newest' ? 'desc' : 'asc',
  });

  // Filter by tag if specified
  let filteredPosts = selectedTag
    ? allPosts.filter((post) =>
        post.frontmatter.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      )
    : allPosts;

  // Filter by category if specified
  filteredPosts = selectedCategory
    ? filteredPosts.filter((post) =>
        post.frontmatter.categories.some(
          (c) => c.toLowerCase() === selectedCategory.toLowerCase()
        )
      )
    : filteredPosts;

  // Separate featured posts (posts with featured flag or first 3 posts)
  const featuredPosts = filteredPosts
    .filter((post) => post.frontmatter.featured === true)
    .slice(0, 3);

  // If no featured posts are explicitly marked, use the first 3 posts
  const displayFeaturedPosts =
    featuredPosts.length > 0 ? featuredPosts : filteredPosts.slice(0, 3);

  // Calculate pagination
  const { postsPerPage } = blogConfig;
  const totalPosts = filteredPosts.length;
  const pagination = calculatePagination(totalPosts, currentPage, postsPerPage);

  // Get posts for current page
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Fetch tags and categories for filters
  const allTags = await getAllTags(includeDrafts);
  const allCategories = await getAllCategories(includeDrafts);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              DocMaps Blog
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Insights on visual documentation, developer tools, and building better software
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts Section */}
        {currentPage === 1 && !selectedTag && !selectedCategory && displayFeaturedPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Posts</h2>
              <div className="h-1 flex-1 ml-6 bg-gradient-to-r from-blue-600 to-transparent rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayFeaturedPosts.map((post) => (
                <PostCard key={post.slug} post={post} featured />
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters - Client Component */}
        <div className="mb-12">
          <Suspense fallback={
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          }>
            <BlogIndexClient
              allPosts={allPosts}
              allTags={allTags}
              allCategories={allCategories}
              selectedTag={selectedTag}
              selectedCategory={selectedCategory}
              sortOrder={sortOrder}
            />
          </Suspense>
        </div>

        {/* Posts Grid */}
        <section>
          {/* Section Header */}
          {!selectedTag && !selectedCategory && (
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentPage === 1 && displayFeaturedPosts.length > 0 ? 'Latest Posts' : 'All Posts'}
              </h2>
              <div className="text-sm text-gray-500">
                {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
              </div>
            </div>
          )}

          {selectedTag && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Posts tagged with &ldquo;{selectedTag}&rdquo;
              </h2>
              <p className="text-gray-600">
                {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} found
              </p>
            </div>
          )}

          {selectedCategory && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Posts in &ldquo;{selectedCategory}&rdquo;
              </h2>
              <p className="text-gray-600">
                {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} found
              </p>
            </div>
          )}

          {paginatedPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-6">
                  {(selectedTag || selectedCategory) 
                    ? "Try adjusting your filters or search terms"
                    : "Check back soon for new content"}
                </p>
                {(selectedTag || selectedCategory) && (
                  <a
                    href="/blog"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear all filters
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12">
                  <Pagination pagination={pagination} basePath="/blog" />
                </div>
              )}
            </>
          )}
        </section>

        {/* Development Mode Indicator */}
        {includeDrafts && (
          <div className="mt-12 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong className="font-semibold">Development Mode:</strong> Draft posts are visible. They will be hidden in production.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Generate metadata for the blog index page
 */
export async function generateMetadata() {
  const { siteMetadata } = blogConfig;

  return {
    title: `${siteMetadata.title} | DocMaps`,
    description: siteMetadata.description,
    openGraph: {
      title: siteMetadata.title,
      description: siteMetadata.description,
      type: 'website',
      url: `${siteMetadata.siteUrl}/blog`,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteMetadata.title,
      description: siteMetadata.description,
    },
  };
}
