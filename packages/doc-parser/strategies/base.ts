// Base parsing strategy abstract class

import type { ParsingStrategy, ParseResult } from '../types';

/**
 * Abstract base class for all parsing strategies
 * Defines the interface that all strategies must implement
 */
export abstract class BaseStrategy implements ParsingStrategy {
  /** Strategy name for identification */
  abstract readonly name: string;

  /**
   * Check if this strategy can handle the given HTML/URL
   * @param html - Raw HTML content
   * @param url - Source URL
   * @returns true if strategy can parse this content
   */
  abstract canHandle(html: string, url: string): boolean;

  /**
   * Parse the HTML and extract nodes/edges
   * @param html - Raw HTML content
   * @param url - Source URL
   * @returns Parsed result with nodes, edges, and metadata
   */
  abstract parse(html: string, url: string): Promise<ParseResult>;

  /**
   * Get confidence score for this strategy's results
   * @returns Confidence score between 0 and 1
   */
  abstract confidence(): number;
}
