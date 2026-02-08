/**
 * Unit tests for related posts algorithm
 * 
 * Tests specific examples and edge cases for:
 * - Similarity score calculation
 * - Related posts retrieval
 * - Manual override functionality
 * - Recency bonus
 */

import { calculateSimilarityScore, getRelatedPosts } from '../related-posts';
import type { Post } from '../content';
import type { PostFrontmatter } from '../schema';

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

describe('calculateSimilarityScore', () => {
  it('returns 0 for posts with no shared tags or categories', () => {
    const post1 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const post2 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['python'],
        categories: ['guides'],
      },
    });

    expect(calculateSimilarityScore(post1, post2)).toBe(0);
  });

  it('scores 2 points per shared tag', () => {
    const post1 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript', 'react'],
        categories: ['tutorials'],
      },
    });

    const post2 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript', 'react'],
        categories: ['guides'],
      },
    });

    // 2 shared tags * 2 points = 4 points
    expect(calculateSimilarityScore(post1, post2)).toBe(4);
  });

  it('scores 3 points per shared category', () => {
    const post1 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials', 'beginner'],
      },
    });

    const post2 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['python'],
        categories: ['tutorials', 'beginner'],
      },
    });

    // 2 shared categories * 3 points = 6 points
    expect(calculateSimilarityScore(post1, post2)).toBe(6);
  });

  it('combines tag and category scores', () => {
    const post1 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript', 'react'],
        categories: ['tutorials'],
      },
    });

    const post2 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    // 1 shared tag * 2 points + 1 shared category * 3 points = 5 points
    expect(calculateSimilarityScore(post1, post2)).toBe(5);
  });

  it('is case-insensitive for tags', () => {
    const post1 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['TypeScript', 'React'],
        categories: ['tutorials'],
      },
    });

    const post2 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript', 'REACT'],
        categories: ['guides'],
      },
    });

    // 2 shared tags (case-insensitive) * 2 points = 4 points
    expect(calculateSimilarityScore(post1, post2)).toBe(4);
  });

  it('is case-insensitive for categories', () => {
    const post1 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['test'],
        categories: ['Tutorials', 'Beginner'],
      },
    });

    const post2 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['test'],
        categories: ['tutorials', 'BEGINNER'],
      },
    });

    // 2 shared categories (case-insensitive) * 3 points = 6 points
    expect(calculateSimilarityScore(post1, post2)).toBe(6);
  });

  it('adds recency bonus for posts within 30 days', () => {
    const post1 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        date: '2024-01-15T00:00:00Z',
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const post2 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        date: '2024-01-20T00:00:00Z', // 5 days later
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    // 1 shared tag * 2 + 1 shared category * 3 + recency bonus 1 = 6 points
    expect(calculateSimilarityScore(post1, post2)).toBe(6);
  });

  it('does not add recency bonus for posts more than 30 days apart', () => {
    const post1 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        date: '2024-01-15T00:00:00Z',
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const post2 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        date: '2024-03-15T00:00:00Z', // 60 days later
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    // 1 shared tag * 2 + 1 shared category * 3 = 5 points (no recency bonus)
    expect(calculateSimilarityScore(post1, post2)).toBe(5);
  });

  it('adds recency bonus at exactly 30 days', () => {
    const post1 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        date: '2024-01-15T00:00:00Z',
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const post2 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        date: '2024-02-14T00:00:00Z', // Exactly 30 days later
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    // Should include recency bonus at exactly 30 days
    expect(calculateSimilarityScore(post1, post2)).toBe(6);
  });

  it('handles posts with multiple tags and categories', () => {
    const post1 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript', 'react', 'nextjs', 'testing'],
        categories: ['tutorials', 'advanced', 'web-development'],
      },
    });

    const post2 = createMockPost({
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript', 'react', 'testing'],
        categories: ['tutorials', 'web-development'],
      },
    });

    // 3 shared tags * 2 + 2 shared categories * 3 = 12 points
    expect(calculateSimilarityScore(post1, post2)).toBe(12);
  });
});

describe('getRelatedPosts', () => {
  it('returns empty array when no similar posts exist', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const allPosts = [
      currentPost,
      createMockPost({
        slug: 'other',
        frontmatter: {
          ...createMockPost().frontmatter,
          tags: ['python'],
          categories: ['guides'],
        },
      }),
    ];

    const related = getRelatedPosts(currentPost, allPosts);
    expect(related).toEqual([]);
  });

  it('excludes the current post from results', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const allPosts = [currentPost];

    const related = getRelatedPosts(currentPost, allPosts);
    expect(related).toEqual([]);
  });

  it('returns posts sorted by similarity score', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript', 'react'],
        categories: ['tutorials'],
      },
    });

    const post1 = createMockPost({
      slug: 'post1',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'], // 1 shared tag = 2 points
        categories: ['guides'],
      },
    });

    const post2 = createMockPost({
      slug: 'post2',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript', 'react'], // 2 shared tags = 4 points
        categories: ['tutorials'], // 1 shared category = 3 points
      },
    });

    const post3 = createMockPost({
      slug: 'post3',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript', 'react'], // 2 shared tags = 4 points
        categories: ['guides'],
      },
    });

    const allPosts = [currentPost, post1, post2, post3];

    const related = getRelatedPosts(currentPost, allPosts);
    
    // post2 should be first (7 points), then post3 (4 points), then post1 (2 points)
    expect(related).toHaveLength(3);
    expect(related[0].slug).toBe('post2');
    expect(related[1].slug).toBe('post3');
    expect(related[2].slug).toBe('post1');
  });

  it('respects the limit parameter', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const allPosts = [
      currentPost,
      createMockPost({
        slug: 'post1',
        frontmatter: {
          ...createMockPost().frontmatter,
          tags: ['typescript'],
          categories: ['tutorials'],
        },
      }),
      createMockPost({
        slug: 'post2',
        frontmatter: {
          ...createMockPost().frontmatter,
          tags: ['typescript'],
          categories: ['tutorials'],
        },
      }),
      createMockPost({
        slug: 'post3',
        frontmatter: {
          ...createMockPost().frontmatter,
          tags: ['typescript'],
          categories: ['tutorials'],
        },
      }),
    ];

    const related = getRelatedPosts(currentPost, allPosts, 2);
    expect(related).toHaveLength(2);
  });

  it('uses default limit of 3', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const allPosts = [
      currentPost,
      ...Array.from({ length: 5 }, (_, i) =>
        createMockPost({
          slug: `post${i}`,
          frontmatter: {
            ...createMockPost().frontmatter,
            tags: ['typescript'],
            categories: ['tutorials'],
          },
        })
      ),
    ];

    const related = getRelatedPosts(currentPost, allPosts);
    expect(related).toHaveLength(3);
  });

  it('excludes unpublished posts', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const publishedPost = createMockPost({
      slug: 'published',
      isPublished: true,
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const draftPost = createMockPost({
      slug: 'draft',
      isPublished: false,
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const allPosts = [currentPost, publishedPost, draftPost];

    const related = getRelatedPosts(currentPost, allPosts);
    expect(related).toHaveLength(1);
    expect(related[0].slug).toBe('published');
  });

  it('uses manual override from frontmatter.relatedPosts', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
        relatedPosts: ['manual1', 'manual2'],
      },
    });

    const manual1 = createMockPost({
      slug: 'manual1',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['python'], // No shared tags
        categories: ['guides'], // No shared categories
      },
    });

    const manual2 = createMockPost({
      slug: 'manual2',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['java'],
        categories: ['advanced'],
      },
    });

    const highScore = createMockPost({
      slug: 'highscore',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const allPosts = [currentPost, manual1, manual2, highScore];

    const related = getRelatedPosts(currentPost, allPosts);
    
    // Should return manual override posts, not the high-scoring post
    expect(related).toHaveLength(2);
    expect(related[0].slug).toBe('manual1');
    expect(related[1].slug).toBe('manual2');
  });

  it('filters out non-existent slugs from manual override', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
        relatedPosts: ['exists', 'does-not-exist', 'also-exists'],
      },
    });

    const exists = createMockPost({
      slug: 'exists',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['python'],
        categories: ['guides'],
      },
    });

    const alsoExists = createMockPost({
      slug: 'also-exists',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['java'],
        categories: ['advanced'],
      },
    });

    const allPosts = [currentPost, exists, alsoExists];

    const related = getRelatedPosts(currentPost, allPosts);
    
    // Should only return posts that exist
    expect(related).toHaveLength(2);
    expect(related[0].slug).toBe('exists');
    expect(related[1].slug).toBe('also-exists');
  });

  it('respects limit with manual override', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
        relatedPosts: ['post1', 'post2', 'post3', 'post4'],
      },
    });

    const allPosts = [
      currentPost,
      ...['post1', 'post2', 'post3', 'post4'].map((slug) =>
        createMockPost({
          slug,
          frontmatter: {
            ...createMockPost().frontmatter,
            tags: ['test'],
            categories: ['test'],
          },
        })
      ),
    ];

    const related = getRelatedPosts(currentPost, allPosts, 2);
    expect(related).toHaveLength(2);
  });

  it('excludes unpublished posts from manual override', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
        relatedPosts: ['published', 'draft'],
      },
    });

    const published = createMockPost({
      slug: 'published',
      isPublished: true,
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['test'],
        categories: ['test'],
      },
    });

    const draft = createMockPost({
      slug: 'draft',
      isPublished: false,
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['test'],
        categories: ['test'],
      },
    });

    const allPosts = [currentPost, published, draft];

    const related = getRelatedPosts(currentPost, allPosts);
    
    // Should only return published posts
    expect(related).toHaveLength(1);
    expect(related[0].slug).toBe('published');
  });

  it('only returns posts with similarity score > 0', () => {
    const currentPost = createMockPost({
      slug: 'current',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['tutorials'],
      },
    });

    const similar = createMockPost({
      slug: 'similar',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['typescript'],
        categories: ['guides'],
      },
    });

    const notSimilar = createMockPost({
      slug: 'not-similar',
      frontmatter: {
        ...createMockPost().frontmatter,
        tags: ['python'],
        categories: ['guides'],
      },
    });

    const allPosts = [currentPost, similar, notSimilar];

    const related = getRelatedPosts(currentPost, allPosts);
    
    // Should only return posts with score > 0
    expect(related).toHaveLength(1);
    expect(related[0].slug).toBe('similar');
  });
});
