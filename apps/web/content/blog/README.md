# DocMaps Blog Content Guide

Welcome to the DocMaps blog! This guide will help you create and publish blog posts using our MDX-based blog system.

## Quick Start

1. Copy the template: `cp ../../templates/blog-post-template.mdx content/blog/2024/my-new-post.mdx`
2. Edit the frontmatter with your post details
3. Write your content using Markdown and MDX components
4. Test locally: `npm run dev` and visit `/blog`
5. Submit a pull request

## Directory Structure

```
content/blog/
├── README.md (this file)
├── CONTRIBUTING.md (contribution guidelines)
├── 2024/
│   ├── welcome-to-docmaps.mdx
│   ├── visual-documentation-guide.mdx
│   └── images/
│       └── hero.png
└── 2025/
    └── new-features.mdx
```

### Organization

- **Year-based folders**: Organize posts by year (e.g., `2024/`, `2025/`)
- **Asset co-location**: Store images and other assets near your posts
- **Nested directories**: You can create subdirectories for better organization

## Frontmatter Fields

Frontmatter is the YAML metadata at the top of your MDX file, enclosed in `---`.

### Required Fields

```yaml
title: "Your Post Title"
date: "2024-01-15T10:00:00Z"  # ISO 8601 format
author:
  name: "Author Name"
  # Optional: avatar, bio, social links
excerpt: "Brief summary of your post (1-2 sentences)"
tags:
  - "tag1"
  - "tag2"
categories:
  - "category1"
seo:
  # Optional: title, description, keywords
```

#### Field Descriptions

- **title**: The main heading of your post (appears in listings and page title)
- **date**: Publication date in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- **author**: Author information
  - `name`: Author's full name (required)
  - `avatar`: Path to author's profile image (optional)
  - `bio`: Short bio (optional)
  - `social`: Social media handles (optional: twitter, github, linkedin)
- **excerpt**: Short summary for listings and SEO (1-2 sentences)
- **tags**: Array of tags for categorization and filtering
- **categories**: Array of categories for organization
- **seo**: SEO-specific metadata (optional)
  - `title`: Custom SEO title (defaults to post title)
  - `description`: Custom meta description (defaults to excerpt)
  - `keywords`: Array of keywords for SEO

### Optional Fields

```yaml
featuredImage:
  src: "/images/blog/2024/hero.png"
  alt: "Descriptive alt text"
  width: 1200
  height: 630
updatedAt: "2024-01-20T10:00:00Z"
draft: true
customSlug: "custom-url-slug"
showTOC: true
relatedPosts:
  - "slug-of-related-post"
```

#### Optional Field Descriptions

- **featuredImage**: Hero image for the post
  - `src`: Path to image (required if using featuredImage)
  - `alt`: Alt text for accessibility (required if using featuredImage)
  - `width`: Image width in pixels (optional)
  - `height`: Image height in pixels (optional)
- **updatedAt**: Last update date (ISO 8601 format)
- **draft**: Set to `true` to hide from production (shows in development)
- **customSlug**: Override the auto-generated URL slug
- **showTOC**: Show/hide table of contents (default: true)
- **relatedPosts**: Array of slugs for manually curated related posts

## Writing Content

### Markdown Basics

Use standard Markdown syntax:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
`inline code`

- Unordered list
- Another item

1. Ordered list
2. Another item

[Link text](https://example.com)
![Image alt text](/images/example.png)
```

### Code Blocks

Use fenced code blocks with language specification:

````markdown
```typescript
const greeting: string = "Hello, DocMaps!";
console.log(greeting);
```
````

### Custom MDX Components

Our blog system includes several custom components for rich content:

#### Callout

Highlight important information:

```jsx
<Callout variant="info">
This is an informational callout.
</Callout>
```

Variants: `info`, `warning`, `success`, `error`

#### CodeBlock

Enhanced code blocks with filename tabs:

```jsx
<CodeBlock filename="example.ts" language="typescript">
{`const example = "code here";`}
</CodeBlock>
```

#### ImageGallery

Display multiple images in a grid:

```jsx
<ImageGallery
  images={[
    { src: "/images/blog/img1.png", alt: "Description 1" },
    { src: "/images/blog/img2.png", alt: "Description 2" },
  ]}
/>
```

#### YouTubeEmbed

Embed YouTube videos:

```jsx
<YouTubeEmbed videoId="dQw4w9WgXcQ" />
```

#### Collapsible

Create expandable sections:

```jsx
<Collapsible title="Click to expand">
Hidden content goes here.
</Collapsible>
```

## Asset Management

### Images

Store images near your posts for better organization:

```
content/blog/2024/
├── my-post.mdx
└── images/
    ├── hero.png
    └── diagram.png
```

Reference images using relative or absolute paths:

```markdown
![Hero image](./images/hero.png)
![Hero image](/images/blog/2024/hero.png)
```

Images are automatically optimized by Next.js Image component.

### Best Practices

- Use descriptive filenames: `user-authentication-flow.png` not `img1.png`
- Optimize images before uploading (aim for < 500KB)
- Always include alt text for accessibility
- Use modern formats (WebP, AVIF) when possible
- Recommended dimensions for featured images: 1200x630px

## Draft Workflow

### Development Mode

Set `draft: true` in frontmatter to work on posts without publishing:

```yaml
draft: true
```

Draft posts:
- ✅ Visible in development mode (`npm run dev`)
- ❌ Hidden in production builds
- ❌ Excluded from feeds and sitemap

### Publishing

1. Complete your post content
2. Remove `draft: true` or set `draft: false`
3. Ensure the `date` is set correctly
4. Submit a pull request
5. After review and merge, the post will be published

## URL Structure

Posts are accessible at `/blog/[slug]` where the slug is:
1. The `customSlug` from frontmatter (if provided)
2. Auto-generated from the filename (e.g., `my-post.mdx` → `my-post`)

### Slug Best Practices

- Use lowercase letters
- Separate words with hyphens
- Keep it short and descriptive
- Avoid special characters
- Example: `getting-started-with-docmaps`

## Validation

The blog system validates your frontmatter at build time. Common errors:

### Missing Required Fields

```
Error: Invalid frontmatter in 2024/my-post.mdx:
  - title: Title is required
  - date: Date is required
```

**Fix**: Add all required fields to your frontmatter.

### Invalid Date Format

```
Error: Invalid frontmatter in 2024/my-post.mdx:
  - date: Date must be in ISO 8601 format
```

**Fix**: Use ISO 8601 format: `2024-01-15T10:00:00Z`

### Empty Tags or Categories

```
Error: Invalid frontmatter in 2024/my-post.mdx:
  - tags: At least one tag is required
```

**Fix**: Add at least one tag and one category.

### Featured Image Without Alt Text

```
Error: Invalid frontmatter in 2024/my-post.mdx:
  - featuredImage.alt: Image alt text is required
```

**Fix**: Always include alt text for accessibility.

## Testing Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit your post:
   ```
   http://localhost:3001/blog/your-post-slug
   ```

3. Check the blog index:
   ```
   http://localhost:3001/blog
   ```

4. Test tag/category pages:
   ```
   http://localhost:3001/blog/tag/your-tag
   http://localhost:3001/blog/category/your-category
   ```

## SEO Optimization

### Meta Tags

The blog system automatically generates:
- Page title and description
- Open Graph tags for social media
- Twitter Card tags
- JSON-LD structured data
- Canonical URLs

### Best Practices

1. **Title**: Keep under 60 characters
2. **Excerpt**: Keep under 160 characters
3. **Keywords**: Use 3-5 relevant keywords
4. **Featured Image**: Use 1200x630px for optimal social sharing
5. **Headings**: Use proper hierarchy (h1 → h2 → h3)
6. **Internal Links**: Link to related posts and pages

## Performance

### Automatic Optimizations

- Static generation at build time
- Image optimization with Next.js Image
- Lazy loading for below-the-fold content
- Code splitting for blog routes
- RSS/Atom feed caching

### Tips

- Optimize images before uploading
- Use code blocks sparingly
- Avoid embedding large videos directly
- Use YouTube embeds instead of video files

## Troubleshooting

### Post Not Showing Up

1. Check if `draft: true` is set
2. Verify the date is not in the future
3. Check for validation errors in build output
4. Ensure the file has `.mdx` extension

### Images Not Loading

1. Verify the image path is correct
2. Check if the image file exists
3. Ensure the image is in the `public/` directory or co-located with the post
4. Check browser console for errors

### MDX Components Not Working

1. Verify component names are correct (case-sensitive)
2. Check that components are properly imported in `lib/blog/config.ts`
3. Ensure you're using JSX syntax, not Markdown syntax
4. Check for syntax errors in component usage

### Build Errors

1. Run `npm run build` to see detailed errors
2. Check frontmatter validation errors
3. Verify all required fields are present
4. Check for MDX syntax errors

## Getting Help

- Check the [CONTRIBUTING.md](./CONTRIBUTING.md) guide
- Review the [blog post template](../../templates/blog-post-template.mdx)
- Look at existing posts for examples
- Ask questions in pull request comments

## Resources

- [MDX Documentation](https://mdxjs.com/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [ISO 8601 Date Format](https://en.wikipedia.org/wiki/ISO_8601)

---

Happy blogging! 🎉
