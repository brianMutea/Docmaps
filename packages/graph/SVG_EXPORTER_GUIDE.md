# SVG Exporter Redesign - Usage Guide

## Overview

The redesigned SVG exporter provides a production-grade, deterministic SVG export system for DocMaps. It uses a clean architecture that separates layout computation from SVG serialization, ensuring consistent, high-quality output.

## Architecture

```
React Flow Data → Layout Engine → Render Model → SVG Serializer → SVG File
```

### Components

1. **Layout Engine** (`layout-engine.ts`): Converts React Flow data to absolute coordinates
2. **Theme Resolver** (`theme-resolver.ts`): Maps theme tokens to concrete values
3. **Text Measurer** (`text-measurer.ts`): Provides accurate text measurements
4. **SVG Serializer** (`svg-serializer.ts`): Converts render model to SVG markup
5. **Integration** (`export/svg-redesign.ts`): Ties everything together

## Basic Usage

### Simple Export

```typescript
import { exportToSVGRedesign } from '@docmaps/graph';

// In your React component
const handleExport = () => {
  exportToSVGRedesign(nodes, edges, {
    title: 'My Documentation Map',
  });
};
```

### With Options

```typescript
exportToSVGRedesign(nodes, edges, {
  title: 'My Documentation Map',
  mode: 'editable',           // or 'print-safe'
  backgroundColor: '#ffffff',
  padding: 40,
  embedFonts: false,
  includeMetadata: true,
});
```

### Using Presets

```typescript
import { exportWithPreset } from '@docmaps/graph';

// Export with web preset
exportWithPreset(nodes, edges, 'My Map', 'web');

// Export with print preset
exportWithPreset(nodes, edges, 'My Map', 'print');

// Export with presentation preset
exportWithPreset(nodes, edges, 'My Map', 'presentation');
```

## Export Options

### `title` (required)
- Type: `string`
- The title for the exported SVG
- Used in metadata and filename

### `mode` (optional)
- Type: `'editable' | 'print-safe'`
- Default: `'editable'`
- **editable**: Text as SVG text elements (editable in design tools)
- **print-safe**: Text converted to paths (universal compatibility)

### `backgroundColor` (optional)
- Type: `string`
- Default: `'#ffffff'`
- Background color for the SVG

### `padding` (optional)
- Type: `number`
- Default: `40`
- Padding around the diagram in pixels

### `embedFonts` (optional)
- Type: `boolean`
- Default: `false`
- Whether to embed fonts in the SVG (experimental)

### `includeMetadata` (optional)
- Type: `boolean`
- Default: `true`
- Whether to include title and description metadata

### `viewport` (optional)
- Type: `{ x: number; y: number; zoom: number }`
- Default: Calculated from nodes
- Viewport transformation to apply

## Export Presets

### Default
```typescript
{
  mode: 'editable',
  padding: 40,
  embedFonts: false,
  includeMetadata: true,
}
```
Balanced for general use.

### Web
```typescript
{
  mode: 'editable',
  padding: 20,
  embedFonts: false,
  includeMetadata: false,
}
```
Optimized for web display with minimal padding.

### Print
```typescript
{
  mode: 'print-safe',
  padding: 60,
  embedFonts: true,
  includeMetadata: true,
}
```
Optimized for printing and external tools like Illustrator.

### Presentation
```typescript
{
  mode: 'editable',
  padding: 80,
  embedFonts: false,
  includeMetadata: false,
  backgroundColor: 'transparent',
}
```
Optimized for slides with transparent background.

## Integration with Existing Code

### Replacing Old Exporter

**Before:**
```typescript
import { exportToSVG } from '@docmaps/graph';

exportToSVG(nodes, edges, {
  title: map.title,
  reactFlowInstance: reactFlowInstance,
});
```

**After:**
```typescript
import { exportToSVGRedesign } from '@docmaps/graph';

exportToSVGRedesign(nodes, edges, {
  title: map.title,
});
```

### Side-by-Side Comparison

You can run both exporters side-by-side during migration:

```typescript
import { exportToSVG, exportToSVGRedesign } from '@docmaps/graph';

const handleExportOld = () => {
  exportToSVG(nodes, edges, { title: 'Old Export' });
};

const handleExportNew = () => {
  exportToSVGRedesign(nodes, edges, { title: 'New Export' });
};
```

## Diagnostics

### Validate Export System

```typescript
import { validateExportSystem } from '@docmaps/graph';

const issues = validateExportSystem();
if (issues.length > 0) {
  console.warn('Export system issues:', issues);
}
```

### Get Diagnostics

```typescript
import { getExportDiagnostics } from '@docmaps/graph';

const diagnostics = getExportDiagnostics();
console.log('Canvas available:', diagnostics.canvasAvailable);
console.log('Text measurement mode:', diagnostics.textMeasurementMode);
console.log('Components initialized:', diagnostics.componentsInitialized);
```

## Advanced Usage

### Custom Theme

```typescript
import { createThemeResolver, createTextMeasurer, createLayoutEngine } from '@docmaps/graph';
import { DocMapsSVGSerializer } from '@docmaps/graph';

// Create custom theme
const customTheme = {
  colors: {
    product: '#ff0000',
    feature: '#00ff00',
    // ... other colors
  },
  // ... other theme properties
};

const themeResolver = createThemeResolver(customTheme);
const textMeasurer = createTextMeasurer();
const layoutEngine = createLayoutEngine(themeResolver, textMeasurer);
const serializer = new DocMapsSVGSerializer();

// Use custom components
const renderModel = layoutEngine.computeLayout(nodes, edges, viewport, themeContext);
const svgString = serializer.serialize(renderModel, options);
```

### Programmatic SVG Generation

```typescript
import { createLayoutEngine, createThemeResolver, createTextMeasurer } from '@docmaps/graph';
import { DocMapsSVGSerializer } from '@docmaps/graph';

// Create components
const themeResolver = createThemeResolver();
const textMeasurer = createTextMeasurer();
const layoutEngine = createLayoutEngine(themeResolver, textMeasurer);
const serializer = new DocMapsSVGSerializer();

// Compute layout
const renderModel = layoutEngine.computeLayout(
  nodes,
  edges,
  { x: 0, y: 0, zoom: 1 },
  themeContext
);

// Serialize to SVG
const svgString = serializer.serialize(renderModel, {
  mode: 'editable',
  padding: 40,
});

// Use SVG string (e.g., send to server, display in iframe, etc.)
console.log(svgString);
```

## Benefits Over Old Exporter

### 1. Deterministic Output
- Same input always produces identical output
- Reliable for testing and caching
- No dependency on DOM state

### 2. Clean Architecture
- Separation of concerns
- Easy to test and maintain
- Extensible for future formats (PDF, PNG)

### 3. Better Performance
- Efficient string building
- No DOM manipulation
- Optimized for large graphs

### 4. Improved Quality
- Accurate text measurement
- Proper theme resolution
- Consistent styling

### 5. Future-Proof
- Easy to add new node types
- Support for new export formats
- Maintainable codebase

## Troubleshooting

### Text Measurement Issues

If text appears incorrectly sized:
1. Check that canvas is available in your environment
2. Verify font families are correctly specified
3. Use diagnostics to check text measurement mode

### Missing Nodes or Edges

If elements are missing from export:
1. Verify all nodes have valid positions
2. Check that edges reference existing nodes
3. Ensure node types are recognized

### Styling Issues

If colors or styles are incorrect:
1. Check theme resolver configuration
2. Verify custom colors are valid hex values
3. Review node data for color overrides

## Migration Checklist

- [ ] Import new exporter: `import { exportToSVGRedesign } from '@docmaps/graph'`
- [ ] Update export function calls
- [ ] Remove `reactFlowInstance` parameter (no longer needed)
- [ ] Test export with sample data
- [ ] Verify SVG output in target applications (Figma, Illustrator, browsers)
- [ ] Update any automated tests
- [ ] Remove old exporter imports once migration is complete

## Support

For issues or questions:
1. Check diagnostics: `getExportDiagnostics()`
2. Validate system: `validateExportSystem()`
3. Review this guide
4. Check implementation files for detailed documentation
