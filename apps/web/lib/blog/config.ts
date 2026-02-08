/**
 * Blog Configuration Module
 * 
 * Centralized configuration for the MDX blog system.
 * Customize blog behavior, features, and metadata here.
 */

import type { Author } from './schema'
import { Callout } from '@/components/blog/mdx/callout'
import { CodeBlock } from '@/components/blog/mdx/code-block'
import { ImageGallery } from '@/components/blog/mdx/image-gallery'
import { YouTubeEmbed } from '@/components/blog/mdx/youtube-embed'
import { Collapsible } from '@/components/blog/mdx/collapsible'

/**
 * Blog configuration interface
 */
export interface BlogConfig {
  /** Number of posts to display per page in listings */
  postsPerPage: number;

  /** Feature toggles for optional functionality */
  features: {
    /** Enable client-side search functionality */
    search: boolean;
    /** Enable related posts suggestions */
    relatedPosts: boolean;
    /** Enable social media share buttons */
    socialShare: boolean;
    /** Enable automatic table of contents */
    tableOfContents: boolean;
    /** Display estimated reading time */
    readingTime: boolean;
  };

  /** Default author information for posts without explicit author */
  defaultAuthor: Author;

  /** Social media links for sharing and author profiles */
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };

  /** Site metadata for SEO and feeds */
  siteMetadata: {
    /** Site title */
    title: string;
    /** Site description */
    description: string;
    /** Full site URL (no trailing slash) */
    siteUrl: string;
    /** Primary language code (e.g., 'en', 'es') */
    language: string;
  };

  /** RSS/Atom feed configuration */
  rss: {
    /** Feed title */
    title: string;
    /** Feed description */
    description: string;
    /** Full URL to the RSS feed */
    feedUrl: string;
    /** Full site URL */
    siteUrl: string;
    /** Copyright notice */
    copyright: string;
  };

  /** Syntax highlighting configuration */
  syntaxHighlighting: {
    /** Theme for code blocks */
    theme: 'github-dark' | 'github-light' | 'dracula' | 'nord';
  };

  /** Custom MDX components registry */
  mdxComponents: Record<string, React.ComponentType<any>>;
}

/**
 * Default blog configuration for DocMaps
 * 
 * This configuration can be customized to match your needs.
 * All settings are centralized here for easy maintenance.
 */
export const blogConfig: BlogConfig = {
  // Pagination
  postsPerPage: 12,

  // Feature toggles
  features: {
    search: true,
    relatedPosts: true,
    socialShare: true,
    tableOfContents: true,
    readingTime: true,
  },

  // Default author
  defaultAuthor: {
    name: 'DocMaps Team',
    avatar: '/images/team-avatar.png',
    bio: 'Building visual documentation tools for developers',
    social: {
      twitter: 'docmaps',
      github: 'docmaps',
    },
  },

  // Social links
  socialLinks: {
    twitter: 'https://twitter.com/docmaps',
    github: 'https://github.com/docmaps',
  },

  // Site metadata
  siteMetadata: {
    title: 'DocMaps Blog',
    description: 'Insights on visual documentation and developer tools',
    siteUrl: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001',
    language: 'en',
  },

  // RSS feed configuration
  rss: {
    title: 'DocMaps Blog',
    description: 'Latest posts from the DocMaps team',
    feedUrl: `${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}/feed.xml`,
    siteUrl: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001',
    copyright: `© ${new Date().getFullYear()} DocMaps`,
  },

  // Syntax highlighting
  syntaxHighlighting: {
    theme: 'github-dark',
  },

  // Custom MDX components
  mdxComponents: {
    Callout,
    CodeBlock,
    ImageGallery,
    YouTubeEmbed,
    Collapsible,
  },
}
