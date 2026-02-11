import { Suspense } from 'react';
import { getAllPosts, getAllTags, getAllCategories } from '@/lib/blog/content';
import { blogConfig } from '@/lib/blog/config';
import { PostCard } from '@/components/blog/post-card';
import { BlogSearch } from '@/components/blog/blog-search';
import { Pagination } from '@/components/blog/pagination';
import { calculatePagination } from '@/lib/blog/pagination-utils';
import { BlogIndexClient } from './blog-index-client';
import { PageHero, PageSection } from '@docmaps/ui';
import { Footer } from '@/components/footer';

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
    <div className="flex flex-col min-h-screen bg-neutral-900">
      {/* Hero Header */}
      <PageHero
        title="DocMaps Blog"
        description="Insights on visual documentation, developer tools, and building better software"
      />

      <PageSection className="py-12 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Content with Sidebar Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Featured Posts Section */}
              {currentPage === 1 && !selectedTag && !selectedCategory && displayFeaturedPosts.length > 0 && (
                <section className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white">Featured Posts</h2>
                    <div className="h-1 flex-1 ml-6 bg-gradient-to-r from-primary-600 to-transparent rounded"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {displayFeaturedPosts.map((post) => (
                      <PostCard key={post.slug} post={post} featured />
                    ))}
                  </div>
                </section>
              )}

              {/* Posts Grid */}
              <section>
                {/* Section Header */}
                {!selectedTag && !selectedCategory && (
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">
                      {currentPage === 1 && displayFeaturedPosts.length > 0 ? 'Latest Posts' : 'All Posts'}
                    </h2>
                    <div className="text-sm text-neutral-400">
                      {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
                    </div>
                  </div>
                )}

                {selectedTag && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Posts tagged with &ldquo;{selectedTag}&rdquo;
                    </h2>
                    <p className="text-neutral-400">
                      {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} found
                    </p>
                  </div>
                )}

                {selectedCategory && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Posts in &ldquo;{selectedCategory}&rdquo;
                    </h2>
                    <p className="text-neutral-400">
                      {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} found
                    </p>
                  </div>
                )}

                {paginatedPosts.length === 0 ? (
                  <div className="text-center py-20 bg-neutral-800 rounded-xl border border-neutral-700">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 mx-auto mb-4 bg-neutral-700 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                      <p className="text-neutral-400 mb-6">
                        {(selectedTag || selectedCategory) 
                          ? "Try adjusting your filters or search terms"
                          : "Check back soon for new content"}
                      </p>
                      {(selectedTag || selectedCategory) && (
                        <a
                          href="/blog"
                          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Clear all filters
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <div className="mt-12 p-4 bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-200">
                        <strong className="font-semibold">Development Mode:</strong> Draft posts are visible. They will be hidden in production.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Sidebar - Search and Filters */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-20">
                <Suspense fallback={
                  <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6 animate-pulse">
                    <div className="h-12 bg-neutral-700 rounded mb-4"></div>
                    <div className="h-32 bg-neutral-700 rounded"></div>
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
            </aside>
          </div>
        </div>
      </PageSection>

      <Footer />
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
