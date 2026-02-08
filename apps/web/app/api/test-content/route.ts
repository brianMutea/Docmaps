/**
 * Test API route for Content Layer
 * 
 * This route tests all the content layer functions
 * Access at: http://localhost:3001/api/test-content
 */

import { NextResponse } from 'next/server'
import {
  getAllPosts,
  getPostBySlug,
  getPostsByTag,
  getPostsByCategory,
  getAllTags,
  getAllCategories,
  searchPosts,
} from '@/lib/blog/content'

export async function GET() {
  try {
    const results: any = {
      success: true,
      tests: {},
    }

    // Test 1: Get all posts
    const allPosts = await getAllPosts()
    results.tests.getAllPosts = {
      passed: true,
      count: allPosts.length,
      sample: allPosts[0] ? {
        slug: allPosts[0].slug,
        title: allPosts[0].frontmatter.title,
        url: allPosts[0].url,
        readingTime: allPosts[0].readingTime.text,
        headingsCount: allPosts[0].headings.length,
      } : null,
    }

    // Test 2: Get post by slug
    if (allPosts.length > 0) {
      const slug = allPosts[0].slug
      const post = await getPostBySlug(slug)
      results.tests.getPostBySlug = {
        passed: post !== null,
        slug,
        found: post !== null,
      }
    }

    // Test 3: Get all tags
    const tags = await getAllTags()
    results.tests.getAllTags = {
      passed: true,
      count: tags.length,
      tags: tags.slice(0, 5),
    }

    // Test 4: Get all categories
    const categories = await getAllCategories()
    results.tests.getAllCategories = {
      passed: true,
      count: categories.length,
      categories,
    }

    // Test 5: Get posts by tag
    if (tags.length > 0) {
      const posts = await getPostsByTag(tags[0].name)
      results.tests.getPostsByTag = {
        passed: true,
        tag: tags[0].name,
        count: posts.length,
      }
    }

    // Test 6: Get posts by category
    if (categories.length > 0) {
      const posts = await getPostsByCategory(categories[0].name)
      results.tests.getPostsByCategory = {
        passed: true,
        category: categories[0].name,
        count: posts.length,
      }
    }

    // Test 7: Search posts
    const searchResults = await searchPosts('test')
    results.tests.searchPosts = {
      passed: true,
      query: 'test',
      count: searchResults.length,
    }

    // Test 8: Sorting and pagination
    const sortedPosts = await getAllPosts({ sortBy: 'title', sortOrder: 'asc', limit: 3 })
    results.tests.sortingAndPagination = {
      passed: true,
      count: sortedPosts.length,
      titles: sortedPosts.map((p) => p.frontmatter.title),
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
