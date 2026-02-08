# Blog Theme Fixes - Complete Summary

## Issues Fixed

### 1. Related Posts Cards Layout ✅
**Problem**: Related posts cards appeared narrow and vertical (portrait orientation) instead of wide and horizontal like the blog index cards.

**Root Cause**: The related posts were rendered inside the `<main>` element which was constrained to `lg:col-span-8` (8 out of 12 columns) when the Table of Contents was visible. This made the cards squeeze into a narrow container.

**Solution**: Moved the `<RelatedPosts>` component outside the grid layout so it uses the full width of the article container.

**File Changed**: `docs-maps/apps/web/components/blog/post-layout.tsx`
- Moved `<RelatedPosts>` from inside `<main>` to after the closing `</div>` of the grid
- Now related posts get full width and cards display properly in horizontal layout

### 2. Table of Contents Scroll Navigation ✅
**Problem**: Clicking TOC links didn't scroll to the corresponding heading sections.

**Root Cause**: Slug generation mismatch between:
- `extractHeadings()` function (custom algorithm)
- `rehype-slug` plugin (uses github-slugger)

The TOC was generating different slugs than the actual heading IDs in the DOM.

**Solution**: 
1. Imported `github-slugger` library (already available as transitive dependency)
2. Updated `extractHeadings()` to use the same slug generation algorithm as `rehype-slug`
3. Added `scroll-margin-top: 120px` to heading styles for proper offset

**Files Changed**:
- `docs-maps/apps/web/lib/blog/mdx.ts` - Updated slug generation
- `docs-maps/apps/web/components/blog/table-of-contents.tsx` - Improved scroll offset
- `docs-maps/apps/web/app/globals.css` - Added scroll-margin-top to headings

### 3. Code Syntax Highlighting ✅
**Problem**: Code blocks weren't displaying proper syntax highlighting.

**Root Cause**: The CSS was targeting old highlight.js class names (`.hljs-*`), but `rehype-pretty-code` uses Shiki which generates different markup.

**Solution**: Updated CSS to properly style Shiki-generated code blocks with:
- GitHub dark theme colors
- Proper background and border styling
- Support for highlighted lines and characters
- Correct font family and sizing

**File Changed**: `docs-maps/apps/web/app/globals.css`

## Technical Details

### Related Posts Layout Fix
```tsx
// BEFORE: Inside constrained main element
<main className="lg:col-span-8">
  {/* content */}
  <RelatedPosts posts={relatedPosts} />
</main>

// AFTER: Full width below grid
</div> {/* Close grid */}
<RelatedPosts posts={relatedPosts} />
```

### TOC Slug Generation Fix
```typescript
// BEFORE: Custom slug generation
const slug = text
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .replace(/\s+/g, '-')
  .trim()

// AFTER: Using github-slugger (same as rehype-slug)
import GithubSlugger from 'github-slugger'
const slugger = new GithubSlugger()
const slug = slugger.slug(text)
```

### Code Highlighting CSS
```css
/* Shiki code blocks with GitHub dark theme */
.prose pre {
  background: #0d1117 !important;
  color: #e6edf3;
  border: 1px solid #30363d;
}

/* Support for highlighted lines */
.prose pre code .highlighted {
  background-color: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}
```

### Heading Scroll Offset
```css
.prose h1,
.prose h2,
.prose h3 {
  scroll-margin-top: 120px; /* Offset for navbar */
}
```

## Testing Checklist

### Related Posts Cards
- [ ] Navigate to any blog post with related posts
- [ ] Verify cards are wide and horizontal (landscape orientation)
- [ ] Verify cards match the blog index card design exactly
- [ ] Check responsive behavior on mobile/tablet/desktop

### Table of Contents
- [ ] Navigate to a blog post with multiple headings
- [ ] Click on different TOC links
- [ ] Verify smooth scroll to each heading
- [ ] Verify headings appear below the navbar (not hidden)
- [ ] Verify URL hash updates correctly
- [ ] Verify active TOC item highlights

### Code Syntax Highlighting
- [ ] Navigate to a blog post with code blocks
- [ ] Verify syntax highlighting is visible and colorful
- [ ] Check different languages (JavaScript, TypeScript, etc.)
- [ ] Verify inline code has proper styling
- [ ] Check code block background and borders

## Files Modified

1. **docs-maps/apps/web/components/blog/post-layout.tsx**
   - Moved RelatedPosts outside constrained main element

2. **docs-maps/apps/web/lib/blog/mdx.ts**
   - Added github-slugger import
   - Updated extractHeadings() to use github-slugger

3. **docs-maps/apps/web/components/blog/table-of-contents.tsx**
   - Improved scroll offset calculation

4. **docs-maps/apps/web/app/globals.css**
   - Updated code block styling for Shiki
   - Added scroll-margin-top to headings
   - Removed old highlight.js styles

## Quality Checks

✅ **TypeScript**: `npm run typecheck` - Passed
✅ **ESLint**: `npm run lint` - Passed

## How to Verify

1. Start the dev server:
   ```bash
   npm run dev --filter=web
   ```

2. Navigate to: http://localhost:3001/blog

3. Click on any blog post

4. Test all three fixes:
   - Scroll down to see related posts cards (should be wide/horizontal)
   - Click TOC links (should scroll smoothly to sections)
   - View code blocks (should have syntax highlighting)

## Color Scheme Maintained

- **Background**: `neutral-900` (dark charcoal)
- **Cards**: White for content, `neutral-800` for UI elements
- **Text**: White for headings, `neutral-400` for secondary text
- **Code Blocks**: GitHub dark theme (`#0d1117` background)
- **Accents**: `primary-600` (blue) for links and highlights
- **Borders**: `neutral-700` for subtle separation

## Notes

- All changes maintain the established dark theme consistency
- Related posts now use the same PostCard component as blog index
- TOC navigation works with proper offset for fixed navbar
- Code highlighting uses Shiki (via rehype-pretty-code) with GitHub dark theme
- No breaking changes to existing functionality
