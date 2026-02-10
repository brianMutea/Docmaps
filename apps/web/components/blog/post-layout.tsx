'use client';

import type { Post } from '@/lib/blog/content';
import { PostHeader } from './post-header';
import { TableOfContents } from './table-of-contents';
import { PostNavigation } from './post-navigation';
import { RelatedPosts } from './related-posts';
import { SocialShare } from './social-share';
import { PageSection } from '@docmaps/ui';
import { Footer } from '@/components/footer';

interface PostLayoutProps {
  /** The current post data */
  post: Post;
  /** The compiled MDX content to render */
  children: React.ReactNode;
  /** Previous post in chronological order (optional) */
  previousPost?: Post | null;
  /** Next post in chronological order (optional) */
  nextPost?: Post | null;
  /** Related posts based on tags/categories (optional) */
  relatedPosts?: Post[];
  /** Full URL of the post for social sharing */
  postUrl: string;
}

/**
 * PostLayout component provides the complete layout for blog post pages
 * 
 * Features:
 * - Semantic HTML structure (article, header, main) for accessibility
 * - PostHeader component with title, author, date, tags, featured image
 * - Optional TableOfContents component (controlled by frontmatter.showTOC)
 * - Main content area for rendered MDX
 * - PostNavigation component for previous/next links
 * - RelatedPosts component for similar content
 * - SocialShare component for sharing on social media
 * - Proper heading hierarchy (h1 in header, h2-h6 in content)
 * - Responsive two-column layout (content + TOC on desktop)
 * 
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.7
 * 
 * @param post - The post data including frontmatter, headings, etc.
 * @param children - The compiled MDX content
 * @param previousPost - Previous post for navigation
 * @param nextPost - Next post for navigation
 * @param relatedPosts - Array of related posts
 * @param postUrl - Full URL for social sharing
 */
export function PostLayout({
  post,
  children,
  previousPost,
  nextPost,
  relatedPosts = [],
  postUrl,
}: PostLayoutProps) {
  const { frontmatter, headings, readingTime } = post;
  const showTOC = frontmatter.showTOC !== false && headings.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      <PageSection className="py-12 flex-1">
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Post header section */}
          <PostHeader frontmatter={frontmatter} readingTime={readingTime} />

          {/* Content area with optional TOC sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            {/* Main content column */}
            <main
              className={`
                ${showTOC ? 'lg:col-span-12' : 'lg:col-span-12 max-w-4xl mx-auto'}
              `}
            >
              {/* MDX content with prose styling - white background for readability */}
              <div className="bg-white rounded-xl p-8 prose prose-lg prose-gray max-w-none prose-headings:scroll-mt-20 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']">
                {children}
              </div>

              {/* Social share section */}
              <div className="mt-12">
                <SocialShare title={frontmatter.title} url={postUrl} />
              </div>

              {/* Post navigation */}
              <PostNavigation previousPost={previousPost} nextPost={nextPost} />
            </main>
          </div>

          {/* Related posts - full width below content */}
          {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
        </article>

        {/* Fixed Table of Contents (renders outside grid) */}
        {showTOC && (
          <TableOfContents headings={headings} />
        )}
      </PageSection>

      <Footer />
    </div>
  );
}
