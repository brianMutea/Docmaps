# Multiple Edge Auto-Spacing Feature

## Overview

DocMaps supports automatic spacing for multiple edges between the **same two nodes**. When you create multiple connections between the exact same source and target nodes (e.g., Node A → Node B with both hierarchy AND dependency edges), the edges will automatically space themselves perpendicular to the connection line to avoid overlap.

## Important: What This Feature Does and Doesn't Do

### ✅ What It Does
- Spaces multiple edges that connect the **exact same source and target nodes**
- Example: If you have 3 edges from "Node A" to "Node B", they will be spaced 20px apart perpendicular to the line

### ❌ What It Doesn't Do  
- Does NOT handle edges that visually cross or overlap but connect different nodes
- Does NOT implement edge bundling or routing for complex graphs
- Does NOT prevent edges from passing through other nodes

### Visual Example

**This WILL be spaced:**
```
Node A ----hierarchy----> Node B
      ----dependency---->
      ----integration--->
```
All three edges have the same source (Node A) and target (Node B).

**This will NOT be spaced:**
```
Node A -----> Node B
               /
Node C ------/
```
Even if the edges visually overlap, they connect different node pairs (A→B and C→B).

## Current Status

✅ **Feature is working correctly** for its intended purpose.

The debug logs confirmed that the edge spacing logic works as designed - it groups edges by their source→target pairs and applies offsets when multiple edges share the same pair. If you're seeing overlapping edges, it's because those edges connect different nodes, which is outside the scope of this feature.

## How It Works

### Technical Implementation

1. **Edge Grouping**: Edges are grouped by their `source→target` node pairs
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

1. **Visual Clarity**: Multiple relationships between the same two nodes are clearly visible
2. **Professional Appearance**: Matches industry-standard diagramming tools
3. **Automatic**: No manual adjustment needed by users
4. **Consistent**: Works across all edge types and in both editor and viewer
5. **Performant**: Efficient calculation using React Flow's built-in store

## Edge Cases Handled

- **Single edges**: No offset applied (offset = 0)
- **Bidirectional edges**: A→B and B→A are treated as separate groups
- **Zero-length edges**: Safely handled with length check
- **More than max edges**: Additional edges beyond limit will overlap

## Testing

To test the feature:
1. Create two nodes in the editor
2. Add multiple edges between the **same two nodes** with different types
3. Observe automatic spacing - edges should be visually separated

### Expected Behavior
- **Single edge** between two nodes: No offset, direct path
- **Two edges** between same nodes: Offset ±10px from center
- **Three edges** between same nodes: Offset -20px, 0px, +20px
- **Four edges** between same nodes: Offset -30px, -10px, +10px, +30px
- **Five+ edges** between same nodes: Up to 5 edges spaced, additional edges may overlap

### What Won't Be Spaced
- Edges connecting different node pairs (even if they visually overlap)
- Edges that cross each other in the middle of the canvas
- Edges that pass through other nodes

## Future Enhancements

For handling edges that visually overlap but connect different nodes, consider:
- **Edge bundling**: Group edges that follow similar paths
- **Edge routing**: Pathfinding algorithms to avoid node overlaps
- **Bezier curves**: Smoother curves that naturally avoid overlaps
- **Force-directed edge layout**: Automatic edge positioning based on graph structure

## Backward Compatibility

✅ Fully backward compatible - existing maps will automatically benefit from edge spacing when multiple edges connect the same two nodes.

## Automated Testing

Unit tests can be added when a test framework (Jest/Vitest) is configured for the project. Test file template is available in project history.
