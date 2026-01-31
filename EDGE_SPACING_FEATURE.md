# Multiple Edge Auto-Spacing Feature

## Overview

DocMaps now supports automatic spacing for multiple edges between the same nodes. When you create multiple connections between two nodes (e.g., hierarchy + dependency + integration), the edges will automatically space themselves to avoid overlap and remain visually distinct.

## How It Works

### Visual Behavior

**Before (overlapping edges):**
```
Node A ========> Node B  (all edges overlap)
```

**After (auto-spaced edges):**
```
Node A ----hierarchy----> Node B
      ----dependency---->
      ----integration--->
```

Each edge is offset perpendicular to the connection line, creating a clean, professional appearance.

### Technical Implementation

1. **Edge Grouping**: Edges are grouped by their source→target node pairs
2. **Offset Calculation**: Each edge in a group receives a perpendicular offset
3. **Centered Distribution**: Edges are centered around the direct path between nodes
4. **Configurable Spacing**: Default 20px spacing between parallel edges
5. **Maximum Limit**: Up to 5 edges are spaced (configurable)

## Configuration

Default settings in `packages/graph/edge-spacing.ts`:

```typescript
{
  baseSpacing: 20,    // Pixels between parallel edges
  maxEdges: 5         // Maximum edges to space
}
```

## Files Modified

### New Files
- `packages/graph/edge-spacing.ts` - Core spacing logic and utilities

### Updated Files

**Editor App:**
- `apps/editor/components/canvas/edges/hierarchy-edge.tsx`
- `apps/editor/components/canvas/edges/dependency-edge.tsx`
- `apps/editor/components/canvas/edges/integration-edge.tsx`
- `apps/editor/components/canvas/edges/extension-edge.tsx`
- `apps/editor/components/canvas/edges/alternative-edge.tsx`

**Web Viewer App:**
- `apps/web/components/edges/hierarchy-edge.tsx`
- `apps/web/components/edges/dependency-edge.tsx`
- `apps/web/components/edges/integration-edge.tsx`
- `apps/web/components/edges/extension-edge.tsx`
- `apps/web/components/edges/alternative-edge.tsx`

**Package Exports:**
- `packages/graph/index.ts` - Added edge-spacing exports

## Key Functions

### `groupEdgesByConnection(edges: Edge[])`
Groups edges by their source→target pairs for spacing calculations.

### `calculateEdgeOffset(edgeId, edgeGroup, config)`
Calculates the perpendicular offset for a specific edge within its group.

### `getEdgeOffset(edgeId, allEdges, config)`
Convenience function to get offset for an edge considering all edges in the graph.

### `applyOffsetToCoordinates(sourceX, sourceY, targetX, targetY, offset)`
Applies the calculated offset to edge coordinates, maintaining perpendicular spacing.

## Usage in Edge Components

Each edge component now:
1. Retrieves all edges from React Flow store using `useStore`
2. Calculates its offset using `getEdgeOffset()`
3. Applies offset to coordinates using `applyOffsetToCoordinates()`
4. Renders with adjusted path

Example:
```typescript
const edges = useStore((state) => state.edges);
const offset = getEdgeOffset(id, edges);
const adjustedCoords = applyOffsetToCoordinates(sourceX, sourceY, targetX, targetY, offset);
```

## Benefits

1. **Visual Clarity**: Multiple relationships between nodes are now clearly visible
2. **Professional Appearance**: Matches industry-standard diagramming tools
3. **Automatic**: No manual adjustment needed by users
4. **Consistent**: Works across all edge types and in both editor and viewer
5. **Performant**: Efficient calculation using React Flow's built-in store

## Edge Cases Handled

- **Single edges**: No offset applied (offset = 0)
- **Bidirectional edges**: A→B and B→A are treated as separate groups
- **Zero-length edges**: Safely handled with length check
- **More than max edges**: Additional edges beyond limit will overlap

## Future Enhancements

Potential improvements for future iterations:
- Bezier curve option instead of smooth step paths
- User-configurable spacing in map settings
- Visual indicators for edge bundling (5+ edges)
- Self-loop edge support
- Dynamic spacing based on zoom level

## Manual Testing

To test the feature:
1. Start the editor: `npm run dev` (from docs-maps directory)
2. Create two nodes in the editor
3. Add multiple edges between them (different types: hierarchy, dependency, integration, etc.)
4. Observe automatic spacing - edges should be visually separated
5. Try different edge types and directions
6. Verify spacing in both editor (port 3000) and published viewer (port 3001)

### Expected Behavior
- Single edge: No offset, direct path
- Two edges: Offset ±10px from center
- Three edges: Offset -20px, 0px, +20px
- Four edges: Offset -30px, -10px, +10px, +30px
- Five+ edges: Up to 5 edges spaced, additional edges may overlap

## Backward Compatibility

✅ Fully backward compatible - existing maps will automatically benefit from edge spacing without any migration needed.

## Automated Testing

Unit tests can be added when a test framework (Jest/Vitest) is configured for the project. Test file template is available in project history.
