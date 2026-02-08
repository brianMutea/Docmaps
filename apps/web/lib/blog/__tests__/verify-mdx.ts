/**
 * Manual verification script for MDX processing
 * Run with: npx tsx apps/web/lib/blog/__tests__/verify-mdx.ts
 */

import { extractHeadings, calculateReadingTime, processMDX } from '../mdx'
import type { PostFrontmatter } from '../schema'

const mockFrontmatter: PostFrontmatter = {
  title: 'Test Post',
  date: '2024-01-15T10:00:00Z',
  author: {
    name: 'Test Author',
  },
  excerpt: 'Test excerpt',
  tags: ['test'],
  categories: ['testing'],
  seo: {},
  draft: false,
  showTOC: true,
}

async function runTests() {
  console.log('🧪 Testing MDX Processing Module\n')

  // Test 1: Extract headings
  console.log('Test 1: Extract headings from MDX content')
  const testContent = `
# Main Title
Some content here.

## Section One
More content.

### Subsection
Even more content.

## Section Two
Final content.
`
  const headings = extractHeadings(testContent)
  console.log('✅ Extracted headings:', headings.length)
  console.log('   Headings:', headings.map(h => `${h.level}: ${h.text} (${h.slug})`).join('\n   '))

  // Test 2: Calculate reading time
  console.log('\nTest 2: Calculate reading time')
  const readingTime = calculateReadingTime(testContent)
  console.log('✅ Reading time:', readingTime.text)
  console.log('   Words:', readingTime.words)
  console.log('   Minutes:', readingTime.minutes)

  // Test 3: Process MDX with plugins
  console.log('\nTest 3: Process MDX with remark/rehype plugins')
  try {
    const result = await processMDX({
      source: `
# Hello World

This is a **test** post with some *markdown*.

## Code Example

\`\`\`javascript
console.log('Hello, world!')
\`\`\`

## Features

- GitHub Flavored Markdown
- Syntax highlighting
- Automatic heading IDs
`,
      frontmatter: mockFrontmatter,
      filepath: 'test.mdx',
    })
    
    console.log('✅ MDX compiled successfully')
    console.log('   Headings extracted:', result.headings.length)
    console.log('   Reading time:', result.readingTime.text)
    console.log('   Content compiled:', !!result.content)
  } catch (error) {
    console.error('❌ MDX compilation failed:', error)
  }

  // Test 4: Handle special characters in headings
  console.log('\nTest 4: Handle special characters in headings')
  const specialHeadings = extractHeadings(`
## What's New in 2024?
### API & SDK Updates
#### C++ / C# Integration
`)
  console.log('✅ Special character handling:')
  specialHeadings.forEach(h => {
    console.log(`   ${h.text} → ${h.slug}`)
  })

  // Test 5: Error handling
  console.log('\nTest 5: Error handling for invalid MDX')
  try {
    await processMDX({
      source: '<Component that is not closed',
      frontmatter: mockFrontmatter,
      filepath: 'invalid.mdx',
    })
    console.log('❌ Should have thrown an error')
  } catch (error) {
    if (error instanceof Error && error.message.includes('invalid.mdx')) {
      console.log('✅ Error handling works correctly')
      console.log('   Error message includes filepath:', error.message.includes('invalid.mdx'))
    } else {
      console.error('❌ Unexpected error:', error)
    }
  }

  // Test 6: GFM features
  console.log('\nTest 6: GitHub Flavored Markdown features')
  try {
    const result = await processMDX({
      source: `
# GFM Test

~~strikethrough text~~

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |

- [ ] Task item
- [x] Completed task
`,
      frontmatter: mockFrontmatter,
    })
    console.log('✅ GFM features processed successfully')
  } catch (error) {
    console.error('❌ GFM processing failed:', error)
  }

  console.log('\n✨ All tests completed!')
}

runTests().catch(console.error)
