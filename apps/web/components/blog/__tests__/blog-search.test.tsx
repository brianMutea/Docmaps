/**
 * Unit tests for BlogSearch component
 * 
 * Tests:
 * - Component renders with search input
 * - Search filters posts by title
 * - Search filters posts by excerpt
 * - Search filters posts by tags
 * - Search is case-insensitive
 * - Clear button resets search
 * - Debouncing delays search execution
 * - Results count displays correctly
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlogSearch } from '../blog-search';
import type { Post } from '@/lib/blog/content';

// Mock posts for testing
const mockPosts: Post[] = [
  {
    slug: 'typescript-guide',
    frontmatter: {
      title: 'TypeScript Best Practices',
      excerpt: 'Learn how to write better TypeScript code',
      tags: ['typescript', 'programming'],
      categories: ['tutorials'],
      date: '2024-01-01T00:00:00Z',
      author: {
        name: 'John Doe',
      },
      seo: {},
      draft: false,
      featured: false,
      showTOC: true,
    },
    content: '',
    readingTime: { text: '5 min read', minutes: 5, words: 1000 },
    headings: [],
    filepath: 'typescript-guide.mdx',
    url: '/blog/typescript-guide',
    isPublished: true,
  },
  {
    slug: 'react-hooks',
    frontmatter: {
      title: 'React Hooks Tutorial',
      excerpt: 'Master React hooks with practical examples',
      tags: ['react', 'javascript'],
      categories: ['tutorials'],
      date: '2024-01-02T00:00:00Z',
      author: {
        name: 'Jane Smith',
      },
      seo: {},
      draft: false,
      featured: false,
      showTOC: true,
    },
    content: '',
    readingTime: { text: '8 min read', minutes: 8, words: 1600 },
    headings: [],
    filepath: 'react-hooks.mdx',
    url: '/blog/react-hooks',
    isPublished: true,
  },
  {
    slug: 'nextjs-performance',
    frontmatter: {
      title: 'Next.js Performance Optimization',
      excerpt: 'Optimize your Next.js application for speed',
      tags: ['nextjs', 'performance'],
      categories: ['guides'],
      date: '2024-01-03T00:00:00Z',
      author: {
        name: 'Bob Johnson',
      },
      seo: {},
      draft: false,
      featured: false,
      showTOC: true,
    },
    content: '',
    readingTime: { text: '10 min read', minutes: 10, words: 2000 },
    headings: [],
    filepath: 'nextjs-performance.mdx',
    url: '/blog/nextjs-performance',
    isPublished: true,
  },
];

describe('BlogSearch', () => {
  it('renders search input with placeholder', () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...');
    expect(input).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    const onSearchResults = jest.fn();
    render(
      <BlogSearch
        posts={mockPosts}
        onSearchResults={onSearchResults}
        placeholder="Find articles..."
      />
    );

    const input = screen.getByPlaceholderText('Find articles...');
    expect(input).toBeInTheDocument();
  });

  it('filters posts by title', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(input, { target: { value: 'TypeScript' } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(onSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              slug: 'typescript-guide',
            }),
          ])
        );
      },
      { timeout: 500 }
    );

    // Should only return 1 post
    const lastCall = onSearchResults.mock.calls[onSearchResults.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(1);
  });

  it('filters posts by excerpt', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(input, { target: { value: 'practical examples' } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(onSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              slug: 'react-hooks',
            }),
          ])
        );
      },
      { timeout: 500 }
    );

    const lastCall = onSearchResults.mock.calls[onSearchResults.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(1);
  });

  it('filters posts by tags', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(input, { target: { value: 'performance' } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(onSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              slug: 'nextjs-performance',
            }),
          ])
        );
      },
      { timeout: 500 }
    );

    const lastCall = onSearchResults.mock.calls[onSearchResults.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(1);
  });

  it('search is case-insensitive', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(input, { target: { value: 'REACT' } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(onSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              slug: 'react-hooks',
            }),
          ])
        );
      },
      { timeout: 500 }
    );

    const lastCall = onSearchResults.mock.calls[onSearchResults.mock.calls.length - 1];
    expect(lastCall[0]).toHaveLength(1);
  });

  it('returns all posts when search is empty', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...');
    
    // Type something first
    fireEvent.change(input, { target: { value: 'react' } });
    
    // Then clear it
    fireEvent.change(input, { target: { value: '' } });

    // Wait for debounce
    await waitFor(
      () => {
        const lastCall = onSearchResults.mock.calls[onSearchResults.mock.calls.length - 1];
        expect(lastCall[0]).toHaveLength(3);
      },
      { timeout: 500 }
    );
  });

  it('shows clear button when input has value', () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...');
    
    // Initially no clear button
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    // Type something
    fireEvent.change(input, { target: { value: 'test' } });

    // Clear button should appear
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...') as HTMLInputElement;
    
    // Type something
    fireEvent.change(input, { target: { value: 'react' } });
    expect(input.value).toBe('react');

    // Click clear button
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    // Input should be cleared
    expect(input.value).toBe('');

    // Should return all posts after debounce
    await waitFor(
      () => {
        const lastCall = onSearchResults.mock.calls[onSearchResults.mock.calls.length - 1];
        expect(lastCall[0]).toHaveLength(3);
      },
      { timeout: 500 }
    );
  });

  it('displays results count when searching', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(input, { target: { value: 'react' } });

    // Wait for debounce and results count to appear
    await waitFor(
      () => {
        expect(screen.getByText('Found 1 post')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('displays plural results count correctly', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(input, { target: { value: 'tutorials' } });

    // Wait for debounce and results count to appear
    await waitFor(
      () => {
        expect(screen.getByText('Found 2 posts')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('displays no results message when no posts match', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    // Wait for debounce and no results message to appear
    await waitFor(
      () => {
        expect(screen.getByText(/No posts found for "nonexistent"/)).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('debounces search input', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} debounceMs={300} />);

    const input = screen.getByPlaceholderText('Search posts...');
    
    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 'r' } });
    fireEvent.change(input, { target: { value: 're' } });
    fireEvent.change(input, { target: { value: 'rea' } });
    fireEvent.change(input, { target: { value: 'reac' } });
    fireEvent.change(input, { target: { value: 'react' } });

    // Should not call immediately
    expect(onSearchResults).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(
      () => {
        expect(onSearchResults).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('clears search on Escape key', async () => {
    const onSearchResults = jest.fn();
    render(<BlogSearch posts={mockPosts} onSearchResults={onSearchResults} />);

    const input = screen.getByPlaceholderText('Search posts...') as HTMLInputElement;
    
    // Type something
    fireEvent.change(input, { target: { value: 'react' } });
    expect(input.value).toBe('react');

    // Press Escape
    fireEvent.keyDown(input, { key: 'Escape' });

    // Input should be cleared
    expect(input.value).toBe('');
  });
});
