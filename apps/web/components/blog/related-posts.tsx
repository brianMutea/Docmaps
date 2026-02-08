'use client';

import type { Post } from '@/lib/blog/content';
import { PostCard } from './post-card';

interface RelatedPostsProps {
  posts: Post[];
}

/**
 * RelatedPosts component displays a grid of related blog posts
 * 
 * Features:
 * - Displays related posts in a responsive grid layout
 * - Shows "Related Posts" heading
 * - Reuses PostCard component for consistent styling
 * - Handles empty state gracefully
 * - Matches DocMaps design system
 * 
 * @param posts - Array of related posts to display
 */
export function RelatedPosts({ posts }: RelatedPostsProps) {
  // Don't render if no related posts
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-12 border-t border-neutral-700">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-white mb-6">
        Related Posts
      </h2>

      {/* Grid of post cards - same as blog index */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
