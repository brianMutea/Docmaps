# Design System Quick Start

Get up and running with the DocMaps design system in 5 minutes.

## Installation

The design system is already integrated into both web and editor apps. No additional installation needed.

## Basic Usage

### 1. Using Theme Tokens

```typescript
import { themeTokens } from '@docmaps/ui/theme';

// Colors
const primaryColor = themeTokens.colors.primary[600];      // #2563eb
const accentColor = themeTokens.colors.accent[500];        // #f59e0b
const neutralColor = themeTokens.colors.neutral[900];      // #111827

// Spacing
const padding = themeTokens.spacing[4];                    // 1rem
const margin = themeTokens.spacing[8];                     // 2rem

// Typography
const fontSize = themeTokens.typography.fontSize.lg;       // 1.125rem
const fontWeight = themeTokens.typography.fontWeight.bold; // 700
```

### 2. Using Reusable Components

```typescript
import { Button, Card, Badge } from '@docmaps/ui';

// Button
<Button variant="primary" size="md">
  Click me
</Button>

// Card
<Card elevated>
  <div>Card content</div>
</Card>

// Badge
<Badge variant="accent" dot>
  Featured
</Badge>
```

### 3. Using Component Utilities

```typescript
import { componentUtils } from '@docmaps/ui/theme';

// Button classes
const buttonClass = componentUtils.button.base;
const buttonPrimary = componentUtils.button.variant.primary;

// Card classes
const cardClass = componentUtils.card.base;
const cardHover = componentUtils.card.hover;

// Text classes
const headingClass = componentUtils.text.heading.h2;
const bodyClass = componentUtils.text.body.base;
```

### 4. Combining Utilities

```typescript
import { combineClasses } from '@docmaps/ui/theme';

const customButtonClass = combineClasses(
  componentUtils.button.base,
  componentUtils.button.size.lg,
  componentUtils.button.variant.accent,
  'custom-class'
);

<button className={customButtonClass}>
  Custom Button
</button>
```

## Common Patterns

### Creating a Styled Container

```typescript
import { componentUtils } from '@docmaps/ui/theme';

<div className={componentUtils.card.base}>
  <div className={componentUtils.panel.header}>
    Header
  </div>
  <div className={componentUtils.panel.body}>
    Content
  </div>
</div>
```

### Styling Text

```typescript
import { componentUtils } from '@docmaps/ui/theme';

<h2 className={componentUtils.text.heading.h2}>
  Main Title
</h2>

<p className={componentUtils.text.body.base}>
  Body text
</p>

<p className={componentUtils.text.muted}>
  Muted text
</p>
```

### Using Colors in Tailwind

```typescript
// Primary color
<div className="bg-primary-50 text-primary-600 border border-primary-200">
  Primary content
</div>

// Accent color (use sparingly!)
<div className="text-accent-500 border-b-2 border-accent-500">
  Accent highlight
</div>

// Neutral colors
<div className="bg-neutral-50 text-neutral-900 border border-neutral-200">
  Neutral content
</div>

// Semantic colors
<div className="bg-success-50 text-success-600">
  Success message
</div>
```

## Component Props

### Button

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}
```

### Card

```typescript
interface CardProps {
  elevated?: boolean;      // Add shadow
  interactive?: boolean;   // Add cursor pointer
  hover?: boolean;         // Add hover effects
  children?: React.ReactNode;
}
```

### Badge

```typescript
interface BadgeProps {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  dot?: boolean;           // Show colored dot
  icon?: React.ReactNode;  // Show icon
  children?: React.ReactNode;
}
```

## Color Reference

### Primary (Blue)
```
primary-50:  #eff6ff
primary-100: #dbeafe
primary-200: #bfdbfe
primary-300: #93c5fd
primary-400: #60a5fa
primary-500: #3b82f6
primary-600: #2563eb  ← Main brand color
primary-700: #1d4ed8  ← Hover/active
primary-800: #1e40af
primary-900: #1e3a8a
```

### Accent (Golden)
```
accent-50:  #fffbeb
accent-100: #fef3c7
accent-200: #fde68a
accent-300: #fcd34d
accent-400: #fbbf24
accent-500: #f59e0b  ← Main accent
accent-600: #d97706  ← Hover/active
accent-700: #b45309
accent-800: #92400e
accent-900: #78350f
```

### Neutral (Grays)
```
neutral-50:  #f9fafb  ← Light backgrounds
neutral-100: #f3f4f6
neutral-200: #e5e7eb  ← Borders
neutral-300: #d1d5db
neutral-400: #9ca3af
neutral-500: #6b7280
neutral-600: #4b5563  ← Secondary text
neutral-700: #374151
neutral-800: #1f2937
neutral-900: #111827  ← Main text
```

### Semantic
```
success-600: #16a34a  ← Confirmations
warning-500: #eab308  ← Cautions
error-600:   #dc2626  ← Errors
info-600:    #0284c7  ← Information
```

## Spacing Scale

```
0.5:  2px    (minimal)
1:    4px    (tight)
2:    8px    (compact)
3:    12px   (standard)
4:    16px   (default)
5:    20px   (comfortable)
6:    24px   (generous)
8:    32px   (large)
12:   48px   (extra large)
16:   64px   (huge)
```

## Typography Scale

```
xs:   0.75rem   (12px)
sm:   0.875rem  (14px)
base: 1rem      (16px)
lg:   1.125rem  (18px)
xl:   1.25rem   (20px)
2xl:  1.5rem    (24px)
3xl:  1.875rem  (30px)
4xl:  2.25rem   (36px)
```

## Border Radius

```
rounded-lg:   1rem      (16px)   ← Default
rounded-xl:   1.25rem   (20px)   ← Cards
rounded-2xl:  1.5rem    (24px)   ← Modals
rounded-full: 9999px    (pills)
```

## Shadows

```
shadow-sm:   Subtle elevation
shadow-base: Default elevation
shadow-md:   Medium elevation
shadow-lg:   Large elevation
shadow-xl:   Extra large elevation
```

## Do's and Don'ts

### ✅ DO

```typescript
// Use theme tokens
const color = themeTokens.colors.primary[600];

// Use semantic color names
className="text-primary-600 bg-primary-50"

// Use reusable components
<Button variant="primary">Click</Button>

// Combine utilities
combineClasses(base, size, variant)

// Use component utilities
componentUtils.button.base
```

### ❌ DON'T

```typescript
// Don't hardcode colors
className="text-[#2563eb]"

// Don't use arbitrary values
className="text-[#abc123]"

// Don't duplicate styles
// (create a component instead)

// Don't use golden as background
className="bg-accent-500"  // ❌ Wrong!

// Don't mix styling approaches
className="text-blue-600" // Use primary-600 instead
```

## Troubleshooting

### Colors not showing?
- Make sure Tailwind config imports `tailwindThemeExtension`
- Check that color names use `primary`, `accent`, `neutral` (not `blue`, `yellow`, `gray`)
- Verify the color shade (e.g., `primary-600` not `primary-500`)

### Components not importing?
- Check that you're importing from `@docmaps/ui`
- Verify the component name (Button, Card, Badge)
- Make sure the UI package is in your dependencies

### Styles not applying?
- Check that Tailwind is processing your files
- Verify the class names are correct
- Use browser DevTools to inspect applied styles

## Next Steps

1. **Read the full guide**: `packages/ui/DESIGN_SYSTEM.md`
2. **Explore components**: `packages/ui/components/`
3. **Check token definitions**: `packages/ui/theme/tokens.ts`
4. **See examples**: Look at refactored components in `apps/web/components/`

## Support

For questions or issues:
1. Check `DESIGN_SYSTEM.md` for detailed documentation
2. Review existing component implementations
3. Look at token definitions for available values
4. Check the web app components for usage examples

---

**Happy styling!** 🎨✨
