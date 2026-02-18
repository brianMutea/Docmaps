# @docmaps/doc-parser

Rule-based documentation parser for automatically generating visual maps from documentation websites.

## Overview

The doc-parser package provides a comprehensive system for fetching, parsing, and extracting structured data from documentation websites. It uses multiple parsing strategies to handle different documentation formats and structures.

## Features

- **Multiple Parsing Strategies**: Template-based, schema-based, HTML-based, and heuristic fallback
- **Smart Caching**: In-memory caching with TTL and LRU eviction
- **Data Validation**: Deduplication, filtering, and sanitization
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Well-Tested**: 229 unit tests with high code coverage

## Installation

```bash
npm install @docmaps/doc-parser
```

## Quick Start

```typescript
import { fetchDocumentation, parseDocumentation } from '@docmaps/doc-parser';

// Fetch documentation from a URL
const fetchResult = await fetchDocumentation('https://docs.example.com');

// Parse the HTML and extract nodes/edges
const parseResult = await parseDocumentation(fetchResult.html, fetchResult.url);

console.log(`Extracted ${parseResult.nodes.length} nodes`);
console.log(`Extracted ${parseResult.edges.length} edges`);
console.log(`Strategy used: ${parseResult.metadata.strategy}`);
console.log(`Confidence: ${parseResult.metadata.confidence}`);
```

## Core Concepts

### Parsing Strategies

The parser uses a priority-based strategy system:

1. **Template Strategy** (confidence: 0.9): Platform-specific parsing for known documentation sites (AWS, Stripe, GitHub)
2. **Schema Strategy** (confidence: 0.7-0.9): Extracts from OpenAPI/Swagger specs and sitemaps
3. **HTML Strategy** (confidence: 0.5-0.7): Generic HTML parsing using navigation, headings, and breadcrumbs
4. **Heuristic Strategy** (confidence: 0.3-0.5): Fallback scoring algorithm based on element position, styling, and text length

### Node Types

Extracted nodes are classified into three types based on hierarchy:

- **Product**: Top-level items (H1 headings, primary navigation)
- **Feature**: Second-level items (H2 headings, secondary navigation)
- **Component**: Third-level items (H3 headings, tertiary navigation)

### Edge Types

Relationships between nodes are inferred:

- **Hierarchy**: Parent-child relationships from nesting
- **Dependency**: Detected via keywords ("requires", "depends on")
- **Integration**: Detected via keywords ("integrates with", "works with")
- **Alternative**: Detected via keywords ("alternative to", "instead of")

## API Reference

### Fetching

#### `fetchDocumentation(url: string): Promise<FetchResult>`

Fetches HTML content from a URL with validation and caching.

```typescript
const result = await fetchDocumentation('https://docs.example.com');
// Returns: { url, html, contentType, statusCode }
```

**Features**:
- HTTPS-only validation
- SSRF prevention (blocks localhost, private IPs)
- Automatic caching with 1-hour TTL
- Redirect following (max 3)
- 10-second timeout

#### `validateUrl(url: string): boolean`

Validates a URL for security and format.

```typescript
const isValid = validateUrl('https://docs.example.com'); // true
const isInvalid = validateUrl('http://localhost'); // false
```

### Parsing

#### `parseDocumentation(html: string, url: string): Promise<ParseResult>`

Parses HTML and extracts nodes, edges, and metadata.

```typescript
const result = await parseDocumentation(html, url);
// Returns: { nodes, edges, metadata }
```

**Process**:
1. Tries each strategy in priority order
2. Applies validators (deduplication, filtering, sanitization)
3. Returns structured data with metadata

#### `detectStrategy(html: string, url: string): string`

Detects which strategy would be used for given HTML/URL.

```typescript
const strategy = detectStrategy(html, 'https://docs.aws.amazon.com');
// Returns: 'template'
```

### Caching

#### `getCached(url: string): string | null`

Retrieves cached HTML for a URL.

```typescript
const cached = getCached('https://docs.example.com');
```

#### `setCached(url: string, html: string, ttl?: number): void`

Caches HTML for a URL with optional TTL.

```typescript
setCached('https://docs.example.com', html, 3600000); // 1 hour
```

#### `clearCache(): void`

Clears all cached entries.

```typescript
clearCache();
```

### Utilities

#### `generateNodeId(label: string, type: NodeType): string`

Generates a unique ID for a node.

```typescript
const id = generateNodeId('API Gateway', 'product');
// Returns: 'product-api-gateway'
```

#### `sanitizeText(text: string): string`

Cleans HTML entities and whitespace from text.

```typescript
const clean = sanitizeText('Hello&nbsp;World  ');
// Returns: 'Hello World'
```

#### `truncateDescription(text: string, maxLength: number): string`

Truncates text to a maximum length with ellipsis.

```typescript
const short = truncateDescription('Long description...', 100);
```

#### `isValidUrl(url: string): boolean`

Validates URL format and protocol.

```typescript
const valid = isValidUrl('https://example.com'); // true
```

#### `hashUrl(url: string): string`

Creates a hash of a URL for cache keys.

```typescript
const hash = hashUrl('https://docs.example.com');
```

## Adding New Strategies

To add a new parsing strategy:

1. Create a new file in `strategies/` directory
2. Extend the `BaseStrategy` abstract class
3. Implement required methods:

```typescript
import { BaseStrategy } from './base';
import type { ParseResult } from '../types';

export class MyCustomStrategy extends BaseStrategy {
  name = 'my-custom';

  canHandle(html: string, url: string): boolean {
    // Return true if this strategy can parse the content
    return url.includes('my-docs-site.com');
  }

  async parse(html: string, url: string): Promise<ParseResult> {
    // Extract nodes and edges from HTML
    const nodes = []; // Your extraction logic
    const edges = []; // Your relationship logic

    return {
      nodes,
      edges,
      metadata: {
        source_url: url,
        generated_at: new Date().toISOString(),
        strategy: this.name,
        confidence: 0.8,
        warnings: [],
      },
    };
  }

  confidence(): number {
    return 0.8; // Return confidence score (0-1)
  }
}
```

4. Add your strategy to the parser orchestrator in `parser.ts`:

```typescript
const strategies: ParsingStrategy[] = [
  new TemplateStrategy(),
  new SchemaStrategy(),
  new MyCustomStrategy(), // Add here
  new HtmlStrategy(),
  new HeuristicStrategy(),
];
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## Type Definitions

All types are exported from the main package:

```typescript
import type {
  FetchResult,
  ParseResult,
  ParsingStrategy,
  ExtractedNode,
  ExtractedEdge,
  GenerationMetadata,
  SSEEventType,
  SSEEvent,
} from '@docmaps/doc-parser';
```

## Performance

- **Caching**: Reduces redundant fetches with 1-hour TTL
- **Validation**: Early rejection of invalid URLs
- **Streaming**: Supports SSE for progressive updates
- **Efficient Parsing**: Cheerio-based HTML parsing

## Security

- **HTTPS Only**: Rejects non-HTTPS URLs
- **SSRF Prevention**: Blocks localhost and private IP ranges
- **XSS Protection**: Sanitizes all extracted text
- **Rate Limiting**: Recommended for production use

## License

MIT

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm test`)
2. Code follows TypeScript best practices
3. New features include tests
4. Documentation is updated

