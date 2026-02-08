/**
 * Manual verification script for utility functions
 * Run with: npx tsx apps/web/lib/blog/__tests__/verify-utils.ts
 */

import { generateSlug, calculateReadingTime, generateExcerpt, formatDate } from '../utils';

console.log('=== Testing Blog Utility Functions ===\n');

// Test generateSlug
console.log('1. Testing generateSlug:');
console.log('  "Hello World!" →', generateSlug('Hello World!'));
console.log('  "TypeScript & React" →', generateSlug('TypeScript & React'));
console.log('  "  Multiple   Spaces  " →', generateSlug('  Multiple   Spaces  '));
console.log('  "Top 10 Tips" →', generateSlug('Top 10 Tips'));
console.log('  Expected: URL-safe slugs with hyphens\n');

// Test calculateReadingTime
console.log('2. Testing calculateReadingTime:');
const shortContent = 'Hello world this is a short piece of content.';
const longContent = 'word '.repeat(500);
console.log('  Short content (9 words):', calculateReadingTime(shortContent));
console.log('  Long content (500 words):', calculateReadingTime(longContent));
console.log('  Expected: Reading time increases with word count\n');

// Test generateExcerpt
console.log('3. Testing generateExcerpt:');
const content = 'This is a long piece of content that needs to be truncated at a word boundary to ensure readability.';
console.log('  Original:', content);
console.log('  Excerpt (50 chars):', generateExcerpt(content, 50));
console.log('  Excerpt (30 chars):', generateExcerpt(content, 30));
console.log('  Expected: Truncated at word boundary with ellipsis\n');

// Test generateExcerpt with markdown
console.log('4. Testing generateExcerpt with markdown:');
const markdown = '# Heading with **bold** and *italic* text';
console.log('  Original:', markdown);
console.log('  Excerpt:', generateExcerpt(markdown, 50));
console.log('  Expected: Markdown syntax removed\n');

// Test formatDate
console.log('5. Testing formatDate:');
console.log('  "2024-01-15T00:00:00Z" →', formatDate('2024-01-15T00:00:00Z'));
console.log('  "2024-06-01T00:00:00Z" (MMM d, yyyy) →', formatDate('2024-06-01T00:00:00Z', 'MMM d, yyyy'));
console.log('  "2024-12-25T00:00:00Z" (yyyy-MM-dd) →', formatDate('2024-12-25T00:00:00Z', 'yyyy-MM-dd'));
console.log('  Expected: Formatted dates in various formats\n');

console.log('=== All tests completed ===');
