/**
 * Blog utility functions
 * 
 * This module provides core utility functions for the blog system:
 * - Slug generation from titles
 * - Reading time calculation
 * - Excerpt generation with word boundary truncation
 * - Date formatting
 */

import readingTime from 'reading-time';
import { format, parseISO } from 'date-fns';

/**
 * Generate a URL-safe slug from a title
 * 
 * Converts a title to lowercase, replaces spaces and special characters
 * with hyphens, and removes consecutive hyphens.
 * 
 * @param title - The title to convert to a slug
 * @returns URL-safe slug containing only lowercase letters, numbers, and hyphens
 * 
 * @example
 * generateSlug('Hello World!') // 'hello-world'
 * generateSlug('TypeScript & React') // 'typescript-react'
 * generateSlug('  Multiple   Spaces  ') // 'multiple-spaces'
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^\w-]+/g, '')
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate reading time for content
 * 
 * Uses the reading-time library to estimate how long it will take
 * to read the content based on word count.
 * 
 * @param content - The content to analyze (Markdown or plain text)
 * @returns Reading time statistics including text, minutes, and word count
 * 
 * @example
 * calculateReadingTime('Hello world') // { text: '1 min read', minutes: 1, words: 2 }
 */
export function calculateReadingTime(content: string): {
  text: string;
  minutes: number;
  words: number;
} {
  const stats = readingTime(content);
  
  return {
    text: stats.text,
    minutes: Math.ceil(stats.minutes),
    words: stats.words,
  };
}

/**
 * Generate an excerpt from content
 * 
 * Truncates content to a maximum length, ensuring truncation happens
 * at a word boundary. Adds ellipsis if content was truncated.
 * 
 * @param content - The content to generate an excerpt from
 * @param maxLength - Maximum length of the excerpt (default: 160)
 * @returns Truncated excerpt with ellipsis if needed
 * 
 * @example
 * generateExcerpt('This is a long piece of content', 10) // 'This is a...'
 * generateExcerpt('Short', 100) // 'Short'
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown formatting and extra whitespace
  const plainText = content
    .replace(/[#*_~`[\]()]/g, '') // Remove markdown syntax
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // If content is shorter than max length, return as-is
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Truncate at word boundary
  const truncated = plainText.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // If no space found, just truncate at max length
  if (lastSpaceIndex === -1) {
    return truncated + '...';
  }
  
  // Truncate at last space and add ellipsis
  return truncated.slice(0, lastSpaceIndex) + '...';
}

/**
 * Format a date string for display
 * 
 * Converts an ISO 8601 date string to a human-readable format.
 * 
 * @param dateString - ISO 8601 date string
 * @param formatString - date-fns format string (default: 'MMMM d, yyyy')
 * @returns Formatted date string
 * 
 * @example
 * formatDate('2024-01-15T00:00:00Z') // 'January 15, 2024'
 * formatDate('2024-01-15T00:00:00Z', 'MMM d, yyyy') // 'Jan 15, 2024'
 */
export function formatDate(dateString: string, formatString: string = 'MMMM d, yyyy'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}
