/**
 * Unit tests for blog utility functions
 * 
 * Tests specific examples and edge cases for:
 * - Slug generation
 * - Reading time calculation
 * - Excerpt generation
 * - Date formatting
 */

import { generateSlug, calculateReadingTime, generateExcerpt, formatDate } from '../utils';

describe('generateSlug', () => {
  it('converts title to lowercase', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
    expect(generateSlug('UPPERCASE TITLE')).toBe('uppercase-title');
  });

  it('replaces spaces with hyphens', () => {
    expect(generateSlug('Multiple Word Title')).toBe('multiple-word-title');
    expect(generateSlug('Title with many spaces')).toBe('title-with-many-spaces');
  });

  it('removes special characters', () => {
    expect(generateSlug('Hello, World!')).toBe('hello-world');
    expect(generateSlug('TypeScript & React')).toBe('typescript-react');
    expect(generateSlug('Title (with) [brackets]')).toBe('title-with-brackets');
    expect(generateSlug('Title @ #hashtag')).toBe('title-hashtag');
  });

  it('replaces multiple consecutive spaces with single hyphen', () => {
    expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
    expect(generateSlug('Title    with     gaps')).toBe('title-with-gaps');
  });

  it('removes leading and trailing hyphens', () => {
    expect(generateSlug('  Leading spaces')).toBe('leading-spaces');
    expect(generateSlug('Trailing spaces  ')).toBe('trailing-spaces');
    expect(generateSlug('  Both sides  ')).toBe('both-sides');
  });

  it('replaces underscores with hyphens', () => {
    expect(generateSlug('snake_case_title')).toBe('snake-case-title');
    expect(generateSlug('mixed_case Title')).toBe('mixed-case-title');
  });

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('handles string with only special characters', () => {
    expect(generateSlug('!@#$%^&*()')).toBe('');
  });

  it('preserves numbers', () => {
    expect(generateSlug('Top 10 Tips')).toBe('top-10-tips');
    expect(generateSlug('2024 Guide')).toBe('2024-guide');
  });

  it('handles unicode characters', () => {
    expect(generateSlug('Café au lait')).toBe('caf-au-lait');
    expect(generateSlug('Résumé')).toBe('rsum');
  });

  it('produces URL-safe output', () => {
    const slug = generateSlug('Complex! Title@ with# Many$ Special% Characters^');
    expect(slug).toMatch(/^[a-z0-9-]*$/);
  });
});

describe('calculateReadingTime', () => {
  it('calculates reading time for short content', () => {
    const result = calculateReadingTime('Hello world');
    expect(result.words).toBe(2);
    expect(result.minutes).toBeGreaterThanOrEqual(1);
    expect(result.text).toContain('min');
  });

  it('calculates reading time for longer content', () => {
    const longContent = 'word '.repeat(500); // 500 words
    const result = calculateReadingTime(longContent);
    expect(result.words).toBe(500);
    expect(result.minutes).toBeGreaterThan(1);
  });

  it('rounds up minutes', () => {
    // Short content should round up to at least 1 minute
    const result = calculateReadingTime('Just a few words here');
    expect(result.minutes).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(result.minutes)).toBe(true);
  });

  it('handles empty content', () => {
    const result = calculateReadingTime('');
    expect(result.words).toBe(0);
    expect(result.minutes).toBeGreaterThanOrEqual(0);
  });

  it('counts words correctly with markdown', () => {
    const markdown = '# Heading\n\nThis is **bold** and *italic* text.';
    const result = calculateReadingTime(markdown);
    expect(result.words).toBeGreaterThan(0);
  });

  it('increases reading time with more words', () => {
    const short = calculateReadingTime('word '.repeat(100));
    const long = calculateReadingTime('word '.repeat(500));
    expect(long.minutes).toBeGreaterThan(short.minutes);
  });

  it('returns consistent format for text field', () => {
    const result = calculateReadingTime('Some content here');
    expect(result.text).toMatch(/\d+ min read/);
  });
});

describe('generateExcerpt', () => {
  it('returns content as-is if shorter than max length', () => {
    const content = 'Short content';
    expect(generateExcerpt(content, 100)).toBe('Short content');
  });

  it('truncates at word boundary', () => {
    const content = 'This is a long piece of content that needs truncation';
    const excerpt = generateExcerpt(content, 20);
    expect(excerpt).toBe('This is a long...');
    expect(excerpt.length).toBeLessThanOrEqual(23); // 20 + '...'
  });

  it('adds ellipsis when truncated', () => {
    const content = 'This is a long piece of content';
    const excerpt = generateExcerpt(content, 15);
    expect(excerpt).toContain('...');
    expect(excerpt.endsWith('...')).toBe(true);
  });

  it('uses default max length of 160', () => {
    const content = 'word '.repeat(100); // 500 characters
    const excerpt = generateExcerpt(content);
    expect(excerpt.length).toBeLessThanOrEqual(163); // 160 + '...'
  });

  it('removes markdown formatting', () => {
    const content = '# Heading with **bold** and *italic* text';
    const excerpt = generateExcerpt(content, 50);
    expect(excerpt).not.toContain('#');
    expect(excerpt).not.toContain('**');
    expect(excerpt).not.toContain('*');
  });

  it('normalizes whitespace', () => {
    const content = 'Multiple    spaces   and\n\nnewlines';
    const excerpt = generateExcerpt(content, 50);
    expect(excerpt).toBe('Multiple spaces and newlines');
  });

  it('handles content with no spaces', () => {
    const content = 'a'.repeat(200);
    const excerpt = generateExcerpt(content, 50);
    expect(excerpt).toHaveLength(53); // 50 + '...'
    expect(excerpt.endsWith('...')).toBe(true);
  });

  it('handles empty content', () => {
    expect(generateExcerpt('')).toBe('');
  });

  it('truncates at last space before max length', () => {
    const content = 'One two three four five six seven eight';
    const excerpt = generateExcerpt(content, 15);
    // Should truncate at "three" (13 chars) rather than mid-word
    expect(excerpt).toBe('One two three...');
  });

  it('removes various markdown syntax', () => {
    const content = 'Text with `code` and [links](url) and ~strikethrough~';
    const excerpt = generateExcerpt(content, 100);
    expect(excerpt).not.toContain('`');
    expect(excerpt).not.toContain('[');
    expect(excerpt).not.toContain(']');
    expect(excerpt).not.toContain('~');
  });
});

describe('formatDate', () => {
  it('formats ISO date with default format', () => {
    const result = formatDate('2024-01-15T00:00:00Z');
    expect(result).toBe('January 15, 2024');
  });

  it('formats ISO date with custom format', () => {
    const result = formatDate('2024-01-15T00:00:00Z', 'MMM d, yyyy');
    expect(result).toBe('Jan 15, 2024');
  });

  it('handles different date formats', () => {
    expect(formatDate('2024-12-25T00:00:00Z', 'yyyy-MM-dd')).toBe('2024-12-25');
    expect(formatDate('2024-06-01T00:00:00Z', 'MMMM yyyy')).toBe('June 2024');
    expect(formatDate('2024-03-15T00:00:00Z', 'MMM dd')).toBe('Mar 15');
  });

  it('handles date-only ISO strings', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('2024');
    expect(result).toContain('January');
  });

  it('returns original string on invalid date', () => {
    const invalid = 'not-a-date';
    const result = formatDate(invalid);
    expect(result).toBe(invalid);
  });

  it('handles various ISO 8601 formats', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toContain('January 15, 2024');
    expect(formatDate('2024-01-15T10:30:00+00:00')).toContain('January 15, 2024');
    expect(formatDate('2024-01-15T10:30:00.000Z')).toContain('January 15, 2024');
  });

  it('formats dates from different months', () => {
    expect(formatDate('2024-01-01T00:00:00Z')).toBe('January 1, 2024');
    expect(formatDate('2024-06-15T00:00:00Z')).toBe('June 15, 2024');
    expect(formatDate('2024-12-31T00:00:00Z')).toBe('December 31, 2024');
  });

  it('handles leap year dates', () => {
    expect(formatDate('2024-02-29T00:00:00Z')).toBe('February 29, 2024');
  });
});
