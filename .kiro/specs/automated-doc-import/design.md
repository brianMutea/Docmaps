# Automated Documentation Import - Design

## Architecture Overview

The automated documentation import system follows a pipeline architecture with clear separation of concerns:

```
URL Input → Fetcher → Parser → Extractor → Validator → Layout → Streamer → Editor
```

### Core Principles

1. **Rule-Based Only**: No AI/LLM dependencies, pure algorithmic parsing
2. **Progressive Streaming**: SSE-based real-time updates to frontend
3. **Strategy Pattern**: Extensible parser system with priority-based execution
4. **DRY Architecture**: Shared utilities, minimal duplication, clear abstractions
5. **Fail Gracefully**: Partial results better than complete failure

## System Components

### 1. Package Structure

Create new package: `packages/doc-parser/`

```
packages/doc-parser/
├── index.ts                    # Main exports
├── fetcher.ts                  # URL fetching and validation
├── parser.ts                   # Parser orchestration
├── strategies/                 # Parsing strategies
│   ├── base.ts                # Base strategy interface
│   ├── template.ts            # Template-based (AWS, Stripe, etc.)
│   ├── schema.ts              # OpenAPI, Swagger, GraphQL
│   ├── html.ts                # Generic HTML parsing
│   └── heuristic.ts           # Scoring-based extraction
├── extractors/                 # Entity extraction
│   ├── nodes.ts               # Node extraction logic
│   ├── edges.ts               # Relationship inference
│   └── metadata.ts            # Additional data extraction
├── validators/                 # Data quality
│   ├── deduplication.ts       # Merge duplicate nodes
│   ├── filtering.ts           # Remove irrelevant content
│   └── sanitization.ts        # Clean and validate data
├── types.ts                    # Type definitions
└── utils.ts                    # Shared utilities
```

### 2. API Endpoint

Create new API route: `apps/editor/app/api/generate-map/route.ts`

**Endpoint**: `POST /api/generate-map`

**Request Body**:
```typescript
{
  url: string;           // Documentation URL
  userId: string;        // Authenticated user ID
}
```

**Response**: Server-Sent Events (SSE) stream

**Event Types**:
```typescript
// Status updates
{ type: 'status', message: string }

// Node discovered
{ type: 'node', data: NodeData }

// Edge discovered
{ type: 'edge', data: EdgeData }

// Layout calculated
{ type: 'layout', nodes: NodeData[] }

// Generation complete
{ type: 'complete', mapId: string }

// Error occurred
{ type: 'error', message: string }
```

### 3. Frontend Integration

**New Component**: `apps/editor/components/generate-map-dialog.tsx`
- URL input form
- Validation feedback
- "Generate" button

**Enhanced Component**: `apps/editor/app/editor/maps/[id]/page.tsx`
- Accept `?generating=true` query parameter
- Initialize SSE connection
- Handle progressive node/edge updates
- Animate new elements appearing

**New Hook**: `apps/editor/lib/hooks/use-map-generation.ts`
- Manage SSE connection
- Handle event stream
- Update React Flow state progressively
- Handle cancellation

## Detailed Component Design

### Fetcher (`packages/doc-parser/fetcher.ts`)

**Responsibilities**:
- Validate URL format (HTTPS only)
- Check URL accessibility
- Fetch HTML content
- Handle redirects
- Respect rate limits
- Cache responses

**Interface**:
```typescript
interface FetchResult {
  url: string;
  html: string;
  contentType: string;
  statusCode: number;
}

async function fetchDocumentation(url: string): Promise<FetchResult>
```

**Implementation Details**:
- Use native `fetch` API
- Set user agent header
- Follow max 3 redirects
- Timeout after 10 seconds
- Return raw HTML for parsing

### Parser (`packages/doc-parser/parser.ts`)

**Responsibilities**:
- Orchestrate parsing strategies
- Execute strategies in priority order
- Return first successful result
- Aggregate partial results if needed

**Interface**:
```typescript
interface ParseResult {
  nodes: NodeData[];
  edges: EdgeData[];
  metadata: {
    strategy: string;
    confidence: number;
    warnings: string[];
  };
}

async function parseDocumentation(html: string, url: string): Promise<ParseResult>
```

**Strategy Execution Order**:
1. Template matching (highest confidence)
2. Schema detection (structured data)
3. HTML rule-based (reliable patterns)
4. Heuristic scoring (fallback)

### Strategy Pattern

**Base Interface** (`packages/doc-parser/strategies/base.ts`):
```typescript
interface ParsingStrategy {
  name: string;
  canHandle(html: string, url: string): boolean;
  parse(html: string, url: string): Promise<ParseResult>;
  confidence(): number;
}
```

**Template Strategy** (`packages/doc-parser/strategies/template.ts`):
- Predefined selectors for known platforms
- AWS: `.awsui-side-navigation`, `.awsui-breadcrumbs`
- Stripe: `.DocsSidebar`, `.DocsBreadcrumbs`
- GitHub: `.markdown-body`, `.js-navigation`
- High confidence (0.9+) when matched

**Schema Strategy** (`packages/doc-parser/strategies/schema.ts`):
- Detect OpenAPI/Swagger JSON
- Parse GraphQL schema
- Extract from sitemap.xml
- Medium-high confidence (0.7-0.9)

**HTML Strategy** (`packages/doc-parser/strategies/html.ts`):
- Parse navigation elements (`<nav>`, `<aside>`)
- Analyze heading hierarchy (`<h1>`, `<h2>`, `<h3>`)
- Extract breadcrumbs
- Identify main content area
- Medium confidence (0.5-0.7)

**Heuristic Strategy** (`packages/doc-parser/strategies/heuristic.ts`):
- Score elements by position (top/left = higher)
- Score by styling (larger font = higher)
- Score by text length (50-200 chars optimal)
- Score by link density
- Low confidence (0.3-0.5)

### Node Extractor (`packages/doc-parser/extractors/nodes.ts`)

**Responsibilities**:
- Extract products, features, components
- Assign node types based on hierarchy level
- Extract metadata (labels, descriptions, URLs)
- Generate unique IDs

**Extraction Rules**:
```typescript
// Products: Top-level items
- H1 headings
- Primary navigation items
- Sidebar top-level sections
- Breadcrumb first item

// Features: Second-level items
- H2 headings
- Secondary navigation items
- Sidebar nested sections
- Breadcrumb middle items

// Components: Third-level items
- H3 headings
- Tertiary navigation items
- Sidebar deeply nested items
- Breadcrumb last item
```

**Node ID Generation**:
```typescript
function generateNodeId(label: string, type: NodeType): string {
  const slug = label.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${type}-${slug}`;
}
```

### Edge Extractor (`packages/doc-parser/extractors/edges.ts`)

**Responsibilities**:
- Infer relationships from structure
- Detect keyword-based relationships
- Validate edge connections
- Assign edge types

**Relationship Inference**:
```typescript
// Hierarchy: Parent-child from nesting
- Navigation nesting levels
- Heading hierarchy (H1 → H2 → H3)
- Breadcrumb sequence

// Dependency: Keyword detection
Keywords: "requires", "depends on", "prerequisite", "needs"
Pattern: "Feature X requires Component Y"

// Integration: Keyword detection
Keywords: "integrates with", "works with", "connects to", "uses"
Pattern: "Product A integrates with Product B"

// Alternative: Keyword detection
Keywords: "alternative to", "instead of", "or", "versus"
Pattern: "Use Feature X or Feature Y"
```

**Edge Type Mapping**:
```typescript
const EDGE_TYPE_MAP = {
  hierarchy: 'hierarchy',
  dependency: 'depends-on',
  integration: 'related',
  alternative: 'optional'
};
```

### Validator (`packages/doc-parser/validators/`)

**Deduplication** (`deduplication.ts`):
```typescript
// Merge nodes with similar names
function deduplicateNodes(nodes: NodeData[]): NodeData[] {
  // Use Levenshtein distance for similarity
  // Threshold: 85% similarity
  // Keep node with more complete data
}
```

**Filtering** (`filtering.ts`):
```typescript
// Remove irrelevant nodes
const EXCLUDED_LABELS = [
  'Home', 'About', 'Contact', 'Privacy', 'Terms',
  'Login', 'Sign Up', 'Search', 'Menu', 'Navigation'
];

// Limit node count
const MAX_NODES = 50;

// Filter by text length
const MIN_LABEL_LENGTH = 3;
const MAX_LABEL_LENGTH = 100;
```

**Sanitization** (`sanitization.ts`):
```typescript
// Clean HTML entities
function sanitizeText(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// Truncate descriptions
const MAX_DESCRIPTION_LENGTH = 200;

// Validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('https://');
  } catch {
    return false;
  }
}
```

### Layout Integration

**Use Existing Dagre Layout** (`packages/graph/layout/index.ts`):
- No changes needed to layout algorithm
- Apply layout after all nodes/edges extracted
- Stream final positioned nodes to frontend

**Layout Timing**:
1. Extract all nodes and edges
2. Apply validation and deduplication
3. Calculate layout with Dagre
4. Stream positioned nodes via SSE

### Streaming Architecture

**SSE Implementation** (`apps/editor/app/api/generate-map/route.ts`):
```typescript
export async function POST(request: Request) {
  const { url, userId } = await request.json();
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Fetch documentation
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'status',
          message: 'Fetching documentation...'
        })}\n\n`));
        
        const { html } = await fetchDocumentation(url);
        
        // Parse and extract
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'status',
          message: 'Analyzing structure...'
        })}\n\n`));
        
        const { nodes, edges } = await parseDocumentation(html, url);
        
        // Stream nodes
        for (const node of nodes) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'node',
            data: node
          })}\n\n`));
          await sleep(100); // Throttle for visual effect
        }
        
        // Stream edges
        for (const edge of edges) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'edge',
            data: edge
          })}\n\n`));
          await sleep(50);
        }
        
        // Calculate layout
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'status',
          message: 'Calculating layout...'
        })}\n\n`));
        
        const layoutedNodes = applyLayout(nodes, edges);
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'layout',
          nodes: layoutedNodes
        })}\n\n`));
        
        // Save to database
        const mapId = await saveGeneratedMap(userId, url, layoutedNodes, edges);
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'complete',
          mapId
        })}\n\n`));
        
        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          message: error.message
        })}\n\n`));
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

**Frontend Hook** (`apps/editor/lib/hooks/use-map-generation.ts`):
```typescript
export function useMapGeneration(mapId: string) {
  const [status, setStatus] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/generate-map?mapId=${mapId}`);
    
    eventSource.addEventListener('status', (e) => {
      const data = JSON.parse(e.data);
      setStatus(data.message);
    });
    
    eventSource.addEventListener('node', (e) => {
      const data = JSON.parse(e.data);
      setNodes(prev => [...prev, data.data]);
    });
    
    eventSource.addEventListener('edge', (e) => {
      const data = JSON.parse(e.data);
      setEdges(prev => [...prev, data.data]);
    });
    
    eventSource.addEventListener('layout', (e) => {
      const data = JSON.parse(e.data);
      setNodes(data.nodes);
    });
    
    eventSource.addEventListener('complete', () => {
      setComplete(true);
      eventSource.close();
    });
    
    eventSource.addEventListener('error', (e) => {
      const data = JSON.parse(e.data);
      setError(data.message);
      eventSource.close();
    });
    
    return () => eventSource.close();
  }, [mapId]);
  
  return { status, nodes, edges, error, complete };
}
```

## Database Schema Changes

### Add Generation Metadata to Maps Table

```sql
ALTER TABLE maps ADD COLUMN generation_metadata JSONB DEFAULT NULL;

-- Structure:
{
  "source_url": "https://docs.example.com",
  "generated_at": "2026-02-17T10:30:00Z",
  "strategy": "template",
  "confidence": 0.85,
  "auto_generated_node_ids": ["product-api", "feature-auth"],
  "manually_added_node_ids": ["component-custom"]
}
```

## Error Handling

### Error Categories

1. **URL Validation Errors**
   - Invalid format
   - Not HTTPS
   - Blocked by robots.txt

2. **Fetch Errors**
   - Network timeout
   - 404 Not Found
   - 403 Forbidden
   - SSL errors

3. **Parsing Errors**
   - No content found
   - Malformed HTML
   - No extractable structure

4. **Generation Errors**
   - Too few nodes (< 3)
   - Too many nodes (> 100)
   - No relationships found

### Error Response Format

```typescript
{
  type: 'error',
  code: 'FETCH_FAILED' | 'PARSE_FAILED' | 'VALIDATION_FAILED',
  message: 'User-friendly error message',
  details: 'Technical details for debugging',
  recoverable: boolean
}
```

## Performance Optimizations

### Caching Strategy

```typescript
// Cache fetched HTML for 1 hour
const CACHE_TTL = 3600;

// Cache key format
const cacheKey = `doc:${hashUrl(url)}`;

// Use in-memory cache (Redis in production)
```

### Rate Limiting

```typescript
// Limit per user
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000 // 1 minute
};

// Limit per IP
const IP_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60000
};
```

### Streaming Throttle

```typescript
// Delay between node streams for visual effect
const NODE_STREAM_DELAY = 100; // ms

// Delay between edge streams
const EDGE_STREAM_DELAY = 50; // ms
```

## Security Considerations

### SSRF Prevention

```typescript
// Blocked domains
const BLOCKED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254', // AWS metadata
  '10.0.0.0/8',      // Private networks
  '172.16.0.0/12',
  '192.168.0.0/16'
];

// Validate URL before fetching
function isSafeUrl(url: string): boolean {
  const parsed = new URL(url);
  return !BLOCKED_DOMAINS.some(blocked => 
    parsed.hostname.includes(blocked)
  );
}
```

### Content Sanitization

```typescript
// Remove all script tags
html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// Remove event handlers
html = html.replace(/on\w+="[^"]*"/gi, '');

// Sanitize extracted text
text = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
```

## Testing Strategy

### Unit Tests

- Fetcher: URL validation, error handling
- Parser: Strategy selection, result aggregation
- Extractors: Node/edge extraction accuracy
- Validators: Deduplication, filtering, sanitization

### Integration Tests

- End-to-end generation flow
- SSE streaming behavior
- Database persistence
- Editor integration

### Test Data

- Sample HTML from known platforms (AWS, Stripe, GitHub)
- Edge cases: minimal content, huge pages, malformed HTML
- Mock SSE responses for frontend testing

## Future Enhancements

### Phase 2: Multi-Page Crawling

- Crawl linked pages up to depth 2
- Aggregate nodes/edges across pages
- Detect cross-page relationships

### Phase 3: Template Marketplace

- User-contributed templates
- Community voting on template quality
- Template versioning

### Phase 4: Incremental Updates

- Re-generate from same URL
- Merge with existing manual edits
- Highlight changes since last generation

## Technology Choices

### Why No AI/LLM?

- **Predictability**: Rule-based parsing is deterministic
- **Cost**: No API costs or rate limits
- **Privacy**: No data sent to third parties
- **Speed**: Faster than LLM inference
- **Maintainability**: Easier to debug and improve

### Why Server-Sent Events?

- **Progressive Updates**: Real-time streaming
- **Simplicity**: Simpler than WebSockets
- **Browser Support**: Native EventSource API
- **Unidirectional**: Server → client only (sufficient)

### Why Dagre Layout?

- **Already Integrated**: Used throughout app
- **Proven**: Handles complex graphs well
- **Configurable**: Supports different directions
- **Fast**: Efficient for 50-100 nodes

## Success Criteria

### Technical Metrics

- 95%+ uptime for generation endpoint
- < 15s average generation time
- < 5% error rate
- Support 10+ concurrent generations

### Quality Metrics

- 70%+ node retention rate (users keep generated nodes)
- 80%+ user satisfaction
- 50%+ time savings vs manual creation

### Platform Coverage

- AWS documentation (template)
- Stripe documentation (template)
- GitHub documentation (template)
- Generic HTML sites (heuristic)
- OpenAPI specs (schema)
