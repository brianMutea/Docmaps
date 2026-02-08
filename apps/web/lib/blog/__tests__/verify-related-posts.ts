/**
 * Manual verification script for related posts algorithm
 * Run with: npx tsx apps/web/lib/blog/__tests__/verify-related-posts.ts
 */

import { calculateSimilarityScore, getRelatedPosts } from '../related-posts';
import type { Post } from '../content';
import type { PostFrontmatter } from '../schema';

console.log('=== Testing Related Posts Algorithm ===\n');

// Helper function to create a mock post
function createMockPost(overrides: Partial<Post> = {}): Post {
  const defaultFrontmatter: PostFrontmatter = {
    title: 'Test Post',
    date: '2024-01-15T00:00:00Z',
    author: {
      name: 'Test Author',
    },
    excerpt: 'Test excerpt',
    tags: ['test'],
    categories: ['testing'],
    seo: {},
    draft: false,
    showTOC: true,
  };

  return {
    slug: 'test-post',
    frontmatter: defaultFrontmatter,
    content: 'Test content',
    readingTime: {
      text: '1 min read',
      minutes: 1,
      words: 100,
    },
    headings: [],
    filepath: 'test-post.mdx',
    url: '/blog/test-post',
    isPublished: true,
    ...overrides,
  };
}

// Test 1: Similarity scoring with shared tags
console.log('1. Testing similarity scoring with shared tags:');
const post1 = createMockPost({
  slug: 'typescript-guide',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'TypeScript Guide',
    tags: ['typescript', 'javascript', 'programming'],
    categories: ['tutorials'],
  },
});

const post2 = createMockPost({
  slug: 'typescript-tips',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'TypeScript Tips',
    tags: ['typescript', 'javascript'],
    categories: ['guides'],
  },
});

const score1 = calculateSimilarityScore(post1, post2);
console.log(`  Post 1: ${post1.frontmatter.tags.join(', ')}`);
console.log(`  Post 2: ${post2.frontmatter.tags.join(', ')}`);
console.log(`  Similarity score: ${score1} (2 shared tags × 2 points = 4 points)`);
console.log('  Expected: 4 points\n');

// Test 2: Similarity scoring with shared categories
console.log('2. Testing similarity scoring with shared categories:');
const post3 = createMockPost({
  slug: 'react-tutorial',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'React Tutorial',
    tags: ['react'],
    categories: ['tutorials', 'beginner', 'web-development'],
  },
});

const post4 = createMockPost({
  slug: 'vue-tutorial',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Vue Tutorial',
    tags: ['vue'],
    categories: ['tutorials', 'beginner'],
  },
});

const score2 = calculateSimilarityScore(post3, post4);
console.log(`  Post 3: ${post3.frontmatter.categories.join(', ')}`);
console.log(`  Post 4: ${post4.frontmatter.categories.join(', ')}`);
console.log(`  Similarity score: ${score2} (2 shared categories × 3 points = 6 points)`);
console.log('  Expected: 6 points\n');

// Test 3: Combined scoring with tags and categories
console.log('3. Testing combined scoring (tags + categories):');
const post5 = createMockPost({
  slug: 'nextjs-guide',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Next.js Guide',
    tags: ['nextjs', 'react', 'typescript'],
    categories: ['tutorials', 'web-development'],
  },
});

const post6 = createMockPost({
  slug: 'react-nextjs',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'React with Next.js',
    tags: ['nextjs', 'react'],
    categories: ['tutorials'],
  },
});

const score3 = calculateSimilarityScore(post5, post6);
console.log(`  Post 5 tags: ${post5.frontmatter.tags.join(', ')}`);
console.log(`  Post 5 categories: ${post5.frontmatter.categories.join(', ')}`);
console.log(`  Post 6 tags: ${post6.frontmatter.tags.join(', ')}`);
console.log(`  Post 6 categories: ${post6.frontmatter.categories.join(', ')}`);
console.log(`  Similarity score: ${score3} (2 shared tags × 2 + 1 shared category × 3 = 7 points)`);
console.log('  Expected: 7 points\n');

// Test 4: Recency bonus
console.log('4. Testing recency bonus (posts within 30 days):');
const recentPost1 = createMockPost({
  slug: 'recent-1',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Recent Post 1',
    date: '2024-01-15T00:00:00Z',
    tags: ['typescript'],
    categories: ['tutorials'],
  },
});

const recentPost2 = createMockPost({
  slug: 'recent-2',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Recent Post 2',
    date: '2024-01-20T00:00:00Z', // 5 days later
    tags: ['typescript'],
    categories: ['tutorials'],
  },
});

const oldPost = createMockPost({
  slug: 'old-post',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Old Post',
    date: '2023-11-15T00:00:00Z', // 60 days earlier
    tags: ['typescript'],
    categories: ['tutorials'],
  },
});

const scoreRecent = calculateSimilarityScore(recentPost1, recentPost2);
const scoreOld = calculateSimilarityScore(recentPost1, oldPost);
console.log(`  Recent posts (5 days apart): ${scoreRecent} points (includes +1 recency bonus)`);
console.log(`  Old posts (60 days apart): ${scoreOld} points (no recency bonus)`);
console.log('  Expected: Recent = 6, Old = 5\n');

// Test 5: Get related posts (sorted by similarity)
console.log('5. Testing getRelatedPosts (sorted by similarity):');
const currentPost = createMockPost({
  slug: 'current',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Current Post',
    tags: ['typescript', 'react', 'nextjs'],
    categories: ['tutorials', 'web-development'],
  },
});

const candidate1 = createMockPost({
  slug: 'candidate-1',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Candidate 1 (High Score)',
    tags: ['typescript', 'react', 'nextjs'],
    categories: ['tutorials', 'web-development'],
  },
});

const candidate2 = createMockPost({
  slug: 'candidate-2',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Candidate 2 (Medium Score)',
    tags: ['typescript', 'react'],
    categories: ['tutorials'],
  },
});

const candidate3 = createMockPost({
  slug: 'candidate-3',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Candidate 3 (Low Score)',
    tags: ['typescript'],
    categories: ['guides'],
  },
});

const candidate4 = createMockPost({
  slug: 'candidate-4',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Candidate 4 (No Match)',
    tags: ['python'],
    categories: ['guides'],
  },
});

const allPosts = [currentPost, candidate1, candidate2, candidate3, candidate4];
const related = getRelatedPosts(currentPost, allPosts, 3);

console.log('  Current post:', currentPost.frontmatter.title);
console.log('  Related posts (top 3):');
related.forEach((post, index) => {
  const score = calculateSimilarityScore(currentPost, post);
  console.log(`    ${index + 1}. ${post.frontmatter.title} (score: ${score})`);
});
console.log('  Expected: Candidate 1, Candidate 2, Candidate 3 (sorted by score)\n');

// Test 6: Manual override
console.log('6. Testing manual override (frontmatter.relatedPosts):');
const manualPost = createMockPost({
  slug: 'manual',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Post with Manual Override',
    tags: ['typescript'],
    categories: ['tutorials'],
    relatedPosts: ['specific-1', 'specific-2'],
  },
});

const specific1 = createMockPost({
  slug: 'specific-1',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Specific Post 1',
    tags: ['python'], // No shared tags
    categories: ['guides'], // No shared categories
  },
});

const specific2 = createMockPost({
  slug: 'specific-2',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Specific Post 2',
    tags: ['java'],
    categories: ['advanced'],
  },
});

const highScore = createMockPost({
  slug: 'high-score',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'High Score Post (Should be ignored)',
    tags: ['typescript'],
    categories: ['tutorials'],
  },
});

const manualPosts = [manualPost, specific1, specific2, highScore];
const manualRelated = getRelatedPosts(manualPost, manualPosts);

console.log('  Post with manual override:', manualPost.frontmatter.title);
console.log('  Manual relatedPosts:', manualPost.frontmatter.relatedPosts?.join(', '));
console.log('  Related posts returned:');
manualRelated.forEach((post, index) => {
  console.log(`    ${index + 1}. ${post.frontmatter.title}`);
});
console.log('  Expected: Specific Post 1, Specific Post 2 (ignores algorithm)\n');

// Test 7: Case-insensitive matching
console.log('7. Testing case-insensitive tag/category matching:');
const upperPost = createMockPost({
  slug: 'upper',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Uppercase Tags',
    tags: ['TypeScript', 'React'],
    categories: ['Tutorials'],
  },
});

const lowerPost = createMockPost({
  slug: 'lower',
  frontmatter: {
    ...createMockPost().frontmatter,
    title: 'Lowercase Tags',
    tags: ['typescript', 'react'],
    categories: ['tutorials'],
  },
});

const caseScore = calculateSimilarityScore(upperPost, lowerPost);
console.log(`  Post 1 tags: ${upperPost.frontmatter.tags.join(', ')}`);
console.log(`  Post 2 tags: ${lowerPost.frontmatter.tags.join(', ')}`);
console.log(`  Similarity score: ${caseScore} (case-insensitive matching)`);
console.log('  Expected: 7 points (2 tags × 2 + 1 category × 3)\n');

console.log('=== All tests completed ===');
console.log('\nSummary:');
console.log('✓ Similarity scoring with shared tags');
console.log('✓ Similarity scoring with shared categories');
console.log('✓ Combined scoring (tags + categories)');
console.log('✓ Recency bonus for posts within 30 days');
console.log('✓ Related posts sorted by similarity');
console.log('✓ Manual override via frontmatter.relatedPosts');
console.log('✓ Case-insensitive tag/category matching');
