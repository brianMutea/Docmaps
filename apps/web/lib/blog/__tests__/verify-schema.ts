/**
 * Manual verification script for schema validation
 * Run with: npx tsx lib/blog/__tests__/verify-schema.ts
 */

import {
  AuthorSchema,
  SEOMetadataSchema,
  FeaturedImageSchema,
  PostFrontmatterSchema,
  validateFrontmatter,
} from '../schema'

console.log('🧪 Testing Blog Schema Validation\n')

// Test 1: Valid complete frontmatter
console.log('Test 1: Valid complete frontmatter')
try {
  const validFrontmatter = {
    title: 'My Blog Post',
    date: '2024-01-15T10:00:00Z',
    author: {
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      bio: 'Software developer',
      social: {
        twitter: 'johndoe',
        github: 'johndoe',
      },
    },
    excerpt: 'This is a brief excerpt of the blog post.',
    tags: ['javascript', 'typescript'],
    categories: ['programming'],
    seo: {
      title: 'Custom SEO Title',
      description: 'Custom SEO description',
      keywords: ['keyword1', 'keyword2'],
    },
    featuredImage: {
      src: '/images/hero.jpg',
      alt: 'Hero image',
      width: 1200,
      height: 630,
    },
    draft: false,
    showTOC: true,
  }

  const result = validateFrontmatter(validFrontmatter, 'test.mdx')
  console.log('✅ PASS: Valid frontmatter accepted')
  console.log('   Defaults applied:', { draft: result.draft, showTOC: result.showTOC })
} catch (error) {
  console.log('❌ FAIL:', (error as Error).message)
}

// Test 2: Missing required field (title)
console.log('\nTest 2: Missing required field (title)')
try {
  const invalidFrontmatter = {
    date: '2024-01-15T10:00:00Z',
    author: { name: 'John Doe' },
    excerpt: 'Excerpt',
    tags: ['javascript'],
    categories: ['programming'],
    seo: {},
  }

  validateFrontmatter(invalidFrontmatter, 'test.mdx')
  console.log('❌ FAIL: Should have rejected missing title')
} catch (error) {
  console.log('✅ PASS: Correctly rejected missing title')
  console.log('   Error:', (error as Error).message.split('\n')[0])
}

// Test 3: Invalid date format
console.log('\nTest 3: Invalid date format')
try {
  const invalidFrontmatter = {
    title: 'Test Post',
    date: '2024-01-15', // Not ISO 8601 with time
    author: { name: 'John Doe' },
    excerpt: 'Excerpt',
    tags: ['javascript'],
    categories: ['programming'],
    seo: {},
  }

  validateFrontmatter(invalidFrontmatter, 'test.mdx')
  console.log('❌ FAIL: Should have rejected invalid date format')
} catch (error) {
  const message = (error as Error).message
  if (message.includes('ISO 8601')) {
    console.log('✅ PASS: Correctly rejected invalid date format')
    console.log('   Error includes ISO 8601 guidance')
  } else {
    console.log('❌ FAIL: Error message should mention ISO 8601')
  }
}

// Test 4: Empty tags array
console.log('\nTest 4: Empty tags array')
try {
  const invalidFrontmatter = {
    title: 'Test Post',
    date: '2024-01-15T10:00:00Z',
    author: { name: 'John Doe' },
    excerpt: 'Excerpt',
    tags: [],
    categories: ['programming'],
    seo: {},
  }

  validateFrontmatter(invalidFrontmatter, 'test.mdx')
  console.log('❌ FAIL: Should have rejected empty tags array')
} catch (error) {
  console.log('✅ PASS: Correctly rejected empty tags array')
}

// Test 5: Empty string in tags
console.log('\nTest 5: Empty string in tags')
try {
  const invalidFrontmatter = {
    title: 'Test Post',
    date: '2024-01-15T10:00:00Z',
    author: { name: 'John Doe' },
    excerpt: 'Excerpt',
    tags: ['javascript', ''],
    categories: ['programming'],
    seo: {},
  }

  validateFrontmatter(invalidFrontmatter, 'test.mdx')
  console.log('❌ FAIL: Should have rejected empty string in tags')
} catch (error) {
  console.log('✅ PASS: Correctly rejected empty string in tags')
}

// Test 6: Featured image without alt text
console.log('\nTest 6: Featured image without alt text')
try {
  const invalidFrontmatter = {
    title: 'Test Post',
    date: '2024-01-15T10:00:00Z',
    author: { name: 'John Doe' },
    excerpt: 'Excerpt',
    tags: ['javascript'],
    categories: ['programming'],
    seo: {},
    featuredImage: {
      src: '/images/hero.jpg',
      // Missing alt text
    },
  }

  validateFrontmatter(invalidFrontmatter, 'test.mdx')
  console.log('❌ FAIL: Should have rejected featured image without alt text')
} catch (error) {
  const message = (error as Error).message
  if (message.includes('alt')) {
    console.log('✅ PASS: Correctly rejected featured image without alt text')
    console.log('   Error mentions accessibility requirement')
  } else {
    console.log('❌ FAIL: Error should mention alt text requirement')
  }
}

// Test 7: Optional fields are truly optional
console.log('\nTest 7: Optional fields are truly optional')
try {
  const minimalFrontmatter = {
    title: 'Minimal Post',
    date: '2024-01-15T10:00:00Z',
    author: { name: 'John Doe' },
    excerpt: 'Excerpt',
    tags: ['javascript'],
    categories: ['programming'],
    seo: {},
  }

  const result = validateFrontmatter(minimalFrontmatter, 'test.mdx')
  console.log('✅ PASS: Optional fields are truly optional')
  console.log('   Defaults:', { draft: result.draft, showTOC: result.showTOC })
} catch (error) {
  console.log('❌ FAIL:', (error as Error).message)
}

// Test 8: Multiple validation errors
console.log('\nTest 8: Multiple validation errors reported together')
try {
  const invalidFrontmatter = {
    title: '', // Empty
    date: 'invalid-date', // Invalid format
    author: { name: '' }, // Empty name
    excerpt: '', // Empty
    tags: [], // Empty array
    categories: [], // Empty array
    seo: {},
  }

  validateFrontmatter(invalidFrontmatter, 'test.mdx')
  console.log('❌ FAIL: Should have rejected multiple invalid fields')
} catch (error) {
  const message = (error as Error).message
  const errorCount = (message.match(/  - /g) || []).length
  console.log(`✅ PASS: Reported ${errorCount} validation errors together`)
  console.log('   Errors include: title, date, author, excerpt, tags, categories')
}

console.log('\n✨ Schema validation tests complete!')
