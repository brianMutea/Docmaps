# Logo Configuration Guide

This guide explains how to set up a custom logo for your DocMaps application.

## Quick Setup

To use a custom logo image/SVG across the entire application:

### Step 1: Add Your Logo Files

Place your logo file in the `public` folder of **both** apps:

```
docs-maps/apps/web/public/logo.svg
docs-maps/apps/editor/public/logo.svg
```

> **Note:** Both apps need the logo file because they run independently. Make sure to use the same filename in both locations.

### Step 2: Update the Configuration

Edit `docs-maps/packages/config/logo.ts`:

```typescript
export const LOGO_IMAGE_PATH: string | null = '/logo.svg'; // Your logo path
export const LOGO_ALT_TEXT = 'Your Company Logo';
```

### Step 3: Done!

That's it! Your logo will now appear everywhere in the application:
- Web app navbar
- Editor navbar
- Sign-in page
- Sign-up page
- 404 pages
- Loading states
- Mobile warning
- And anywhere else the Logo component is used

## Supported Formats

- **SVG** (recommended for best quality and small file size)
- **PNG** (with transparent background recommended)
- **JPG/JPEG** (not recommended due to lack of transparency)
- **WebP** (modern format with good compression)

## Logo Sizing

The Logo component automatically handles sizing based on context:
- `sm`: 24px height (h-6)
- `md`: 32px height (h-8) - default
- `lg`: 40px height (h-10)

Your logo will maintain its aspect ratio and scale appropriately.

## Reverting to Text Logo

To use the default "DocMaps" text logo, simply set:

```typescript
export const LOGO_IMAGE_PATH: string | null = null;
```

## Best Practices

1. **Use SVG when possible** - Scales perfectly at any size
2. **Keep file size small** - Optimize your images (< 50KB recommended)
3. **Use transparent backgrounds** - Works better with different page backgrounds
4. **Test on both apps** - Check web and editor apps to ensure consistency
5. **Consider dark mode** - If you add dark mode later, ensure logo works on both backgrounds

## Troubleshooting

### Logo not showing up?

1. Check that the file exists in both `apps/web/public/` and `apps/editor/public/`
2. Verify the path in `logo.ts` matches your filename (including leading `/`)
3. Clear your browser cache and restart the dev server
4. Check browser console for any image loading errors

### Logo looks stretched or distorted?

The component uses `object-contain` which should prevent distortion. If you're still seeing issues:
1. Check your source image aspect ratio
2. Ensure the image has proper dimensions (recommended: 200x200px or similar square ratio)
3. Try using SVG format for better scaling

### Need different logos for web vs editor?

Currently, the system uses the same logo for both apps. If you need different logos:
1. Use different filenames (e.g., `/web-logo.svg` and `/editor-logo.svg`)
2. Create separate config files or add conditional logic based on the app context

## Example Configuration

```typescript
// For a custom logo
export const LOGO_IMAGE_PATH: string | null = '/my-company-logo.svg';
export const LOGO_ALT_TEXT = 'My Company Documentation Maps';

// For default text logo
export const LOGO_IMAGE_PATH: string | null = null;
export const LOGO_ALT_TEXT = 'DocMaps Logo';
```
