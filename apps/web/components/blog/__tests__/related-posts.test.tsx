import { render, screen } from '@testing-library/react';
import { RelatedPosts } from '../related-posts';
import type { Post } from '@/lib/blog/content';

// Mock the PostCard component
jest.mock('../post-card', () => ({
  PostCard: ({ post }: { post: Post }) => (
    <div data-testid={`post-card-${post.slug}`}>
      {post.frontmatter.title}
    </div>
  ),
}));

describe('RelatedPosts', () => {
  const mockPosts: Post[] = [
    {
      slug: 'test-post-1',
      frontmatter: {
        title: 'Test Post 1',
        date: '2024-01-01T00:00:00Z',
        author: {
          name: 'Test Author',
        },
        excerpt: 'Test excerpt 1',
        tags: ['test'],
        categories: ['testing'],
        seo: {},
        draft: false,
        featured: false,
        showTOC: true,
      },
      content: 'Test content 1',
      readingTime: {
        text: '1 min read',
        minutes: 1,
        words: 100,
      },
      headings: [],
      filepath: 'test-post-1.mdx',
      url: '/blog/test-post-1',
      isPublished: true,
    },
    {
      slug: 'test-post-2',
      frontmatter: {
        title: 'Test Post 2',
        date: '2024-01-02T00:00:00Z',
        author: {
          name: 'Test Author',
        },
        excerpt: 'Test excerpt 2',
        tags: ['test'],
        categories: ['testing'],
        seo: {},
        draft: false,
        featured: false,
        showTOC: true,
      },
      content: 'Test content 2',
      readingTime: {
        text: '2 min read',
        minutes: 2,
        words: 200,
      },
      headings: [],
      filepath: 'test-post-2.mdx',
      url: '/blog/test-post-2',
      isPublished: true,
    },
    {
      slug: 'test-post-3',
      frontmatter: {
        title: 'Test Post 3',
        date: '2024-01-03T00:00:00Z',
        author: {
          name: 'Test Author',
        },
        excerpt: 'Test excerpt 3',
        tags: ['test'],
        categories: ['testing'],
        seo: {},
        draft: false,
        featured: false,
        showTOC: true,
      },
      content: 'Test content 3',
      readingTime: {
        text: '3 min read',
        minutes: 3,
        words: 300,
      },
      headings: [],
      filepath: 'test-post-3.mdx',
      url: '/blog/test-post-3',
      isPublished: true,
    },
  ];

  it('renders "Related Posts" heading', () => {
    render(<RelatedPosts posts={mockPosts} />);
    expect(screen.getByText('Related Posts')).toBeInTheDocument();
  });

  it('renders all related posts as PostCard components', () => {
    render(<RelatedPosts posts={mockPosts} />);
    
    expect(screen.getByTestId('post-card-test-post-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-test-post-2')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-test-post-3')).toBeInTheDocument();
  });

  it('renders posts in a grid layout', () => {
    const { container } = render(<RelatedPosts posts={mockPosts} />);
    
    // Check for grid container
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('returns null when posts array is empty', () => {
    const { container } = render(<RelatedPosts posts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when posts is undefined', () => {
    const { container } = render(<RelatedPosts posts={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('handles single related post', () => {
    render(<RelatedPosts posts={[mockPosts[0]]} />);
    
    expect(screen.getByText('Related Posts')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-test-post-1')).toBeInTheDocument();
    expect(screen.queryByTestId('post-card-test-post-2')).not.toBeInTheDocument();
  });

  it('applies correct spacing and styling', () => {
    const { container } = render(<RelatedPosts posts={mockPosts} />);
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('mt-12', 'pt-12', 'border-t', 'border-gray-200');
    
    const heading = screen.getByText('Related Posts');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'mb-6');
  });
});
