'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/blog/content';

interface PostNavigationProps {
  previousPost?: Post | null;
  nextPost?: Post | null;
}

/**
 * PostNavigation component displays previous and next post navigation links
 * 
 * Features:
 * - Previous and next post links with titles
 * - Handles first/last post edge cases (no previous/next)
 * - Hover effects matching DocMaps design system
 * - Responsive layout
 * - Directional arrows for visual clarity
 * 
 * @param previousPost - The previous post in chronological order (optional)
 * @param nextPost - The next post in chronological order (optional)
 */
export function PostNavigation({ previousPost, nextPost }: PostNavigationProps) {
  // Don't render if there are no navigation links
  if (!previousPost && !nextPost) {
    return null;
  }

  return (
    <nav className="border-t border-neutral-700 pt-8 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previous Post */}
        <div className="flex">
          {previousPost ? (
            <Link
              href={previousPost.url}
              className="flex-1 group relative bg-neutral-800 rounded-xl border border-neutral-700 p-6 transition-all duration-200 hover:shadow-md hover:border-neutral-600 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-700 text-neutral-400 group-hover:bg-blue-900/50 group-hover:text-blue-400 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                    Previous Post
                  </div>
                  <div className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {previousPost.frontmatter.title}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Next Post */}
        <div className="flex">
          {nextPost ? (
            <Link
              href={nextPost.url}
              className="flex-1 group relative bg-neutral-800 rounded-xl border border-neutral-700 p-6 transition-all duration-200 hover:shadow-md hover:border-neutral-600 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                    Next Post
                  </div>
                  <div className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {nextPost.frontmatter.title}
                  </div>
                </div>
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-700 text-neutral-400 group-hover:bg-blue-900/50 group-hover:text-blue-400 transition-colors">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </nav>
  );
}
