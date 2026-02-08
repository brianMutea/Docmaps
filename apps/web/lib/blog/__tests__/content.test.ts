/**
 * Content Layer API Tests
 * 
 * Tests for the content query functions including:
 * - getAllPosts with various options
 * - getPostBySlug
 * - getPostsByTag and getPostsByCategory
 * - getAllTags and getAllCategories
 * - searchPosts
 */

import { describe, it, expect } from '@jest/globals'
import {
  getAllPosts,
  getPostBySlug,
  getPostsByTag,
  getPostsByCategory,
  getAllTags,
  getAllCategories,
  searchPosts,
} from '../content'

describe('Content Layer API', () => {
  describe('getAllPosts', () => {
    it('should return an array of posts', async () => {
      const posts = await getAllPosts()
      expect(Array.isArray(posts)).toBe(true)
    })

    it('should return posts with required fields', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 0) {
        const post = posts[0]
        expect(post).toHaveProperty('slug')
        expect(post).toHaveProperty('frontmatter')
        expect(post).toHaveProperty('content')
        expect(post).toHaveProperty('readingTime')
        expect(post).toHaveProperty('headings')
        expect(post).toHaveProperty('filepath')
        expect(post).toHaveProperty('url')
        expect(post).toHaveProperty('isPublished')
      }
    })

    it('should sort posts by date descending by default', async () => {
      const posts = await getAllPosts()
      
      if (posts.length > 1) {
        for (let i = 0; i < posts.length - 1; i++) {
          const date1 = new Date(posts[i].frontmatter.date).getTime()
          const date2 = new Date(posts[i + 1].frontmatter.date).getTime()
          expect(date1).toBeGreaterThanOrEqual(date2)
        }
      }
    })

    it('should sort posts by title ascending when specified', async () => {
      const posts = await getAllPosts({ sortBy: 'title', sortOrder: 'asc' })
      
      if (posts.length > 1) {
        for (let i = 0; i < posts.length - 1; i++) {
          expect(posts[i].frontmatter.title.localeCompare(posts[i + 1].frontmatter.title)).toBeLessThanOrEqual(0)
        }
      }
    })

    it('should respect limit option', async () => {
      const limit = 2
      const posts = await getAllPosts({ limit })
      expect(posts.length).toBeLessThanOrEqual(limit)
    })

    it('should respect offset option', async () => {
      const allPosts = await getAllPosts()
      const offset = 1
      const postsWithOffset = await getAllPosts({ offset })
      
      if (allPosts.length > offset) {
        expect(postsWithOffset[0].slug).toBe(allPosts[offset].slug)
      }
    })
  })

  describe('getPostBySlug', () => {
    it('should return a post when slug exists', async () => {
      const allPosts = await getAllPosts({ includeDrafts: true })
      
      if (allPosts.length > 0) {
        const slug = allPosts[0].slug
        const post = await getPostBySlug(slug)
        expect(post).not.toBeNull()
        expect(post?.slug).toBe(slug)
      }
    })

    it('should return null when slug does not exist', async () => {
      const post = await getPostBySlug('non-existent-slug-12345')
      expect(post).toBeNull()
    })
  })

  describe('getPostsByTag', () => {
    it('should return only posts with the specified tag', async () => {
      const allPosts = await getAllPosts()
      
      if (allPosts.length > 0 && allPosts[0].frontmatter.tags.length > 0) {
        const tag = allPosts[0].frontmatter.tags[0]
        const posts = await getPostsByTag(tag)
        
        posts.forEach((post) => {
          const hasTag = post.frontmatter.tags.some(
            (t) => t.toLowerCase() === tag.toLowerCase()
          )
          expect(hasTag).toBe(true)
        })
      }
    })

    it('should be case-insensitive', async () => {
      const allPosts = await getAllPosts()
      
      if (allPosts.length > 0 && allPosts[0].frontmatter.tags.length > 0) {
        const tag = allPosts[0].frontmatter.tags[0]
        const postsLower = await getPostsByTag(tag.toLowerCase())
        const postsUpper = await getPostsByTag(tag.toUpperCase())
        
        expect(postsLower.length).toBe(postsUpper.length)
      }
    })
  })

  describe('getPostsByCategory', () => {
    it('should return only posts with the specified category', async () => {
      const allPosts = await getAllPosts()
      
      if (allPosts.length > 0 && allPosts[0].frontmatter.categories.length > 0) {
        const category = allPosts[0].frontmatter.categories[0]
        const posts = await getPostsByCategory(category)
        
        posts.forEach((post) => {
          const hasCategory = post.frontmatter.categories.some(
            (c) => c.toLowerCase() === category.toLowerCase()
          )
          expect(hasCategory).toBe(true)
        })
      }
    })

    it('should be case-insensitive', async () => {
      const allPosts = await getAllPosts()
      
      if (allPosts.length > 0 && allPosts[0].frontmatter.categories.length > 0) {
        const category = allPosts[0].frontmatter.categories[0]
        const postsLower = await getPostsByCategory(category.toLowerCase())
        const postsUpper = await getPostsByCategory(category.toUpperCase())
        
        expect(postsLower.length).toBe(postsUpper.length)
      }
    })
  })

  describe('getAllTags', () => {
    it('should return an array of tags with counts', async () => {
      const tags = await getAllTags()
      expect(Array.isArray(tags)).toBe(true)
      
      tags.forEach((tag) => {
        expect(tag).toHaveProperty('name')
        expect(tag).toHaveProperty('count')
        expect(typeof tag.name).toBe('string')
        expect(typeof tag.count).toBe('number')
        expect(tag.count).toBeGreaterThan(0)
      })
    })

    it('should sort tags by count descending', async () => {
      const tags = await getAllTags()
      
      if (tags.length > 1) {
        for (let i = 0; i < tags.length - 1; i++) {
          expect(tags[i].count).toBeGreaterThanOrEqual(tags[i + 1].count)
        }
      }
    })

    it('should have accurate counts', async () => {
      const tags = await getAllTags()
      const allPosts = await getAllPosts()
      
      tags.forEach((tag) => {
        const postsWithTag = allPosts.filter((post) =>
          post.frontmatter.tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
        )
        expect(postsWithTag.length).toBe(tag.count)
      })
    })
  })

  describe('getAllCategories', () => {
    it('should return an array of categories with counts', async () => {
      const categories = await getAllCategories()
      expect(Array.isArray(categories)).toBe(true)
      
      categories.forEach((category) => {
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('count')
        expect(typeof category.name).toBe('string')
        expect(typeof category.count).toBe('number')
        expect(category.count).toBeGreaterThan(0)
      })
    })

    it('should sort categories by count descending', async () => {
      const categories = await getAllCategories()
      
      if (categories.length > 1) {
        for (let i = 0; i < categories.length - 1; i++) {
          expect(categories[i].count).toBeGreaterThanOrEqual(categories[i + 1].count)
        }
      }
    })

    it('should have accurate counts', async () => {
      const categories = await getAllCategories()
      const allPosts = await getAllPosts()
      
      categories.forEach((category) => {
        const postsWithCategory = allPosts.filter((post) =>
          post.frontmatter.categories.some((c) => c.toLowerCase() === category.name.toLowerCase())
        )
        expect(postsWithCategory.length).toBe(category.count)
      })
    })
  })

  describe('searchPosts', () => {
    it('should return empty array for empty query', async () => {
      const results = await searchPosts('')
      expect(results).toEqual([])
    })

    it('should find posts by title', async () => {
      const allPosts = await getAllPosts()
      
      if (allPosts.length > 0) {
        const searchTerm = allPosts[0].frontmatter.title.split(' ')[0]
        const results = await searchPosts(searchTerm)
        
        expect(results.length).toBeGreaterThan(0)
        const found = results.some((post) =>
          post.frontmatter.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        expect(found).toBe(true)
      }
    })

    it('should find posts by excerpt', async () => {
      const allPosts = await getAllPosts()
      
      if (allPosts.length > 0) {
        const searchTerm = allPosts[0].frontmatter.excerpt.split(' ')[0]
        const results = await searchPosts(searchTerm)
        
        expect(results.length).toBeGreaterThan(0)
      }
    })

    it('should find posts by tag', async () => {
      const allPosts = await getAllPosts()
      
      if (allPosts.length > 0 && allPosts[0].frontmatter.tags.length > 0) {
        const searchTerm = allPosts[0].frontmatter.tags[0]
        const results = await searchPosts(searchTerm)
        
        expect(results.length).toBeGreaterThan(0)
        const found = results.some((post) =>
          post.frontmatter.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
        expect(found).toBe(true)
      }
    })

    it('should be case-insensitive', async () => {
      const allPosts = await getAllPosts()
      
      if (allPosts.length > 0) {
        const searchTerm = allPosts[0].frontmatter.title.split(' ')[0]
        const resultsLower = await searchPosts(searchTerm.toLowerCase())
        const resultsUpper = await searchPosts(searchTerm.toUpperCase())
        
        expect(resultsLower.length).toBe(resultsUpper.length)
      }
    })
  })

  describe('Post structure', () => {
    it('should have valid URL format', async () => {
      const posts = await getAllPosts()
      
      posts.forEach((post) => {
        expect(post.url).toMatch(/^\/blog\/[a-z0-9-]+$/)
      })
    })

    it('should have reading time with positive values', async () => {
      const posts = await getAllPosts()
      
      posts.forEach((post) => {
        expect(post.readingTime.minutes).toBeGreaterThan(0)
        expect(post.readingTime.words).toBeGreaterThan(0)
        expect(post.readingTime.text).toContain('min')
      })
    })

    it('should have headings array', async () => {
      const posts = await getAllPosts()
      
      posts.forEach((post) => {
        expect(Array.isArray(post.headings)).toBe(true)
        
        post.headings.forEach((heading) => {
          expect(heading).toHaveProperty('level')
          expect(heading).toHaveProperty('text')
          expect(heading).toHaveProperty('slug')
          expect(heading.level).toBeGreaterThanOrEqual(1)
          expect(heading.level).toBeLessThanOrEqual(6)
        })
      })
    })
  })
})
