# Multiple Edge Auto-Spacing Feature

## Overview

DocMaps now supports automatic spacing for multiple edges between the same nodes. When you create multiple connections between two nodes (e.g., hierarchy + dependency + integration), the edges will automatically space themselves to avoid overlap and remain visually distinct.

## Current Status

**⚠️ DEBUGGING IN PROGRESS**

The feature has been implemented but edges are not spacing correctly in production. Comprehensive debug logging has been added to identify the root cause:

- `packages/graph/edge-spacing.ts` - All functions now log their inputs and outputs
- `apps/editor/components/canvas/edges/hierarchy-edge.tsx` - Logs edge rendering and offset calculations

**To debug:**
1. Build and deploy to production
2. Open browser console
3. Create multiple edges between the same two nodes
4. Check console logs for:
   - How many edges are in the store
   - How edges are being grouped
   - What offset is calculated for each edge
   - Whether coordinates are being adjusted

**Expected behavior:** Multiple edges between the same nodes should have non-zero offsets and adjusted coordinates.

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
- `packages/graph/edge-spacing-debug.ts` - Debug utilities (not currently used)

### Updated Files

**Editor App:**
- `apps/editor/components/canvas/edges/hierarchy-edge.tsx` (with debug logs)
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

## Known Issues

1. **Edges not spacing in production** - Debug logs added to identify why offset is always 0
2. **Possible causes:**
   - Edges array from store might be empty or stale
   - Grouping logic might not be matching edges correctly
   - Edge IDs might not be matching between store and render
   - React Flow store might not be properly shared between components

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

## Debugging in Production

**Console logs to look for:**
```
[EdgeSpacing] getEdgeOffset called for edge: <id> with <n> total edges
[EdgeSpacing] Found edge: { id, source, target, sourceHandle, targetHandle, type }
[EdgeSpacing] groupEdgesByConnection called with <n> edges
[EdgeSpacing] Processing edge: { id, source, target, sourceHandle, targetHandle, key }
[EdgeSpacing] Created <n> groups: [{ key, count }]
[EdgeSpacing] Group for key <source->target> has <n> edges
[EdgeSpacing] calculateEdgeOffset for <id> in group of <n>
[EdgeSpacing] Calculated offset: { index, effectiveCount, middleIndex, offset, baseSpacing }
[EdgeSpacing] Final offset for <id>: <offset>
[HierarchyEdge] Rendering edge: <id> with <n> total edges in store
[HierarchyEdge] Offset result for <id>: <offset>
[HierarchyEdge] Coordinates: { original, adjusted, offset }
```

**What to check:**
1. Are edges being found in the store? (total edges count should match)
2. Are edges being grouped correctly? (groups should show multiple edges)
3. Is offset being calculated? (should be non-zero for multiple edges)
4. Are coordinates being adjusted? (adjusted should differ from original when offset ≠ 0)

## Backward Compatibility

✅ Fully backward compatible - existing maps will automatically benefit from edge spacing without any migration needed.

## Automated Testing

Unit tests can be added when a test framework (Jest/Vitest) is configured for the project. Test file template is available in project history.
