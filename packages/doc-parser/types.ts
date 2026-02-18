// Type definitions for doc-parser package

import type { NodeType, EdgeType } from '@docmaps/database';

// =====================================================
// FETCH RESULT
// =====================================================

/**
 * Result from fetching documentation from a URL
 */
export interface FetchResult {
  /** The final URL after redirects */
  url: string;
  /** Raw HTML content */
  html: string;
  /** Content-Type header value */
  contentType: string;
  /** HTTP status code */
  statusCode: number;
}

// =====================================================
// PARSE RESULT
// =====================================================

/**
 * Result from parsing documentation HTML
 */
export interface ParseResult {
  /** Extracted nodes (products, features, components) */
  nodes: ExtractedNode[];
  /** Extracted edges (relationships between nodes) */
  edges: ExtractedEdge[];
  /** Metadata about the parsing process */
  metadata: GenerationMetadata;
}

// =====================================================
// PARSING STRATEGY
// =====================================================

/**
 * Interface for parsing strategies
 * Each strategy implements a different approach to extracting nodes/edges
 */
export interface ParsingStrategy {
  /** Strategy name for identification */
  name: string;
  
  /**
   * Check if this strategy can handle the given HTML/URL
   * @param html - Raw HTML content
   * @param url - Source URL
   * @returns true if strategy can parse this content
   */
  canHandle(html: string, url: string): boolean;
  
  /**
   * Parse the HTML and extract nodes/edges
   * @param html - Raw HTML content
   * @param url - Source URL
   * @returns Parsed result with nodes, edges, and metadata
   */
  parse(html: string, url: string): Promise<ParseResult>;
  
  /**
   * Get confidence score for this strategy's results
   * @returns Confidence score between 0 and 1
   */
  confidence(): number;
}

// =====================================================
// EXTRACTED NODE
// =====================================================

/**
 * Node extracted from documentation before layout calculation
 * Compatible with NodeData from @docmaps/database
 */
export interface ExtractedNode {
  /** Unique identifier for the node */
  id: string;
  /** Node type (product, feature, component) */
  type: NodeType;
  /** Node data */
  data: {
    /** Display label */
    label: string;
    /** Optional description */
    description?: string;
    /** Optional icon identifier */
    icon?: string;
    /** Optional color */
    color?: string;
    /** Optional tags */
    tags?: string[];
    /** Optional documentation URL */
    docUrl?: string;
    /** Optional additional links */
    additionalLinks?: Array<{ title: string; url: string }>;
  };
  /** Hierarchy level (used for type assignment) */
  level?: number;
  /** Source element selector (for debugging) */
  sourceSelector?: string;
}

// =====================================================
// EXTRACTED EDGE
// =====================================================

/**
 * Edge extracted from documentation
 * Compatible with EdgeData from @docmaps/database
 */
export interface ExtractedEdge {
  /** Unique identifier for the edge */
  id: string;
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Edge type (hierarchy, related, depends-on, optional) */
  type?: EdgeType;
  /** Optional label */
  label?: string;
  /** Whether this is a floating edge */
  floating?: boolean;
  /** Optional style overrides */
  style?: {
    strokeDasharray?: string;
  };
  /** Confidence score for this relationship (0-1) */
  confidence?: number;
  /** How this edge was inferred (for debugging) */
  inferenceMethod?: 'hierarchy' | 'keyword' | 'proximity' | 'explicit';
}

// =====================================================
// GENERATION METADATA
// =====================================================

/**
 * Metadata about the generation process
 * Stored in maps.generation_metadata JSONB column
 */
export interface GenerationMetadata {
  /** Source documentation URL */
  source_url: string;
  /** Timestamp of generation */
  generated_at: string;
  /** Strategy used for parsing */
  strategy: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Warnings encountered during parsing */
  warnings: string[];
  /** IDs of auto-generated nodes */
  auto_generated_node_ids?: string[];
  /** IDs of manually added nodes (after generation) */
  manually_added_node_ids?: string[];
  /** Statistics about the generation */
  stats?: {
    /** Total nodes extracted before filtering */
    nodes_extracted: number;
    /** Total nodes after filtering */
    nodes_final: number;
    /** Total edges extracted */
    edges_extracted: number;
    /** Nodes removed by deduplication */
    nodes_deduplicated: number;
    /** Nodes removed by filtering */
    nodes_filtered: number;
    /** Generation duration in milliseconds */
    duration_ms: number;
  };
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Error codes for generation failures
 */
export type GenerationErrorCode =
  | 'INVALID_URL'
  | 'FETCH_FAILED'
  | 'PARSE_FAILED'
  | 'VALIDATION_FAILED'
  | 'TOO_FEW_NODES'
  | 'TOO_MANY_NODES'
  | 'NO_RELATIONSHIPS'
  | 'RATE_LIMIT_EXCEEDED';

/**
 * Error response for generation failures
 */
export interface GenerationError {
  /** Error type */
  type: 'error';
  /** Error code */
  code: GenerationErrorCode;
  /** User-friendly error message */
  message: string;
  /** Technical details for debugging */
  details?: string;
  /** Whether the error is recoverable */
  recoverable: boolean;
}

/**
 * SSE event types for streaming generation
 */
export type SSEEventType = 'status' | 'node' | 'edge' | 'layout' | 'complete' | 'error';

/**
 * SSE event data structure
 */
export interface SSEEvent {
  /** Event type */
  type: SSEEventType;
  /** Event payload (varies by type) */
  data?: unknown;
  /** Status message (for status events) */
  message?: string;
  /** Map ID (for complete events) */
  mapId?: string;
}
