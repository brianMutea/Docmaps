/**
 * Example usage of the blog schema validation
 * These examples demonstrate correct frontmatter structure
 */

import type { PostFrontmatter } from '../schema'

/**
 * Example 1: Minimal valid frontmatter
 * Contains only required fields (defaults will be applied by schema)
 */
export const minimalFrontmatter = {
  title: 'Getting Started with DocMaps',
  date: '2024-01-15T10:00:00Z',
  author: {
    name: 'DocMaps Team',
  },
  excerpt: 'Learn how to create your first visual documentation map with DocMaps.',
  tags: ['tutorial', 'getting-started'],
  categories: ['guides'],
  seo: {},
} as const

/**
 * Example 2: Complete frontmatter with all optional fields
 * Demonstrates full feature set
 */
export const completeFrontmatter: PostFrontmatter = {
  title: 'Advanced DocMaps Features',
  date: '2024-01-20T14:30:00Z',
  author: {
    name: 'Jane Developer',
    avatar: 'https://example.com/avatars/jane.jpg',
    bio: 'Senior Developer Advocate at DocMaps',
    social: {
      twitter: 'janedev',
      github: 'janedev',
      linkedin: 'jane-developer',
    },
  },
  excerpt: 'Explore advanced features like multi-view maps, custom nodes, and integration patterns.',
  tags: ['advanced', 'features', 'multi-view'],
  categories: ['guides', 'features'],
  seo: {
    title: 'Advanced DocMaps Features - Complete Guide',
    description: 'Master advanced DocMaps features including multi-view maps, custom nodes, and more.',
    keywords: ['docmaps', 'visual documentation', 'advanced features'],
  },
  featuredImage: {
    src: '/images/blog/advanced-features-hero.jpg',
    alt: 'Screenshot showing advanced DocMaps features in action',
    width: 1200,
    height: 630,
  },
  updatedAt: '2024-01-25T09:00:00Z',
  draft: false,
  customSlug: 'advanced-docmaps-features',
  showTOC: true,
  relatedPosts: ['getting-started', 'multi-view-maps'],
}

/**
 * Example 3: Draft post
 * Shows how to mark a post as draft
 */
export const draftFrontmatter = {
  title: 'Upcoming Feature: Real-time Collaboration',
  date: '2024-02-01T10:00:00Z',
  author: {
    name: 'DocMaps Team',
  },
  excerpt: 'Preview of our upcoming real-time collaboration features.',
  tags: ['features', 'collaboration'],
  categories: ['announcements'],
  seo: {},
  draft: true, // This post won't appear in production
} as const

/**
 * Example 4: Post without table of contents
 * Useful for short posts or announcements
 */
export const noTOCFrontmatter = {
  title: 'Quick Tip: Keyboard Shortcuts',
  date: '2024-01-18T16:00:00Z',
  author: {
    name: 'DocMaps Team',
  },
  excerpt: 'Essential keyboard shortcuts to speed up your workflow.',
  tags: ['tips', 'productivity'],
  categories: ['tips'],
  seo: {},
  showTOC: false, // Disable table of contents for this post
} as const

/**
 * Example 5: Post with custom SEO
 * Demonstrates SEO optimization
 */
export const seoOptimizedFrontmatter = {
  title: 'How to Document AWS Architecture',
  date: '2024-01-22T11:00:00Z',
  author: {
    name: 'Cloud Architecture Team',
    avatar: 'https://example.com/avatars/cloud-team.jpg',
  },
  excerpt: 'Best practices for documenting AWS cloud architecture using visual diagrams.',
  tags: ['aws', 'cloud', 'architecture'],
  categories: ['tutorials', 'cloud'],
  seo: {
    title: 'AWS Architecture Documentation Guide | DocMaps',
    description: 'Learn how to create clear, maintainable AWS architecture documentation with visual diagrams. Step-by-step guide with examples.',
    keywords: ['aws documentation', 'cloud architecture', 'aws diagrams', 'visual documentation'],
  },
  featuredImage: {
    src: '/images/blog/aws-architecture.jpg',
    alt: 'AWS architecture diagram created with DocMaps',
    width: 1200,
    height: 630,
  },
} as const
