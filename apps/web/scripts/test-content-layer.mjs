/**
 * Content Layer Test Script
 * 
 * Simple test to verify the content layer works
 * Run with: node apps/web/scripts/test-content-layer.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative, basename, extname } from 'path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const CONTENT_DIR = join(__dirname, '..', 'content', 'blog')

console.log('🔍 Testing Content Layer...\n')
console.log(`📁 Content directory: ${CONTENT_DIR}\n`)

// Find all MDX files
function findMDXFiles(dir, fileList = []) {
  const files = readdirSync(dir)

  files.forEach((file) => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      findMDXFiles(filePath, fileList)
    } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
      fileList.push(filePath)
    }
  })

  return fileList
}

try {
  const mdxFiles = findMDXFiles(CONTENT_DIR)
  console.log(`✅ Found ${mdxFiles.length} MDX files\n`)

  mdxFiles.forEach((filepath, index) => {
    const relativePath = relative(CONTENT_DIR, filepath)
    console.log(`${index + 1}. ${relativePath}`)

    try {
      const fileContent = readFileSync(filepath, 'utf-8')
      const { data, content } = matter(fileContent)

      console.log(`   📄 Title: ${data.title || 'N/A'}`)
      console.log(`   📅 Date: ${data.date || 'N/A'}`)
      console.log(`   🏷️  Tags: ${data.tags?.join(', ') || 'N/A'}`)
      console.log(`   📂 Categories: ${data.categories?.join(', ') || 'N/A'}`)
      console.log(`   📝 Content length: ${content.length} characters`)
      
      // Count headings
      const headingMatches = content.match(/^#{1,6}\s+.+$/gm)
      console.log(`   📑 Headings: ${headingMatches?.length || 0}`)
      
      console.log()
    } catch (error) {
      console.log(`   ❌ Error parsing: ${error.message}\n`)
    }
  })

  console.log('✨ Content layer test complete!\n')
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
