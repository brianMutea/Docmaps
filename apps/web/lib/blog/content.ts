/**
 * Content Layer API
 * 
 * This module provides a unified interface for querying blog posts.
 * It handles:
 * - Reading MDX files from the content/blog directory
 * - Validating frontmatter against the schema
 * - Processing MDX content
 * - Filtering, sorting, and searching posts
 * - Extracting tags and categories with counts
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { validateFrontmatter, type PostFrontmatter } from './schema'
import { processMDX, type Heading, type ReadingTime } from './mdx'
import { generateSlug } from './utils'

/**
 * Complete post data structure
 */
export interface Post {
  /** Unique identifier derived from filename or customSlug */
  slug: string
  /** Validated frontmatter metadata */
  frontmatter: PostFrontmatter
  /** Raw MDX content (before compilation) */
  content: string
  /** Calculated reading time */
  readingTime: ReadingTime
  /** Extracted headings for TOC */
  headings: Heading[]
  /** File system path relative to content/blog */
  filepath: string
  /** Full URL path: /blog/[slug] */
  url: string
  /** Whether the post is published (!draft && date <= now) */
  isPublished: boolean
}

/**
 * Query options for filtering and sorting posts
 */
export interface QueryOptions {
  /** Include draft posts (default: false in production, true in development) */
  includeDrafts?: boolean
  /** Field to sort by */
  sortBy?: 'date' | 'title' | 'readingTime'
  /** Sort order */
  sortOrder?: 'asc' | 'desc'
  /** Maximum number of posts to return */
  limit?: number
  /** Number of posts to skip (for pagination) */
  offset?: number
}

/**
 * Tag with post count
 */
export interface TagWithCount {
  name: string
  count: number
}

/**
 * Category with post count
 */
export interface CategoryWithCount {
  name: string
  count: number
}

// Content directory path
const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')

/**
 * Check if the content directory exists
 */
function ensureContentDirectory(): void {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(
      `Content directory not found at ${CONTENT_DIR}. ` +
      `Please create the directory and add some blog posts.`
    )
  }
}

/**
 * Recursively find all MDX files in a directory
 * 
 * @param dir - Directory to search
 * @param fileList - Accumulated list of files (used for recursion)
 * @returns Array of absolute file paths
 */
function findMDXFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Skip examples directory
      if (file === 'examples') {
        return
      }
      // Recursively search subdirectories
      findMDXFiles(filePath, fileList)
    } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
      // Skip documentation files (README, CONTRIBUTING, etc.)
      const uppercaseFile = file.toUpperCase()
      if (
        uppercaseFile === 'README.MD' ||
        uppercaseFile === 'CONTRIBUTING.MD' ||
        uppercaseFile.startsWith('.')
      ) {
        return
      }
      fileList.push(filePath)
    }
  })

  return fileList
}

/**
 * Parse a single MDX file into a Post object
 * 
 * @param filepath - Absolute path to the MDX file
 * @returns Post object or null if parsing fails
 */
async function parsePost(filepath: string): Promise<Post | null> {
  try {
    // Read file content
    const fileContent = fs.readFileSync(filepath, 'utf-8')
    
    // Parse frontmatter and content
    const { data: frontmatterData, content } = matter(fileContent)
    
    // Get relative path from content/blog directory
    const relativePath = path.relative(CONTENT_DIR, filepath)
    
    // Validate frontmatter
    const frontmatter = validateFrontmatter(frontmatterData, relativePath)
    
    // Generate slug from filename or use customSlug
    const filename = path.basename(filepath, path.extname(filepath))
    const slug = frontmatter.customSlug || generateSlug(filename)
    
    // Process MDX to get headings and reading time
    const { headings, readingTime } = await processMDX({
      source: content,
      frontmatter,
      filepath: relativePath,
    })
    
    // Determine if post is published
    const isDraft = frontmatter.draft ?? false
    const postDate = new Date(frontmatter.date)
    const now = new Date()
    const isPublished = !isDraft && postDate <= now
    
    return {
      slug,
      frontmatter,
      content,
      readingTime,
      headings,
      filepath: relativePath,
      url: `/blog/${slug}`,
      isPublished,
    }
  } catch (error) {
    // Log error but don't fail the entire build
    console.error(`Error parsing post at ${filepath}:`, error)
    return null
  }
}

/**
 * Get all blog posts
 * 
 * Reads all MDX files from content/blog directory (including nested directories),
 * validates frontmatter, processes MDX, and returns an array of Post objects.
 * 
 * @param options - Query options for filtering and sorting
 * @returns Array of Post objects
 * 
 * @example
 * ```typescript
 * // Get all published posts, sorted by date (newest first)
 * const posts = await getAllPosts()
 * 
 * // Get all posts including drafts
 * const allPosts = await getAllPosts({ includeDrafts: true })
 * 
 * // Get first 10 posts sorted by title
 * const posts = await getAllPosts({
 *   sortBy: 'title',
 *   sortOrder: 'asc',
 *   limit: 10
 * })
 * ```
 */
export async function getAllPosts(options: QueryOptions = {}): Promise<Post[]> {
  ensureContentDirectory()
  
  const {
    includeDrafts = process.env.NODE_ENV === 'development',
    sortBy = 'date',
    sortOrder = 'desc',
    limit,
    offset = 0,
  } = options
  
  // Find all MDX files recursively
  const mdxFiles = findMDXFiles(CONTENT_DIR)
  
  // Parse all posts
  const posts = await Promise.all(mdxFiles.map(parsePost))
  
  // Filter out null values (failed parses) and drafts if needed
  let filteredPosts = posts.filter((post): post is Post => {
    if (!post) return false
    if (!includeDrafts && !post.isPublished) return false
    return true
  })
  
  // Sort posts
  filteredPosts.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.frontmatter.date).getTime() - new Date(b.frontmatter.date).getTime()
        break
      case 'title':
        comparison = a.frontmatter.title.localeCompare(b.frontmatter.title)
        break
      case 'readingTime':
        comparison = a.readingTime.minutes - b.readingTime.minutes
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })
  
  // Apply pagination
  if (limit !== undefined) {
    filteredPosts = filteredPosts.slice(offset, offset + limit)
  } else if (offset > 0) {
    filteredPosts = filteredPosts.slice(offset)
  }
  
  return filteredPosts
}

/**
 * Get a single post by slug
 * 
 * @param slug - Post slug (URL-safe identifier)
 * @returns Post object or null if not found
 * 
 * @example
 * ```typescript
 * const post = await getPostBySlug('my-first-post')
 * if (post) {
 *   console.log(post.frontmatter.title)
 * }
 * ```
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const allPosts = await getAllPosts({ includeDrafts: true })
  return allPosts.find((post) => post.slug === slug) || null
}

/**
 * Get all posts with a specific tag
 * 
 * @param tag - Tag name to filter by
 * @param options - Query options
 * @returns Array of Post objects with the specified tag
 * 
 * @example
 * ```typescript
 * const posts = await getPostsByTag('typescript')
 * ```
 */
export async function getPostsByTag(
  tag: string,
  options: QueryOptions = {}
): Promise<Post[]> {
  const allPosts = await getAllPosts(options)
  return allPosts.filter((post) =>
    post.frontmatter.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}

/**
 * Get all posts in a specific category
 * 
 * @param category - Category name to filter by
 * @param options - Query options
 * @returns Array of Post objects in the specified category
 * 
 * @example
 * ```typescript
 * const posts = await getPostsByCategory('tutorials')
 * ```
 */
export async function getPostsByCategory(
  category: string,
  options: QueryOptions = {}
): Promise<Post[]> {
  const allPosts = await getAllPosts(options)
  return allPosts.filter((post) =>
    post.frontmatter.categories.some((c) => c.toLowerCase() === category.toLowerCase())
  )
}

/**
 * Get all tags with post counts
 * 
 * @param includeDrafts - Whether to include draft posts in counts
 * @returns Array of tags with counts, sorted by count (descending)
 * 
 * @example
 * ```typescript
 * const tags = await getAllTags()
 * // [{ name: 'typescript', count: 5 }, { name: 'react', count: 3 }, ...]
 * ```
 */
export async function getAllTags(includeDrafts?: boolean): Promise<TagWithCount[]> {
  const allPosts = await getAllPosts({ includeDrafts })
  
  // Count occurrences of each tag
  const tagCounts = new Map<string, number>()
  
  allPosts.forEach((post) => {
    post.frontmatter.tags.forEach((tag) => {
      const normalizedTag = tag.toLowerCase()
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1)
    })
  })
  
  // Convert to array and sort by count
  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get all categories with post counts
 * 
 * @param includeDrafts - Whether to include draft posts in counts
 * @returns Array of categories with counts, sorted by count (descending)
 * 
 * @example
 * ```typescript
 * const categories = await getAllCategories()
 * // [{ name: 'tutorials', count: 8 }, { name: 'guides', count: 5 }, ...]
 * ```
 */
export async function getAllCategories(includeDrafts?: boolean): Promise<CategoryWithCount[]> {
  const allPosts = await getAllPosts({ includeDrafts })
  
  // Count occurrences of each category
  const categoryCounts = new Map<string, number>()
  
  allPosts.forEach((post) => {
    post.frontmatter.categories.forEach((category) => {
      const normalizedCategory = category.toLowerCase()
      categoryCounts.set(normalizedCategory, (categoryCounts.get(normalizedCategory) || 0) + 1)
    })
  })
  
  // Convert to array and sort by count
  return Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Search posts by query string
 * 
 * Searches in post title, excerpt, and tags (case-insensitive).
 * This is designed for client-side search functionality.
 * 
 * @param query - Search query string
 * @param options - Query options
 * @returns Array of Post objects matching the search query
 * 
 * @example
 * ```typescript
 * const results = await searchPosts('typescript react')
 * ```
 */
export async function searchPosts(
  query: string,
  options: QueryOptions = {}
): Promise<Post[]> {
  if (!query.trim()) {
    return []
  }
  
  const allPosts = await getAllPosts(options)
  const normalizedQuery = query.toLowerCase().trim()
  
  return allPosts.filter((post) => {
    const { title, excerpt, tags } = post.frontmatter
    
    // Search in title
    if (title.toLowerCase().includes(normalizedQuery)) {
      return true
    }
    
    // Search in excerpt
    if (excerpt.toLowerCase().includes(normalizedQuery)) {
      return true
    }
    
    // Search in tags
    if (tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))) {
      return true
    }
    
    return false
  })
}

/**
 * Get related posts for a given post
 * 
 * Returns the top N most similar posts based on shared tags and categories.
 * If the post has a manual override (frontmatter.relatedPosts), those posts
 * are returned instead.
 * 
 * Uses the related posts algorithm from related-posts.ts which scores posts based on:
 * - Shared tags (2 points each)
 * - Shared categories (3 points each)
 * - Recency bonus (+1 point if posts are within 30 days)
 * 
 * @param post - The post to find related posts for
 * @param limit - Maximum number of related posts to return (default: 3)
 * @returns Array of related Post objects, sorted by similarity (highest first)
 * 
 * @example
 * ```typescript
 * const post = await getPostBySlug('my-post')
 * if (post) {
 *   const related = await getRelatedPosts(post, 3)
 *   console.log(`Found ${related.length} related posts`)
 * }
 * ```
 */
export async function getRelatedPosts(post: Post, limit: number = 3): Promise<Post[]> {
  // Import the algorithm from related-posts module
  const { getRelatedPosts: getRelatedPostsAlgorithm } = await import('./related-posts')
  
  // Get all posts to search through
  const allPosts = await getAllPosts({ includeDrafts: false })
  
  // Use the algorithm to find related posts
  return getRelatedPostsAlgorithm(post, allPosts, limit)
}
