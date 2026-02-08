import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Folder } from 'lucide-react';
import { getPostsByCategory, getAllCategories } from '@/lib/blog/content';
import { blogConfig } from '@/lib/blog/config';
import { calculatePagination } from '@/lib/blog/pagination-utils';
import { PostCard } from '@/components/blog/post-card';
import { Pagination } from '@/components/blog/pagination';

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    page?: string;
  };
}

/**
 * Generate static params for all categories
 * This enables static generation of category filter pages at build time
 */
export async function generateStaticParams() {
  const categories = await getAllCategories();
  
  return categories.map((category) => ({
    category: category.name.toLowerCase(),
  }));
}

/**
 * Generate metadata for category pages
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = decodeURIComponent(params.category);
  const posts = await getPostsByCategory(category);
  
  return {
    title: `${category} - ${blogConfig.siteMetadata.title}`,
    description: `Browse ${posts.length} blog post${posts.length === 1 ? '' : 's'} in the "${category}" category`,
  };
}

/**
 * Category filter page
 * 
 * Displays all blog posts in a specific category.
 * Features:
 * - Filtered post grid
 * - Category name in heading
 * - Link back to blog index
 * - Pagination support
 * - Post count display
 */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = decodeURIComponent(params.category);
  const currentPage = Number(searchParams.page) || 1;
  
  // Fetch all posts in this category
  const allPosts = await getPostsByCategory(category);
  
  // Calculate pagination
  const { postsPerPage } = blogConfig;
  const pagination = calculatePagination(allPosts.length, currentPage, postsPerPage);
  
  // Get posts for current page
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const posts = allPosts.slice(startIndex, endIndex);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Folder className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 capitalize">
                {category}
              </h1>
              <p className="text-gray-600 mt-1">
                {allPosts.length} post{allPosts.length === 1 ? '' : 's'} in this category
              </p>
            </div>
          </div>
        </div>
        
        {/* Posts grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
            
            {/* Pagination */}
            <Pagination
              pagination={pagination}
              basePath={`/blog/category/${encodeURIComponent(category)}`}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No posts found in this category.</p>
            <Link
              href="/blog"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              View all posts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
