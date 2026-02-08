# Blog Components

This directory contains all blog-related UI components for the DocMaps blog system.

## Components

### PostCard

A card component for displaying blog post previews in lists and grids.

**Features:**
- Displays post title, excerpt, date, author, and tags
- Shows featured image if available (with Next.js Image optimization)
- Shows reading time indicator
- Links to full post page
- Hover effects matching DocMaps design system
- Optional featured badge
- Responsive layout

**Usage:**

```tsx
import { PostCard } from '@/components/blog';
import { getAllPosts } from '@/lib/blog/content';

export default async function BlogPage() {
  const posts = await getAllPosts();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
```

**With featured flag:**

```tsx
<PostCard post={featuredPost} featured={true} />
```

**Props:**

- `post` (required): Post object from the Content Layer API
- `featured` (optional): Boolean to display featured badge (default: false)

### PostNavigation

A navigation component for displaying previous and next post links.

**Features:**
- Previous and next post links with titles
- Handles first/last post edge cases (no previous/next)
- Hover effects matching DocMaps design system
- Responsive layout
- Directional arrows for visual clarity
- Returns null when no navigation links are available

**Usage:**

```tsx
import { PostNavigation } from '@/components/blog';
import { getAllPosts, getPostBySlug } from '@/lib/blog/content';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const allPosts = await getAllPosts();
  
  // Find adjacent posts in chronological order
  const currentIndex = allPosts.findIndex(p => p.slug === params.slug);
  const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  
  return (
    <article>
      {/* Post content */}
      <PostNavigation previousPost={previousPost} nextPost={nextPost} />
    </article>
  );
}
```

**Props:**

- `previousPost` (optional): Previous Post object or null
- `nextPost` (optional): Next Post object or null

**Edge Cases:**
- First post: Only shows next post link
- Last post: Only shows previous post link
- Single post: Renders nothing (returns null)

### TableOfContents

A navigable table of contents component for blog posts.

**Features:**
- Nested list based on heading levels (h2-h6)
- Smooth scroll to anchors on click
- Highlights current section based on scroll position
- Responsive design matching DocMaps style
- Sticky positioning for easy navigation
- Filters out h1 headings (post title)

**Usage:**

```tsx
import { TableOfContents } from '@/components/blog';
import { getPostBySlug } from '@/lib/blog/content';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <article className="lg:col-span-3">
        {/* Post content */}
      </article>
      <aside className="lg:col-span-1">
        <TableOfContents headings={post.headings} />
      </aside>
    </div>
  );
}
```

**Props:**

- `headings` (required): Array of Heading objects from the Content Layer API

## Design System

All components follow the DocMaps design system:
- Tailwind CSS for styling
- Lucide React for icons
- date-fns for date formatting
- Next.js Image for optimized images
- Consistent hover effects and transitions
- Responsive breakpoints

## Adding New Components

When adding new blog components:

1. Create the component file in this directory
2. Export it from `index.ts`
3. Follow the existing naming conventions (PascalCase)
4. Use TypeScript with proper types
5. Match the DocMaps design system
6. Add documentation to this README
