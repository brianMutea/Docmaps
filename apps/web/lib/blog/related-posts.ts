/**
 * Related Posts Algorithm
 * 
 * This module implements the algorithm for suggesting related posts based on
 * shared tags and categories. The algorithm scores posts based on similarity
 * and returns the top N most similar posts.
 * 
 * Scoring system:
 * - Shared tags: 2 points each
 * - Shared categories: 3 points each
 * - Recency bonus: +1 point if posts are within 30 days of each other
 * 
 * Manual override: If frontmatter.relatedPosts is specified, those posts
 * are returned instead of using the algorithm.
 */

import type { Post } from './content'

/**
 * Internal structure for tracking post similarity scores
 */
interface RelatedPostScore {
  post: Post
  score: number
}

/**
 * Calculate similarity score between two posts
 * 
 * The score is based on:
 * - Shared tags (2 points each)
 * - Shared categories (3 points each)
 * - Recency bonus (+1 point if posts are within 30 days)
 * 
 * @param currentPost - The post to compare against
 * @param candidatePost - The post to score for similarity
 * @returns Similarity score (higher = more similar)
 * 
 * @example
 * ```typescript
 * const score = calculateSimilarityScore(post1, post2)
 * // Returns: 7 (e.g., 2 shared tags + 1 shared category + recency bonus)
 * ```
 */
export function calculateSimilarityScore(currentPost: Post, candidatePost: Post): number {
  let score = 0
  
  // Count shared tags (2 points each)
  const sharedTags = currentPost.frontmatter.tags.filter((tag) =>
    candidatePost.frontmatter.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  )
  score += sharedTags.length * 2
  
  // Count shared categories (3 points each)
  const sharedCategories = currentPost.frontmatter.categories.filter((category) =>
    candidatePost.frontmatter.categories.some((c) => c.toLowerCase() === category.toLowerCase())
  )
  score += sharedCategories.length * 3
  
  // Recency bonus: posts within 30 days get +1 point
  const currentDate = new Date(currentPost.frontmatter.date)
  const candidateDate = new Date(candidatePost.frontmatter.date)
  const daysDiff = Math.abs(currentDate.getTime() - candidateDate.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysDiff <= 30) {
    score += 1
  }
  
  return score
}

/**
 * Get related posts for a given post
 * 
 * Returns the top N most similar posts based on shared tags and categories.
 * If the post has a manual override (frontmatter.relatedPosts), those posts
 * are returned instead.
 * 
 * @param currentPost - The post to find related posts for
 * @param allPosts - All available posts to search through
 * @param limit - Maximum number of related posts to return (default: 3)
 * @returns Array of related Post objects, sorted by similarity (highest first)
 * 
 * @example
 * ```typescript
 * const related = getRelatedPosts(post, allPosts, 3)
 * // Returns: [post1, post2, post3] (most similar posts)
 * ```
 */
export function getRelatedPosts(
  currentPost: Post,
  allPosts: Post[],
  limit: number = 3
): Post[] {
  // Check for manual override in frontmatter
  if (currentPost.frontmatter.relatedPosts && currentPost.frontmatter.relatedPosts.length > 0) {
    // Find posts by slug from the manual override list
    const manualRelated = currentPost.frontmatter.relatedPosts
      .map((slug) => allPosts.find((p) => p.slug === slug))
      .filter((post): post is Post => post !== undefined && post.isPublished)
      .slice(0, limit)
    
    return manualRelated
  }
  
  // Filter out the current post and unpublished posts
  const candidatePosts = allPosts.filter(
    (post) => post.slug !== currentPost.slug && post.isPublished
  )
  
  // Calculate similarity scores for all candidate posts
  const scoredPosts: RelatedPostScore[] = candidatePosts.map((post) => ({
    post,
    score: calculateSimilarityScore(currentPost, post),
  }))
  
  // Sort by score (highest first) and take top N
  const topRelated = scoredPosts
    .filter((item) => item.score > 0) // Only include posts with some similarity
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post)
  
  return topRelated
}
