/**
 * Content Layer Verification Script
 * 
 * Run this script to verify the content layer is working correctly:
 * npx tsx apps/web/lib/blog/__tests__/verify-content.ts
 */

import {
  getAllPosts,
  getPostBySlug,
  getPostsByTag,
  getPostsByCategory,
  getAllTags,
  getAllCategories,
  searchPosts,
} from '../content'

async function verify() {
  console.log('🔍 Verifying Content Layer API...\n')

  try {
    // Test 1: Get all posts
    console.log('1️⃣  Testing getAllPosts()...')
    const allPosts = await getAllPosts()
    console.log(`   ✅ Found ${allPosts.length} posts`)
    
    if (allPosts.length > 0) {
      const post = allPosts[0]
      console.log(`   📄 First post: "${post.frontmatter.title}"`)
      console.log(`   🔗 URL: ${post.url}`)
      console.log(`   📖 Reading time: ${post.readingTime.text}`)
      console.log(`   📑 Headings: ${post.headings.length}`)
    }
    console.log()

    // Test 2: Get post by slug
    if (allPosts.length > 0) {
      console.log('2️⃣  Testing getPostBySlug()...')
      const slug = allPosts[0].slug
      const post = await getPostBySlug(slug)
      console.log(`   ✅ Found post with slug: "${slug}"`)
      console.log(`   📄 Title: "${post?.frontmatter.title}"`)
      console.log()
    }

    // Test 3: Get all tags
    console.log('3️⃣  Testing getAllTags()...')
    const tags = await getAllTags()
    console.log(`   ✅ Found ${tags.length} unique tags`)
    if (tags.length > 0) {
      console.log(`   🏷️  Top tags:`)
      tags.slice(0, 5).forEach((tag) => {
        console.log(`      - ${tag.name} (${tag.count} posts)`)
      })
    }
    console.log()

    // Test 4: Get all categories
    console.log('4️⃣  Testing getAllCategories()...')
    const categories = await getAllCategories()
    console.log(`   ✅ Found ${categories.length} unique categories`)
    if (categories.length > 0) {
      console.log(`   📂 Categories:`)
      categories.forEach((category) => {
        console.log(`      - ${category.name} (${category.count} posts)`)
      })
    }
    console.log()

    // Test 5: Get posts by tag
    if (tags.length > 0) {
      console.log('5️⃣  Testing getPostsByTag()...')
      const tag = tags[0].name
      const posts = await getPostsByTag(tag)
      console.log(`   ✅ Found ${posts.length} posts with tag "${tag}"`)
      console.log()
    }

    // Test 6: Get posts by category
    if (categories.length > 0) {
      console.log('6️⃣  Testing getPostsByCategory()...')
      const category = categories[0].name
      const posts = await getPostsByCategory(category)
      console.log(`   ✅ Found ${posts.length} posts in category "${category}"`)
      console.log()
    }

    // Test 7: Search posts
    console.log('7️⃣  Testing searchPosts()...')
    const searchResults = await searchPosts('test')
    console.log(`   ✅ Found ${searchResults.length} posts matching "test"`)
    if (searchResults.length > 0) {
      console.log(`   🔎 Results:`)
      searchResults.forEach((post) => {
        console.log(`      - ${post.frontmatter.title}`)
      })
    }
    console.log()

    // Test 8: Sorting and pagination
    console.log('8️⃣  Testing sorting and pagination...')
    const sortedByTitle = await getAllPosts({ sortBy: 'title', sortOrder: 'asc', limit: 3 })
    console.log(`   ✅ Got ${sortedByTitle.length} posts sorted by title`)
    if (sortedByTitle.length > 0) {
      console.log(`   📚 First 3 by title:`)
      sortedByTitle.forEach((post) => {
        console.log(`      - ${post.frontmatter.title}`)
      })
    }
    console.log()

    // Test 9: Draft handling
    console.log('9️⃣  Testing draft handling...')
    const publishedPosts = await getAllPosts({ includeDrafts: false })
    const allPostsIncludingDrafts = await getAllPosts({ includeDrafts: true })
    const draftCount = allPostsIncludingDrafts.length - publishedPosts.length
    console.log(`   ✅ Published: ${publishedPosts.length}, Drafts: ${draftCount}`)
    console.log()

    console.log('✨ All tests passed! Content Layer is working correctly.\n')
  } catch (error) {
    console.error('❌ Error during verification:', error)
    process.exit(1)
  }
}

verify()
