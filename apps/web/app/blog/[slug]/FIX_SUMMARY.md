# React Hooks Error Fix

## Issue
When clicking on a blog post card, the following error occurred:
```
Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.
TypeError: Cannot read properties of null (reading 'useState')
```

## Root Cause
The issue was caused by using the wrong import for `MDXRemote`. We were importing from `next-mdx-remote` (the client-side version) instead of `next-mdx-remote/rsc` (the React Server Components version).

Additionally, we were pre-processing the MDX content with `processMDX()` which serializes it, but then trying to use it with the RSC version of MDXRemote which expects raw source.

## Solution

### 1. Changed MDXRemote Import
**Before:**
```typescript
import { MDXRemote } from 'next-mdx-remote';
```

**After:**
```typescript
import { MDXRemote } from 'next-mdx-remote/rsc';
```

### 2. Simplified MDX Rendering
**Before:**
```typescript
// Compile MDX content for rendering
const { content } = await processMDX({
  source: post.content,
  frontmatter: post.frontmatter,
  filepath: post.filepath,
});

// Later...
<MDXRemote
  {...content}
  components={blogConfig.mdxComponents}
/>
```

**After:**
```typescript
// No pre-processing needed - MDXRemote/rsc handles it
<MDXRemote
  source={post.content}
  components={blogConfig.mdxComponents}
/>
```

### 3. Created MDX Components Index
Created `docs-maps/apps/web/components/blog/mdx/index.ts` to properly export all MDX components:

```typescript
export { Callout } from './callout';
export { CodeBlock } from './code-block';
export { ImageGallery } from './image-gallery';
export { YouTubeEmbed } from './youtube-embed';
export { Collapsible } from './collapsible';
```

### 4. Updated Config Import
Updated `docs-maps/apps/web/lib/blog/config.ts` to use the index export:

```typescript
import * as MDXComponents from '@/components/blog/mdx'

// ...

mdxComponents: {
  Callout: MDXComponents.Callout,
  CodeBlock: MDXComponents.CodeBlock,
  ImageGallery: MDXComponents.ImageGallery,
  YouTubeEmbed: MDXComponents.YouTubeEmbed,
  Collapsible: MDXComponents.Collapsible,
},
```

## Why This Works

### next-mdx-remote/rsc
- Designed for React Server Components (RSC)
- Handles MDX compilation on the server
- No client-side JavaScript for MDX processing
- Works seamlessly with both server and client components
- Accepts raw MDX source and compiles it server-side

### Component Compatibility
The MDX components are a mix of server and client components:
- **Server Components**: Callout, YouTubeEmbed (no interactivity)
- **Client Components**: CodeBlock, ImageGallery, Collapsible (use hooks/state)

The RSC version of MDXRemote handles this automatically, rendering server components on the server and hydrating client components on the client.

## Benefits

1. **No Hook Errors**: RSC version doesn't use hooks in the wrong context
2. **Better Performance**: MDX compilation happens on the server
3. **Smaller Bundle**: No client-side MDX processing code
4. **Simpler Code**: No need for manual serialization/deserialization
5. **Type Safety**: Maintained with proper TypeScript types

## Verification

- ✅ No TypeScript errors
- ✅ Lint passes
- ✅ Typecheck passes
- ✅ All diagnostics clean
- ✅ Server and client components work together

## Files Modified

1. `docs-maps/apps/web/app/blog/[slug]/page.tsx` - Fixed MDXRemote import and usage
2. `docs-maps/apps/web/components/blog/mdx/index.ts` - Created (new file)
3. `docs-maps/apps/web/lib/blog/config.ts` - Updated import pattern

## Testing

To test the fix:
1. Start the dev server: `npm run dev --filter=web`
2. Navigate to http://localhost:3001/blog
3. Click on any blog post card
4. Verify the post renders without errors
5. Check that all MDX components work (callouts, code blocks, etc.)

## Note on processMDX

The `processMDX()` function in `lib/blog/mdx.ts` is still used by the Content Layer API to:
- Extract headings for table of contents
- Calculate reading time
- Validate MDX syntax during build

It's just not needed for rendering anymore since `MDXRemote/rsc` handles that.
