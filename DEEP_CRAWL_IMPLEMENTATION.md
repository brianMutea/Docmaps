# Deep Crawl Strategy Implementation

## Overview

Successfully implemented a multi-page deep crawling strategy for the automated documentation import feature. This strategy fetches multiple pages from documentation sites to extract comprehensive, meaningful feature maps instead of surface-level content.

## Key Improvements

### 1. Multi-Page Crawling
- **Before**: Single-page parsing extracted 6-10 shallow nodes (e.g., "Welcome", "Introduction")
- **After**: Multi-page crawling extracts 25-35+ deep nodes with actual product features

### 2. Intelligent Page Selection
Implemented a scoring system to identify the most valuable documentation pages:
- **High Priority** (score +5): API reference pages
- **Medium Priority** (score +3-4): Integration, guide, reference pages
- **Low Priority** (score +1-2): Configuration, deployment, overview pages
- **Penalized** (score -10): Generic pages like "Documentation", "Home"

### 3. Better Content Filtering
Enhanced filtering to skip:
- Meta-navigation links (Edit, GitHub, Home)
- Generic headings (Table of Contents, Prerequisites, Introduction)
- Numbered steps and "What is" sections
- Very short labels (<5 characters)
- Overly long labels (>80 characters)

### 4. Label Cleaning
Removes noise from extracted labels:
- Arrows and directional indicators (→, ↗)
- Parenthetical text and explanations
- Marketing phrases ("Learn more", "Explore more")
- Extra whitespace and formatting

## Implementation Details

### Files Modified

1. **`packages/doc-parser/strategies/deep-crawl.ts`**
   - Main deep crawl implementation
   - Fetches start page + 4-5 section pages
   - Builds 3-level hierarchy: Product → Features → Components
   - Fixed TypeScript errors (url → docUrl)

2. **`packages/doc-parser/strategies/hybrid.ts`**
   - Single-page hybrid strategy (fallback)
   - Fixed TypeScript type errors with cheerio
   - Changed url → docUrl for NodeData compatibility

3. **`packages/doc-parser/strategies/navigation.ts`**
   - Navigation-based parsing (fallback)
   - Fixed TypeScript type errors
   - Changed url → docUrl

4. **`packages/doc-parser/parser.ts`**
   - Added source_url and generated_at to metadata
   - Deep crawl runs first (highest quality)
   - Falls back to hybrid → navigation → legacy strategies

5. **`packages/doc-parser/fetcher.ts`**
   - Browser-based fetching with Puppeteer
   - Handles JavaScript-rendered sites (Mintlify, Docusaurus, Nextra)

6. **`packages/doc-parser/package.json`**
   - Added Puppeteer dependency

## Test Results

### Flexprice Documentation
```
✓ Pages crawled: 5
✓ Nodes extracted: 34
✓ Edges extracted: 33
✓ Confidence: 0.95

Sample nodes:
  1. [product  ] Welcome to Flexprice
  2. [feature  ] API Reference
  3. [component] Base URL
  4. [component] Authentication
  5. [component] Response Format
  6. [feature  ] Event Ingestion API Reference
  7. [component] Single Event
  8. [component] Bulk Events
  9. [feature  ] Manage API Keys
```

### Resend Documentation
```
✓ Pages crawled: 5
✓ Nodes extracted: 33
✓ Edges extracted: 32
✓ Confidence: 0.95

Sample nodes:
  1. [product  ] Introduction
  2. [feature  ] API Reference
  3. [component] Base URL
  4. [component] Authentication
  5. [component] Response codes
  6. [feature  ] Webhook Events
```

## Architecture

### Strategy Priority Order
1. **Deep Crawl** (confidence: 0.95) - Multi-page crawling
2. **Hybrid** (confidence: 0.7-0.9) - Single page content + navigation
3. **Navigation** (confidence: 0.5-0.7) - Navigation structure only
4. **Legacy Strategies** (confidence: 0.3-0.5) - Template, schema, HTML, heuristic

### Node Hierarchy
```
Product (root)
  ├── Feature (main sections)
  │   ├── Component (sub-features)
  │   ├── Component
  │   └── Component
  ├── Feature
  │   ├── Component
  │   └── Component
  └── Feature
```

## Configuration

### Crawl Parameters
- **Max Pages**: 5 (1 start page + 4 section pages)
- **Delay Between Requests**: 1000ms
- **Browser Timeout**: 45 seconds per page
- **Max Components per Section**: 8 (to avoid noise)

### Scoring Weights
```typescript
API reference: +5
Reference pages: +4
Guides/integrations: +3
Configuration/deployment: +2
Overview: +1
Generic terms: -10
```

## TypeScript Fixes

### 1. Property Name Changes
Changed `url` to `docUrl` in node data objects to match `NodeData` interface from `@docmaps/database`.

### 2. Cheerio Type Issues
Replaced `cheerio.Cheerio<cheerio.Element>` with `ReturnType<typeof $>` or `any` to avoid type narrowing issues in callbacks.

### 3. Metadata Properties
Added required `source_url` and `generated_at` fields to `GenerationMetadata` in parser.ts.

## Next Steps

### Immediate
1. ✅ Fix TypeScript compilation errors
2. ✅ Test deep crawl with real documentation sites
3. ✅ Verify end-to-end flow compiles

### Future Enhancements
1. **Caching**: Cache fetched pages to avoid re-fetching
2. **Rate Limiting**: Add configurable rate limits per domain
3. **Parallel Fetching**: Fetch section pages in parallel (with rate limiting)
4. **Smart Depth**: Dynamically adjust crawl depth based on content quality
5. **Link Analysis**: Use link text and context for better node type detection
6. **Content Extraction**: Extract descriptions from page content
7. **Relationship Detection**: Infer dependency/integration edges from content

### Performance Optimizations
1. Reduce browser timeout for faster failures
2. Implement page caching with TTL
3. Add request deduplication
4. Optimize cheerio selectors
5. Stream processing for large pages

## Usage

### In API Route
```typescript
import { parseDocumentation } from '@docmaps/doc-parser';

const result = await parseDocumentation(html, url, true); // enableDeepCrawl=true
```

### Test Scripts
```bash
# Test deep crawl with Flexprice
npx tsx packages/doc-parser/test-deep-crawl-simple.ts

# Test multiple URLs
npx tsx packages/doc-parser/test-real-urls.ts
```

## Known Limitations

1. **Timeout Issues**: Some heavy documentation sites (Weaviate, Stripe) may timeout
2. **JavaScript Dependency**: Requires Puppeteer/Chrome for JavaScript-rendered sites
3. **Rate Limiting**: No built-in rate limiting (relies on delays)
4. **Memory Usage**: Browser instances can be memory-intensive
5. **Crawl Depth**: Fixed at 2 levels (could be smarter)

## Conclusion

The deep crawl strategy successfully extracts meaningful, hierarchical documentation maps from modern JavaScript-rendered documentation sites. It produces 3-5x more nodes than single-page strategies and focuses on actual product features rather than meta-content.

**Status**: ✅ Complete and tested
**Build Status**: ✅ All TypeScript errors resolved
**Test Coverage**: ✅ Verified with Flexprice and Resend


## Production Deployment Fix (Feb 18, 2026)

### Issue
The deep crawl implementation worked perfectly in local development but failed in production (Vercel) with:
```
Error: Could not find Chrome (ver. 127.0.6533.88)
```

### Root Cause
- Used regular `puppeteer` package which bundles Chrome (~300MB)
- Vercel's serverless environment doesn't support large Chrome binaries
- Postinstall script couldn't install Chrome in serverless environment

### Solution
Replaced `puppeteer` with serverless-compatible solution:

**Dependencies:**
- `puppeteer` → `puppeteer-core` (no bundled Chrome)
- Added `@sparticuz/chromium` (serverless-optimized Chrome)

**Implementation:**
- Added environment detection (production vs development)
- Production: Uses `@sparticuz/chromium` for serverless Chrome
- Development: Uses local Chrome installation
- Removed postinstall script

**Files Changed:**
- `packages/doc-parser/package.json` - Updated dependencies
- `packages/doc-parser/fetcher.ts` - Added environment detection
- `package.json` - Removed postinstall script

### Result
✅ Deep crawl now works in production (Vercel)
✅ Map generation succeeds with 30-35 nodes
✅ No Chrome installation errors
✅ Serverless-compatible and optimized

See `SERVERLESS_CHROME_FIX.md` for detailed documentation.
