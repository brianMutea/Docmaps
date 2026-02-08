# Blog Post Layout Components

This document describes the blog post layout components implemented for the MDX blog system.

## Components

### PostHeader

**File:** `post-header.tsx`

Displays the header section of a blog post with all metadata.

**Features:**
- Post title (h1) for proper heading hierarchy
- Author information with avatar
- Publication date and reading time
- Tags as clickable links to tag filter pages
- Featured image if available
- Author social links (Twitter, GitHub, LinkedIn)
- Responsive design matching DocMaps style

**Props:**
```typescript
interface PostHeaderProps {
  frontmatter: PostFrontmatter;
  readingTime: ReadingTime;
}
```

**Requirements:** 5.7, 6.7

---

### PostLayout

**File:** `post-layout.tsx`

Provides the complete layout structure for blog post pages.

**Features:**
- Semantic HTML structure (article, header, main) for accessibility
- PostHeader component integration
- Optional TableOfContents component (controlled by `frontmatter.showTOC`)
- Main content area for rendered MDX
- PostNavigation component for previous/next links
- RelatedPosts component for similar content
- SocialShare component for sharing on social media
- Proper heading hierarchy (h1 in header, h2-h6 in content)
- Responsive two-column layout (content + TOC on desktop)
- Prose styling for MDX content with Tailwind Typography

**Props:**
```typescript
interface PostLayoutProps {
  post: Post;                    // The current post data
  children: React.ReactNode;     // The compiled MDX content
  previousPost?: Post | null;    // Previous post for navigation
  nextPost?: Post | null;        // Next post for navigation
  relatedPosts?: Post[];         // Related posts array
  postUrl: string;               // Full URL for social sharing
}
```

**Requirements:** 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.7

---

## Usage Example

```tsx
import { PostLayout } from '@/components/blog/post-layout';
import { MDXRemote } from 'next-mdx-remote/rsc';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // Fetch post data
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }

  // Get navigation posts
  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
  const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  // Get related posts
  const relatedPosts = await getRelatedPosts(post, 3);

  // Full URL for social sharing
  const postUrl = `${process.env.NEXT_PUBLIC_WEB_URL}${post.url}`;

  return (
    <PostLayout
      post={post}
      previousPost={previousPost}
      nextPost={nextPost}
      relatedPosts={relatedPosts}
      postUrl={postUrl}
    >
      <MDXRemote source={post.content} />
    </PostLayout>
  );
}
```

---

## Layout Structure

The PostLayout component creates the following HTML structure:

```html
<article>
  <div class="max-w-7xl mx-auto">
    <!-- PostHeader -->
    <header>
      <img /> <!-- Featured image (if available) -->
      <div>Tags</div>
      <h1>Post Title</h1>
      <div>Author, Date, Reading Time</div>
    </header>

    <!-- Content Grid -->
    <div class="grid lg:grid-cols-12">
      <!-- Main Content -->
      <main class="lg:col-span-8">
        <div class="prose">
          {children} <!-- MDX content -->
        </div>
        
        <!-- SocialShare -->
        <div>Share buttons</div>
        
        <!-- PostNavigation -->
        <nav>Previous/Next links</nav>
        
        <!-- RelatedPosts -->
        <section>Related posts grid</section>
      </main>

      <!-- Sidebar (desktop only) -->
      <aside class="lg:col-span-4">
        <!-- TableOfContents -->
        <nav>TOC</nav>
      </aside>
    </div>
  </div>
</article>
```

---

## Accessibility Features

1. **Semantic HTML:** Uses proper `<article>`, `<header>`, `<main>`, `<aside>`, `<nav>`, and `<section>` elements
2. **Heading Hierarchy:** Single h1 in PostHeader, h2-h6 in content
3. **Alt Text:** Required for featured images
4. **ARIA Labels:** Social share buttons have descriptive labels
5. **Keyboard Navigation:** All interactive elements are keyboard accessible
6. **Time Elements:** Dates use semantic `<time>` elements with datetime attributes

---

## Responsive Design

- **Mobile (< 768px):** Single column layout, TOC hidden
- **Tablet (768px - 1024px):** Single column layout, TOC hidden
- **Desktop (> 1024px):** Two-column layout with TOC sidebar (if enabled)

---

## Testing

A test page is available at `/test-post-layout` to verify the components render correctly with mock data.

To test:
1. Start the development server: `npm run dev --filter=web`
2. Navigate to `http://localhost:3001/test-post-layout`
3. Verify all sections render correctly
4. Test responsive behavior by resizing the browser
5. Test TOC navigation by clicking on headings
6. Test social share buttons
7. Test previous/next navigation links

---

## Dependencies

- `next/image` - Image optimization
- `next/link` - Client-side navigation
- `lucide-react` - Icons
- `date-fns` - Date formatting
- Tailwind CSS - Styling
- Tailwind Typography - Prose styling for MDX content

---

## Related Components

- `PostCard` - Used in RelatedPosts section
- `TableOfContents` - Optional sidebar navigation
- `PostNavigation` - Previous/next post links
- `RelatedPosts` - Grid of related posts
- `SocialShare` - Social media share buttons
