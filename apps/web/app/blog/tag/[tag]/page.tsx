import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Tag as TagIcon } from 'lucide-react';
import { getPostsByTag, getAllTags } from '@/lib/blog/content';
import { blogConfig } from '@/lib/blog/config';
import { calculatePagination } from '@/lib/blog/pagination-utils';
import { PostCard } from '@/components/blog/post-card';
import { Pagination } from '@/components/blog/pagination';

interface TagPageProps {
  params: {
    tag: string;
  };
  searchParams: {
    page?: string;
  };
}

/**
 * Generate static params for all tags
 * This enables static generation of tag filter pages at build time
 */
export async function generateStaticParams() {
  const tags = await getAllTags();
  
  return tags.map((tag) => ({
    tag: tag.name.toLowerCase(),
  }));
}

/**
 * Generate metadata for tag pages
 */
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(tag);
  
  return {
    title: `Posts tagged "${tag}" - ${blogConfig.siteMetadata.title}`,
    description: `Browse ${posts.length} blog post${posts.length === 1 ? '' : 's'} tagged with "${tag}"`,
  };
}

/**
 * Tag filter page
 * 
 * Displays all blog posts with a specific tag.
 * Features:
 * - Filtered post grid
 * - Tag name in heading
 * - Link back to blog index
 * - Pagination support
 * - Post count display
 */
export default async function TagPage({ params, searchParams }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const currentPage = Number(searchParams.page) || 1;
  
  // Fetch all posts with this tag
  const allPosts = await getPostsByTag(tag);
  
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
            <div className="p-3 bg-blue-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {tag}
              </h1>
              <p className="text-gray-600 mt-1">
                {allPosts.length} post{allPosts.length === 1 ? '' : 's'} tagged with &ldquo;{tag}&rdquo;
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
              basePath={`/blog/tag/${encodeURIComponent(tag)}`}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No posts found with this tag.</p>
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
