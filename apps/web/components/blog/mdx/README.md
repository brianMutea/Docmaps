# Custom MDX Components

This directory contains custom React components that can be used within MDX blog posts to create rich, interactive content.

## Available Components

### Callout

Display important information with visual emphasis.

**Variants:** `info`, `warning`, `success`, `error`

```mdx
<Callout variant="info" title="Did you know?">
  This is an informational callout with helpful context.
</Callout>

<Callout variant="warning">
  Warning callouts don't require a title.
</Callout>
```

### CodeBlock

Enhanced code blocks with filename tabs and copy-to-clipboard functionality.

```mdx
<CodeBlock filename="example.ts">
  const greeting = "Hello, World!";
  console.log(greeting);
</CodeBlock>
```

### ImageGallery

Display multiple images in a responsive grid with lightbox functionality.

```mdx
<ImageGallery
  columns={3}
  images={[
    { src: "/images/photo1.jpg", alt: "Description 1", caption: "Optional caption" },
    { src: "/images/photo2.jpg", alt: "Description 2" },
    { src: "/images/photo3.jpg", alt: "Description 3" }
  ]}
/>
```

### YouTubeEmbed

Embed YouTube videos with responsive sizing and lazy loading.

```mdx
<YouTubeEmbed
  videoId="dQw4w9WgXcQ"
  title="Video title for accessibility"
/>
```

### Collapsible

Create expandable/collapsible sections for optional content.

```mdx
<Collapsible title="Click to expand" defaultOpen={false}>
  This content is hidden by default and can be expanded by clicking the title.
</Collapsible>
```

## Usage in MDX Files

These components are automatically available in all MDX blog posts. Simply use them as shown in the examples above.

## Styling

All components use Tailwind CSS classes that match the DocMaps design system, with support for both light and dark modes.
