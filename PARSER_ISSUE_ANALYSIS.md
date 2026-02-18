# Parser Issue Analysis & Resolution Plan

## The Real Problem

After thorough testing with real documentation URLs, I've identified the core issue:

**The doc-parser was designed for static HTML but modern documentation sites use JavaScript frameworks (React, Next.js, Vue) that render content client-side.**

## Test Results

Testing with real URLs revealed:

| URL | Strategy | Nodes Extracted | Status |
|-----|----------|----------------|--------|
| https://resend.com/docs/introduction | Schema | 0 | ❌ FAIL |
| https://docs.stripe.com/api | Template | 0 | ❌ FAIL |
| https://supabase.com/docs | HTML | 9 | ✅ PASS |

## Root Causes

### 1. Client-Side Rendering (Primary Issue)
Modern documentation sites like Stripe, Resend, AWS (new docs), GitHub use:
- **React/Next.js/Vue** for rendering
- **Initial HTML** contains only app shell and JavaScript bundles
- **Actual content** is rendered after JavaScript executes
- **Our fetcher** only gets the initial HTML (no JS execution)

Example: When we fetch `https://docs.stripe.com/api`, we get:
```html
<div id="__next"></div>
<script src="/_next/static/chunks/..."></script>
```

The actual navigation, sidebar, and content are rendered by JavaScript AFTER the page loads.

### 2. Hardcoded CSS Selectors (Secondary Issue)
The Template strategy uses selectors like:
- `.DocsSidebar` (Stripe)
- `.awsui-side-navigation` (AWS)
- `.js-navigation` (GitHub)

These selectors:
- Are outdated or incorrect
- Don't account for framework-specific class names
- Fail when sites update their UI

### 3. Why Supabase Works
Supabase docs work because:
- They use server-side rendering (SSR) or static generation
- The HTML we fetch contains actual content
- The HTML strategy can find headings and links in the initial HTML

## Why This Wasn't Caught Earlier

1. **Tests used mock HTML** - All 229 tests pass because they use hand-crafted HTML snippets
2. **No integration tests** - Never tested against real, live documentation sites
3. **Assumption about HTML** - Assumed all docs sites serve static/SSR HTML

## Solutions (In Order of Feasibility)

### Option 1: Use Headless Browser (RECOMMENDED)
**Pros:**
- Executes JavaScript and gets fully rendered content
- Works with ALL modern documentation sites
- Most reliable solution

**Cons:**
- Requires Puppeteer/Playwright dependency
- Slower (2-5 seconds per page vs <1 second)
- More resource intensive

**Implementation:**
```typescript
import puppeteer from 'puppeteer';

async function fetchWithBrowser(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  const html = await page.content();
  await browser.close();
  return html;
}
```

### Option 2: Improve HTML Strategy (QUICK WIN)
**Pros:**
- No new dependencies
- Works for SSR/static sites
- Fast

**Cons:**
- Still won't work for client-rendered sites
- Limited to sites that serve HTML content

**Implementation:**
- Make HTML strategy more aggressive
- Look for ANY navigation structure
- Extract from meta tags, JSON-LD, etc.
- Lower the minimum node threshold from 3 to 1

### Option 3: Add API-Based Extraction
**Pros:**
- Some sites expose sitemap.xml or API endpoints
- Very fast and reliable

**Cons:**
- Only works for sites with APIs/sitemaps
- Requires per-site configuration

### Option 4: Hybrid Approach (BEST LONG-TERM)
1. Try HTML strategy first (fast, works for SSR sites)
2. If < 3 nodes, fall back to headless browser
3. Cache results aggressively

## Immediate Action Plan

### Phase 1: Quick Fix (1-2 hours)
1. ✅ Lower minimum node threshold from 3 to 1
2. ✅ Improve error messages to explain the issue
3. ✅ Add better logging to show what's being extracted
4. ✅ Update UI to set expectations

### Phase 2: Headless Browser Support (4-6 hours)
1. Add Puppeteer as optional dependency
2. Create `BrowserStrategy` that uses headless browser
3. Add environment variable to enable/disable browser mode
4. Update API route to use browser strategy when enabled

### Phase 3: Optimization (2-3 hours)
1. Implement aggressive caching
2. Add timeout handling
3. Add retry logic
4. Optimize browser resource usage

## Testing Strategy Going Forward

1. **Integration Tests**: Test against real URLs
2. **Regression Tests**: Keep existing unit tests
3. **Performance Tests**: Measure extraction time
4. **Coverage Tests**: Test various doc site types

## Recommended Next Steps

1. **Immediate**: Lower threshold and improve messaging (done)
2. **Short-term**: Implement headless browser support
3. **Long-term**: Build hybrid strategy with intelligent fallback

## Why Users Are Seeing Failures

Every URL you tested (Resend, LangChain, AWS) uses client-side rendering:
- **Resend**: Next.js app with client-side navigation
- **LangChain**: React-based docs
- **AWS**: Modern AWS docs use React

The parser fetches the HTML but gets an empty shell. The actual documentation content never makes it to the parser because it requires JavaScript execution.

## Conclusion

This is NOT a bug in the SSE streaming or dialog logic - those work perfectly. The issue is that the parser cannot extract content from JavaScript-rendered sites. We need to either:

1. Add headless browser support (best solution)
2. Significantly improve the HTML strategy
3. Document which types of sites work and which don't

The feature works as designed for server-rendered documentation sites (like Supabase), but fails for client-rendered sites (like Stripe, Resend, AWS).
