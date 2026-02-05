# DocMaps Design System

A production-grade, dark-first design system with golden accents for premium, technical UI.

## Overview

This design system provides:
- **Centralized theme tokens** (colors, typography, spacing, shadows)
- **Reusable components** (Button, Card, Badge, etc.)
- **Consistent styling** across all apps
- **Extensibility** for future themes and variations

## Architecture

### Theme Tokens (`theme/tokens.ts`)

All design decisions are centralized in theme tokens:

```typescript
import { themeTokens } from '@docmaps/ui/theme';

// Access colors
themeTokens.colors.primary[600]      // #2563eb
themeTokens.colors.accent[500]       // #f59e0b (golden)
themeTokens.colors.neutral[900]      // #111827 (dark)

// Access typography
themeTokens.typography.fontSize.lg   // 1.125rem
themeTokens.typography.fontWeight.semibold // 600

// Access spacing
themeTokens.spacing[4]               // 1rem
themeTokens.spacing[8]               // 2rem
```

### Tailwind Configuration (`theme/tailwind-config.ts`)

Extends Tailwind with theme tokens:

```typescript
// In your tailwind.config.ts
import { tailwindThemeExtension } from '@docmaps/ui/theme';

export default {
  theme: {
    extend: tailwindThemeExtension,
  },
};
```

### Component Utilities (`theme/component-utils.ts`)

Reusable Tailwind class combinations:

```typescript
import { componentUtils, combineClasses } from '@docmaps/ui/theme';

// Use predefined utilities
const buttonClasses = componentUtils.button.base;
const cardClasses = componentUtils.card.base;

// Combine multiple utilities
const customClasses = combineClasses(
  componentUtils.button.base,
  componentUtils.button.size.md,
  componentUtils.button.variant.primary
);
```

## Color Palette

### Primary (Blue)
- Used for main actions, links, and primary UI elements
- `primary-600` (#2563eb) is the main brand color
- `primary-700` (#1d4ed8) for hover/active states

### Accent (Golden)
- Used sparingly for emphasis and premium feel
- `accent-500` (#f59e0b) is the main accent
- Use for highlights, focus states, key borders
- **Never** use as background color

### Neutral (Grays)
- `neutral-900` (#111827) for text on light backgrounds
- `neutral-600` (#4b5563) for secondary text
- `neutral-200` (#e5e7eb) for borders
- `neutral-50` (#f9fafb) for subtle backgrounds

### Semantic Colors
- **Success**: `success-600` (#16a34a) for confirmations
- **Warning**: `warning-500` (#eab308) for cautions
- **Error**: `error-600` (#dc2626) for errors
- **Info**: `info-600` (#0284c7) for information

## Components

### Button

```typescript
import { Button } from '@docmaps/ui';

// Variants: primary, secondary, accent, ghost, danger, success
// Sizes: xs, sm, md, lg, xl

<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="accent" icon={<Plus />} iconPosition="left">
  Add Item
</Button>

<Button variant="ghost" isLoading>
  Loading...
</Button>
```

### Card

```typescript
import { Card, CardHeader, CardBody, CardFooter } from '@docmaps/ui';

<Card elevated interactive>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    Content goes here
  </CardBody>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Badge

```typescript
import { Badge } from '@docmaps/ui';

// Variants: primary, accent, success, warning, error, neutral

<Badge variant="primary" dot>
  Active
</Badge>

<Badge variant="accent" icon={<Star />}>
  Featured
</Badge>
```

## Typography

### Heading Hierarchy

```typescript
// Use semantic HTML with utility classes
<h1 className={componentUtils.text.heading.h1}>Main Title</h1>
<h2 className={componentUtils.text.heading.h2}>Section Title</h2>
<h3 className={componentUtils.text.heading.h3}>Subsection</h3>
```

### Body Text

```typescript
// Large body text
<p className={componentUtils.text.body.lg}>Large paragraph</p>

// Standard body text
<p className={componentUtils.text.body.base}>Standard paragraph</p>

// Small body text
<p className={componentUtils.text.body.sm}>Small paragraph</p>

// Muted text
<p className={componentUtils.text.muted}>Muted text</p>
```

## Spacing

Use the spacing scale consistently:

```
0.5 (2px)   - Minimal spacing
1 (4px)     - Tight spacing
2 (8px)     - Compact spacing
3 (12px)    - Standard spacing
4 (16px)    - Default spacing
6 (24px)    - Generous spacing
8 (32px)    - Large spacing
```

## Border Radius

- `rounded-lg` (1rem) - Default for most components
- `rounded-xl` (1.25rem) - Larger components, cards
- `rounded-2xl` (1.5rem) - Modals, large panels
- `rounded-full` - Badges, pills

## Shadows

- `shadow-sm` - Subtle elevation
- `shadow-base` - Default elevation
- `shadow-md` - Medium elevation
- `shadow-lg` - Large elevation
- `shadow-xl` - Extra large elevation

## Best Practices

### ✅ DO

- Use theme tokens for all colors, spacing, and typography
- Create reusable components instead of one-off styles
- Use semantic color names (primary, accent, success, error)
- Combine utilities with `combineClasses()` for complex styles
- Keep components focused and single-purpose
- Document component props and usage

### ❌ DON'T

- Hardcode colors (use theme tokens instead)
- Use arbitrary Tailwind values (`text-[#abc123]`)
- Create duplicate component styles
- Use golden accent as background color
- Mix styling approaches (inline + Tailwind + CSS)
- Create components without props for customization

## Extending the Design System

### Adding a New Color

1. Add to `theme/tokens.ts`:
```typescript
colors: {
  myColor: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ... rest of scale
    600: '#0284c7',
  }
}
```

2. Update `theme/tailwind-config.ts` to expose it

3. Use in components:
```typescript
className="text-myColor-600 bg-myColor-50"
```

### Adding a New Component

1. Create component file in `packages/ui/components/`
2. Use `componentUtils` for consistent styling
3. Export from `packages/ui/index.tsx`
4. Document in this file

### Creating a Light Theme

1. Create `theme/tokens-light.ts` with light color values
2. Create `theme/tailwind-config-light.ts`
3. Add theme switcher logic to app layout
4. Use CSS variables or Tailwind's `dark:` prefix

## Migration Guide

### From Old Styling to Design System

**Before:**
```typescript
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  Click
</button>
```

**After:**
```typescript
import { Button } from '@docmaps/ui';

<Button variant="primary" size="md">
  Click
</Button>
```

### Updating Existing Components

1. Replace hardcoded colors with theme tokens
2. Extract repeated class combinations into utilities
3. Use component utilities for consistency
4. Test for visual regressions

## Resources

- **Tokens**: `packages/ui/theme/tokens.ts`
- **Utilities**: `packages/ui/theme/component-utils.ts`
- **Tailwind Config**: `packages/ui/theme/tailwind-config.ts`
- **Components**: `packages/ui/components/`

## Support

For questions or suggestions about the design system, refer to:
- Component prop documentation
- Existing component implementations
- Theme token definitions
