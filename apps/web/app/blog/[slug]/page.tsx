import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkUnwrapImages from 'remark-unwrap-images';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { getAllPosts, getPostBySlug } from '@/lib/blog/content';
import { blogConfig } from '@/lib/blog/config';
import { PostLayout } from '@/components/blog/post-layout';

/**
 * Individual Blog Post Page
 * 
 * This page renders individual blog posts with:
 * - Static generation for optimal performance
 * - Dynamic SEO metadata (title, description, Open Graph, Twitter Cards)
 * - JSON-LD structured data for search engines
 * - Previous/next post navigation
 * - Related posts suggestions
 * - Full MDX rendering with custom components
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.5, 6.6
 */

interface PageProps {
  params: {
    slug: string;
  };
}

/**
 * Generate static params for all blog posts
 * This enables static generation at build time for optimal performance
 */
export async function generateStaticParams() {
  const posts = await getAllPosts({ includeDrafts: false });
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate dynamic metadata for SEO
 * 
 * Includes:
 * - Page title (from seo.title or title)
 * - Meta description (from seo.description or excerpt)
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Canonical URL
 * - Keywords from frontmatter
 * 
 * Requirements: 6.1, 6.6
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
  
  const { frontmatter } = post;
  const { siteMetadata } = blogConfig;
  
  // Use SEO-specific title/description if provided, otherwise use defaults
  const title = frontmatter.seo.title || frontmatter.title;
  const description = frontmatter.seo.description || frontmatter.excerpt;
  const postUrl = `${siteMetadata.siteUrl}/blog/${post.slug}`;
  
  // Get featured image URL (absolute URL for Open Graph)
  const imageUrl = frontmatter.featuredImage
    ? frontmatter.featuredImage.src.startsWith('http')
      ? frontmatter.featuredImage.src
      : `${siteMetadata.siteUrl}${frontmatter.featuredImage.src}`
    : `${siteMetadata.siteUrl}/images/og-default.png`;
  
  return {
    title: `${title} | ${siteMetadata.title}`,
    description,
    keywords: frontmatter.seo.keywords,
    authors: [{ name: frontmatter.author.name }],
    
    // Canonical URL to prevent duplicate content issues
    alternates: {
      canonical: postUrl,
    },
    
    // Open Graph tags for social sharing
    openGraph: {
      type: 'article',
      title,
      description,
      url: postUrl,
      siteName: siteMetadata.title,
      images: [
        {
          url: imageUrl,
          width: frontmatter.featuredImage?.width || 1200,
          height: frontmatter.featuredImage?.height || 630,
          alt: frontmatter.featuredImage?.alt || title,
        },
      ],
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updatedAt || frontmatter.date,
      authors: [frontmatter.author.name],
      tags: frontmatter.tags,
    },
    
    // Twitter Card tags
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: frontmatter.author.social?.twitter
        ? `@${frontmatter.author.social.twitter}`
        : undefined,
    },
  };
}

/**
 * Blog Post Page Component
 * 
 * Renders a complete blog post with:
 * - Post header (title, author, date, tags, featured image)
 * - Table of contents (if enabled)
 * - MDX content with custom components
 * - Social share buttons
 * - Previous/next navigation
 * - Related posts
 * - JSON-LD structured data
 */
export default async function BlogPostPage({ params }: PageProps) {
  // Fetch the post by slug
  const post = await getPostBySlug(params.slug);
  
  // Return 404 if post not found
  if (!post) {
    notFound();
  }
  
  // Check if post is published (hide drafts in production)
  if (!post.isPublished && process.env.NODE_ENV === 'production') {
    notFound();
  }
  
  // Get all posts for navigation and related posts
  const allPosts = await getAllPosts({ includeDrafts: false });
  
  // Calculate previous and next posts (chronological order)
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  
  // Get related posts (uses algorithm from related-posts.ts)
  const { getRelatedPosts } = await import('@/lib/blog/related-posts');
  const relatedPosts = getRelatedPosts(post, allPosts, 3);
  
  // Full post URL for social sharing
  const postUrl = `${blogConfig.siteMetadata.siteUrl}/blog/${post.slug}`;
  
  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    image: post.frontmatter.featuredImage
      ? post.frontmatter.featuredImage.src.startsWith('http')
        ? post.frontmatter.featuredImage.src
        : `${blogConfig.siteMetadata.siteUrl}${post.frontmatter.featuredImage.src}`
      : undefined,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.updatedAt || post.frontmatter.date,
    author: {
      '@type': 'Person',
      name: post.frontmatter.author.name,
      url: post.frontmatter.author.social?.twitter
        ? `https://twitter.com/${post.frontmatter.author.social.twitter}`
        : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: blogConfig.siteMetadata.title,
      url: blogConfig.siteMetadata.siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.frontmatter.tags.join(', '),
  };
  
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Post layout with all sections */}
      <PostLayout
        post={post}
        previousPost={previousPost}
        nextPost={nextPost}
        relatedPosts={relatedPosts}
        postUrl={postUrl}
      >
        {/* Render MDX content with custom components and rehype plugins */}
        <MDXRemote
          source={post.content}
          components={blogConfig.mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkUnwrapImages],
              rehypePlugins: [
                rehypeSlug,
                [
                  rehypeAutolinkHeadings,
                  {
                    behavior: 'append',
                    properties: {
                      className: ['heading-anchor'],
                      ariaLabel: 'Link to this section',
                    },
                    content: {
                      type: 'element',
                      tagName: 'span',
                      properties: { className: ['anchor-icon'] },
                      children: [{ type: 'text', value: '#' }],
                    },
                  },
                ],
                [
                  rehypePrettyCode,
                  {
                    theme: 'github-dark',
                    onVisitLine(node: any) {
                      if (node.children.length === 0) {
                        node.children = [{ type: 'text', value: ' ' }];
                      }
                    },
                    onVisitHighlightedLine(node: any) {
                      if (!node.properties.className) {
                        node.properties.className = [];
                      }
                      node.properties.className.push('highlighted');
                    },
                    onVisitHighlightedChars(node: any) {
                      if (!node.properties.className) {
                        node.properties.className = [];
                      }
                      node.properties.className.push('highlighted-chars');
                    },
                  },
                ],
              ],
            },
          }}
        />
      </PostLayout>
    </>
  );
}
