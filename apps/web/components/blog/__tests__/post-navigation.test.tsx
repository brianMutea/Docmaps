import { render, screen } from '@testing-library/react';
import { PostNavigation } from '../post-navigation';
import type { Post } from '@/lib/blog/content';

// Mock post data
const createMockPost = (title: string, slug: string): Post => ({
  slug,
  frontmatter: {
    title,
    date: '2024-01-01T00:00:00Z',
    author: {
      name: 'Test Author',
    },
    excerpt: 'Test excerpt',
    tags: ['test'],
    categories: ['test'],
    seo: {},
    draft: false,
    featured: false,
    showTOC: true,
  },
  content: 'Test content',
  readingTime: {
    text: '5 min read',
    minutes: 5,
    words: 1000,
  },
  headings: [],
  filepath: 'test.mdx',
  url: `/blog/${slug}`,
  isPublished: true,
});

describe('PostNavigation', () => {
  it('renders both previous and next post links', () => {
    const previousPost = createMockPost('Previous Post', 'previous-post');
    const nextPost = createMockPost('Next Post', 'next-post');

    render(<PostNavigation previousPost={previousPost} nextPost={nextPost} />);

    // Use getAllByText since the title appears twice (label and title)
    const previousElements = screen.getAllByText('Previous Post');
    const nextElements = screen.getAllByText('Next Post');
    
    expect(previousElements.length).toBeGreaterThan(0);
    expect(nextElements.length).toBeGreaterThan(0);
  });

  it('renders only previous post when next post is null', () => {
    const previousPost = createMockPost('Previous Post', 'previous-post');

    render(<PostNavigation previousPost={previousPost} nextPost={null} />);

    // Use getAllByText since the title appears twice (label and title)
    const previousElements = screen.getAllByText('Previous Post');
    expect(previousElements.length).toBeGreaterThan(0);
    expect(screen.queryByText('Next Post')).not.toBeInTheDocument();
  });

  it('renders only next post when previous post is null', () => {
    const nextPost = createMockPost('Next Post', 'next-post');

    render(<PostNavigation previousPost={null} nextPost={nextPost} />);

    expect(screen.queryByText('Previous Post')).not.toBeInTheDocument();
    // Use getAllByText since the title appears twice (label and title)
    const nextElements = screen.getAllByText('Next Post');
    expect(nextElements.length).toBeGreaterThan(0);
  });

  it('renders nothing when both posts are null', () => {
    const { container } = render(<PostNavigation previousPost={null} nextPost={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when both posts are undefined', () => {
    const { container } = render(<PostNavigation />);

    expect(container.firstChild).toBeNull();
  });

  it('renders correct links for previous and next posts', () => {
    const previousPost = createMockPost('Previous Post', 'previous-post');
    const nextPost = createMockPost('Next Post', 'next-post');

    render(<PostNavigation previousPost={previousPost} nextPost={nextPost} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/blog/previous-post');
    expect(links[1]).toHaveAttribute('href', '/blog/next-post');
  });

  it('handles long post titles with line clamping', () => {
    const previousPost = createMockPost(
      'This is a very long post title that should be clamped to two lines maximum',
      'long-title-post'
    );

    render(<PostNavigation previousPost={previousPost} nextPost={null} />);

    const titleElement = screen.getByText(previousPost.frontmatter.title);
    expect(titleElement).toHaveClass('line-clamp-2');
  });
});
